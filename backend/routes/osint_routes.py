"""
Endpoints:
POST /scan
GET /scan/{id}
GET /user/{user_id}
POST /scan/profile

Triggers:
OSINT scraping
Data aggregation
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import models, schemas
from database.db import get_db
from services.osint_services import run_osint_scan, run_simple_scrape

router = APIRouter()

# POST /scan
@router.post("/scan", response_model=schemas.OSINTDataResponse)
async def trigger_scan(
    payload: schemas.OSINTDataCreate, 
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == payload.user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found"
        )
    
    result = await run_simple_scrape(
        user_id=payload.user_id, 
        url=payload.content, 
        db=db
    )
    if not result:
        raise HTTPException(
            status_code=400, detail="Scraping failed or content too small"
        )
    
    return result

# GET /scan/{id}
@router.get("/scan/{scan_id}", response_model=schemas.OSINTDataResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.OSINTData).filter(
        models.OSINTData.id == scan_id
    ).first()
    if not scan:
        raise HTTPException(
            status_code=404, detail="Scan not found"
        )
    return scan

# GET USER SCANS
@router.get("/user/{user_id}", response_model=List[schemas.OSINTDataResponse])
def get_user_scans(user_id: int, db: Session = Depends(get_db)):
    scans = db.query(models.OSINTData).filter(
        models.OSINTData.user_id == user_id
    ).all()
    return scans

# POST /scan/profile
@router.post("/scan/profile", response_model=schemas.OSINTDataResponse)
async def scan_profile(
    payload: schemas.ProfileScanCreate, 
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == payload.user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found"
        )
    
    result = await run_osint_scan(payload, db)
    if not result:
        raise HTTPException(
            status_code=400, detail="OSINT scan failed"
        )
    
    return result
