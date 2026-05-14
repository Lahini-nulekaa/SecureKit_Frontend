import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from './apiConfig';

function formatEpochSeconds(value) {
  if (!value) return '-';
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '-';
  try {
    return new Date(n * 1000).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function PatientDashboard({ onAuthChange }) {
  const [token, setToken] = useState(localStorage.getItem('patient_token') || '');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needs2fa, setNeeds2fa] = useState(false);
  const [pendingCreds, setPendingCreds] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editDoctorEmail, setEditDoctorEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');
  const [newDepartment, setNewDepartment] = useState('');
  const [newDoctorEmail, setNewDoctorEmail] = useState('');
  const [newTime, setNewTime] = useState('');
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  const DEPARTMENTS = [
    'General Medicine',
    'Pediatrics',
    'Cardiology',
    'Orthopedics',
    'Gynecology',
    'Dermatology',
  ];

  function normalizeDepartment(value) {
    return String(value || '').trim().toLowerCase();
  }

  const login = async (e) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.target);
    const email = form.get('email');
    const password = form.get('password');
    try {
      const res = await fetch(`${API_BASE_URL}/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      let data = null; try { data = JSON.parse(text); } catch { data = { __raw: text }; }
      if (!res.ok) { setError(data.detail || data.__raw || res.statusText); return; }

      // If backend indicates that 2FA is required, switch to OTP step.
      if (data.requires_2fa) {
        setNeeds2fa(true);
        setPendingCreds({ email, password });
        setOtp('');
        return;
      }

      if (!data.token) {
        setError('Login failed: token not returned');
        return;
      }

      localStorage.setItem('patient_token', data.token);
      setToken(data.token);
      if (onAuthChange) onAuthChange(true);
      fetchAppointments(data.token);
    } catch (err) {
      setError('Network error');
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!pendingCreds.email || !pendingCreds.password) {
      setError('Session expired. Please log in again.');
      setNeeds2fa(false);
      setOtp('');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          email: pendingCreds.email,
          password: pendingCreds.password,
          code: otp,
        }),
      });
      const text = await res.text();
      let data = null; try { data = JSON.parse(text); } catch { data = { __raw: text }; }
      if (!res.ok) { setError(data.detail || data.__raw || res.statusText); return; }

      if (!data.token) {
        setError('Login failed: token not returned');
        return;
      }

      localStorage.setItem('patient_token', data.token);
      setToken(data.token);
      setNeeds2fa(false);
      setPendingCreds({ email: '', password: '' });
      setOtp('');
      if (onAuthChange) onAuthChange(true);
      fetchAppointments(data.token);
    } catch (err) {
      setError('Network error');
    }
  };

  const fetchAppointments = async (tok) => {
    const effectiveToken = tok || token;
    if (!effectiveToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/patient/appointments`, {
        headers: { Authorization: 'Bearer ' + effectiveToken },
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { __raw: text };
      }
      if (!res.ok) {
        setError(data.detail || data.__raw || res.statusText);
        setAppointments([]);
        return;
      }
      setAppointments(Array.isArray(data.data) ? data.data : []);
    } catch {
      setError('Network error');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/patient/doctors`, { credentials: "include" });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { __raw: text };
      }
      if (!res.ok) {
        // don't surface doctor list errors as global errors on dashboard
        return;
      }
      const raw = Array.isArray(data.data) ? data.data : [];
      setDoctors(raw);
    } catch {
      // ignore network errors for doctors list here
    }
  };

  const logout = () => {
    localStorage.removeItem('patient_token');
    setToken('');
    setAppointments([]);
    setNeeds2fa(false);
    setPendingCreds({ email: '', password: '' });
    setOtp('');
    setEditingId('');
    setEditTime('');
    setEditDepartment('');
    setEditDoctorEmail('');
    setSaving(false);
    setNewDepartment('');
    setNewDoctorEmail('');
    setNewTime('');
    setBookingSaving(false);
    setBookingStatus(null);
    if (onAuthChange) onAuthChange(false);
  };

  const hasSession = !!token;

  const departmentOptions = useMemo(() => {
    const seen = new Set();
    const out = [];

    for (const d of doctors) {
      const dep = (d?.department || '').trim() || 'General Medicine';
      const key = normalizeDepartment(dep);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(dep);
    }

    for (const dep of DEPARTMENTS) {
      const key = normalizeDepartment(dep);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(dep);
    }

    out.sort((a, b) => a.localeCompare(b));
    return out;
  }, [doctors]);

  const doctorsByEmail = useMemo(() => {
    const m = new Map();
    for (const d of doctors) {
      if (d && d.email) m.set(d.email, d);
    }
    return m;
  }, [doctors]);

  const doctorsForEdit = useMemo(() => {
    if (!editDepartment) return doctors;
    const key = normalizeDepartment(editDepartment);
    return doctors.filter(
      (d) => normalizeDepartment(d?.department || 'General Medicine') === key
    );
  }, [doctors, editDepartment]);

  const filteredDoctorsForNew = useMemo(() => {
    if (!newDepartment) return [];
    const key = normalizeDepartment(newDepartment);
    return doctors.filter(
      (d) => normalizeDepartment(d?.department || 'General Medicine') === key
    );
  }, [doctors, newDepartment]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!token) return;

    setBookingSaving(true);
    setBookingStatus(null);
    setError(null);

    try {
      const payload = {
        department: newDepartment,
        doctor_email: newDoctorEmail,
        scheduled_time: newTime,
      };

      const res = await fetch(`${API_BASE_URL}/patient/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { __raw: text };
      }

      if (!res.ok) {
        setError(data.detail || data.__raw || res.statusText);
      } else {
        setBookingStatus('Appointment request sent. Waiting for admin confirmation.');
        setNewDepartment('');
        setNewDoctorEmail('');
        setNewTime('');
        fetchAppointments(token);
      }
    } catch {
      setError('Network error');
    } finally {
      setBookingSaving(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments(token);
      fetchDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="space-y-16 pb-32">
      {/* Premium Header */}
      <section className="bg-slate-900 text-white rounded-[4rem] shadow-2xl p-16 md:p-20 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-12 animate-fade-in mx-2 md:mx-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-indigo-600/10 blur-[150px]"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-full bg-sky-600/10 blur-[120px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-black tracking-[0.3em] uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Citizen Sync Active
          </div>
          <h2 className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none">Patient <span className="text-sky-400 font-serif">Dashboard</span></h2>
          <p className="text-slate-400 text-2xl max-w-xl leading-relaxed font-medium">
            Centralized orchestration of your clinical trajectory. Managing encounters with absolute precision.
          </p>
        </div>

        {hasSession && (
          <div className="relative z-10 flex flex-wrap gap-6">
            <button
              type="button"
              className="px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur active:scale-95"
              onClick={() => fetchAppointments(token)}
            >
              Refresh Stream
            </button>
            <button
              type="button"
              className="px-10 py-5 rounded-[2rem] bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-2xl shadow-rose-900/40 active:scale-95 italic"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </section>

      {/* Auth Panels */}
      {!hasSession && (
        <div className="animate-fade-in flex justify-center py-20">
          {!needs2fa ? (
            <section className="max-w-xl w-full bg-white rounded-[4rem] shadow-2xl shadow-indigo-100 border border-slate-50 p-16">
              <div className="text-center space-y-6 mb-12">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 group hover:rotate-6 transition-transform">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">Citizen Access</h3>
                <p className="text-slate-500 font-medium">Verify your network identity to initialize the matrix.</p>
              </div>

              <form onSubmit={login} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-1">Email (@)</label>
                  <input
                    name="email"
                    className="w-full px-8 py-5 rounded-[2rem] border border-slate-100 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 font-bold text-slate-800 placeholder:text-slate-300"
                    type="email"
                    placeholder="citizen@protocol.xyz"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-1">Password</label>
                  <input
                    name="password"
                    className="w-full px-8 py-5 rounded-[2rem] border border-slate-100 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 font-bold text-slate-800 placeholder:text-slate-300"
                    type="password"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
                <button
                  className="w-full py-6 rounded-[2rem] bg-indigo-600 hover:bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-100 active:scale-95 italic mt-6"
                  type="submit"
                >
                  Initiate Secure Pipeline
                </button>
              </form>
            </section>
          ) : (
            <section className="max-w-xl w-full bg-white rounded-[4rem] shadow-2xl shadow-indigo-100 border border-slate-50 p-16">
              <div className="text-center space-y-6 mb-12">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic">2FA Handshake</h4>
                <p className="text-slate-500 font-medium tracking-tight">Synchronization token required for encrypted handshake.</p>
              </div>

              <form onSubmit={verifyOtp} className="space-y-10">
                <input
                  className="w-full px-6 py-8 rounded-[2.5rem] border border-slate-100 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 text-center text-5xl font-black tracking-[0.5em] text-emerald-600 placeholder:text-slate-100"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  required
                  maxLength={6}
                />
                <div className="flex flex-col gap-5">
                  <button
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 italic"
                    type="submit"
                  >
                    Confirm Synchronization
                  </button>
                  <button
                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors"
                    type="button"
                    onClick={() => { setNeeds2fa(false); setPendingCreds({ email: '', password: '' }); setOtp(''); }}
                  >
                    Abort Request
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}

      {/* Main Content Dashboard */}
      {hasSession && (
        <div className="grid lg:grid-cols-4 gap-16 animate-fade-in">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-12">
              <div className="bg-white rounded-[3.5rem] shadow-xl shadow-slate-100 border border-slate-50 p-8 space-y-3">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-6 mb-8 italic">Registry_Terminal</h3>
                {[
                  { id: 'appointments', label: 'Current Appointments', icon: '📓' },
                  { id: 'new', label: 'New Appointment', icon: '🛰️' },
                  { id: 'notifications', label: 'Notifications', icon: '📡' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={
                      'w-full flex items-center gap-6 px-8 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all group ' +
                      (activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 italic'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600')
                    }
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="text-3xl group-hover:scale-125 transition-transform group-hover:rotate-6">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 space-y-8 relative overflow-hidden group border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[80px]"></div>
                <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">Security Core</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest leading-none">Status: Nominal</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    End-to-end clinical encryption is active. Your biological data is shielded by SecureKit protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="lg:col-span-3 space-y-12">
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/30 border border-slate-50 p-12 md:p-16 space-y-12 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-30"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Active <span className="text-indigo-600">Appointments</span></h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">High-fidelity log of your existing clinical encounters.</p>
                  </div>
                  <button
                    type="button"
                    className="px-8 py-4 rounded-[1.5rem] bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95"
                    onClick={() => fetchAppointments(token)}
                  >
                    Sync Records
                  </button>
                </div>

                {loading ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-8">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-inner"></div>
                    <p className="text-slate-400 font-black animate-pulse uppercase tracking-[0.4em] text-xs">Filtering Records...</p>
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="overflow-x-auto -mx-12 px-12 pb-8">
                    <table className="w-full text-left border-separate border-spacing-y-6">
                      <thead>
                        <tr className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">
                          <th className="px-8 pb-4">Lead Specialist</th>
                          <th className="px-8 pb-4">Clinical Vertical</th>
                          <th className="px-8 pb-4 text-center">Temporal Index</th>
                          <th className="px-8 pb-4 text-center">Protocol Status</th>
                          <th className="px-8 pb-4 text-right">Ops</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => {
                          const doctor = doctorsByEmail.get((a.doctor_email || '').trim());
                          const doctorLabel = doctor?.full_name || doctor?.name || a.doctor_email || '-';

                          return (
                            <tr key={a.appointment_id} className="group bg-slate-50/50 hover:bg-white transition-all shadow-sm hover:shadow-2xl rounded-[2.5rem]">
                              <td className="px-8 py-8 first:rounded-l-[2.5rem]">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:rotate-3 transition-transform">🩺</div>
                                  <div className="space-y-1">
                                    <span className="font-black text-slate-800 italic block leading-none">{doctorLabel}</span>
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{a.doctor_email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-8">
                                <span className="px-4 py-2 bg-white text-indigo-600 text-xs font-black uppercase tracking-[0.2em] rounded-xl border border-indigo-50">{a.department || 'General'}</span>
                              </td>
                              <td className="px-8 py-8 text-center font-black text-slate-500 text-xs italic tracking-tight">
                                {formatEpochSeconds(a.scheduled_time)}
                              </td>
                              <td className="px-8 py-8 text-center">
                                <span className={`px-5 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase border ${a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  a.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                  {a.status || 'Pending'}
                                </span>
                              </td>
                              <td className="px-8 py-8 text-right last:rounded-r-[2.5rem]">
                                <div className="flex justify-end gap-3">
                                  <button
                                    className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-90"
                                    onClick={() => alert('Accessing secure record...')}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </button>
                                  <button
                                    className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-90"
                                    onClick={() => alert('Mission abort request sent...')}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-32 text-center space-y-10">
                    <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-6xl grayscale opacity-30 animate-pulse">📅</div>
                    <div className="space-y-4">
                      <p className="text-3xl font-black text-slate-900 tracking-tighter italic">No Active Trajectories</p>
                      <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">System scan reveals zero scheduled encounters. Initialize a new link to begin.</p>
                    </div>
                    <button onClick={() => setActiveTab('new')} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all active:scale-95 italic">Initialize Mission</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'new' && (
              <div className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/30 border border-slate-50 p-12 md:p-16 space-y-16 animate-fade-in">
                <div className="space-y-4 border-b border-slate-50 pb-8">
                  <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 leading-none">Clinical Bridge</div>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Create New <span className="text-sky-500 font-serif">Appointment</span></h3>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed">Establish a direct encrypted connection with leading healthcare vanguards.</p>
                </div>

                <form className="grid md:grid-cols-2 gap-16" onSubmit={handleCreateAppointment}>
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">Clinical Vertical</label>
                      <select
                        className="w-full px-8 py-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 font-black text-sm uppercase tracking-widest text-slate-700 italic focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        value={newDepartment}
                        onChange={(e) => { setNewDepartment(e.target.value); setNewDoctorEmail(''); }}
                        required
                      >
                        <option value="" className="font-sans not-italic">Choose Domain</option>
                        {departmentOptions.map((dep) => (
                          <option key={dep} value={dep} className="font-sans not-italic">{dep}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">Vanguard Specialist</label>
                      <select
                        className="w-full px-8 py-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 font-black text-sm uppercase tracking-widest text-slate-700 italic focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none disabled:opacity-40 cursor-pointer"
                        value={newDoctorEmail}
                        onChange={(e) => setNewDoctorEmail(e.target.value)}
                        required
                        disabled={!newDepartment || filteredDoctorsForNew.length === 0}
                      >
                        <option value="" className="font-sans not-italic">{!newDepartment ? 'Domain Sync Required' : filteredDoctorsForNew.length === 0 ? 'No Units Active' : 'Select Professional'}</option>
                        {filteredDoctorsForNew.map((d) => (
                          <option key={d.email} value={d.email} className="font-sans not-italic">{d.full_name || d.email}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">Temporal Index (Date & Time)</label>
                      <input
                        className="w-full px-8 py-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 font-black text-sm tracking-tighter text-slate-700 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                        type="datetime-local"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-6">
                      <button
                        className="w-full py-7 rounded-[2.5rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl hover:scale-[1.02] active:scale-95 italic"
                        type="submit"
                        disabled={bookingSaving}
                      >
                        {bookingSaving ? (
                          <span className="flex items-center justify-center gap-4">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Syncing Protocol...
                          </span>
                        ) : 'Finalize Reservation'}
                      </button>
                    </div>
                  </div>
                </form>

                {bookingStatus && (
                  <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[3rem] flex items-center gap-6 animate-fade-in shadow-xl shadow-emerald-100/20">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 flex items-center justify-center text-emerald-600 text-4xl shadow-inner">⚡</div>
                    <div>
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">Transmission Success</p>
                      <p className="font-black text-emerald-800 text-lg leading-tight italic">{bookingStatus}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/30 border border-slate-50 p-16 md:p-24 space-y-12 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px]"></div>
                <div className="text-center py-20 space-y-10">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-600 shadow-inner group hover:rotate-12 transition-transform duration-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                  <div className="space-y-4">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter italic">Network Silence</p>
                    <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">System scan reveals nominal continuity. No high-priority alerts in current stream.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
