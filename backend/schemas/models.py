"""
Pydantic schemas for GuardAI API
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

# Enums
class VerdictEnum(str, Enum):
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    FRAUD = "FRAUD"

class EmailVerdictEnum(str, Enum):
    PHISHING = "PHISHING"
    SUSPICIOUS = "SUSPICIOUS"
    LEGITIMATE = "LEGITIMATE"

class ThreatLevelEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"

# Base schemas
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

# Transaction schemas
class TransactionInput(BaseModel):
    transaction_id: str = Field(..., description="Unique transaction identifier")
    user_id: str = Field(..., description="User identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    timestamp: datetime = Field(..., description="Transaction timestamp")
    location: str = Field(..., description="Transaction location")
    merchant: str = Field(..., description="Merchant name")
    merchant_category: str = Field(..., description="Merchant category")
    card_present: bool = Field(default=True, description="Whether card was physically present")
    device_fingerprint: str = Field(..., description="Device fingerprint")
    distance_from_home_km: float = Field(default=0.0, ge=0, description="Distance from home in km")
    transactions_last_hour: int = Field(default=1, ge=0, description="Number of transactions in last hour")
    hour_of_day: int = Field(default=12, ge=0, le=23, description="Hour of day (0-23)")
    day_of_week: int = Field(default=3, ge=0, le=6, description="Day of week (0-6, 0=Monday)")
    merchant_category_encoded: int = Field(default=0, ge=0, description="Encoded merchant category")
    device_known: bool = Field(default=True, description="Whether device is known")
    amount_vs_avg_ratio: float = Field(default=1.0, gt=0, description="Amount vs average ratio")
    is_foreign_transaction: bool = Field(default=False, description="Whether transaction is foreign")

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        if v > 1000000:  # $1M limit
            raise ValueError('Amount exceeds maximum limit')
        return v

class SHAPFeature(BaseModel):
    feature_name: str = Field(..., description="Human-readable feature name")
    value: float = Field(..., description="Feature value")
    impact: float = Field(..., description="SHAP impact value")

class AgentStep(BaseModel):
    agent: str = Field(..., description="Agent name")
    step: str = Field(..., description="Step description")
    timestamp: datetime = Field(..., description="Step timestamp")
    status: str = Field(..., description="Step status")
    execution_time_ms: int = Field(default=0, ge=0, description="Execution time in milliseconds")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Additional details")

class FraudAnalysisResult(BaseModel):
    transaction_id: str = Field(..., description="Transaction identifier")
    risk_score: float = Field(..., ge=0, le=1, description="Risk score (0-1)")
    verdict: VerdictEnum = Field(..., description="Final verdict")
    confidence: float = Field(..., ge=0, le=100, description="Confidence percentage")
    shap_features: List[SHAPFeature] = Field(default=[], description="SHAP feature explanations")
    anomalies: List[str] = Field(default=[], description="Detected anomalies")
    investigation_report: str = Field(..., description="AI investigation report")
    agent_steps: List[AgentStep] = Field(default=[], description="Agent execution steps")
    requires_human_review: bool = Field(default=False, description="Whether human review is required")
    processing_time_ms: int = Field(..., ge=0, description="Total processing time in milliseconds")
    user_profile: Optional[Dict[str, Any]] = Field(default=None, description="User profile data")
    recommendations: Optional[List[str]] = Field(default=[], description="Recommendations")

class TransactionResponse(BaseModel):
    success: bool = Field(..., description="Whether analysis was successful")
    data: Optional[FraudAnalysisResult] = Field(default=None, description="Analysis result")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")

# Email analysis schemas
class EmailAnalysisInput(BaseModel):
    sender_email: str = Field(..., description="Sender email address")
    subject: str = Field(..., description="Email subject line")
    body: str = Field(..., description="Email body content")

    @validator('sender_email')
    def validate_email(cls, v):
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('Invalid email format')
        return v

class EmailAnalysisResult(BaseModel):
    sender_email: str = Field(..., description="Sender email address")
    subject: str = Field(..., description="Email subject line")
    verdict: EmailVerdictEnum = Field(..., description="Phishing verdict")
    confidence: int = Field(..., ge=0, le=100, description="Confidence percentage")
    threat_level: ThreatLevelEnum = Field(..., description="Threat level")
    red_flags: List[str] = Field(default=[], description="Detected red flags")
    explanation: str = Field(..., description="AI explanation")
    urgency_tactics: bool = Field(default=False, description="Whether urgency tactics detected")
    impersonation_detected: bool = Field(default=False, description="Whether impersonation detected")
    suspicious_links_mentioned: bool = Field(default=False, description="Whether suspicious links detected")
    requests_sensitive_info: bool = Field(default=False, description="Whether sensitive info requested")

class EmailAnalysisResponse(BaseModel):
    success: bool = Field(..., description="Whether analysis was successful")
    data: Optional[EmailAnalysisResult] = Field(default=None, description="Analysis result")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")

# User schemas
class UserProfile(BaseModel):
    id: str = Field(..., description="User ID")
    full_name: Optional[str] = Field(default=None, description="Full name")
    organization: Optional[str] = Field(default=None, description="Organization")
    role: UserRoleEnum = Field(default=UserRoleEnum.ANALYST, description="User role")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

class UserCreate(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password")
    full_name: Optional[str] = Field(default=None, description="Full name")
    organization: Optional[str] = Field(default=None, description="Organization")

class UserLogin(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")

class UserResponse(BaseModel):
    success: bool = Field(..., description="Whether operation was successful")
    data: Optional[UserProfile] = Field(default=None, description="User data")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    token: Optional[str] = Field(default=None, description="Authentication token")

# Transaction query schemas
class TransactionQuery(BaseModel):
    limit: int = Field(default=100, ge=1, le=1000, description="Maximum number of results")
    offset: int = Field(default=0, ge=0, description="Number of results to skip")
    verdict: Optional[VerdictEnum] = Field(default=None, description="Filter by verdict")
    user_id: Optional[str] = Field(default=None, description="Filter by user ID")
    start_date: Optional[datetime] = Field(default=None, description="Filter by start date")
    end_date: Optional[datetime] = Field(default=None, description="Filter by end date")
    min_risk_score: Optional[float] = Field(default=None, ge=0, le=1, description="Minimum risk score")
    max_risk_score: Optional[float] = Field(default=None, ge=0, le=1, description="Maximum risk score")

class TransactionList(BaseModel):
    transactions: List[FraudAnalysisResult] = Field(..., description="List of transactions")
    total_count: int = Field(..., ge=0, description="Total number of transactions")
    has_more: bool = Field(..., description="Whether more results are available")

# System metrics schemas
class SystemMetrics(BaseModel):
    total_analyzed: int = Field(default=0, ge=0, description="Total transactions analyzed")
    total_fraud: int = Field(default=0, ge=0, description="Total fraud detected")
    total_suspicious: int = Field(default=0, ge=0, description="Total suspicious transactions")
    total_safe: int = Field(default=0, ge=0, description="Total safe transactions")
    total_emails_analyzed: int = Field(default=0, ge=0, description="Total emails analyzed")
    total_phishing_detected: int = Field(default=0, ge=0, description="Total phishing detected")
    model_auc_roc: float = Field(default=0.0, ge=0, le=1, description="Model AUC-ROC score")
    avg_processing_time_ms: int = Field(default=0, ge=0, description="Average processing time")
    last_updated: datetime = Field(..., description="Last update timestamp")

class MetricsResponse(BaseModel):
    success: bool = Field(..., description="Whether operation was successful")
    data: Optional[SystemMetrics] = Field(default=None, description="Metrics data")
    error: Optional[str] = Field(default=None, description="Error message if failed")

# Simulation schemas
class SimulationRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=100, description="Number of transactions to simulate")
    fraud_ratio: float = Field(default=0.3, ge=0, le=1, description="Ratio of fraudulent transactions")
    user_id: Optional[str] = Field(default=None, description="User ID for simulation")

class SimulationResponse(BaseModel):
    success: bool = Field(..., description="Whether simulation was successful")
    data: Optional[List[FraudAnalysisResult]] = Field(default=[], description="Simulated transactions")
    summary: Optional[Dict[str, Any]] = Field(default=None, description="Simulation summary")
    error: Optional[str] = Field(default=None, description="Error message if failed")

# CSV upload schemas
class CSVUploadResponse(BaseModel):
    success: bool = Field(..., description="Whether upload was successful")
    data: Optional[List[FraudAnalysisResult]] = Field(default=[], description="Analysis results")
    summary: Optional[Dict[str, Any]] = Field(default=None, description="Upload summary")
    error: Optional[str] = Field(default=None, description="Error message if failed")

# WebSocket schemas
class WebSocketMessage(BaseModel):
    type: str = Field(..., description="Message type")
    data: Dict[str, Any] = Field(..., description="Message data")
    timestamp: datetime = Field(default_factory=datetime.now, description="Message timestamp")

class AgentUpdate(BaseModel):
    agent: str = Field(..., description="Agent name")
    step: str = Field(..., description="Step description")
    timestamp: datetime = Field(..., description="Step timestamp")
    status: str = Field(..., description="Step status")
    execution_time_ms: int = Field(default=0, description="Execution time in ms")

# Review schemas
class TransactionReview(BaseModel):
    transaction_id: str = Field(..., description="Transaction ID")
    is_false_positive: bool = Field(..., description="Whether transaction is false positive")
    review_notes: Optional[str] = Field(default=None, description="Review notes")
    reviewer_confidence: int = Field(default=100, ge=0, le=100, description="Reviewer confidence")

class ReviewResponse(BaseModel):
    success: bool = Field(..., description="Whether review was successful")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Review data")
    error: Optional[str] = Field(default=None, description="Error message if failed")

# Health check schemas
class HealthCheck(BaseModel):
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(default_factory=datetime.now, description="Check timestamp")
    services: Dict[str, str] = Field(..., description="Service statuses")

class ErrorResponse(BaseModel):
    success: bool = Field(default=False, description="Whether operation was successful")
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(default=None, description="Error code")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
