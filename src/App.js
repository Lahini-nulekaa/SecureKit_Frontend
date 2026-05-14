import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import Services from './Services';
import RegisterForm from './RegisterForm';
import AdminDashboard from './AdminDashboard';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import DoctorRegister from './DoctorRegister';
import Appointments from './Appointments';
import DoctorsPage from './DoctorsPage';
import UnifiedLogin from './UnifiedLogin';
import Login from './Login';
import PatientProfile from './PatientProfile';
import DoctorProfile from './DoctorProfile';

// Development-only admin password used for simple routing guard in the UI.
const ADMIN_PASSWORD = 'admin123';

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(false);
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false);
  const [elderMode, setElderMode] = useState(localStorage.getItem('securekit_elder_mode') === '1');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Inactivity timeout limits in milliseconds.
  const WARNING_LIMIT_MS = 14 * 60 * 1000;   // Warn at 14 minutes
  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // Kick at 15 minutes

  // Initialize auth state from localStorage on first load.
  useEffect(() => {
    const v = localStorage.getItem('securekit_is_admin');
    setIsAdmin(v === '1');
    setIsPatientLoggedIn(!!localStorage.getItem('patient_token'));
    setIsDoctorLoggedIn(!!localStorage.getItem('doctor_token'));
  }, []);

  // Sync elder mode class to body for global scaling overrides.
  useEffect(() => {
    if (elderMode) {
      document.body.classList.add('elder-mode');
      localStorage.setItem('securekit_elder_mode', '1');
    } else {
      document.body.classList.remove('elder-mode');
      localStorage.setItem('securekit_elder_mode', '0');
    }
  }, [elderMode]);

  // Global inactivity tracker: listen for user input events and
  // automatically clear any active session after a period of no activity.
  useEffect(() => {
    let timeoutId;
    let warningId;

    const logoutForInactivity = () => {
      const hasSession = isAdmin || isPatientLoggedIn || isDoctorLoggedIn;
      if (!hasSession) return;

      // Clear all known auth indicators.
      localStorage.removeItem('securekit_is_admin');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('patient_token');
      localStorage.removeItem('doctor_token');

      setIsAdmin(false);
      setIsPatientLoggedIn(false);
      setIsDoctorLoggedIn(false);
      setShowTimeoutWarning(false);
      setView('home');
    };

    const triggerWarning = () => {
      const hasSession = isAdmin || isPatientLoggedIn || isDoctorLoggedIn;
      if (hasSession) {
        setShowTimeoutWarning(true);
      }
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningId) clearTimeout(warningId);
      setShowTimeoutWarning(false);

      const hasSession = isAdmin || isPatientLoggedIn || isDoctorLoggedIn;
      if (hasSession) {
        warningId = setTimeout(triggerWarning, WARNING_LIMIT_MS);
        timeoutId = setTimeout(logoutForInactivity, INACTIVITY_LIMIT_MS);
      }
    };

    // User activity events that count as "active".
    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetTimer);
    });

    // Start timer immediately when effect runs.
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningId) clearTimeout(warningId);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [INACTIVITY_LIMIT_MS, WARNING_LIMIT_MS, isAdmin, isPatientLoggedIn, isDoctorLoggedIn]);

  const go = (next) => setView(next);

  // Simple admin login gate for routing. The real admin API auth
  // happens inside AdminDashboard using admin_token.
  const handleAdminLogin = (password) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('securekit_is_admin', '1');
      setIsAdmin(true);
      setView('admin');
    } else {
      alert('Invalid admin password');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('securekit_is_admin');
    setIsAdmin(false);
    setView('home');
  };

  const handlePatientAuthChange = (loggedIn) => {
    setIsPatientLoggedIn(loggedIn);
    setView(loggedIn ? 'patient' : 'home');
  };

  const handleDoctorLoginSuccess = () => {
    setIsDoctorLoggedIn(true);
    setView('doctor');
  };

  const handleAdminAuthChange = (loggedIn) => {
    setIsAdmin(loggedIn);
    if (loggedIn) {
      localStorage.setItem('securekit_is_admin', '1');
      setView('admin');
    } else {
      localStorage.removeItem('securekit_is_admin');
      localStorage.removeItem('admin_token');
      setView('home');
    }
  };

  const handleDoctorLogout = () => {
    setIsDoctorLoggedIn(false);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentView={view}
        onNavigate={go}
        isAdmin={isAdmin}
        isPatientLoggedIn={isPatientLoggedIn}
        isDoctorLoggedIn={isDoctorLoggedIn}
        elderMode={elderMode}
        setElderMode={setElderMode}
      />

      {showTimeoutWarning && (
        <div className="fixed bottom-10 right-10 z-[100] bg-rose-600 text-white px-8 py-5 rounded-2xl shadow-2xl shadow-rose-900/50 animate-bounce flex items-center gap-5 border border-rose-400">
          <div className="text-4xl animate-pulse">⚠️</div>
          <div>
            <h4 className="text-lg font-black tracking-tight uppercase">Session Expiring</h4>
            <p className="text-xs font-bold text-rose-200 mt-1">Due to inactivity, you will be logged out in 1 minute.<br/>Move your mouse to stay connected.</p>
          </div>
        </div>
      )}

      <main className="w-full px-4 lg:px-10 xl:px-16 py-12 flex-1">
        {view === 'home' && (
          <Home
            onNavigate={go}
            isAdmin={isAdmin}
            isLoggedIn={isAdmin || isPatientLoggedIn || isDoctorLoggedIn}
          />
        )}

        {view === 'services' && (
          <Services onNavigate={go} />
        )}

        {view === 'appointments' && (
          <Appointments onNavigateToLogin={() => go('login')} />
        )}

        {view === 'doctors' && (
          <DoctorsPage onNavigate={go} />
        )}

        {view === 'about' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            <section className="bg-slate-900 text-white rounded-[3rem] p-16 relative overflow-hidden text-center space-y-6">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
              <h2 className="text-5xl font-black italic">The <span className="text-indigo-400">Mission</span></h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                At SecureKit, we orchestrate the delicate balance between high-fidelity healthcare and impenetrable digital architectures. Our mission is to democratize secure clinical access via cutting-edge AI and encryption.
              </p>
            </section>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Integrity', desc: 'Immutable records powered by distributed verification.', icon: '🛡️' },
                { title: 'Velocity', desc: 'Real-time diagnostic synchronization across borders.', icon: '⚡' },
                { title: 'Empathy', desc: 'Patient-centric design that prioritizes human dignity.', icon: '❤️' }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-100 border border-slate-50 text-center space-y-4">
                  <div className="text-4xl">{item.icon}</div>
                  <h4 className="text-xl font-bold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'contact' && (
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 animate-fade-in items-center">
            <div className="space-y-8">
              <h2 className="text-6xl font-black text-slate-900 tracking-tight italic">Global <span className="text-indigo-600">Response</span></h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Our technical support teams are operational 24/7 across multiple time zones to ensure system continuity.
              </p>
              <div className="space-y-6">
                {[
                  { label: 'Network Operations', value: 'ops@securekit.app', icon: '🌐' },
                  { label: 'Patient Advocacy', value: '1-800-SECURE-H', icon: '📞' },
                  { label: 'Global Headquarters', value: 'Silicon Valley, CA', icon: '📍' }
                ].map((info, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-lg shadow-slate-100 border border-slate-50 group hover:scale-[1.02] transition-transform">
                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{info.icon}</div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{info.label}</div>
                      <div className="text-slate-900 font-bold">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Signal Identification</label>
                <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-indigo-500 transition-all" placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Communication Terminal</label>
                <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-indigo-500 transition-all" placeholder="Email Address" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Payload Content</label>
                <textarea className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-indigo-500 transition-all min-h-[150px]" placeholder="Type your message here..." />
              </div>
              <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Signal</button>
            </form>
          </div>
        )}

        {view === 'register' && (
          <div className="max-w-4xl mx-auto py-12 space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight italic">Choose <span className="text-indigo-600">Trajectory</span></h2>
              <p className="text-slate-500 text-lg">Define your role within the SecureKit ecosystem.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div
                onClick={() => go('patient-register')}
                className="group p-12 bg-white rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 hover:border-indigo-500 transition-all cursor-pointer text-center space-y-8"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center mx-auto text-5xl group-hover:scale-110 transition-transform">👤</div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Patient Login</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Securely manage your personal records, schedule appointments, and connect with verified specialists.</p>
                </div>
                <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 group-hover:bg-indigo-600 transition-colors">Initialize Registry</button>
              </div>

              <div
                onClick={() => go('doctor-register')}
                className="group p-12 bg-slate-900 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-transparent hover:border-indigo-500 transition-all cursor-pointer text-center space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px]"></div>
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto text-5xl group-hover:scale-110 transition-transform relative z-10">👨‍⚕️</div>
                <div className="space-y-2 relative z-10">
                  <h3 className="text-3xl font-black text-white tracking-tight">Doctor Portal</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Access clinical tools, manage patient encounters, and leverage advanced diagnostic architectures.</p>
                </div>
                <button className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/10 relative z-10 group-hover:bg-white group-hover:text-slate-900 transition-colors">Join Specialist Network</button>
              </div>
            </div>
          </div>
        )}

        {view === 'patient-register' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight italic mb-10">Patient <span className="text-indigo-600">Onboarding</span></h2>
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-slate-100">
              <RegisterForm />
            </div>
          </div>
        )}

        {view === 'login' && (
          <UnifiedLogin
            onPatientLoggedIn={() => handlePatientAuthChange(true)}
            onDoctorLoggedIn={handleDoctorLoginSuccess}
            onAdminLoggedIn={() => handleAdminAuthChange(true)}
            onBack={() => go('home')}
            onAdminEntry={() => go('admin-login')}
          />
        )}

        {view === 'patient' && (
          <PatientDashboard onAuthChange={handlePatientAuthChange} />
        )}

        {view === 'doctor-register' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight italic mb-10">Specialist <span className="text-emerald-600">Application</span></h2>
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-slate-100">
              <DoctorRegister onBack={() => go('home')} onSuccess={() => go('home')} />
            </div>
          </div>
        )}

        {view === 'doctor' && (
          <DoctorDashboard onLogout={handleDoctorLogout} />
        )}

        {view === 'admin-login' && (
          <Login onLogin={handleAdminLogin} onCancel={() => go('home')} />
        )}

        {view === 'profile' && (
          <div className="animate-fade-in">
            {isPatientLoggedIn && <PatientProfile />}
            {!isPatientLoggedIn && isDoctorLoggedIn && <DoctorProfile />}
            {!isPatientLoggedIn && !isDoctorLoggedIn && !isAdmin && (
              <div className="max-w-xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-4xl grayscale opacity-50">👤</div>
                <h2 className="text-3xl font-black text-slate-900 italic">Identity Required</h2>
                <p className="text-slate-500">Please authenticate to access your personal health architecture.</p>
                <button onClick={() => go('login')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Login Now</button>
              </div>
            )}
            {isAdmin && !isPatientLoggedIn && !isDoctorLoggedIn && (
              <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-[3rem] shadow-2xl p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-4xl grayscale">🛡️</div>
                <h2 className="text-3xl font-black italic">Admin <span className="text-indigo-400">Authority</span></h2>
                <p className="text-slate-400">System level accounts do not possess individual profile fields. Governance is global.</p>
              </div>
            )}
          </div>
        )}

        {view === 'admin' && isAdmin && (
          <div className="animate-fade-in space-y-8">
            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-95"
                onClick={handleAdminLogout}
              >
                Terminate Authority
              </button>
            </div>
            <AdminDashboard />
          </div>
        )}

        {view === 'admin' && !isAdmin && (
          <div className="max-w-xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-4xl grayscale opacity-50">🚫</div>
            <h2 className="text-3xl font-black text-slate-900 italic">Access <span className="text-rose-500">Denied</span></h2>
            <p className="text-slate-500">Global administrative privileges are required to view this dashboard.</p>
            <button
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
              onClick={() => go('admin-login')}
            >
              Authenticate System Login
            </button>
          </div>
        )}
      </main>

      <Footer onNavigate={go} />
    </div>
  );
}

