import React, { useState } from 'react';
import API_BASE_URL from './apiConfig';

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

export default function DoctorRegister({ onBack, onSuccess }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const DEPARTMENTS = [
    'General Medicine',
    'Pediatrics',
    'Cardiology',
    'Orthopedics',
    'Gynecology',
    'Dermatology'
  ];

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const form = new FormData(e.target);
    const full_name = form.get('full_name');
    const license_id = form.get('license_id');
    const department = form.get('department');
    const email = form.get('email');
    const password = form.get('password');
    const confirm_password = form.get('confirm_password');

    if (password !== confirm_password) {
      setStatus('Error: Passwords do not match');
      setLoading(false);
      return;
    }

    // Client-side password strength check (matches backend expectation)
    const pw = password || '';
    const strongEnough = pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
    if (!strongEnough) {
      setStatus('Password too weak — require >=8 chars, mix of upper/lower/number/symbol');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/doctor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ full_name, license_id, department, email, password })
      });

      const text = await res.text();
      const data = parseJsonSafe(text);
      if (!res.ok) {
        setStatus('Error: ' + (data.detail || data.message || data.__raw || res.statusText));
        return;
      }

      setStatus('Application submitted. Waiting for admin approval.');
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setStatus('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Clinical Candidate Entry
          </div>
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">Specialist <span className="text-emerald-600 font-serif">Credentialing</span></h2>
          <p className="text-slate-500 font-medium leading-relaxed">Submit your credentials for verification by the global administrative council.</p>
        </div>
        <button className="self-start md:self-auto px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95" onClick={onBack} type="button">
          Abort Request
        </button>
      </div>

      <form onSubmit={submit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Legal Full Name</label>
            <input name="full_name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" placeholder="Dr. John Smith" required />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Medical License ID</label>
            <input name="license_id" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-slate-800 placeholder:text-slate-300" placeholder="MD-9988-7766" required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Primary Discipline</label>
            <select name="department" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-800" defaultValue="General Medicine">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Official Network Email</label>
            <input name="email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" type="email" placeholder="smith.md@hospital.com" required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Registry Access Key (Password)</label>
            <input name="password" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" type="password" placeholder="••••••••••••" required />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">Min 8 chars, mixed case, numbers & symbols required.</p>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Confirm Access Key</label>
            <input name="confirm_password" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" type="password" placeholder="••••••••••••" required />
          </div>
        </div>

        <div className="pt-6">
          <button className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-4">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Application...
              </span>
            ) : 'Submit Specialist Application'}
          </button>
        </div>

        {status && (
          <div className={`p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center animate-fade-in ${status.includes('Error') || status.includes('weak') ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
            }`}>
            {status}
          </div>
        )}
      </form>

      <div className="pt-10 border-t border-slate-50 text-center">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
          By submitting this application, you declare the absolute integrity of your clinical data and agree to the SecureKit Global Governance framework.
        </p>
      </div>
    </div>
  );
}
