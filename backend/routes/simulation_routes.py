"""
SIMULATION ROUTES

Endpoints:

POST /simulate-attack
POST /simulate-all
GET /simulations/{user_id}
GET /simulation/{simulation_id}

Simulates:

• Phishing messages
• Social engineering attacks
• Job scams
• Credential reset scams
• Data request attacks
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from database import models, schemas
from services.simulation_service import SimulationEngine


router = APIRouter()

simulation_engine = SimulationEngine()


# SIMULATE SINGLE ATTACK

@router.post("/simulate-attack", response_model=schemas.SimulationResponse)
def simulate_attack(
    user_id: int,
    attack_type: str,
    db: Session = Depends(get_db)
):
    """
    Runs a single attack simulation.
    """

    # CHECK USER

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # FETCH PERSONA PROFILE

    persona_record = db.query(models.PersonaProfile).filter(
        models.PersonaProfile.user_id == user_id
    ).first()

    if not persona_record:
        raise HTTPException(
            status_code=400,
            detail="Persona profile not generated"
        )

    persona_json = persona_record.persona_json
    topic_distribution = persona_record.topic_distribution

    # RUN SIMULATION

    result = simulation_engine.simulate_attack(
        db=db,
        user_id=user_id,
        persona_json=persona_json,
        topic_distribution=topic_distribution,
        attack_type=attack_type
    )

    # STORE RESULT

    simulation = models.Simulation(

        user_id=user_id,

        generated_text=result["generated_message"],

        similarity_score=result["style_similarity"],

        psychological_score=result["style_similarity"],

        persuasion_index=result["semantic_similarity"],

        contextual_risk_weight=result["overall_realism_score"]
    )

    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    return simulation


# SIMULATE MULTIPLE ATTACKS

@router.post("/simulate-all")
def simulate_all_attacks(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Runs multiple attack scenarios.
    """

    # CHECK USER

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # GET PERSONA PROFILE

    persona_record = db.query(models.PersonaProfile).filter(
        models.PersonaProfile.user_id == user_id
    ).first()

    if not persona_record:
        raise HTTPException(
            status_code=400,
            detail="Persona profile not generated"
        )

    persona_json = persona_record.persona_json
    topic_distribution = persona_record.topic_distribution

    # RUN MULTIPLE ATTACKS

    results = simulation_engine.simulate_multiple_attacks(
        db=db,
        user_id=user_id,
        persona_json=persona_json,
        topic_distribution=topic_distribution
    )

    stored_simulations = []

    for r in results["simulations"]:

        sim = models.Simulation(

            user_id=user_id,

            generated_text=r["generated_message"],

            similarity_score=r["style_similarity"],

            psychological_score=r["style_similarity"],

            persuasion_index=r["semantic_similarity"],

            contextual_risk_weight=r["overall_realism_score"]
        )

        db.add(sim)
        stored_simulations.append(sim)

    db.commit()

    return {
        "user_id": user_id,
        "simulations_created": len(stored_simulations)
    }


# GET ALL SIMULATIONS

@router.get("/simulations/{user_id}", response_model=list[schemas.SimulationResponse])
def get_user_simulations(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns all simulations for a user.
    """

    simulations = db.query(models.Simulation).filter(
        models.Simulation.user_id == user_id
    ).all()

    return simulations


# GET SINGLE SIMULATION

@router.get("/simulation/{simulation_id}", response_model=schemas.SimulationResponse)
def get_simulation(
    simulation_id: int,
    db: Session = Depends(get_db)
):
    """
    Get one simulation record.
    """

    sim = db.query(models.Simulation).filter(
        models.Simulation.id == simulation_id
    ).first()

    if not sim:
        raise HTTPException(
            status_code=404,
            detail="Simulation not found"
        )

    return sim