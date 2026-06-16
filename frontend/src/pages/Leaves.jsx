import { useState, useEffect } from "react";
import API from "../api/api";

const E = { employee:"", leave_type:"sick", from_date:"", to_date:"", reason:"" };
const TYPES = { sick:"Sick", casual:"Casual", annual:"Annual", unpaid:"Unpaid" };

export default function Leaves() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(E);
  const [tab,  setTab]  = useState("all");
  const [msg,  setMsg]  = useState({type:"",text:""});
  const [open, setOpen] = useState(false);

  const load = () => API.get("/leaves/").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await API.post("/leaves/", form); setForm(E); setOpen(false); setMsg({type:"ok",text:"Leave request submitted."}); load(); }
    catch(e) { setMsg({type:"err",text:JSON.stringify(e.response?.data)}); }
  };

  const update = async (id, status) => { await API.patch(`/leaves/${id}/`, {status}); load(); };

  const filtered = tab==="all" ? rows : rows.filter(r => r.status===tab);
  const cnt = t => t==="all" ? rows.length : rows.filter(r=>r.status===t).length;

  return (
    <>
      <div className="ph">
        <div><h1>Leave Requests</h1><p>{cnt("pending")} pending approval</p></div>
        <button className="btn btn-p" onClick={()=>setOpen(!open)}>{open?"Cancel":"+ Apply"}</button>
      </div>

      {msg.text && <div className={`alert ${msg.type==="err"?"a-err":"a-ok"}`}>{msg.text}</div>}

      {open && (
        <div className="card">
          <div className="card-head"><h2>New Leave Request</h2></div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="fg"><label>Employee ID</label><input type="number" value={form.employee} onChange={e=>setForm({...form,employee:e.target.value})} placeholder="1" required /></div>
                <div className="fg"><label>Leave Type</label>
                  <select value={form.leave_type} onChange={e=>setForm({...form,leave_type:e.target.value})}>
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="fg"><label>From</label><input type="date" value={form.from_date} onChange={e=>setForm({...form,from_date:e.target.value})} required /></div>
                <div className="fg"><label>To</label><input type="date" value={form.to_date} onChange={e=>setForm({...form,to_date:e.target.value})} required /></div>
                <div className="fg" style={{gridColumn:"span 2"}}><label>Reason</label><textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Reason for leave" required /></div>
              </div>
              <div className="form-actions"><button className="btn btn-p" type="submit">Submit</button><button className="btn btn-ghost" type="button" onClick={()=>setOpen(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h2>All Requests</h2>
          <div className="tabs" style={{marginBottom:0}}>
            {["all","pending","approved","rejected"].map(t=>(
              <button key={t} className={`tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)} ({cnt(t)})
              </button>
            ))}
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="7"><div className="empty"><span>🌿</span><p>No requests</p></div></td></tr>
                : filtered.map(r => {
                  const days = Math.max(1, Math.ceil((new Date(r.to_date)-new Date(r.from_date))/(864e5))+1);
                  return (
                    <tr key={r.id}>
                      <td><div className="t-bold">{r.employee_name}</div><span className="t-code">{r.employee_code}</span></td>
                      <td>{TYPES[r.leave_type]||r.leave_type}</td>
                      <td className="t-dim">{r.from_date}</td>
                      <td className="t-dim">{r.to_date}</td>
                      <td><strong>{days}d</strong></td>
                      <td><span className={`badge b-${r.status}`}>{r.status}</span></td>
                      <td>{r.status==="pending" && (
                        <div style={{display:"flex",gap:6}}>
                          <button className="btn btn-g btn-sm" onClick={()=>update(r.id,"approved")}>Approve</button>
                          <button className="btn btn-r btn-sm" onClick={()=>update(r.id,"rejected")}>Reject</button>
                        </div>
                      )}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
