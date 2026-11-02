// ================================================================
//  ProgressModal.js — Monthly Learning Progress & Mastery Dashboard
//  Dedicated Modal Component for tracking true student preparation
// ================================================================

const ProgressModal = ({ isOpen, onClose, totalQuestions, readCount, testStats, mistakeStats, onResetProgress, theme, month, year }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  // Modal Backgrounds
  const modalBg = isDark
    ? 'bg-slate-900 border-slate-700 text-slate-100'
    : isWarm
    ? 'bg-[#faf6ee] border-[#dfcfad] text-[#423224]'
    : 'bg-white border-slate-200 text-slate-800';

  const cardBg = isDark
    ? 'bg-slate-950/70 border-slate-800'
    : isWarm
    ? 'bg-[#f4ebd6] border-[#dac9a1]'
    : 'bg-slate-50 border-slate-200/80';

  // Overall Preparation Percentage Calculation (Weighted Score)
  // 50% Notes Read + 35% Mock Test Practice + 15% Mistakes Fixed
  const notesWeight = totalQuestions > 0 ? Math.min(100, Math.round((readCount / totalQuestions) * 100)) : 0;
  const mockWeight = (testStats && testStats.totalTests > 0)
    ? Math.min(100, Math.round((testStats.attemptedTests / testStats.totalTests) * 100))
    : 0;
  const testAcc = testStats && testStats.avgAccuracy ? testStats.avgAccuracy : 0;
  const mistakeFixedPct = mistakeStats && mistakeStats.totalRecorded > 0
    ? Math.min(100, Math.round((mistakeStats.cleared / mistakeStats.totalRecorded) * 100))
    : 100;

  const overallPreparedPct = Math.min(100, Math.round((notesWeight * 0.5) + (mockWeight * 0.35) + (mistakeFixedPct * 0.15)));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in-app"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-md shadow-violet-500/20">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Preparation Dashboard
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
                {month} {year} • Monthly Progress & Readiness Score
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* 🌟 Big Hero Metric: Overall Preparation Meter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-violet-600/10 via-indigo-600/10 to-pink-500/10 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-pink-950/30 border border-violet-500/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <i className="fa-solid fa-bullseye animate-pulse"></i> Overall Preparedness
              </span>
              <span className="text-sm sm:text-base font-black text-violet-600 dark:text-violet-400">
                {overallPreparedPct}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${overallPreparedPct}%` }}
              ></div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 text-left">
              {overallPreparedPct >= 85 ? '🏆 Excellent! You are 100% prepared for exams.' : overallPreparedPct >= 50 ? '⚡ Great progress! Attempt more mock tests to boost your score.' : '🎯 Good start! Keep studying consistently every day.'}
            </p>
          </div>

          {/* ── 3 Metric Breakdown Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Card 1: Study Notes Reading Coverage */}
            <div className={`p-3.5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    <i className="fa-solid fa-book-open mr-1"></i> Notes Read
                  </span>
                  <span className="text-[10px] font-black text-indigo-500">{notesWeight}%</span>
                </div>
                <div className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
                  {readCount} <span className="text-xs text-slate-500 font-bold">/ {totalQuestions}</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-2">
                Questions thoroughly studied
              </p>
            </div>

            {/* Card 2: Mock Tests Coverage */}
            <div className={`p-3.5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                    <i className="fa-solid fa-list-check mr-1"></i> Mock Tests
                  </span>
                  <span className="text-[10px] font-black text-emerald-500">{mockWeight}%</span>
                </div>
                <div className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
                  {(testStats && testStats.attemptedTests) || 0} <span className="text-xs text-slate-500 font-bold">/ {(testStats && testStats.totalTests) || 0}</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-2">
                Avg Accuracy: <strong className="text-emerald-500">{testAcc}%</strong>
              </p>
            </div>

            {/* Card 3: Weak Spots & Mistakes */}
            <div className={`p-3.5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i> Mistakes
                  </span>
                  <span className="text-[10px] font-black text-rose-500">{mistakeFixedPct}%</span>
                </div>
                <div className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
                  {(mistakeStats && mistakeStats.cleared) || 0} <span className="text-xs text-slate-500 font-bold">/ {(mistakeStats && mistakeStats.totalRecorded) || 0}</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-2">
                Weak spots resolved
              </p>
            </div>

          </div>

          {/* ── Anti-Cheat Reading Security Guarantee Badge ── */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <i className="fa-solid fa-shield-halved text-emerald-500 text-sm shrink-0"></i>
            <span>
              <strong>Smart Focus Tracker:</strong> Only genuine, focused reading time is tracked into your preparation progress (fast scrolling is safely ignored).
            </span>
          </div>

        </div>

        {/* ── Modal Footer ── */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset your learning progress for this month?")) {
                if (onResetProgress) onResetProgress();
              }
            }}
            className="text-[10.5px] sm:text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <i className="fa-solid fa-rotate-left text-xs"></i>
            <span>Reset Progress</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-md shadow-violet-600/30 transition-all active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

window.ProgressModal = ProgressModal;
