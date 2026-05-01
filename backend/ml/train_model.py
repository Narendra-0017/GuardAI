"""
ML Model Training Script for GuardAI Fraud Detection
Trains XGBoost model on credit card fraud dataset
"""

import pandas as pd
import numpy as np
import xgboost as xgb
import shap
import joblib
import warnings
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_recall_curve
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Tuple, Dict, Any
import os

warnings.filterwarnings('ignore')

class FraudModelTrainer:
    """Trains and evaluates XGBoost fraud detection model"""
    
    def __init__(self, data_path: str = None):
        if data_path is None:
            self.data_path = os.path.join(os.path.dirname(__file__), "creditcard.csv")
        else:
            self.data_path = data_path
        self.model = None
        self.scaler = None
        self.explainer = None
        self.X_test = None
        self.y_test = None
        
    def load_data(self) -> pd.DataFrame:
        """Load and prepare the credit card fraud dataset"""
        print("🔄 Loading credit card fraud dataset...")
        
        # For demonstration, create synthetic data if real dataset not available
        try:
            df = pd.read_csv(self.data_path)
            print(f"✅ Loaded dataset with {len(df)} transactions")
        except FileNotFoundError:
            print("⚠️  Dataset not found. Creating synthetic data for demonstration...")
            df = self._create_synthetic_data()
        
        return df
    
    def _create_synthetic_data(self) -> pd.DataFrame:
        """Create synthetic credit card fraud data for demonstration"""
        n_samples = 10000
        fraud_ratio = 0.02  # 2% fraud (realistic)
        
        # Generate synthetic features
        np.random.seed(42)
        data = {
            'Time': np.random.uniform(0, 172800, n_samples),  # 2 days in seconds
            'Amount': np.random.lognormal(3, 1.5, n_samples),  # Log-normal distribution
        }
        
        # Generate V1-V28 features (PCA components)
        for i in range(1, 29):
            data[f'V{i}'] = np.random.randn(n_samples)
        
        df = pd.DataFrame(data)
        
        # Create fraud labels with realistic patterns
        fraud_indices = np.random.choice(n_samples, int(n_samples * fraud_ratio), replace=False)
        df['Class'] = 0
        df.loc[fraud_indices, 'Class'] = 1
        
        # Make fraud patterns more distinct
        df.loc[fraud_indices, 'Amount'] *= np.random.uniform(2, 10, len(fraud_indices))
        df.loc[fraud_indices, 'V1'] += np.random.uniform(2, 5, len(fraud_indices))
        df.loc[fraud_indices, 'V2'] -= np.random.uniform(2, 5, len(fraud_indices))
        
        print(f"✅ Created synthetic dataset: {len(df)} transactions, {df['Class'].sum()} fraud cases")
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocess data for training"""
        print("🔄 Preprocessing data...")
        
        # Separate features and target
        X = df.drop('Class', axis=1)
        y = df['Class']
        
        # Scale Amount and Time features
        scaler = StandardScaler()
        X[['Amount', 'Time']] = scaler.fit_transform(X[['Amount', 'Time']])
        self.scaler = scaler
        
        print(f"✅ Data preprocessed. Features: {X.shape[1]}, Fraud cases: {y.sum()}")
        return X.values, y.values
    
    def handle_class_imbalance(self, X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Handle class imbalance using SMOTE"""
        print("🔄 Handling class imbalance with SMOTE...")
        
        smote = SMOTE(random_state=42, sampling_strategy=0.1)  # 10% fraud after SMOTE
        X_resampled, y_resampled = smote.fit_resample(X, y)
        
        print(f"✅ SMOTE applied. Original: {np.bincount(y)}, Resampled: {np.bincount(y_resampled)}")
        return X_resampled, y_resampled
    
    def train_model(self, X_train: np.ndarray, y_train: np.ndarray) -> xgb.XGBClassifier:
        """Train XGBoost model"""
        print("🔄 Training XGBoost model...")
        
        # Calculate class weight for imbalance
        class_weight = len(y_train[y_train == 0]) / len(y_train[y_train == 1])
        
        self.model = xgb.XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=class_weight,
            random_state=42,
            n_jobs=-1,
            eval_metric='auc'
        )
        
        self.model.fit(X_train, y_train)
        print("✅ Model training completed")
        return self.model
    
    def evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """Evaluate model performance"""
        print("🔄 Evaluating model performance...")
        
        # Predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Metrics
        auc_roc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"\n📊 Model Performance Metrics:")
        print(f"🎯 AUC-ROC Score: {auc_roc:.4f}")
        print(f"📈 Classification Report:")
        print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraud']))
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        print(f"🔢 Confusion Matrix:")
        print(cm)
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': [f'V{i}' for i in range(1, 29)] + ['Time', 'Amount'],
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔝 Top 10 Important Features:")
        print(feature_importance.head(10))
        
        return {
            'auc_roc': auc_roc,
            'classification_report': classification_report(y_test, y_pred, output_dict=True),
            'confusion_matrix': cm,
            'feature_importance': feature_importance
        }
    
    def setup_shap_explainer(self):
        """Setup SHAP explainer for model interpretability"""
        print("🔄 Setting up SHAP explainer...")
        self.explainer = shap.TreeExplainer(self.model)
        print("✅ SHAP explainer ready")
    
    def save_model(self, model_path: str = None, scaler_path: str = None):
        """Save trained model and preprocessing components"""
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
        if scaler_path is None:
            scaler_path = os.path.join(os.path.dirname(__file__), "preprocessor.pkl")
            
        print(f"💾 Saving model to {model_path}...")
        joblib.dump(self.model, model_path)
        
        print(f"💾 Saving scaler to {scaler_path}...")
        joblib.dump(self.scaler, scaler_path)
        
        if self.explainer:
            explainer_path = os.path.join(os.path.dirname(__file__), "shap_explainer.pkl")
            print(f"💾 Saving SHAP explainer to {explainer_path}...")
            joblib.dump(self.explainer, explainer_path)
        
        print("✅ All model components saved successfully")
    
    def generate_training_report(self, metrics: Dict[str, Any]):
        """Generate comprehensive training report"""
        print("\n" + "="*60)
        print("🎉 GUARDAI MODEL TRAINING COMPLETE")
        print("="*60)
        print(f"🏆 Final AUC-ROC Score: {metrics['auc_roc']:.4f}")
        
        if metrics['auc_roc'] > 0.98:
            print("🌟 EXCELLENT: Model meets production requirements!")
        elif metrics['auc_roc'] > 0.95:
            print("✅ GOOD: Model performs well for production")
        else:
            print("⚠️  WARNING: Model may need improvement for production")
        
        print(f"\n📊 Confusion Matrix Summary:")
        tn, fp, fn, tp = metrics['confusion_matrix'].ravel()
        print(f"   True Negatives: {tn:,}")
        print(f"   False Positives: {fp:,}")
        print(f"   False Negatives: {fn:,}")
        print(f"   True Positives: {tp:,}")
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        print(f"\n🎯 Key Metrics:")
        print(f"   Precision: {precision:.4f}")
        print(f"   Recall: {recall:.4f}")
        print(f"   F1-Score: {f1_score:.4f}")
        
        print("\n🚀 Model is ready for deployment in GuardAI!")
        print("="*60)

def main():
    """Main training pipeline"""
    print("🤖 Starting GuardAI Fraud Detection Model Training")
    print("="*60)
    
    # Initialize trainer
    trainer = FraudModelTrainer()
    
    # Load and preprocess data
    df = trainer.load_data()
    X, y = trainer.preprocess_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Handle class imbalance
    X_train_resampled, y_train_resampled = trainer.handle_class_imbalance(X_train, y_train)
    
    # Train model
    trainer.train_model(X_train_resampled, y_train_resampled)
    
    # Store test data for evaluation
    trainer.X_test = X_test
    trainer.y_test = y_test
    
    # Evaluate model
    metrics = trainer.evaluate_model(X_test, y_test)
    
    # Setup SHAP explainer
    trainer.setup_shap_explainer()
    
    # Save model components
    trainer.save_model()
    
    # Generate final report
    trainer.generate_training_report(metrics)
    
    return trainer

if __name__ == "__main__":
    trainer = main()
