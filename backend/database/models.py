from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from .db import Base


# USER MODEL

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    osint_data = relationship("OSINTData", back_populates="user")
    persona_profile = relationship("PersonaProfile", back_populates="user", uselist=False)
    stylometry_analysis = relationship("StylometryAnalysis", back_populates="user", uselist=False)
    simulations = relationship("Simulation", back_populates="user")
    risk_score = relationship("RiskScore", back_populates="user", uselist=False)
    mitigation_report = relationship("MitigationReport", back_populates="user", uselist=False)
    risk_history = relationship("RiskHistory", back_populates="user")


# OSINT DATA MODEL 

class OSINTData(Base):
    __tablename__ = "osint_data"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    source = Column(String, nullable=False)
    data_type = Column(String, nullable=False)

    profile_url = Column(String)   
    scan_type = Column(String, default="profile") 

    content = Column(Text, nullable=False)

    email_exposure_score = Column(Float, default=0.0)
    social_exposure_score = Column(Float, default=0.0)
    domain_exposure_score = Column(Float, default=0.0)
    breach_count = Column(Integer, default=0)
    normalized_risk = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="osint_data")

# PERSONA PROFILE MODEL 


class PersonaProfile(Base):
    __tablename__ = "persona_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    style_vector = Column(JSONB, nullable=False)
    topic_distribution = Column(JSONB, nullable=False)
    persona_embedding = Column(JSONB, nullable=False)

    confidence_score = Column(Float, default=0.0)
    source_hash = Column(String, nullable=False)

    # NEW: LLM-generated persona summary
    persona_json = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="persona_profile")

# STYLOMETRY ANALYSIS 

class StylometryAnalysis(Base):
    __tablename__ = "stylometry_analysis"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    avg_sentence_length = Column(Float)
    vocabulary_richness = Column(Float)
    punctuation_density = Column(Float)
    sentiment_score = Column(Float)
    entropy_score = Column(Float)

    stylometry_risk = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="stylometry_analysis")


# SIMULATION MODEL


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    generated_text = Column(Text, nullable=False)
    similarity_score = Column(Float)

    psychological_score = Column(Float)
    persuasion_index = Column(Float)
    contextual_risk_weight = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="simulations")


# RISK SCORE MODEL

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    osint_component = Column(Float)
    persona_component = Column(Float)
    stylometry_component = Column(Float)
    simulation_component = Column(Float)

    weighted_total = Column(Float)
    risk_level = Column(String)
    risk_percentile = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="risk_score")


# MITIGATION REPORT

class MitigationReport(Base):
    __tablename__ = "mitigation_reports"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    summary = Column(Text)
    recommendations = Column(JSONB)
    risk_breakdown = Column(JSONB)

    priority_actions = Column(JSONB)
    expected_risk_reduction = Column(Float)

    generated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mitigation_report")

    
# RISK HISTORY Model

class RiskHistory(Base):
    __tablename__ = "risk_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    total_risk = Column(Float)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="risk_history")