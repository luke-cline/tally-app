import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import tallyIcon from "/tally-brand-assets/brand/tally-logomark-2048.png"

export default function Login() {
  const { signIn, sendMagicLink } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate("/")
    }
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) {
      setError("Enter your email first")
      return
    }
    setLoading(true)
    setError("")
    const { error } = await sendMagicLink(email)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMagicSent(true)
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      setError("Enter your email first")
      return
    }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setForgotSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="orb-field">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        <div className="orb orb4"></div>
      </div>

      <svg className="grid-layer" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#221C18" strokeWidth="0.5" opacity="0.06"/>
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#login-grid)"/>
      </svg>

      <svg className="chart-layer" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path className="chart-line l1" d="M -50 680 C 180 660, 320 520, 500 540 C 680 560, 780 340, 1020 300 C 1180 273, 1320 220, 1500 160"
              fill="none" stroke="#508EED" strokeWidth="2.5" opacity="0.55"/>
        <path className="chart-line l2" d="M -50 760 C 220 740, 380 660, 600 670 C 800 680, 880 480, 1140 440 C 1280 418, 1370 370, 1500 330"
              fill="none" stroke="#A55A40" strokeWidth="2" opacity="0.4"/>
        <path className="chart-line l3" d="M -50 560 C 150 545, 260 460, 420 455 C 600 450, 660 340, 860 310 C 1020 288, 1140 250, 1300 210"
              fill="none" stroke="#529CEC" strokeWidth="2" opacity="0.35"/>
        <circle className="chart-dot" style={{ animationDelay: "2.2s, 2.7s" }} cx="1020" cy="300" r="4" fill="#508EED"/>
        <circle className="chart-dot" style={{ animationDelay: "2.9s, 3.4s" }} cx="1140" cy="440" r="4" fill="#A55A40"/>
        <circle className="chart-dot" style={{ animationDelay: "2.5s, 3.0s" }} cx="860" cy="310" r="4" fill="#529CEC"/>
      </svg>

      <div className="particle" style={{ width: 6, height: 6, background: "#508EED", top: "22%", left: "12%", "--dx": "14px", "--dy": "-18px", animationDuration: "9s" }}></div>
      <div className="particle" style={{ width: 4, height: 4, background: "#A55A40", top: "68%", left: "8%", "--dx": "-10px", "--dy": "14px", animationDuration: "11s", animationDelay: "1.5s" }}></div>
      <div className="particle" style={{ width: 5, height: 5, background: "#529CEC", top: "14%", right: "16%", "--dx": "-12px", "--dy": "16px", animationDuration: "10s", animationDelay: "0.7s" }}></div>
      <div className="particle" style={{ width: 4, height: 4, background: "#A55A40", top: "78%", right: "20%", "--dx": "16px", "--dy": "-12px", animationDuration: "8.5s", animationDelay: "2.2s" }}></div>
      <div className="particle" style={{ width: 6, height: 6, background: "#508EED", top: "46%", right: "6%", "--dx": "-14px", "--dy": "-14px", animationDuration: "12s", animationDelay: "0.3s" }}></div>

      <div className="grain"></div>

      <div className="wordmark-footer">Tally</div>

      <div className="card">
        {magicSent ? (
          <div className="text-center">
            <h1>Check your inbox</h1>
            <p className="subhead">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
            <button type="button" className="btn-secondary" onClick={() => setMagicSent(false)}>Back to login</button>
          </div>
        ) : showForgot ? (
          <div>
            <h1>Reset your password</h1>
            <p className="subhead">Enter your email and we'll send you a reset link.</p>
            {forgotSent ? (
              <div className="text-center">
                <p className="subhead">Check <strong>{email}</strong> for reset instructions.</p>
                <button type="button" className="btn-secondary" onClick={() => { setShowForgot(false); setForgotSent(false); }}>Back to login</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="field">
                  <div className="field-row"><label htmlFor="forgot-email">Email</label></div>
                  <input type="email" id="forgot-email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {error && <p className="subhead" style={{ color: "var(--clay)" }}>{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Sending..." : "Send reset link"}
                </button>
                <button type="button" className="btn-secondary" style={{ marginTop: 12 }} onClick={() => setShowForgot(false)}>Cancel</button>
              </form>
            )}
          </div>
        ) : (
          <>
            <div className="brand-slot">
              <img src={tallyIcon} alt="Tally" className="brand-icon" />
            </div>

            <h1>Hello again!</h1>
            <p className="subhead">Household + Business. Zero monthly cost.</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <div className="field-row"><label htmlFor="email">Email</label></div>
                <input type="email" id="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="field">
                <div className="field-row">
                  <label htmlFor="password">Password</label>
                  <button type="button" onClick={() => setShowForgot(true)} className="forgot" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Forgot password?</button>
                </div>
                <div className="password-wrap">
                  <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="toggle-visibility" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="remember-row">
                <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <label htmlFor="remember">Remember me</label>
              </div>

              {error && <p className="subhead" style={{ color: "var(--clay)", marginBottom: 16 }}>{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="divider"><div className="line"></div><span>or</span><div className="line"></div></div>

            <button type="button" disabled={loading || !email} onClick={handleMagicLink} className="btn-secondary">
              Send magic link
            </button>

            <div className="footer-line">
              Don't have an account? <span style={{ color: "#508EED", fontWeight: 600, cursor: "default" }}>Create one</span>
            </div>
          </>
        )}
      </div>

      <style>{loginStyles}</style>
    </div>
  )
}

const loginStyles = `
  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
    overflow: hidden;
    background: #E7E4D9;
    font-family: 'Inter', sans-serif;
  }

  :root[class~="dark"] .login-root {
    background: #1A1512;
  }

  .orb-field {
    position: absolute;
    inset: -10%;
    z-index: 0;
    filter: blur(70px);
  }

  :root[class~="dark"] .orb-field { opacity: 0.7; }

  .orb { position: absolute; border-radius: 50%; }

  .orb1 {
    width: 50vw; height: 50vw;
    background: radial-gradient(circle at 30% 30%, #A55A40, transparent 68%);
    top: -14%; left: -10%;
    opacity: 0.5;
    animation: orbit1 24s ease-in-out infinite;
  }
  .orb2 {
    width: 44vw; height: 44vw;
    background: radial-gradient(circle at 60% 40%, #508EED, transparent 68%);
    bottom: -14%; right: -8%;
    opacity: 0.48;
    animation: orbit2 28s ease-in-out infinite;
  }
  .orb3 {
    width: 32vw; height: 32vw;
    background: radial-gradient(circle at 50% 50%, #529CEC, transparent 68%);
    top: 26%; right: 8%;
    opacity: 0.4;
    animation: orbit3 20s ease-in-out infinite;
  }
  .orb4 {
    width: 26vw; height: 26vw;
    background: radial-gradient(circle at 50% 50%, #C97A5C, transparent 70%);
    bottom: 8%; left: 18%;
    opacity: 0.32;
    animation: orbit4 23s ease-in-out infinite;
  }

  @keyframes orbit1 {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(7%, 9%) scale(1.14); }
  }
  @keyframes orbit2 {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-9%, -7%) scale(1.1); }
  }
  @keyframes orbit3 {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-11%, 11%) scale(0.88); }
  }
  @keyframes orbit4 {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(8%, -10%) scale(1.06); }
  }

  .grid-layer {
    position: absolute; inset: 0; z-index: 1;
    opacity: 0.5;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%);
  }

  :root[class~="dark"] .grid-layer path { stroke: #F5FEFB; }

  .chart-layer { position: absolute; inset: 0; z-index: 1; }

  .chart-line {
    stroke-dasharray: 2400;
    stroke-dashoffset: 2400;
    animation: draw 5.5s cubic-bezier(.16,.84,.44,1) forwards;
  }
  .chart-line.l2 { animation-delay: 0.5s; }
  .chart-line.l3 { animation-delay: 1s; }

  @keyframes draw { to { stroke-dashoffset: 0; } }

  .chart-dot {
    opacity: 0;
    animation: popIn 0.5s ease-out forwards, pulse 3.2s ease-in-out 2.5s infinite;
  }
  @keyframes popIn { to { opacity: 1; } }
  @keyframes pulse { 0%, 100% { r: 4; opacity: 0.9; } 50% { r: 6.5; opacity: 0.5; } }

  .particle {
    position: absolute;
    border-radius: 50%;
    z-index: 1;
    animation: drift-p ease-in-out infinite;
  }
  @keyframes drift-p {
    0%, 100% { transform: translate(0,0); opacity: 0.35; }
    50% { transform: translate(var(--dx), var(--dy)); opacity: 0.7; }
  }

  .grain {
    position: absolute; inset: 0; z-index: 1;
    opacity: 0.03;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .wordmark-footer {
    position: absolute;
    bottom: 12px;
    right: 24px;
    z-index: 1;
    pointer-events: none;
    opacity: 0.12;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #508EED;
    user-select: none;
  }

  :root[class~="dark"] .wordmark-footer {
    opacity: 0.08;
    color: #529CEC;
  }

  @media (prefers-reduced-motion: reduce) {
    .orb1, .orb2, .orb3, .orb4, .particle { animation: none; }
    .chart-line { animation: none; stroke-dashoffset: 0; }
    .chart-dot { animation: none; opacity: 1; }
  }

  .card {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 420px;
    background: rgba(245, 254, 251, 0.78);
    backdrop-filter: blur(26px) saturate(1.6);
    -webkit-backdrop-filter: blur(26px) saturate(1.6);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 24px;
    padding: 40px 40px 36px;
    box-shadow: 0 40px 90px -28px rgba(34, 28, 24, 0.32), 0 1px 0 rgba(255,255,255,0.5) inset;
  }

  :root[class~="dark"] .card {
    background: rgba(47, 40, 34, 0.82);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 40px 90px -28px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset;
  }

  .brand-slot {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .brand-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    object-fit: contain;
  }

  h1 {
    font-family: 'Poppins', sans-serif;
    font-size: 27px;
    font-weight: 600;
    color: #221C18;
    margin: 0 0 6px;
    text-align: center;
    letter-spacing: -0.01em;
  }

  :root[class~="dark"] h1 { color: #F5FEFB; }

  .subhead {
    font-size: 14.5px;
    color: #6B645D;
    margin: 0 0 30px;
    text-align: center;
    line-height: 1.5;
  }

  :root[class~="dark"] .subhead { color: #B8B2A8; }

  .field { margin-bottom: 18px; }

  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  label { font-size: 13px; font-weight: 600; color: #221C18; }
  :root[class~="dark"] label { color: #F5FEFB; }

  .forgot { font-size: 13px; font-weight: 500; color: #508EED; text-decoration: none; }
  .forgot:hover { text-decoration: underline; }

  input[type="email"],
  input[type="password"],
  input[type="text"] {
    width: 100%;
    padding: 13px 16px;
    border-radius: 10px;
    border: 1.5px solid #D3D1C6;
    background: rgba(245,254,251,0.7);
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    color: #221C18;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }

  :root[class~="dark"] input[type="email"],
  :root[class~="dark"] input[type="password"],
  :root[class~="dark"] input[type="text"] {
    background: rgba(36, 30, 25, 0.7);
    border-color: #3A322B;
    color: #F5FEFB;
  }

  input::placeholder { color: #9C968F; }
  :root[class~="dark"] input::placeholder { color: #7A7168; }

  input:focus {
    border-color: #508EED;
    background: #F5FEFB;
    box-shadow: 0 0 0 4px rgba(80, 142, 237, 0.15);
  }

  :root[class~="dark"] input:focus { background: #241E19; }

  .password-wrap { position: relative; }
  .password-wrap input { padding-right: 46px; }

  .toggle-visibility {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #6B645D;
    display: flex;
    padding: 4px;
  }

  .remember-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .remember-row input[type="checkbox"] { width: 18px; height: 18px; border-radius: 5px; accent-color: #508EED; cursor: pointer; }
  .remember-row label { font-weight: 500; color: #6B645D; cursor: pointer; }
  :root[class~="dark"] .remember-row label { color: #B8B2A8; }

  .btn-primary {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #508EED, #529CEC);
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 10px 24px -8px rgba(80, 142, 237, 0.55);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 28px -8px rgba(80, 142, 237, 0.65); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .divider { display: flex; align-items: center; gap: 16px; margin: 22px 0; }
  .divider .line { flex: 1; height: 1px; background: #D3D1C6; }
  .divider span { font-size: 12px; color: #6B645D; font-weight: 500; }

  .btn-secondary {
    width: 100%;
    padding: 13px;
    border-radius: 10px;
    border: 1.5px solid #D3D1C6;
    background: rgba(245,254,251,0.5);
    color: #221C18;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 22px;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .btn-secondary:hover { border-color: #6B645D; background: rgba(213,209,198,0.4); }
  .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

  :root[class~="dark"] .btn-secondary {
    background: rgba(36, 30, 25, 0.5);
    border-color: #3A322B;
    color: #F5FEFB;
  }
  :root[class~="dark"] .btn-secondary:hover {
    background: rgba(36, 30, 25, 0.8);
    border-color: #4A4038;
  }

  .footer-line { text-align: center; font-size: 14px; color: #6B645D; }
  :root[class~="dark"] .footer-line { color: #B8B2A8; }
  .footer-line a { color: #508EED; font-weight: 600; text-decoration: none; }
  .footer-line a:hover { text-decoration: underline; }

  @media (max-width: 480px) {
    .card { padding: 32px 24px 28px; border-radius: 18px; }
    .login-root { padding: 24px 16px; }
  }
`