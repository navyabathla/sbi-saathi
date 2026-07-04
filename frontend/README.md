# SBI Saathi

**Agentic AI Platform for Rural Customer Acquisition & Lifecycle Engagement**

Built for SBI Hackathon 2026 — Theme: Agentic AI & Emerging Tech | Problem Statement: Customer Acquisition

---

## The Problem

India has 190 million unbanked adults. SBI's branch-assisted onboarding costs ₹800–1200 per customer and requires physical presence, English literacy, and smartphone proficiency — three barriers that exclude exactly the people SBI most needs to reach.

## The Solution

SBI Saathi is a full-lifecycle agentic AI platform built on WhatsApp and web that removes all three barriers.

A rural user sends **"Hi"** on WhatsApp → Saathi greets them in Hindi or their regional language → collects their details conversationally (no forms, no jargon) → performs AI-assisted KYC via a secure one-time Aadhaar upload link → recommends the right SBI product (Jan Dhan, Kisan Credit, Mudra Loan, Student Account) → completes onboarding in under 10 minutes, entirely without a branch visit.

**Built-in safety nets:**
- Drop off mid-onboarding? Automatic follow-up after 24 hours.
- Confused? One tap connects to the nearest Bank Mitra (BC agent) with full session context.
- No internet? SMS with a toll-free IVR number preserves the session.

Once onboarded, the **FinMind** engine monitors anonymised transaction signals to detect life milestones (new job, marriage, home purchase, new baby) and sends proactive, personalised WhatsApp nudges — converting passive account holders into active product users.

A built-in **Financial Advisor** answers any banking or investment question in Hindi or English.

SBI relationship managers see everything through a real-time **admin dashboard** showing onboarding funnels, drop-off analysis, FinMind nudge logs, and pricing ROI.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| AI Agent | Google Gemini 1.5 Flash + LangChain | Conversational KYC, nudge generation, financial advisor |
| Language | Hindi + English (IndicBERT roadmap) | Multilingual support |
| KYC / OCR | Google Vision API + Pillow | Aadhaar document parsing |
| Backend | Flask (Python), stateless microservice | REST API, horizontally scalable |
| Database | Firebase Firestore + Firebase Auth | User profiles, session state, phone OTP |
| Delivery | Twilio WhatsApp Business API | Onboarding chat + proactive nudge delivery |
| Frontend | React | Web chat UI + admin dashboard |
| Security | One-time secure webview link, 256-bit SSL | Aadhaar data never touches WhatsApp servers |
| Infrastructure | Docker, cloud-agnostic | Deployable on SBI on-premise for data compliance |

---

## Architecture

**Phase 1 — Saathi (Customer Acquisition)**
User message → Language detection → Conversational data collection → Secure Aadhaar KYC link → OCR verification → Eligibility check → Product recommendation → OTP verification → Onboarding complete

**Phase 2 — FinMind (Lifecycle Engagement)**
Nightly batch job → Transaction signal classifier → Life-event detection → Gemini-generated nudge → WhatsApp delivery → Conversational advisor follow-up

Both phases share a unified Firebase user profile, a common Gemini AI core, and a single admin dashboard.

---

## Security & Compliance

- Aadhaar is never stored on WhatsApp or any third-party server
- One-time tokenised secure link expires in 10 minutes
- Data flows directly to SBI's document management system via encrypted HTTPS
- Compliant with RBI data residency norms

---

## Business Model

- **₹30 per successful digital onboarding, ₹0 for drop-offs** — vs ₹800–1200 branch cost (320x ROI at 1M onboardings/year)
- **FinMind conversion revenue** — life-event nudges convert 3–5x better than generic push notifications
- **White-label SaaS** — licensable to PNB, Bank of Baroda, Canara Bank at ₹2–5 Cr/year + ₹15/onboarding

---

## Project Structure
sbi-saathi/
├── backend/
│   ├── agents/          # Gemini-powered agents (KYC, financial advisor, life-event detection)
│   ├── routes/           # Flask API routes (chat, dashboard, secure KYC)
│   ├── utils/
│   ├── app.py
│   └── config.py
├── frontend/              # React chat UI + admin dashboard
└── README.md

---

## Setup Instructions

### Backend
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with your own credentials:
GEMINI_API_KEY=your_key_here
FIREBASE_CONFIG=your_config_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
GOOGLE_VISION_API_KEY=your_key_here

Run the backend:
```bash
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Team

**Navya Bathla** — B.Tech CSE + AI (Final Year), Indira Gandhi Delhi Technical University for Women (IGDTUW)
Individual Participant

---

## Roadmap

- [x] WhatsApp/web onboarding flow
- [x] Hindi conversational agent
- [x] AI-assisted KYC + OCR
- [x] Admin dashboard with funnel view
- [ ] Bank Mitra handoff integration
- [ ] IndicBERT multilingual expansion
- [ ] FinMind life-event classifier live
- [ ] SBI sandbox integration + security audit
