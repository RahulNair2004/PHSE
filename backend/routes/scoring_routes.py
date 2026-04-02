from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from database import models, schemas
from services.scoring_service import compute_risk_score

router = APIRouter()

# CALCULATE FINAL RISK SCORE
@router.get("/{user_id}", response_model=schemas.RiskScoreResponse)
def calculate_risk_score(user_id: int, db: Session = Depends(get_db)):
    """
    Calculates and stores the final cybersecurity risk score for a user.

    Aggregates risk from:
    - OSINT Exposure
    - Persona Reconstruction
    - Stylometry Analysis
    - Adversarial Simulation
    """
    # Compute and store risk score
    compute_risk_score(db, user_id)

    # Retrieve stored risk score
    risk_record = db.query(models.RiskScore).filter(models.RiskScore.user_id == user_id).first()
    if not risk_record:
        raise HTTPException(status_code=404, detail="Risk score not generated")

    return risk_record

# GET CURRENT RISK SCORE
@router.get("/current/{user_id}", response_model=schemas.RiskScoreResponse)
def get_current_risk(user_id: int, db: Session = Depends(get_db)):
    """
    Returns the latest stored risk score for a user without recalculation.
    """
    risk = db.query(models.RiskScore).filter(models.RiskScore.user_id == user_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk score not found")

    return risk

# GET RISK HISTORY
@router.get("/history/{user_id}", response_model=List[schemas.RiskHistoryResponse])
def get_risk_history(user_id: int, db: Session = Depends(get_db)):
    """
    Returns historical risk scores for timeline analysis.
    Useful for dashboards, trends, and audit reports.
    """
    history = (
        db.query(models.RiskHistory)
        .filter(models.RiskHistory.user_id == user_id)
        .order_by(models.RiskHistory.recorded_at.desc())
        .all()
    )
    if not history:
        raise HTTPException(status_code=404, detail="No risk history found")

    return history
