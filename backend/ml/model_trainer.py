"""
Real ML Model Trainer for GuardAI Fraud Detection
Uses XGBoost with proper training, validation, and testing
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_recall_curve
import xgboost as xgb
import joblib
import json
from datetime import datetime
import os
from typing import Dict, Tuple, Any

class FraudDetectionTrainer:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = []
        self.target_column = 'is_fraud'
        self.metrics = {}
        
    def load_and_preprocess_data(self, data_path: str = None) -> pd.DataFrame:
        """Load and preprocess fraud detection dataset"""
        if data_path and os.path.exists(data_path):
            df = pd.read_csv(data_path)
        else:
            # Generate realistic synthetic dataset
            print("Generating synthetic fraud detection dataset...")
            df = self.generate_synthetic_data()
        
        print(f"Dataset shape: {df.shape}")
        print(f"Fraud cases: {df[self.target_column].sum()} ({df[self.target_column].mean():.2%})")
        
        return df
    
    def generate_synthetic_data(self, n_samples: int = 10000) -> pd.DataFrame:
        """Generate realistic synthetic fraud data"""
        np.random.seed(42)
        
        # Generate legitimate transactions
        n_legit = int(n_samples * 0.95)
        n_fraud = n_samples - n_legit
        
        # Legitimate transactions
        legit_data = {
            'amount': np.random.lognormal(3, 1, n_legit).clip(1, 50000),
            'hour_of_day': np.random.normal(14, 4, n_legit).clip(0, 23).astype(int),
            'day_of_week': np.random.randint(0, 7, n_legit),
            'merchant_category': np.random.choice(['retail', 'food', 'gas', 'online', 'travel'], n_legit),
            'card_present': np.random.choice([1, 0], n_legit, p=[0.7, 0.3]),
            'distance_from_home': np.random.exponential(10, n_legit).clip(0, 1000),
            'transactions_last_hour': np.random.poisson(2, n_legit).clip(0, 10),
            'age_of_account': np.random.normal(365, 180, n_legit).clip(1, 2000).astype(int),
            'is_foreign': np.random.choice([0, 1], n_legit, p=[0.95, 0.05]),
            'is_high_risk_country': np.random.choice([0, 1], n_legit, p=[0.98, 0.02]),
            'is_fraud': np.zeros(n_legit, dtype=int)
        }
        
        # Fraudulent transactions (with different patterns)
        fraud_data = {
            'amount': np.random.lognormal(4, 1.5, n_fraud).clip(10, 100000),
            'hour_of_day': np.random.normal(2, 3, n_fraud).clip(0, 23).astype(int),
            'day_of_week': np.random.randint(0, 7, n_fraud),
            'merchant_category': np.random.choice(['online', 'travel', 'electronics'], n_fraud),
            'card_present': np.random.choice([1, 0], n_fraud, p=[0.1, 0.9]),
            'distance_from_home': np.random.exponential(50, n_fraud).clip(0, 2000),
            'transactions_last_hour': np.random.poisson(8, n_fraud).clip(0, 20),
            'age_of_account': np.random.normal(30, 20, n_fraud).clip(1, 500).astype(int),
            'is_foreign': np.random.choice([0, 1], n_fraud, p=[0.7, 0.3]),
            'is_high_risk_country': np.random.choice([0, 1], n_fraud, p=[0.8, 0.2]),
            'is_fraud': np.ones(n_fraud, dtype=int)
        }
        
        # Combine datasets
        legit_df = pd.DataFrame(legit_data)
        fraud_df = pd.DataFrame(fraud_data)
        df = pd.concat([legit_df, fraud_df], ignore_index=True)
        
        # Add engineered features
        df['amount_log'] = np.log1p(df['amount'])
        df['amount_per_transaction'] = df['amount'] / (df['transactions_last_hour'] + 1)
        df['risk_score'] = (
            df['is_foreign'] * 0.3 +
            df['is_high_risk_country'] * 0.4 +
            (df['hour_of_day'] < 6) * 0.2 +
            (df['card_present'] == 0) * 0.1
        )
        
        # Shuffle dataset
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        return df
    
    def preprocess_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Preprocess features for training"""
        # Make a copy to avoid modifying original
        df_processed = df.copy()
        
        # Handle categorical variables
        categorical_columns = ['merchant_category']
        for col in categorical_columns:
            if col in df_processed.columns:
                df_processed[col] = self.label_encoder.fit_transform(df_processed[col].astype(str))
        
        # Select feature columns (exclude target and non-predictive columns)
        exclude_columns = [self.target_column, 'amount']  # keep amount_log instead
        self.feature_columns = [col for col in df_processed.columns if col not in exclude_columns]
        
        # Extract features and target
        X = df_processed[self.feature_columns]
        y = df_processed[self.target_column]
        
        print(f"Feature columns: {self.feature_columns}")
        print(f"Features shape: {X.shape}")
        
        return X, y
    
    def train_model(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Train XGBoost model with proper validation"""
        # Split data
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.3, random_state=42, stratify=y
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
        )
        
        print(f"Training set: {X_train.shape}, Validation set: {X_val.shape}, Test set: {X_test.shape}")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Hyperparameter tuning
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [4, 6, 8],
            'learning_rate': [0.01, 0.1],
            'subsample': [0.8, 1.0],
            'colsample_bytree': [0.8, 1.0]
        }
        
        # Base model
        base_model = xgb.XGBClassifier(
            random_state=42,
            eval_metric='auc',
            use_label_encoder=False,
            n_jobs=-1
        )
        
        # Grid search with cross-validation
        grid_search = GridSearchCV(
            base_model, param_grid, cv=3, scoring='roc_auc', n_jobs=-1, verbose=1
        )
        
        print("Performing hyperparameter tuning...")
        grid_search.fit(X_train_scaled, y_train)
        
        # Best model
        self.model = grid_search.best_estimator_
        print(f"Best parameters: {grid_search.best_params_}")
        
        # Evaluate on validation set
        y_val_pred = self.model.predict(X_val_scaled)
        y_val_proba = self.model.predict_proba(X_val_scaled)[:, 1]
        
        # Evaluate on test set
        y_test_pred = self.model.predict(X_test_scaled)
        y_test_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        self.metrics = {
            'validation_auc': float(roc_auc_score(y_val, y_val_proba)),
            'test_auc': float(roc_auc_score(y_test, y_test_proba)),
            'validation_accuracy': float((y_val_pred == y_val).mean()),
            'test_accuracy': float((y_test_pred == y_test).mean()),
            'feature_importance': {k: float(v) for k, v in zip(self.feature_columns, self.model.feature_importances_)},
            'best_params': grid_search.best_params_,
            'training_samples': len(X_train),
            'validation_samples': len(X_val),
            'test_samples': len(X_test)
        }
        
        # Print detailed results
        print("\n=== MODEL PERFORMANCE ===")
        print(f"Validation AUC: {self.metrics['validation_auc']:.4f}")
        print(f"Test AUC: {self.metrics['test_auc']:.4f}")
        print(f"Validation Accuracy: {self.metrics['validation_accuracy']:.4f}")
        print(f"Test Accuracy: {self.metrics['test_accuracy']:.4f}")
        
        print("\n=== CLASSIFICATION REPORT (TEST SET) ===")
        print(classification_report(y_test, y_test_pred))
        
        print("\n=== FEATURE IMPORTANCE ===")
        sorted_features = sorted(self.metrics['feature_importance'].items(), key=lambda x: x[1], reverse=True)
        for feature, importance in sorted_features[:10]:
            print(f"{feature}: {importance:.4f}")
        
        return self.metrics
    
    def save_model(self, model_path: str = 'models/fraud_model.pkl') -> None:
        """Save trained model and preprocessing objects"""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_columns': self.feature_columns,
            'metrics': self.metrics,
            'target_column': self.target_column,
            'training_date': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, model_path)
        print(f"Model saved to {model_path}")
        
        # Also save metrics as JSON for easy reading
        metrics_path = model_path.replace('.pkl', '_metrics.json')
        with open(metrics_path, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        print(f"Metrics saved to {metrics_path}")
    
    def load_model(self, model_path: str = 'models/fraud_model.pkl') -> None:
        """Load trained model and preprocessing objects"""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model_data = joblib.load(model_path)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoder = model_data['label_encoder']
        self.feature_columns = model_data['feature_columns']
        self.metrics = model_data['metrics']
        self.target_column = model_data['target_column']
        
        print(f"Model loaded from {model_path}")
        print(f"Model AUC: {self.metrics.get('test_auc', 'N/A')}")
    
    def predict(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction on new transaction data"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        # Convert to DataFrame
        df = pd.DataFrame([transaction_data])
        
        # Add engineered features
        df['amount_log'] = np.log1p(df['amount'])
        df['amount_per_transaction'] = df['amount'] / (df['transactions_last_hour'] + 1)
        df['risk_score'] = (
            df['is_foreign'] * 0.3 +
            df['is_high_risk_country'] * 0.4 +
            (df['hour_of_day'] < 6) * 0.2 +
            (df['card_present'] == 0) * 0.1
        )
        
        # Handle categorical variables
        if 'merchant_category' in df.columns:
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
        
        # Determine verdict
        if fraud_proba < 0.3:
            verdict = 'SAFE'
        elif fraud_proba < 0.7:
            verdict = 'SUSPICIOUS'
        else:
            verdict = 'FRAUD'
        
        return {
            'fraud_probability': float(fraud_proba),
            'fraud_prediction': fraud_prediction,
            'verdict': verdict,
            'confidence': max(fraud_proba, 1 - fraud_proba),
            'risk_score': float(fraud_proba * 100)
        }

def main():
    """Main training function"""
    trainer = FraudDetectionTrainer()
    
    # Load and preprocess data
    df = trainer.load_and_preprocess_data()
    X, y = trainer.preprocess_features(df)
    
    # Train model
    metrics = trainer.train_model(X, y)
    
    # Save model
    trainer.save_model()
    
    print("\n=== TRAINING COMPLETED ===")
    print(f"Model AUC: {metrics['test_auc']:.4f}")
    print(f"Model Accuracy: {metrics['test_accuracy']:.4f}")
    
    return trainer

if __name__ == "__main__":
    trainer = main()
