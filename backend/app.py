from flask import Flask
from flask_cors import CORS
from routes.chat import chat_bp
from routes.dashboard import dashboard_bp
from routes.kyc_secure import kyc_secure_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register all blueprints
app.register_blueprint(chat_bp,       url_prefix="/api/chat")
app.register_blueprint(dashboard_bp,  url_prefix="/api/dashboard")
app.register_blueprint(kyc_secure_bp, url_prefix="/api/kyc")


@app.route("/health")
def health():
    return {"status": "ok", "platform": "SBI Saathi v2"}


if __name__ == "__main__":
    app.run(debug=True, port=5000)