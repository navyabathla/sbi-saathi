import { useState, useRef, useEffect } from "react";

const API = "http://localhost:5000/api";

const C = {
  sbiBlue: "#1a3a6b", sbiGold: "#f0a500", accent: "#0e6fd8",
  success: "#16a34a", bg: "#f0f4fa", card: "#ffffff",
  border: "#dde3ee", text: "#1e293b", muted: "#64748b",
};

// ── Language context (persists across all tabs) ───────────────────────────────
// Stored in a simple module-level variable so all panels share it
let GLOBAL_LANG = "en";

// ── Helpers ───────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{
        width:38, height:38, borderRadius:10,
        background:"linear-gradient(135deg,#1a3a6b,#0e6fd8)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", fontWeight:800, fontSize:15, letterSpacing:1,
      }}>SBI</div>
      <div>
        <div style={{ fontWeight:700, color:C.sbiBlue, fontSize:17, lineHeight:1 }}>Saathi</div>
        <div style={{ fontSize:10, color:C.muted }}>AI Banking Companion</div>
      </div>
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"7px 14px", border:"none", borderRadius:6, cursor:"pointer",
      fontWeight:500, fontSize:12, transition:"all .18s",
      background: active ? C.sbiBlue : "transparent",
      color: active ? "#fff" : C.muted,
    }}>{label}</button>
  );
}

function Bubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", marginBottom:10 }}>
      {!isUser && (
        <div style={{
          width:30, height:30, borderRadius:"50%",
          background:"linear-gradient(135deg,#1a3a6b,#0e6fd8)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", fontSize:12, fontWeight:700,
          marginRight:8, flexShrink:0, alignSelf:"flex-end",
        }}>S</div>
      )}
      <div style={{
        maxWidth:"74%", padding:"10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
        background: isUser ? C.sbiBlue : C.card,
        color: isUser ? "#fff" : C.text,
        fontSize:14, lineHeight:1.6,
        boxShadow: isUser ? "none" : "0 1px 4px rgba(0,0,0,0.07)",
        border: isUser ? "none" : `1px solid ${C.border}`,
        whiteSpace:"pre-wrap",
      }}>{text}</div>
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
      <div style={{
        width:30, height:30, borderRadius:"50%",
        background:"linear-gradient(135deg,#1a3a6b,#0e6fd8)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", fontSize:12, fontWeight:700,
      }}>S</div>
      <div style={{
        background:C.card, border:`1px solid ${C.border}`,
        borderRadius:"4px 16px 16px 16px", padding:"10px 16px",
        display:"flex", gap:5,
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:7, height:7, borderRadius:"50%", background:C.muted,
            animation:`bounce 1.1s ${i*0.18}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  if (!product) return null;
  return (
    <div style={{
      background:"linear-gradient(135deg,#1a3a6b,#0e6fd8)",
      borderRadius:14, padding:18, color:"#fff", margin:"8px 0",
    }}>
      <div style={{ fontSize:10, opacity:.75, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>
        ✓ Recommended for you
      </div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{product.name}</div>
      <div style={{ fontSize:13, opacity:.9, lineHeight:1.5 }}>{product.description}</div>
      {product.benefit && (
        <div style={{
          marginTop:10, background:"rgba(255,255,255,0.15)",
          borderRadius:8, padding:"7px 12px", fontSize:12,
        }}>🎁 {product.benefit}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Login / Onboarding
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [step,       setStep]       = useState("welcome"); // welcome | phone | otp | account
  const [phone,      setPhone]      = useState("");
  const [otp,        setOtp]        = useState("");
  const [accountNo,  setAccountNo]  = useState("");
  const [otpSent,    setOtpSent]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [isNewUser,  setIsNewUser]  = useState(true);

  const sendOtp = () => {
    if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number."); return; }
    setError("");
    setLoading(true);
    // Simulate OTP send (in production: call Twilio / MSG91)
    setTimeout(() => {
      setOtpSent(true);
      setStep("otp");
      setLoading(false);
    }, 1200);
  };

  const verifyOtp = () => {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP."); return; }
    setError("");
    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      if (isNewUser) {
        onLogin({ phone, isNewUser: true });
      } else {
        setStep("account");
      }
    }, 1000);
  };

  const verifyAccount = () => {
    if (accountNo.length < 8) { setError("Enter a valid SBI account number."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ phone, accountNo, isNewUser: false });
    }, 1000);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(160deg,#1a3a6b 0%,#0e6fd8 60%,#f0a500 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div style={{
        background:C.card, borderRadius:20, padding:36, width:"100%", maxWidth:400,
        boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{
            width:64, height:64, borderRadius:16,
            background:"linear-gradient(135deg,#1a3a6b,#0e6fd8)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 12px", color:"#fff", fontWeight:800, fontSize:22,
          }}>SBI</div>
          <div style={{ fontWeight:800, fontSize:22, color:C.sbiBlue }}>Saathi</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>AI Banking Companion</div>
        </div>

        {/* Welcome step */}
        {step === "welcome" && (
          <div>
            <div style={{ fontWeight:700, fontSize:18, color:C.text, marginBottom:8, textAlign:"center" }}>
              Welcome to SBI Saathi
            </div>
            <div style={{ fontSize:13, color:C.muted, textAlign:"center", marginBottom:24, lineHeight:1.6 }}>
              Open an account or log in to access AI-powered banking assistance.
            </div>
            <button onClick={() => { setIsNewUser(true); setStep("phone"); }} style={{
              width:"100%", padding:"13px", borderRadius:10, border:"none",
              background:C.sbiBlue, color:"#fff", fontWeight:700, fontSize:15,
              cursor:"pointer", marginBottom:10,
            }}>
              🆕 Open New Account
            </button>
            <button onClick={() => { setIsNewUser(false); setStep("phone"); }} style={{
              width:"100%", padding:"13px", borderRadius:10,
              border:`2px solid ${C.sbiBlue}`, background:"transparent",
              color:C.sbiBlue, fontWeight:700, fontSize:15, cursor:"pointer",
            }}>
              🔑 Login to Existing Account
            </button>
            <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:C.muted }}>
              🔒 Secured by SBI · RBI Compliant
            </div>
          </div>
        )}

        {/* Phone step */}
        {step === "phone" && (
          <div>
            <button onClick={() => setStep("welcome")} style={{
              background:"none", border:"none", color:C.muted,
              cursor:"pointer", fontSize:13, marginBottom:16,
            }}>← Back</button>
            <div style={{ fontWeight:700, fontSize:17, color:C.text, marginBottom:6 }}>
              {isNewUser ? "Create your account" : "Login to your account"}
            </div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>
              Enter your mobile number to receive an OTP
            </div>
            <div style={{
              display:"flex", border:`1px solid ${C.border}`,
              borderRadius:10, overflow:"hidden", marginBottom:12,
            }}>
              <div style={{
                padding:"12px 14px", background:C.bg,
                borderRight:`1px solid ${C.border}`,
                fontSize:14, color:C.text, fontWeight:600,
              }}>🇮🇳 +91</div>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                placeholder="10-digit mobile number"
                style={{
                  flex:1, padding:"12px 14px", border:"none",
                  fontSize:14, outline:"none", background:"transparent",
                }}
              />
            </div>
            {error && <div style={{ color:"#dc2626", fontSize:12, marginBottom:10 }}>{error}</div>}
            <button onClick={sendOtp} disabled={loading} style={{
              width:"100%", padding:"13px", borderRadius:10, border:"none",
              background: loading ? C.muted : C.sbiBlue,
              color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer",
            }}>
              {loading ? "Sending OTP…" : "Send OTP →"}
            </button>
          </div>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <div>
            <button onClick={() => setStep("phone")} style={{
              background:"none", border:"none", color:C.muted,
              cursor:"pointer", fontSize:13, marginBottom:16,
            }}>← Back</button>
            <div style={{ fontWeight:700, fontSize:17, color:C.text, marginBottom:6 }}>
              Verify OTP
            </div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>
              Enter the 6-digit OTP sent to +91 {phone}
            </div>
            <div style={{
              background:"#f0fdf4", border:`1px solid #86efac`,
              borderRadius:8, padding:"8px 12px", fontSize:12,
              color:"#16a34a", marginBottom:14,
            }}>
              ✓ OTP sent! (Demo: use any 6 digits e.g. 123456)
            </div>
            <input
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              style={{
                width:"100%", padding:"12px 14px", borderRadius:10,
                border:`1px solid ${C.border}`, fontSize:18,
                letterSpacing:8, outline:"none", marginBottom:12,
                textAlign:"center", boxSizing:"border-box",
              }}
            />
            {error && <div style={{ color:"#dc2626", fontSize:12, marginBottom:10 }}>{error}</div>}
            <button onClick={verifyOtp} disabled={loading} style={{
              width:"100%", padding:"13px", borderRadius:10, border:"none",
              background: loading ? C.muted : C.sbiBlue,
              color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer",
            }}>
              {loading ? "Verifying…" : "Verify & Continue →"}
            </button>
            <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:C.muted }}>
              Didn't receive?{" "}
              <span onClick={sendOtp} style={{ color:C.accent, cursor:"pointer" }}>Resend OTP</span>
            </div>
          </div>
        )}

        {/* Existing account number step */}
        {step === "account" && (
          <div>
            <button onClick={() => setStep("otp")} style={{
              background:"none", border:"none", color:C.muted,
              cursor:"pointer", fontSize:13, marginBottom:16,
            }}>← Back</button>
            <div style={{ fontWeight:700, fontSize:17, color:C.text, marginBottom:6 }}>
              Enter Account Details
            </div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>
              Enter your SBI account number to continue
            </div>
            <input
              value={accountNo}
              onChange={e => setAccountNo(e.target.value.replace(/\D/g,"").slice(0,18))}
              placeholder="SBI Account Number"
              style={{
                width:"100%", padding:"12px 14px", borderRadius:10,
                border:`1px solid ${C.border}`, fontSize:15,
                outline:"none", marginBottom:12, boxSizing:"border-box",
              }}
            />
            {error && <div style={{ color:"#dc2626", fontSize:12, marginBottom:10 }}>{error}</div>}
            <button onClick={verifyAccount} disabled={loading} style={{
              width:"100%", padding:"13px", borderRadius:10, border:"none",
              background: loading ? C.muted : C.sbiBlue,
              color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer",
            }}>
              {loading ? "Logging in…" : "Login →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Language Selection
// ─────────────────────────────────────────────────────────────────────────────
function LanguageScreen({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const languages = [
    { code:"hi", label:"हिन्दी",  sub:"Hindi",   available:true  },
    { code:"en", label:"English", sub:"English",  available:true  },
    { code:"bn", label:"বাংলা",   sub:"Bengali",  available:false },
    { code:"ta", label:"தமிழ்",   sub:"Tamil",    available:false },
    { code:"te", label:"తెలుగు",  sub:"Telugu",   available:false },
    { code:"mr", label:"मराठी",   sub:"Marathi",  available:false },
    { code:"gu", label:"ગુજરાતી", sub:"Gujarati", available:false },
    { code:"kn", label:"ಕನ್ನಡ",   sub:"Kannada",  available:false },
  ];

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Logo />
          <div style={{ fontWeight:700, fontSize:22, color:C.sbiBlue, marginTop:20 }}>
            Choose Your Language
          </div>
          <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>
            अपनी भाषा चुनें · Select your preferred language
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
          {languages.map(l => (
            <button key={l.code}
              onClick={() => l.available && setSelected(l.code)}
              style={{
                padding:"16px 12px", borderRadius:14, textAlign:"center",
                border:`2px solid ${selected===l.code ? C.sbiBlue : C.border}`,
                background: selected===l.code ? "#eff6ff" : C.card,
                cursor: l.available ? "pointer" : "not-allowed",
                opacity: l.available ? 1 : 0.45,
                transition:"all .18s", position:"relative",
              }}
            >
              <div style={{ fontSize:20, fontWeight:700, color:C.sbiBlue, marginBottom:2 }}>{l.label}</div>
              <div style={{ fontSize:11, color:C.muted }}>{l.sub}</div>
              {!l.available && (
                <div style={{
                  position:"absolute", top:6, right:8,
                  fontSize:9, background:C.sbiGold, color:"#fff",
                  borderRadius:4, padding:"1px 5px", fontWeight:600,
                }}>SOON</div>
              )}
              {selected===l.code && (
                <div style={{
                  position:"absolute", top:6, left:8,
                  fontSize:12, color:C.success,
                }}>✓</div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          style={{
            width:"100%", padding:"14px", borderRadius:12, border:"none",
            background: selected ? C.sbiBlue : C.border,
            color: selected ? "#fff" : C.muted,
            fontWeight:700, fontSize:16, cursor: selected ? "pointer" : "default",
            transition:"all .18s",
          }}
        >
          {selected ? "Continue →" : "Select a language to continue"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI KYC Panel
// ─────────────────────────────────────────────────────────────────────────────
function KYCPanel({ language, user }) {
  const [step,       setStep]      = useState("intro");   // intro|upload|processing|result
  const [fileName,   setFileName]  = useState("");
  const [kycResult,  setKycResult] = useState(null);
  const fileRef = useRef(null);

  const T = {
    hi: {
      title:       "AI KYC सत्यापन",
      subtitle:    "अपना आधार कार्ड upload करें — AI 30 सेकंड में verify करेगा",
      intro1:      "🔒 आपका data सीधे SBI के secure servers पर जाता है",
      intro2:      "📱 WhatsApp या किसी third-party server पर नहीं",
      intro3:      "⚡ AI 30 सेकंड में आपकी जानकारी extract करेगा",
      uploadBtn:   "आधार कार्ड Upload करें",
      processing:  "AI आपका आधार verify कर रहा है…",
      success:     "KYC सफलतापूर्वक पूर्ण हुआ! ✓",
      startBtn:    "KYC शुरू करें →",
      secure:      "🔒 Secure · RBI Compliant · Data stays with SBI",
      extracted:   "AI द्वारा extract की गई जानकारी:",
    },
    en: {
      title:       "AI KYC Verification",
      subtitle:    "Upload your Aadhaar card — AI verifies it in 30 seconds",
      intro1:      "🔒 Your data goes directly to SBI's secure servers",
      intro2:      "📱 Never stored on WhatsApp or third-party servers",
      intro3:      "⚡ AI extracts your details in 30 seconds",
      uploadBtn:   "Upload Aadhaar Card",
      processing:  "AI is verifying your Aadhaar…",
      success:     "KYC completed successfully! ✓",
      startBtn:    "Start KYC →",
      secure:      "🔒 Secure · RBI Compliant · Data stays with SBI",
      extracted:   "Information extracted by AI:",
    },
  };

  const t = T[language] || T.en;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setStep("processing");

    // Simulate AI OCR processing (30 second animation then result)
    setTimeout(() => {
      setKycResult({
        name:    user?.phone ? `Demo User (${user.phone.slice(-4)})` : "Priya Sharma",
        dob:     "15/08/1998",
        aadhaar: "XXXX-XXXX-7823",
        address: "123, MG Road, New Delhi - 110001",
        status:  "verified",
      });
      setStep("result");
    }, 3000);
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontWeight:700, fontSize:17, color:C.sbiBlue, marginBottom:4 }}>{t.title}</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:24, lineHeight:1.6 }}>{t.subtitle}</div>

      {/* Intro */}
      {step === "intro" && (
        <div>
          <div style={{
            background:"#f0f7ff", border:`1px solid #bfdbfe`,
            borderRadius:14, padding:20, marginBottom:20,
          }}>
            {[t.intro1, t.intro2, t.intro3].map((item, i) => (
              <div key={i} style={{ fontSize:13, color:"#1e40af", marginBottom: i<2 ? 10 : 0, lineHeight:1.6 }}>
                {item}
              </div>
            ))}
          </div>

          {/* Security badges */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
            {["256-bit SSL", "RBI Compliant", "No WhatsApp storage", "AI Powered"].map(b => (
              <span key={b} style={{
                background:C.sbiBlue, color:"#fff",
                borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:600,
              }}>{b}</span>
            ))}
          </div>

          <button onClick={() => setStep("upload")} style={{
            width:"100%", padding:"14px", borderRadius:12, border:"none",
            background:C.sbiBlue, color:"#fff", fontWeight:700,
            fontSize:15, cursor:"pointer",
          }}>{t.startBtn}</button>
        </div>
      )}

      {/* Upload */}
      {step === "upload" && (
        <div>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              border:`2px dashed ${C.sbiBlue}`, borderRadius:14,
              padding:40, textAlign:"center", cursor:"pointer",
              background:"#f8faff", marginBottom:16,
              transition:"all .18s",
            }}
          >
            <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
            <div style={{ fontWeight:600, color:C.sbiBlue, marginBottom:6 }}>{t.uploadBtn}</div>
            <div style={{ fontSize:12, color:C.muted }}>JPG, PNG, PDF · Max 5MB</div>
            <input
              ref={fileRef} type="file"
              accept="image/*,.pdf"
              onChange={handleFile}
              style={{ display:"none" }}
            />
          </div>
          <div style={{ fontSize:11, color:C.muted, textAlign:"center" }}>{t.secure}</div>
        </div>
      )}

      {/* Processing */}
      {step === "processing" && (
        <div style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
          <div style={{ fontWeight:600, color:C.sbiBlue, marginBottom:8 }}>{t.processing}</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:24 }}>
            {fileName}
          </div>
          {/* Progress bar */}
          <div style={{ background:C.border, borderRadius:4, height:8, overflow:"hidden" }}>
            <div style={{
              background:`linear-gradient(90deg, ${C.sbiBlue}, ${C.accent})`,
              borderRadius:4, height:8,
              animation:"progress 3s ease-in-out forwards",
            }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted, marginTop:8 }}>
            <span>Detecting document…</span>
            <span>Extracting data…</span>
            <span>Verifying…</span>
          </div>
        </div>
      )}

      {/* Result */}
      {step === "result" && kycResult && (
        <div>
          <div style={{
            background:"#f0fdf4", border:`1px solid #86efac`,
            borderRadius:14, padding:20, marginBottom:16,
          }}>
            <div style={{ fontWeight:700, color:C.success, fontSize:16, marginBottom:16 }}>
              {t.success}
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:10, fontWeight:600, textTransform:"uppercase", letterSpacing:.8 }}>
              {t.extracted}
            </div>
            {[
              { label:"Name",    value: kycResult.name    },
              { label:"DOB",     value: kycResult.dob     },
              { label:"Aadhaar", value: kycResult.aadhaar },
              { label:"Address", value: kycResult.address },
            ].map(item => (
              <div key={item.label} style={{
                display:"flex", justifyContent:"space-between",
                padding:"8px 0", borderBottom:`1px solid #bbf7d0`,
              }}>
                <span style={{ fontSize:13, color:C.muted }}>{item.label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{item.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStep("intro")} style={{
            width:"100%", padding:"12px", borderRadius:10, border:"none",
            background:C.border, color:C.muted, cursor:"pointer", fontSize:13,
          }}>
            Re-upload →
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Panel
// ─────────────────────────────────────────────────────────────────────────────
function ChatPanel({ language }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [collected, setCollected] = useState({});
  const [product,   setProduct]   = useState(null);
  const [handoff,   setHandoff]   = useState(false);
  const [started,   setStarted]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const startChat = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/start`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setMessages([{ role:"assistant", text: data.message }]);
    } catch {
      setMessages([{ role:"assistant", text: language==="hi"
        ? "माफ़ करें, server से connect नहीं हो पाया। Flask server चालू करें।"
        : "Sorry, could not connect to server. Please start the Flask server." }]);
    }
    setLoading(false);
  };

  useEffect(() => { startChat(); }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages(m => [...m, { role:"user", text }]);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/message`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ session_id: sessionId, message: text, language }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role:"assistant", text: data.message }]);
      if (data.collected) setCollected(c => ({ ...c, ...data.collected }));
      if (data.product)   setProduct(data.product);
      if (data.handoff_available) setHandoff(true);
    } catch {
      setMessages(m => [...m, { role:"assistant", text:
        language==="hi" ? "Connection error। Flask server check करें।" : "Connection error. Check your Flask server." }]);
    }
    setLoading(false);
  };

  const requestHandoff = async () => {
    const res  = await fetch(`${API}/chat/handoff`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await res.json();
    setMessages(m => [...m, { role:"assistant", text: data.user_message }]);
    setHandoff(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{
        padding:"10px 16px", borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:C.card,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:C.success }}/>
          <span style={{ fontSize:13, color:C.muted }}>
            {language==="hi" ? "Saathi online है" : "Saathi is online"}
          </span>
        </div>
        <button onClick={() => { setStarted(false); setMessages([]); setCollected({}); setProduct(null); setSessionId(null); startChat(); }}
          style={{ fontSize:11, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>
          {language==="hi" ? "नई chat ↺" : "New chat ↺"}
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {messages.map((m,i) => (
          <div key={i}>
            <Bubble role={m.role} text={m.text} />
            {m.role==="assistant" && i===messages.length-1 && product && (
              <ProductCard product={product} />
            )}
          </div>
        ))}
        {loading && <Typing />}
        <div ref={bottomRef}/>
      </div>

      {Object.keys(collected).filter(k=>collected[k]).length > 0 && (
        <div style={{
          padding:"8px 14px", borderTop:`1px solid ${C.border}`,
          background:"#f8faff", display:"flex", flexWrap:"wrap", gap:4,
        }}>
          {Object.entries(collected).filter(([,v])=>v).map(([k,v])=>(
            <span key={k} style={{
              background:C.sbiBlue, color:"#fff", borderRadius:20,
              padding:"2px 10px", fontSize:11,
            }}>✓ {k}: {String(v)}</span>
          ))}
        </div>
      )}

      {handoff && (
        <div style={{
          padding:"10px 16px", background:"#fffbeb",
          borderTop:`1px solid #fcd34d`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <span style={{ fontSize:13, color:"#92400e" }}>
            {language==="hi" ? "Bank Mitra से बात करें?" : "Want to talk to a Bank Mitra?"}
          </span>
          <button onClick={requestHandoff} style={{
            background:"#f0a500", color:"#fff", border:"none",
            borderRadius:6, padding:"5px 12px", fontSize:12,
            cursor:"pointer", fontWeight:600,
          }}>
            {language==="hi" ? "Connect करें →" : "Connect →"}
          </button>
        </div>
      )}

      <div style={{ padding:12, borderTop:`1px solid ${C.border}`, display:"flex", gap:8, background:C.card }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()}
          placeholder={language==="hi" ? "यहाँ type करें…" : "Type your message…"}
          style={{
            flex:1, padding:"10px 14px", borderRadius:10,
            border:`1px solid ${C.border}`, fontSize:14, outline:"none", background:C.bg,
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background: loading ? C.muted : C.sbiBlue, color:"#fff",
          border:"none", borderRadius:10, padding:"10px 18px",
          cursor: loading ? "default" : "pointer", fontSize:18,
        }}>➤</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FinMind Panel
// ─────────────────────────────────────────────────────────────────────────────
const SCENARIOS = [
  { key:"new_job",        emoji:"💼", hi:"नई नौकरी",       en:"New Job",        desc:"Salary spike detected" },
  { key:"marriage",       emoji:"💍", hi:"शादी की तैयारी", en:"Marriage",       desc:"Wedding spends detected" },
  { key:"new_home",       emoji:"🏠", hi:"नया घर",          en:"New Home",       desc:"Large EMI started" },
  { key:"new_baby",       emoji:"👶", hi:"नया बच्चा",       en:"New Baby",       desc:"Hospital spends detected" },
  { key:"travel_surge",   emoji:"✈️", hi:"यात्रा",          en:"Travel",         desc:"Flight bookings detected" },
  { key:"business_start", emoji:"🚀", hi:"नया व्यापार",     en:"New Business",   desc:"Vendor payments detected" },
  { key:"education_fee",  emoji:"🎓", hi:"शिक्षा",           en:"Education",      desc:"College fee payment" },
];

function FinMindPanel({ language }) {
  const [scenario, setScenario] = useState(null);
  const [nudge,    setNudge]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const T = {
    hi: { title:"FinMind — Life Event Engine", sub:"Transaction signals से life milestones detect करता है और personalised message भेजता है।", simulate:"एक scenario simulate करें:", preview:"📱 WhatsApp Message Preview", insight:"💡 आपको शायद यह नहीं पता था", products:"🎯 Suggested Products", signal:"Detection signal:" },
    en: { title:"FinMind — Life Event Engine", sub:"Detects life milestones from transaction signals and sends personalised outreach.", simulate:"Simulate a detected life event:", preview:"📱 WhatsApp Message Preview", insight:"💡 Insight you might not know", products:"🎯 Suggested Products", signal:"Detection signal:" },
  };
  const t = T[language] || T.en;

  const generate = async (s) => {
    setScenario(s);
    setNudge(null);
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/life-event`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          scenario: s.key,
          user_name: language==="hi" ? "प्रिया शर्मा" : "Priya Sharma",
          language,
          user_profile: { name: language==="hi" ? "प्रिया शर्मा" : "Priya Sharma", age:28 },
        }),
      });
      const data = await res.json();
      setNudge(data.nudge);
    } catch {
      setError(language==="hi" ? "Server से connect नहीं हो पाया।" : "Could not connect to server.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontWeight:700, fontSize:17, color:C.sbiBlue, marginBottom:4 }}>{t.title}</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>{t.sub}</div>

      <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>{t.simulate}</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
        {SCENARIOS.map(s => (
          <button key={s.key} onClick={() => generate(s)} style={{
            padding:"14px 8px", borderRadius:12, cursor:"pointer", textAlign:"center",
            border:`2px solid ${scenario?.key===s.key ? C.sbiBlue : C.border}`,
            background: scenario?.key===s.key ? "#eff6ff" : C.card,
            transition:"all .18s",
          }}>
            <div style={{ fontSize:22, marginBottom:4 }}>{s.emoji}</div>
            <div style={{ fontWeight:600, fontSize:12, color:C.text }}>{language==="hi" ? s.hi : s.en}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign:"center", padding:32, color:C.muted }}>
          <div style={{ fontSize:28, marginBottom:8 }}>⚡</div>
          <div>{language==="hi" ? "Personalised nudge generate हो रहा है…" : "Generating personalised nudge…"}</div>
        </div>
      )}

      {error && (
        <div style={{ background:"#fef2f2", border:`1px solid #fca5a5`, borderRadius:10, padding:14, color:"#b91c1c", fontSize:13 }}>
          {error}
        </div>
      )}

      {nudge && !loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:.8 }}>
              {t.preview}
            </div>
            <div style={{
              background:"#dcf8c6", borderRadius:"4px 14px 14px 14px",
              padding:16, maxWidth:360, fontSize:14, lineHeight:1.65, color:"#1a1a1a",
              boxShadow:"0 1px 4px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{nudge.emoji_header}</div>
              <div>{nudge.whatsapp_message}</div>
              {nudge.chat_opener && (
                <div style={{
                  marginTop:12, background:"rgba(0,0,0,0.07)", borderRadius:8,
                  padding:"7px 12px", fontSize:12, color:C.sbiBlue, fontWeight:600,
                }}>💬 {nudge.chat_opener}</div>
              )}
            </div>
          </div>

          {nudge.hidden_insight && (
            <div style={{ background:"#fffbeb", border:`1px solid #fcd34d`, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#92400e", marginBottom:4, textTransform:"uppercase" }}>{t.insight}</div>
              <div style={{ fontSize:13, color:"#78350f", lineHeight:1.6 }}>{nudge.hidden_insight}</div>
            </div>
          )}

          {nudge.products?.length > 0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:.8 }}>{t.products}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {nudge.products.map((p,i) => (
                  <span key={i} style={{ background:C.sbiBlue, color:"#fff", borderRadius:20, padding:"4px 14px", fontSize:12 }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ background:"#f0f7ff", border:`1px solid #bfdbfe`, borderRadius:10, padding:12, fontSize:12, color:"#1e40af" }}>
            <strong>{t.signal}</strong> {scenario?.desc}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Advisor Panel
// ─────────────────────────────────────────────────────────────────────────────
function AdvisorPanel({ language }) {
  const [question, setQuestion] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState([]);

  const quickQs = {
    hi: [
      "SIP क्या होता है और कैसे शुरू करें?",
      "CIBIL score कैसे improve करें?",
      "Section 80C में क्या-क्या आता है?",
      "Jan Dhan account के क्या फायदे हैं?",
      "FD और RD में क्या फर्क है?",
      "Home loan के लिए क्या चाहिए?",
    ],
    en: [
      "What is a SIP and how do I start one?",
      "How can I improve my CIBIL score?",
      "What comes under Section 80C?",
      "What are the benefits of Jan Dhan account?",
      "What is the difference between FD and RD?",
      "What do I need to apply for a home loan?",
    ],
  };

  const T = {
    hi: { title:"💬 Financial Advisor", sub:"Banking, investment, या government schemes — कुछ भी पूछें।", popular:"Popular questions", placeholder:"SIP, CIBIL, tax saving — कुछ भी पूछें…" },
    en: { title:"💬 Financial Advisor", sub:"Ask anything about banking, investments, or government schemes.", popular:"Popular questions", placeholder:"Ask about SIP, CIBIL, tax saving, home loan…" },
  };
  const t = T[language] || T.en;

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setQuestion("");
    setLoading(true);
    setHistory(h => [...h, { role:"user", text:query }]);
    try {
      const res  = await fetch(`${API}/chat/advisor`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ question: query, profile:{}, language }),
      });
      const data = await res.json();
      setHistory(h => [...h, { role:"assistant", text: data.answer }]);
    } catch {
      setHistory(h => [...h, { role:"assistant", text:
        language==="hi" ? "Server से connect नहीं हो पाया।" : "Could not connect to server." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontWeight:700, fontSize:17, color:C.sbiBlue }}>{t.title}</div>
        <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{t.sub}</div>
      </div>

      {history.length === 0 && (
        <div style={{ padding:20 }}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:10, fontWeight:600, textTransform:"uppercase", letterSpacing:.8 }}>
            {t.popular}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {(quickQs[language] || quickQs.en).map((q,i) => (
              <button key={i} onClick={() => ask(q)} style={{
                padding:"10px 14px", borderRadius:10, textAlign:"left",
                border:`1px solid ${C.border}`, background:C.card,
                cursor:"pointer", fontSize:13, color:C.text, transition:"all .18s",
              }}>→ {q}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {history.map((m,i) => <Bubble key={i} role={m.role} text={m.text} />)}
        {loading && <Typing />}
      </div>

      <div style={{ padding:12, borderTop:`1px solid ${C.border}`, display:"flex", gap:8, background:C.card }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key==="Enter" && ask()}
          placeholder={t.placeholder}
          style={{
            flex:1, padding:"10px 14px", borderRadius:10,
            border:`1px solid ${C.border}`, fontSize:14, outline:"none", background:C.bg,
          }}
        />
        <button onClick={() => ask()} disabled={loading} style={{
          background: loading ? C.muted : C.sbiBlue, color:"#fff",
          border:"none", borderRadius:10, padding:"10px 18px", cursor:"pointer", fontSize:18,
        }}>➤</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Panel (SBI Admin only)
// ─────────────────────────────────────────────────────────────────────────────
function DashboardPanel() {
  const [summary, setSummary] = useState(null);
  const [funnel,  setFunnel]  = useState(null);
  const [events,  setEvents]  = useState(null);
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    fetch(`${API}/dashboard/summary`).then(r=>r.json()).then(setSummary).catch(()=>{});
    fetch(`${API}/dashboard/funnel`).then(r=>r.json()).then(setFunnel).catch(()=>{});
    fetch(`${API}/dashboard/events`).then(r=>r.json()).then(setEvents).catch(()=>{});
    fetch(`${API}/dashboard/pricing`).then(r=>r.json()).then(setPricing).catch(()=>{});
  }, []);

  const statusColor = { converted:"#16a34a", opened:"#f0a500", sent:C.muted };

  return (
    <div style={{ padding:20, overflowY:"auto" }}>
      <div style={{
        background:"#fef3c7", border:`1px solid #fcd34d`,
        borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#92400e",
      }}>
        🔒 This view is for SBI relationship managers only — not visible to customers.
      </div>

      {summary && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Users Onboarded",   value: summary.onboarded },
            { label:"Accounts Opened",   value: summary.accounts_opened },
            { label:"Nudge Conversions", value: summary.nudge_conversions },
            { label:"BC Handoffs",       value: summary.bc_handoffs },
            { label:"IVR Fallbacks",     value: summary.ivr_fallbacks },
            { label:"Life Events Found", value: summary.life_events },
          ].map(k => (
            <div key={k.label} style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:12, padding:"14px 12px", textAlign:"center",
            }}>
              <div style={{ fontSize:26, fontWeight:800, color:C.sbiBlue }}>{k.value}</div>
              <div style={{ fontSize:11, fontWeight:600, color:C.text, marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {funnel && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Onboarding Funnel</div>
          {funnel.funnel.map((f,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span>{f.step}</span>
                <span style={{ color:C.muted }}>{f.count.toLocaleString()} ({f.pct}%)</span>
              </div>
              <div style={{ background:"#e2e8f0", borderRadius:4, height:8 }}>
                <div style={{
                  background: i===0 ? C.sbiBlue : i<3 ? C.accent : C.sbiGold,
                  borderRadius:4, height:8, width:`${f.pct}%`,
                }}/>
              </div>
            </div>
          ))}
          <div style={{ fontSize:12, color:"#dc2626", marginTop:10 }}>⚠ Top drop-off: {funnel.top_drop_off}</div>
        </div>
      )}

      {pricing && (
        <div style={{
          background:"linear-gradient(135deg,#1a3a6b,#0e6fd8)",
          borderRadius:12, padding:18, marginBottom:16, color:"#fff",
        }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>💰 Pricing Model — Outcome-Based</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
            {[
              { label:"Saathi cost",      value: pricing.saathi_cost },
              { label:"Branch equivalent",value: pricing.branch_equivalent },
              { label:"SBI savings",      value: pricing.savings },
              { label:"ROI",              value: pricing.roi },
            ].map(k => (
              <div key={k.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"10px 12px" }}>
                <div style={{ fontSize:18, fontWeight:700 }}>{k.value}</div>
                <div style={{ fontSize:11, opacity:.8 }}>{k.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, fontSize:12, opacity:.85 }}>{pricing.model}</div>
        </div>
      )}

      {events && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>FinMind — Recent Nudges</div>
          {events.log?.slice(0,8).map((e,i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"8px 0", borderBottom: i<7 ? `1px solid ${C.border}` : "none",
            }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{e.user} — {e.event}</div>
                <div style={{ fontSize:11, color:C.muted }}>{e.product} · {e.timestamp}</div>
              </div>
              <span style={{
                fontSize:10, padding:"3px 10px", borderRadius:20, fontWeight:600,
                background:`${statusColor[e.status]}18`, color: statusColor[e.status],
              }}>{e.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upcoming Features Panel
// ─────────────────────────────────────────────────────────────────────────────
function UpcomingPanel({ language }) {
  const features = [
    { emoji:"🎙️", en:"Voice Input", hi:"Voice Input", desc:"Speak in any Indian language" },
    { emoji:"📱", en:"WhatsApp Integration", hi:"WhatsApp Integration", desc:"Real Twilio-powered messages" },
    { emoji:"📹", en:"Bank Mitra Video Call", hi:"Bank Mitra Video Call", desc:"Live agent assist via WebRTC" },
    { emoji:"📊", en:"Credit Score Checker", hi:"Credit Score Checker", desc:"Live CIBIL score analysis" },
    { emoji:"🧮", en:"EMI Calculator", hi:"EMI Calculator", desc:"Loan eligibility + EMI planner" },
    { emoji:"💹", en:"Portfolio Tracker", hi:"Portfolio Tracker", desc:"Investments, FDs, mutual funds" },
    { emoji:"🏛️", en:"Govt Scheme Matcher", hi:"Govt Scheme Matcher", desc:"PM schemes you qualify for" },
    { emoji:"💸", en:"UPI Analysis", hi:"UPI Analysis", desc:"Spending insights from transactions" },
    { emoji:"🌐", en:"Multilingual Docs", hi:"Multilingual Docs", desc:"Read any document in your language" },
    { emoji:"👆", en:"Biometric Login", hi:"Biometric Login", desc:"Fingerprint + face authentication" },
    { emoji:"🚨", en:"Fraud Detection", hi:"Fraud Detection", desc:"Real-time suspicious activity alerts" },
    { emoji:"📍", en:"Branch Locator", hi:"Branch Locator", desc:"Nearest SBI with live wait times" },
    { emoji:"📋", en:"Tax Filing Assistant", hi:"Tax Filing Assistant", desc:"ITR filing guidance + reminders" },
    { emoji:"🛡️", en:"Insurance Tracker", hi:"Insurance Tracker", desc:"All policies in one place" },
    { emoji:"👨‍👩‍👧", en:"Family Account Linking", hi:"Family Account Linking", desc:"Manage family finances together" },
  ];

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontWeight:700, fontSize:17, color:C.sbiBlue, marginBottom:4 }}>
        {language==="hi" ? "🔜 आने वाले Features" : "🔜 Upcoming Features"}
      </div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
        {language==="hi"
          ? "ये features अगले rounds में implement होंगे। Platform की full vision:"
          : "These features will be implemented in upcoming rounds. The full platform vision:"}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {features.map((f,i) => (
          <div key={i} style={{
            background:C.card, border:`1px solid ${C.border}`,
            borderRadius:12, padding:"14px 12px",
            display:"flex", alignItems:"flex-start", gap:10,
            position:"relative", overflow:"hidden",
          }}>
            <div style={{
              position:"absolute", top:8, right:8,
              fontSize:9, background:C.sbiGold, color:"#fff",
              borderRadius:4, padding:"1px 6px", fontWeight:700,
            }}>SOON</div>
            <div style={{ fontSize:24, flexShrink:0 }}>{f.emoji}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:C.text }}>
                {language==="hi" ? f.hi : f.en}
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP — manages login → language → main app flow
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState("login");    // login | language | app
  const [language, setLanguage] = useState("en");
  const [user,     setUser]     = useState(null);
  const [tab,      setTab]      = useState("chat");

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen("language");
  };

  const handleLanguage = (lang) => {
    setLanguage(lang);
    GLOBAL_LANG = lang;
    setScreen("app");
  };

  const tabs = [
    { id:"chat",     label: language==="hi" ? "💬 Chat"     : "💬 Chat"     },
    { id:"kyc",      label: language==="hi" ? "🪪 KYC"      : "🪪 KYC"      },
    { id:"finmind",  label: language==="hi" ? "⚡ FinMind"  : "⚡ FinMind"  },
    { id:"advisor",  label: language==="hi" ? "🧑‍💼 Advisor" : "🧑‍💼 Advisor" },
    { id:"upcoming", label: language==="hi" ? "🔜 Coming"   : "🔜 Coming"   },
    { id:"admin",    label: language==="hi" ? "📊 Admin"    : "📊 Admin"    },
  ];

  if (screen === "login")    return <LoginScreen onLogin={handleLogin} />;
  if (screen === "language") return <LanguageScreen onSelect={handleLanguage} />;

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:C.bg, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Top nav */}
      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        padding:"10px 20px", display:"flex", alignItems:"center",
        justifyContent:"space-between", position:"sticky", top:0, zIndex:10,
      }}>
        <Logo />
        <div style={{ display:"flex", gap:2, background:C.bg, borderRadius:8, padding:3 }}>
          {tabs.map(t => (
            <TabBtn key={t.id} label={t.label} active={tab===t.id} onClick={() => setTab(t.id)} />
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            fontSize:11, background:language==="hi"?"#eff6ff":"#f0fdf4",
            color: language==="hi"?C.sbiBlue:C.success,
            border:`1px solid ${language==="hi"?"#bfdbfe":"#86efac"}`,
            borderRadius:20, padding:"3px 10px", fontWeight:600,
          }}>
            {language==="hi" ? "🇮🇳 हिन्दी" : "🇬🇧 English"}
          </div>
          <button onClick={() => setScreen("login")} style={{
            fontSize:11, color:C.muted, background:"none", border:`1px solid ${C.border}`,
            borderRadius:6, padding:"4px 10px", cursor:"pointer",
          }}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, maxWidth:860, margin:"20px auto", width:"100%", padding:"0 16px" }}>
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:16, overflow:"hidden",
          height:"calc(100vh - 100px)",
          display:"flex", flexDirection:"column",
        }}>
          {tab==="chat"     && <ChatPanel     language={language} user={user} />}
          {tab==="kyc"      && <div style={{ overflowY:"auto", flex:1 }}><KYCPanel language={language} user={user} /></div>}
          {tab==="finmind"  && <div style={{ overflowY:"auto", flex:1 }}><FinMindPanel language={language} /></div>}
          {tab==="advisor"  && <AdvisorPanel  language={language} />}
          {tab==="upcoming" && <div style={{ overflowY:"auto", flex:1 }}><UpcomingPanel language={language} /></div>}
          {tab==="admin"    && <div style={{ overflowY:"auto", flex:1 }}><DashboardPanel /></div>}
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes progress { 0%{width:0%} 100%{width:100%} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        input:focus{border-color:#1a3a6b !important; box-shadow:0 0 0 3px rgba(26,58,107,0.1)}
        button:hover{opacity:0.92}
      `}</style>
    </div>
  );
}