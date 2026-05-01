"""
Orchestrator Agent - Coordinates the fraud detection pipeline
"""

from typing import Dict, Any, List
from datetime import datetime
import time

class OrchestratorAgent:
    """Orchestrates the entire fraud detection workflow"""
    
    def __init__(self):
        self.name = "orchestrator"
        self.description = "Coordinates fraud detection pipeline and agent execution"
    
    def initialize_pipeline(self, transaction: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Initialize the fraud detection pipeline
        
        Args:
            transaction: Transaction data
            user_id: User identifier
            
        Returns:
            Initial state dictionary
        """
        start_time = time.time()
        
        # Create initial agent step
        agent_step = {
            "agent": self.name,
            "step": "🤖 Orchestrator: Transaction received. Initiating GuardAI investigation pipeline...",
            "timestamp": datetime.now().isoformat(),
            "status": "complete",
            "execution_time_ms": 0,
            "details": {
                "transaction_id": transaction.get("transaction_id", "UNKNOWN"),
                "amount": transaction.get("amount", 0),
                "user_id": user_id
            }
        }
        
        # Initialize state
        initial_state = {
            "transaction": transaction,
            "user_id": user_id,
            "risk_score": 0.0,
            "shap_features": [],
            "user_profile": {},
            "anomalies": [],
            "agent_steps": [agent_step],
            "investigation_report": "",
            "verdict": "PENDING",
            "confidence": 0.0,
            "requires_human_review": False,
            "processing_time_ms": 0,
            "start_time": start_time,
            "current_agent": self.name
        }
        
        return initial_state
    
    def determine_agent_sequence(self, transaction: Dict[str, Any]) -> List[str]:
        """
        Determine which agents should be invoked based on transaction characteristics
        
        Args:
            transaction: Transaction data
            
        Returns:
            List of agent names in execution order
        """
        agents = ["detection"]  # Always run detection
        
        # Add profiling if transaction has suspicious characteristics
        amount = transaction.get("amount", 0)
        hour = transaction.get("hour_of_day", 12)
        distance = transaction.get("distance_from_home_km", 0)
        
        if (amount > 500 or hour < 6 or hour > 22 or distance > 1000):
            agents.append("profiling")
        
        # Add explainability for high-risk transactions
        if amount > 1000 or distance > 5000:
            agents.append("explainability")
        
        # Always end with decision
        agents.append("decision")
        
        return agents
    
    def log_pipeline_start(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Log the start of the fraud detection pipeline
        
        Args:
            transaction: Transaction data
            
        Returns:
            Log entry
        """
        return {
            "event": "pipeline_start",
            "timestamp": datetime.now().isoformat(),
            "transaction_id": transaction.get("transaction_id", "UNKNOWN"),
            "amount": transaction.get("amount", 0),
            "user_id": transaction.get("user_id", "UNKNOWN"),
            "agent_sequence": self.determine_agent_sequence(transaction)
        }
    
    def validate_transaction_input(self, transaction: Dict[str, Any]) -> tuple[bool, str]:
        """
        Validate transaction input data
        
        Args:
            transaction: Transaction data
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        required_fields = ["transaction_id", "amount", "user_id"]
        
        for field in required_fields:
            if field not in transaction:
                return False, f"Missing required field: {field}"
        
        # Validate amount
        amount = transaction.get("amount", 0)
        if not isinstance(amount, (int, float)) or amount < 0:
            return False, "Amount must be a positive number"
        
        # Validate hour_of_day
        hour = transaction.get("hour_of_day", 12)
        if not isinstance(hour, int) or hour < 0 or hour > 23:
            return False, "hour_of_day must be between 0 and 23"
        
        return True, ""
    
    def create_error_response(self, error_message: str, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create error response for failed pipeline execution
        
        Args:
            error_message: Error description
            transaction: Transaction data
            
        Returns:
            Error state dictionary
        """
        error_step = {
            "agent": self.name,
            "step": f"❌ Orchestrator: Pipeline failed - {error_message}",
            "timestamp": datetime.now().isoformat(),
            "status": "error",
            "execution_time_ms": 0,
            "error": error_message
        }
        
        return {
            "transaction": transaction,
            "user_id": transaction.get("user_id", ""),
            "risk_score": 0.0,
            "shap_features": [],
            "user_profile": {},
            "anomalies": [f"Pipeline error: {error_message}"],
            "agent_steps": [error_step],
            "investigation_report": f"Pipeline failed due to error: {error_message}",
            "verdict": "ERROR",
            "confidence": 0.0,
            "requires_human_review": True,
            "processing_time_ms": 0,
            "start_time": time.time(),
            "current_agent": self.name,
            "error": error_message
        }

# Global instance
orchestrator = OrchestratorAgent()
