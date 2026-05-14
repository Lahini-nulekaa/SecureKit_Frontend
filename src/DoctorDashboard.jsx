import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from './apiConfig';

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

export default function DoctorDashboard({ onLogout }) {
  const [token, setToken] = useState(localStorage.getItem('doctor_token') || '');
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalHistoryDraft, setMedicalHistoryDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const authHeaders = useMemo(() => ({ Authorization: 'Bearer ' + token }), [token]);

  const logout = () => {
    localStorage.removeItem('doctor_token');
    setToken('');
    setProfile(null);
    setPatients([]);
    setAppointments([]);
    setSelectedEmail('');
    setSelectedPatient(null);
    setMedicalHistoryDraft('');
    if (onLogout) onLogout();
  };

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const [meRes, pRes, aRes] = await Promise.all([
        fetch(`${API_BASE_URL}/doctor/me`, { headers: authHeaders, credentials: "include" }),
        fetch(`${API_BASE_URL}/doctor/patients`, { headers: authHeaders, credentials: "include" }),
        fetch(`${API_BASE_URL}/doctor/appointments`, { headers: authHeaders, credentials: "include" })
      ]);

      const meText = await meRes.text();
      const pText = await pRes.text();
      const aText = await aRes.text();
      const meJson = parseJsonSafe(meText);
      const pJson = parseJsonSafe(pText);
      const aJson = parseJsonSafe(aText);

      if (!meRes.ok) {
        setError(meJson.detail || meJson.__raw || meRes.statusText);
        return;
      }
      if (!pRes.ok) {
        setError(pJson.detail || pJson.__raw || pRes.statusText);
        return;
      }
      if (!aRes.ok) {
        setError(aJson.detail || aJson.__raw || aRes.statusText);
        return;
      }

      setProfile(meJson);
      setPatients(Array.isArray(pJson.data) ? pJson.data : []);
      setAppointments(Array.isArray(aJson.data) ? aJson.data : []);
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const decideAppointment = async (appointmentId, decision) => {
    if (!appointmentId) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/doctor/appointments/` + encodeURIComponent(appointmentId) + '/decision', {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ decision })
      });
      const text = await res.text();
      const json = parseJsonSafe(text);
      if (!res.ok) {
        setError(json.detail || json.__raw || res.statusText);
        return;
      }
      setStatus('Appointment updated.');
      await loadAll();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const loadPatient = async (email) => {
    if (!email) return;
    setSelectedEmail(email);
    setSelectedPatient(null);
    setMedicalHistoryDraft('');
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/doctor/patients/` + encodeURIComponent(email), { headers: authHeaders, credentials: "include" });
      const text = await res.text();
      const json = parseJsonSafe(text);
      if (!res.ok) {
        setError(json.detail || json.__raw || res.statusText);
        return;
      }
      setSelectedPatient(json);
      setMedicalHistoryDraft(json.medical_history || '');
    } catch {
      setError('Network error');
    }
  };

  const saveMedicalHistory = async () => {
    if (!selectedEmail) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/doctor/patients/` + encodeURIComponent(selectedEmail) + '/medical-history',
        {
          method: 'PUT',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          credentials: "include",
          body: JSON.stringify({ medical_history: medicalHistoryDraft })
        }
      );
      const text = await res.text();
      const json = parseJsonSafe(text);
      if (!res.ok) {
        setError(json.detail || json.__raw || res.statusText);
        return;
      }
      setStatus('Medical history updated.');
      await loadPatient(selectedEmail);
      await loadAll();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setError(null);
      setStatus(null);
      try {
        const [meRes, pRes, aRes] = await Promise.all([
          fetch(`${API_BASE_URL}/doctor/me`, { headers: { Authorization: 'Bearer ' + token }, credentials: "include" }),
          fetch(`${API_BASE_URL}/doctor/patients`, { headers: { Authorization: 'Bearer ' + token }, credentials: "include" }),
          fetch(`${API_BASE_URL}/doctor/appointments`, { headers: { Authorization: 'Bearer ' + token }, credentials: "include" })
        ]);

        const meText = await meRes.text();
        const pText = await pRes.text();
        const aText = await aRes.text();
        const meJson = parseJsonSafe(meText);
        const pJson = parseJsonSafe(pText);
        const aJson = parseJsonSafe(aText);

        if (!meRes.ok) {
          setError(meJson.detail || meJson.__raw || meRes.statusText);
          return;
        }
        if (!pRes.ok) {
          setError(pJson.detail || pJson.__raw || pRes.statusText);
          return;
        }
        if (!aRes.ok) {
          setError(aJson.detail || aJson.__raw || aRes.statusText);
          return;
        }

        setProfile(meJson);
        setPatients(Array.isArray(pJson.data) ? pJson.data : []);
        setAppointments(Array.isArray(aJson.data) ? aJson.data : []);
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-6 animate-fade-in border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-4xl grayscale opacity-50">🛡️</div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Clinical Gate</h2>
            <p className="mt-2 text-slate-500 font-medium leading-relaxed">Doctor authentication is required to access the diagnostic mainframe.</p>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200">Retry Authentication</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Clinical Hub Header */}
      <section className="bg-slate-900 text-white rounded-[3rem] shadow-2xl p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-10 animate-fade-in mx-2 md:mx-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/10 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-sky-500/10 blur-[100px]"></div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-[0.2em] uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Specialist Verified
          </div>
          <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight">Clinical <span className="text-sky-400 font-serif italic">Hub</span></h2>
          {profile && (
            <div className="flex items-center gap-4 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">👨‍⚕️</div>
              <div className="space-y-0.5">
                <div className="text-white font-bold text-xl">{profile.full_name || profile.email}</div>
                <div className="text-sm font-black uppercase tracking-widest text-indigo-400">{profile.department || 'General Practice'} • License {profile.license_id || 'unassigned'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 flex flex-wrap gap-4">
          <button
            className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all backdrop-blur"
            onClick={loadAll}
            disabled={loading}
          >
            Refactor Data
          </button>
          <button
            className="px-8 py-4 rounded-2xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-50 transition-all shadow-xl shadow-indigo-500/10"
            onClick={logout}
          >
            End Shift
          </button>
        </div>
      </section>

      {/* Alerts */}
      {(error || status) && (
        <div className="flex flex-col gap-4 mx-2 md:mx-0">
          {error && <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-700 font-bold flex items-center gap-4 animate-shake">
            <span className="text-2xl">⚠️</span> {error}
          </div>}
          {status && <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-emerald-700 font-bold flex items-center gap-4 animate-fade-in">
            <span className="text-2xl">✅</span> {status}
          </div>}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-12 animate-fade-in">
        {/* Appointments Section */}
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 p-10 space-y-8 min-h-[500px]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Assigned <span className="text-indigo-600">Encounters</span></h3>
              <div className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl uppercase tracking-widest">{appointments.length} Total</div>
            </div>

            <div className="overflow-x-auto pr-2 custom-scrollbar">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 pb-2">Reference ID</th>
                    <th className="px-6 pb-2">Patient Entity</th>
                    <th className="px-6 pb-2">Timeline</th>
                    <th className="px-6 pb-2 text-right">Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => {
                    const st = (a.status || 'pending').toLowerCase();
                    return (
                      <tr key={a.appointment_id} className="group bg-slate-50/50 hover:bg-white transition-all shadow-sm hover:shadow-xl rounded-2xl">
                        <td className="px-6 py-6 first:rounded-l-2xl">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg italic">
                            #{a.appointment_number || 'ENC-' + a.appointment_id.slice(0, 4)}
                          </span>
                        </td>
                        <td className="px-6 py-6 font-bold text-slate-700 text-sm">
                          {a.patient_email || '-'}
                        </td>
                        <td className="px-6 py-6 italic text-slate-400 text-xs font-bold uppercase tracking-tighter">
                          {a.scheduled_time || '-'}
                        </td>
                        <td className="px-6 py-6 text-right last:rounded-r-2xl">
                          {st === 'approved' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-lg hover:bg-emerald-600 transition-all uppercase"
                                onClick={() => decideAppointment(a.appointment_id, 'accept')}
                                disabled={saving}
                              >
                                Accept
                              </button>
                              <button
                                className="px-4 py-2 bg-slate-200 text-slate-500 text-xs font-black rounded-lg hover:bg-rose-500 hover:text-white transition-all uppercase"
                                onClick={() => decideAppointment(a.appointment_id, 'reject')}
                                disabled={saving}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${st === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              st === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
                              }`}>{st}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-3xl grayscale opacity-30">🗓️</div>
                  <p className="text-slate-400 font-bold italic">No encasements detected in your queue.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar: Patient View */}
        <section className="space-y-12">
          {/* Patient Selector */}
          <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-900 italic">User <span className="text-sky-600">Inventory</span></h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {patients.map((p, idx) => (
                <div
                  key={idx}
                  className={
                    'group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ' +
                    (p.email === selectedEmail
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200'
                      : 'bg-slate-50 border-transparent hover:border-indigo-100')
                  }
                  onClick={() => loadPatient(p.email)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${p.email === selectedEmail ? 'bg-white/10' : 'bg-white shadow-sm'}`}>👤</div>
                    <div className="min-w-0">
                      <div className="font-bold truncate text-base">{p.full_name || '-'}</div>
                      <div className={`text-xs truncate ${p.email === selectedEmail ? 'text-indigo-200' : 'text-slate-400'}`}>{p.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-black italic ${p.email === selectedEmail ? 'text-white' : 'text-indigo-600'}`}>AGE {p.age ?? '?'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Records Editor */}
          <div className="bg-slate-900 text-white rounded-[3rem] shadow-2xl p-10 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[80px]"></div>
            <h3 className="text-xl font-black italic relative z-10">Diagnostic <span className="text-sky-400 font-serif">Mainframe</span></h3>

            {!selectedEmail ? (
              <div className="py-12 text-center space-y-4 relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-2xl grayscale">🔬</div>
                <p className="text-slate-500 text-sm font-medium">Select a patient profile to begin diagnostic override.</p>
              </div>
            ) : (
              <div className="space-y-6 relative z-10 animate-fade-in">
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Subject Identity</div>
                  <div className="text-xl font-bold">{selectedPatient?.full_name || selectedEmail}</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Medical Trajectory</label>
                    <span className="text-xs font-mono text-slate-600">v-2.1 Secure_Edit</span>
                  </div>
                  <textarea
                    className="w-full min-h-[220px] px-6 py-5 rounded-3xl bg-white/5 border border-white/10 focus:border-sky-400/50 outline-none transition-all font-mono text-sm leading-relaxed text-slate-300 custom-scrollbar"
                    placeholder="Initialize medical data entry..."
                    value={medicalHistoryDraft}
                    onChange={(e) => setMedicalHistoryDraft(e.target.value)}
                  />
                </div>

                <button
                  className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 hover:text-white transition-all shadow-xl shadow-black/20"
                  onClick={saveMedicalHistory}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-4">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Synchronizing...
                    </span>
                  ) : 'Verify & Commit Record'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
