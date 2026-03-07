"""
Seed test crop photos for the last 6 days.
Downloads sample plant images, runs Gemini analysis on each, and inserts into DB.

Usage:  python seed_test_photos.py [phone]
        Defaults to first farmer in telegram_links.
"""

import os
import sys
import json
import sqlite3
import shutil
import urllib.request
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "farmers.db")
PHOTO_DIR = os.path.join(BASE_DIR, "crop_photos")

# -- Load .env for GEMINI_API_KEY --
env_path = os.path.join(BASE_DIR, ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and (key not in os.environ or not os.environ.get(key)):
                os.environ[key] = value

# Sample crop/plant images (public domain / freely available)
SAMPLE_URLS = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=640&q=80",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=640&q=80",
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=640&q=80",
    "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=640&q=80",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=640&q=80",
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=640&q=80",
]


def get_phone():
    if len(sys.argv) > 1:
        return sys.argv[1]
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT phone FROM telegram_links LIMIT 1").fetchone()
    conn.close()
    if row:
        return row[0]
    print("No linked farmers found. Pass a phone number as argument.")
    sys.exit(1)


def get_crop(phone):
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute(
        "SELECT crop FROM cultivation_plans WHERE phone = ? ORDER BY id DESC LIMIT 1",
        (phone,),
    ).fetchone()
    conn.close()
    return row[0] if row else "Coconut"


def download_image(url, dest):
    print(f"  Downloading: {url[:80]}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        with open(dest, "wb") as f:
            shutil.copyfileobj(resp, f)
    print(f"  Saved to: {dest}")


def analyze_image(filepath, crop_name):
    """Run Gemini vision analysis on the image. Falls back to mock data if quota exceeded."""
    try:
        import google.generativeai as genai
        import PIL.Image as PILImage
    except ImportError as e:
        print(f"  ⚠ Skipping analysis (missing module: {e})")
        return _mock_analysis(crop_name)

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        print("  ⚠ No GEMINI_API_KEY found, using mock analysis")
        return _mock_analysis(crop_name)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    img = PILImage.open(filepath)
    prompt = (
        f"You are an expert agricultural scientist. Analyze this crop photo of {crop_name}.\n"
        "Return ONLY a JSON object (no markdown, no code fences) with these keys:\n"
        '  "health_status": one of "Healthy", "Mild Issue", "Diseased", "Severely Diseased", "Stressed", "Nutrient Deficient"\n'
        '  "confidence": percentage like "85%"\n'
        '  "diseases": array of detected disease/pest names (empty array if healthy)\n'
        '  "recommendations": array of 2-4 short actionable advice strings\n'
        '  "growth_stage": estimated growth stage like "Seedling", "Vegetative", "Flowering", "Fruiting", "Mature"\n'
        '  "summary": one concise sentence describing the crop\'s condition\n'
    )

    try:
        response = model.generate_content([prompt, img])
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3].strip()
        if text.startswith("json"):
            text = text[4:].strip()
        result = json.loads(text)
        print(
            f"  ✅ Analysis (Gemini): {result.get('health_status', '?')} / {result.get('growth_stage', '?')}"
        )
        return result
    except Exception as exc:
        print(f"  ⚠ Gemini failed: {exc}")
        print(f"  → Using mock analysis instead")
        return _mock_analysis(crop_name)


# Realistic mock analysis data for different days
_MOCK_DATA = [
    {
        "health_status": "Healthy",
        "confidence": "92%",
        "diseases": [],
        "recommendations": [
            "Continue current watering schedule",
            "Apply organic mulch around the base",
            "Monitor for early signs of pest activity",
        ],
        "growth_stage": "Vegetative",
        "summary": "The coconut palm shows vigorous vegetative growth with healthy dark green fronds.",
    },
    {
        "health_status": "Mild Issue",
        "confidence": "78%",
        "diseases": ["Minor leaf spot"],
        "recommendations": [
            "Apply copper-based fungicide spray",
            "Improve air circulation around the canopy",
            "Remove affected fronds to prevent spread",
            "Increase potassium fertilizer application",
        ],
        "growth_stage": "Vegetative",
        "summary": "Some minor leaf spotting observed on lower fronds, likely early fungal infection.",
    },
    {
        "health_status": "Healthy",
        "confidence": "88%",
        "diseases": [],
        "recommendations": [
            "Maintain regular irrigation schedule",
            "Apply NPK 13:13:21 fertilizer this week",
            "Check soil moisture at root zone",
        ],
        "growth_stage": "Flowering",
        "summary": "The palm is entering flowering stage with healthy spadix development visible.",
    },
    {
        "health_status": "Stressed",
        "confidence": "85%",
        "diseases": ["Possible water stress"],
        "recommendations": [
            "Increase irrigation immediately — soil appears dry",
            "Apply mulch layer 3-4 inches thick around base",
            "Consider drip irrigation installation",
            "Test soil moisture weekly",
        ],
        "growth_stage": "Vegetative",
        "summary": "The plant shows signs of water stress with slightly yellowing older leaves.",
    },
    {
        "health_status": "Nutrient Deficient",
        "confidence": "80%",
        "diseases": ["Potassium deficiency", "Possible magnesium deficiency"],
        "recommendations": [
            "Apply potassium chloride at 1.5 kg per palm",
            "Supplement with magnesium sulfate spray",
            "Conduct soil nutrient analysis",
            "Increase organic compost application",
        ],
        "growth_stage": "Fruiting",
        "summary": "Yellowing leaf margins indicate potassium deficiency; some interveinal chlorosis suggests low magnesium.",
    },
    {
        "health_status": "Healthy",
        "confidence": "95%",
        "diseases": [],
        "recommendations": [
            "Excellent growth — maintain current care routine",
            "Prepare for harvest in 2-3 weeks",
            "Apply boron micronutrient to support fruit development",
        ],
        "growth_stage": "Fruiting",
        "summary": "Healthy coconut palm with well-developed fruit clusters approaching maturity.",
    },
]

_mock_idx = 0


def _mock_analysis(crop_name):
    global _mock_idx
    data = _MOCK_DATA[_mock_idx % len(_MOCK_DATA)].copy()
    data["summary"] = data["summary"].replace(
        "coconut palm", crop_name.lower() if crop_name else "crop"
    )
    _mock_idx += 1
    print(f"  ✅ Analysis (mock): {data['health_status']} / {data['growth_stage']}")
    return data


def main():
    phone = get_phone()
    crop = get_crop(phone)
    print(f"\n🌾 Seeding test photos for phone={phone}, crop={crop}")
    print(f"   Will create photos for the last {len(SAMPLE_URLS)} days\n")

    phone_dir = os.path.join(PHOTO_DIR, phone)
    os.makedirs(phone_dir, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    # Clear existing test photos for this farmer
    conn.execute("DELETE FROM crop_photos WHERE phone = ?", (phone,))
    conn.commit()
    # Also remove existing photo files
    for f in os.listdir(phone_dir):
        os.remove(os.path.join(phone_dir, f))

    today = datetime.now()
    inserted = 0

    for i, url in enumerate(SAMPLE_URLS):
        day_offset = len(SAMPLE_URLS) - 1 - i  # oldest first
        date = (today - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        timestamp = f"08{i:02d}00"
        filename = f"{date}_{timestamp}.jpg"
        filepath = os.path.join(phone_dir, filename)

        print(f"📅 Day {i+1}/{len(SAMPLE_URLS)} — {date}")

        try:
            download_image(url, filepath)
        except Exception as exc:
            print(f"  ❌ Download failed: {exc}, skipping this day")
            continue

        # Run Gemini analysis
        analysis = analyze_image(filepath, crop)
        analysis_json = json.dumps(analysis) if analysis else None

        conn.execute(
            "INSERT INTO crop_photos (phone, date, filename, created_at, analysis) VALUES (?, ?, ?, ?, ?)",
            (phone, date, filename, datetime.now().isoformat(), analysis_json),
        )
        conn.commit()
        inserted += 1
        print()

    conn.close()
    print(f"✅ Done! Inserted {inserted} photos for {phone}")
    print(f"   Refresh the calendar page to see them.\n")


if __name__ == "__main__":
    main()
