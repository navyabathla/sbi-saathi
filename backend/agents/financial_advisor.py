import json
import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


def ask_advisor(question, user_profile, language="hi"):
    if language == "hi":
        lang_instruction = """CRITICAL: Respond in Hindi Devanagari script ONLY.
Every single word must be in Hindi Devanagari script.
Do NOT use Roman script Hindi. Do NOT use English sentences.
Only allowed English words: SBI, YONO, UPI, EMI, FD, RD, SIP, CIBIL, KYC, ATM, OTP, PPF, NPS."""
    else:
        lang_instruction = """CRITICAL: Respond in English ONLY.
Every word must be in English. No Hindi words at all."""

    prompt = f"""You are Saathi's financial advisor — a friendly CA who gives
clear, jargon-free advice to everyday Indians.

{lang_instruction}

You know about:
- SBI products (FDs, loans, insurance, savings schemes)
- Government schemes (Jan Dhan, Mudra, Sukanya Samriddhi, NPS, PPF, PMSBY, PMJJBY)
- Tax saving (80C, 80D, HRA, home loan benefits)
- Basic investments (SIPs, mutual funds, gold bonds)
- Banking basics (credit score, CIBIL, EMI calculation)

User profile: {json.dumps(user_profile, ensure_ascii=False)}

Rules:
- Never give stock tips or speculative advice
- Use simple language with concrete rupee examples
- End with one clear actionable next step
- If complex, suggest visiting nearest SBI branch

User question: {question}

Answer now (remember: {'Hindi Devanagari only' if language == 'hi' else 'English only'})."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        if language == "hi":
            return "माफ़ करें, अभी जवाब देने में दिक्कत हो रही है। कृपया थोड़ी देर बाद try करें।"
        return "Sorry, having trouble answering right now. Please try again in a moment."


def get_scheme_recommendations(profile):
    schemes = []
    if profile.get("income", 999999) < 200000:
        schemes.append({
            "name":    "PMSBY",
            "benefit": "₹2L accident insurance for ₹20/year",
        })
        schemes.append({
            "name":    "PMJJBY",
            "benefit": "₹2L life insurance for ₹436/year",
        })
    if profile.get("occupation") == "farmer":
        schemes.append({
            "name":    "PM Kisan Samman Nidhi",
            "benefit": "₹6,000/year directly to your account",
        })
    if profile.get("occupation") == "student":
        schemes.append({
            "name":    "Vidya Lakshmi",
            "benefit": "Education loans up to ₹7.5L without collateral",
        })
    return schemes