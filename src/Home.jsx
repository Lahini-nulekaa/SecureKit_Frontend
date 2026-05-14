import React from 'react';

function InfoCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-50 card-hover animate-fade-in group">
      <div className="flex flex-col gap-6">
        <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all">
          <span aria-hidden="true">{icon}</span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight italic">{title}</h3>
          <p className="text-slate-500 leading-relaxed font-medium">{children}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home({ onNavigate, isAdmin, isLoggedIn }) {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[800px] flex items-center overflow-hidden bg-slate-900 rounded-[4rem] shadow-2xl text-white mx-2 md:mx-0">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky-600/20 blur-[120px] rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        <div className="relative w-full p-8 md:p-16 lg:p-24 grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-fade-in space-y-10" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-black tracking-[0.2em] uppercase">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Orchestrating the Future of Care
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] italic">
              Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">Architected</span>
            </h2>
            <p className="text-slate-400 text-2xl md:text-3xl leading-relaxed max-w-xl font-medium">
              A high-fidelity clinical ecosystem designed to unify specialists and patients via impenetrable digital architectures.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('appointments')}
                className="px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95"
              >
                Sync with Specialist
              </button>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur active:scale-95"
              >
                Login to the Portal
              </button>
            </div>
          </div>

          <div className="relative justify-self-center lg:justify-self-end w-full max-w-2xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative p-3 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-[4rem] border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl"></div>
              <div className="relative bg-slate-900 rounded-[3.5rem] p-8 md:p-12 border border-white/5 shadow-inner overflow-hidden">
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="px-5 py-2 rounded-2xl bg-white/5 text-xs font-black uppercase tracking-widest text-slate-400 border border-white/5">Clinical_Matrix_V4</div>
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-40 bg-white/5 rounded-3xl border border-white/5 p-6 space-y-4">
                      <div className="h-2 w-12 bg-indigo-500/50 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-1.5 w-full bg-white/10 rounded-full"></div>
                        <div className="h-1.5 w-3/4 bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-40 bg-white/5 rounded-3xl border border-white/5 p-6 flex flex-col justify-end">
                      <div className="text-4xl font-black italic text-sky-400">98%</div>
                      <div className="text-xs font-black uppercase tracking-widest text-slate-500">Sync_Accuracy</div>
                    </div>
                  </div>
                  <div className="h-32 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 p-8 flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-black uppercase tracking-widest text-indigo-400">Active Transmission</div>
                      <div className="text-xl font-bold">Biometric Stream...</div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div key={v} className="w-1.5 h-8 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${v * 0.1}s` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Premium Badge */}
            <div className="absolute -bottom-10 right-10 flex gap-4 animate-float">
              <div className="bg-white text-slate-900 rounded-[2rem] p-6 shadow-2xl flex items-center gap-5 border border-slate-100">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-200">💎</div>
                <div>
                  <div className="text-lg font-black italic leading-none">Elite Tier</div>
                  <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Security Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-black tracking-[0.3em] uppercase">
            Capabilities Registry
          </div>
          <h3 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic leading-none">
            High Fidelity <span className="text-indigo-600">Infrastructure</span>
          </h3>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            We deliver specialized protocols for every facet of the clinical journey, ensuring absolute continuity and precise diagnostics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <InfoCard icon="🦾" title="Patient Matrix">
            Integrated identity management systems that synchronize clinical history with zero-latency accessibility.
          </InfoCard>
          <InfoCard icon="🛰️" title="Temporal Engine">
            Advanced scheduling architectures that orchestrate specialist encounters with algorithmic precision.
          </InfoCard>
          <InfoCard icon="🧬" title="Genetic Integrity">
            Digital-first health records that preserve the absolute truth of patient data across global clinical borders.
          </InfoCard>
        </div>
      </section>

      {/* Roles Section */}
      {!isLoggedIn && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-indigo-600 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-white/5 skew-x-[-20deg] transform translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 blur-3xl opacity-50"></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">Ecosystem Access</div>
                <h3 className="text-5xl md:text-6xl font-black leading-[0.9] italic tracking-tight">Tailored <span className="text-sky-300 font-serif">Trajectories</span></h3>
                <p className="text-indigo-100 text-xl font-medium leading-relaxed max-w-lg">
                  SecureKit provides dedicated terminal interfaces for every role within the medical continuum.
                </p>
                <div className="flex flex-wrap gap-5 pt-6">
                  <button onClick={() => onNavigate('login')} className="px-10 py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95">Enter Terminal</button>
                  <button onClick={() => onNavigate('register')} className="px-10 py-5 bg-indigo-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest border border-white/20 hover:bg-indigo-400 transition-all active:scale-95">Initialize Identity</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 hover:bg-white/20 transition-all group">
                  <div className="text-5xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">🩺</div>
                  <h4 className="text-2xl font-black mb-3 italic">Clinical Elite</h4>
                  <p className="text-indigo-100 text-sm leading-relaxed font-medium">Command visit flows, generate encrypted prescriptions, and monitor vitals.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 hover:bg-white/20 transition-all group">
                  <div className="text-5xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">👤</div>
                  <h4 className="text-2xl font-black mb-3 italic">Health Citizens</h4>
                  <p className="text-indigo-100 text-base leading-relaxed font-medium">Own your biological legacy and connect with top-tier specialists instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[4rem] p-16 md:p-24 grid md:grid-cols-3 gap-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-sky-500/10 pointer-events-none"></div>
          <div className="space-y-4 relative z-10">
            <div className="text-6xl md:text-8xl font-black text-white italic tracking-tighter">500<span className="text-indigo-400">+</span></div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Verified Health Citizens</div>
          </div>
          <div className="space-y-4 border-white/5 md:border-x px-12 relative z-10">
            <div className="text-6xl md:text-8xl font-black text-white italic tracking-tighter">50<span className="text-sky-400">+</span></div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Elite Clinical Assets</div>
          </div>
          <div className="space-y-4 relative z-10">
            <div className="text-6xl md:text-8xl font-black text-white italic tracking-tighter">24<span className="text-emerald-400">/</span>7</div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Operational Continuity</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-12 animate-fade-in">
        <h4 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic leading-[0.9]">The future is <span className="text-indigo-600 underline decoration-sky-400 underline-offset-8">Secure.</span></h4>
        <p className="text-lg text-slate-500 font-medium leading-relaxed">Join the global movement towards a unified, secure, and intelligent healthcare architecture.</p>
        <button onClick={() => onNavigate('register')} className="px-16 py-6 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">Initiate Onboarding</button>
      </section>
    </div>
  );
}
