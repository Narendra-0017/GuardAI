"""
Profiling Agent - Analyzes user behavior and detects anomalies
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import time
import random

class ProfilingAgent:
    """Profiling Agent - User behavior analysis and anomaly detection"""
    
    def __init__(self):
        self.name = "profiling"
        self.description = "Analyzes user behavior patterns and detects anomalies"
    
    def analyze_user_profile(self, transaction: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Analyze user behavior and detect anomalies
        
        Args:
            transaction: Current transaction data
            user_id: User identifier
            
        Returns:
            Profile analysis with anomalies and user profile
        """
        start_time = time.time()
        
        try:
            # Get user profile (simulated database query)
            user_profile = self._get_user_profile(user_id)
            
            # Get user's transaction history (simulated)
            transaction_history = self._get_transaction_history(user_id)
            
            # Detect anomalies
            anomalies = self._detect_anomalies(transaction, user_profile, transaction_history)
            
            # Create agent step
            step_message = f"👤 Profiling Agent: Analyzed user history. Found {len(anomalies)} anomalies: {', '.join(anomalies[:3])}"
            
            agent_step = {
                "agent": self.name,
                "step": step_message,
                "timestamp": datetime.now().isoformat(),
                "status": "complete",
                "execution_time_ms": int((time.time() - start_time) * 1000),
                "details": {
                    "anomalies_count": len(anomalies),
                    "transaction_history_size": len(transaction_history),
                    "user_profile_completeness": len(user_profile)
                }
            }
            
            return {
                "user_profile": user_profile,
                "anomalies": anomalies,
                "agent_step": agent_step,
                "success": True
            }
            
        except Exception as e:
            # Fallback analysis
            return self._fallback_analysis(transaction, user_id, str(e))
    
    def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get user profile from database (simulated)
        
        Args:
            user_id: User identifier
            
        Returns:
            User profile dictionary
        """
        # Simulate user profile data
        # In production, this would query Supabase
        
        base_profiles = {
            "user_001": {
                "full_name": "John Doe",
                "registered_country": "USA",
                "registered_city": "New York",
                "account_created": "2022-01-15",
                "risk_level": "low",
                "avg_spend": 150.0,
                "max_spend": 800.0,
                "avg_daily_frequency": 3,
                "known_devices": ["iPhone_12", "MacBook_Pro", "iPad_Air"],
                "common_locations": ["New York, USA", "Boston, USA", "Philadelphia, USA"],
                "common_hours": [9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20],
                "preferred_categories": ["Electronics", "Food", "Retail"],
                "last_login": datetime.now() - timedelta(hours=2)
            },
            "user_002": {
                "full_name": "Jane Smith",
                "registered_country": "UK",
                "registered_city": "London",
                "account_created": "2021-06-20",
                "risk_level": "medium",
                "avg_spend": 250.0,
                "max_spend": 1200.0,
                "avg_daily_frequency": 5,
                "known_devices": ["Samsung_S21", "Dell_XPS"],
                "common_locations": ["London, UK", "Manchester, UK", "Birmingham, UK"],
                "common_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                "preferred_categories": ["Travel", "Entertainment", "Healthcare"],
                "last_login": datetime.now() - timedelta(hours=1)
            }
        }
        
        # Return profile or default
        return base_profiles.get(user_id, self._create_default_profile())
    
    def _create_default_profile(self) -> Dict[str, Any]:
        """Create default user profile for unknown users"""
        return {
            "full_name": "Unknown User",
            "registered_country": "Unknown",
            "registered_city": "Unknown",
            "account_created": "2023-01-01",
            "risk_level": "medium",
            "avg_spend": 200.0,
            "max_spend": 1000.0,
            "avg_daily_frequency": 4,
            "known_devices": ["Unknown_Device"],
            "common_locations": ["Unknown_Location"],
            "common_hours": [9, 10, 11, 12, 14, 15, 16, 17, 18],
            "preferred_categories": ["Retail", "Food"],
            "last_login": datetime.now() - timedelta(hours=6)
        }
    
    def _get_transaction_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get user's transaction history (simulated)
        
        Args:
            user_id: User identifier
            limit: Maximum number of transactions to retrieve
            
        Returns:
            List of past transactions
        """
        # Simulate transaction history
        # In production, this would query Supabase with proper filtering
        
        history = []
        base_time = datetime.now() - timedelta(days=30)
        
        for i in range(min(limit, 30)):  # Generate up to 30 transactions
            transaction_time = base_time + timedelta(
                days=random.randint(0, 29),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            history.append({
                "transaction_id": f"HIST_{user_id}_{i+1:03d}",
                "amount": random.uniform(10, 500),
                "timestamp": transaction_time.isoformat(),
                "location": random.choice(["New York, USA", "Boston, USA", "Online"]),
                "merchant": random.choice(["Amazon", "Walmart", "Target", "Starbucks"]),
                "merchant_category": random.choice(["Electronics", "Food", "Retail", "Entertainment"]),
                "card_present": random.choice([True, False]),
                "device_fingerprint": random.choice(["iPhone_12", "MacBook_Pro", "Unknown"]),
                "distance_from_home_km": random.uniform(0, 100),
                "hour_of_day": transaction_time.hour,
                "day_of_week": transaction_time.weekday()
            })
        
        # Sort by timestamp (most recent first)
        history.sort(key=lambda x: x["timestamp"], reverse=True)
        return history
    
    def _detect_anomalies(self, transaction: Dict[str, Any], user_profile: Dict[str, Any], 
                         transaction_history: List[Dict[str, Any]]) -> List[str]:
        """
        Detect anomalies in the transaction
        
        Args:
            transaction: Current transaction
            user_profile: User profile data
            transaction_history: Past transactions
            
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        # Extract transaction details
        amount = transaction.get('amount', 0)
        hour_of_day = transaction.get('hour_of_day', 12)
        location = transaction.get('location', 'Unknown')
        merchant_category = transaction.get('merchant_category', 'Unknown')
        device_fingerprint = transaction.get('device_fingerprint', 'Unknown')
        distance_from_home = transaction.get('distance_from_home_km', 0)
        card_present = transaction.get('card_present', True)
        is_foreign = transaction.get('is_foreign_transaction', False)
        
        # 1. Amount anomalies
        avg_spend = user_profile.get('avg_spend', 200)
        max_spend = user_profile.get('max_spend', 1000)
        
        if amount > max_spend * 1.5:
            anomalies.append(f"Unusually high amount: ${amount:.2f} (exceeds historical max of ${max_spend:.2f})")
        elif amount > avg_spend * 3:
            anomalies.append(f"High amount transaction: ${amount:.2f} (3x average of ${avg_spend:.2f})")
        
        # 2. Time anomalies
        common_hours = user_profile.get('common_hours', [9, 10, 11, 12, 14, 15, 16, 17, 18])
        if hour_of_day not in common_hours:
            anomalies.append(f"Unusual transaction time: {hour_of_day}:00 (outside common hours)")
        
        # 3. Location anomalies
        common_locations = user_profile.get('common_locations', ['Unknown'])
        registered_country = user_profile.get('registered_country', 'Unknown')
        
        if location not in common_locations and location != "Unknown":
            anomalies.append(f"Unusual location: {location} (not in common locations)")
        
        if distance_from_home > 1000:
            anomalies.append(f"Distant transaction: {distance_from_home:.0f}km from home")
        
        if is_foreign and registered_country != "Unknown":
            anomalies.append(f"Foreign transaction detected (registered in {registered_country})")
        
        # 4. Device anomalies
        known_devices = user_profile.get('known_devices', ['Unknown'])
        device_known = transaction.get('device_known', True)
        
        if not device_known or device_fingerprint not in known_devices:
            anomalies.append(f"Unknown device: {device_fingerprint}")
        
        # 5. Card presence anomalies
        if not card_present:
            anomalies.append("Card not present transaction")
        
        # 6. Velocity anomalies (transactions in last hour)
        transactions_last_hour = transaction.get('transactions_last_hour', 1)
        if transactions_last_hour > 5:
            anomalies.append(f"High transaction velocity: {transactions_last_hour} in last hour")
        elif transactions_last_hour > 3:
            anomalies.append(f"Elevated transaction frequency: {transactions_last_hour} in last hour")
        
        # 7. Merchant category anomalies
        preferred_categories = user_profile.get('preferred_categories', ['Retail'])
        if merchant_category not in preferred_categories and merchant_category != "Unknown":
            anomalies.append(f"Unusual merchant category: {merchant_category}")
        
        # 8. Pattern anomalies based on history
        if transaction_history:
            # Check for rapid succession transactions
            recent_transactions = [t for t in transaction_history[:5] 
                                if datetime.fromisoformat(t['timestamp']) > datetime.now() - timedelta(hours=1)]
            
            if len(recent_transactions) > 2:
                anomalies.append(f"Multiple recent transactions: {len(recent_transactions)} in last hour")
            
            # Check for duplicate amounts (potential testing)
            same_amount_count = sum(1 for t in recent_transactions if abs(t['amount'] - amount) < 1.0)
            if same_amount_count > 1:
                anomalies.append(f"Repeated amount pattern: ${amount:.2f} appears {same_amount_count + 1} times")
        
        return anomalies
    
    def _fallback_analysis(self, transaction: Dict[str, Any], user_id: str, error: str) -> Dict[str, Any]:
        """
        Fallback analysis when profiling fails
        
        Args:
            transaction: Transaction data
            user_id: User identifier
            error: Error message
            
        Returns:
            Basic analysis results
        """
        # Create default profile
        user_profile = self._create_default_profile()
        user_profile["user_id"] = user_id
        
        # Basic anomaly detection
        anomalies = []
        amount = transaction.get('amount', 0)
        hour = transaction.get('hour_of_day', 12)
        
        if amount > 1000:
            anomalies.append(f"High amount: ${amount:.2f}")
        if hour < 6 or hour > 22:
            anomalies.append(f"Late night transaction: {hour}:00")
        
        # Create agent step
        step_message = f"👤 Profiling Agent: Basic analysis completed. Found {len(anomalies)} anomalies: {', '.join(anomalies[:2])}"
        
        if error:
            step_message += f" (Profile unavailable: {error[:30]}...)"
        
        agent_step = {
            "agent": self.name,
            "step": step_message,
            "timestamp": datetime.now().isoformat(),
            "status": "complete",
            "execution_time_ms": 25,  # Fast fallback
            "details": {
                "anomalies_count": len(anomalies),
                "method": "basic_fallback",
                "error": error[:100] if error else ""
            }
        }
        
        return {
            "user_profile": user_profile,
            "anomalies": anomalies,
            "agent_step": agent_step,
            "success": False,
            "error": error
        }
    
    def calculate_risk_adjustment(self, anomalies: List[str]) -> float:
        """
        Calculate risk score adjustment based on anomalies
        
        Args:
            anomalies: List of detected anomalies
            
        Returns:
            Risk adjustment value (0.0 to 1.0)
        """
        if not anomalies:
            return 0.0
        
        # Weight different types of anomalies
        high_risk_keywords = ['foreign', 'unknown device', 'high amount', 'distant', 'velocity']
        medium_risk_keywords = ['unusual', 'late night', 'card not present']
        
        risk_adjustment = 0.0
        
        for anomaly in anomalies:
            anomaly_lower = anomaly.lower()
            if any(keyword in anomaly_lower for keyword in high_risk_keywords):
                risk_adjustment += 0.15
            elif any(keyword in anomaly_lower for keyword in medium_risk_keywords):
                risk_adjustment += 0.08
            else:
                risk_adjustment += 0.05
        
        return min(risk_adjustment, 0.5)  # Cap at 0.5

# Global instance
profiling_agent = ProfilingAgent()
