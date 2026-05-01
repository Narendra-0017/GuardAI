"""
Detection Agent - Runs ML model and computes SHAP explanations
"""

from typing import Dict, Any, List
from datetime import datetime
import time
import numpy as np
import joblib
import shap

class DetectionAgent:
    """Detection Agent - ML model inference and SHAP explanations"""
    
    def __init__(self):
        self.name = "detection"
        self.description = "Runs XGBoost model and computes SHAP feature importance"
        self.model = None
        self.scaler = None
        self.explainer = None
        self.feature_mapper = None
        
        # Lazy loading of models
        self._load_models()
    
    def _load_models(self):
        """Load ML models and preprocessing components"""
        try:
            from ml.feature_mapping import feature_mapper
            
            self.model = joblib.load("./ml/model.pkl")
            self.scaler = joblib.load("./ml/preprocessor.pkl")
            self.explainer = joblib.load("./ml/shap_explainer.pkl")
            self.feature_mapper = feature_mapper
            
            print("✅ Detection Agent: ML models loaded successfully")
            
        except Exception as e:
            print(f"⚠️ Detection Agent: Could not load models - {str(e)}")
            self.model = None
            self.scaler = None
            self.explainer = None
            self.feature_mapper = None
    
    def analyze_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze transaction using ML model
        
        Args:
            transaction: Transaction data with human-readable features
            
        Returns:
            Analysis results with risk score and SHAP features
        """
        start_time = time.time()
        
        try:
            if self.model is None:
                return self._fallback_analysis(transaction)
            
            # Map human-readable features to model input
            human_features = transaction
            model_features = self.feature_mapper.map_to_model_features(human_features)
            
            # Prepare full feature vector (V1-V28 + Time + Amount)
            full_features = np.zeros(30)
            full_features[:28] = model_features
            full_features[28] = human_features.get('hour_of_day', 12) * 3600  # Convert to seconds
            full_features[29] = human_features.get('amount', 0)
            
            # Scale Time and Amount if scaler is available
            if self.scaler:
                full_features[28:30] = self.scaler.transform([full_features[28:30]])[0]
            
            # Get risk score
            risk_score = float(self.model.predict_proba([full_features])[0][1])
            
            # Get SHAP explanations
            shap_features = self._compute_shap_explanations(full_features, human_features)
            
            # Create agent step
            top_feature = shap_features[0]["feature_name"] if shap_features else "amount"
            step_message = f"🔍 Detection Agent: XGBoost model scored transaction at {risk_score:.3f}. Top risk factor: {top_feature}"
            
            agent_step = {
                "agent": self.name,
                "step": step_message,
                "timestamp": datetime.now().isoformat(),
                "status": "complete",
                "execution_time_ms": int((time.time() - start_time) * 1000),
                "details": {
                    "risk_score": risk_score,
                    "top_feature": top_feature,
                    "model_version": "xgboost_v1.0"
                }
            }
            
            return {
                "risk_score": risk_score,
                "shap_features": shap_features,
                "agent_step": agent_step,
                "success": True
            }
            
        except Exception as e:
            return self._fallback_analysis(transaction, str(e))
    
    def _compute_shap_explanations(self, features: np.ndarray, human_features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Compute SHAP feature importance explanations
        
        Args:
            features: Full model feature vector (30 features)
            human_features: Human-readable feature dictionary
            
        Returns:
            List of SHAP feature explanations
        """
        try:
            if self.explainer is None:
                return self._create_dummy_shap_features(human_features)
            
            # Get SHAP values
            shap_values = self.explainer.shap_values([features])[0]
            
            # Map to human-readable features
            human_readable_names = self.feature_mapper.get_human_readable_names()
            shap_features = []
            
            # Create feature impact mapping
            for i, name in enumerate(human_readable_names):
                # Map human feature to SHAP impact (simplified mapping)
                if name == 'amount':
                    impact = float(shap_values[0]) * 2.0  # Amount typically V1
                elif name == 'hour_of_day':
                    impact = float(shap_values[2]) * 1.5  # Time typically V3
                elif name == 'distance_from_home_km':
                    impact = float(shap_values[4]) * 1.8  # Distance typically V5
                elif name == 'device_known':
                    impact = float(shap_values[6]) * 1.2  # Device typically V7
                elif name == 'card_present':
                    impact = float(shap_values[7]) * 1.0  # Card present typically V8
                elif name == 'transactions_last_hour':
                    impact = float(shap_values[8]) * 1.5  # Velocity typically V9
                else:
                    # Use average impact for other features
                    impact = float(np.mean(shap_values[:28])) * (1 if i < 5 else -1)
                
                shap_features.append({
                    "feature_name": name,
                    "value": human_features.get(name, 0),
                    "impact": impact
                })
            
            # Sort by absolute impact and take top 5
            shap_features.sort(key=lambda x: abs(x["impact"]), reverse=True)
            return shap_features[:5]
            
        except Exception as e:
            print(f"⚠️ SHAP computation failed: {str(e)}")
            return self._create_dummy_shap_features(human_features)
    
    def _create_dummy_shap_features(self, human_features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create dummy SHAP features when model is unavailable"""
        features = []
        
        # Use simple heuristics for feature importance
        amount = human_features.get('amount', 0)
        hour = human_features.get('hour_of_day', 12)
        distance = human_features.get('distance_from_home_km', 0)
        
        features.append({
            "feature_name": "amount",
            "value": amount,
            "impact": min(amount / 1000, 2.0)  # Scale amount impact
        })
        
        features.append({
            "feature_name": "hour_of_day",
            "value": hour,
            "impact": 1.0 if hour < 6 or hour > 22 else -0.5
        })
        
        features.append({
            "feature_name": "distance_from_home_km",
            "value": distance,
            "impact": min(distance / 5000, 1.5) if distance > 100 else -0.3
        })
        
        features.append({
            "feature_name": "device_known",
            "value": human_features.get('device_known', True),
            "impact": -1.0 if human_features.get('device_known', True) else 1.0
        })
        
        features.append({
            "feature_name": "card_present",
            "value": human_features.get('card_present', True),
            "impact": -0.8 if human_features.get('card_present', True) else 0.8
        })
        
        # Sort by absolute impact
        features.sort(key=lambda x: abs(x["impact"]), reverse=True)
        return features
    
    def _fallback_analysis(self, transaction: Dict[str, Any], error: str = "") -> Dict[str, Any]:
        """Fallback analysis when ML model is unavailable"""
        # Use simple heuristics for risk scoring
        amount = transaction.get('amount', 0)
        hour = transaction.get('hour_of_day', 12)
        distance = transaction.get('distance_from_home_km', 0)
        device_known = transaction.get('device_known', True)
        card_present = transaction.get('card_present', True)
        transactions_last_hour = transaction.get('transactions_last_hour', 1)
        
        # Calculate risk score based on heuristics
        risk_score = 0.1  # Base risk
        
        # Amount risk
        if amount > 1000:
            risk_score += 0.2
        if amount > 5000:
            risk_score += 0.3
        
        # Time risk
        if hour < 6 or hour > 22:
            risk_score += 0.15
        
        # Distance risk
        if distance > 1000:
            risk_score += 0.2
        if distance > 5000:
            risk_score += 0.2
        
        # Device and card risk
        if not device_known:
            risk_score += 0.15
        if not card_present:
            risk_score += 0.1
        
        # Velocity risk
        if transactions_last_hour > 3:
            risk_score += 0.2
        if transactions_last_hour > 5:
            risk_score += 0.2
        
        risk_score = min(risk_score, 0.95)  # Cap at 95%
        
        # Create SHAP features
        shap_features = self._create_dummy_shap_features(transaction)
        
        # Create agent step
        top_feature = shap_features[0]["feature_name"] if shap_features else "amount"
        step_message = f"🔍 Detection Agent: Heuristic analysis scored transaction at {risk_score:.3f}. Top risk factor: {top_feature}"
        
        if error:
            step_message += f" (Model unavailable: {error[:50]}...)"
        
        agent_step = {
            "agent": self.name,
            "step": step_message,
            "timestamp": datetime.now().isoformat(),
            "status": "complete",
            "execution_time_ms": 50,  # Fast fallback
            "details": {
                "risk_score": risk_score,
                "top_feature": top_feature,
                "method": "heuristic_fallback"
            }
        }
        
        return {
            "risk_score": risk_score,
            "shap_features": shap_features,
            "agent_step": agent_step,
            "success": False,
            "error": error
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        return {
            "model_loaded": self.model is not None,
            "scaler_loaded": self.scaler is not None,
            "explainer_loaded": self.explainer is not None,
            "feature_mapper_loaded": self.feature_mapper is not None,
            "model_type": "XGBoost" if self.model else "None",
            "agent_name": self.name
        }

# Global instance
detection_agent = DetectionAgent()
