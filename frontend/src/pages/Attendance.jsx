import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdSearch, MdFilterList, MdRefresh } from "react-icons/md";
import API from "../api/api";

const Badge = ({ status }) => {
  const map = {
    present: "bg-green-100 text-green-700",
    absent:  "bg-red-100 text-red-600",
    late:    "bg-orange-100 text-orange-600",
    done:    "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return <span className={`badge ${map[status]||map.absent}`}>{status.charAt(0).toUpperCase()+status.slice(1)}</span>;
};

const inputCls = "px-3 py-2.5 border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-sm outline-none focus:border-[#2563EB] bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:placeholder-[#475569] focus:bg-white dark:focus:bg-[#0F172A] transition-all";

export default function Attendance() {
  const [rows,    setRows]    = useState([]);
  const [q,       setQ]       = useState("");
  const [dateFilter, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await API.get("/attendance/"); setRows(r.data); }
    catch(e) { console.error(e); }
    finally  { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => {
    const matchQ = !q || `${r.employee_name} ${r.employee_code}`.toLowerCase().includes(q.toLowerCase());
    const matchD = !dateFilter || r.date === dateFilter;
    return matchQ && matchD;
  });

  const getStatus = (r) => {
    if (r.check_in && r.check_out) return "done";
    if (r.check_in) return "present";
    return "absent";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">Attendance</h1>
        <p className="text-sm text-[#64748B] mt-1">View and manage employee attendance records</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-lg" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search employee…"
              className={`w-full pl-9 pr-4 ${inputCls}`} />
          </div>
          <div className="flex items-center gap-2">
            <MdFilterList className="text-[#94A3B8] text-lg" />
            <input type="date" value={dateFilter} onChange={e=>setDate(e.target.value)} className={inputCls} />
          </div>
          <button onClick={load} className="btn btn-ghost btn-sm flex items-center gap-1.5">
            <MdRefresh /> Refresh
          </button>
          {dateFilter && <button onClick={()=>setDate("")} className="text-xs text-[#EF4444] hover:underline">Clear filter</button>}
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#F1F5F9] dark:border-[#334155]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
                {["Employee","Code","Date","Check In","Check Out","Hours","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] dark:border-[#334155]">
                    {[...Array(7)].map((_,j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-[#F1F5F9] dark:bg-[#334155] rounded animate-pulse"></div></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-16 text-[#94A3B8]">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl opacity-30">📭</span>
                    <span className="text-sm">No records found</span>
                  </div>
                </td></tr>
              ) : filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
                  className="border-b border-[#F1F5F9] dark:border-[#334155] last:border-0 hover:bg-[#FAFBFF] dark:hover:bg-[#334155]/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                        {r.employee_name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </div>
                      <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{r.employee_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-md font-semibold">{r.employee_code}</span></td>
                  <td className="px-4 py-3 text-[#64748B] text-xs">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">{r.check_in ? new Date(r.check_in).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-500">{r.check_out ? new Date(r.check_out).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : <span className="text-amber-500">Pending</span>}</td>
                  <td className="px-4 py-3">{r.total_hours ? <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{r.total_hours}h</span> : "—"}</td>
                  <td className="px-4 py-3"><Badge status={getStatus(r)} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-xs text-[#94A3B8]">
            <span>Showing {filtered.length} of {rows.length} records</span>
          </div>
        )}
      </div>
    </div>
  );
}
