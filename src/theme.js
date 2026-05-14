/**
 * Citizen Health Console - Unified Design System
 * Centralized Tailwind utility strings for ultra-premium aesthetics.
 */

export const theme = {
    // Layout Containers
    card: "bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-slate-50 p-10 md:p-16 relative overflow-hidden",
    glassCard: "bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-3xl border border-white/20 p-12",

    // Input Fields
    input: "w-full px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none",
    inputActive: "bg-white border-indigo-500 shadow-lg shadow-indigo-500/5",

    // Buttons
    btnPrimary: "px-12 py-6 rounded-[2rem] bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 italic disabled:opacity-50",
    btnSecondary: "px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 italic border border-slate-50 hover:bg-sky-400 transition-all",

    // Typography
    h1: "text-7xl md:text-9xl font-black tracking-tighter italic leading-none",
    h2: "text-5xl md:text-7xl font-black italic tracking-tighter",
    label: "text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4 mb-2 block",

    // Components
    badge: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-black tracking-[0.3em] uppercase",
    statusDot: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse",

    // Sections
    heroSection: "bg-slate-900 text-white rounded-[4rem] shadow-2xl p-16 md:p-24 relative overflow-hidden",
};
