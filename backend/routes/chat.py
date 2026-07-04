from flask import Blueprint, request, jsonify
import uuid
from agents.kyc_agent import (
    run_kyc_agent, get_eligible_products,
    generate_followup_message, generate_smart_greeting,
)
from agents.life_event_agent import (
    detect_life_events, generate_engagement_nudge,
    generate_synthetic_signals,
)
from agents.financial_advisor import ask_advisor, get_scheme_recommendations

chat_bp = Blueprint("chat", __name__)

# In-memory session store
# In production: replace with Firebase Firestore
sessions = {}


# ── POST /api/chat/start ──────────────────────────────────────────────────────
# Call this first to begin a new onboarding session
@chat_bp.route("/start", methods=["POST"])
def start():
    data      = request.get_json() or {}
    language  = data.get("language", "hi")
    user_data = data.get("user_data")       # optional extra context
    session_id = str(uuid.uuid4())

    # Create fresh session
    sessions[session_id] = {
        "history":  [],
        "profile":  {},
        "language": language,
        "step":     "greeting",
    }

    greeting = generate_smart_greeting(user_data, language)

    sessions[session_id]["history"].append({"role": "user",      "content": "Namaste"})
    sessions[session_id]["history"].append({"role": "assistant", "content": greeting})

    return jsonify({
        "session_id": session_id,
        "message":    greeting,
        "next_step":  "collect_info",
    })


# ── POST /api/chat/message ────────────────────────────────────────────────────
# Send a user message and get Saathi's reply
@chat_bp.route("/message", methods=["POST"])
def message():
    data       = request.get_json()
    session_id = data.get("session_id")
    user_input = data.get("message", "")

    if session_id not in sessions:
        return jsonify({"error": "Session not found. Please start a new chat."}), 404

    session = sessions[session_id]
    session["history"].append({"role": "user", "content": user_input})

    # Run the KYC agent
    result = run_kyc_agent(
        conversation_history=session["history"],
        user_profile=session["profile"],
        language=session["language"],
    )

    # Update profile with newly collected fields
    if result.get("collected"):
        session["profile"].update(result["collected"])

    session["step"] = result.get("next_step", "collect_info")
    session["history"].append({"role": "assistant", "content": result["message"]})

    # Get eligible products if onboarding is near complete
    eligible = []
    if session["step"] in ("recommend_product", "complete"):
        eligible = get_eligible_products(session["profile"])

    # Auto-detect if user is asking for human help
    handoff_keywords = ["agent", "human", "manav", "व्यक्ति", "help", "confused", "samajh"]
    wants_handoff = any(kw in user_input.lower() for kw in handoff_keywords)

    return jsonify({
        "session_id":       session_id,
        "message":          result["message"],
        "next_step":        result["next_step"],
        "collected":        session["profile"],
        "eligible_products": eligible,
        "product":          result.get("product"),
        "handoff_available": wants_handoff,
    })


# ── POST /api/chat/handoff ────────────────────────────────────────────────────
# Route user to nearest Bank Mitra (human agent)
@chat_bp.route("/handoff", methods=["POST"])
def handoff():
    data       = request.get_json()
    session_id = data.get("session_id")
    session    = sessions.get(session_id, {})
    profile    = session.get("profile", {})
    step       = session.get("step", "unknown")

    # Package everything for the BC agent
    bc_message = (
        f"🔔 नया Saathi लीड\n\n"
        f"नाम: {profile.get('name', 'अज्ञात')}\n"
        f"मोबाइल: {profile.get('mobile', 'N/A')}\n"
        f"पेशा: {profile.get('occupation', 'N/A')}\n"
        f"आय: ₹{profile.get('income', 'N/A')}/माह\n"
        f"रुके: {step} पर\n\n"
        f"AI ने यह जानकारी पहले ही collect की है। बाकी आप complete करें।"
    )

    return jsonify({
        "handoff_initiated": True,
        "bc_message":        bc_message,
        "bc_assigned":       "SBI Business Correspondent — Sector 12",
        "estimated_callback": "15-30 minutes",
        "user_message": (
            "आपकी request मिल गई 🙏 हमारे Bank Mitra "
            "15-30 मिनट में call करेंगे। "
            "आपकी सारी जानकारी उन्हें भेज दी गई है।"
        ),
    })


# ── POST /api/chat/ivr-fallback ───────────────────────────────────────────────
# Triggered when user loses internet mid-session
@chat_bp.route("/ivr-fallback", methods=["POST"])
def ivr_fallback():
    data       = request.get_json()
    session_id = data.get("session_id")
    mobile     = data.get("mobile", "")
    session    = sessions.get(session_id, {})
    step       = session.get("step", "collect_info")

    ivr_menus = {
        "collect_info":      "1 दबाएं — नाम और जन्मतिथि के लिए",
        "request_aadhaar":   "1 दबाएं — आधार link SMS पाने के लिए",
        "recommend_product": "1 दबाएं — अपनी recommended scheme सुनने के लिए",
    }

    return jsonify({
        "sms_sent_to": mobile,
        "sms_text": (
            f"Saathi: Internet नहीं? कोई बात नहीं! "
            f"1800-123-4567 (toll-free) पर call करें। "
            f"आपकी जानकारी safe है। Code: {session_id[:8]}"
        ),
        "ivr_number":       "1800-123-4567",
        "ivr_menu":         ivr_menus.get(step, "1 दबाएं — जारी रखने के लिए"),
        "session_preserved": True,
    })


# ── POST /api/chat/followup ───────────────────────────────────────────────────
# Generate re-engagement message for dropped-off users
@chat_bp.route("/followup", methods=["POST"])
def followup():
    data = request.get_json()
    msg  = generate_followup_message(
        data.get("user_name", ""),
        data.get("last_step", "collect_info"),
        data.get("language", "hi"),
    )
    return jsonify({"followup_message": msg})


# ── POST /api/chat/life-event ─────────────────────────────────────────────────
# Detect life events and generate personalised nudge (Phase 2)
@chat_bp.route("/life-event", methods=["POST"])
def life_event():
    data         = request.get_json()
    scenario     = data.get("scenario", "new_job")
    user_name    = data.get("user_name", "User")
    language     = data.get("language", "hi")
    user_profile = data.get("user_profile", {})
    signals      = (
        data.get("transaction_signals") or
        generate_synthetic_signals(scenario)
    )

    detected = detect_life_events(signals)
    if not detected:
        return jsonify({"detected_events": [], "nudge": None})

    nudge = generate_engagement_nudge(
        user_name=user_name,
        life_event=detected[0],
        user_profile=user_profile,
        language=language,
    )

    return jsonify({
        "detected_events": detected,
        "primary_event":   detected[0],
        "nudge":           nudge,
    })


# ── POST /api/chat/advisor ────────────────────────────────────────────────────
# Free AI financial advisor Q&A
@chat_bp.route("/advisor", methods=["POST"])
def advisor():
    data     = request.get_json()
    question = data.get("question", "")
    profile  = data.get("profile", {})
    language = data.get("language", "hi")
    schemes  = get_scheme_recommendations(profile)
    answer   = ask_advisor(question, profile, language)

    return jsonify({
        "answer":               answer,
        "recommended_schemes":  schemes,
    })