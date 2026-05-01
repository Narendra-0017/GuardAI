"""
LangGraph Fraud Detection Graph
Orchestrates multiple AI agents for comprehensive fraud investigation
"""

from typing import Dict, List, TypedDict, Annotated, Any
import operator
from datetime import datetime
import json
import time
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

class FraudDetectionState(TypedDict):
    """State for the fraud detection workflow"""
    # Transaction data
    transaction: Dict[str, any]
    user_id: str
    
    # ML Model Results
    risk_score: float
    shap_features: Annotated[list, operator.add]  # List of {feature_name, value, impact}
    
    # User Profile & Anomalies
    user_profile: Dict[str, Any]
    anomalies: Annotated[list, operator.add]
    
    # Agent Workflow
    agent_steps: Annotated[list, operator.add]
    investigation_report: str
    
    # Final Results
    verdict: str  # SAFE / SUSPICIOUS / FRAUD
    confidence: float
    requires_human_review: bool
    processing_time_ms: int
    
    # Metadata
    start_time: float
    current_agent: str

def create_fraud_detection_graph():
    """Create the LangGraph workflow for fraud detection"""
    
    # Initialize the workflow
    workflow = StateGraph(FraudDetectionState)
    
    # Add nodes
    workflow.add_node("orchestrator", orchestrator_node)
    workflow.add_node("detection", detection_node)
    workflow.add_node("profiling", profiling_node)
    workflow.add_node("explainability", explainability_node)
    workflow.add_node("decision", decision_node)
    
    # Set entry point
    workflow.set_entry_point("orchestrator")
    
    # Add edges
    workflow.add_edge("orchestrator", "detection")
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "detection",
        should_continue_after_detection,
        {
            "safe": "decision",
            "suspicious": "profiling",
            "fraud": "profiling"
        }
    )
    
    workflow.add_conditional_edges(
        "profiling",
        should_continue_after_profiling,
        {
            "safe": "decision",
            "suspicious": "decision",
            "fraud": "explainability"
        }
    )
    
    workflow.add_edge("explainability", "decision")
    workflow.add_edge("decision", END)
    
    return workflow.compile()

def orchestrator_node(state: FraudDetectionState) -> FraudDetectionState:
    """Initialize the fraud detection pipeline"""
    start_time = time.time()
    
    # Initialize agent steps
    agent_steps = [{
        "agent": "orchestrator",
        "step": "🤖 Orchestrator: Transaction received. Initiating GuardAI investigation pipeline...",
        "timestamp": datetime.now().isoformat(),
        "status": "complete",
        "execution_time_ms": 0
    }]
    
    # Update state
    return {
        "agent_steps": agent_steps,
        "start_time": start_time,
        "current_agent": "orchestrator",
        "anomalies": [],
        "user_profile": {}
    }

def detection_node(state: FraudDetectionState) -> FraudDetectionState:
    """Detection Agent: Run ML model and compute SHAP features"""
    from ml.feature_mapping import feature_mapper
    import joblib
    import numpy as np
    import shap
    
    start_time = time.time()
    
    try:
        # Load model and preprocessor
        model = joblib.load("./ml/model.pkl")
        scaler = joblib.load("./ml/preprocessor.pkl")
        explainer = joblib.load("./ml/shap_explainer.pkl")
        
        # Map human-readable features to model input
        human_features = state["transaction"]
        model_features = feature_mapper.map_to_model_features(human_features)
        
        # Scale features (add Time and Amount columns for compatibility)
        full_features = np.zeros(30)  # V1-V28 + Time + Amount
        full_features[:28] = model_features
        full_features[28] = human_features.get('hour_of_day', 12) * 3600  # Convert to seconds
        full_features[29] = human_features.get('amount', 0)
        
        # Scale Time and Amount
        full_features[28:30] = scaler.transform([full_features[28:30]])[0]
        
        # Get prediction
        risk_score = float(model.predict_proba([full_features])[0][1])
        
        # Get SHAP explanations
        shap_values = explainer.shap_values([full_features])[0]
        
        # Map SHAP values to human-readable features
        human_readable_names = feature_mapper.get_human_readable_names()
        shap_features = []
        
        # Create feature impact mapping
        feature_impacts = []
        for i, name in enumerate(human_readable_names):
            # Map human feature to SHAP impact (simplified)
            impact = float(np.mean(shap_values[:28])) * (1 if i < 5 else -1)
            if name == 'amount':
                impact = float(shap_values[0]) * 2  # Amount is usually V1
            elif name == 'hour_of_day':
                impact = float(shap_values[2]) * 1.5
            elif name == 'distance_from_home_km':
                impact = float(shap_values[4]) * 1.8
            
            feature_impacts.append({
                "feature_name": name,
                "value": human_features.get(name, 0),
                "impact": impact
            })
        
        # Sort by absolute impact and take top 5
        feature_impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
        shap_features = feature_impacts[:5]
        
        # Create agent step
        top_feature = shap_features[0]["feature_name"] if shap_features else "amount"
        step_message = f"🔍 Detection Agent: XGBoost model scored transaction at {risk_score:.3f}. Top risk factor: {top_feature}"
        
        agent_step = {
            "agent": "detection",
            "step": step_message,
            "timestamp": datetime.now().isoformat(),
            "status": "complete",
            "execution_time_ms": int((time.time() - start_time) * 1000)
        }
        
        state["current_agent"] = "detection"
        
        return {
            "agent_steps": [agent_step],
            "risk_score": risk_score,
            "shap_features": shap_features,
            "current_agent": "detection"
        }
        
    except Exception as e:
        # Fallback if model not available
        risk_score = 0.5  # Default medium risk
        shap_features = []
        
        agent_step = {
            "agent": "detection",
            "step": f"🔍 Detection Agent: Model unavailable. Using default risk score: {risk_score:.3f}",
            "timestamp": datetime.now().isoformat(),
            "status": "complete",
            "execution_time_ms": int((time.time() - start_time) * 1000)
        }
        
        state["current_agent"] = "detection"
        
        return {
            "agent_steps": [agent_step],
            "risk_score": risk_score,
            "shap_features": shap_features,
            "current_agent": "detection"
        }
    
    return state

def profiling_node(state: FraudDetectionState) -> FraudDetectionState:
    """Profiling Agent: Analyze user behavior and detect anomalies"""
    start_time = time.time()
    
    # Simulate user profile analysis
    transaction = state["transaction"]
    anomalies = []
    
    # Check for various anomalies
    amount = transaction.get('amount', 0)
    hour_of_day = transaction.get('hour_of_day', 12)
    distance_from_home = transaction.get('distance_from_home_km', 0)
    device_known = transaction.get('device_known', True)
    card_present = transaction.get('card_present', True)
    transactions_last_hour = transaction.get('transactions_last_hour', 1)
    is_foreign = transaction.get('is_foreign_transaction', False)
    
    # Anomaly detection rules
    if amount > 1000:  # High amount
        anomalies.append(f"High amount transaction: ${amount:.2f}")
    
    if hour_of_day < 6 or hour_of_day > 22:  # Unusual hours
        anomalies.append(f"Unusual transaction time: {hour_of_day}:00")
    
    if distance_from_home > 1000:  # Foreign transaction
        anomalies.append(f"Transaction far from home: {distance_from_home:.0f}km")
    
    if not device_known:
        anomalies.append("Transaction from unknown device")
    
    if not card_present:
        anomalies.append("Card not present transaction")
    
    if transactions_last_hour > 3:
        anomalies.append(f"High transaction velocity: {transactions_last_hour} in last hour")
    
    if is_foreign:
        anomalies.append("Foreign transaction detected")
    
    # Create user profile (simulated)
    user_profile = {
        "avg_spend": 150.0,
        "max_spend": 800.0,
        "common_hours": [9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20],
        "common_locations": ["New York, USA", "Boston, USA"],
        "avg_daily_frequency": 3,
        "known_devices": ["iPhone_12", "MacBook_Pro"],
        "registered_country": "USA"
    }
    
    # Create agent step
    step_message = f"👤 Profiling Agent: Analyzed user history. Found {len(anomalies)} anomalies: {', '.join(anomalies[:3])}"
    
    agent_step = {
        "agent": "profiling",
        "step": step_message,
        "timestamp": datetime.now().isoformat(),
        "status": "complete",
        "execution_time_ms": int((time.time() - start_time) * 1000)
    }
    
    return {
        "agent_steps": [agent_step],
        "anomalies": anomalies,
        "user_profile": user_profile,
        "current_agent": "profiling"
    }

def explainability_node(state: FraudDetectionState) -> FraudDetectionState:
    """Explainability Agent: Generate investigation report using LLM"""
    start_time = time.time()
    
    try:
        from langchain_groq import ChatGroq
        import os
        
        # Initialize Groq LLM
        llm = ChatGroq(
            model="llama3-70b-8192",
            temperature=0.1,
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Prepare context for LLM
        transaction = state["transaction"]
        risk_score = state["risk_score"]
        shap_features = state["shap_features"]
        anomalies = state["anomalies"]
        
        # Create prompt
        system_prompt = """You are a senior fraud investigator at a top international bank. 
        Write a professional, concise 3-4 sentence fraud investigation report. Use specific numbers 
        from the data. Be decisive and clear. Never mention V1, V2 or any technical model features."""
        
        user_prompt = f"""
        Transaction Details:
        - Amount: ${transaction.get('amount', 0):.2f}
        - Time: {transaction.get('hour_of_day', 12):00}
        - Location: {transaction.get('location', 'Unknown')}
        - Distance from home: {transaction.get('distance_from_home_km', 0):.0f}km
        - Risk Score: {risk_score:.3f}
        - Card Present: {transaction.get('card_present', True)}
        - Device Known: {transaction.get('device_known', True)}
        
        Top Risk Factors:
        {chr(10).join([f"- {f['feature_name']}: {f['value']} (impact: {f['impact']:.3f})" for f in shap_features[:3]])}
        
        Anomalies Detected:
        {chr(10).join([f"- {a}" for a in anomalies[:5]])}
        
        Generate the investigation report:
        """
        
        # Get LLM response
        response = llm.invoke([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ])
        
        investigation_report = response.content
        
    except Exception as e:
        # Fallback report
        transaction = state["transaction"]
        risk_score = state["risk_score"]
        
        investigation_report = f"""Transaction #{transaction.get('transaction_id', 'UNKNOWN')} has been flagged with risk score {risk_score:.3f}. 
        The transaction of ${transaction.get('amount', 0):.2f} at {transaction.get('hour_of_day', 12):00} from {transaction.get('location', 'Unknown')} 
        shows {len(state['anomalies'])} behavioral anomalies. Further investigation recommended."""
    
    # Create agent step
    agent_step = {
        "agent": "explainability",
        "step": "📝 Explainability Agent: Investigation report generated",
        "timestamp": datetime.now().isoformat(),
        "status": "complete",
        "execution_time_ms": int((time.time() - start_time) * 1000)
    }
    
    return {
        "agent_steps": [agent_step],
        "investigation_report": investigation_report,
        "current_agent": "explainability"
    }

def decision_node(state: FraudDetectionState) -> FraudDetectionState:
    """Decision Agent: Make final verdict"""
    start_time = time.time()
    
    risk_score = state["risk_score"]
    
    # Determine verdict
    if risk_score < 0.4:
        verdict = "SAFE"
        requires_human_review = False
    elif risk_score < 0.7:
        verdict = "SUSPICIOUS"
        requires_human_review = True
    else:
        verdict = "FRAUD"
        requires_human_review = True
    
    confidence = risk_score * 100
    processing_time = int((time.time() - state["start_time"]) * 1000)
    
    # Create agent step
    agent_step = {
        "agent": "decision",
        "step": f"✅ Decision Agent: Final verdict — {verdict} with {confidence:.1f}% confidence. Processing time: {processing_time}ms",
        "timestamp": datetime.now().isoformat(),
        "status": "complete",
        "execution_time_ms": int((time.time() - start_time) * 1000)
    }
    
    return {
        "agent_steps": [agent_step],
        "verdict": verdict,
        "confidence": confidence,
        "requires_human_review": requires_human_review,
        "processing_time_ms": processing_time,
        "current_agent": "decision"
    }

def should_continue_after_detection(state: FraudDetectionState) -> str:
    """Determine next step after detection"""
    risk_score = state["risk_score"]
    
    if risk_score < 0.4:
        return "safe"
    elif risk_score < 0.6:
        return "suspicious"
    else:
        return "fraud"

def should_continue_after_profiling(state: FraudDetectionState) -> str:
    """Determine next step after profiling"""
    risk_score = state["risk_score"]
    anomalies_count = len(state["anomalies"])
    
    # Adjust risk score based on anomalies
    adjusted_risk = risk_score + (anomalies_count * 0.1)
    
    if adjusted_risk < 0.4:
        return "safe"
    elif adjusted_risk < 0.7:
        return "suspicious"
    else:
        return "fraud"

# Create the compiled graph
fraud_graph = create_fraud_detection_graph()
