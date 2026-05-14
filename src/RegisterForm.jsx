import React, { useState } from 'react';
import API_BASE_URL from './apiConfig';

export default function RegisterForm() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', age: '', medical_history: '' });
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [otp, setOtp] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    // Client-side password strength check
    const pw = form.password || '';
    if (pw !== form.confirm_password) {
      setStatus('Error: Passwords do not match');
      return;
    }
    const strongEnough = pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
    if (!strongEnough) {
      setStatus('Password too weak — require >=8 chars, mix of upper/lower/number/symbol');
      return;
    }

    try {
      // Use relative path so CRA dev server can proxy to backend (see package.json "proxy")
      const res = await fetch(`${API_BASE_URL}/patient/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          age: Number(form.age),
          medical_history: form.medical_history || 'None'
        })
      });

      // Try to parse JSON; if not JSON, fall back to plain text so proxy errors are readable
      let dataText = await res.text();
      let data = null;
      try {
        data = JSON.parse(dataText);
      } catch (parseErr) {
        data = { __raw: dataText };
      }

      if (res.ok) {
        // If backend returned a QR code, show it so user can scan and finish 2FA setup
        if (data.qr_code) {
          setQrCode(data.qr_code);
          setStatus('Scan the QR with an authenticator app and enter the 6-digit code below');
        } else {
          setStatus(`Success: ${data.email || data.email || ''}`);
          setForm({ full_name: '', email: '', password: '', confirm_password: '', age: '', medical_history: '' });
        }
      } else {
        const msg = data.detail || data.message || data.__raw || res.statusText;
        setStatus(`Error: ${msg}`);
      }
    } catch (err) {
      console.error('Registration error', err);
      setStatus(`Network error: ${err.message || err}`);
    }
  };

  const handleVerifyOtp = async () => {
    setStatus('Verifying 2FA code...');
    try {
      const res = await fetch(`${API_BASE_URL}/patient/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ email: form.email, code: otp })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('2FA setup complete — registration finished');
        setQrCode(null);
        setForm({ full_name: '', email: '', password: '', confirm_password: '', age: '', medical_history: '' });
        setOtp('');
        // optionally store token for session: localStorage.setItem('token', data.token)
      } else {
        setStatus(`Error verifying code: ${data.detail || data.message || res.statusText}`);
      }
    } catch (err) {
      setStatus(`Network error: ${err.message || err}`);
    }
  };

  if (qrCode) {
    return (
      <div className="space-y-10 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-100">🛡️</div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Security <span className="text-emerald-600">Protocol</span></h3>
          <p className="text-slate-500 font-medium">Synchronize your biometric terminal with our global authentication grid.</p>
        </div>

        <div className="flex flex-col items-center gap-8 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
          <div className="p-4 bg-white rounded-3xl shadow-xl shadow-slate-200 group">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-2xl group-hover:scale-105 transition-transform" />
          </div>

          <div className="w-full space-y-4 text-center">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Access Synchronization Token</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-8 py-5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all font-mono font-black text-center text-3xl tracking-[0.5em] text-indigo-600 placeholder:text-slate-200"
              />
            </div>

            <button type="button" onClick={handleVerifyOtp} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95">
              Verify & Finalize Identity
            </button>

            {status && <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">{status}</div>}
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-10">
          Scanning the QR code establishes a direct encrypted link between your authenticator app and SecureKit core.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Citizen Full Name</label>
          <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" name="full_name" placeholder="John Doe" value={form.full_name} onChange={handleChange} required />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Network Identity (@)</label>
          <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Password Architecture</label>
          <div className="relative">
            <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" name="password" type="password" placeholder="••••••••••••" value={form.password} onChange={handleChange} required />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-3 h-1 rounded-full ${form.password.length >= i * 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">Required: Min 8 chars, Upper, Lower, Numeric, Symbol</p>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Confirm Identity Key</label>
          <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" name="confirm_password" type="password" placeholder="••••••••••••" value={form.confirm_password} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Biological Epoch (Age)</label>
          <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800" name="age" type="number" placeholder="25" value={form.age} onChange={handleChange} required />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Clinical Legacy</label>
          <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" name="medical_history" placeholder="Prior conditions..." value={form.medical_history} onChange={handleChange} />
        </div>
      </div>

      <div className="pt-6">
        <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.01] active:scale-95" type="submit">
          Initialize Patient Matrix
        </button>

        {status && (
          <div className={`mt-6 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-fade-in ${status.includes('Error') || status.includes('weak') ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'
            }`}>
            {status}
          </div>
        )}
      </div>
    </form>
  );
}
