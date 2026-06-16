import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { MdAdd, MdSearch, MdDelete, MdAccessTime, MdClose } from "react-icons/md";
import API from "../api/api";

const PER_PAGE = 8;
const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-sm outline-none focus:border-[#2563EB] bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:placeholder-[#475569] focus:bg-white dark:focus:bg-[#0F172A] transition-all";

const YEARS  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const getDays = (y, m) => (y && m) ? new Date(y, m, 0).getDate() : 31;

const E = { employee: "", date: "", hours_worked: "", task: "", _day: "", _month: "", _year: "" };

/* DateSelect — three dropdowns that write to a YYYY-MM-DD field */
function DateSelect({ day, month, year, onChange }) {
  const days = getDays(year, month);
  return (
    <div className="grid grid-cols-3 gap-2">
      <select value={day} onChange={e => onChange("_day", e.target.value)} className={inputCls}>
        <option value="">Day</option>
        {Array.from({ length: days }, (_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>
      <select value={month} onChange={e => onChange("_month", e.target.value)} className={inputCls}>
        <option value="">Month</option>
        {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
      </select>
      <select value={year} onChange={e => onChange("_year", e.target.value)} className={inputCls}>
        <option value="">Year</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

function Modal({ open, onClose, onSave }) {
  const [form, setForm] = useState(E);
  const [saving, setSaving] = useState(false);

  const setDate = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val };
      const y = field === "_year"  ? val : next._year;
      const m = field === "_month" ? val : next._month;
      const d = field === "_day"   ? val : next._day;
      next.date = y && m && d
        ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        : "";
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.date) { toast.error("Please select a complete date"); return; }
    setSaving(true);
    try {
      await API.post("/timesheets/", form);
      toast.success("Entry added!");
      setForm(E);
      onSave();
      onClose();
    } catch (e) { toast.error(JSON.stringify(e.response?.data)); }
    finally { setSaving(false); }
  };

  const lbl = "text-xs font-semibold text-[#374151] dark:text-[#CBD5E1] mb-1.5 block";

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">Add Timesheet Entry</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[#94A3B8]"><MdClose /></button>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Employee ID <span className="text-red-500">*</span></label>
                <input type="number" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}
                  placeholder="e.g. 1" className={inputCls} required />
              </div>

              <div>
                <label className={lbl}>Date <span className="text-red-500">*</span></label>
                <DateSelect day={form._day} month={form._month} year={form._year} onChange={setDate} />
                {form.date && (
                  <p className="text-xs text-[#64748B] mt-1.5">
                    Selected: <span className="font-semibold text-blue-600">
                      {new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className={lbl}>Hours Worked <span className="text-red-500">*</span></label>
                <select value={form.hours_worked} onChange={e => setForm({ ...form, hours_worked: e.target.value })} className={inputCls} required>
                  <option value="">— Select hours —</option>
                  {[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12].map(h => (
                    <option key={h} value={h}>{h} {h === 1 ? "hour" : "hours"}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={lbl}>Task Description <span className="text-red-500">*</span></label>
                <textarea value={form.task} onChange={e => setForm({ ...form, task: e.target.value })}
                  placeholder="Describe the work done…" rows={3} className={`${inputCls} resize-none`} required />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 btn btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn btn-primary">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Entry"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Timesheets() {
  const [rows,    setRows]    = useState([]);
  const [q,       setQ]       = useState("");
  const [modal,   setModal]   = useState(false);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await API.get("/timesheets/"); setRows(r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Delete this entry?")) return;
    try { await API.delete(`/timesheets/${id}/`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const filtered = rows.filter(r => !q || `${r.employee_name} ${r.task}`.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const total = rows.reduce((s, r) => s + Number(r.hours_worked), 0);

  return (
    <div>
      <Modal open={modal} onClose={() => setModal(false)} onSave={load} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">Timesheets</h1>
          <p className="text-sm text-[#64748B] mt-1">Log and manage daily work hours</p>
        </div>
        <button onClick={() => setModal(true)} className="btn btn-primary"><MdAdd className="text-base" /> Log Hours</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[["📋","Entries",rows.length],["⏱","Total Hours",total.toFixed(1)+"h"],["👥","Employees",new Set(rows.map(r=>r.employee)).size]].map(([i,l,v])=>(
          <div key={l} className="card flex items-center gap-3 py-4">
            <span className="text-2xl">{i}</span>
            <div>
              <div className="text-xl font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">{v}</div>
              <div className="text-xs text-[#64748B] font-medium">{l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-lg" />
            <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search by name or task…"
              className={`w-full pl-9 pr-4 ${inputCls}`} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#F1F5F9] dark:border-[#334155]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
                {["Employee","Date","Hours","Task Description",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] dark:border-[#334155]">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#F1F5F9] dark:bg-[#334155] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-16 text-[#94A3B8]">
                  <div className="flex flex-col items-center gap-2"><MdAccessTime className="text-4xl opacity-30" /><span className="text-sm">No entries found</span></div>
                </td></tr>
              ) : paged.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-[#F1F5F9] dark:border-[#334155] last:border-0 hover:bg-[#FAFBFF] dark:hover:bg-[#334155]/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                        {r.employee_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{r.employee_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748B] text-xs">{r.date}</td>
                  <td className="px-4 py-3"><span className="bg-green-50 dark:bg-green-900/30 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{r.hours_worked}h</span></td>
                  <td className="px-4 py-3 text-[#374151] dark:text-[#CBD5E1] max-w-[220px] truncate">{r.task}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(r.id)} className="w-7 h-7 flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                      <MdDelete className="text-base" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-[#94A3B8]">Page {page} of {pages}</span>
            <div className="flex gap-1">
              {[...Array(pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${page === i + 1 ? "bg-[#2563EB] text-white" : "text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
