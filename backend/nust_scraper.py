"""
NUST Notice Board Scraper
Scrapes internship, career, and announcement pages across all NUST departments
Runs every 6 hours in background, caches results
"""

import json
import os
import time
import hashlib
import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup

CACHE_DIR = os.path.join(os.path.dirname(__file__), "realtime", "cache")
os.makedirs(CACHE_DIR, exist_ok=True)
CACHE_TTL_HOURS = 6

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# ── All NUST notice board URLs ───────────────────────────────
NUST_SOURCES = [
    # Main NUST
    {"name": "NUST Announcements", "url": "https://nust.edu.pk/announcement/", "dept": "ALL"},
    {"name": "NUST News", "url": "https://nust.edu.pk/news/", "dept": "ALL"},
    {"name": "NUST Events", "url": "https://nust.edu.pk/events/", "dept": "ALL"},
    {"name": "NUST Placement Office", "url": "https://nust.edu.pk/about-us/resources-offices/nust-placement-office/", "dept": "ALL"},

    # SEECS
    {"name": "SEECS Career", "url": "https://seecs.nust.edu.pk/career/", "dept": "SEECS"},
    {"name": "SEECS Announcements", "url": "https://seecs.nust.edu.pk/announcement/", "dept": "SEECS"},
    {"name": "SEECS News", "url": "https://seecs.nust.edu.pk/news/", "dept": "SEECS"},
    {"name": "SEECS Downloads", "url": "https://seecs.nust.edu.pk/downloads/internship/", "dept": "SEECS"},

    # NSTP
    {"name": "NSTP Opportunities", "url": "https://nust.edu.pk/events/internship-opportunities-at-nstp/", "dept": "ALL"},
]

# ── Keywords to identify relevant posts ─────────────────────
INTERNSHIP_KEYWORDS = [
    "internship", "intern", "opportunity", "career", "job", "hiring",
    "apply", "application", "deadline", "fellowship", "scholarship",
    "program", "programme", "vacancy", "position", "opening",
    "summer", "winter", "stipend", "paid", "unpaid", "research",
    "industrial", "placement", "recruit", "نوکری", "موقع"
]

NEWS_KEYWORDS = [
    "announcement", "notice", "update", "policy", "change", "new",
    "important", "urgent", "semester", "exam", "schedule", "result",
    "registration", "admission", "fee", "deadline", "extension",
    "workshop", "seminar", "event", "competition", "hackathon"
]


# ── Cache helpers ────────────────────────────────────────────
def _cache_path(key: str) -> str:
    h = hashlib.md5(key.encode()).hexdigest()[:12]
    return os.path.join(CACHE_DIR, f"nust_{h}.json")


def _load_cache(key: str) -> dict | None:
    path = _cache_path(key)
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        cached_at = datetime.fromisoformat(data.get("cached_at", "2000-01-01"))
        if datetime.now() - cached_at > timedelta(hours=CACHE_TTL_HOURS):
            return None
        return data
    except Exception:
        return None


def _save_cache(key: str, data: dict):
    data["cached_at"] = datetime.now().isoformat()
    try:
        with open(_cache_path(key), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception:
        pass


# ── Scraper ──────────────────────────────────────────────────
def scrape_page(url: str, source_name: str, dept: str) -> list:
    """Scrape a single NUST page for relevant posts."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove script and style tags
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        posts = []

        # Try to find article/post elements
        selectors = [
            "article", ".post", ".entry", ".news-item", ".announcement",
            ".card", ".item", "li.announcement", ".event-item",
            "h2 a", "h3 a", "h4 a", ".entry-title a"
        ]

        found_links = set()
        for selector in selectors:
            elements = soup.select(selector)
            for el in elements:
                # Get text and link
                text = el.get_text(separator=" ", strip=True)
                link = el.find("a")
                href = link.get("href", "") if link else ""

                # Skip if too short or already found
                if len(text) < 20 or href in found_links:
                    continue

                # Check if relevant
                text_lower = text.lower()
                is_internship = any(kw in text_lower for kw in INTERNSHIP_KEYWORDS)
                is_news = any(kw in text_lower for kw in NEWS_KEYWORDS)

                if is_internship or is_news:
                    # Make absolute URL
                    if href and not href.startswith("http"):
                        base = "/".join(url.split("/")[:3])
                        href = base + href if href.startswith("/") else url + href

                    found_links.add(href)
                    posts.append({
                        "title": text[:200],
                        "url": href or url,
                        "source": source_name,
                        "dept": dept,
                        "type": "internship" if is_internship else "news",
                        "scraped_at": datetime.now().isoformat()
                    })

                    if len(posts) >= 10:
                        break

            if len(posts) >= 10:
                break

        # Fallback: grab all links with relevant text
        if not posts:
            for a in soup.find_all("a", href=True):
                text = a.get_text(strip=True)
                href = a.get("href", "")
                if len(text) < 10:
                    continue
                text_lower = text.lower()
                is_internship = any(kw in text_lower for kw in INTERNSHIP_KEYWORDS)
                is_news = any(kw in text_lower for kw in NEWS_KEYWORDS)

                if (is_internship or is_news) and href not in found_links:
                    if not href.startswith("http"):
                        base = "/".join(url.split("/")[:3])
                        href = base + href if href.startswith("/") else url + href

                    found_links.add(href)
                    posts.append({
                        "title": text[:200],
                        "url": href,
                        "source": source_name,
                        "dept": dept,
                        "type": "internship" if is_internship else "news",
                        "scraped_at": datetime.now().isoformat()
                    })

                    if len(posts) >= 5:
                        break

        return posts

    except Exception as e:
        print(f"[Scraper] Failed {url}: {e}")
        return []


# ── Main scraper function ────────────────────────────────────
def scrape_all_nust(force: bool = False) -> dict:
    """
    Scrapes all NUST notice boards.
    Returns categorized results with internships and news.
    """
    cache_key = "nust_all_scrape"
    if not force:
        cached = _load_cache(cache_key)
        if cached:
            return cached

    print(f"[NUST Scraper] Starting full scrape at {datetime.now().strftime('%H:%M')}")

    all_internships = []
    all_news = []
    errors = []

    for source in NUST_SOURCES:
        try:
            posts = scrape_page(source["url"], source["name"], source["dept"])
            for post in posts:
                if post["type"] == "internship":
                    all_internships.append(post)
                else:
                    all_news.append(post)
            time.sleep(1)  # Be polite to NUST servers
        except Exception as e:
            errors.append(f"{source['name']}: {str(e)[:50]}")

    # Deduplicate by title similarity
    seen_titles = set()
    unique_internships = []
    for item in all_internships:
        title_key = item["title"][:50].lower()
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_internships.append(item)

    seen_titles = set()
    unique_news = []
    for item in all_news:
        title_key = item["title"][:50].lower()
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_news.append(item)

    result = {
        "internships": unique_internships[:20],
        "news": unique_news[:20],
        "total_internships": len(unique_internships),
        "total_news": len(unique_news),
        "scraped_at": datetime.now().isoformat(),
        "sources_scraped": len(NUST_SOURCES),
        "errors": errors,
    }

    _save_cache(cache_key, result)
    print(f"[NUST Scraper] Done — {len(unique_internships)} internships, {len(unique_news)} news items")
    return result


# ── Query functions for agent ────────────────────────────────
def get_nust_internships(dept: str = "ALL") -> dict:
    """Get current internship opportunities from NUST notice boards."""
    data = scrape_all_nust()
    internships = data.get("internships", [])

    if dept != "ALL":
        filtered = [i for i in internships if i.get("dept") in [dept, "ALL"]]
    else:
        filtered = internships

    if not filtered:
        return {
            "found": False,
            "message": "No internship postings found right now. Check nust.edu.pk/announcement/ directly or visit NSTP on campus.",
            "tip": "NSTP startups post internships on their own LinkedIn pages too — search 'NSTP Islamabad internship'."
        }

    return {
        "found": True,
        "count": len(filtered),
        "internships": filtered[:8],
        "source": "NUST official notice boards",
        "last_updated": data.get("scraped_at", "recent"),
        "tip": "These are scraped from official NUST pages. Always verify deadlines by visiting the source URL."
    }


def get_nust_news(dept: str = "ALL") -> dict:
    """Get latest news and announcements from NUST."""
    data = scrape_all_nust()
    news = data.get("news", [])

    if dept != "ALL":
        filtered = [n for n in news if n.get("dept") in [dept, "ALL"]]
    else:
        filtered = news

    if not filtered:
        return {
            "found": False,
            "message": "No recent announcements found. Check nust.edu.pk/announcement/ directly.",
        }

    return {
        "found": True,
        "count": len(filtered),
        "news": filtered[:8],
        "source": "NUST official notice boards",
        "last_updated": data.get("scraped_at", "recent"),
    }


def get_nust_updates(query: str = "") -> dict:
    """Get all NUST updates relevant to a query."""
    data = scrape_all_nust()
    all_items = data.get("internships", []) + data.get("news", [])

    if query:
        query_lower = query.lower()
        relevant = [
            item for item in all_items
            if any(word in item.get("title", "").lower() for word in query_lower.split())
        ]
    else:
        relevant = all_items

    return {
        "found": len(relevant) > 0,
        "count": len(relevant),
        "items": relevant[:10],
        "source": "NUST official notice boards (live)",
        "last_updated": data.get("scraped_at", "recent"),
        "sources_checked": data.get("sources_scraped", 0),
    }


# ── Background scheduler ─────────────────────────────────────
def start_background_scraper():
    """Start background scraping thread."""
    import threading

    def _scrape_loop():
        # Initial scrape on startup
        scrape_all_nust(force=True)
        while True:
            time.sleep(CACHE_TTL_HOURS * 3600)
            scrape_all_nust(force=True)

    thread = threading.Thread(target=_scrape_loop, daemon=True)
    thread.start()
    print("[NUST Scraper] Background scraper started — updates every 6 hours")