"""
Endpoints:

GET /reports/{user_id}     → Generate full JSON security report
POST /reports/export-pdf   → Export latest security report as PDF
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Dict
import os

from database import models
from database.db import get_db
from services.report_service import build_security_report, export_security_report_pdf

router = APIRouter()


# PDF export request schema
class PDFExportRequest(BaseModel):
    user_id: int


# GET /reports/{user_id}
@router.get("/{user_id}", response_model=Dict)
def get_security_report(user_id: int, db: Session = Depends(get_db)):
    """
    Generate a complete security report for a user.
    Includes:
    - User profile
    - Risk assessment
    - Persona analysis
    - Attack simulation
    - Mitigation recommendations
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        report = build_security_report(db, user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Report build failed: {str(e)}")

    return report


# POST /reports/export-pdf
@router.post("/export-pdf")
def export_pdf(payload: PDFExportRequest, db: Session = Depends(get_db)):
    """
    Exports the latest security audit report for a user as a PDF.
    Returns the PDF file path.
    """
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Build report data for PDF
    try:
        report_data = build_security_report(db, payload.user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Report build failed: {str(e)}")

    # Generate PDF file path
    pdf_dir = os.getenv("PDF_OUTPUT_DIR", "generated_reports")
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(
        pdf_dir,
        f"user_{payload.user_id}_audit_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
    )

    # Export PDF via service
    try:
        export_security_report_pdf(report_data, pdf_path)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"PDF generation failed: {str(e)}")

    return {
        "message": "PDF generated successfully",
        "file_path": pdf_path
    }