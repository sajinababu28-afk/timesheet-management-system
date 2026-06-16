import { useState } from "react";
import {
  MdSearch, MdNotifications, MdKeyboardArrowDown,
  MdLightMode, MdDarkMode, MdMenu,
} from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const [drop, setDrop] = useState(false);
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
  });

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <header className="navbar-fixed">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden"
        style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 }}
      >
        <MdMenu style={{ fontSize: 24, color: "#64748B" }} />
      </button>

      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: 280, display: "none" }} className="sm:block">
        <MdSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 18, pointerEvents: "none" }} />
        <input
          type="text"
          placeholder="Search employees, reports…"
          style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, outline: "none", background: "#F8FAFC", fontFamily: "Inter, sans-serif", color: "#0F172A", transition: "border 0.15s" }}
        />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Date */}
      <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500, whiteSpace: "nowrap" }} className="hidden xl:block">
        {today}
      </span>

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        title={dark ? "Light mode" : "Dark mode"}
        style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0, transition: "background 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {dark
          ? <MdLightMode style={{ fontSize: 20, color: "#FBBF24" }} />
          : <MdDarkMode  style={{ fontSize: 20, color: "#64748B" }} />}
      </button>

      {/* Notifications */}
      <button
        style={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <MdNotifications style={{ fontSize: 20, color: "#64748B" }} />
        <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "#EF4444", border: "2px solid #fff" }} />
      </button>

      {/* Profile */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setDrop(d => !d)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 6px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            A
          </div>
          <div className="hidden md:block" style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}>Admin</div>
            <div style={{ fontSize: 10, color: "#94A3B8" }}>Administrator</div>
          </div>
          <MdKeyboardArrowDown style={{ color: "#94A3B8", fontSize: 18, transform: drop ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {drop && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setDrop(false)} />
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 192, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 50, overflow: "hidden", padding: "6px 0" }}>
              {[
                { label: "Profile",  action: () => setDrop(false) },
                { label: "Settings", action: () => setDrop(false) },
                { label: "Sign Out", action: logout, danger: true  },
              ].map(({ label, action, danger }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{ width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: 500, border: "none", background: "transparent", cursor: "pointer", color: danger ? "#EF4444" : "#374151", transition: "background 0.12s", fontFamily: "Inter, sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.background = danger ? "#FEF2F2" : "#F8FAFC"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
