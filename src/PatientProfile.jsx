import React, { useEffect, useState } from 'react';
import API_BASE_URL from './apiConfig';

export default function PatientProfile() {
  const [token] = useState(localStorage.getItem('patient_token') || '');
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      setStatus(null);
      try {
        const res = await fetch(`${API_BASE_URL}/patient/me`, {
          headers: { Authorization: 'Bearer ' + token },
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
          return;
        }
        setProfile(data);
        setFullName(data.full_name || '');
        setAge(data.age != null ? String(data.age) : '');
        setMedicalHistory(data.medical_history || '');
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/patient/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: fullName,
          age: age ? Number(age) : null,
          medical_history: medicalHistory,
        }),
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
        return;
      }
      setProfile(data);
      setStatus('Profile updated successfully.');
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-16 text-center space-y-8 animate-fade-in mt-12">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-5xl grayscale opacity-30">👤</div>
        <h2 className="text-4xl font-black text-slate-900 italic">Identity <span className="text-rose-500">Unverified</span></h2>
        <p className="text-slate-500 font-medium">Please authenticate within the Citizen Health Console to manage your biometric profile.</p>
        <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 italic transition-all hover:bg-indigo-600">Initialize Authentication</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <section className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-slate-50 overflow-hidden animate-fade-in">
        <div className="bg-slate-900 p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/10 blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-sky-500/10 blur-[80px]"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-black tracking-[0.3em] uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Secure Identity Node
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">Patient <span className="text-indigo-400 font-serif">Core</span></h2>
              <p className="text-slate-400 font-medium max-w-sm">Manage your personal health architecture and biometric records.</p>
            </div>
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-5xl">👤</div>
          </div>
        </div>

        <div className="p-12 md:p-16 space-y-10">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse italic">Decrypting Bio-Profile...</p>
            </div>
          )}
          {error && (
            <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] animate-shake text-center shadow-lg shadow-rose-900/5 italic">
              Access Matrix Error: {error}
            </div>
          )}
          {status && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-lg shadow-emerald-900/5 italic animate-fade-in">
              System Response: {status}
            </div>
          )}

          {profile && (
            <form onSubmit={submit} className="grid gap-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Network ID (@)</label>
                  <input
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-bold text-slate-400 transition-all outline-none cursor-not-allowed"
                    value={profile.email || ''}
                    disabled
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Legal Designation</label>
                  <input
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-white border border-slate-100 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                    value={fullName}
                    placeholder="Enter full name"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Temporal Chronological Age</label>
                <input
                  className="w-full px-8 py-5 rounded-[2.5rem] bg-white border border-slate-100 font-bold text-slate-800 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                  type="number"
                  min="0"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Biological History (EMR Payload)</label>
                <textarea
                  className="w-full min-h-[200px] px-8 py-6 rounded-[3rem] bg-white border border-slate-100 font-bold text-slate-800 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none italic leading-relaxed"
                  value={medicalHistory}
                  placeholder="Record relevant clinical history..."
                  onChange={(e) => setMedicalHistory(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-6 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 italic disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Syncing...
                    </span>
                  ) : 'Commit Identity Update'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
