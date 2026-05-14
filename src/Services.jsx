import React from 'react';

function ServiceCard({ icon, title, items }) {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-50 p-10 group hover:shadow-indigo-100 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -translate-y-12 translate-x-12 group-hover:bg-indigo-50 transition-colors"></div>
      <div className="flex flex-col gap-8 relative z-10">
        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center text-4xl group-hover:rotate-12 group-hover:bg-indigo-600 transition-all duration-500 shadow-xl">
          <span aria-hidden="true">{icon}</span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter italic">{title}</h3>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ children }) {
  return (
    <li className="flex items-center gap-5 group">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="font-black text-sm text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">{children}</span>
    </li>
  );
}

export default function Services({ onNavigate }) {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[4rem] shadow-2xl text-white mx-2 md:mx-0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-sky-600/10 blur-[150px]"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-full bg-indigo-600/20 blur-[120px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        <div className="relative p-16 md:p-32 grid lg:grid-cols-2 gap-24 items-center">
          <div className="animate-fade-in space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sky-300 text-xs font-black tracking-[0.4em] uppercase">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              Protocol Ecosystem
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-[0.9]">
              Clinical <br /><span className="text-sky-400 font-serif">Dimensions</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed max-w-lg font-medium">
              Architecting high-fidelity healthcare through a unified digital substratum designed for mission-critical care.
            </p>
            <div className="pt-4 flex flex-wrap gap-6">
              <button
                type="button"
                onClick={() => onNavigate('appointments')}
                className="px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest bg-white text-slate-900 hover:bg-sky-400 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 italic"
              >
                Enter Registry
              </button>
              <button
                type="button"
                onClick={() => onNavigate('doctors')}
                className="px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur active:scale-95"
              >
                Map Specialists
              </button>
            </div>
          </div>

          <div className="relative animate-fade-in hidden lg:block">
            <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-indigo-500/30 to-sky-500/20 p-12 border border-white/5 flex items-center justify-center relative group">
              <div className="absolute -inset-4 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-sky-500/10 transition-colors duration-1000"></div>
              <div className="w-full h-full rounded-[3rem] bg-slate-800/80 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-sky-500/10 to-transparent"></div>
                <svg viewBox="0 0 520 320" className="w-3/4 h-auto relative z-10 opacity-90 group-hover:scale-110 transition-transform duration-1000" role="img" aria-label="Healthcare illustration">
                  <rect x="100" y="60" width="320" height="200" rx="40" fill="#4f46e5" opacity="0.1" />
                  <circle cx="260" cy="160" r="100" fill="#0ea5e9" opacity="0.05" />
                  <path d="M160 160h200M260 60v200" stroke="#fff" strokeWidth="24" strokeLinecap="round" opacity="1" className="drop-shadow-2xl" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="max-w-7xl mx-auto px-8 space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="text-xs font-black text-indigo-500 uppercase tracking-[0.5em] leading-none mb-4">Service Verticals</div>
          <h3 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic">Clinical <span className="text-indigo-600">Architectures</span></h3>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">Engineered for absolute medical precision across the clinical spectrum.</p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            icon="🏥"
            title="Consulate Registry"
            items={[
              'Unified Identity Sync',
              'Encounter Orchestration',
              'Biometric Log Maintenance'
            ]}
          />
          <ServiceCard
            icon="📡"
            title="Temporal Hub"
            items={[
              'Autonomous Booking Matrix',
              'Real-time Specialist Pulse',
              'Intelligent Queue Flow'
            ]}
          />
          <ServiceCard
            icon="🧬"
            title="EMR Core"
            items={[
              'Cryo-grade Data Security',
              'Full Genomic Diagnostics',
              'Zero-knowledge Record Access'
            ]}
          />
          <ServiceCard
            icon="💊"
            title="Pharma Pipeline"
            items={[
              'Encrypted e-Prescriptions',
              'Molecular Interaction Logic',
              'Automated Refill Sync'
            ]}
          />
          <ServiceCard
            icon="🔬"
            title="Diagnostic Node"
            items={[
              'Integrated Lab Telemetry',
              'High-Resolution Telepathy',
              'Instant Payload Delivery'
            ]}
          />
          <ServiceCard
            icon="⚡"
            title="Financial Flux"
            items={[
              'Transparent Ledgering',
              'Automated Claim Routing',
              'One-tap Fiscal Clearing'
            ]}
          />
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="max-w-7xl mx-auto px-8">
        <div className="bg-slate-50 rounded-[5rem] overflow-hidden border border-slate-100 shadow-inner">
          <div className="p-16 md:p-24 grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">System Attributes</div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic italic leading-none">Substrate <br /><span className="text-indigo-600">Integrity</span></h3>
                <p className="text-xl text-slate-500 leading-relaxed font-medium">
                  The protocol is layered upon a distributed, failsafe architecture ensuring persistent clinical availability.
                </p>
              </div>
              <ul className="grid sm:grid-cols-2 gap-10">
                <CheckItem>2048-bit RSA Encryption</CheckItem>
                <CheckItem>Poly-Cloud Resilience</CheckItem>
                <CheckItem>RBAC Security Polling</CheckItem>
                <CheckItem>Immutable Audit Trails</CheckItem>
                <CheckItem>Micro-second Latency</CheckItem>
                <CheckItem>Universal API Reach</CheckItem>
              </ul>
            </div>

            <div className="relative">
              <div className="bg-slate-900 rounded-[4rem] p-12 md:p-16 text-white shadow-3xl relative overflow-hidden group border border-slate-800">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[100px]"></div>
                <h4 className="text-xs font-black tracking-[0.5em] uppercase text-indigo-400 mb-12">Telemetry Snapshot</h4>
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <div className="text-4xl font-black text-sky-400 italic">99.99<span className="text-sm font-sans not-italic">%</span></div>
                    <div className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">Matrix Uptime</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl font-black text-indigo-400 italic">0.8<span className="text-sm font-sans not-italic">ms</span></div>
                    <div className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">Sync Latency</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl font-black text-emerald-400 italic">Zero</div>
                    <div className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">Incursions</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-4xl font-black text-white italic">Level-4</div>
                    <div className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">Compliance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="max-w-7xl mx-auto px-8 space-y-16">
        <div className="text-center">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] mb-4">Vertical Map</div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">Deployed <span className="text-sky-500">Domains</span></h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {[
            { icon: '🩺', label: 'Biomedicine' },
            { icon: '👶', label: 'Pedigree' },
            { icon: '❤️', label: 'Cardio' },
            { icon: '🦴', label: 'Structural' },
            { icon: '🤰', label: 'Genetic' },
            { icon: '🧴', label: 'Dermal' }
          ].map((d) => (
            <div key={d.label} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 p-8 text-center hover:-translate-y-2 hover:shadow-indigo-50 transition-all duration-500 group">
              <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">{d.icon}</div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900">{d.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 pb-12">
        <div className="bg-slate-900 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden shadow-3xl border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="relative z-10 space-y-12">
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic text-white">
              Initialize your <span className="text-indigo-400">clinical node</span> today.
            </h3>
            <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium">
              Join the vanguard of medical professionals orchestrating health through SecureKit.
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              <button onClick={() => onNavigate('appointments')} className="px-12 py-7 bg-white text-slate-900 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-sky-400 transition-all active:scale-95 italic">Initialize Mission</button>
              <button onClick={() => onNavigate('register')} className="px-12 py-7 bg-white/5 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all active:scale-95 italic backdrop-blur">Secure Enrollment</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
