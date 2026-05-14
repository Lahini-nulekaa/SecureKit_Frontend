import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from './apiConfig';

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

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

const DEPARTMENTS = [
  'General Medicine',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
  'Gynecology',
  'Dermatology'
];

function normalizeDepartment(value) {
  return String(value || '').trim().toLowerCase();
}

export default function Appointments({ onNavigateToLogin }) {
  const [token, setToken] = useState(localStorage.getItem('patient_token') || '');

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [department, setDepartment] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const authHeaders = useMemo(
    () => (token ? { Authorization: 'Bearer ' + token } : {}),
    [token]
  );

  const doctorsByEmail = useMemo(() => {
    const m = new Map();
    for (const d of doctors) {
      if (d && d.email) m.set(d.email, d);
    }
    return m;
  }, [doctors]);

  const departmentOptions = useMemo(() => {
    const seen = new Set();
    const out = [];

    // Prefer live departments from backend (so filtering matches what doctors actually have)
    for (const d of doctors) {
      const dep = (d?.department || '').trim() || 'General Medicine';
      const key = normalizeDepartment(dep);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(dep);
    }

    // Add common departments as fallback options
    for (const dep of DEPARTMENTS) {
      const key = normalizeDepartment(dep);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(dep);
    }

    out.sort((a, b) => a.localeCompare(b));
    return out;
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    // UX: user selects department first, then picks a doctor from that department.
    if (!department) return [];
    const key = normalizeDepartment(department);
    return doctors.filter((d) => normalizeDepartment(d?.department || 'General Medicine') === key);
  }, [doctors, department]);

  const pendingAppointments = useMemo(
    () => appointments.filter((a) => ((a?.status || 'pending').toLowerCase() === 'pending')),
    [appointments]
  );

  const confirmedAppointments = useMemo(
    () => appointments.filter((a) => ((a?.status || 'pending').toLowerCase() !== 'pending')),
    [appointments]
  );

  // If a doctor was selected from Doctors page, prefill the booking form.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('appointment_draft_doctor');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const email = String(parsed?.email || '').trim();
      if (!email) return;

      setDoctorEmail(email);
      const dep = String(parsed?.department || '').trim();
      if (dep) setDepartment(dep);

      // One-shot (avoid forcing the same selection forever)
      localStorage.removeItem('appointment_draft_doctor');
    } catch {
      // ignore
    }
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      // Doctors list is public; load it regardless of any issues with appointments.
      const dRes = await fetch(`${API_BASE_URL}/patient/doctors`, {
        credentials: "include"
      });
      const dJson = parseJsonSafe(await dRes.text());
      if (!dRes.ok) throw new Error(dJson.detail || dJson.__raw || dRes.statusText);
      setDoctors(Array.isArray(dJson.data) ? dJson.data : []);

      // Appointments list requires auth; failure here should not prevent booking.
      const aRes = await fetch(`${API_BASE_URL}/patient/appointments`, { 
        headers: authHeaders,
        credentials: "include"
      });
      const aJson = parseJsonSafe(await aRes.text());
      if (!aRes.ok) throw new Error(aJson.detail || aJson.__raw || aRes.statusText);
      setAppointments(Array.isArray(aJson.data) ? aJson.data : []);

      // Keep selection consistent
      if (selectedAppointmentId) {
        const stillExists = (aJson.data || []).some((x) => x.appointment_id === selectedAppointmentId);
        if (!stillExists) {
          setSelectedAppointmentId('');
          setSelectedAppointment(null);
        }
      }
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointment = async (appointmentId) => {
    if (!token || !appointmentId) return;
    setSelectedAppointmentId(appointmentId);
    setSelectedAppointment(null);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/patient/appointments/` + encodeURIComponent(appointmentId), { 
        headers: authHeaders,
        credentials: "include" 
      });
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      setSelectedAppointment(json);
    } catch (e) {
      setError(e.message || 'Network error');
    }
  };

  const createAppointment = async (e) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const effectiveDepartment = (department || '').trim();

      const payload = {
        department: effectiveDepartment,
        doctor_email: doctorEmail,
        scheduled_time: scheduledTime,
      };

      const isEditing = !!editingAppointmentId;
      const url = isEditing
        ? `${API_BASE_URL}/patient/appointments/` + encodeURIComponent(editingAppointmentId)
        : `${API_BASE_URL}/patient/appointments`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);

      setStatus(
        editingAppointmentId
          ? 'Appointment updated. Still pending admin confirmation.'
          : 'Appointment request sent. Waiting for admin confirmation.'
      );
      setDepartment('');
      setDoctorEmail('');
      setScheduledTime('');
      setEditingAppointmentId('');

      await refresh();
    } catch (e2) {
      setError(e2.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const checkIn = async () => {
    if (!token || !selectedAppointmentId) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/patient/appointments/` + encodeURIComponent(selectedAppointmentId) + '/check-in',
        { 
          method: 'PUT', 
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          credentials: "include" 
        }
      );
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      setStatus('Checked in successfully.');
      await refresh();
      await loadAppointment(selectedAppointmentId);
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const cancelSelected = async () => {
    if (!token || !selectedAppointmentId) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/patient/appointments/` + encodeURIComponent(selectedAppointmentId) + '/cancel',
        { 
          method: 'PUT', 
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          credentials: "include" 
        }
      );
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      setStatus('Appointment cancelled.');
      await refresh();
      await loadAppointment(selectedAppointmentId);
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('patient_token');
    setToken('');
    setAppointments([]);
    setSelectedAppointmentId('');
    setSelectedAppointment(null);
    setEditingAppointmentId('');
    setStatus(null);
    setError(null);
  };

  useEffect(() => {
    // Keep token in sync if user logs in elsewhere.
    const id = window.setInterval(() => {
      const t = localStorage.getItem('patient_token') || '';
      setToken((prev) => (prev !== t ? t : prev));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 animate-fade-in border border-slate-100">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto text-5xl">🗓️</div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">Patient <span className="text-indigo-600">Verification</span></h2>
            <p className="text-slate-500 leading-relaxed font-medium">Authentication is required to synchronize with the specialist registry and orchestrate medical encounters.</p>
          </div>
          <button
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            onClick={() => (onNavigateToLogin ? onNavigateToLogin() : null)}
          >
            Access Secure Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Appointments Header */}
      <section className="bg-slate-900 text-white rounded-[3rem] shadow-2xl p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-10 animate-fade-in mx-2 md:mx-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/10 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-sky-500/10 blur-[100px]"></div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black tracking-[0.2em] uppercase">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Global Health Registry
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">Health <span className="text-indigo-400 font-serif italic">Encounters</span></h2>
          <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
            Orchestrate your clinical journey with precision and end-to-end security.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4">
          <button
            className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all backdrop-blur"
            onClick={refresh}
            disabled={loading}
          >
            Live Sync
          </button>
          <button
            className="px-8 py-4 rounded-2xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-50 transition-all shadow-xl shadow-indigo-500/10"
            onClick={logout}
          >
            Exit Registry
          </button>
        </div>
      </section>

      {/* Global Status */}
      {(error || status) && (
        <div className="flex flex-col gap-4 animate-fade-in mx-2 md:mx-0">
          {error && <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-700 font-bold flex items-center gap-4 animate-shake">
            <span className="text-2xl">⚠️</span> {error}
          </div>}
          {status && <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-emerald-700 font-bold flex items-center gap-4">
            <span className="text-2xl">✅</span> {status}
          </div>}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-12 animate-fade-in">
        {/* Booking Section */}
        <section className="bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 p-10 md:p-14 space-y-10 group">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-slate-900 italic tracking-tight">Initiate <span className="text-indigo-600">Booking</span></h3>
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">✍️</div>
          </div>

          <form className="space-y-8" onSubmit={createAppointment}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Clinical Department</label>
                <select
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-800"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setDoctorEmail('');
                  }}
                  required
                >
                  <option value="">Select Domain</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Lead Specialist</label>
                <select
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-800 disabled:opacity-50"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  required
                  disabled={!department || filteredDoctors.length === 0}
                >
                  <option value="">
                    {!department ? 'Sync Domain First' : filteredDoctors.length === 0 ? 'No Specialists' : 'Select Specialist'}
                  </option>
                  {filteredDoctors.map((d) => (
                    <option key={d.email} value={d.email}>
                      {d.full_name || d.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Temporal Alignment (Date & Time)</label>
              <input
                className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-indigo-500 transition-all font-mono font-bold text-slate-900"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              type="submit"
              disabled={saving || loading}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-4">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Orchestrating...
                </span>
              ) : (editingAppointmentId ? 'Modify Encounter' : 'Confirm Mission')}
            </button>
            {editingAppointmentId && (
              <button
                type="button"
                onClick={() => { setEditingAppointmentId(''); setDepartment(''); setDoctorEmail(''); setScheduledTime(''); }}
                className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
              >Abort Revision</button>
            )}
          </form>
        </section>

        {/* List Section */}
        <section className="space-y-12">
          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-100 flex items-center gap-6 group hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">✅</div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmed</div>
                <div className="text-3xl font-black text-slate-900">{confirmedAppointments.length}</div>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-100 flex items-center gap-6 group hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">⏳</div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending</div>
                <div className="text-3xl font-black text-slate-900">{pendingAppointments.length}</div>
              </div>
            </div>
          </div>

          {/* Appointment Registry */}
          <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 p-10 space-y-8 min-h-[500px]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Active <span className="text-sky-600">Registry</span></h3>
              <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl tracking-widest uppercase">Patient Zero</span>
            </div>

            <div className="overflow-x-auto pr-2 custom-scrollbar">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 pb-2">Specialist</th>
                    <th className="px-6 pb-2">Timeline</th>
                    <th className="px-6 pb-2 text-right">State</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Pending first then Confirmed */}
                  {[...pendingAppointments, ...confirmedAppointments].map((a) => {
                    const st = (a.status || 'pending').toLowerCase();
                    const doc = doctorsByEmail.get(a.doctor_email);
                    const isSelected = a.appointment_id === selectedAppointmentId;

                    return (
                      <tr
                        key={a.appointment_id}
                        onClick={() => loadAppointment(a.appointment_id)}
                        className={`group cursor-pointer transition-all shadow-sm hover:shadow-xl rounded-2xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50/50 hover:bg-white'
                          }`}
                      >
                        <td className="px-6 py-5 first:rounded-l-2xl">
                          <div className="space-y-0.5">
                            <div className="font-bold text-sm">{doc?.full_name || a.doctor_email}</div>
                            <div className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {a.department || 'General'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-mono text-[10px] font-bold italic">
                            {a.scheduled_time || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right last:rounded-r-2xl">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isSelected ? 'bg-white/20 text-white' :
                            st === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              st === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>{st}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {[...pendingAppointments, ...confirmedAppointments].length === 0 && (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-3xl grayscale opacity-30">📂</div>
                  <p className="text-slate-400 font-bold italic">No records detected in your registry.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Detail Overlay / Panel */}
      {selectedAppointment && (
        <section className="bg-slate-900 text-white rounded-[3rem] shadow-2xl p-12 md:p-16 relative overflow-hidden animate-slide-up mx-2 md:mx-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-12 flex-1">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="px-5 py-2 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20">
                    ENC-{selectedAppointment.appointment_number?.split('-')?.[1] || selectedAppointment.appointment_id.slice(0, 6)}
                  </span>
                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${selectedAppointment.status === 'confirmed' ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/50 text-amber-400'
                    }`}>
                    System_{selectedAppointment.status?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-5xl font-black italic tracking-tighter">Diagnostic <span className="text-indigo-400 font-serif">Deep Dive</span></h3>
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                <div className="space-y-3 p-8 rounded-[2rem] bg-white/5 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Specialist Asset</div>
                  <div className="text-xl font-bold">{doctorsByEmail.get(selectedAppointment.doctor_email)?.full_name || selectedAppointment.doctor_email}</div>
                  <div className="text-xs text-indigo-400 font-bold">{selectedAppointment.department}</div>
                </div>
                <div className="space-y-3 p-8 rounded-[2rem] bg-white/5 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Temporal Alignment</div>
                  <div className="text-xl font-mono font-bold">{selectedAppointment.scheduled_time}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Standard Time</div>
                </div>
                <div className="space-y-3 p-8 rounded-[2rem] bg-white/5 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Facility Check-in</div>
                  <div className="text-xl font-bold">{formatEpochSeconds(selectedAppointment.check_in_time)}</div>
                  <div className="text-xs text-emerald-400 font-black uppercase tracking-[0.2em]">Verified Secure</div>
                </div>
              </div>

              {selectedAppointment.status === 'rejected' && (
                <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Rejection Payload</div>
                  <p className="text-slate-300 font-medium italic">{selectedAppointment.rejection_reason || 'Denied by policy override.'}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 min-w-[240px]">
              <button
                onClick={checkIn}
                disabled={selectedAppointment.status !== 'confirmed' || selectedAppointment.check_in_time}
                className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-30"
              >
                {selectedAppointment.check_in_time ? 'Arrival Verified' : 'Initiate Check-in'}
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (selectedAppointment.status !== 'pending') return;
                    setEditingAppointmentId(selectedAppointment.appointment_id);
                    setDepartment(selectedAppointment.department || '');
                    setDoctorEmail(selectedAppointment.doctor_email || '');
                    setScheduledTime(selectedAppointment.scheduled_time || '');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
                  disabled={selectedAppointment.status !== 'pending'}
                >
                  Refactor
                </button>
                <button
                  onClick={cancelSelected}
                  className="py-5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                  disabled={selectedAppointment.status !== 'pending' && selectedAppointment.status !== 'approved'}
                >
                  Abort
                </button>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >Close Encounter Panel</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
