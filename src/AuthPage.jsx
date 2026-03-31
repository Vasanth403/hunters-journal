import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "./lib/supabase";

const FRIENDLY_ERRORS = {
  "Invalid login credentials":    "Incorrect email or password.",
  "Email not confirmed":          "Please confirm your email before signing in.",
  "User already registered":      "An account with this email already exists.",
  "Password should be at least 6 characters": "Password must be at least 6 characters.",
};

function friendlyError(msg) {
  for (const [key, val] of Object.entries(FRIENDLY_ERRORS)) {
    if (msg?.includes(key)) return val;
  }
  return msg || "Something went wrong. Please try again.";
}

export default function AuthPage() {
  const [mode, setMode]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [info, setInfo]         = useState(null);

  function switchMode(m) { setMode(m); setError(null); setInfo(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Auth state change in App.jsx handles the rest
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Account created! Check your email to verify, then sign in.");
        switchMode("signin");
      }
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="auth-page">
      <div className="bg-layer" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="auth-box"
      >
        {/* Brand */}
        <div className="auth-brand">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="setup-eyebrow"
          >
            SYSTEM INTERFACE
          </motion.p>
          <h1 className="setup-title">HUNTER'S<br />JOURNAL</h1>
          <p className="auth-subtitle">
            {mode === "signin"
              ? "Welcome back, Hunter. Resume your journey."
              : "A new player has been detected. Register to begin."}
          </p>
          <div className="setup-divider" />
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "signin"  ? "auth-tab-active" : ""}`} onClick={() => switchMode("signin")}>Sign In</button>
          <button className={`auth-tab ${mode === "signup" ? "auth-tab-active" : ""}`} onClick={() => switchMode("signup")}>Create Account</button>
        </div>

        {/* Feedback */}
        {error && <div className="auth-feedback auth-error">{error}</div>}
        {info  && <div className="auth-feedback auth-info">{info}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Email</label>
            <input
              type="email" className="field-input" placeholder="hunter@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoFocus required
            />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password" className="field-input"
              placeholder={mode === "signup" ? "Minimum 6 characters" : "••••••••"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6}
            />
          </div>

          <button type="submit" className="btn-setup-start" disabled={loading}>
            {loading ? "AUTHENTICATING…" : mode === "signin" ? "ARISE" : "AWAKEN"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-or">
          <div className="auth-or-line" />
          <span className="auth-or-text">or</span>
          <div className="auth-or-line" />
        </div>

        {/* Google OAuth */}
        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  );
}
