import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MdBadge, MdCheckCircle, MdCancel, MdAccessTime,
  MdPerson, MdCalendarToday, MdTimer,
} from "react-icons/md";
import API from "../api/api";

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl p-3 text-center border border-[#E2E8F0] dark:border-[#334155]">
      <Icon className={`${color} text-xl mx-auto mb-1`} />
      <div className={`text-sm font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-[#94A3B8] font-medium mt-0.5">{label}</div>
    </div>
  );
}

export default function CheckInOut() {
  const [time,    setTime]    = useState(new Date());
  const [code,    setCode]    = useState("");
  const [status,  setStatus]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const lookup = async (val) => {
    const v = (val ?? code).trim();
    if (!v) return;
    try {
      const r = await API.get(`/attendance/status/${v}/`);
      setStatus(r.data);
    } catch { setStatus(null); }
  };

  const doAction = async (action) => {
    if (!code.trim()) { toast.error("Enter Employee ID first"); return; }
    setLoading(true);
    try {
      const r = await API.post(`/attendance/${action}/`, { employee_code: code.trim() });
      setStatus(r.data);
      toast.success(
        action === "checkin"
          ? `✅ ${r.data.employee_name} checked in at ${new Date(r.data.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : `🔴 Checked out — ${r.data.total_hours}h logged`
      );
    } catch (e) {
      toast.error(e.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isIn   = status?.check_in && !status?.check_out;
  const isDone = status?.check_in &&  status?.check_out;

  const hh = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dd = time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-6">
      <div className="w-full max-w-lg space-y-4">

        {/* ── Page title ── */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">Check In / Out</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Enter your Employee ID to mark attendance</p>
        </div>

        {/* ── Live clock card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1d4ed8] p-8 text-center shadow-2xl shadow-blue-900/30"
        >
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8  w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-[3.5rem] font-extrabold text-white tracking-widest tabular-nums leading-none mb-2">
              {hh}
            </div>
            <div className="flex items-center justify-center gap-4 text-blue-300 text-sm">
              <span className="flex items-center gap-1.5">
                <MdCalendarToday className="text-base" /> {dd}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Input card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <label className="block text-xs font-bold text-[#374151] dark:text-[#CBD5E1] mb-2 uppercase tracking-wide">
            Employee ID
          </label>
          <div className="relative mb-4">
            <MdBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xl pointer-events-none" />
            <input
              className="w-full pl-11 pr-4 py-3.5 border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-lg font-bold tracking-[0.2em] text-center uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-[#E2E8F0] focus:bg-white dark:focus:bg-[#0F172A]"
              placeholder="EMP001"
              value={code}
              onChange={e => {
                const v = e.target.value.toUpperCase();
                setCode(v);
                if (v.length >= 3) lookup(v);
              }}
              onKeyDown={e => e.key === "Enter" && lookup()}
            />
          </div>

          {/* ── Employee info card ── */}
          <AnimatePresence>
            {status?.employee_name && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">
                      {status.employee_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F172A] dark:text-[#E2E8F0] text-sm">{status.employee_name}</div>
                      <div className="text-xs text-[#64748B]">
                        {isDone && `In ${new Date(status.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Out ${new Date(status.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        {isIn  && `Checked in at ${new Date(status.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        {!status.check_in && "Not checked in today"}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    isDone ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    isIn   ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                             "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {isDone ? "Done" : isIn ? "In Office" : "Not In"}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Today's summary pills ── */}
          <AnimatePresence>
            {isDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex gap-3">
                  <StatPill
                    icon={MdCheckCircle} label="Check In"
                    value={new Date(status.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    color="text-emerald-600"
                  />
                  <StatPill
                    icon={MdCancel} label="Check Out"
                    value={new Date(status.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    color="text-red-500"
                  />
                  <StatPill
                    icon={MdTimer} label="Hours Worked"
                    value={`${status.total_hours}h`}
                    color="text-blue-600"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action buttons ── */}
          <div className="flex gap-3">
            <button
              onClick={() => doAction("checkin")}
              disabled={loading || isIn || isDone}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><MdCheckCircle className="text-lg" /> Check In</>}
            </button>
            <button
              onClick={() => doAction("checkout")}
              disabled={loading || !isIn}
              className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 text-sm"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><MdCancel className="text-lg" /> Check Out</>}
            </button>
          </div>
        </motion.div>

        {/* ── Help hint ── */}
        <p className="text-center text-xs text-[#94A3B8]">
          Type your Employee ID and press <kbd className="bg-[#E2E8F0] dark:bg-[#334155] dark:text-[#CBD5E1] px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</kbd> to look up your record.
        </p>
      </div>
    </div>
  );
}
