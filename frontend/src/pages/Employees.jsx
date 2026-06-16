import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MdAdd, MdSearch, MdDelete, MdPeople } from "react-icons/md";
import API from "../api/api";

const DESIGNATIONS = [
  "Software Engineer", "Senior Software Engineer", "Lead Engineer", "Engineering Manager",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
  "QA Engineer", "UI/UX Designer", "Product Manager", "Project Manager",
  "Business Analyst", "Data Analyst", "Data Scientist", "HR Manager",
  "HR Executive", "Recruiter", "Finance Manager", "Accountant",
  "Sales Manager", "Marketing Manager", "Operations Manager", "Team Lead",
  "Intern", "Trainee", "Consultant", "Director", "VP", "CTO", "CEO",
];

/* Build year/month/day options for date picker */
const YEARS  = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const getDays = (y, m) => new Date(y, m, 0).getDate();

const E = { employee_code:"", first_name:"", email:"", phone:"", department:"", designation:"", joining_date:"", _year:"", _month:"", _day:"" };
const COLORS = ["bg-blue-500","bg-green-500","bg-purple-500","bg-amber-500","bg-pink-500","bg-cyan-500","bg-red-500"];
const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-sm outline-none focus:border-[#2563EB] bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:placeholder-[#475569] focus:bg-white dark:focus:bg-[#0F172A] transition-all";

/* Defined outside component so it never gets recreated on re-render */
function FG({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#374151] dark:text-[#CBD5E1]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Employees() {
  const [rows,  setRows]  = useState([]);
  const [depts, setDepts] = useState([]);
  const [form,  setForm]  = useState(E);
  const [open,  setOpen]  = useState(false);
  const [q,     setQ]     = useState("");
  const [loading,setLoading]=useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([API.get("/employees/"), API.get("/departments/")])
      .then(([e,d]) => { setRows(e.data); setDepts(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  /* sync the three dropdowns into joining_date */
  const setDate = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val };
      const y = field === "_year"  ? val : next._year;
      const m = field === "_month" ? val : next._month;
      const d = field === "_day"   ? val : next._day;
      next.joining_date = y && m && d
        ? `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`
        : "";
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try { await API.post("/employees/", form); toast.success("Employee added!"); setForm(E); setOpen(false); load(); }
    catch(e) { toast.error(JSON.stringify(e.response?.data)); }
  };

  const del = async (id) => {
    if (!confirm("Remove this employee?")) return;
    try { await API.delete(`/employees/${id}/`); toast.success("Employee removed"); load(); }
    catch { toast.error("Failed"); }
  };

  const filtered = rows.filter(r => !q || `${r.first_name} ${r.last_name} ${r.employee_code} ${r.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">Employees</h1>
          <p className="text-sm text-[#64748B] mt-1">{rows.length} total employees</p>
        </div>
        <button onClick={()=>setOpen(!open)} className="btn btn-primary"><MdAdd /> Add Employee</button>
      </div>

      {open && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="card mb-5">
          <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">New Employee</h2>
          <form onSubmit={submit}>
            {/* Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <FG label="Employee Code" required>
                <input value={form.employee_code} onChange={e=>setForm({...form,employee_code:e.target.value.toUpperCase()})} placeholder="EMP001" className={inputCls} required />
              </FG>
              <FG label="First Name" required>
                <input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} placeholder="John" className={inputCls} required />
              </FG>
              <FG label="Email" required>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="john@company.com" className={inputCls} required />
              </FG>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <FG label="Phone">
                <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+1 234 567 8900" className={inputCls} />
              </FG>
              <FG label="Department">
                <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} className={inputCls}>
                  <option value="">— Select Department —</option>
                  {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </FG>
              <FG label="Designation">
                <select value={form.designation} onChange={e=>setForm({...form,designation:e.target.value})} className={inputCls}>
                  <option value="">— Select Designation —</option>
                  {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </FG>
            </div>

            {/* Row 3 — Joining Date dropdowns */}
            <div className="mb-5">
              <FG label="Joining Date">
                <div className="grid grid-cols-3 gap-3">
                  <select value={form._day} onChange={e=>setDate("_day",e.target.value)} className={inputCls}>
                    <option value="">Day</option>
                    {Array.from({ length: getDays(form._year||2024, form._month||1) }, (_,i)=>(
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                  <select value={form._month} onChange={e=>setDate("_month",e.target.value)} className={inputCls}>
                    <option value="">Month</option>
                    {MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                  <select value={form._year} onChange={e=>setDate("_year",e.target.value)} className={inputCls}>
                    <option value="">Year</option>
                    {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {form.joining_date && (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1.5">
                    Selected: <span className="font-semibold text-blue-600">{new Date(form.joining_date+"T00:00:00").toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})}</span>
                  </p>
                )}
              </FG>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">Save Employee</button>
              <button type="button" onClick={()=>setOpen(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-lg" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search employees…"
              className={`w-full pl-9 pr-4 ${inputCls}`} />
          </div>
          <span className="text-xs text-[#94A3B8]">{filtered.length} found</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#F1F5F9] dark:border-[#334155]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
                {["Employee","Code","Email","Department","Designation","Joined","Status",""].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_,i)=>(
                  <tr key={i} className="border-b border-[#F1F5F9] dark:border-[#334155]">
                    {[...Array(8)].map((_,j)=><td key={j} className="px-4 py-3"><div className="h-4 bg-[#F1F5F9] dark:bg-[#334155] rounded animate-pulse"></div></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-[#94A3B8]"><MdPeople className="text-4xl opacity-30" /><span className="text-sm">No employees found</span></div>
                </td></tr>
              ) : filtered.map((r,i)=>(
                <motion.tr key={r.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                  className="border-b border-[#F1F5F9] dark:border-[#334155] last:border-0 hover:bg-[#FAFBFF] dark:hover:bg-[#334155]/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${COLORS[r.id%COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {(r.first_name?.[0]||"")+(r.last_name?.[0]||"")}
                      </div>
                      <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{r.first_name} {r.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-md font-semibold">{r.employee_code}</span></td>
                  <td className="px-4 py-3 text-[#64748B] text-xs">{r.email}</td>
                  <td className="px-4 py-3 text-xs dark:text-[#CBD5E1]">{r.department_name||<span className="text-[#94A3B8]">—</span>}</td>
                  <td className="px-4 py-3 text-xs dark:text-[#CBD5E1]">{r.designation||<span className="text-[#94A3B8]">—</span>}</td>
                  <td className="px-4 py-3 text-[#64748B] text-xs">{r.joining_date||"—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${r.is_active?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{r.is_active?"Active":"Inactive"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={()=>del(r.id)} className="w-7 h-7 flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                      <MdDelete className="text-base" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
