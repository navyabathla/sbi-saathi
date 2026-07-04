from flask import Blueprint, jsonify
import random
from datetime import datetime, timedelta

dashboard_bp = Blueprint("dashboard", __name__)


def _rand_date(days=7):
    dt = datetime.now() - timedelta(
        days=random.randint(0, days),
        hours=random.randint(0, 23),
    )
    return dt.strftime("%d %b, %I:%M %p")


@dashboard_bp.route("/funnel", methods=["GET"])
def funnel():
    return jsonify({
        "funnel": [
            {"step": "Started chat",        "count": 1240, "pct": 100 },
            {"step": "Gave name & DOB",     "count": 1087, "pct": 87.7},
            {"step": "Shared occupation",   "count": 934,  "pct": 75.3},
            {"step": "Uploaded Aadhaar",    "count": 721,  "pct": 58.1},
            {"step": "Got product rec",     "count": 610,  "pct": 49.2},
            {"step": "Completed onboarding","count": 489,  "pct": 39.4},
        ],
        "top_drop_off":  "Aadhaar upload (19.2% drop here)",
        "avg_session_min": 6.2,
        "bc_handoffs":   87,
        "ivr_fallbacks": 43,
        "languages":     {"hi": 61, "en": 19, "bn": 8, "te": 7, "others": 5},
    })


@dashboard_bp.route("/events", methods=["GET"])
def events():
    event_types = [
        ("💼 New job",        "Salary Account"),
        ("💍 Marriage",       "Life Insurance"),
        ("🏠 New home",       "Home Loan"),
        ("👶 New baby",       "Education Plan"),
        ("✈️ Travel",        "Travel Card"),
        ("🚀 Business start", "Mudra Loan"),
        ("🎓 Education",      "Education Loan"),
    ]
    statuses = ["sent", "sent", "opened", "opened", "converted"]
    names    = ["Priya S.", "Ramesh K.", "Sunita D.", "Arjun M.",
                "Kavya T.", "Mohan L.", "Anjali R.", "Deepak V."]
    log = []
    for i in range(20):
        evt, product = random.choice(event_types)
        log.append({
            "id":        f"evt_{i+1:03d}",
            "user":      random.choice(names),
            "event":     evt,
            "product":   product,
            "status":    random.choice(statuses),
            "timestamp": _rand_date(),
        })
    return jsonify({
        "total_detected": 318,
        "nudges_sent":    289,
        "open_rate":      "67%",
        "conversion":     "23%",
        "log":            log,
    })


@dashboard_bp.route("/summary", methods=["GET"])
def summary():
    return jsonify({
        "onboarded":          489,
        "accounts_opened":    341,
        "drop_off_recovered": 87,
        "bc_handoffs":        87,
        "ivr_fallbacks":      43,
        "life_events":        318,
        "nudge_conversions":  73,
        "top_product":        "PM Jan Dhan Yojana",
        "top_language":       "Hindi (61%)",
    })


@dashboard_bp.route("/pricing", methods=["GET"])
def pricing():
    completed   = 489
    saathi_cost = completed * 30
    branch_cost = completed * 1000
    savings     = branch_cost - saathi_cost
    roi         = branch_cost / saathi_cost
    return jsonify({
        "model":             "Outcome-based — ₹30 per successful onboarding only",
        "drop_offs_charged": "₹0",
        "completed":         completed,
        "saathi_cost":       f"₹{saathi_cost:,}",
        "branch_equivalent": f"₹{branch_cost:,}",
        "savings":           f"₹{savings:,}",
        "roi":               f"{roi:.0f}x",
        "whitlabel": {
            "licence_per_bank": "₹2-5 Cr/year",
            "per_onboarding":   "₹15",
            "target_banks":     ["PNB", "Bank of Baroda", "Canara Bank"],
        },
    })