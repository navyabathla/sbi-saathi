import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SUPPORTED_LANGUAGES = {
    "hi": "Hindi",
    "bn": "Bengali",
    "te": "Telugu",
    "mr": "Marathi",
    "ta": "Tamil",
    "gu": "Gujarati",
    "kn": "Kannada",
    "pa": "Punjabi",
    "en": "English",
}

SESSION_TIMEOUT  = 1800   # 30 minutes
FOLLOWUP_DELAY   = 86400  # 24 hours
KYC_LINK_EXPIRY  = 600    # 10 minutes