import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar         from "./components/Sidebar";
import Navbar          from "./components/Navbar";
import Login           from "./pages/Login";
import Dashboard       from "./pages/Dashboard";
import Attendance      from "./pages/Attendance";
import CheckInOut      from "./pages/CheckInOut";
import Timesheets      from "./pages/Timesheets";
import LeaveManagement from "./pages/LeaveManagement";
import Employees       from "./pages/Employees";
import Reports         from "./pages/Reports";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("access");
  if (!token) return <Navigate to="/" replace />;

  return (
    <div className="layout-shell">
      {/* Fixed sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main column — offset by sidebar on desktop */}
      <div className="layout-main flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(p => !p)} />
        <main className="page-content">
          <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000, style: { fontFamily: "Inter, sans-serif", fontSize: 13 } }}
      />
      <Routes>
        <Route path="/"           element={<Login />} />
        <Route path="/dashboard"  element={<Layout><Dashboard /></Layout>} />
        <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
        <Route path="/checkinout" element={<Layout><CheckInOut /></Layout>} />
        <Route path="/timesheets" element={<Layout><Timesheets /></Layout>} />
        <Route path="/leaves"     element={<Layout><LeaveManagement /></Layout>} />
        <Route path="/employees"  element={<Layout><Employees /></Layout>} />
        <Route path="/reports"    element={<Layout><Reports /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
