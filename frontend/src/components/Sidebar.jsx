import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard, MdAccessTime, MdLogin, MdTableChart,
  MdEventNote, MdPeople, MdBarChart, MdLogout, MdClose,
} from "react-icons/md";

const NAV = [
  { to: "/dashboard",  icon: MdDashboard,  label: "Dashboard"       },
  { to: "/attendance", icon: MdAccessTime, label: "Attendance"       },
  { to: "/checkinout", icon: MdLogin,      label: "Check In / Out"   },
  { to: "/timesheets", icon: MdTableChart, label: "Timesheets"       },
  { to: "/leaves",     icon: MdEventNote,  label: "Leave Management" },
  { to: "/employees",  icon: MdPeople,     label: "Employees"        },
  { to: "/reports",    icon: MdBarChart,   label: "Reports"          },
];

function SidebarContent({ onClose }) {
  const navigate = useNavigate();
  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: 260, background: "#0F172A" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0, boxShadow: "0 4px 12px rgba(37,99,235,0.4)" }}>
            T
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>TimesheetPro</div>
            <div style={{ color: "#475569", fontSize: 10, fontWeight: 500 }}>HR Management</div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden" style={{ color: "#64748B", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex" }}>
          <MdClose style={{ fontSize: 20 }} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        <p style={{ color: "#334155", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px", marginBottom: 8 }}>
          Main Menu
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              color: isActive ? "#fff" : "#94A3B8",
              background: isActive ? "#2563EB" : "transparent",
              boxShadow: isActive ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
              transition: "all 0.15s ease",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.dataset.active) {
                e.currentTarget.style.color = "";
                e.currentTarget.style.background = "";
              }
            }}
          >
            <Icon style={{ fontSize: 18, flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 12px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>A</div>
          <div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Admin</div>
            <div style={{ color: "#475569", fontSize: 10 }}>Administrator</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, color: "#64748B", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.background = "transparent"; }}
        >
          <MdLogout style={{ fontSize: 18 }} /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop — always visible */}
      <aside className="sidebar-fixed hidden lg:flex">
        <SidebarContent onClose={onClose} />
      </aside>

      {/* Mobile — slide in/out */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="sidebar-fixed lg:hidden"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "tween", duration: 0.22 }}
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
