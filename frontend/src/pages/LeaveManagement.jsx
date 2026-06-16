import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { MdAdd, MdClose, MdEventNote } from "react-icons/md";
import API from "../api/api";

const TYPES = { sick:"🤒 Sick", casual:"🏖 Casual", annual:"📅 Annual", unpaid:"💼 Unpaid" };
const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-sm outline-none focus:border-[#2563EB] bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:placeholder-[#475569] focus:bg-white dark:focus:bg-[#0F172A] transition-all";
const lbl = "text-xs font-semibold text-[#374151] dark:text-[#CBD5E1] mb-1.5 block";

const YEARS  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const getDays = (y, m) => (y && m) ? new Date(y, m, 0).getDate() : 31;

const E = {
  employee:"", leave_type:"sick", reason:"",
  from_date:"", _fd:"", _fm:"", _fy:"",
  to_date:"",   _td:"", _tm:"", _ty:"",
};

/* Reusable 3-dropdown date picker */
function DateSelect({ label, d, m, y, onChange, dateStr }) {
  return (
    <div>
      <label className={lbl}>{label} <span className="text-red-500">*</span></label>
      <div className="grid grid-cols-3 gap-2">
        <select value={d} onChange={e => onChange("d", e.target.value)} className={inputCls}>
          <option value="">Day</option>
          {Array.from({ length: getDays(y, m) }, (_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
        <select value={m} onChange={e => onChange("m", e.target.value)} className={inputCls}>
          <option value="">Month</option>
          {MONTHS.map((mn, i) => <option key={i+1} value={i+1}>{mn}</option>)}
        </select>
        <select value={y} onChange={e => onChange("y", e.target.value)} className={inputCls}>
          <option value="">Year</option>
          {YEARS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>
      </div>
      {dateStr && (
        <p className="text-xs text-[#64748B] mt-1">
          <span className="font-semibold text-blue-600">
            {new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { day:"numeric", month:"long", year:"numeric" })}
          </span>
        </p>
      )}
    </div>
  );
}

function ApplyModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(E);
  const [saving, setSaving] = useState(false);

  /* update one of the 6 date sub-fields and rebuild the ISO date string */
  const setDate = (prefix, part, val) => {
    setForm(prev => {
      const next = { ...prev, [`_${prefix}${part}`]: val };
      const y = part === "y" ? val : next[`_${prefix}y`];
      const m = part === "m" ? val : next[`_${prefix}m`];
      const d = part === "d" ? val : next[`_${prefix}d`];
      const key = prefix === "f" ? "from_date" : "to_date";
      next[key] = y && m && d
        ? `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`
        : "";
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.from_date || !form.to_date) {
      toast.error("Please select complete From and To dates"); return;
    }
    setSaving(true);
    try {
      await API.post("/leaves/", form);
      toast.success("Leave request submitted!");
      setForm(E); onSave(); onClose();
    } catch(err) { toast.error(JSON.stringify(err.response?.data)); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
            className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">Apply for Leave</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[#94A3B8]"><MdClose /></button>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              {/* Employee ID */}
              <div>
                <label className={lbl}>Employee ID <span className="text-red-500">*</span></label>
                <input type="number" value={form.employee} onChange={e=>setForm({...form,employee:e.target.value})}
                  placeholder="e.g. 1" className={inputCls} required />
              </div>

              {/* Leave type */}
              <div>
                <label className={lbl}>Leave Type <span className="text-red-500">*</span></label>
                <select value={form.leave_type} onChange={e=>setForm({...form,leave_type:e.target.value})} className={inputCls}>
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="casual">🏖 Casual Leave</option>
                  <option value="annual">📅 Annual Leave</option>
                  <option value="unpaid">💼 Unpaid Leave</option>
                </select>
              </div>

              {/* From date */}
              <DateSelect
                label="From Date"
                d={form._fd} m={form._fm} y={form._fy}
                onChange={(part, val) => setDate("f", part, val)}
                dateStr={form.from_date}
              />

              {/* To date */}
              <DateSelect
                label="To Date"
                d={form._td} m={form._tm} y={form._ty}
                onChange={(part, val) => setDate("t", part, val)}
                dateStr={form.to_date}
              />

              {/* Duration preview */}
              {form.from_date && form.to_date && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-2.5 text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Duration: {Math.max(1, Math.ceil((new Date(form.to_date) - new Date(form.from_date)) / 864e5) + 1)} day(s)
                </div>
              )}

              {/* Reason */}
              <div>
                <label className={lbl}>Reason <span className="text-red-500">*</span></label>
                <textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}
                  placeholder="Reason for leave…" rows={3} className={`${inputCls} resize-none`} required />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 btn btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn btn-primary">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Submit"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LeaveManagement() {
  const [rows,    setRows]    = useState([]);
  const [tab,     setTab]     = useState("all");
  const [modal,   setModal]   = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await API.get("/leaves/"); setRows(r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try { await API.patch(`/leaves/${id}/`, {status}); toast.success(`Leave ${status}`); load(); }
    catch { toast.error("Failed to update"); }
  };

  const filtered = tab==="all" ? rows : rows.filter(r=>r.status===tab);
  const cnt = t => t==="all" ? rows.length : rows.filter(r=>r.status===t).length;

  const BALANCE = [
    { label:"Annual Leave", total:21, used:5,  color:"bg-blue-500"  },
    { label:"Sick Leave",   total:10, used:2,  color:"bg-green-500" },
    { label:"Casual Leave", total:7,  used:1,  color:"bg-amber-500" },
    { label:"Unpaid Leave", total:"∞",used:0,  color:"bg-gray-400"  },
  ];

  return (
    <div>
      <ApplyModal open={modal} onClose={()=>setModal(false)} onSave={load} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">Leave Management</h1>
          <p className="text-sm text-[#64748B] mt-1">{cnt("pending")} requests pending approval</p>
        </div>
        <button onClick={()=>setModal(true)} className="btn btn-primary"><MdAdd /> Apply Leave</button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {BALANCE.map(b => (
          <div key={b.label} className="card py-4">
            <div className="text-xs font-semibold text-[#64748B] mb-3">{b.label}</div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">
                {typeof b.total==="number" ? b.total-b.used : b.total}
              </span>
              {typeof b.total==="number" && <span className="text-xs text-[#94A3B8] mb-1">/ {b.total} days</span>}
            </div>
            {typeof b.total==="number" && (
              <div className="w-full bg-[#F1F5F9] dark:bg-[#334155] rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${b.color}`} style={{ width:`${(b.used/b.total)*100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">Leave History</h2>
          <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-xl gap-1">
            {["all","pending","approved","rejected"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===t?"bg-white dark:bg-[#1E293B] text-[#2563EB] shadow-sm":"text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#E2E8F0]"}`}>
                {t.charAt(0).toUpperCase()+t.slice(1)} ({cnt(t)})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#F1F5F9] dark:border-[#334155]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
                {["Employee","Type","From","To","Days","Reason","Status","Action"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_,i)=>(
                  <tr key={i} className="border-b border-[#F1F5F9] dark:border-[#334155]">
                    {[...Array(8)].map((_,j)=><td key={j} className="px-4 py-3"><div className="h-4 bg-[#F1F5F9] dark:bg-[#334155] rounded animate-pulse"/></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-[#94A3B8]"><MdEventNote className="text-4xl opacity-30"/><span className="text-sm">No leave requests</span></div>
                </td></tr>
              ) : filtered.map((r,i)=>{
                const days = Math.max(1, Math.ceil((new Date(r.to_date)-new Date(r.from_date))/864e5)+1);
                return (
                  <motion.tr key={r.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                    className="border-b border-[#F1F5F9] dark:border-[#334155] last:border-0 hover:bg-[#FAFBFF] dark:hover:bg-[#334155]/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">
                          {r.employee_name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0F172A] dark:text-[#E2E8F0] text-xs">{r.employee_name}</div>
                          <div className="text-[10px] text-[#94A3B8]">{r.employee_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs dark:text-[#CBD5E1]">{TYPES[r.leave_type]||r.leave_type}</td>
                    <td className="px-4 py-3 text-[#64748B] text-xs">{r.from_date}</td>
                    <td className="px-4 py-3 text-[#64748B] text-xs">{r.to_date}</td>
                    <td className="px-4 py-3"><span className="font-bold text-[#0F172A] dark:text-[#E2E8F0]">{days}d</span></td>
                    <td className="px-4 py-3 text-[#64748B] text-xs max-w-[140px] truncate">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${r.status==="approved"?"bg-green-100 text-green-700":r.status==="rejected"?"bg-red-100 text-red-600":"bg-amber-100 text-amber-700"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status==="pending" && (
                        <div className="flex gap-1.5">
                          <button onClick={()=>update(r.id,"approved")} className="px-2.5 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-all">✓</button>
                          <button onClick={()=>update(r.id,"rejected")} className="px-2.5 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-all">✕</button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
