import React, { useState } from 'react';
import { theme } from './theme';
import API_BASE_URL from './apiConfig';

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

export default function UnifiedLogin({ onPatientLoggedIn, onDoctorLoggedIn, onAdminLoggedIn, onAdminEntry, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [needs2fa, setNeeds2fa] = useState(false);
  const [pendingCreds, setPendingCreds] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ... (keeping search/login logic the same) ...

  // Removed tryDoctorLogin as it's now unified into auth/login

  const submitCredentials = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setNeeds2fa(false);
    setPendingCreds({ email: '', password: '' });

    const emailValue = email.trim();
    const passwordValue = password;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });
      const text = await res.text();
      const data = parseJsonSafe(text);

      if (res.ok) {
        if (data.requires_2fa) {
          setNeeds2fa(true);
          setPendingCreds({ email: emailValue, password: passwordValue });
          setOtp('');
          return;
        }
        
        const role = data.role?.toLowerCase();
        if (role === 'admin') {
          localStorage.setItem('admin_token', data.token);
          if (onAdminLoggedIn) onAdminLoggedIn();
        } else if (role === 'doctor') {
          localStorage.setItem('doctor_token', data.token);
          if (onDoctorLoggedIn) onDoctorLoggedIn();
        } else {
          localStorage.setItem('patient_token', data.token);
          if (onPatientLoggedIn) onPatientLoggedIn();
        }
        return;
      }
      throw new Error(data.detail || 'Access Denied');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // ... existing logic ...
    if (!pendingCreds.email || !pendingCreds.password) {
      setError('Session expired. Please log in again.');
      setNeeds2fa(false);
      setOtp('');
      setPendingCreds({ email: '', password: '' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
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
      const data = parseJsonSafe(text);
      if (!res.ok) {
        throw new Error(data.detail || data.__raw || res.statusText || 'Invalid 2FA code');
      }
      if (!data.token) {
        throw new Error('Login failed: token not returned');
      }
      localStorage.setItem('patient_token', data.token);
      setNeeds2fa(false);
      setPendingCreds({ email: '', password: '' });
      setOtp('');
      if (onPatientLoggedIn) onPatientLoggedIn();
    } catch (err) {
      setError(err.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-20 px-8 animate-fade-in">
      <div className={theme.card}>
        {/* Decorative background in card */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -translate-y-20 translate-x-20 pointer-events-none blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-50/50 rounded-full translate-y-16 -translate-x-16 pointer-events-none blur-2xl"></div>

        <div className="relative">
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-200 group hover:rotate-6 transition-transform">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className={theme.h2}>Matrix <span className="text-indigo-600 font-serif">Entry</span></h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm mx-auto">
              Secure authentication gateway for patients and medical vanguards.
            </p>
          </div>

          <div className="mt-16">
            {!needs2fa ? (
              <form onSubmit={submitCredentials} className="space-y-8">
                <div className="space-y-3">
                  <label className={theme.label}>Email</label>
                  <input
                    type="email"
                    className={theme.input}
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className={theme.label}>Password</label>
                  <input
                    type="password"
                    className={theme.input}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className={theme.btnPrimary} disabled={loading}>
                  {loading ? 'Authenticating...' : 'Initialize Handshake'}
                </button>
              </form>
            ) : (
              <form onSubmit={submitOtp} className="space-y-10 animate-fade-in">
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-emerald-500/5">
                  <div className="text-3xl">🔑</div>
                  <p className="text-sm text-emerald-800 font-black italic tracking-tight leading-relaxed">
                    2FA ACTIVE. Enter the synchronization code from your biological security app.
                  </p>
                </div>

                <div className="space-y-4 text-center">
                  <label className={theme.label}>Auth Stream</label>
                  <input
                    type="text"
                    className={`${theme.input} text-center text-5xl tracking-[0.8em] font-black text-emerald-600`}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>

                <div className="flex flex-col gap-6">
                  <button type="submit" className={theme.btnPrimary} disabled={loading}>
                    {loading ? 'Verifying Link...' : 'Confirm Synchronization'}
                  </button>
                  <button
                    type="button"
                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-600 transition-colors"
                    onClick={() => {
                      setNeeds2fa(false);
                      setOtp('');
                      setPendingCreds({ email: '', password: '' });
                    }}
                  >
                    Abort Authentication
                  </button>
                </div>
              </form>
            )}
          </div>

          {error && (
            <div className="mt-12 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest animate-shake text-center shadow-lg shadow-rose-900/5 italic">
              Error: {error}
            </div>
          )}

          <div className="mt-16 text-center">
            <button
              onClick={onBack}
              className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-all inline-flex items-center gap-4 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Terminal
            </button>
          </div>

          <div className="mt-6 text-center border-t border-slate-50 pt-6">
            <button
              onClick={onAdminEntry}
              className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-600 transition-all flex items-center justify-center gap-2 mx-auto italic"
            >
              <span className="opacity-50 group-hover:opacity-100">🔒 Authority Override</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
