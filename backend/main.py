"""
PHSE RISK INTELLIGENCE API

Main FastAPI Application

Handles:
• User Management
• OSINT Collection
• Persona Reconstruction
• Attack Simulation
• Risk Intelligence Scoring
• Security Reports & Audit PDFs
"""

import asyncio
import sys
from fastapi import FastAPI
from dotenv import load_dotenv

from database.db import engine
from database import models

# Routers
from routes import (
    user_routes,
    osint_routes,
    persona_routes,
    simulation_routes,
    scoring_routes,
    report_routes
)

# Fix for Windows async event loop
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Load environment variables
load_dotenv()

# DATABASE INITIALIZATION
models.Base.metadata.create_all(bind=engine)

# FASTAPI APPLICATION
app = FastAPI(
    title="PHSE Risk Intelligence API",
    description="OSINT-driven Persona Reconstruction and Cyber Intelligence Platform",
    version="1.3"
)

# ROUTER REGISTRATION

# USER MANAGEMENT
app.include_router(user_routes.router, prefix="/users", tags=["Users"])

# OSINT DATA COLLECTION
app.include_router(osint_routes.router, prefix="/osint", tags=["OSINT"])

# PERSONA RECONSTRUCTION
app.include_router(persona_routes.router, prefix="/persona", tags=["Persona"])

# ATTACK SIMULATION
app.include_router(simulation_routes.router, prefix="/simulation", tags=["Simulation"])

# RISK INTELLIGENCE ENGINE (single, consolidated prefix)
app.include_router(scoring_routes.router, prefix="/risk-score", tags=["Risk Intelligence"])

# SECURITY REPORTS & AUDIT PDF
app.include_router(report_routes.router, prefix="/reports", tags=["Security Reports"])

# ROOT HEALTH CHECK

@app.get("/")
def root():
    return {
        "message": "PHSE Risk Intelligence API Running",
        "platform": "Persona-based Cyber Intelligence Engine",
        "modules": [
            "User Management",
            "OSINT Collection",
            "Persona Reconstruction",
            "Attack Simulation",
            "Risk Intelligence Scoring",
            "Security Reports & PDF Export"
        ],
        "status": "operational"
    }

# SYSTEM HEALTH CHECK

@app.get("/health")
def health_check():
    return {
        "system": "PHSE",
        "status": "healthy",
        "database": "connected",
        "modules_loaded": [
            "users",
            "osint",
            "persona",
            "simulation",
            "risk_scoring",
            "security_reports"
        ]
    }
