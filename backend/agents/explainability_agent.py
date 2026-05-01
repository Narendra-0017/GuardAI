"""
Explainability Agent - Generates investigation reports using LLM
"""

from typing import Dict, Any, List
from datetime import datetime
import time
import os

class ExplainabilityAgent:
    """Explainability Agent - LLM-powered investigation report generation"""
    
    def __init__(self):
        self.name = "explainability"
        self.description = "Generates professional fraud investigation reports using LLM"
        self.llm = None
        self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize the Groq LLM"""
        try:
            from langchain_groq import ChatGroq
            
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                print("⚠️ Explainability Agent: GROQ_API_KEY not found")
                return
            
            self.llm = ChatGroq(
                model="llama3-70b-8192",
                temperature=0.1,
                api_key=api_key
            )
            
            print("✅ Explainability Agent: Groq LLM initialized successfully")
            
        except Exception as e:
            print(f"⚠️ Explainability Agent: Failed to initialize LLM - {str(e)}")
            self.llm = None
    
    def generate_investigation_report(self, transaction: Dict[str, Any], risk_score: float,
                                    shap_features: List[Dict[str, Any]], anomalies: List[str],
                                    user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate investigation report using LLM
        
        Args:
            transaction: Transaction data
            risk_score: Risk score from detection agent
            shap_features: SHAP feature importance
            anomalies: Detected anomalies
            user_profile: User profile data
            
        Returns:
            Investigation report and metadata
        """
        start_time = time.time()
        
        try:
            if self.llm is None:
                return self._generate_fallback_report(transaction, risk_score, anomalies)
            
            # Prepare context for LLM
            context = self._prepare_llm_context(transaction, risk_score, shap_features, anomalies, user_profile)
            
            # Generate report
            report = self._call_llm(context)
            
            # Create agent step
            agent_step = {
                "agent": self.name,
                "step": "📝 Explainability Agent: Investigation report generated",
                "timestamp": datetime.now().isoformat(),
                "status": "complete",
                "execution_time_ms": int((time.time() - start_time) * 1000),
                "details": {
                    "report_length": len(report),
                    "risk_score": risk_score,
                    "anomalies_count": len(anomalies),
                    "llm_model": "llama3-70b-8192"
                }
            }
            
            return {
                "investigation_report": report,
                "agent_step": agent_step,
                "success": True
            }
            
        except Exception as e:
            return self._generate_fallback_report(transaction, risk_score, anomalies, str(e))
    
    def _prepare_llm_context(self, transaction: Dict[str, Any], risk_score: float,
                            shap_features: List[Dict[str, Any]], anomalies: List[str],
                            user_profile: Dict[str, Any]) -> str:
        """
        Prepare context for LLM prompt
        
        Args:
            transaction: Transaction data
            risk_score: Risk score
            shap_features: SHAP features
            anomalies: Anomalies list
            user_profile: User profile
            
        Returns:
            Formatted context string
        """
        # Transaction details
        transaction_details = f"""
Transaction Details:
- Transaction ID: {transaction.get('transaction_id', 'UNKNOWN')}
- Amount: ${transaction.get('amount', 0):.2f}
- Time: {transaction.get('hour_of_day', 12):00}
- Location: {transaction.get('location', 'Unknown')}
- Merchant: {transaction.get('merchant', 'Unknown')}
- Merchant Category: {transaction.get('merchant_category', 'Unknown')}
- Distance from Home: {transaction.get('distance_from_home_km', 0):.0f}km
- Card Present: {transaction.get('card_present', True)}
- Device Known: {transaction.get('device_known', True)}
- Transactions in Last Hour: {transaction.get('transactions_last_hour', 1)}
- Foreign Transaction: {transaction.get('is_foreign_transaction', False)}
        """.strip()
        
        # Risk assessment
        risk_assessment = f"""
Risk Assessment:
- Risk Score: {risk_score:.3f} ({risk_score*100:.1f}%)
- Risk Level: {'HIGH' if risk_score > 0.7 else 'MEDIUM' if risk_score > 0.4 else 'LOW'}
        """.strip()
        
        # Top risk factors
        if shap_features:
            risk_factors = "\nTop Risk Factors:\n"
            for i, feature in enumerate(shap_features[:5], 1):
                impact_direction = "increases" if feature['impact'] > 0 else "decreases"
                risk_factors += f"{i}. {feature['feature_name']}: {feature['value']} ({impact_direction} risk)\n"
        else:
            risk_factors = "\nTop Risk Factors: Not available\n"
        
        # Anomalies detected
        if anomalies:
            anomalies_section = "\nAnomalies Detected:\n"
            for i, anomaly in enumerate(anomalies[:8], 1):  # Limit to top 8
                anomalies_section += f"{i}. {anomaly}\n"
        else:
            anomalies_section = "\nAnomalies Detected: None\n"
        
        # User profile summary
        profile_summary = f"""
User Profile Summary:
- Average Spend: ${user_profile.get('avg_spend', 0):.2f}
- Common Locations: {', '.join(user_profile.get('common_locations', ['Unknown'])[:3])}
- Known Devices: {len(user_profile.get('known_devices', []))}
- Account Age: {user_profile.get('account_created', 'Unknown')}
        """.strip()
        
        return f"""
{transaction_details}

{risk_assessment}

{risk_factors}

{anomalies_section}

{profile_summary}
        """.strip()
    
    def _call_llm(self, context: str) -> str:
        """
        Call LLM to generate investigation report
        
        Args:
            context: Prepared context
            
        Returns:
            Generated report
        """
        system_prompt = """You are a senior fraud investigator at a top international bank. 
Write a professional, concise 3-4 sentence fraud investigation report. Use specific numbers 
from the data. Be decisive and clear. Never mention V1, V2 or any technical model features.
Focus on actionable insights and clear risk assessment."""
        
        user_prompt = f"""Based on the following transaction analysis, generate a fraud investigation report:

{context}

Investigation Report:"""
        
        response = self.llm.invoke([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ])
        
        return response.content.strip()
    
    def _generate_fallback_report(self, transaction: Dict[str, Any], risk_score: float,
                                anomalies: List[str], error: str = "") -> str:
        """
        Generate fallback investigation report when LLM is unavailable
        
        Args:
            transaction: Transaction data
            risk_score: Risk score
            anomalies: Anomalies list
            error: Error message
            
        Returns:
            Generated report
        """
        transaction_id = transaction.get('transaction_id', 'UNKNOWN')
        amount = transaction.get('amount', 0)
        location = transaction.get('location', 'Unknown')
        hour = transaction.get('hour_of_day', 12)
        
        # Determine risk level
        if risk_score > 0.7:
            risk_level = "HIGH"
            action = "Immediate investigation and potential card block recommended"
        elif risk_score > 0.4:
            risk_level = "MEDIUM"
            action = "Enhanced monitoring and customer verification recommended"
        else:
            risk_level = "LOW"
            action = "Standard monitoring sufficient"
        
        # Build report
        report = f"""Transaction #{transaction_id} has been assessed with {risk_level} risk ({risk_score*100:.1f}% confidence). 
The transaction of ${amount:.2f} at {hour}:00 from {location} shows {len(anomalies)} behavioral anomalies. 
{action}. {'LLM unavailable - using template analysis.' if error else ''}"""
        
        # Add specific anomaly details if available
        if anomalies:
            top_anomalies = ', '.join(anomalies[:3])
            report += f" Key concerns: {top_anomalies}."
        
        return report.strip()
    
    def generate_threat_summary(self, investigation_report: str, risk_score: float,
                              anomalies: List[str]) -> Dict[str, Any]:
        """
        Generate a concise threat summary for dashboard display
        
        Args:
            investigation_report: Full investigation report
            risk_score: Risk score
            anomalies: Anomalies list
            
        Returns:
            Threat summary dictionary
        """
        # Extract key insights from report
        sentences = investigation_report.split('. ')
        key_insight = sentences[0] if sentences else investigation_report[:100]
        
        # Determine threat level
        if risk_score > 0.7:
            threat_level = "CRITICAL"
            threat_color = "red"
        elif risk_score > 0.4:
            threat_level = "MEDIUM"
            threat_color = "amber"
        else:
            threat_level = "LOW"
            threat_color = "green"
        
        # Categorize anomalies
        anomaly_categories = self._categorize_anomalies(anomalies)
        
        return {
            "threat_level": threat_level,
            "threat_color": threat_color,
            "risk_score": risk_score,
            "key_insight": key_insight,
            "anomaly_count": len(anomalies),
            "anomaly_categories": anomaly_categories,
            "requires_immediate_action": risk_score > 0.7
        }
    
    def _categorize_anomalies(self, anomalies: List[str]) -> Dict[str, int]:
        """
        Categorize anomalies by type
        
        Args:
            anomalies: List of anomaly strings
            
        Returns:
            Dictionary with anomaly counts by category
        """
        categories = {
            "amount": 0,
            "location": 0,
            "time": 0,
            "device": 0,
            "velocity": 0,
            "other": 0
        }
        
        for anomaly in anomalies:
            anomaly_lower = anomaly.lower()
            if any(keyword in anomaly_lower for keyword in ['amount', 'spend', 'high']):
                categories["amount"] += 1
            elif any(keyword in anomaly_lower for keyword in ['location', 'distance', 'foreign']):
                categories["location"] += 1
            elif any(keyword in anomaly_lower for keyword in ['time', 'hour', 'night']):
                categories["time"] += 1
            elif any(keyword in anomaly_lower for keyword in ['device', 'card']):
                categories["device"] += 1
            elif any(keyword in anomaly_lower for keyword in ['velocity', 'frequency', 'multiple']):
                categories["velocity"] += 1
            else:
                categories["other"] += 1
        
        return categories
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get agent status and capabilities"""
        return {
            "agent_name": self.name,
            "description": self.description,
            "llm_available": self.llm is not None,
            "llm_model": "llama3-70b-8192" if self.llm else None,
            "capabilities": [
                "Investigation report generation",
                "Threat level assessment",
                "Anomaly categorization",
                "Risk summarization"
            ]
        }

# Global instance
explainability_agent = ExplainabilityAgent()
