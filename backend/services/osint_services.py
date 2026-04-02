"""
OSINT SERVICES

Handles:
- Public data aggregation
- Social profile scraping
- Domain/IP intelligence lookups
"""

import os
import re
import json
import requests
from typing import Dict
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import models
from services.scraping_services import scrape_and_store

load_dotenv()

VT_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY")


# Helpers

def is_ip(target: str) -> bool:
    return re.match(r"^\d{1,3}(\.\d{1,3}){3}$", target) is not None


def is_domain(target: str) -> bool:
    return "." in target and not is_ip(target)


# SIMPLE SCRAPE

async def run_simple_scrape(user_id: int, url: str, db: Session):

    return await scrape_and_store(
        user_id=user_id,
        url=url,
        db=db,
        save_to_db=True
    )


# VirusTotal Domain Lookup

def virustotal_lookup(domain: str) -> Dict:

    if not VT_API_KEY:
        return {"error": "VirusTotal API key missing"}

    url = f"https://www.virustotal.com/api/v3/domains/{domain}"

    headers = {
        "x-apikey": VT_API_KEY
    }

    try:

        r = requests.get(url, headers=headers)

        if r.status_code == 200:

            stats = r.json()["data"]["attributes"]["last_analysis_stats"]

            return {
                "malicious": stats.get("malicious"),
                "suspicious": stats.get("suspicious"),
                "harmless": stats.get("harmless"),
                "undetected": stats.get("undetected")
            }

        return {"error": "VirusTotal lookup failed"}

    except Exception as e:
        return {"error": str(e)}


# IPInfo Lookup

def ipinfo_lookup(ip: str):

    try:

        r = requests.get(f"https://ipinfo.io/{ip}/json")

        if r.status_code == 200:
            return r.json()

        return {"error": "IPInfo lookup failed"}

    except Exception as e:
        return {"error": str(e)}


# AbuseIPDB Lookup

def abuseip_lookup(ip: str):

    if not ABUSEIPDB_API_KEY:
        return {"error": "AbuseIPDB API key missing"}

    url = "https://api.abuseipdb.com/api/v2/check"

    headers = {
        "Key": ABUSEIPDB_API_KEY,
        "Accept": "application/json"
    }

    params = {
        "ipAddress": ip,
        "maxAgeInDays": 90
    }

    try:

        r = requests.get(url, headers=headers, params=params)

        if r.status_code == 200:
            return r.json()

        return {"error": "AbuseIPDB lookup failed"}

    except Exception as e:
        return {"error": str(e)}


# MAIN OSINT SCAN FUNCTION

async def run_osint_scan(payload, db: Session):

    results = {}

    social_profiles = {
        "github": payload.github,
        "reddit": payload.reddit,
        "twitter": payload.twitter
    }

    # Social Profile Scraping

    for platform, url in social_profiles.items():

        if url:

            scraped = await scrape_and_store(
                user_id=payload.user_id,
                url=str(url),
                db=db,
                save_to_db=False
            )

            if scraped:
                results[platform] = scraped["content"]

    # Target Intelligence

    if payload.targets:

        for target in payload.targets:

            # IP Analysis
            if is_ip(target):

                ipinfo = ipinfo_lookup(target)
                abuse = abuseip_lookup(target)

                results[target] = {
                    "type": "ip",
                    "ipinfo": ipinfo,
                    "abuseipdb": abuse
                }

            # Domain Analysis
            elif is_domain(target):

                vt = virustotal_lookup(target)

                results[target] = {
                    "type": "domain",
                    "virustotal": vt
                }

            else:

                results[target] = {
                    "type": "unknown"
                }

    # Save Aggregated Result

    osint_record = models.OSINTData(

        user_id=payload.user_id,
        source="Osint_Engine",
        data_type="aggregated",

        # preserve emojis
        content=json.dumps(results, ensure_ascii=False)

    )

    db.add(osint_record)
    db.commit()
    db.refresh(osint_record)

    return osint_record