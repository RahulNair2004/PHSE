"""
PERSONA RECONSTRUCTION SERVICE

Pipeline:

OSINT Data
    ↓
Normalization
    ↓
Stylometry Fingerprint
    ↓
Topic Modeling
    ↓
Embedding Representation
    ↓
LLM Behavioral Analysis
    ↓
Persona Profile Storage
"""

import json
import hashlib
import logging

from sqlalchemy.orm import Session

from database import models
from AI.stylometry_engine import StylometryEngine
from AI.embedding_engine import EmbeddingEngine
from AI.llm_engine import LLMEngine
from services.normalisation_service import process_user_osint

logger = logging.getLogger(__name__)

stylometry_engine = StylometryEngine()
embedding_engine = EmbeddingEngine()
llm_engine = LLMEngine()


# TOPIC EXTRACTION

def compute_topic_distribution(text_sources):
    topics = {}
    for text in text_sources:
        words = text.lower().split()
        for word in words:
            word = word.strip(".,!?()[]{}\"'")
            if len(word) < 4:
                continue
            topics[word] = topics.get(word, 0) + 1
    sorted_topics = dict(sorted(topics.items(), key=lambda x: x[1], reverse=True)[:20])
    return sorted_topics


# CONFIDENCE SCORE

def compute_confidence_score(text_corpus, stylometry_features):
    
    length_factor = min(len(text_corpus) / 5000, 1.0)
    richness = stylometry_features.get("vocabulary_richness", 0)
    confidence = (length_factor * 0.6) + (richness * 0.4)
    return round(confidence, 3)


# GENERATE PERSONA

def generate_persona_profile(db: Session, user_id: int):
    logger.info(f"Generating persona for user {user_id}")

    osint_result = process_user_osint(user_id)
    if not osint_result:
        raise ValueError("No OSINT data found")

    text_corpus = osint_result["text_corpus"]
    normalized_data = osint_result["normalized"]

    stylometry_features = stylometry_engine.get_full_style_profile(db, user_id)
    if not stylometry_features:
        raise ValueError("Stylometry analysis missing")

    style_vector = stylometry_engine.style_signature(db, user_id)
    topic_distribution = compute_topic_distribution(normalized_data.get("text_sources", []))
    persona_embedding = embedding_engine.embed_text(text_corpus)

    # Use robust LLMEngine generate_persona method

    persona_data = llm_engine.generate_persona(text_corpus, style_vector)

    confidence_score = compute_confidence_score(text_corpus, stylometry_features)
    source_hash = hashlib.sha256(text_corpus.encode()).hexdigest()

    # Store/update persona profile in DB
    
    existing = db.query(models.PersonaProfile).filter(models.PersonaProfile.user_id == user_id).first()
    if existing:
        existing.style_vector = style_vector
        existing.topic_distribution = topic_distribution
        existing.persona_embedding = persona_embedding
        existing.persona_json = persona_data
        existing.confidence_score = confidence_score
        existing.source_hash = source_hash
        db.commit()
        db.refresh(existing)
        return existing

    profile = models.PersonaProfile(
        user_id=user_id,
        style_vector=style_vector,
        topic_distribution=topic_distribution,
        persona_embedding=persona_embedding,
        persona_json=persona_data,
        confidence_score=confidence_score,
        source_hash=source_hash
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile