"""
STYLOMETRY ENGINE

AI layer interface for stylometry features.

Consumes results from:
services/style_analysis_service.py

Responsibilities:

1. Ensure stylometry analysis exists
2. Fetch latest stylometry record
3. Convert features → style vector
4. Provide additional signals for AI reasoning

Used by:
- persona_service
- simulation_service
- impersonation detection
"""

from sqlalchemy.orm import Session
from typing import Dict, Optional, List

from database import models

# Import pipeline
from services.style_analysis_service import run_style_analysis_pipeline


class StylometryEngine:

    # ENSURE STYLOMETRY EXISTS
    
    @staticmethod
    def ensure_analysis_exists(db: Session, user_id: int):
        """
        Ensures stylometry analysis exists in DB.
        Runs pipeline if missing.
        """

        record = (
            db.query(models.StylometryAnalysis)
            .filter(models.StylometryAnalysis.user_id == user_id)
            .order_by(models.StylometryAnalysis.created_at.desc())
            .first()
        )

        if record:
            return record

        # run stylometry pipeline
        run_style_analysis_pipeline(db, user_id)

        record = (
            db.query(models.StylometryAnalysis)
            .filter(models.StylometryAnalysis.user_id == user_id)
            .order_by(models.StylometryAnalysis.created_at.desc())
            .first()
        )

        return record

    # BUILD STYLE VECTOR
    
    @staticmethod
    def build_style_vector(db: Session, user_id: int) -> Optional[Dict]:
        """
        Returns stylometry vector used by AI modules.
        """

        record = StylometryEngine.ensure_analysis_exists(db, user_id)

        if not record:
            return None

        style_vector = {

            "avg_sentence_length": record.avg_sentence_length,
            "vocabulary_richness": record.vocabulary_richness,
            "punctuation_density": record.punctuation_density,
            "sentiment_score": record.sentiment_score,
            "entropy_score": record.entropy_score,
            "stylometry_risk": record.stylometry_risk
        }

        return style_vector

    # STYLE SIGNATURE 
    
    @staticmethod
    def style_signature(db: Session, user_id: int) -> Optional[List[float]]:
        """
        Returns numeric vector representation.
        Useful for ML models or similarity search.
        """

        record = StylometryEngine.ensure_analysis_exists(db, user_id)

        if not record:
            return None

        signature = [

            float(record.avg_sentence_length or 0),
            float(record.vocabulary_richness or 0),
            float(record.punctuation_density or 0),
            float(record.sentiment_score or 0),
            float(record.entropy_score or 0)
        ]

        return signature

    # IMPERSONATION RISK SIGNAL
    
    @staticmethod
    def impersonation_risk(db: Session, user_id: int) -> float:
        """
        Returns stylometry impersonation risk score.
        """

        record = StylometryEngine.ensure_analysis_exists(db, user_id)

        if not record:
            return 0.0

        return float(record.stylometry_risk or 0)

    # FULL PROFILE
    
    @staticmethod
    def get_full_style_profile(db: Session, user_id: int) -> Optional[Dict]:
        """
        Returns full stylometry profile.

        Used when building prompts for persona generation.
        """

        record = StylometryEngine.ensure_analysis_exists(db, user_id)

        if not record:
            return None

        profile = {

            "avg_sentence_length": record.avg_sentence_length,
            "vocabulary_richness": record.vocabulary_richness,
            "punctuation_density": record.punctuation_density,
            "sentiment_score": record.sentiment_score,
            "entropy_score": record.entropy_score,
            "stylometry_risk": record.stylometry_risk
        }

        return profile

    # GENERATE FINGERPRINT
    
    @staticmethod
    def generate_fingerprint(db: Session, user_id: int) -> Optional[Dict]:
        """
        Alias used by persona service.

        Returns stylometry fingerprint used in
        persona reconstruction.
        """

        record = StylometryEngine.ensure_analysis_exists(db, user_id)

        if not record:
            return None

        fingerprint = {

            "avg_sentence_length": record.avg_sentence_length,
            "vocabulary_richness": record.vocabulary_richness,
            "punctuation_density": record.punctuation_density,
            "sentiment_score": record.sentiment_score,
            "entropy_score": record.entropy_score
        }

        return fingerprint