import React, { useEffect, useState } from 'react';
import API_BASE_URL from './apiConfig';

export default function DoctorProfile() {
  const [token] = useState(localStorage.getItem('doctor_token') || '');
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [department, setDepartment] = useState('');
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
        const res = await fetch(`${API_BASE_URL}/doctor/me`, {
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
        setLicenseId(data.license_id || '');
        setDepartment(data.department || '');
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
      const res = await fetch(`${API_BASE_URL}/doctor/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: fullName,
          license_id: licenseId,
          department,
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
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-5xl grayscale opacity-30">👨‍⚕️</div>
        <h2 className="text-4xl font-black text-slate-900 italic">Credential <span className="text-rose-500">Required</span></h2>
        <p className="text-slate-500 font-medium">Please authenticate within the Specialist Network Terminal to manage your clinical profile.</p>
        <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 italic transition-all hover:bg-emerald-600">Initialize Authentication</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <section className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-slate-50 overflow-hidden animate-fade-in">
        <div className="bg-slate-900 p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-indigo-500/10 blur-[80px]"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-xs font-black tracking-[0.3em] uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Specialist Identity Node
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">Clinical <span className="text-emerald-400 font-serif">Credentials</span></h2>
              <p className="text-slate-400 font-medium max-w-sm">Manage your professional licensure and clinical domain settings.</p>
            </div>
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-5xl">👨‍⚕️</div>
          </div>
        </div>

        <div className="p-12 md:p-16 space-y-12">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse italic">Verifying Credentials...</p>
            </div>
          )}
          {error && (
            <div className="p-8 bg-rose-50 border border-rose-100 text-rose-600 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] animate-shake text-center shadow-lg shadow-rose-900/5 italic">
              Credentialing Matrix Error: {error}
            </div>
          )}
          {status && (
            <div className="p-8 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] text-center shadow-lg shadow-emerald-900/5 italic animate-fade-in">
              System Update: {status}
            </div>
          )}

          {profile && (
            <form onSubmit={submit} className="grid gap-12">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">Network ID (@)</label>
                  <input
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border border-slate-100 font-bold text-slate-400 transition-all outline-none cursor-not-allowed italic"
                    value={profile.email || ''}
                    disabled
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">Full Legal Name</label>
                  <input
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-bold text-slate-800 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">Global License ID</label>
                  <input
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-bold text-slate-800 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none tracking-widest"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">Clinical vertical</label>
                  <input
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-bold text-slate-800 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-10 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-14 py-7 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-[0_25px_50px_rgba(0,0,0,0.1)] active:scale-95 italic disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Syncing...
                    </span>
                  ) : 'Sync Specialist Node'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
