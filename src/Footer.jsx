import React from 'react';

function FooterLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left text-sm font-bold text-slate-500 hover:text-indigo-400 transition-all duration-300 uppercase tracking-widest text-[10px]"
    >
      {label}
    </button>
  );
}

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-slate-900 text-white rounded-t-[4rem] overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-8 pt-24 pb-12">
        <div className="grid gap-20 md:grid-cols-5 items-start">
          <div className="md:col-span-2 space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center font-bold text-white shadow-2xl shadow-indigo-500/20 group hover:rotate-6 transition-transform">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tighter italic">Secure<span className="text-indigo-400 font-serif">Kit</span></div>
                <div className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase">Global Governance</div>
              </div>
            </div>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
              Empowering healthcare vanguards with ultra-secure management architectures. The gold standard in clinical synchronization.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-indigo-600 hover:scale-110 transition-all cursor-pointer group">
                  <div className="w-5 h-5 bg-slate-500 group-hover:bg-white rounded-md transition-colors"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Navigation</h4>
            <div className="flex flex-col gap-5">
              <FooterLink label="Home" onClick={() => onNavigate('home')} />
              <FooterLink label="Services" onClick={() => onNavigate('services')} />
              <FooterLink label="Doctors" onClick={() => onNavigate('doctors')} />
              <FooterLink label="About Us" onClick={() => onNavigate('about')} />
              <FooterLink label="Contact" onClick={() => onNavigate('contact')} />
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Response Units</h4>
            <div className="grid gap-6">
              <div className="group cursor-pointer">
                <div className="text-[9px] text-slate-600 font-black tracking-[0.2em] mb-1 uppercase">Technical Ops</div>
                <div className="text-sm font-bold group-hover:text-indigo-400 transition-colors">ops@securekit.app</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-[9px] text-slate-600 font-black tracking-[0.2em] mb-1 uppercase">Emergency Signal</div>
                <div className="text-sm font-bold group-hover:text-sky-400 transition-colors">1-800-HEAL-SYS</div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Network Status</h4>
            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Core_Online</span>
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Systems fully operational across all global clusters.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          <div className="flex gap-10">
            <span className="hover:text-white cursor-pointer transition-colors">Integrity Protocols</span>
            <span className="hover:text-white cursor-pointer transition-colors">System Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Infrastructure Audit</span>
          </div>
          <div className="italic">
            © {year} SecureKit Global. Optimized for clinical excellence.
          </div>
        </div>
      </div>
    </footer>
  );
}
