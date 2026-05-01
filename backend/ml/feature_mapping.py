"""
Feature Mapping for GuardAI Fraud Detection
Maps human-readable transaction features to model input features (V1-V28)
"""

import numpy as np
from typing import Dict, List, Tuple

class FeatureMapper:
    """Maps human-readable features to PCA features for the fraud detection model"""
    
    def __init__(self):
        # Define human-readable feature names
        self.human_features = [
            'amount',
            'hour_of_day', 
            'day_of_week',
            'merchant_category_encoded',
            'distance_from_home_km',
            'device_known',
            'card_present',
            'transactions_last_hour',
            'amount_vs_avg_ratio',
            'is_foreign_transaction'
        ]
        
        # Initialize mapping parameters
        self._initialize_mapping_params()
    
    def _initialize_mapping_params(self):
        """Initialize deterministic mapping parameters"""
        np.random.seed(42)  # Fixed seed for reproducibility
        
        # Create deterministic mapping matrix (10 human features -> 28 PCA features)
        self.mapping_matrix = np.random.randn(10, 28) * 0.3
        
        # Add some structure to make mapping more realistic
        # Amount strongly influences V1, V2
        self.mapping_matrix[0, 0] = 2.5  # amount -> V1
        self.mapping_matrix[0, 1] = 1.8  # amount -> V2
        
        # Time features influence V3, V4
        self.mapping_matrix[1, 2] = 1.5  # hour_of_day -> V3
        self.mapping_matrix[2, 2] = 1.2  # day_of_week -> V3
        self.mapping_matrix[1, 3] = 1.0  # hour_of_day -> V4
        
        # Distance influences V5, V6
        self.mapping_matrix[4, 4] = 2.0  # distance -> V5
        self.mapping_matrix[4, 5] = 1.5  # distance -> V6
        
        # Device and card features influence V7, V8
        self.mapping_matrix[5, 6] = 1.8  # device_known -> V7
        self.mapping_matrix[6, 7] = 1.6  # card_present -> V8
        
        # Transaction frequency influences V9, V10
        self.mapping_matrix[7, 8] = 2.2  # transactions_last_hour -> V9
        self.mapping_matrix[7, 9] = 1.4  # transactions_last_hour -> V10
        
        # Merchant category influences V11-V15
        for i in range(5):
            self.mapping_matrix[3, 10+i] = 1.0 + i * 0.2
        
        # Amount ratio influences V16-V20
        for i in range(5):
            self.mapping_matrix[8, 15+i] = 1.2 + i * 0.1
        
        # Foreign transaction influences V21-V25
        for i in range(5):
            self.mapping_matrix[9, 20+i] = 1.0 + i * 0.15
        
        # Add some noise to remaining features
        for i in range(26, 28):
            self.mapping_matrix[:, i] = np.random.randn(10) * 0.1
    
    def map_to_model_features(self, human_features: Dict[str, float]) -> np.ndarray:
        """
        Convert human-readable features to model input features (V1-V28)
        
        Args:
            human_features: Dict with keys matching self.human_features
            
        Returns:
            np.ndarray: Array of 28 features (V1-V28)
        """
        # Extract features in correct order
        feature_vector = np.array([
            human_features.get('amount', 0.0),
            human_features.get('hour_of_day', 12.0),
            human_features.get('day_of_week', 3.0),
            human_features.get('merchant_category_encoded', 0.0),
            human_features.get('distance_from_home_km', 0.0),
            human_features.get('device_known', 1.0),
            human_features.get('card_present', 1.0),
            human_features.get('transactions_last_hour', 1.0),
            human_features.get('amount_vs_avg_ratio', 1.0),
            human_features.get('is_foreign_transaction', 0.0)
        ])
        
        # Normalize features
        feature_vector = self._normalize_features(feature_vector)
        
        # Apply mapping to get 28 PCA features
        pca_features = np.dot(feature_vector, self.mapping_matrix)
        
        return pca_features
    
    def _normalize_features(self, features: np.ndarray) -> np.ndarray:
        """Normalize features to zero mean, unit variance"""
        # Define normalization parameters (based on typical transaction data)
        means = np.array([100.0, 12.0, 3.0, 2.0, 50.0, 0.7, 0.3, 2.0, 1.0, 0.1])
        stds = np.array([200.0, 6.0, 2.0, 1.5, 100.0, 0.5, 0.5, 2.0, 0.5, 0.3])
        
        # Avoid division by zero
        stds = np.where(stds == 0, 1.0, stds)
        
        return (features - means) / stds
    
    def get_human_readable_names(self) -> List[str]:
        """Get list of human-readable feature names"""
        return self.human_features.copy()
    
    def create_sample_transaction(self, fraud_pattern: bool = False) -> Dict[str, float]:
        """
        Create a sample transaction for testing
        
        Args:
            fraud_pattern: If True, creates a transaction with fraud characteristics
            
        Returns:
            Dict with human-readable features
        """
        if fraud_pattern:
            return {
                'amount': np.random.uniform(1000, 5000),
                'hour_of_day': np.random.randint(1, 5),  # Late night
                'day_of_week': np.random.randint(0, 7),
                'merchant_category_encoded': np.random.randint(0, 10),
                'distance_from_home_km': np.random.uniform(5000, 15000),  # Foreign
                'device_known': 0,  # Unknown device
                'card_present': 0,  # Card not present
                'transactions_last_hour': np.random.randint(3, 8),  # High velocity
                'amount_vs_avg_ratio': np.random.uniform(5, 15),  # Much higher than average
                'is_foreign_transaction': 1
            }
        else:
            return {
                'amount': np.random.uniform(10, 200),
                'hour_of_day': np.random.randint(9, 21),  # Business hours
                'day_of_week': np.random.randint(0, 5),  # Weekdays
                'merchant_category_encoded': np.random.randint(0, 10),
                'distance_from_home_km': np.random.uniform(0, 50),  # Local
                'device_known': 1,  # Known device
                'card_present': 1,  # Card present
                'transactions_last_hour': 1,
                'amount_vs_avg_ratio': np.random.uniform(0.5, 2.0),  # Normal range
                'is_foreign_transaction': 0
            }

# Global instance
feature_mapper = FeatureMapper()
