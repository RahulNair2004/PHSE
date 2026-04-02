import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from sqlalchemy.orm import Session
from database import models
import time
import random
import asyncio
import cloudscraper
from playwright.async_api import async_playwright
import tweepy
import os
from dotenv import load_dotenv

load_dotenv()

# SESSION + HEADERS

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0 Safari/537.36"
]

def get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "en-US,en;q=0.9"
    }

scraper = cloudscraper.create_scraper()

# TWITTER CLIENT

def get_twitter_client():
    bearer = os.getenv("TWITTER_BEARER")
    if not bearer:
        raise ValueError("TWITTER_BEARER not set in .env file")
    return tweepy.Client(bearer_token=bearer)

# UTILITIES

def detect_platform(url: str) -> str:
    domain = urlparse(url).netloc.lower()

    if "github.com" in domain:
        return "GitHub"
    elif "medium.com" in domain:
        return "Medium"
    elif "twitter.com" in domain or "x.com" in domain:
        return "Twitter"
    else:
        return "Website"

def clean_text(text: str) -> str:
    return " ".join(text.split())

def safe_request(url: str, retries: int = 2):
    for _ in range(retries):
        try:
            response = scraper.get(url, headers=get_headers(), timeout=15)
            if response.status_code == 200:
                return response
            time.sleep(1)
        except Exception as e:
            print("[Scraper] Error:", e)
            time.sleep(1)
    return None

def empty_response(source: str, data_type: str):
    return {"source": source, "data_type": data_type, "content": ""}

# GITHUB SCRAPER

def scrape_github(url: str) -> dict:
    response = safe_request(url)
    if not response:
        return empty_response("GitHub", "profile")

    soup = BeautifulSoup(response.text, "html.parser")

    name = soup.select_one("span.p-name")
    bio = soup.select_one(".p-note")
    location = soup.select_one('[itemprop="homeLocation"]')
    followers = soup.select_one('a[href$="?tab=followers"] span')
    repos = soup.select_one('a[href$="?tab=repositories"] span')
    readme = soup.select_one("article.markdown-body")

    content = f"""
    Name: {name.get_text(strip=True) if name else ""}
    Bio: {bio.get_text(strip=True) if bio else ""}
    Location: {location.get_text(strip=True) if location else ""}
    Followers: {followers.get_text(strip=True) if followers else ""}
    Repositories: {repos.get_text(strip=True) if repos else ""}
    Profile README: {readme.get_text(" ", strip=True) if readme else ""}
    """

    return {
        "source": "GitHub",
        "data_type": "profile",
        "content": clean_text(content)
    }

# TWITTER SCRAPER

def scrape_twitter(url: str) -> dict:

    twitter_client = get_twitter_client()
    username = url.rstrip("/").split("/")[-1]

    try:

        user = twitter_client.get_user(
            username=username,
            user_fields=["description", "public_metrics", "location"]
        )

        if not user.data:
            return empty_response("Twitter", "profile")

        tweets = twitter_client.get_users_tweets(
            id=user.data.id,
            max_results=20
        )

        tweet_texts = []
        for tweet in tweets.data or []:
            tweet_texts.append(tweet.text)

        metrics = user.data.public_metrics

        content = f"""
        Name: {user.data.name}
        Bio: {user.data.description}
        Location: {user.data.location}
        Followers: {metrics.get('followers_count', 0)}
        Following: {metrics.get('following_count', 0)}
        Tweet Count: {metrics.get('tweet_count', 0)}
        Recent Tweets:
        {' '.join(tweet_texts)}
        """

        return {
            "source": "Twitter",
            "data_type": "profile",
            "content": clean_text(content)
        }

    except Exception as e:
        print("[Twitter] Error:", e)
        return empty_response("Twitter", "profile")

# MEDIUM SCRAPER

async def scrape_medium(url: str) -> dict:

    try:

        async with async_playwright() as p:

            browser = await p.chromium.launch(headless=True)

            page = await browser.new_page(
                user_agent=random.choice(USER_AGENTS)
            )

            await page.goto(url, timeout=60000)
            await page.wait_for_load_state("networkidle")

            for _ in range(3):
                await page.mouse.wheel(0, 3000)
                await asyncio.sleep(1)

            html = await page.content()

            soup = BeautifulSoup(html, "html.parser")

            name_tag = soup.find("h1")
            name = name_tag.get_text(strip=True) if name_tag else ""

            bio_meta = soup.find("meta", property="og:description")
            bio = bio_meta["content"] if bio_meta else ""

            followers_text = ""
            possible_followers = soup.find_all(string=lambda t: "Follower" in t if t else False)
            if possible_followers:
                followers_text = possible_followers[0].strip()

            content = f"""
            Name: {name}
            Bio: {bio}
            Followers: {followers_text}
            """

            await browser.close()

            return {
                "source": "Medium",
                "data_type": "profile",
                "content": content[:5000]
            }

    except Exception as e:
        print("[Medium] Error:", e)

        return {
            "source": "Medium",
            "data_type": "profile",
            "content": ""
        }

# GENERIC WEBSITE SCRAPER

def scrape_generic(url: str) -> dict:

    response = safe_request(url)

    if not response:
        return empty_response("Website", "text")

    soup = BeautifulSoup(response.text, "html.parser")

    texts = [t.get_text() for t in soup.find_all(['p', 'h1', 'h2', 'h3'])]

    text = " ".join(texts)

    return {
        "source": "Website",
        "data_type": "text",
        "content": clean_text(text[:3000])
    }

# MAIN SCRAPER FUNCTION

async def scrape_and_store(user_id: int, url: str, db: Session, save_to_db: bool = True):

    platform = detect_platform(url)

    if platform == "Medium":
        scraped = await scrape_medium(url)
    elif platform == "GitHub":
        scraped = scrape_github(url)
    elif platform == "Twitter":
        scraped = scrape_twitter(url)
    else:
        scraped = scrape_generic(url)

    if not scraped or not scraped.get("content"):
        return None

    # If OSINT aggregation scan → don't save intermediate results
    if not save_to_db:
        return scraped

    # Normal scan → save to DB
    new_scan = models.OSINTData(
        user_id=user_id,
        source=scraped["source"],
        data_type=scraped["data_type"],
        content=scraped["content"]
    )

    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    return new_scan