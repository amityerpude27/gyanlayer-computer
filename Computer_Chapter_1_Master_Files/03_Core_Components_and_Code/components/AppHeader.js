// ================================================================
//  AppHeader.js — Unified Header (Title + Tabs in one block)
//  Header aur Tabs ek hi section mein hain — Template_Practice_Arena style
// ================================================================

const AppHeader = ({ title, subtitle, logo, theme, blueLight, onOpenEyeCare, onOpenPodcast, onOpenProgress, preparedPct, tabs, activeTab, onTabChange, mistakeCount, isTestActive }) => {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  useEffect(() => {
    const handleGlobalKey = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea') return;
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const headerBg = isDark
    ? 'bg-slate-950 border-slate-900'
    : isWarm
    ? 'bg-[#f6ebd2] border-[#e1d3b0]'
    : 'bg-white border-slate-200';

  const titleColor = isDark ? 'text-amber-400' : 'text-violet-600';

  const sendToParent = (type) => {
    try {
      if (window.parent !== window) window.parent.postMessage({ type }, '*');
    } catch(e) {}
  };

  return (
    <header id="ca-app-header" className={`shadow-sm transition-colors duration-200 border-b flex-shrink-0 z-30 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-5">

        {/* ═══════════════════════════════════════════
            PC LAYOUT: Title row + Tabs row (combined)
        ════════════════════════════════════════════ */}
        <div className="hidden sm:block">

          {/* Row 1: Logo + Title + Progress + Podcast + Fullscreen + Eye Shield + Shortcuts */}
          <div className="flex items-center justify-between w-full py-3">
            <div className="flex items-center gap-2.5">
              {/* GyanLayer Official 3-Layer Logo in Glassmorphic Gradient Box */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-violet-600/15 via-pink-500/10 to-indigo-500/15 dark:from-violet-950/50 dark:to-indigo-950/50 border border-violet-500/30 p-1.5 flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/10">
                <img src={window.GYANLAYER_LOGO || "Logo Gyanlayer/clean_logo_512.png"} alt="GyanLayer Logo" className="w-full h-full object-contain filter drop-shadow-sm" onError={(e) => { e.target.onerror = null; if (window.GYANLAYER_LOGO) e.target.src = window.GYANLAYER_LOGO; }} />
              </div>
              <div>
                <h1 className={`text-base sm:text-lg font-black tracking-tight ${titleColor}`}>
                  {title}
                </h1>
                <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400 font-bold leading-tight mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Right Buttons: Watermark + Shortcuts + Progress + Podcast + Fullscreen + Eye Shield */}
            <div className="flex items-center gap-2.5 lg:gap-3">
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border ${isDark ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300' : 'bg-indigo-50/80 border-indigo-200/80 text-indigo-700'}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>https://www.gyanlayer.in</span>
              </div>

              {/* Fullscreen Button (Desktop) */}
              <button
                id="fullscreen-toggle-btn-desktop"
                onClick={() => {
                  try {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    } else {
                      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                    }
                  } catch(e) {}
                }}
                title="फुल स्क्रीन टॉगल करें (शॉर्टकट: F11)"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 text-sky-400 hover:border-sky-500/50 hover:bg-sky-950/30' 
                    : 'bg-white border-slate-200 text-sky-700 hover:border-sky-300 hover:bg-sky-50/60'
                }`}
              >
                <i className="fa-solid fa-expand text-xs"></i>
                <span>Fullscreen <span className="opacity-70 font-mono text-[10px]">(F11)</span></span>
              </button>

              {/* Progress Dashboard Button (Desktop) */}
              <button
                id="progress-dashboard-btn-desktop"
                onClick={onOpenProgress}
                title="मंथली प्रोग्रेस और तैयारी का स्तर देखें"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 text-violet-400 hover:border-violet-500/50 hover:bg-violet-950/30' 
                    : 'bg-white border-slate-200 text-violet-700 hover:border-violet-300 hover:bg-violet-50/60'
                }`}
              >
                <i className="fa-solid fa-chart-pie text-xs text-violet-500"></i>
                <span>{preparedPct || 0}% Prepared</span>
              </button>

              {/* Podcast Mode Button (Desktop) */}
              <button
                id="podcast-mode-btn-desktop"
                onClick={onOpenPodcast}
                title="लगातार पॉडकास्ट मोड शुरू करें (शॉर्टकट: P या Shift+P)"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
                  isDark 
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-950/50 hover:border-amber-400' 
                    : 'bg-amber-50/90 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300'
                }`}
              >
                <i className="fa-solid fa-headphones text-xs text-amber-500 animate-pulse"></i>
                <span>पॉडकास्ट <span className="opacity-70 font-mono text-[10px]">(P)</span></span>
              </button>

              {/* Eye Shield */}
              <button
                id="eye-shield-btn-desktop"
                onClick={onOpenEyeCare}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
                  blueLight > 0
                    ? 'bg-amber-400 border-amber-400 text-amber-950 font-black shadow-amber-500/20'
                    : isDark
                    ? 'bg-slate-900/90 border-slate-800 text-amber-400 hover:border-amber-500/40'
                    : 'bg-white border-slate-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <i className="fa-solid fa-eye-slash text-xs"></i>
                <span>Eye Shield: {blueLight > 0 ? `${blueLight}%` : 'Off'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Navigation Tabs / Exam Hall Focus Mode Banner */}
          {isTestActive ? (
            <div className="flex items-center justify-between py-2.5 px-3 border-t border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-b-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider">🎯 Live CBT Exam Hall Mode Active</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                All navigation tabs locked for zero-distraction focus
              </span>
            </div>
          ) : (
            <nav className={`flex items-end justify-center gap-6 sm:gap-10 border-t ${
              isDark ? 'border-slate-800' : isWarm ? 'border-[#ddd0a8]' : 'border-slate-100'
            }`}>
            {(tabs || []).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 text-xs font-black transition-all duration-200 whitespace-nowrap border-b-[3px] ${
                    isActive
                      ? isDark
                        ? 'border-amber-400 text-amber-400'
                        : isWarm
                        ? 'border-amber-700 text-amber-700'
                        : 'border-violet-600 text-violet-600'
                      : isDark
                      ? 'border-transparent text-slate-500 hover:text-slate-300'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} text-[13px] ${
                    isActive && !isDark && !isWarm
                      ? 'bg-gradient-to-tr from-violet-500 to-pink-500 text-transparent bg-clip-text'
                      : ''
                  }`}></i>
                  <span>{tab.label}</span>
                  {tab.id === 'mistakes' && mistakeCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full leading-none">
                      {mistakeCount > 9 ? '9+' : mistakeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
        </div>

        {/* ═══════════════════════════════════════════
            MOBILE LAYOUT: Compact single line
        ════════════════════════════════════════════ */}
        <div className="flex sm:hidden items-center justify-between w-full py-2 gap-2">

          {/* Left: Logo + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600/15 to-pink-500/15 dark:from-violet-950/50 dark:to-pink-950/50 border border-violet-500/30 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img src={window.GYANLAYER_LOGO || "Logo Gyanlayer/clean_logo_512.png"} alt="GyanLayer Logo" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; if (window.GYANLAYER_LOGO) e.target.src = window.GYANLAYER_LOGO; }} />
            </div>
            <div className="min-w-0">
              <h1 className={`text-sm font-black tracking-tight truncate ${titleColor}`}>
                {title}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight truncate mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right: Control Buttons (Progress + Podcast + Eye Shield) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {/* Progress Dashboard Button (Mobile) */}
            <button
              id="progress-dashboard-btn-mobile"
              onClick={onOpenProgress}
              title="प्रोग्रेस देखें"
              className="px-2 h-8 rounded-full flex items-center justify-center gap-1 border border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-black transition-all active:scale-90 shadow-xs"
            >
              <i className="fa-solid fa-chart-pie text-violet-500 text-[11px]"></i>
              <span>{preparedPct || 0}%</span>
            </button>

            {/* Podcast Button (Mobile) */}
            <button
              id="podcast-mode-btn-mobile"
              onClick={onOpenPodcast}
              title="पॉडकास्ट मोड"
              className="w-8 h-8 rounded-full flex items-center justify-center border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-black transition-all active:scale-90 shadow-xs"
            >
              <i className="fa-solid fa-headphones text-amber-500"></i>
            </button>

            {/* Eye Shield (Amber) */}
            <button
              id="eye-shield-btn-mobile"
              onClick={onOpenEyeCare}
              title="Eye Shield"
              className={`w-8 h-8 rounded-full flex items-center justify-center border text-[11px] font-black transition-all active:scale-90 ${
                blueLight > 0
                  ? 'bg-amber-400 border-amber-400 text-amber-900'
                  : isDark
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-amber-50 border-amber-100 text-amber-600'
              }`}
            >
              <i className="fa-solid fa-eye-slash"></i>
            </button>
          </div>
        </div>

      </div>

      {/* ============ ⌨️ KEYBOARD SHORTCUTS CHEATSHEET MODAL ============ */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in-app">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-5 sm:p-6 flex flex-col max-h-[85vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : isWarm ? 'bg-[#faf7ef] border-[#e0d5b0] text-[#4a3b32]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-base">
                  <i className="fa-solid fa-keyboard"></i>
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight">Keyboard Shortcuts</h3>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Supercharge your speed & learning</p>
                </div>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* Shortcut Groups */}
            <div className="space-y-4 text-xs font-semibold">
              {/* 1. App & Navigation */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">⚡ Navigation & Display</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <span>Toggle Fullscreen Mode</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[10px] font-black shadow-2xs">F11</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <span>Switch Tabs (Notes / Flash / Mock / Mistakes)</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[10px] font-black shadow-2xs">1, 2, 3, 4</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <span>Close Modals / Popup Dialogs</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[10px] font-black shadow-2xs">Esc</kbd>
                  </div>
                </div>
              </div>

              {/* 2. Audio & Podcast */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">🎧 Audio & Podcast</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <span>Play / Pause Continuous Podcast</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[10px] font-black shadow-2xs">P / Shift+P</kbd>
                  </div>
                </div>
              </div>

              {/* 3. Mock Test Exam CBT */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">🎯 Mock Test (CBT Exam Mode)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <span>Select Options A, B, C, D</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[10px] font-black shadow-2xs">A, B, C, D</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <span>Save & Next Question</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[10px] font-black shadow-2xs">Enter / Space</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10.5px] font-bold text-slate-400">Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-mono text-[9.5px]">?</kbd> anytime to open this sheet</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
