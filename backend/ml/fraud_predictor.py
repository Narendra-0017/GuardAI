"""
Real ML Fraud Predictor for GuardAI
Uses the trained XGBoost model for real-time fraud detection
"""

import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
import os
from datetime import datetime

class FraudPredictor:
    def __init__(self, model_path: str = 'models/fraud_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.feature_columns = []
        self.metrics = {}
        self.load_model()
    
    def load_model(self) -> None:
        """Load the trained model and preprocessing objects"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        model_data = joblib.load(self.model_path)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoder = model_data['label_encoder']
        self.feature_columns = model_data['feature_columns']
        self.metrics = model_data['metrics']
        
        print(f"✅ Model loaded from {self.model_path}")
        print(f"📊 Model AUC: {self.metrics.get('test_auc', 'N/A'):.4f}")
        print(f"🎯 Model Accuracy: {self.metrics.get('test_accuracy', 'N/A'):.4f}")
    
    def predict_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make prediction on a single transaction
        Returns detailed fraud analysis with explanations
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        # Convert to DataFrame
        df = pd.DataFrame([transaction_data])
        
        # Add engineered features
        df = self._add_engineered_features(df)
        
        # Handle categorical variables
        if 'merchant_category' in df.columns:
            # Handle unknown categories
            known_categories = set(self.label_encoder.classes_)
            df['merchant_category'] = df['merchant_category'].apply(
                lambda x: x if x in known_categories else 'retail'
            )
            df['merchant_category'] = self.label_encoder.transform(df['merchant_category'].astype(str))
        
        # Ensure all required features are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0  # Default value for missing features
        
        # Select and scale features
        X = df[self.feature_columns]
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        fraud_proba = self.model.predict_proba(X_scaled)[:, 1][0]
        fraud_prediction = int(fraud_proba > 0.5)
        
        # Determine verdict with confidence levels
        if fraud_proba < 0.2:
            verdict = 'SAFE'
            confidence = 1 - fraud_proba
        elif fraud_proba < 0.7:
            verdict = 'SUSPICIOUS'
            confidence = max(fraud_proba, 1 - fraud_proba)
        else:
            verdict = 'FRAUD'
            confidence = fraud_proba
        
        # Generate SHAP-like feature explanations
        feature_contributions = self._get_feature_contributions(df, X_scaled)
        
        # Detect anomalies
        anomalies = self._detect_anomalies(transaction_data, fraud_proba)
        
        # Generate investigation report
        investigation_report = self._generate_investigation_report(
            transaction_data, fraud_proba, verdict, feature_contributions
        )
        
        return {
            'transaction_id': transaction_data.get('transaction_id', 'unknown'),
            'fraud_probability': float(fraud_proba),
            'fraud_prediction': fraud_prediction,
            'verdict': verdict,
            'confidence': float(confidence),
            'risk_score': float(fraud_proba * 100),
            'shap_features': feature_contributions,
            'anomalies': anomalies,
            'investigation_report': investigation_report,
            'model_info': {
                'model_type': 'XGBoost',
                'accuracy': float(self.metrics.get('test_accuracy', 0)),
                'auc_score': float(self.metrics.get('test_auc', 0)),
                'training_date': self.metrics.get('training_date', 'unknown')
            },
            'analyzed_by': 'guardai_ml_model',
            'created_at': datetime.now().isoformat()
        }
    
    def _add_engineered_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add engineered features to the input data"""
        # Log transformation of amount
        df['amount_log'] = np.log1p(df['amount'])
        
        # Amount per transaction ratio
        df['amount_per_transaction'] = df['amount'] / (df['transactions_last_hour'] + 1)
        
        # Risk score based on multiple factors
        df['risk_score'] = (
            df['is_foreign'] * 0.3 +
            df['is_high_risk_country'] * 0.4 +
            (df['hour_of_day'] < 6) * 0.2 +
            (df['card_present'] == 0) * 0.1
        )
        
        return df
    
    def _get_feature_contributions(self, df: pd.DataFrame, X_scaled: np.ndarray) -> List[Dict[str, Any]]:
        """Generate feature contributions similar to SHAP values"""
        # Get feature importance from the model
        feature_importance = dict(zip(self.feature_columns, self.model.feature_importances_))
        
        # Scale contributions based on actual values
        contributions = []
        for feature in self.feature_columns[:5]:  # Top 5 features
            if feature in df.columns:
                value = df[feature].iloc[0]
                importance = feature_importance.get(feature, 0)
                
                # Calculate contribution (simplified SHAP-like)
                if feature in ['hour_of_day', 'age_of_account']:
                    # For numeric features, use deviation from mean
                    contribution = importance * (value - df[feature].mean()) / df[feature].std()
                else:
                    # For binary/categorical features
                    contribution = importance * value
                
                contributions.append({
                    'feature': feature.replace('_', ' ').title(),
                    'value': float(value),
                    'contribution': float(contribution)
                })
        
        return contributions
    
    def _detect_anomalies(self, transaction_data: Dict[str, Any], fraud_proba: float) -> List[str]:
        """Detect specific anomalies in the transaction"""
        anomalies = []
        
        # High amount anomaly
        if transaction_data.get('amount', 0) > 10000:
            anomalies.append("Unusually high transaction amount")
        
        # Time-based anomalies
        hour = transaction_data.get('hour_of_day', 12)
        if hour < 6 or hour > 22:
            anomalies.append("Transaction during unusual hours")
        
        # Geographic anomalies
        if transaction_data.get('is_foreign', 0) == 1:
            anomalies.append("International transaction")
        
        if transaction_data.get('is_high_risk_country', 0) == 1:
            anomalies.append("Transaction from high-risk country")
        
        # Card not present anomaly
        if transaction_data.get('card_present', 1) == 0 and transaction_data.get('amount', 0) > 1000:
            anomalies.append("High-value card-not-present transaction")
        
        # Account age anomaly
        if transaction_data.get('age_of_account', 365) < 30:
            anomalies.append("Transaction from very new account")
        
        # High frequency anomaly
        if transaction_data.get('transactions_last_hour', 0) > 10:
            anomalies.append("High transaction frequency in last hour")
        
        # Distance anomaly
        if transaction_data.get('distance_from_home', 0) > 500:
            anomalies.append("Transaction far from home location")
        
        # Add fraud probability based anomaly
        if fraud_proba > 0.8:
            anomalies.append("ML model indicates high fraud risk")
        
        return anomalies
    
    def _generate_investigation_report(self, transaction_data: Dict[str, Any], 
                                    fraud_proba: float, verdict: str,
                                    feature_contributions: List[Dict[str, Any]]) -> str:
        """Generate a detailed investigation report"""
        amount = transaction_data.get('amount', 0)
        hour = transaction_data.get('hour_of_day', 12)
        
        if verdict == 'SAFE':
            report = f"Transaction appears legitimate. Amount ${amount:.2f} at {hour}:00 is within normal patterns. "
            report += "No significant risk factors detected."
        
        elif verdict == 'SUSPICIOUS':
            report = f"Transaction requires review. Amount ${amount:.2f} shows some risk indicators. "
            
            # Add specific risk factors
            if hour < 6 or hour > 22:
                report += f"Unusual timing ({hour}:00). "
            
            if transaction_data.get('is_foreign', 0) == 1:
                report += "International transaction. "
            
            if transaction_data.get('card_present', 1) == 0:
                report += "Card not present. "
            
            report += f"ML model confidence: {fraud_proba:.1%}. Recommend manual review."
        
        else:  # FRAUD
            report = f"HIGH RISK: Transaction shows strong fraud indicators. Amount ${amount:.2f} "
            report += f"at {hour}:00 with {fraud_proba:.1%} fraud probability. "
            
            # Add critical risk factors
            critical_factors = []
            if hour < 6 or hour > 22:
                critical_factors.append(f"unusual time ({hour}:00)")
            if transaction_data.get('is_foreign', 0) == 1:
                critical_factors.append("international origin")
            if transaction_data.get('card_present', 1) == 0:
                critical_factors.append("card not present")
            if amount > 5000:
                critical_factors.append("high amount")
            
            if critical_factors:
                report += f"Critical factors: {', '.join(critical_factors)}. "
            
            report += "IMMEDIATE ACTION REQUIRED: Block transaction and contact cardholder."
        
        return report
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        return {
            'model_type': 'XGBoost Classifier',
            'model_path': self.model_path,
            'features': self.feature_columns,
            'metrics': self.metrics,
            'training_date': self.metrics.get('training_date', 'unknown'),
            'is_loaded': self.model is not None
        }

# Global predictor instance
_predictor = None

def get_fraud_predictor() -> FraudPredictor:
    """Get or create the global fraud predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = FraudPredictor()
    return _predictor

def predict_fraud(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function to make fraud prediction"""
    predictor = get_fraud_predictor()
    return predictor.predict_transaction(transaction_data)
