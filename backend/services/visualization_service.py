""" Creates:

Risk graphs

Exposure heatmaps

Category breakdown

Could generate:

JSON chart data

PDF-ready visual elements """


import io
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from typing import Dict, Any, List
from matplotlib.figure import Figure
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

sns.set(style="whitegrid")


def generate_risk_component_chart(risk_data: Dict[str, float]) -> Figure:
    components = list(risk_data.keys())
    values = list(risk_data.values())

    fig, ax = plt.subplots(figsize=(6, 4))
    bars = ax.bar(components, values, color=["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"])
    ax.set_ylim(0, 1)
    ax.set_ylabel("Normalized Score")
    ax.set_title("Risk Component Breakdown")

    for bar in bars:
        ax.annotate(f"{bar.get_height():.2f}", xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom')

    fig.tight_layout()
    return fig


def generate_risk_history_heatmap(history_data: List[Dict[str, Any]]) -> Figure:
    if not history_data:
        return plt.figure()  # Return empty figure if no data

    df = pd.DataFrame(history_data)
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)

    fig, ax = plt.subplots(figsize=(8, 2))
    sns.heatmap(df.T, annot=True, cmap="Reds", cbar=True, ax=ax, linewidths=.5)
    ax.set_title("Risk History Heatmap")
    ax.set_ylabel("Total Risk")
    ax.set_xlabel("Date")
    fig.tight_layout()
    return fig


def generate_category_breakdown_chart(breakdown_data: Dict[str, float]) -> Figure:
    if not breakdown_data:
        return plt.figure()  # Return empty figure if no data

    labels = list(breakdown_data.keys())
    sizes = list(breakdown_data.values())

    fig, ax = plt.subplots(figsize=(5, 5))
    ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140,
           colors=["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"])
    ax.set_title("Risk Category Breakdown")
    fig.tight_layout()
    return fig


def save_figure_to_bytes(fig: Figure) -> io.BytesIO:
    buf = io.BytesIO()
    fig.savefig(buf, format='PNG', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return buf


def generate_report_pdf(report_data: Dict[str, Any], output_path: str):
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    y_pos = height - 50

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y_pos, f"PHSE Security Audit Report for {report_data.get('user', {}).get('name', 'User')}")
    y_pos -= 30

    c.setFont("Helvetica", 12)
    c.drawString(50, y_pos, f"Overall Risk Score: {report_data.get('risk_assessment', {}).get('score', 0):.2f} "
                             f"({report_data.get('risk_assessment', {}).get('risk_level', 'N/A')})")
    y_pos -= 40

    # Risk Component Chart
    fig = generate_risk_component_chart(report_data.get("risk_components_chart", {}))
    buf = save_figure_to_bytes(fig)
    c.drawImage(ImageReader(buf), 50, y_pos - 200, width=500, height=200)
    y_pos -= 220

    # Risk History Heatmap
    fig = generate_risk_history_heatmap(report_data.get("risk_history_chart", []))
    buf = save_figure_to_bytes(fig)
    c.drawImage(ImageReader(buf), 50, y_pos - 100, width=500, height=100)
    y_pos -= 120

    # Category Breakdown Pie
    fig = generate_category_breakdown_chart(report_data.get("category_breakdown_chart", {}))
    buf = save_figure_to_bytes(fig)
    c.drawImage(ImageReader(buf), 200, y_pos - 200, width=200, height=200)
    y_pos -= 220

    # Mitigation summary
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_pos, "Mitigation Summary")
    y_pos -= 20

    c.setFont("Helvetica", 12)
    mitigation_text = report_data.get("mitigation", {}).get("summary", "No recommendations available.")
    for line in mitigation_text.split("\n"):
        c.drawString(50, y_pos, line)
        y_pos -= 15

    c.save()
    return output_path


def generate_chart_data_json(report_data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "risk_components": report_data.get("risk_components_chart", {}),
        "risk_history": report_data.get("risk_history_chart", []),
        "category_breakdown": report_data.get("category_breakdown_chart", {}),
    }
