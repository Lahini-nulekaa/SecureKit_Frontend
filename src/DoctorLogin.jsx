import React, { useState } from 'react';
import API_BASE_URL from './apiConfig';

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

export default function DoctorLogin({ onBack, onSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.target);
    const email = form.get('email');
    const password = form.get('password');

    try {
      const res = await fetch(`${API_BASE_URL}/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      const data = parseJsonSafe(text);
      if (!res.ok) {
        const msg = data.detail || data.__raw || res.statusText;
        if (String(msg).toLowerCase().includes('pending') && String(msg).toLowerCase().includes('approval')) {
          setError('Your account is pending admin approval. Please wait for approval before logging in.');
        } else {
          setError(msg);
        }
        return;
      }

      localStorage.setItem('doctor_token', data.token);
      if (onSuccess) onSuccess();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Doctor Login</h2>
        <button className="px-3 py-2 bg-slate-100 rounded-md" onClick={onBack} type="button">Back</button>
      </div>

      <p className="mt-1 text-sm text-slate-600">Sign in to access the doctor dashboard.</p>

      <form onSubmit={submit} className="mt-4 grid gap-3">
        <input name="email" className="px-3 py-2 rounded-md border border-slate-200" type="email" placeholder="Doctor email" required />
        <input name="password" className="px-3 py-2 rounded-md border border-slate-200" type="password" placeholder="Password" required />
        <button className="px-3 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      {error && <div className="mt-3 text-red-700 bg-red-50 border border-red-100 p-3 rounded-md">{error}</div>}
    </div>
  );
}
