"""
Decision Agent - Makes final fraud verdict and recommendations
"""

from typing import Dict, Any, List
from datetime import datetime
import time

class DecisionAgent:
    """Decision Agent - Final verdict determination and recommendations"""
    
    def __init__(self):
        self.name = "decision"
        self.description = "Makes final fraud verdict and provides recommendations"
        
        # Decision thresholds
        self.thresholds = {
            "safe_max": 0.4,
            "suspicious_max": 0.7,
            "fraud_min": 0.7
        }
    
    def make_final_decision(self, risk_score: float, anomalies: List[str],
                          shap_features: List[Dict[str, Any]], 
                          investigation_report: str) -> Dict[str, Any]:
        """
        Make final fraud verdict based on all analysis results
        
        Args:
            risk_score: Risk score from detection agent
            anomalies: Detected anomalies from profiling agent
            shap_features: SHAP feature importance
            investigation_report: LLM-generated investigation report
            
        Returns:
            Final decision with verdict and recommendations
        """
        start_time = time.time()
        
        try:
            # Calculate adjusted risk score
            adjusted_risk = self._calculate_adjusted_risk(risk_score, anomalies, shap_features)
            
            # Determine verdict
            verdict, confidence = self._determine_verdict(adjusted_risk, anomalies, shap_features)
            
            # Determine if human review is needed
            requires_human_review = self._requires_human_review(verdict, adjusted_risk, anomalies)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(verdict, adjusted_risk, anomalies)
            
            # Calculate processing time
            processing_time = int((time.time() - start_time) * 1000)
            
            # Create agent step
            step_message = f"✅ Decision Agent: Final verdict — {verdict} with {confidence:.1f}% confidence. Processing time: {processing_time}ms"
            
            agent_step = {
                "agent": self.name,
                "step": step_message,
                "timestamp": datetime.now().isoformat(),
                "status": "complete",
                "execution_time_ms": processing_time,
                "details": {
                    "original_risk_score": risk_score,
                    "adjusted_risk_score": adjusted_risk,
                    "verdict": verdict,
                    "confidence": confidence,
                    "requires_human_review": requires_human_review,
                    "anomalies_count": len(anomalies),
                    "recommendations_count": len(recommendations)
                }
            }
            
            return {
                "verdict": verdict,
                "confidence": confidence,
                "adjusted_risk_score": adjusted_risk,
                "requires_human_review": requires_human_review,
                "recommendations": recommendations,
                "agent_step": agent_step,
                "success": True
            }
            
        except Exception as e:
            return self._fallback_decision(risk_score, str(e))
    
    def _calculate_adjusted_risk(self, base_risk: float, anomalies: List[str],
                               shap_features: List[Dict[str, Any]]) -> float:
        """
        Calculate adjusted risk score based on anomalies and feature importance
        
        Args:
            base_risk: Original risk score from ML model
            anomalies: List of detected anomalies
            shap_features: SHAP feature importance
            
        Returns:
            Adjusted risk score
        """
        adjusted_risk = base_risk
        
        # Adjust based on anomalies
        anomaly_adjustment = 0.0
        high_risk_anomalies = [
            'foreign', 'unknown device', 'high amount', 'distant', 'velocity',
            'unusual location', 'card not present', 'late night'
        ]
        
        for anomaly in anomalies:
            anomaly_lower = anomaly.lower()
            if any(keyword in anomaly_lower for keyword in high_risk_anomalies):
                anomaly_adjustment += 0.05
            else:
                anomaly_adjustment += 0.02
        
        # Adjust based on SHAP features
        shap_adjustment = 0.0
        for feature in shap_features[:3]:  # Top 3 features
            impact = abs(feature.get('impact', 0))
            if impact > 0.5:
                shap_adjustment += 0.03
            elif impact > 0.2:
                shap_adjustment += 0.01
        
        # Apply adjustments with caps
        adjusted_risk += anomaly_adjustment + shap_adjustment
        adjusted_risk = max(0.0, min(1.0, adjusted_risk))  # Keep between 0 and 1
        
        return adjusted_risk
    
    def _determine_verdict(self, adjusted_risk: float, anomalies: List[str],
                          shap_features: List[Dict[str, Any]]) -> tuple[str, float]:
        """
        Determine final verdict and confidence
        
        Args:
            adjusted_risk: Adjusted risk score
            anomalies: List of anomalies
            shap_features: SHAP features
            
        Returns:
            Tuple of (verdict, confidence)
        """
        # Determine verdict based on thresholds
        if adjusted_risk < self.thresholds["safe_max"]:
            verdict = "SAFE"
        elif adjusted_risk < self.thresholds["suspicious_max"]:
            verdict = "SUSPICIOUS"
        else:
            verdict = "FRAUD"
        
        # Calculate confidence based on consistency of signals
        base_confidence = adjusted_risk * 100
        
        # Boost confidence if multiple risk factors align
        if len(anomalies) > 3:
            base_confidence += 5
        if len(anomalies) > 5:
            base_confidence += 5
        
        # Boost confidence if SHAP features show strong signals
        strong_shap_signals = sum(1 for f in shap_features if abs(f.get('impact', 0)) > 0.3)
        if strong_shap_signals > 2:
            base_confidence += 5
        
        # Cap confidence at 99%
        confidence = min(99.0, base_confidence)
        
        return verdict, confidence
    
    def _requires_human_review(self, verdict: str, adjusted_risk: float,
                             anomalies: List[str]) -> bool:
        """
        Determine if human review is required
        
        Args:
            verdict: Final verdict
            adjusted_risk: Adjusted risk score
            anomalies: List of anomalies
            
        Returns:
            True if human review is required
        """
        # Always require review for fraud and suspicious
        if verdict in ["FRAUD", "SUSPICIOUS"]:
            return True
        
        # Require review for high-risk safe transactions
        if verdict == "SAFE" and adjusted_risk > 0.3:
            return True
        
        # Require review if many anomalies detected
        if len(anomalies) > 4:
            return True
        
        return False
    
    def _generate_recommendations(self, verdict: str, adjusted_risk: float,
                               anomalies: List[str]) -> List[str]:
        """
        Generate recommendations based on verdict and analysis
        
        Args:
            verdict: Final verdict
            adjusted_risk: Adjusted risk score
            anomalies: List of anomalies
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        if verdict == "FRAUD":
            recommendations.extend([
                "Block card immediately",
                "Contact customer for verification",
                "File fraud report",
                "Review recent transactions",
                "Enhance monitoring on account"
            ])
        elif verdict == "SUSPICIOUS":
            recommendations.extend([
                "Request additional verification",
                "Monitor account closely",
                "Limit transaction amounts",
                "Contact customer if pattern continues",
                "Review device fingerprint"
            ])
        else:  # SAFE
            if adjusted_risk > 0.2:
                recommendations.extend([
                    "Continue standard monitoring",
                    "Watch for pattern changes"
                ])
            else:
                recommendations.append("No action required")
        
        # Add specific recommendations based on anomalies
        anomaly_recommendations = {
            "foreign": "Verify international travel plans",
            "unknown device": "Register new device with customer",
            "high amount": "Set transaction limits if needed",
            "velocity": "Implement velocity checks",
            "late night": "Consider time-based restrictions"
        }
        
        for anomaly in anomalies:
            anomaly_lower = anomaly.lower()
            for keyword, recommendation in anomaly_recommendations.items():
                if keyword in anomaly_lower and recommendation not in recommendations:
                    recommendations.append(recommendation)
                    break
        
        # Limit to top 5 recommendations
        return recommendations[:5]
    
    def _fallback_decision(self, risk_score: float, error: str) -> Dict[str, Any]:
        """
        Fallback decision when normal processing fails
        
        Args:
            risk_score: Original risk score
            error: Error message
            
        Returns:
            Basic decision result
        """
        # Simple verdict based on risk score
        if risk_score < 0.4:
            verdict = "SAFE"
        elif risk_score < 0.7:
            verdict = "SUSPICIOUS"
        else:
            verdict = "FRAUD"
        
        confidence = risk_score * 100
        requires_human_review = verdict != "SAFE"
        
        # Create agent step
        step_message = f"⚠️ Decision Agent: Fallback verdict — {verdict} with {confidence:.1f}% confidence (Error: {error[:30]}...)"
        
        agent_step = {
            "agent": self.name,
            "step": step_message,
            "timestamp": datetime.now().isoformat(),
            "status": "complete",
            "execution_time_ms": 10,
            "details": {
                "verdict": verdict,
                "confidence": confidence,
                "requires_human_review": requires_human_review,
                "method": "fallback",
                "error": error[:100] if error else ""
            }
        }
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "adjusted_risk_score": risk_score,
            "requires_human_review": requires_human_review,
            "recommendations": ["Manual review recommended due to processing error"],
            "agent_step": agent_step,
            "success": False,
            "error": error
        }
    
    def get_decision_summary(self, verdict: str, confidence: float,
                           recommendations: List[str]) -> Dict[str, Any]:
        """
        Get decision summary for dashboard display
        
        Args:
            verdict: Final verdict
            confidence: Confidence percentage
            recommendations: List of recommendations
            
        Returns:
            Decision summary dictionary
        """
        # Determine display properties
        if verdict == "FRAUD":
            color = "red"
            icon = "🚨"
            urgency = "critical"
        elif verdict == "SUSPICIOUS":
            color = "amber"
            icon = "⚠️"
            urgency = "medium"
        else:  # SAFE
            color = "green"
            icon = "✅"
            urgency = "low"
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "color": color,
            "icon": icon,
            "urgency": urgency,
            "recommendations_count": len(recommendations),
            "top_recommendations": recommendations[:3],
            "requires_action": verdict != "SAFE"
        }
    
    def update_thresholds(self, safe_max: float = None, suspicious_max: float = None):
        """
        Update decision thresholds
        
        Args:
            safe_max: Maximum risk score for SAFE verdict
            suspicious_max: Maximum risk score for SUSPICIOUS verdict
        """
        if safe_max is not None:
            self.thresholds["safe_max"] = safe_max
        if suspicious_max is not None:
            self.thresholds["suspicious_max"] = suspicious_max
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get agent status and configuration"""
        return {
            "agent_name": self.name,
            "description": self.description,
            "thresholds": self.thresholds,
            "capabilities": [
                "Final verdict determination",
                "Risk score adjustment",
                "Human review requirements",
                "Recommendation generation",
                "Decision confidence calculation"
            ]
        }

# Global instance
decision_agent = DecisionAgent()
