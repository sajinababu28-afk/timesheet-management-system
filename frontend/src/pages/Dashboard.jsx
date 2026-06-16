import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import {
  MdPeople, MdCheckCircle, MdCancel, MdEventNote,
  MdTrendingUp, MdTrendingDown, MdAccessTime, MdAdd,
  MdArrowForward, MdLogin, MdLogout,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

/* ── static chart data ── */
const weekData = [
  { day: "Mon", present: 18, absent: 4 },
  { day: "Tue", present: 20, absent: 2 },
  { day: "Wed", present: 17, absent: 5 },
  { day: "Thu", present: 22, absent: 0 },
  { day: "Fri", present: 19, absent: 3 },
  { day: "Sat", present: 8,  absent: 14 },
  { day: "Sun", present: 3,  absent: 19 },
];

const hoursData = [
  { month: "Jan", hours: 168 }, { month: "Feb", hours: 152 },
  { month: "Mar", hours: 176 }, { month: "Apr", hours: 160 },
  { month: "May", hours: 184 }, { month: "Jun", hours: 172 },
];

/* ── KPI card ── */
function KpiCard({ icon: Icon, label, value, sub, trend, trendUp, color, border, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`bg-white dark:bg-[#1E293B] rounded-2xl p-5 border-l-4 ${border} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="text-xl text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            trendUp ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {trendUp ? <MdTrendingUp /> : <MdTrendingDown />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold text-[#0F172A] dark:text-white leading-none mb-1">
        {value}
      </div>
      <div className="text-sm font-semibold text-[#64748B] dark:text-slate-400">{label}</div>
      {sub && <div className="text-xs text-[#94A3B8] mt-0.5">{sub}</div>}
    </motion.div>
  );
}

/* ── section heading ── */
function SectionHead({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline">
          {action} <MdArrowForward className="text-sm" />
        </button>
      )}
    </div>
  );
}

const ttStyle = {
  borderRadius: 10, border: "none",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)", fontSize: 12,
};

const COLORS = ["bg-blue-500","bg-green-500","bg-purple-500","bg-amber-500","bg-pink-500","bg-cyan-500"];

export default function Dashboard() {
  const [stats,   setStats]   = useState({ emp: 0, present: 0, absent: 0, leaves: 0 });
  const [records, setRecords] = useState([]);
  const [leaves,  setLeaves]  = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get("/employees/"), API.get("/attendance/"), API.get("/leaves/")])
      .then(([e, a, l]) => {
        const today   = new Date().toISOString().split("T")[0];
        const todayA  = a.data.filter(r => r.date === today);
        const present = todayA.filter(r => r.check_in).length;
        setStats({
          emp:    e.data.length,
          present,
          absent: Math.max(0, e.data.length - present),
          leaves: l.data.filter(r => r.status === "pending").length,
        });
        setRecords(a.data.slice(0, 6));
        setLeaves(l.data.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  const KPIS = [
    { icon: MdPeople,      label: "Total Employees", value: stats.emp,     sub: "Active workforce",    trend: "+2 this month", trendUp: true,  color: "bg-blue-500",  border: "border-blue-500",  delay: 0.05 },
    { icon: MdCheckCircle, label: "Present Today",   value: stats.present, sub: "Checked in so far",   trend: "+5%",           trendUp: true,  color: "bg-emerald-500",border: "border-emerald-500",delay: 0.1  },
    { icon: MdCancel,      label: "Absent Today",    value: stats.absent,  sub: "Not yet checked in",  trend: "-2%",           trendUp: false, color: "bg-red-500",   border: "border-red-500",   delay: 0.15 },
    { icon: MdEventNote,   label: "Pending Leaves",  value: stats.leaves,  sub: "Awaiting approval",   trend: undefined,       trendUp: false, color: "bg-amber-500", border: "border-amber-500", delay: 0.2  },
  ];

  const QUICK = [
    { icon: MdLogin,    label: "Check In",      cls: "bg-emerald-500 hover:bg-emerald-600", to: "/checkinout" },
    { icon: MdLogout,   label: "Check Out",     cls: "bg-red-500 hover:bg-red-600",         to: "/checkinout" },
    { icon: MdAdd,      label: "Log Timesheet", cls: "bg-blue-600 hover:bg-blue-700",        to: "/timesheets" },
    { icon: MdEventNote,label: "Apply Leave",   cls: "bg-amber-500 hover:bg-amber-600",      to: "/leaves"     },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => navigate("/reports")}
          className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <MdArrowForward /> View Reports
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ── Quick actions ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
        <SectionHead title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK.map(({ icon: Icon, label, cls, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className={`${cls} text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95`}
            >
              <Icon className="text-lg flex-shrink-0" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Attendance bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <SectionHead title="Weekly Attendance" action="Full Report" onAction={() => navigate("/attendance")} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} barSize={12} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={ttStyle} cursor={{ fill: "#F8FAFC" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="present" fill="#2563EB" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent"  fill="#FCA5A5" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hours area chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <SectionHead title="Monthly Working Hours" action="Timesheets" onAction={() => navigate("/timesheets")} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hoursData}>
              <defs>
                <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={36} domain={[140, 200]} />
              <Tooltip contentStyle={ttStyle} />
              <Area type="monotone" dataKey="hours" stroke="#2563EB" strokeWidth={2.5} fill="url(#hGrad)" name="Hours" dot={{ r: 3, fill: "#2563EB" }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Recent activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <SectionHead title="Recent Check-ins" action="View All" onAction={() => navigate("/attendance")} />
          {records.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-[#94A3B8]">
              <MdAccessTime className="text-4xl opacity-30 mb-2" />
              <p className="text-sm">No records today</p>
            </div>
          ) : (
            <div className="space-y-0">
              {records.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] dark:border-[#334155] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {r.employee_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{r.employee_name}</div>
                      <div className="text-xs text-[#94A3B8]">{r.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">Check In</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent leave requests */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <SectionHead title="Recent Leave Requests" action="Manage" onAction={() => navigate("/leaves")} />
          {leaves.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-[#94A3B8]">
              <MdEventNote className="text-4xl opacity-30 mb-2" />
              <p className="text-sm">No leave requests</p>
            </div>
          ) : (
            <div className="space-y-0">
              {leaves.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] dark:border-[#334155] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.employee_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{r.employee_name}</div>
                      <div className="text-xs text-[#94A3B8] capitalize">{r.leave_type} leave</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    r.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    r.status === "rejected" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
