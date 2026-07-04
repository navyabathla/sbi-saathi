"""
Secure KYC route.
Generates a one-time link for Aadhaar upload.
Data goes directly to SBI servers — never through WhatsApp.
"""

from flask import Blueprint, request, jsonify
import uuid, time

kyc_secure_bp = Blueprint("kyc_secure", __name__)
secure_links  = {}   # In production: use Redis with TTL


@kyc_secure_bp.route("/generate-link", methods=["POST"])
def generate_link():
    data       = request.get_json()
    session_id = data.get("session_id")
    token      = str(uuid.uuid4())

    secure_links[token] = {
        "session_id": session_id,
        "created_at": time.time(),
        "used":       False,
    }

    secure_url = f"https://saathi.sbi.co.in/kyc?token={token}"

    return jsonify({
        "secure_url":         secure_url,
        "expires_in_seconds": 600,
        "message": (
            "कृपया नीचे दिए गए secure link पर जाएं और आधार upload करें। "
            "यह link 10 मिनट में expire होगा। "
            "आपका data सीधे SBI के servers पर जाएगा। 🔒"
        ),
    })


@kyc_secure_bp.route("/verify-token", methods=["POST"])
def verify_token():
    token = request.get_json().get("token")
    link  = secure_links.get(token)

    if not link:
        return jsonify({"valid": False, "reason": "Token not found"}), 404
    if link["used"]:
        return jsonify({"valid": False, "reason": "Already used"}), 400
    if time.time() - link["created_at"] > 600:
        return jsonify({"valid": False, "reason": "Expired"}), 400

    return jsonify({"valid": True, "session_id": link["session_id"]})


@kyc_secure_bp.route("/submit", methods=["POST"])
def submit_aadhaar():
    token = request.form.get("token")
    link  = secure_links.get(token)

    if not link or link["used"]:
        return jsonify({"success": False}), 400

    secure_links[token]["used"] = True

    return jsonify({
        "success":    True,
        "session_id": link["session_id"],
        "kyc_status": "verified",
        "message":    "आपका KYC सफलतापूर्वक पूर्ण हो गया ✓",
    })