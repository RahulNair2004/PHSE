"""
PERSONA ROUTES

Endpoints for:

• Generating digital persona
• Fetching persona profiles
"""


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database import models, schemas
from services.persona_service import generate_persona_profile

router = APIRouter()

@router.post("/generate/{user_id}", response_model=schemas.PersonaProfileResponse)
def generate_persona(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        persona = generate_persona_profile(db, user_id)
        return persona
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=schemas.PersonaProfileResponse)
def get_persona(user_id: int, db: Session = Depends(get_db)):
    persona = db.query(models.PersonaProfile).filter(models.PersonaProfile.user_id == user_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona profile not found")
    return persona

@router.post("/rebuild/{user_id}", response_model=schemas.PersonaProfileResponse)
def rebuild_persona(user_id: int, db: Session = Depends(get_db)):
    try:
        persona = generate_persona_profile(db, user_id)
        return persona
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
def delete_persona(user_id: int, db: Session = Depends(get_db)):
    persona = db.query(models.PersonaProfile).filter(models.PersonaProfile.user_id == user_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    db.delete(persona)
    db.commit()
    return {"message": "Persona deleted"}