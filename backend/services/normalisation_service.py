import psycopg2
import json
import re


# DATABASE CONFIG

DB_CONFIG = {
    "host": "localhost",
    "database": "PHSE",
    "user": "postgres",
    "password": "yourownpassword",
    "port": 5432
}


# FETCH RAW OSINT DATA

def get_raw_content(user_id):

    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    query = "SELECT content FROM osint_data WHERE user_id = %s"

    cursor.execute(query, (user_id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        return None

    raw = result[0]

    if isinstance(raw, str):
        raw = json.loads(raw)

    return raw


# NORMALIZATION

def normalize_osint(raw):

    normalized = {
        "identity": {},
        "emails": [],
        "ips": [],
        "domains": [],
        "organizations": [],
        "locations": [],
        "text_sources": []
    }

    for key, value in raw.items():

        # GITHUB TEXT

        if key == "github" and isinstance(value, str):

            normalized["text_sources"].append(value)

            # NAME EXTRACTION (SAFE)
            name_match = re.search(
                r"Name:\s*([A-Za-z\s]{2,50})",
                value
            )

            if name_match:
                name = name_match.group(1).strip()

                # Remove accidental extra tokens
                name = name.split("Bio")[0]
                name = name.split("Location")[0]
                name = name.strip()

                normalized["identity"]["name"] = name

            # LOCATION EXTRACTION
            location_match = re.search(
                r"Location:\s*([^\n\r]+)",
                value
            )

            if location_match:

                location = location_match.group(1).strip()
                location = location.split("Followers")[0].strip()

                normalized["locations"].append(location)

            # EMAIL EXTRACTION
            email_matches = re.findall(
                r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
                value
            )

            normalized["emails"].extend(email_matches)

        # IP DATA

        elif isinstance(value, dict) and value.get("type") == "ip":

            ipinfo = value.get("ipinfo", {})
            abuse = value.get("abuseipdb", {}).get("data", {})

            ip_data = {
                "ip": ipinfo.get("ip"),
                "hostname": ipinfo.get("hostname"),
                "city": ipinfo.get("city"),
                "country": ipinfo.get("country"),
                "org": ipinfo.get("org"),
                "isp": abuse.get("isp"),
                "abuse_score": abuse.get("abuseConfidenceScore")
            }

            normalized["ips"].append(ip_data)

            # ORGANIZATION CLEANING
            org = ipinfo.get("org")

            if org:
                org = re.sub(r"AS\d+\s*", "", org).strip()
                normalized["organizations"].append(org)

            # LOCATION
            city = ipinfo.get("city")

            if city:
                normalized["locations"].append(city)

        # DOMAIN DATA

        elif isinstance(value, dict) and value.get("type") == "domain":

            domain_data = {
                "domain": key,
                "virustotal": value.get("virustotal", {})
            }

            normalized["domains"].append(domain_data)

        # GENERIC TEXT SOURCES

        elif isinstance(value, str):

            normalized["text_sources"].append(value)

            # Also attempt email extraction
            email_matches = re.findall(
                r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
                value
            )

            normalized["emails"].extend(email_matches)

    # REMOVE DUPLICATES

    normalized["emails"] = list(set(normalized["emails"]))
    normalized["locations"] = list(set(normalized["locations"]))
    normalized["organizations"] = list(set(normalized["organizations"]))
    normalized["text_sources"] = list(set(normalized["text_sources"]))

    return normalized


# FEATURE ENGINEERING

def extract_features(normalized):

    features = {}

    # BASIC COUNTS

    features["num_ips"] = len(normalized["ips"])
    features["num_domains"] = len(normalized["domains"])
    features["num_emails"] = len(normalized["emails"])
    features["num_locations"] = len(normalized["locations"])
    features["num_orgs"] = len(normalized["organizations"])

    # IP ABUSE METRICS

    abuse_scores = [
        ip["abuse_score"]
        for ip in normalized["ips"]
        if ip.get("abuse_score") is not None
    ]

    if abuse_scores:

        features["avg_abuse_score"] = sum(abuse_scores) / len(abuse_scores)
        features["max_abuse_score"] = max(abuse_scores)

    else:

        features["avg_abuse_score"] = 0
        features["max_abuse_score"] = 0

    # DOMAIN REPUTATION

    malicious_domains = 0

    for domain in normalized["domains"]:

        vt = domain.get("virustotal", {})

        if vt.get("malicious", 0) > 0:
            malicious_domains += 1

    features["malicious_domains"] = malicious_domains

    # DIVERSITY FEATURES

    features["geo_diversity"] = len(set(normalized["locations"]))
    features["org_diversity"] = len(set(normalized["organizations"]))

    # IDENTITY PRESENCE

    features["has_name"] = 1 if "name" in normalized["identity"] else 0
    features["has_email"] = 1 if len(normalized["emails"]) > 0 else 0

    return features


# BUILD TEXT CORPUS FOR STYLE ANALYSIS 

def build_text_corpus(normalized):

    texts = []

    for t in normalized["text_sources"]:

        if t and isinstance(t, str):

            clean_text = t.strip()

            if len(clean_text) > 0:
                texts.append(clean_text)

    # Join all text for stylometry analysis
    corpus = "\n".join(texts)

    return corpus


# MAIN PIPELINE

def process_user_osint(user_id):

    raw_content = get_raw_content(user_id)

    if raw_content is None:
        return None

    normalized = normalize_osint(raw_content)

    features = extract_features(normalized)

    text_corpus = build_text_corpus(normalized)

    result = {
        "normalized": normalized,
        "features": features,
        "text_corpus": text_corpus
    }

    return result


# TEST RUN

if __name__ == "__main__":

    user_id = 3

    result = process_user_osint(user_id)

    if result is None:

        print("No OSINT data found for user")

    else:

        print("\nNORMALIZED DATA \n")
        print(json.dumps(result["normalized"], indent=2, ensure_ascii=False))

        print("\n FEATURES \n")
        print(json.dumps(result["features"], indent=2, ensure_ascii=False))

        print("\nTEXT CORPUS FOR STYLE ANALYSIS\n")

        print(result["text_corpus"])

        print("\nCorpus length:", len(result["text_corpus"]))
