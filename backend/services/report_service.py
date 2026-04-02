"""
PHSE REPORT SERVICE

Generates the final Cybersecurity Intelligence Report.

Combines:
• User profile
• Risk intelligence score
• Persona reconstruction
• Adversarial simulation
• Mitigation recommendations

Outputs:
• Full JSON security report
• Downloadable PDF audit report
"""



from sqlalchemy.orm import Session
from datetime import datetime
import os

from database import models
from services.mitigation_service import get_mitigation_report
from services.visualization_service import (
    generate_risk_component_chart,
    generate_risk_history_heatmap,
    generate_category_breakdown_chart,
    save_figure_to_bytes
)

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Image
from reportlab.lib.utils import ImageReader

def build_security_report(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise Exception("User not found")

    risk = db.query(models.RiskScore).filter(models.RiskScore.user_id == user_id).first()
    persona = db.query(models.PersonaProfile).filter(models.PersonaProfile.user_id == user_id).first()
    simulation = db.query(models.Simulation).filter(models.Simulation.user_id == user_id).first()
    mitigation = get_mitigation_report(db, user_id)

    # Extract persona traits safely from persona_json
    persona_data = persona.persona_json if persona and persona.persona_json else {}
    traits = persona_data.get("personality_traits", [])
    interests = persona_data.get("interests", [])
    behavior_patterns = persona_data.get("behavior_patterns", [])

    report = {
        "generated_at": str(datetime.utcnow()),
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "risk_assessment": {
            "score": risk.weighted_total if risk else 0,
            "risk_level": risk.risk_level if risk else "N/A",
            "osint_component": risk.osint_component if risk else 0,
            "persona_component": risk.persona_component if risk else 0,
            "stylometry_component": risk.stylometry_component if risk else 0,
            "simulation_component": risk.simulation_component if risk else 0,
        },
        "persona_analysis": {
            "traits": traits,
            "interests": interests,
            "behavior_patterns": behavior_patterns,
        },
        "attack_simulation": {
            "phishing_success_rate": getattr(simulation, "phishing_success_rate", 0),
            "impersonation_risk": getattr(simulation, "impersonation_risk", 0),
            "data_request_risk": getattr(simulation, "data_request_risk", 0),
        },
        "mitigation": {
            "summary": mitigation.summary if mitigation else "No recommendations available.",
            "recommendations": mitigation.recommendations if mitigation else [],
            "priority_actions": mitigation.priority_actions if mitigation else [],
            "expected_risk_reduction": mitigation.expected_risk_reduction if mitigation else 0
        },
        "risk_components_chart": {
            "OSINT": risk.osint_component if risk else 0,
            "Persona": risk.persona_component if risk else 0,
            "Stylometry": risk.stylometry_component if risk else 0,
            "Simulation": risk.simulation_component if risk else 0
        },
        "risk_history_chart": [
            {"date": r.recorded_at.strftime("%Y-%m-%d"), "total_risk": r.total_risk}
            for r in db.query(models.RiskHistory)
                       .filter(models.RiskHistory.user_id == user_id)
                       .order_by(models.RiskHistory.recorded_at.asc())
                       .all()
        ],
        "category_breakdown_chart": {
            "OSINT": 0.25,
            "Persona": 0.25,
            "Stylometry": 0.25,
            "Simulation": 0.25
        }
    }

    return report


def export_security_report_pdf(report: dict, file_path: str):
    """
    Export the security report JSON as a PDF with tables and charts.
    """

    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("PHSE Cybersecurity Intelligence Audit", styles["Title"]))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Report Generated: {report['generated_at']}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # User Section
    elements.append(Paragraph("User Information", styles["Heading2"]))
    user = report["user"]
    elements.append(Paragraph(f"User ID: {user['id']}", styles["Normal"]))
    elements.append(Paragraph(f"Name: {user['name']}", styles["Normal"]))
    elements.append(Paragraph(f"Email: {user['email']}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # Risk Section
    elements.append(Paragraph("Risk Intelligence Assessment", styles["Heading2"]))
    risk = report["risk_assessment"]
    risk_table = [
        ["Metric", "Score"],
        ["Total Risk", f"{risk['score']:.2f}"],
        ["Risk Level", risk['risk_level']],
        ["OSINT Exposure", f"{risk['osint_component']:.2f}"],
        ["Persona Risk", f"{risk['persona_component']:.2f}"],
        ["Stylometry Risk", f"{risk['stylometry_component']:.2f}"],
        ["Simulation Risk", f"{risk['simulation_component']:.2f}"]
    ]
    elements.append(Table(risk_table))
    elements.append(Spacer(1, 20))

    # Persona Section
    elements.append(Paragraph("Persona Reconstruction Analysis", styles["Heading2"]))
    persona = report["persona_analysis"]
    elements.append(Paragraph("Personality Traits: " + ", ".join(persona["traits"]), styles["Normal"]))
    elements.append(Paragraph("Interests: " + ", ".join(persona["interests"]), styles["Normal"]))
    elements.append(Paragraph("Behavior Patterns: " + ", ".join(persona["behavior_patterns"]), styles["Normal"]))
    elements.append(Spacer(1, 20))

    # Simulation / Attack Section
    elements.append(Paragraph("Adversarial Attack Simulation", styles["Heading2"]))
    sim = report["attack_simulation"]
    sim_table = [
        ["Metric", "Value"],
        ["Phishing Success Rate", f"{sim.get('phishing_success_rate', 0):.2f}"],
        ["Impersonation Risk", f"{sim.get('impersonation_risk', 0):.2f}"],
        ["Data Request Risk", f"{sim.get('data_request_risk', 0):.2f}"]
    ]
    elements.append(Table(sim_table))
    elements.append(Spacer(1, 20))

    # Mitigation Section
    elements.append(Paragraph("Mitigation Intelligence", styles["Heading2"]))
    mitigation = report["mitigation"]
    elements.append(Paragraph(mitigation["summary"], styles["Normal"]))
    elements.append(Spacer(1, 10))

    # Recommended Actions
    elements.append(Paragraph("Recommended Actions", styles["Heading3"]))
    for key, recs in mitigation["recommendations"].items():
        elements.append(Paragraph(f"{key.replace('_', ' ').title()}:", styles["Normal"]))
        for rec in recs:
            elements.append(Paragraph(f"- {rec}", styles["Normal"]))
        elements.append(Spacer(1, 5))

    # Priority Actions
    elements.append(Paragraph("Priority Security Actions", styles["Heading3"]))
    for action in mitigation["priority_actions"]:
        elements.append(Paragraph(f"- {action}", styles["Normal"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"Expected Risk Reduction: {mitigation['expected_risk_reduction']:.2f}", styles["Normal"]))
    elements.append(Spacer(1, 20))


    # Visualization Charts
    for chart_name, chart_data in [
        ("Risk Components", report.get("risk_components_chart", {})),
        ("Risk History Heatmap", report.get("risk_history_chart", [])),
        ("Category Breakdown", report.get("category_breakdown_chart", {}))
    ]:
        if chart_data:
            if chart_name == "Risk Components":
                fig = generate_risk_component_chart(chart_data)
            elif chart_name == "Risk History Heatmap":
                fig = generate_risk_history_heatmap(chart_data)
            else:
                fig = generate_category_breakdown_chart(chart_data)

            buf = save_figure_to_bytes(fig)
            # Correctly pass BytesIO to Image via ImageReader
            elements.append(Image(buf, width=400, height=200))
            elements.append(Spacer(1, 20))

    # Build PDF
    pdf_doc = SimpleDocTemplate(file_path, pagesize=letter)
    pdf_doc.build(elements)
    return file_path