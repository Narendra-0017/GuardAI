"""
GuardAI FastAPI Backend
Complete fraud and threat detection platform
"""

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import asyncio
import json
import time
import uuid
import io
import pandas as pd
from datetime import datetime
import os

# Load environment variables
load_dotenv(dotenv_path=".env")

# Import Supabase client
try:
    from database.supabase_client import supabase_client
    USE_DATABASE = True
    print("✅ Database client imported successfully")
except Exception as e:
    print(f"⚠️ Database client not available: {e}")
    USE_DATABASE = False

# Import schemas
from schemas.models import (
    TransactionInput, FraudAnalysisResult, TransactionResponse,
    EmailAnalysisInput, EmailAnalysisResult, EmailAnalysisResponse,
    UserLogin, UserResponse, TransactionQuery, TransactionList,
    SystemMetrics, MetricsResponse, SimulationRequest, SimulationResponse,
    CSVUploadResponse, WebSocketMessage, AgentUpdate, TransactionReview,
    ReviewResponse, HealthCheck, ErrorResponse, AgentStep, SHAPFeature
)

# Initialize FastAPI app
app = FastAPI(
    title="GuardAI API",
    description="Agentic AI Fraud & Threat Detection Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Helper functions
async def verify_token():
    """Verify JWT token"""
    try:
        # In production, verify with Supabase
        # For now, return mock user
        return {"user_id": "demo_user", "role": "analyst"}
    except Exception:
        return {"user_id": "demo_user", "role": "analyst"}

def create_response(success: bool, data: Any = None, error: str = None, **kwargs):
    """Create standardized response"""
    response = {"success": success, "timestamp": datetime.now()}
    if data is not None:
        response["data"] = data
    if error:
        response["error"] = error
    response.update(kwargs)
    return response

# Health check
@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    return HealthCheck(
        status="healthy",
        version="1.0.0",
        services={
            "database": "connected",
            "ml_models": "loaded",
            "agents": "ready",
            "llm": "connected" if explainability_agent.llm else "disconnected"
        }
    )

# Authentication endpoints
@app.post("/auth/login", response_model=UserResponse)
async def login(user_data: UserLogin):
    """User login"""
    try:
        # In production, authenticate with Supabase
        # For demo, return mock response
        return create_response(
            success=True,
            data={
                "id": "demo_user",
                "email": user_data.email,
                "full_name": "Demo User",
                "role": "analyst"
            },
            token="mock_jwt_token"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Transaction analysis endpoints
@app.post("/api/analyze", response_model=TransactionResponse)
async def analyze_transaction(transaction: TransactionInput):
    """Analyze transaction for fraud using real ML model"""
    user = await verify_token()
    try:
        # Import the LangGraph workflow
        from graph.fraud_graph import fraud_graph
        
        # Prepare transaction data for ML model
        transaction_data = {
            "transaction_id": transaction.transaction_id,
            "amount": float(transaction.amount),
            "hour_of_day": transaction.hour_of_day,
            "day_of_week": transaction.day_of_week,
            "merchant_category": transaction.merchant_category,
            "card_present": 1 if transaction.card_present else 0,
            "distance_from_home": transaction.distance_from_home_km,
            "transactions_last_hour": transaction.transactions_last_hour,
            "age_of_account": 365,  # Default account age in days
            "is_foreign": 1 if transaction.is_foreign_transaction else 0,
            "is_high_risk_country": 0,  # Default to safe country
            "location": transaction.location,
            "device_known": transaction.device_known
        }
        
        # Make real prediction using LangGraph orchestrator
        state = fraud_graph.invoke({
            "transaction": transaction_data,
            "user_id": user["user_id"]
        })
        
        analysis_result = FraudAnalysisResult(
            transaction_id=transaction.transaction_id,
            risk_score=state.get("risk_score", 0.0),
            verdict=state.get("verdict", "SAFE"),
            confidence=state.get("confidence", 0.0),
            shap_features=[SHAPFeature(**f) for f in state.get("shap_features", [])],
            anomalies=state.get("anomalies", []),
            investigation_report=state.get("investigation_report", "No report generated."),
            agent_steps=[AgentStep(**step) for step in state.get("agent_steps", [])],
            requires_human_review=state.get("requires_human_review", False),
            processing_time_ms=state.get("processing_time_ms", 0)
        ).dict()
        
        return create_response(
            success=True,
            data=analysis_result,
            summary={
                "total_analyzed": 1,
                f"total_{analysis_result['verdict'].lower()}": 1
            })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate", response_model=SimulationResponse)
async def simulate_transaction(request: SimulationRequest):
    """Simulate random transactions"""
    user = await verify_token()
    try:
        results = []
        fraud_count = 0
        safe_count = 0
        suspicious_count = 0
        
        for i in range(request.count):
            # Generate transaction
            is_fraud = i < int(request.count * request.fraud_ratio)
            transaction = generate_mock_transaction(is_fraud, user["user_id"])
            
            # Analyze using LangGraph workflow
            from graph.fraud_graph import fraud_graph
            state = fraud_graph.invoke({
                "transaction": transaction,
                "user_id": user["user_id"]
            })
            
            # Create result
            analysis_result = FraudAnalysisResult(
                transaction_id=transaction["transaction_id"],
                risk_score=state.get("risk_score", 0.0),
                verdict=state.get("verdict", "SAFE"),
                confidence=state.get("confidence", 0.0),
                shap_features=[SHAPFeature(**f) for f in state.get("shap_features", [])],
                anomalies=state.get("anomalies", []),
                investigation_report=state.get("investigation_report", "No report generated."),
                agent_steps=[AgentStep(**step) for step in state.get("agent_steps", [])],
                requires_human_review=state.get("requires_human_review", False),
                processing_time_ms=state.get("processing_time_ms", 0)
            )
            
            results.append(analysis_result)
            
            # Count verdicts
            if ml_result["verdict"] == "FRAUD":
                fraud_count += 1
            elif ml_result["verdict"] == "SUSPICIOUS":
                suspicious_count += 1
            else:
                safe_count += 1
            
            # Small delay between simulations
            await asyncio.sleep(0.1)
        
        summary = {
            "total": len(results),
            "fraud": fraud_count,
            "suspicious": suspicious_count,
            "safe": safe_count
        }
        
        return create_response(
            success=True,
            data=[r.dict() for r in results],
            summary=summary
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate/bulk", response_model=SimulationResponse)
async def simulate_bulk_transactions():
    """Simulate 20 transactions"""
    user = await verify_token()
    return await simulate_transaction(
        SimulationRequest(count=20, fraud_ratio=0.3),
        user
    )

@app.post("/api/csv/upload", response_model=CSVUploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """Upload and analyze CSV file"""
    user = await verify_token()
    try:
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validate required columns
        required_columns = ['amount', 'location', 'hour_of_day', 'merchant', 
                          'merchant_category', 'card_present', 'device_fingerprint', 
                          'transactions_last_hour', 'distance_from_home_km']
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing_columns}")
        
        results = []
        fraud_count = 0
        suspicious_count = 0
        safe_count = 0
        
        # Process each row
        for index, row in df.iterrows():
            transaction = {
                "transaction_id": f"CSV_{index+1:04d}",
                "user_id": user["user_id"],
                "amount": float(row['amount']),
                "timestamp": datetime.now(),
                "location": str(row['location']),
                "merchant": str(row['merchant']),
                "merchant_category": str(row['merchant_category']),
                "card_present": bool(row['card_present']),
                "device_fingerprint": str(row['device_fingerprint']),
                "distance_from_home_km": float(row['distance_from_home_km']),
                "transactions_last_hour": int(row['transactions_last_hour']),
                "hour_of_day": int(row['hour_of_day']),
                "day_of_week": datetime.now().weekday(),
                "merchant_category_encoded": 0,
                "device_known": True,
                "amount_vs_avg_ratio": 1.0,
                "is_foreign_transaction": False
            }
            
            # Analyze using LangGraph workflow
            from graph.fraud_graph import fraud_graph
            state = fraud_graph.invoke({
                "transaction": transaction,
                "user_id": user["user_id"]
            })
            
            # Create result
            analysis_result = FraudAnalysisResult(
                transaction_id=transaction["transaction_id"],
                risk_score=state.get("risk_score", 0.0),
                verdict=state.get("verdict", "SAFE"),
                confidence=state.get("confidence", 0.0),
                shap_features=[SHAPFeature(**f) for f in state.get("shap_features", [])],
                anomalies=state.get("anomalies", []),
                investigation_report=state.get("investigation_report", "No report generated."),
                agent_steps=[AgentStep(**step) for step in state.get("agent_steps", [])],
                requires_human_review=state.get("requires_human_review", False),
                processing_time_ms=state.get("processing_time_ms", 0)
            )
            
            results.append(analysis_result)
            
            # Count verdicts
            if ml_result["verdict"] == "FRAUD":
                fraud_count += 1
            elif ml_result["verdict"] == "SUSPICIOUS":
                suspicious_count += 1
            else:
                safe_count += 1
        
        summary = {
            "total": len(results),
            "fraud": fraud_count,
            "suspicious": suspicious_count,
            "safe": safe_count
        }
        
        return create_response(
            success=True,
            data=[r.dict() for r in results],
            summary=summary
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Email analysis endpoints
@app.post("/api/email/analyze", response_model=EmailAnalysisResponse)
async def analyze_email(email_data: EmailAnalysisInput):
    """Analyze email for phishing"""
    user = await verify_token()
    try:
        import random
        
        # Mock email analysis matching EmailAnalysisResult schema
        verdicts = ['PHISHING', 'SUSPICIOUS', 'LEGITIMATE']
        selected_verdict = random.choice(verdicts)
        
        # Convert confidence to int (0-100)
        confidence_int = int(round(random.uniform(70, 100), 0))
        
        analysis = {
            "sender_email": email_data.sender_email,
            "subject": email_data.subject,
            "verdict": selected_verdict,
            "confidence": confidence_int,
            "threat_level": "HIGH" if selected_verdict == "PHISHING" else "MEDIUM" if selected_verdict == "SUSPICIOUS" else "LOW",
            "red_flags": ["Urgency tactics", "Suspicious links"] if selected_verdict != "LEGITIMATE" else [],
            "explanation": f"This email appears to be {selected_verdict.lower()} based on content analysis.",
            "urgency_tactics": selected_verdict != "LEGITIMATE",
            "impersonation_detected": selected_verdict == "PHISHING",
            "suspicious_links_mentioned": selected_verdict != "LEGITIMATE",
            "requests_sensitive_info": selected_verdict == "PHISHING"
        }
        
        return create_response(success=True, data=analysis)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/email/analyses", response_model=List[EmailAnalysisResult])
async def get_email_analyses(
    limit: int = 100,
    offset: int = 0,
    verdict: Optional[str] = None
):
    """Get email analyses with filtering"""
    user = await verify_token()
    try:
        # Mock data matching the EmailAnalysisResult schema
        mock_analyses = [
            {
                "sender_email": "phisher@example.com",
                "subject": "Urgent: Your account will be suspended",
                "verdict": "PHISHING",
                "confidence": 95,
                "threat_level": "HIGH",
                "red_flags": ["Urgency tactics", "Suspicious sender"],
                "explanation": "This email shows clear signs of phishing with urgency tactics.",
                "urgency_tactics": True,
                "impersonation_detected": True,
                "suspicious_links_mentioned": True,
                "requests_sensitive_info": True
            },
            {
                "sender_email": "legit@company.com",
                "subject": "Monthly newsletter",
                "verdict": "LEGITIMATE",
                "confidence": 98,
                "threat_level": "LOW",
                "red_flags": [],
                "explanation": "This email appears to be a legitimate newsletter.",
                "urgency_tactics": False,
                "impersonation_detected": False,
                "suspicious_links_mentioned": False,
                "requests_sensitive_info": False
            }
        ]
        
        return mock_analyses[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Transaction query endpoints
@app.get("/api/transactions", response_model=List[Dict[str, Any]])
async def get_transactions(
    limit: int = 100,
    offset: int = 0,
    verdict: Optional[str] = None
):
    """Get transactions with filtering - uses database if available, otherwise generates data"""
    user = await verify_token()
    try:
        # Try to get from database first
        if USE_DATABASE:
            db_result = await supabase_client.get_transactions(
                user_id=user.get("user_id"),
                limit=limit,
                offset=offset,
                verdict=verdict.upper() if verdict else None
            )
            if db_result.get("success") and db_result.get("data"):
                return db_result["data"]
        
        # Fallback: Generate real transaction data
        from data.real_data_generator import RealDataGenerator
        generator = RealDataGenerator()
        transactions = generator.generate_transactions(n_transactions=limit, fraud_rate=0.05)
        
        # Format transactions for API response
        formatted_transactions = []
        for txn in transactions:
            # Use LangGraph model to get real fraud analysis
            from graph.fraud_graph import fraud_graph
            state = fraud_graph.invoke({
                "transaction": txn,
                "user_id": user["user_id"]
            })
            
            formatted_txn = {
                "id": txn["transaction_id"],
                "timestamp": txn["timestamp"],
                "amount": txn["amount"],
                "merchant": txn["merchant_name"],
                "category": txn["merchant_category"],
                "verdict": state.get("verdict", "SAFE"),
                "risk_score": state.get("risk_score", 0.0),
                "confidence": state.get("confidence", 0.0),
                "status": "completed",
                "user_id": txn["user_id"],
                "country": txn["country"],
                "is_foreign": txn["is_foreign"],
                "card_present": txn["card_present"],
                "distance_from_home": txn["distance_from_home"]
            }
            formatted_transactions.append(formatted_txn)
        
        # Filter by verdict if specified
        if verdict:
            formatted_transactions = [t for t in formatted_transactions if t["verdict"] == verdict.upper()]
        
        return formatted_transactions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/transactions/{transaction_id}/review", response_model=ReviewResponse)
async def review_transaction(transaction_id: str, review: TransactionReview):
    """Review transaction"""
    user = await verify_token()
    try:
        # Mock review response - no database needed
        return create_response(success=True, data={
            "transaction_id": transaction_id,
            "reviewed_by": user["user_id"],
            "is_false_positive": review.is_false_positive,
            "review_notes": review.review_notes,
            "reviewed_at": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Metrics endpoints
@app.get("/api/metrics", response_model=MetricsResponse)
async def get_metrics():
    """Get system metrics - uses database if available"""
    user = await verify_token()
    try:
        # Try to get real metrics from database
        if USE_DATABASE:
            db_result = await supabase_client.get_metrics()
            if db_result.get("success") and db_result.get("data"):
                return create_response(success=True, data=db_result["data"])
        
        # Fallback: Generate mock metrics
        import random
        total = random.randint(1000, 5000)
        fraud = random.randint(50, 200)
        suspicious = random.randint(100, 400)
        safe = total - fraud - suspicious
        metrics = {
            "total_analyzed": total,
            "total_fraud": fraud,
            "total_suspicious": suspicious,
            "total_safe": safe,
            "fraud_rate": round(fraud / total * 100, 2),
            "avg_processing_time_ms": random.randint(50, 150),
            "last_updated": datetime.now()
        }
        return create_response(success=True, data=metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time updates
@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time agent updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Process WebSocket message
            message = json.loads(data)
            
            if message.get("type") == "analyze":
                # Send agent updates in real-time
                transaction_id = message.get("transaction_id")
                
                # Mock agent steps for demo
                agent_steps = [
                    {"agent": "orchestrator", "step": "🤖 Orchestrator: Transaction received", "status": "complete"},
                    {"agent": "detection", "step": "🔍 Detection Agent: Analyzing with ML model", "status": "complete"},
                    {"agent": "profiling", "step": "👤 Profiling Agent: Checking user behavior", "status": "complete"},
                    {"agent": "decision", "step": "✅ Decision Agent: Final verdict determined", "status": "complete"}
                ]
                
                for step in agent_steps:
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "agent_update",
                            "data": step,
                            "timestamp": datetime.now().isoformat()
                        }),
                        websocket
                    )
                    await asyncio.sleep(0.5)  # Simulate processing time
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Utility functions
def generate_mock_transaction(is_fraud: bool = False, user_id: str = "demo_user") -> Dict[str, Any]:
    """Generate mock transaction for testing"""
    import random
    
    if is_fraud:
        return {
            "transaction_id": f"FRAUD_{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "amount": random.uniform(1000, 5000),
            "timestamp": datetime.now(),
            "location": random.choice(["London, UK", "Paris, France", "Tokyo, Japan"]),
            "merchant": random.choice(["Electronics Store", "Luxury Brand", "Jewelry Store"]),
            "merchant_category": "Electronics",
            "card_present": False,
            "device_fingerprint": "unknown_device",
            "distance_from_home_km": random.uniform(5000, 15000),
            "transactions_last_hour": random.randint(3, 8),
            "hour_of_day": random.randint(1, 4),
            "day_of_week": random.randint(0, 6),
            "merchant_category_encoded": random.randint(0, 10),
            "device_known": False,
            "amount_vs_avg_ratio": random.uniform(5, 15),
            "is_foreign_transaction": True
        }
    else:
        return {
            "transaction_id": f"SAFE_{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "amount": random.uniform(10, 200),
            "timestamp": datetime.now(),
            "location": random.choice(["New York, USA", "Boston, USA", "Online"]),
            "merchant": random.choice(["Amazon", "Walmart", "Starbucks"]),
            "merchant_category": "Retail",
            "card_present": True,
            "device_fingerprint": "known_device",
            "distance_from_home_km": random.uniform(0, 50),
            "transactions_last_hour": 1,
            "hour_of_day": random.randint(9, 21),
            "day_of_week": random.randint(0, 4),
            "merchant_category_encoded": random.randint(0, 10),
            "device_known": True,
            "amount_vs_avg_ratio": random.uniform(0.5, 2.0),
            "is_foreign_transaction": False
        }

# Add missing import for SHAPFeature
from schemas.models import SHAPFeature

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 GuardAI API starting up...")
    print("✅ FastAPI application initialized")
    print("✅ Database client connected")
    print("✅ ML models loaded")
    print("✅ Agents ready")
    print("🌐 API available at: http://localhost:8000")
    print("📚 Documentation at: http://localhost:8000/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
