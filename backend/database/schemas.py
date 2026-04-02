from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from pydantic import HttpUrl

# USER SCHEMAS

class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


# OSINT DATA SCHEMAS
class OSINTDataCreate(BaseModel):
    user_id: int
    source: str
    data_type: str
    content: str

class OSINTDataResponse(BaseModel):
    id: int
    user_id: int
    source: str
    data_type: str
    content: str
    email_exposure_score: Optional[float]
    social_exposure_score: Optional[float]
    domain_exposure_score: Optional[float]
    breach_count: Optional[int]
    normalized_risk: Optional[float]
    profile_url: Optional[str]
    scan_type: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

class ProfileScanCreate(BaseModel):
    user_id: int

    # social profiles
    github: Optional[HttpUrl] = None
    reddit: Optional[HttpUrl] = None
    twitter: Optional[HttpUrl] = None

    # generic targets
    targets: Optional[List[str]] = None

    
# PERSONA PROFILE SCHEMAS

class PersonaProfileCreate(BaseModel):
    user_id: int
    style_vector: Optional[List[float]] = None
    topic_distribution: Optional[Dict[str, float]] = None


class PersonaProfileResponse(BaseModel):
    id: int
    user_id: int

    style_vector: Optional[List[float]]
    topic_distribution: Optional[Dict[str, float]]

    confidence_score: Optional[float]
    persona_embedding: Optional[List[float]]
    source_hash: Optional[str]
    persona_json: Optional[dict] = None 

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# STYLOMETRY SCHEMAS 

class StylometryResponse(BaseModel):
    avg_sentence_length: Optional[float]
    vocabulary_richness: Optional[float]
    punctuation_density: Optional[float]
    sentiment_score: Optional[float]
    entropy_score: Optional[float]
    stylometry_risk: Optional[float]

    model_config = {"from_attributes": True}


# SIMULATION SCHEMAS 

class SimulationCreate(BaseModel):
    user_id: int
    generated_text: str


class SimulationResponse(BaseModel):
    id: int
    user_id: int
    generated_text: str

    similarity_score: Optional[float]
    psychological_score: Optional[float]
    persuasion_index: Optional[float]
    contextual_risk_weight: Optional[float]

    created_at: datetime

    model_config = {"from_attributes": True}


# RISK SCORE SCHEMAS 

class RiskScoreResponse(BaseModel):
    id: int
    user_id: int

    osint_component: Optional[float]
    persona_component: Optional[float]
    stylometry_component: Optional[float]
    simulation_component: Optional[float]

    weighted_total: Optional[float]
    risk_level: Optional[str]
    risk_percentile: Optional[float]

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# MITIGATION REPORT SCHEMAS 

class MitigationReportResponse(BaseModel):
    id: int
    user_id: int

    summary: Optional[str]
    recommendations: Optional[Dict]
    risk_breakdown: Optional[Dict]

    priority_actions: Optional[Dict]
    expected_risk_reduction: Optional[float]

    generated_at: datetime

    model_config = {"from_attributes": True}

# RISK HISTORY SCHEMA 

class RiskHistoryResponse(BaseModel):
    total_risk: float
    recorded_at: datetime

    model_config = {"from_attributes": True}