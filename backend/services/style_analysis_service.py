"""
Stylometry Analysis Service

Performs:

Writing pattern analysis

Tone detection

Vocabulary uniqueness

Emotional polarity

Used for impersonation risk.


Pipeline:
OSINT DATA -> Normalization -> Text Corpus -> Stylometry -> Save DB
"""

import re
import math
from collections import Counter
from textblob import TextBlob

from sqlalchemy.orm import Session
from database import models
from database import schemas

# IMPORT NORMALIZATION PIPELINE
from services.normalisation_service import process_user_osint


# CORPUS CLEANING

def clean_text_corpus(text: str):

    if not text:
        return ""

    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"\S+@\S+", "", text)

    text = re.sub(
        r"(name|location|followers|repositories|email|bio):?",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(r"\b\d+\b", "", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# TOKENIZERS

def tokenize_words(text: str):
    return re.findall(r"\b[a-zA-Z]+\b", text.lower())


def tokenize_sentences(text: str):
    sentences = re.split(r"[.!?]+", text)
    return [s.strip() for s in sentences if s.strip()]


# FEATURE EXTRACTION

def compute_avg_sentence_length(text: str):

    sentences = tokenize_sentences(text)
    words = tokenize_words(text)

    if not sentences:
        return 0.0

    return round(len(words) / len(sentences), 3)


def compute_vocabulary_richness(text: str):

    words = tokenize_words(text)

    if not words:
        return 0.0

    unique_words = set(words)

    richness = len(unique_words) / len(words)

    return round(richness, 3)


def compute_punctuation_density(text: str):

    punctuation = re.findall(r"[,.!?;:]", text)
    words = tokenize_words(text)

    if not words:
        return 0.0

    density = len(punctuation) / len(words)

    return round(density, 3)


def compute_sentiment(text: str):

    blob = TextBlob(text)

    polarity = blob.sentiment.polarity

    return round(polarity, 3)


def compute_entropy(text: str):

    words = tokenize_words(text)

    if not words:
        return 0.0

    freq = Counter(words)
    total = len(words)

    entropy = 0

    for count in freq.values():

        p = count / total

        entropy -= p * math.log2(p)

    return round(entropy, 3)


# RISK SCORING

def compute_stylometry_risk(features: dict):

    risk = 0.0

    if features["vocabulary_richness"] < 0.35:
        risk += 0.25

    if features["punctuation_density"] < 0.02:
        risk += 0.25

    if features["entropy_score"] < 3:
        risk += 0.25

    if abs(features["sentiment_score"]) > 0.8:
        risk += 0.25

    return round(min(risk, 1.0), 3)


# MAIN STYLE ANALYSIS

def analyze_style(text_corpus: str):

    cleaned_text = clean_text_corpus(text_corpus)

    features = {}

    features["avg_sentence_length"] = compute_avg_sentence_length(cleaned_text)

    features["vocabulary_richness"] = compute_vocabulary_richness(cleaned_text)

    features["punctuation_density"] = compute_punctuation_density(cleaned_text)

    features["sentiment_score"] = compute_sentiment(cleaned_text)

    features["entropy_score"] = compute_entropy(cleaned_text)

    features["stylometry_risk"] = compute_stylometry_risk(features)

    return features


# SAVE TO DATABASE

def save_stylometry_analysis(
    db: Session,
    user_id: int,
    features: dict
):

    analysis = models.StylometryAnalysis(
        user_id=user_id,
        avg_sentence_length=features["avg_sentence_length"],
        vocabulary_richness=features["vocabulary_richness"],
        punctuation_density=features["punctuation_density"],
        sentiment_score=features["sentiment_score"],
        entropy_score=features["entropy_score"],
        stylometry_risk=features["stylometry_risk"]
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis


# FULL PIPELINE

def run_style_analysis_pipeline(
    db: Session,
    user_id: int
):

    """
    Complete pipeline:

    1. Fetch OSINT
    2. Normalize
    3. Extract text corpus
    4. Stylometry analysis
    5. Store in DB
    """

    osint_result = process_user_osint(user_id)

    if not osint_result:
        raise ValueError("No OSINT data found")

    text_corpus = osint_result["text_corpus"]

    if not text_corpus:
        raise ValueError("No text corpus extracted")

    # Stylometry analysis
    features = analyze_style(text_corpus)

    # Save to DB
    db_result = save_stylometry_analysis(
        db,
        user_id,
        features
    )

    response = schemas.StylometryResponse(
        avg_sentence_length=db_result.avg_sentence_length,
        vocabulary_richness=db_result.vocabulary_richness,
        punctuation_density=db_result.punctuation_density,
        sentiment_score=db_result.sentiment_score,
        entropy_score=db_result.entropy_score,
        stylometry_risk=db_result.stylometry_risk
    )

    return response



if __name__ == "__main__":

    from database.db import SessionLocal

    print("\nSTYLOMETRY PIPELINE TEST\n")

    # choose an existing user_id from osint_data table
    user_id = 3

    db = SessionLocal()

    try:

        print("Running Stylometry Pipeline for user:", user_id)

        result = run_style_analysis_pipeline(db, user_id)

        print("\nStylometry Analysis Saved to DB\n")

        print("Returned Response Object:\n")

        print("Avg Sentence Length:", result.avg_sentence_length)
        print("Vocabulary Richness:", result.vocabulary_richness)
        print("Punctuation Density:", result.punctuation_density)
        print("Sentiment Score:", result.sentiment_score)
        print("Entropy Score:", result.entropy_score)
        print("Stylometry Risk:", result.stylometry_risk)

        print("\nPipeline executed successfully.\n")

    except Exception as e:

        print("\nERROR OCCURRED\n")
        print(str(e))

    finally:

        db.close()