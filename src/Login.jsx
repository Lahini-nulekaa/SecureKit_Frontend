import React, { useState } from 'react';

export default function Login({ onLogin, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Enter the admin password');
      return;
    }
    setError(null);
    onLogin(password);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-[3rem] shadow-2xl p-12 md:p-16 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-4 mb-10">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-xl">
          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-4xl font-black tracking-tight italic">Authority <span className="text-indigo-400">Override</span></h2>
        <p className="text-slate-400 text-sm">Enter administrative credentials to bypass standard protocols.</p>
      </div>

      <form onSubmit={submit} className="relative z-10 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Access Protocol Key</label>
          <input
            className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none transition-all font-black tracking-[0.4em] text-center text-xl text-indigo-300 placeholder:text-slate-700"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/10 hover:bg-indigo-700 transition-all active:scale-95" type="submit">
            Initialize Access
          </button>
          <button className="w-full py-5 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all" type="button" onClick={onCancel}>
            Abort Sequence
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}
      </form>

      <div className="relative z-10 mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest leading-relaxed">
          Unauthorized access to this terminal is strictly monitored. <br />
          Global development key: <strong className="text-indigo-900 bg-indigo-400/10 px-2 py-0.5 rounded ml-1">admin123</strong>
        </p>
      </div>
    </div>
  );
}
