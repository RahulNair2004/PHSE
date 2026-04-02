""" Implements:

Risk formula

Weighted scoring

Exposure normalization

Uses:

ML-based adjustments """



from sqlalchemy.orm import Session
from datetime import datetime
import numpy as np

from database import models,schemas

# WEIGHTS FOR EACH COMPONENT

OSINT_WEIGHT = 0.35
PERSONA_WEIGHT = 0.25
STYLOMETRY_WEIGHT = 0.20
SIMULATION_WEIGHT = 0.20


# OSINT RISK COMPONENT

def compute_osint_component(db: Session, user_id: int):

    osint_records = db.query(models.OSINTData).filter(models.OSINTData.user_id == user_id).all()

    if not osint_records:
        return 0.0

    email_scores = []
    social_scores = []
    domain_scores = []
    breach_scores = []

    for r in osint_records:

        if r.email_exposure_score:
            email_scores.append(r.email_exposure_score)

        if r.social_exposure_score:
            social_scores.append(r.social_exposure_score)

        if r.domain_exposure_score:
            domain_scores.append(r.domain_exposure_score)

        if r.breach_count:
            breach_scores.append(min(r.breach_count * 0.1, 1.0))

    scores = []

    if email_scores:
        scores.append(np.mean(email_scores))

    if social_scores:
        scores.append(np.mean(social_scores))

    if domain_scores:
        scores.append(np.mean(domain_scores))

    if breach_scores:
        scores.append(np.mean(breach_scores))

    if not scores:
        return 0.0

    return float(np.mean(scores))


# PERSONA RISK COMPONENT

def compute_persona_component(db: Session, user_id: int):

    persona = db.query(models.PersonaProfile).filter(models.PersonaProfile.user_id == user_id).first()

    if not persona:
        return 0.0

    risk = 0.0

    if persona.confidence_score:
        risk += persona.confidence_score * 0.5

    if persona.persona_embedding:
        risk += min(len(persona.persona_embedding) / 100, 1.0) * 0.5

    return float(min(risk, 1.0))


# STYLOMETRY RISK COMPONENT

def compute_stylometry_component(db: Session, user_id: int):

    persona = db.query(models.PersonaProfile).filter(models.PersonaProfile.user_id == user_id).first()

    if not persona or not persona.style_vector:
        return 0.0

    style = persona.style_vector

    avg_sentence = style[0] if len(style) > 0 else 0
    vocab_richness = style[1] if len(style) > 1 else 0
    punctuation_density = style[2] if len(style) > 2 else 0
    sentiment = style[3] if len(style) > 3 else 0
    entropy = style[4] if len(style) > 4 else 0

    score = (
        (avg_sentence / 30) * 0.2 +
        vocab_richness * 0.3 +
        punctuation_density * 0.2 +
        abs(sentiment) * 0.1 +
        (entropy / 10) * 0.2
    )

    return float(min(score, 1.0))


# SIMULATION RISK COMPONENT

def compute_simulation_component(db: Session, user_id: int):

    sims = db.query(models.Simulation).filter(models.Simulation.user_id == user_id).all()

    if not sims:
        return 0.0

    similarity_scores = []
    persuasion_scores = []
    psychological_scores = []

    for s in sims:

        if s.similarity_score:
            similarity_scores.append(s.similarity_score)

        if s.persuasion_index:
            persuasion_scores.append(s.persuasion_index)

        if s.psychological_score:
            psychological_scores.append(s.psychological_score)

    scores = []

    if similarity_scores:
        scores.append(np.mean(similarity_scores))

    if persuasion_scores:
        scores.append(np.mean(persuasion_scores))

    if psychological_scores:
        scores.append(np.mean(psychological_scores))

    if not scores:
        return 0.0

    return float(np.mean(scores))


# RISK LEVEL CLASSIFICATION

def classify_risk_level(score):

    if score < 0.25:
        return "LOW"

    if score < 0.50:
        return "MODERATE"

    if score < 0.75:
        return "HIGH"

    return "CRITICAL"


# RISK PERCENTILE

def compute_percentile(db: Session, score):

    scores = db.query(models.RiskScore.weighted_total).all()

    if not scores:
        return 100.0

    arr = np.array([s[0] for s in scores if s[0] is not None])

    if len(arr) == 0:
        return 100.0

    percentile = (np.sum(arr <= score) / len(arr)) * 100

    return float(percentile)


# MAIN RISK SCORING PIPELINE

def compute_risk_score(db: Session, user_id: int):

    osint = compute_osint_component(db, user_id)
    persona = compute_persona_component(db, user_id)
    stylometry = compute_stylometry_component(db, user_id)
    simulation = compute_simulation_component(db, user_id)

    weighted_total = (
        osint * OSINT_WEIGHT +
        persona * PERSONA_WEIGHT +
        stylometry * STYLOMETRY_WEIGHT +
        simulation * SIMULATION_WEIGHT
    )

    weighted_total = float(min(weighted_total, 1.0))

    risk_level = classify_risk_level(weighted_total)

    percentile = compute_percentile(db, weighted_total)

    existing = db.query(models.RiskScore).filter(models.RiskScore.user_id == user_id).first()

    if existing:

        existing.osint_component = osint
        existing.persona_component = persona
        existing.stylometry_component = stylometry
        existing.simulation_component = simulation
        existing.weighted_total = weighted_total
        existing.risk_level = risk_level
        existing.risk_percentile = percentile
        existing.updated_at = datetime.utcnow()

        db.add(existing)

    else:

        new_score = models.RiskScore(
            user_id=user_id,
            osint_component=osint,
            persona_component=persona,
            stylometry_component=stylometry,
            simulation_component=simulation,
            weighted_total=weighted_total,
            risk_level=risk_level,
            risk_percentile=percentile
        )

        db.add(new_score)

    # STORE HISTORY

    history = models.RiskHistory(
        user_id=user_id,
        total_risk=weighted_total
    )

    db.add(history)

    db.commit()

    return {
        "osint_component": osint,
        "persona_component": persona,
        "stylometry_component": stylometry,
        "simulation_component": simulation,
        "weighted_total": weighted_total,
        "risk_level": risk_level,
        "risk_percentile": percentile
    }
