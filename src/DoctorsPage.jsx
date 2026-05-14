import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from './apiConfig';

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

export default function DoctorsPage({ onNavigate }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  const departments = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const d of doctors) {
      const dep = (d?.department || '').trim() || 'General Medicine';
      if (seen.has(dep)) continue;
      seen.add(dep);
      out.push(dep);
    }
    out.sort((a, b) => a.localeCompare(b));
    return out;
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((d) => {
      if (!d) return false;
      const dep = (d.department || 'General Medicine').toLowerCase();
      const name = (d.full_name || '').toLowerCase();
      const email = (d.email || '').toLowerCase();
      if (department && dep !== department.toLowerCase()) return false;
      if (!q) return true;
      return name.includes(q) || email.includes(q) || dep.includes(q);
    });
  }, [doctors, search, department]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/patient/doctors`, { credentials: "include" });
      const json = parseJsonSafe(await res.text());
      if (!res.ok) throw new Error(json.detail || json.__raw || res.statusText);
      const rows = Array.isArray(json.data) ? json.data : [];
      setDoctors(rows);
      setStatus(`Loaded ${rows.length} doctor(s).`);
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const selectDoctorForAppointment = (d) => {
    try {
      const payload = {
        email: d?.email || '',
        full_name: d?.full_name || d?.email || '',
        department: d?.department || 'General Medicine',
        selected_at: Date.now()
      };
      localStorage.setItem('appointment_draft_doctor', JSON.stringify(payload));
    } catch {
      // ignore localStorage errors
    }
    if (typeof onNavigate === 'function') onNavigate('appointments');
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Section */}
      <section className="bg-slate-900 text-white rounded-[3rem] shadow-2xl p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-8 animate-fade-in mx-2 md:mx-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/10 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-sky-500/10 blur-[100px]"></div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-black tracking-[0.3em] uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Specialist Network Live
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter italic">Clinical <span className="text-indigo-400 font-serif">Vanguards</span></h2>
          <p className="text-slate-400 font-medium max-w-xl text-lg">
            Authenticated medical professionals within the SecureKit ecosystem. Filter by vertical to find your specialist.
          </p>
        </div>

        <div className="relative z-10">
          <button
            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 transition-all shadow-xl active:scale-95 italic disabled:opacity-50"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Syncing...
              </span>
            ) : 'Refresh Registry'}
          </button>
        </div>
      </section>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest animate-shake text-center shadow-lg shadow-rose-900/5 italic">
          Network Protocol Error: {error}
        </div>
      )}
      {status && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest text-center shadow-lg shadow-emerald-900/5 italic animate-fade-in">
          System Update: {status}
        </div>
      )}

      {/* Control Panel & Results */}
      <div className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-slate-50 p-10 md:p-16 space-y-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">Registry Scan (Query)</label>
            <div className="relative">
              <input
                className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Scan by name, bio-id, or vertical..."
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">Domain Filter</label>
            <select
              className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-black text-sm uppercase tracking-widest text-slate-700 italic focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="" className="font-sans not-italic">All Verticals</option>
              {departments.map((d) => (
                <option key={d} value={d} className="font-sans not-italic">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50 pb-6 flex items-center justify-between">
          <span>Scan Results: {filteredDoctors.length} Specialists Identified</span>
          <span>Matrix Range: {doctors.length} Total</span>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {filteredDoctors.map((d) => (
            <div key={d.email} className="group bg-slate-50/50 rounded-[3rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:bg-white transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

              <div className="flex items-start justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-4xl shadow-sm group-hover:rotate-6 transition-transform">🎓</div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-slate-900 italic tracking-tight">{d.full_name || d.email}</div>
                    <div className="text-sm font-black text-indigo-500 uppercase tracking-widest">{d.department || 'General Medicine'}</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-300 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-50">{d.license_id ? `LIC: ${d.license_id}` : 'UNVERIFIED'}</div>
              </div>

              <div className="mt-8 text-base font-bold text-slate-500 break-all bg-white/50 p-4 rounded-2xl border border-slate-50 group-hover:border-indigo-50 transition-colors italic relative z-10">{d.email}</div>

              <div className="mt-8 flex justify-end relative z-10">
                <button
                  type="button"
                  className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 italic"
                  onClick={() => selectDoctorForAppointment(d)}
                >
                  Initiate Link
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredDoctors.length === 0 && (
          <div className="py-24 text-center space-y-6 animate-fade-in">
            <div className="text-6xl grayscale opacity-20">📡</div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-slate-900 italic">No Specialists Detected</p>
              <p className="text-slate-400 font-medium">Try broadening your domain filter or query parameters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
