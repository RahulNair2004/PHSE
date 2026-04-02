"""
MITIGATION SERVICE

Generates AI-driven mitigation reports using PHSE intelligence signals.

Features
• Personalized security advice
• Exposure reduction strategies
• Account lockdown recommendations
• LLM-generated mitigation report
"""
"""
MITIGATION SERVICE

Generates AI-driven mitigation reports using PHSE intelligence signals.

Features
• Personalized security advice
• Exposure reduction strategies
• Account lockdown recommendations
• LLM-generated mitigation report
"""

from sqlalchemy.orm import Session
from datetime import datetime

from database import models
from AI.llm_engine import LLMEngine

llm = LLMEngine()


def generate_mitigation_report(db: Session, user_id: int):

    risk = db.query(models.RiskScore).filter(
        models.RiskScore.user_id == user_id
    ).first()

    if not risk:
        raise Exception("Risk score not found")

    persona = db.query(models.PersonaProfile).filter(
        models.PersonaProfile.user_id == user_id
    ).first()

    # Build risk context
    risk_data = {
        "risk_score": risk.weighted_total,
        "risk_level": risk.risk_level,
        "osint_component": risk.osint_component,
        "persona_component": risk.persona_component,
        "stylometry_component": risk.stylometry_component,
        "simulation_component": risk.simulation_component
    }

    # Extract persona data safely from persona_json
    persona_data = None
    if persona and persona.persona_json:
        persona_data = {
            "traits": persona.persona_json.get("personality_traits", []),
            "interests": persona.persona_json.get("interests", []),
            "behavior_patterns": persona.persona_json.get("behavior_patterns", [])
        }

    # CALL AI MITIGATION ENGINE
    mitigation_ai = llm.generate_mitigation(
        risk_data=risk_data,
        persona_data=persona_data
    )

    risk_breakdown = {
        "osint": risk.osint_component,
        "persona": risk.persona_component,
        "stylometry": risk.stylometry_component,
        "simulation": risk.simulation_component
    }

    report = models.MitigationReport(
        user_id=user_id,
        summary=mitigation_ai.get("summary", ""),
        recommendations=mitigation_ai.get("recommendations", {}),
        priority_actions=mitigation_ai.get("priority_actions", {}),
        risk_breakdown=risk_breakdown,
        expected_risk_reduction=mitigation_ai.get("expected_risk_reduction", 0),
        generated_at=datetime.utcnow()
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def get_mitigation_report(db: Session, user_id: int):
    """
    Returns the mitigation report for a user.
    Generates a new one if none exists.
    """
    report = db.query(models.MitigationReport).filter(
        models.MitigationReport.user_id == user_id
    ).first()

    if not report:
        report = generate_mitigation_report(db, user_id)

    return report
