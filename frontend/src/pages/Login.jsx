import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdPerson, MdLock, MdArrowForward, MdVisibility, MdVisibilityOff } from "react-icons/md";
import "./Login.css";

export default function Login() {
  const [form,    setForm]    = useState({ username: "", password: "", remember: false });
  const [ready,   setReady]   = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  // Block browser autofill from injecting saved values on mount
  const handleLoad = () => setReady(true);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem("access",  res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">

      {/* ── LEFT HERO ── */}
      <div className="login-hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-grid" />

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Brand */}
          <div className="hero-brand">
            <div className="hero-brand-icon">T</div>
            <div>
              <div className="hero-brand-name">TimesheetPro</div>
              <div className="hero-brand-sub">HR Management Platform</div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="hero-heading">
            Manage your<br />
            <span className="hero-heading-accent">workforce</span><br />
            smarter.
          </h1>

          {/* Subheading */}
          <p className="hero-sub">
            One platform for attendance, timesheets,<br />
            leave management and workforce analytics.
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT LOGIN ── */}
      <div className="login-panel">

        {/* Mobile brand */}
        <div className="mobile-brand">
          <div className="hero-brand-icon" style={{ width: 30, height: 30, fontSize: 14 }}>T</div>
          <span className="mobile-brand-name">TimesheetPro</span>
        </div>

        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="lc-header">
            <h2 className="lc-title">Welcome back 👋</h2>
            <p className="lc-sub">Sign in to your TimesheetPro account</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="lc-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠ {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="lc-form" autoComplete="off">
            {/* Honeypot: browsers autofill this instead of real inputs */}
            <input type="text" name="username" style={{ display:'none' }} tabIndex={-1} readOnly />
            <input type="password" name="password" style={{ display:'none' }} tabIndex={-1} readOnly />

            {/* Username */}
            <div className="lc-field">
              <label className="lc-label">Username</label>
              <div className="lc-input-wrap">
                <MdPerson className="lc-icon" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  onAnimationStart={e => e.animationName === 'onAutoFillStart' && setForm(f => ({ ...f, username: '' }))}
                  placeholder="Enter username"
                  className="lc-input"
                  autoComplete="new-password"
                  name="username_field"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="lc-field">
              <div className="lc-label-row">
                <label className="lc-label">Password</label>
                <button type="button" className="lc-forgot">Forgot password?</button>
              </div>
              <div className="lc-input-wrap">
                <MdLock className="lc-icon" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onAnimationStart={e => e.animationName === 'onAutoFillStart' && setForm(f => ({ ...f, password: '' }))}
                  placeholder="Enter password"
                  className="lc-input lc-input-pwd"
                  autoComplete="new-password"
                  name="password_field"
                  required
                />
                <button type="button" className="lc-eye" onClick={() => setShowPwd(s => !s)}>
                  {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="lc-remember">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={e => setForm({ ...form, remember: e.target.checked })}
                className="lc-checkbox"
              />
              <span className="lc-remember-text">Keep me signed in</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading} className="lc-submit">
              {loading
                ? <div className="lc-spinner" />
                : <><span>Sign In</span><MdArrowForward /></>
              }
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
