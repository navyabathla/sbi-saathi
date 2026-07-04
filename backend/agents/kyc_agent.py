"""
KYC Agent — conversational onboarding for SBI Saathi.
Uses Google Gemini (free).
"""

import json
import re
import google.generativeai as genai
from config import GEMINI_API_KEY, SUPPORTED_LANGUAGES

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

PRODUCTS = {
    "jan_dhan": {
        "name": "PM Jan Dhan Yojana Account",
        "description": "Zero-balance savings account with RuPay debit card.",
        "benefit": "₹2 lakh accident insurance + free YONO access.",
        "eligible_if": lambda p: (
            p.get("income", 999999) < 15000 or
            not p.get("existing_account", True)
        ),
    },
    "savings_basic": {
        "name": "SBI Basic Savings Account",
        "description": "Simple savings account with ATM card and internet banking.",
        "benefit": "Free UPI payments + YONO app access.",
        "eligible_if": lambda p: True,
    },
    "kisan_credit": {
        "name": "Kisan Credit Card",
        "description": "Revolving credit for farmers up to ₹3L at subsidised interest.",
        "benefit": "Repayment aligned with harvest cycles.",
        "eligible_if": lambda p: p.get("occupation") == "farmer",
    },
    "mudra_loan": {
        "name": "PM Mudra Yojana Loan",
        "description": "Business loans ₹50K–₹10L for small entrepreneurs.",
        "benefit": "No collateral required for loans up to ₹10L.",
        "eligible_if": lambda p: p.get("occupation") in [
            "self_employed", "small_business"
        ],
    },
    "student_account": {
        "name": "SBI Student Savings Account",
        "description": "Zero-fee account with scholarship credit support.",
        "benefit": "Free education loan counselling + student offers.",
        "eligible_if": lambda p: p.get("occupation") == "student",
    },
}


def build_prompt(conversation_history, user_profile, language="hi"):
    # Very explicit language instruction — Gemini needs this level of clarity
    if language == "hi":
        lang_instruction = """LANGUAGE RULE — CRITICAL:
You MUST respond ONLY in Hindi (Devanagari script: क, ख, ग...).
Do NOT use English words except for: SBI, YONO, UPI, KYC, ATM, OTP.
Every single word of your "message" field must be in Hindi Devanagari script.
Example of correct Hindi: "नमस्ते! मैं Saathi हूं। आपका नाम क्या है?"
Example of WRONG response: "Hello! Main Saathi hoon." (this is wrong - no Roman script)"""
    else:
        lang_instruction = """LANGUAGE RULE — CRITICAL:
You MUST respond ONLY in English.
Do NOT use any Hindi or other language words.
Every single word of your "message" field must be in English.
Example of correct English: "Hello! I am Saathi. What is your name?"
Example of WRONG response: "Namaste! Main Saathi hoon." (this is wrong)"""

    system = f"""You are Saathi, SBI's friendly AI banking assistant.

{lang_instruction}

Your goal: help the user open an SBI bank account through warm friendly conversation.
Collect these 6 things ONE AT A TIME — do not ask multiple questions together:
1. Full name
2. Date of birth
3. Mobile number (10 digits)
4. Occupation — must be one of: farmer / salaried / self_employed / small_business / student / other
5. Monthly income in rupees (rough estimate is fine)
6. Whether they already have any bank account (yes or no)

After collecting all 6:
- Give a warm summary of what you collected
- Recommend the best SBI product based on their profile:
  * Income under 15000 or no existing account → PM Jan Dhan Yojana
  * Farmer → Kisan Credit Card
  * Self employed or small business → PM Mudra Yojana Loan
  * Student → SBI Student Savings Account
  * Others → SBI Basic Savings Account
- Tell them next step is Aadhaar upload via secure link

Rules:
- Be warm and encouraging — like a knowledgeable friend
- One question at a time only
- Never repeat a question if info is already collected
- Celebrate with "बहुत अच्छा!" (Hindi) or "Great!" (English)

INFO ALREADY COLLECTED — DO NOT ASK AGAIN:
{json.dumps(user_profile, ensure_ascii=False) if user_profile else "Nothing collected yet"}

RESPOND AS JSON ONLY. No markdown. No code fences. No extra text before or after.
The JSON must look exactly like this:
{{
  "message": "<your reply — MUST be in {'Hindi Devanagari' if language == 'hi' else 'English'} only>",
  "collected": {{
    "name": null,
    "dob": null,
    "mobile": null,
    "occupation": null,
    "income": null,
    "existing_account": null
  }},
  "next_step": "collect_info",
  "product": null
}}

For next_step use: collect_info / request_aadhaar / recommend_product / complete
For product when recommending: {{"name": "...", "description": "...", "benefit": "..."}}
Fill collected with ALL info gathered so far across the whole conversation, not just this turn.
Null means not collected yet."""

    history_str = ""
    for msg in conversation_history:
        role = "User" if msg["role"] == "user" else "Saathi"
        history_str += f"\n{role}: {msg['content']}"

    return system + "\n\nCONVERSATION HISTORY:" + history_str + "\n\nSaathi (respond in JSON only):"


def run_kyc_agent(conversation_history, user_profile, language="hi"):
    prompt = build_prompt(conversation_history, user_profile, language)

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip markdown fences if Gemini added them
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"^```\s*",     "", raw)
        raw = re.sub(r"\s*```$",     "", raw)

        result = json.loads(raw)

        # Merge only non-null collected fields into existing profile
        clean = {
            k: v for k, v in result.get("collected", {}).items()
            if v is not None
        }
        result["collected"] = {**user_profile, **clean}
        return result

    except json.JSONDecodeError:
        # Gemini returned non-JSON — wrap it gracefully
        fallback_msg = (
            "माफ़ करें, एक technical problem आई। क्या आप फिर से कोशिश करेंगे?"
            if language == "hi" else
            "Sorry, a technical issue occurred. Could you please try again?"
        )
        return {
            "message":   fallback_msg,
            "collected": user_profile,
            "next_step": "collect_info",
            "product":   None,
        }
    except Exception:
        fallback_msg = (
            "माफ़ करें, server से connect नहीं हो पाया। Flask server चालू है?"
            if language == "hi" else
            "Sorry, could not connect to the server. Is Flask running?"
        )
        return {
            "message":   fallback_msg,
            "collected": user_profile,
            "next_step": "collect_info",
            "product":   None,
        }


def get_eligible_products(profile):
    return [
        {
            "id":          k,
            "name":        p["name"],
            "description": p["description"],
            "benefit":     p["benefit"],
        }
        for k, p in PRODUCTS.items()
        if p["eligible_if"](profile)
    ]


def generate_followup_message(user_name, last_step, language="hi"):
    step_context = {
        "collect_info":      "sharing their basic details",
        "request_aadhaar":   "uploading their Aadhaar",
        "recommend_product": "reviewing their product recommendation",
    }.get(last_step, "opening their account")

    if language == "hi":
        prompt = f"""एक warm WhatsApp message लिखो Hindi Devanagari में {user_name} के लिए।
वे SBI account खोल रहे थे लेकिन {step_context} के दौरान रुक गए।
उन्हें encourage करो और वापस आने के लिए invite करो।
60 words से कम। Hindi Devanagari script में लिखो।
सिर्फ message text return करो — कोई JSON नहीं।"""
    else:
        prompt = f"""Write a warm WhatsApp re-engagement message in English for {user_name}
who was opening an SBI account but stopped while {step_context}.
Be encouraging. Under 60 words. English only.
Return only the message text — no JSON."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        if language == "hi":
            return f"नमस्ते {user_name}! आपका SBI खाता खोलना अधूरा है। क्या आप जारी रखना चाहेंगे? 🙏"
        return f"Hi {user_name}! Your SBI account opening is incomplete. Would you like to continue? 🙏"


def generate_smart_greeting(user_data=None, language="hi"):
    if language == "hi":
        prompt = """एक warm greeting लिखो Hindi Devanagari में SBI Saathi के लिए।
40 words से कम। Friendly और inviting। एक open question से end करो।
सिर्फ greeting text return करो — कोई JSON नहीं।
Example: "नमस्ते! 🙏 मैं Saathi हूं — SBI का AI banking assistant। आपका खाता खोलने में मदद करूंगा। क्या हम शुरू करें?" """
    else:
        prompt = """Write a warm greeting in English for SBI Saathi AI banking assistant.
Under 40 words. Friendly and inviting. End with one open question.
Return only the greeting text — no JSON.
Example: "Hello! 👋 I'm Saathi, SBI's AI banking assistant. I'll help you open your account in just a few minutes. Shall we begin?" """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        if language == "hi":
            return "नमस्ते! 🙏 मैं Saathi हूं — SBI का AI banking assistant। आपका खाता खोलने में मदद करूंगा। क्या हम शुरू करें?"
        return "Hello! 👋 I'm Saathi, SBI's AI banking assistant. I'll help you open your account in minutes. Shall we begin?"