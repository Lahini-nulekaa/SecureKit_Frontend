import React from 'react';

function NavButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-8 py-3 rounded-2xl text-base font-bold uppercase tracking-wider transition-all duration-500 ' +
        (active
          ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100'
          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50')
      }
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </button>
  );
}

export default function Navbar({ currentView, onNavigate, isAdmin, isPatientLoggedIn, isDoctorLoggedIn, elderMode, setElderMode }) {
  const isLoggedIn = isAdmin || isPatientLoggedIn || isDoctorLoggedIn;

  const goToDashboard = () => {
    if (isAdmin) {
      onNavigate('admin');
    } else if (isDoctorLoggedIn) {
      onNavigate('doctor');
    } else if (isPatientLoggedIn) {
      onNavigate('patient');
    } else {
      onNavigate('login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between gap-4 py-4 flex-wrap lg:flex-nowrap">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-6 group transition-all"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 flex items-center justify-center font-bold text-white shadow-2xl group-hover:bg-indigo-600 group-hover:rotate-12 transition-all duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Clinical Protocol</div>
              <div className="text-3xl font-black text-slate-900 leading-none tracking-tighter">Secure<span className="text-indigo-600 font-serif">Kit</span></div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-[2rem] border border-slate-100">
            <NavButton label="Home" active={currentView === 'home'} onClick={() => onNavigate('home')} />
            <NavButton label="Services" active={currentView === 'services'} onClick={() => onNavigate('services')} />
            <NavButton label="Doctors" active={currentView === 'doctors'} onClick={() => onNavigate('doctors')} />
            <NavButton label="About Us" active={currentView === 'about'} onClick={() => onNavigate('about')} />
            <NavButton label="Contact" active={currentView === 'contact'} onClick={() => onNavigate('contact')} />
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setElderMode(!elderMode)}
              className={
                'flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ' +
                (elderMode
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100')
              }
            >
              <span className="text-lg">{elderMode ? '👵' : '👴'}</span>
              <span>Elder View</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${elderMode ? 'bg-amber-400' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${elderMode ? 'left-[1.125rem]' : 'left-0.5'}`}></div>
              </div>
            </button>

            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="w-12 h-12 rounded-[1rem] bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 transition-all border border-slate-100 hover:shadow-xl group"
                  title="Citizen Profile"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="px-8 py-4 rounded-[1.25rem] text-base font-bold uppercase tracking-wide bg-slate-900 text-white hover:bg-indigo-600 transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-8 py-4 rounded-[1.25rem] text-base font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-10 py-4 rounded-[1.25rem] text-base font-bold uppercase tracking-wide bg-indigo-600 text-white hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
