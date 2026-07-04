import json
import re
import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

LIFE_EVENT_RULES = {
    "new_job": {
        "label": "Started a new job",
        "emoji": "💼",
        "detect": lambda t: t.get("salary_spike") and t.get("new_salary_source"),
        "products": ["Salary Account", "SIP Setup", "Term Insurance"],
        "pitch": "A new job means a new financial chapter.",
    },
    "marriage": {
        "label": "Getting married",
        "emoji": "💍",
        "detect": lambda t: (
            t.get("jewellery_spend", 0) > 50000 or
            t.get("wedding_vendor_spend", 0) > 30000
        ),
        "products": ["Joint Account", "Home Loan Pre-approval", "Life Insurance"],
        "pitch": "Starting a new life together.",
    },
    "new_home": {
        "label": "Buying a home",
        "emoji": "🏠",
        "detect": lambda t: (
            t.get("large_emi_started") or
            t.get("home_down_payment", 0) > 200000
        ),
        "products": ["Home Loan", "Home Insurance", "Tax Saving FD"],
        "pitch": "Your dream home deserves the best support.",
    },
    "new_baby": {
        "label": "New baby in family",
        "emoji": "👶",
        "detect": lambda t: t.get("hospital_maternity_spend", 0) > 10000,
        "products": ["Child Education Plan", "Sukanya Samriddhi", "Life Insurance"],
        "pitch": "Your little one's future starts now.",
    },
    "travel_surge": {
        "label": "Planning travel",
        "emoji": "✈️",
        "detect": lambda t: t.get("flight_hotel_spend_30d", 0) > 15000,
        "products": ["Travel Insurance", "Forex Card", "Travel Credit Card"],
        "pitch": "Make your money work abroad.",
    },
    "business_start": {
        "label": "Starting a business",
        "emoji": "🚀",
        "detect": lambda t: (
            t.get("multiple_vendor_payments") or
            t.get("gst_registration_signal")
        ),
        "products": ["Current Account", "Mudra Loan", "Business Insurance"],
        "pitch": "Every great business needs the right banking partner.",
    },
    "education_fee": {
        "label": "Education milestone",
        "emoji": "🎓",
        "detect": lambda t: (
            t.get("college_fee_payment", 0) > 50000 or
            t.get("coaching_spend", 0) > 20000
        ),
        "products": ["Education Loan", "Scholar FD", "Student Savings Account"],
        "pitch": "Education is the best investment.",
    },
}


def detect_life_events(transaction_signals):
    detected = []
    for key, event in LIFE_EVENT_RULES.items():
        try:
            if event["detect"](transaction_signals):
                detected.append({
                    "event_key": key,
                    "label":     event["label"],
                    "emoji":     event["emoji"],
                    "products":  event["products"],
                    "pitch":     event["pitch"],
                })
        except Exception:
            continue
    return detected


def generate_engagement_nudge(user_name, life_event, user_profile, language="hi"):
    if language == "hi":
        lang_instruction = """CRITICAL: Respond in Hindi Devanagari script ONLY.
Every word in whatsapp_message and chat_opener must be in Hindi Devanagari.
Do not use Roman script Hindi (no 'Namaste', use 'नमस्ते')."""
    else:
        lang_instruction = """CRITICAL: Respond in English ONLY.
Every word must be in English. No Hindi words."""

    prompt = f"""You are Saathi, SBI's proactive financial companion.

{lang_instruction}

User name: {user_name}
Life milestone: {life_event['label']}
Pitch: {life_event.get('pitch', '')}
SBI products: {', '.join(life_event['products'])}

Write:
1. WhatsApp message (max 80 words) — warm, personal, acknowledges milestone.
   Sound like a knowledgeable friend. End with a soft CTA.
2. One-line conversation opener if they tap Know more
3. One surprising insight (government scheme or tax benefit)

JSON only, no markdown:
{{
  "whatsapp_message": "...",
  "chat_opener": "...",
  "hidden_insight": "...",
  "products": {json.dumps(life_event['products'])},
  "emoji_header": "{life_event.get('emoji', '✨')}"
}}"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"^```\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception:
        if language == "hi":
            return {
                "whatsapp_message": f"नमस्ते {user_name}! {life_event['pitch']} SBI आपकी मदद कर सकता है। जानना चाहेंगे? 🙏",
                "chat_opener": "Saathi से बात करें →",
                "hidden_insight": "",
                "products": life_event["products"],
                "emoji_header": life_event.get("emoji", "✨"),
            }
        return {
            "whatsapp_message": f"Hi {user_name}! {life_event['pitch']} SBI can help you. Want to know more? 🙏",
            "chat_opener": "Talk to Saathi →",
            "hidden_insight": "",
            "products": life_event["products"],
            "emoji_header": life_event.get("emoji", "✨"),
        }


def generate_synthetic_signals(scenario="new_job"):
    base = {
        "salary_spike": False, "new_salary_source": False,
        "jewellery_spend": 0, "wedding_vendor_spend": 0,
        "large_emi_started": False, "home_down_payment": 0,
        "hospital_maternity_spend": 0,
        "flight_hotel_spend_30d": 0,
        "multiple_vendor_payments": False, "gst_registration_signal": False,
        "college_fee_payment": 0, "coaching_spend": 0,
    }
    overrides = {
        "new_job":        {"salary_spike": True,  "new_salary_source": True},
        "marriage":       {"jewellery_spend": 75000, "wedding_vendor_spend": 45000},
        "new_home":       {"large_emi_started": True, "home_down_payment": 500000},
        "new_baby":       {"hospital_maternity_spend": 35000},
        "travel_surge":   {"flight_hotel_spend_30d": 45000},
        "business_start": {"multiple_vendor_payments": True, "gst_registration_signal": True},
        "education_fee":  {"college_fee_payment": 85000},
    }
    return {**base, **overrides.get(scenario, {})}