import { useState, useEffect } from "react";
import API from "../api/api";

const E = { requester:"", target:"", requester_date:"", target_date:"", reason:"" };

export default function ShiftSwaps() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(E);
  const [tab,  setTab]  = useState("all");
  const [msg,  setMsg]  = useState({type:"",text:""});
  const [open, setOpen] = useState(false);

  const load = () => API.get("/swaps/").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await API.post("/swaps/", form); setForm(E); setOpen(false); setMsg({type:"ok",text:"Swap request submitted."}); load(); }
    catch(e) { setMsg({type:"err",text:JSON.stringify(e.response?.data)}); }
  };

  const update = async (id, status) => { await API.patch(`/swaps/${id}/`, {status}); load(); };

  const filtered = tab==="all" ? rows : rows.filter(r => r.status===tab);
  const cnt = t => t==="all" ? rows.length : rows.filter(r=>r.status===t).length;

  return (
    <>
      <div className="ph">
        <div><h1>Shift Swaps</h1><p>{cnt("pending")} pending review</p></div>
        <button className="btn btn-p" onClick={()=>setOpen(!open)}>{open?"Cancel":"+ Request Swap"}</button>
      </div>

      {msg.text && <div className={`alert ${msg.type==="err"?"a-err":"a-ok"}`}>{msg.text}</div>}

      {open && (
        <div className="card">
          <div className="card-head"><h2>New Swap Request</h2></div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="fg"><label>Your Employee ID</label><input type="number" value={form.requester} onChange={e=>setForm({...form,requester:e.target.value})} placeholder="1" required /></div>
                <div className="fg"><label>Target Employee ID</label><input type="number" value={form.target} onChange={e=>setForm({...form,target:e.target.value})} placeholder="2" required /></div>
                <div className="fg"><label>Your Shift Date</label><input type="date" value={form.requester_date} onChange={e=>setForm({...form,requester_date:e.target.value})} required /></div>
                <div className="fg"><label>Their Shift Date</label><input type="date" value={form.target_date} onChange={e=>setForm({...form,target_date:e.target.value})} required /></div>
                <div className="fg" style={{gridColumn:"span 2"}}><label>Reason (optional)</label><textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Why do you want to swap?" /></div>
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
            <thead><tr><th>From</th><th>To</th><th>From Date</th><th>To Date</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="7"><div className="empty"><span>🔄</span><p>No swap requests</p></div></td></tr>
                : filtered.map(r => (
                  <tr key={r.id}>
                    <td className="t-bold">{r.requester_name}</td>
                    <td className="t-bold">{r.target_name}</td>
                    <td className="t-dim">{r.requester_date}</td>
                    <td className="t-dim">{r.target_date}</td>
                    <td className="t-dim" style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.reason||"—"}</td>
                    <td><span className={`badge b-${r.status}`}>{r.status}</span></td>
                    <td>{r.status==="pending" && (
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-g btn-sm" onClick={()=>update(r.id,"approved")}>Approve</button>
                        <button className="btn btn-r btn-sm" onClick={()=>update(r.id,"rejected")}>Reject</button>
                      </div>
                    )}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
