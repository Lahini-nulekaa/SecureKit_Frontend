import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from './apiConfig';

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const authHeaders = token ? { Authorization: 'Bearer ' + token } : {};

  const doctorsByEmail = useMemo(() => {
    const map = new Map();
    for (const d of doctors) {
      if (d?.email) map.set(String(d.email).trim().toLowerCase(), d);
    }
    return map;
  }, [doctors]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setPatients([]);
    setDoctors([]);
    setPendingDoctors([]);
    setAppointments([]);
    setLogs([]);
    setStatus(null);
    setError(null);
  };

  const login = async () => {
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ password: adminPassword })
      });
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      localStorage.setItem('admin_token', json.token);
      setToken(json.token);
      setAdminPassword('');
      setStatus('Logged in as admin.');
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const [pRes, dRes, dpRes, aRes, lRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/patients`, { headers: authHeaders, credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/doctors`, { headers: authHeaders, credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/doctors/pending`, { headers: authHeaders, credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/appointments`, { headers: authHeaders, credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/system-logs`, { headers: authHeaders, credentials: "include" })
      ]);

      // Handle unauthorized session (Invalid or expired token)
      if (pRes.status === 401 || dRes.status === 401) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }

      const pJson = parseJsonSafe(await pRes.text());
      const dJson = parseJsonSafe(await dRes.text());
      const dpJson = parseJsonSafe(await dpRes.text());
      const aJson = parseJsonSafe(await aRes.text());
      const lJson = parseJsonSafe(await lRes.text());

      if (!pRes.ok) throw new Error(pJson.detail || pJson.__raw || pRes.statusText);
      if (!dRes.ok) throw new Error(dJson.detail || dJson.__raw || dRes.statusText);
      if (!dpRes.ok) throw new Error(dpJson.detail || dpJson.__raw || dpRes.statusText);
      if (!aRes.ok) throw new Error(aJson.detail || aJson.__raw || aRes.statusText);
      if (!lRes.ok) throw new Error(lJson.detail || lJson.__raw || lRes.statusText);

      setPatients(Array.isArray(pJson.data) ? pJson.data : []);
      setDoctors(Array.isArray(dJson.data) ? dJson.data : []);
      setPendingDoctors(Array.isArray(dpJson.data) ? dpJson.data : []);
      setAppointments(Array.isArray(aJson.data) ? aJson.data : []);
      setLogs(Array.isArray(lJson.recent_logs) ? lJson.recent_logs : []);
    } catch (e) {
      if (e.message !== 'Session expired. Please log in again.') {
        setError(e.message || 'System connectivity error');
      }
    } finally {
      setLoading(false);
    }
  };

  const decideDoctor = async (doctorEmail, decision, reason) => {
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/doctors/` + encodeURIComponent(doctorEmail) + '/decision', {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ decision, reason })
      });
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      setStatus(`Doctor ${decision}d: ${doctorEmail}`);
      await refresh();
    } catch (e) {
      setError(e.message || 'Network error');
    }
  };

  const approveAppointment = async (appointmentId, doctorEmailOrEmpty) => {
    setError(null);
    setStatus(null);
    try {
      const doctor_email = doctorEmailOrEmpty ? doctorEmailOrEmpty : null;
      const res = await fetch(`${API_BASE_URL}/admin/appointments/` + encodeURIComponent(appointmentId) + '/approve', {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ doctor_email })
      });
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      setStatus('Appointment approved.');
      await refresh();
    } catch (e) {
      setError(e.message || 'Network error');
    }
  };

  const rejectAppointment = async (appointmentId, reason) => {
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/appointments/` + encodeURIComponent(appointmentId) + '/reject', {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ reason })
      });
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      setStatus('Appointment rejected.');
      await refresh();
    } catch (e) {
      setError(e.message || 'Network error');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Don't call protected endpoints until a token is available.
    if (!token) {
      setLoading(false);
      return () => { mounted = false; };
    }

    async function load() {
      setLoading(true);
      try {
        await refresh();
      } catch (err) {
        if (mounted) setError('Network error: ' + err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const id = window.setInterval(() => {
      // lightweight polling so new appointments show up without manual refresh
      if (mounted) refresh();
    }, 5000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [token]);

  return (
    <div className="space-y-12 pb-24">
      {/* Control Center Header */}
      <section className="bg-slate-900 text-white rounded-[3rem] shadow-2xl p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-10 animate-fade-in mx-2 md:mx-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/10 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-sky-500/10 blur-[100px]"></div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black tracking-[0.2em] uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Administrative Authority
          </div>
          <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight italic">Control <span className="text-indigo-400">Center</span></h2>
          <p className="text-slate-400 text-xl max-w-xl leading-relaxed">
            Global health orchestrations and system governance at your fingertips.
          </p>
        </div>

        {token && (
          <div className="relative z-10 flex flex-wrap gap-4">
            <button
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all backdrop-blur"
              onClick={refresh}
              disabled={loading}
            >
              Force Sync
            </button>
            <button
              className="px-8 py-4 rounded-2xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-50 transition-all shadow-xl shadow-indigo-500/10"
              onClick={logout}
            >
              Terminate Session
            </button>
          </div>
        )}
      </section>

      {/* Auth Gate */}
      {!token && (
        <section className="max-w-xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100 p-12 animate-fade-in">
          <div className="text-center space-y-4 mb-10">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xl shadow-slate-200">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Integrity</h3>
            <p className="text-slate-500 text-base">Elevated privileges required. Authenticate to proceed.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Authority Override Key</label>
              <input
                className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-black tracking-[0.3em] text-center"
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            <button
              className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-xl shadow-indigo-200 btn-premium"
              onClick={login}
              disabled={loading || !adminPassword}
            >
              Access Command Console
            </button>
          </div>
        </section>
      )}

      {/* Dashboard Data */}
      {token && (
        <div className="space-y-12 animate-fade-in">
          {/* Live Security Feed - Highlights failures and blocks */}
          <div className="bg-rose-950/90 backdrop-blur rounded-[3rem] p-8 border border-rose-500/30 shadow-2xl shadow-rose-950/50 animate-pulse-slow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center animate-ping text-xl">🚨</div>
                <h4 className="text-xl font-black text-white italic">Live Security <span className="text-rose-400 font-mono">Telemetry</span></h4>
              </div>
              <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest bg-rose-500/20 px-4 py-1.5 rounded-full border border-rose-500/30">Active Surveillance</span>
            </div>
            <div className="space-y-3">
              {logs.filter(l => l.includes('ALERT') || l.includes('FAILED') || l.includes('Rate limit')).length > 0 ? (
                logs.filter(l => l.includes('ALERT') || l.includes('FAILED') || l.includes('Rate limit')).map((l, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all font-mono">
                    <span className="text-rose-500 font-black">!!!</span>
                    <div className="flex-1 text-rose-100 text-[10px] md:text-sm font-bold tracking-tight">{l}</div>
                    <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Immediate Attention</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-rose-300/40 italic font-mono text-sm">No critical breaches detected in current archive. System clear.</div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Patients', value: patients.length, icon: 'Users', color: 'indigo' },
              { label: 'Active Doctors', value: doctors.length, icon: 'Shield', color: 'emerald' },
              { label: 'Pending Apps', value: pendingDoctors.length, icon: 'Clock', color: 'amber' },
              { label: 'Requests', value: appointments.length, icon: 'Activity', color: 'sky' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-50 group hover:scale-[1.02] transition-transform">
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                  <span className="text-2xl">
                    {stat.icon === 'Users' ? '👥' : stat.icon === 'Shield' ? '🛡️' : stat.icon === 'Clock' ? '⏳' : '📈'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <h4 className="text-5xl font-black text-slate-900 leading-none">{stat.value}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* Status Notifications */}
          {(error || status) && (
            <div className="flex flex-col gap-4">
              {error && <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-700 font-bold flex items-center gap-4 animate-shake">
                <span className="text-2xl">⚠️</span> {error}
              </div>}
              {status && <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 font-bold flex items-center gap-4 animate-fade-in">
                <span className="text-2xl">✅</span> {status}
              </div>}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column: Tables */}
            <div className="lg:col-span-2 space-y-12">
              {/* Doctor Applications */}
              <section className="bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Resource <span className="text-indigo-600">Pending</span></h3>
                  <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl tracking-widest uppercase">Verification Queue</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-4">Identity</th>
                        <th className="px-4">License / Dept</th>
                        <th className="px-4 text-right">Decisions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDoctors.map((d) => (
                        <tr key={d.email} className="bg-slate-50/50 hover:bg-white transition-all shadow-sm hover:shadow-lg rounded-2xl group">
                          <td className="px-4 py-5 first:rounded-l-2xl">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900">{d.full_name || '-'}</div>
                              <div className="text-xs text-slate-400">{d.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-indigo-600">{d.department || 'General'}</div>
                              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest font-mono">{d.license_id || 'unverified'}</div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-right last:rounded-r-2xl">
                            <div className="flex justify-end gap-2 outline-none">
                              <button
                                className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 uppercase tracking-tighter"
                                onClick={() => decideDoctor(d.email, 'approve')}
                              >
                                Approve
                              </button>
                              <button
                                className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-black rounded-xl hover:bg-rose-500 hover:text-white transition-all uppercase"
                                onClick={() => {
                                  const reason = window.prompt('Reject reason:') || '';
                                  decideDoctor(d.email, 'reject', reason);
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pendingDoctors.length === 0 && (
                    <div className="py-12 text-center text-slate-400 font-bold italic">Queue Cleared. No pending verifications.</div>
                  )}
                </div>
              </section>

              {/* Appointments Orchestration */}
              <section className="bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Session <span className="text-sky-600">Orchestration</span></h3>
                  <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl tracking-widest uppercase">Global Registry</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-4">Ref # / Patient</th>
                        <th className="px-4">Provider / Area</th>
                        <th className="px-4">Logistics</th>
                        <th className="px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a, i) => {
                        const st = (a.status || 'pending').toLowerCase();
                        const doc = doctorsByEmail.get(String(a.doctor_email || '').trim().toLowerCase());
                        const doctorLabel = doc?.full_name ? doc.full_name : (a.doctor_email || 'Unassigned');

                        return (
                          <tr key={a.appointment_id} className="bg-slate-50/50 hover:bg-white transition-all shadow-sm hover:shadow-lg rounded-2xl group">
                            <td className="px-4 py-5 first:rounded-l-2xl">
                              <div className="space-y-1">
                                <div className="text-xs font-mono font-bold text-indigo-600 italic">#{a.appointment_number || i}</div>
                                <div className="text-sm font-bold text-slate-800">{a.patient_email || '-'}</div>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-slate-900">{doctorLabel}</div>
                                <div className="px-2 py-0.5 inline-block bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase tracking-widest">{a.department || 'General'}</div>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <div className="space-y-1">
                                <div className="text-sm font-bold text-slate-700 italic">{a.scheduled_time || '-'}</div>
                                <div className={`text-xs font-black uppercase tracking-widest ${st === 'confirmed' ? 'text-emerald-500' : st === 'cancelled' ? 'text-rose-500' : 'text-amber-500'
                                  }`}>{st}</div>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-right last:rounded-r-2xl">
                              {st === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="p-3 bg-white border border-slate-100 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                    onClick={() => approveAppointment(a.appointment_id, '')}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                  </button>
                                  <button
                                    className="p-3 bg-white border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                                    onClick={() => {
                                      const reason = window.prompt('Reject reason:') || '';
                                      if (reason.trim()) rejectAppointment(a.appointment_id, reason);
                                    }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {appointments.length === 0 && (
                    <div className="py-12 text-center text-slate-400 font-bold italic">Registry Empty. No sessions recorded.</div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Mini Tables & Logs */}
            <div className="space-y-12">
              {/* Patients Overview */}
              <section className="bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 p-8 space-y-6">
                <h3 className="text-xl font-black text-slate-900 italic">User <span className="text-indigo-600">Trajectory</span></h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {patients.map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-lg grayscale group-hover:grayscale-0 transition-all">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate">{p.full_name}</div>
                        <div className="text-xs text-slate-400 truncate">{p.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-indigo-600 italic">Age {p.age}</div>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && <div className="text-center text-slate-400 italic py-6">No users found.</div>}
                </div>
              </section>

              {/* Security Logs */}
              <section className="bg-slate-950 rounded-[3rem] shadow-2xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px]"></div>
                <div className="flex items-center justify-between relative z-10">
                  <h3 className="text-xl font-black text-white italic">Event <span className="text-rose-500">Telemetry</span></h3>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                </div>
                <div className="space-y-3 relative z-10">
                  {logs.slice(0, 10).map((l, i) => (
                    <div key={i} className="text-xs font-mono text-slate-400 leading-relaxed py-2 border-b border-white/5 last:border-0 hover:text-white transition-colors">
                      <span className="text-rose-500/50 mr-2">{" >>> "}</span> {l}
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-slate-600 italic font-mono text-sm">Awaiting telemetry data...</div>}
                </div>
                <button className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  View Complete Archive
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
