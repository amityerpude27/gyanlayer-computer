// components/mock/SolutionReview.js — 360° Explanation & Memory Tricks Review Engine

// =========================================================================
//  SPEED CLOCK ICON (For Solutions Review)
// =========================================================================
const SpeedClockIcon = ({ size = 16, type }) => {
  let color = '#94a3b8';
  if (type === 'superfast') color = '#16a34a';
  else if (type === 'ontime') color = '#16a34a';
  else if (type === 'slow') color = '#dc2626';
  else if (type === 'ontime_incorrect') color = '#475569';
  else if (type === 'slow_incorrect') color = '#dc2626';
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
        <circle cx="12" cy="13" r="9"></circle>
        <path d="M10 2h4 M12 2v2 M17 6l1-1"></path>
        
        {type === 'superfast' && (
          <g>
            <path d="M9 11l1 1 1-1 M13 11l1 1 1-1" />
            <path d="M9 16 Q12 18 15 16" />
          </g>
        )}
        {type === 'ontime' && (
          <g>
            <path d="M9 12h1.5 M13.5 12h1.5" />
            <path d="M10 16h4" />
          </g>
        )}
        {(type === 'slow' || type === 'slow_incorrect') && (
          <g>
            <path d="M9 12l1.5-1 M13.5 11l1.5 1" />
            <path d="M10 17 Q12 15 14 17" />
          </g>
        )}
        {type === 'ontime_incorrect' && (
          <g>
            <path d="M9 12h1.5 M13.5 12h1.5" />
            <path d="M10 16h4" />
          </g>
        )}
      </svg>
    </div>
  );
};


const SolutionReview = ({res, onBack, onViewAnalysis, onReattempt, dk, wm}) => {
  const attemptsList = Array.isArray(res) ? res : [res];
  const [activeIdx, setActiveIdx] = useState(attemptsList.length - 1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mobPaletteRef = useRef(null);
  const activeAttempt = attemptsList[activeIdx] || attemptsList[0] || {};
  const [solFilter, setSolFilter] = useState(['correct', 'incorrect', 'skipped']);
  const [tempFilter, setTempFilter] = useState(['correct', 'incorrect', 'skipped']);
  const [savedQs, setSavedQs] = useState([]);
  const [activeSolTab, setActiveSolTab] = useState(0);

  const toggleSave = (q) => {
    const qId = q.id;
    if (!savedQs.includes(qId)) {
      setSavedQs(prev => [...prev, qId]);
      if (window.dispatchBookmarkEvent) window.dispatchBookmarkEvent(q, true);
    }
  };

  const isMega = (window.caConfig && window.caConfig.mode === 'mega') || (window.caConfig && window.caConfig.questions && window.caConfig.questions.length >= 400);
  const [openExplanations, setOpenExplanations] = useState({});
  const toggleExp = (qId) => {
    setOpenExplanations(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';
  const sbg = dk ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  
  const totalMins = (activeAttempt.test && activeAttempt.test.mins) ? activeAttempt.test.mins : 15;
  // User requested approx 11 seconds per question as the ideal fast-paced target
  const targetTime = (window.caConfig && window.caConfig.mockConfig && window.caConfig.mockConfig.targetSecondsPerQuestion) || 11;

  const curModuleQs = (window.caConfig && window.caConfig.questions) || [];
  const curQIdSet = new Set(curModuleQs.map(x => String(x.id)));

  const rawCandidateQs = (activeAttempt.test && activeAttempt.test.qs && activeAttempt.test.qs.length > 0)
    ? activeAttempt.test.qs
    : (activeAttempt.qs && activeAttempt.qs.length > 0)
    ? activeAttempt.qs
    : (res && res.test && res.test.qs && res.test.qs.length > 0)
    ? res.test.qs
    : curModuleQs;

  // 🛡️ Enterprise Month-Isolation Guard: If attempt contains foreign questions not in current month, fallback to current module
  const isForeignAttempt = rawCandidateQs.some(q => !curQIdSet.has(String(q.id)));
  const allQs = isForeignAttempt ? curModuleQs : rawCandidateQs;
  let correctCount = 0;
  let skippedCount = 0;
  let incorrectCount = 0;
  allQs.forEach((q, i) => {
    const userAns = getStudentAnswer(activeAttempt.answers, q, i);
    if (userAns === null || userAns === undefined) {
      skippedCount++;
    } else if (userAns === q.answer) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const filteredQs = allQs
    .map((q, i) => ({ ...q, originalIndex: i }))
    .filter(q => {
      const userAns = getStudentAnswer(activeAttempt.answers, q, q.originalIndex);
      const isSkipped = userAns === null || userAns === undefined;
      let status = '';
      if (isSkipped) status = 'skipped';
      else if (userAns === q.answer) status = 'correct';
      else status = 'incorrect';
      return solFilter.includes(status);
    });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [solFilter, activeIdx]);

  useEffect(() => {
    if (filteredQs.length > 0 && !filteredQs.find(q => q.originalIndex === activeSolTab)) {
      setActiveSolTab(filteredQs[0].originalIndex);
    }
  }, [filteredQs, activeSolTab]);

  useEffect(() => {
    if (mobPaletteRef.current) {
      const activeBtn = mobPaletteRef.current.querySelector(`[data-sol-q="${activeSolTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeSolTab]);

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden max-w-7xl mx-auto px-4 ${dk ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-2 py-2 sm:py-3.5 px-1 sm:px-0 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button onClick={onBack} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 rounded-xl border-2 transition-all active:scale-95 flex-shrink-0 cursor-pointer ${dk ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`} title="Go to Tests List">
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span className="text-[11px] sm:text-xs font-black">Go to Tests</span>
          </button>
          {onViewAnalysis && (
            <button onClick={() => onViewAnalysis(activeAttempt.test)} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 rounded-xl border-2 transition-all active:scale-95 flex-shrink-0 cursor-pointer ${dk ? 'border-indigo-700 bg-indigo-950/30 text-indigo-400 hover:bg-indigo-900/40' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`} title="View Analysis">
              <i className="fa-solid fa-chart-column text-xs"></i>
              <span className="text-[11px] sm:text-xs font-black hidden sm:inline">Analysis</span>
            </button>
          )}
          <h2 className={`text-xs sm:text-base font-black tracking-tight truncate max-w-[120px] sm:max-w-none ${tm}`}>
            {activeAttempt.test && activeAttempt.test.name}
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 text-[9.5px] font-extrabold text-slate-500/90 dark:text-slate-400/90 bg-slate-100/70 dark:bg-slate-800/70 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 pointer-events-none select-none">
            <img src={window.GYANLAYER_LOGO || "Logo Gyanlayer/clean_logo_512.png"} alt="GyanLayer Logo" className="w-3.5 h-3.5 object-contain shrink-0" onError={(e) => { e.target.onerror = null; if (window.GYANLAYER_LOGO) e.target.src = window.GYANLAYER_LOGO; }} />
            <span className="text-violet-600 dark:text-violet-400 font-black">gyanlayer.in</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative z-30" ref={dropRef}>
          {/* Attempt Dropdown */}
          <div className="relative inline-block">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'attempt' ? null : 'attempt')}
              className={`pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-xl border-2 outline-none cursor-pointer flex items-center gap-1.5 ${dk ? 'bg-slate-900 border-slate-700 text-violet-400 focus:border-violet-500' : 'bg-white border-slate-200 text-violet-600 focus:border-violet-500'}`}
            >
              <span>Attempt {activeIdx + 1}</span>
              <span className={`pointer-events-none absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-[9px] ${dk ? 'text-violet-400' : 'text-violet-600'}`}>
                <i className="fa-solid fa-chevron-down"></i>
              </span>
            </button>
            {activeDropdown === 'attempt' && (
              <div className={`absolute top-full right-0 mt-2 min-w-[200px] origin-top-right rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-2xl z-50`}>
                <div className={`absolute -top-2 right-5 w-4 h-4 rotate-45 border-t border-l ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} z-0`}></div>
                <div className="relative flex flex-col z-10 max-h-60 overflow-y-auto rounded-xl overflow-hidden py-1 bg-inherit">
                  {attemptsList.map((att, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { setActiveIdx(idx); setActiveDropdown(null); }}
                      className={`w-full text-left px-4 py-3 text-xs border-b last:border-0 cursor-pointer transition-colors truncate ${dk ? 'border-slate-700' : 'border-gray-100'} ${activeIdx === idx ? 'bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-900/50 dark:text-indigo-300' : (dk ? 'text-slate-200 hover:bg-indigo-900/30' : 'text-slate-700 hover:bg-indigo-50')}`}
                    >
                      Attempt {idx + 1} ({att.timestamp ? new Date(att.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Today'})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative inline-block">
            <button 
              onClick={() => { setTempFilter([...solFilter]); setActiveDropdown(activeDropdown === 'filter' ? null : 'filter'); }}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase rounded-xl bg-violet-600 text-white flex items-center gap-1 shadow-sm transition-all active:scale-95" title="Filter Questions"
            >
              ⚙️ <span className="hidden sm:inline">Filter</span>
            </button>
            {activeDropdown === 'filter' && (
              <div className={`absolute top-full right-0 mt-2 min-w-[200px] origin-top-right rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-2xl z-50`}>
                <div className={`absolute -top-2 right-5 w-4 h-4 rotate-45 border-t border-l ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} z-0`}></div>
                <div className="relative flex flex-col z-10 rounded-xl overflow-hidden py-1 bg-inherit">
                  {[
                    ['correct', '✅ Correct', correctCount],
                    ['incorrect', '❌ Incorrect', incorrectCount],
                    ['skipped', '⏭ Unattempted', skippedCount]
                  ].map(([modeKey, labelString, count]) => (
                    <label key={modeKey} className={`flex items-center justify-between px-4 py-3 text-xs cursor-pointer transition-colors border-b last:border-0 ${dk ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="checkbox" 
                          checked={tempFilter.includes(modeKey)}
                          onChange={(e) => {
                            if (e.target.checked) setTempFilter([...tempFilter, modeKey]);
                            else setTempFilter(tempFilter.filter(k => k !== modeKey));
                          }}
                          className={`w-3.5 h-3.5 rounded border-2 transition-all ${dk ? 'border-slate-600 bg-slate-900 checked:bg-indigo-500 checked:border-indigo-500' : 'border-slate-300 bg-white checked:bg-indigo-600 checked:border-indigo-600'}`}
                        />
                        <span className={`font-bold ${dk ? 'text-slate-200' : 'text-slate-700'}`}>{labelString}</span>
                      </div>
                      <span className={`font-black ${ts}`}>{count}</span>
                    </label>
                  ))}
                  <div className={`flex items-center justify-between gap-3 px-4 py-3 border-t ${dk ? 'border-slate-700' : 'border-gray-100'}`}>
                    <button onClick={() => { setSolFilter([...tempFilter]); setActiveDropdown(null); }} className={`flex-1 py-1.5 text-xs font-black rounded-lg shadow-sm text-white transition-all active:scale-95 ${dk ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>Apply</button>
                    <button onClick={() => { setTempFilter(['correct', 'incorrect', 'skipped']); setSolFilter(['correct', 'incorrect', 'skipped']); setActiveDropdown(null); }} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 ${dk ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>Reset</button>
                  </div>
                  {/* Speed Indicators (Mobile Only in Filter Menu) */}
                  <div className={`flex sm:hidden flex-col gap-2.5 text-xs font-bold p-4 border-t ${dk ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                     <div className={`mb-1 uppercase text-[10px] tracking-wider font-black ${ts}`}>Speed Indicators</div>
                     <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="superfast" /> <span className={ts}>Superfast (&lt; {Math.ceil(targetTime * 0.5)}s)</span></div>
                       <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="ontime" /> <span className={ts}>On Time (⏳ {targetTime}s)</span></div>
                       <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="slow" /> <span className={ts}>Slow (&gt; {targetTime}s)</span></div>
                       <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="ontime_incorrect" /> <span className={ts}>On Time Error</span></div>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 1-Click Direct Quick Filter Pills Bar ── */}
      <div className={`flex items-center gap-1 sm:gap-2 px-1 py-1.5 sm:py-2.5 overflow-x-auto custom-scroll border-b flex-shrink-0 ${dk ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'}`}>
        <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mr-1 hidden sm:inline ${ts}`}>Quick Filter:</span>
        
        {/* All Questions Pill */}
        <button
          onClick={() => setSolFilter(['correct', 'incorrect', 'skipped'])}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg sm:rounded-xl border transition-all active:scale-95 flex items-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer ${
            solFilter.length === 3
              ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/20'
              : (dk ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100')
          }`}
        >
          <span>🗂️ All</span>
          <span className="opacity-90 text-[10px] sm:text-[11px] font-bold">({allQs.length})</span>
        </button>

        {/* Correct Pill */}
        <button
          onClick={() => setSolFilter(['correct'])}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg sm:rounded-xl border transition-all active:scale-95 flex items-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer ${
            solFilter.length === 1 && solFilter.includes('correct')
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
              : (dk ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50')
          }`}
        >
          <span>✅ Correct</span>
          <span className="opacity-90 text-[10px] sm:text-[11px] font-bold">({correctCount})</span>
        </button>

        {/* Incorrect Mistakes Pill */}
        <button
          onClick={() => setSolFilter(['incorrect'])}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg sm:rounded-xl border transition-all active:scale-95 flex items-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer ${
            solFilter.length === 1 && solFilter.includes('incorrect')
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
              : (dk ? 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-rose-700 border-slate-200 hover:bg-rose-50')
          }`}
        >
          <span>❌ Incorrect</span>
          <span className="opacity-90 text-[10px] sm:text-[11px] font-bold">({incorrectCount})</span>
        </button>

        {/* Skipped / Unattempted Pill */}
        <button
          onClick={() => setSolFilter(['skipped'])}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg sm:rounded-xl border transition-all active:scale-95 flex items-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer ${
            solFilter.length === 1 && solFilter.includes('skipped')
              ? 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/20'
              : (dk ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100')
          }`}
        >
          <span>⏭ Unattempted</span>
          <span className="opacity-90 text-[10px] sm:text-[11px] font-bold">({skippedCount})</span>
        </button>
      </div>

      {/* Mobile Palette */}
      <div ref={mobPaletteRef} className={`flex sm:hidden overflow-x-auto gap-1.5 px-2.5 py-2 border-b ${dk ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'} custom-scroll items-center snap-x`}>
        {filteredQs.map((q) => {
          const i = q.originalIndex;
          const userAns = getStudentAnswer(activeAttempt.answers, q, i);
          const isCorrect = userAns === q.answer;
          const isSkipped = userAns === null || userAns === undefined;
          
          let bg, fg, br;
          if (isSkipped) {
            bg = dk ? '#1e293b' : '#f1f5f9';
            fg = dk ? '#64748b' : '#94a3b8';
            br = dk ? '#334155' : '#cbd5e1';
          } else if (isCorrect) {
            bg = dk ? '#052e16' : '#dcfce7';
            fg = dk ? '#4ade80' : '#16a34a';
            br = dk ? '#166534' : '#86efac';
          } else {
            bg = dk ? '#450a0a' : '#fee2e2';
            fg = dk ? '#f87171' : '#dc2626';
            br = dk ? '#7f1d1d' : '#fca5a5';
          }
          
          const isActive = activeSolTab === i;
          if (isActive) br = '#8b5cf6'; // Highlight active border
          
          return (
            <button key={i} data-sol-q={i} onClick={() => setActiveSolTab(i)}
            className="flex-shrink-0 snap-center cursor-pointer"
            style={{
              background: bg,
              color: fg,
              border: isActive ? '2px solid #7c3aed' : '1.5px solid '+br,
              boxShadow: isActive ? '0 0 0 2px rgba(124,58,237,0.35)' : 'none',
              transform: isActive ? 'scale(1.06)' : 'scale(1)',
              width:'29px', height:'29px', borderRadius:'7px',
              fontWeight:'bold', fontSize:'11px',
              transition:'all 0.15s',
              zIndex: isActive ? 10 : 1
            }}>
              {i+1}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden w-full gap-3 sm:gap-4 mt-2 sm:mt-4 h-full pb-14 sm:pb-0">
        {/* Left Area (Questions) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Questions List */}
          <div className="flex-1 overflow-y-auto custom-scroll pr-0.5 sm:pr-1 space-y-3 sm:space-y-4 pb-12 sm:pb-16 h-full" ref={scrollContainerRef}>
            {filteredQs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">💡</p>
                <p className={`text-xs font-bold ${ts}`}>No question records matching this active filter status matrix.</p>
              </div>
            ) : (
              [filteredQs.find(q => q.originalIndex === activeSolTab) || filteredQs[0]].map(q => {
                if (!q) return null;
                const idx = q.originalIndex;
                const userAns = getStudentAnswer(activeAttempt.answers, q, idx);
                const isCorrect = userAns === q.answer;
                const qTimesSource = activeAttempt.qTimes || activeAttempt.times || {};
                const spent = Array.isArray(qTimesSource)
                  ? (qTimesSource[idx] !== undefined ? qTimesSource[idx] : 0)
                  : (qTimesSource[idx] !== undefined ? qTimesSource[idx] : (qTimesSource[q.id] || 0));
                const isSkipped = userAns === null || userAns === undefined;

                let speedType = 'ontime';
                if (isCorrect) {
                  if (spent <= targetTime * 0.5) speedType = 'superfast';
                  else if (spent <= targetTime) speedType = 'ontime';
                  else speedType = 'slow';
                } else {
                  if (spent <= targetTime) speedType = 'ontime_incorrect';
                  else speedType = 'slow_incorrect';
                }

                const mk = activeAttempt.test ? activeAttempt.test.mark : 1;
                const ng = activeAttempt.test ? activeAttempt.test.neg : 0.33;

                return (
                  <div key={q.id || idx} className={`font-sans antialiased border-2 rounded-xl sm:rounded-2xl p-3 sm:p-5 relative ${card}`} id={`sol-q-${idx}`}>
                    <div className="flex items-center mb-2.5 sm:mb-4 flex-wrap gap-1.5 sm:gap-2">
                      <span className={`text-xs sm:text-[13px] font-bold mr-1 ${dk ? 'text-white' : 'text-gray-900'}`}>
                        Question No. {idx + 1}
                      </span>
                      {isMega && q.bookQNum && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mr-1">
                          📖 Book Q#{q.bookQNum}
                        </span>
                      )}
                      <span className={`text-[9.5px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-full font-bold text-white mr-1 ${isSkipped ? 'bg-slate-400 dark:bg-slate-600' : isCorrect ? 'bg-green-600' : 'bg-rose-600'}`}>
                        {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <div className="flex items-center gap-1 ml-0.5 sm:ml-1">
                         <SpeedClockIcon size={14} type={speedType} />
                         <span className={`text-[10.5px] sm:text-[11px] font-semibold ${ts}`}>You: {fmt(spent)}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 ml-1.5 sm:ml-2 border-l border-slate-300 dark:border-slate-700 pl-2 sm:pl-3">
                         <span className={`text-[10.5px] sm:text-[11px] font-semibold ${ts}`}>Avg: {fmt(targetTime)}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 ml-1.5 sm:ml-2 border-l border-slate-300 dark:border-slate-700 pl-2 sm:pl-3">
                         <span className={`text-[10.5px] sm:text-[11px] font-semibold ${ts}`}>Marks</span>
                         <span className={`text-[9.5px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white ${isSkipped ? 'bg-slate-400 dark:bg-slate-600' : isCorrect ? 'bg-green-600' : 'bg-rose-600'}`}>
                           {isSkipped ? '0' : isCorrect ? '+'+mk : '-'+ng}
                         </span>
                      </div>
                      <button 
                        onClick={() => toggleSave(q)}
                        className={`ml-auto flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${savedQs.includes(q.id) ? (dk ? 'text-indigo-400 bg-indigo-900/30' : 'text-indigo-600 bg-indigo-50') : (dk ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')}`} 
                        title="Save Question"
                      >
                        <i className={savedQs.includes(q.id) ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}></i>
                        <span className="hidden sm:inline">{savedQs.includes(q.id) ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                    
                    <p className={`text-sm sm:text-base md:text-lg font-bold leading-snug mb-2.5 sm:mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>
                      {q.question}
                    </p>
                    
                    <div className="space-y-1.5 sm:space-y-2.5 mb-2.5 sm:mb-4">
                      {(q.opts || []).map((opt, oIdx) => {
                        const cMatch = opt === q.answer;
                        const sMatch = opt === userAns;
                        let opStyle = dk ? 'border-slate-750 bg-slate-800 text-slate-300' : 'border-gray-200 bg-white text-gray-700';
                        
                        if (cMatch) {
                          opStyle = dk ? 'border-emerald-500 bg-emerald-900/30 text-emerald-200 font-medium' : 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium';
                        } else if (sMatch && !isCorrect) {
                          opStyle = dk ? 'border-rose-500 bg-rose-900/30 text-rose-200 font-medium' : 'border-rose-500 bg-rose-50 text-rose-800 font-medium';
                        }

                        return (
                          <div key={opt} className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl border-2 text-xs sm:text-sm md:text-base leading-snug sm:leading-relaxed flex items-center justify-between gap-2.5 sm:gap-3 ${opStyle}`}>
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[9.5px] sm:text-[11px] font-black shrink-0 ${cMatch ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' : sMatch ? 'bg-rose-500 border-rose-500 text-white shadow-xs' : 'border-slate-300 dark:border-slate-700 text-slate-400'}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="font-semibold text-left">{opt}</span>
                            </div>

                            {/* Clear indicator for user choice (U) and correct answer */}
                            {sMatch && !isCorrect && (
                              <span className="shrink-0 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs flex items-center gap-1 select-none">
                                <i className="fa-solid fa-xmark text-[9px]"></i>
                                <span>You (U)</span>
                              </span>
                            )}
                            {cMatch && (
                              <span className="shrink-0 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs flex items-center gap-1 select-none">
                                <i className="fa-solid fa-check text-[9px]"></i>
                                <span>{sMatch ? "Correct (You)" : "Correct Ans"}</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* ── Solution Explanations (Testbook Style 360° View) ── */}
                    <div className="space-y-2.5 mt-2.5 sm:mt-4">
                      {/* 📖 View 360° Explanation Toggle Button */}
                      {q.explanation && (q.explanation.inNews || (q.explanation.keyPoints && q.explanation.keyPoints.length > 0) || (q.explanation.additionalInfo && q.explanation.additionalInfo.length > 0)) && (() => {
                        const expKey = (q.id !== undefined && q.id !== null) ? q.id : idx;
                        const isExpOpen = !!openExplanations[expKey];
                        return (
                          <div className="mt-1.5 sm:mt-2.5">
                            <button
                              onClick={() => toggleExp(expKey)}
                              className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer ${dk ? 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/50' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'}`}
                            >
                              <i className={`fa-solid ${isExpOpen ? 'fa-chevron-up' : 'fa-book-open'}`}></i>
                              <span>{isExpOpen ? "Hide 360° Explanation" : "📖 View 360° Explanation (In News • Key Points • Static GK)"}</span>
                            </button>

                            {isExpOpen && (
                            <div className="mt-3 space-y-3 animate-fade-in-app">
                              {/* 📰 In News */}
                              {q.explanation.inNews && (
                                <div className={`p-4 rounded-xl border text-sm md:text-base leading-relaxed ${dk ? 'bg-blue-950/20 border-blue-500/30 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'}`}>
                                  <strong className={`block mb-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${dk ? 'text-blue-400' : 'text-blue-700'}`}>
                                    <span>📰</span> In News
                                  </strong>
                                  <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed text-left">
                                    {q.explanation.inNews}
                                  </p>
                                </div>
                              )}

                              {/* 🎯 Key Points */}
                              {q.explanation.keyPoints && q.explanation.keyPoints.length > 0 && (
                                <div className={`p-4 rounded-xl border text-sm md:text-base leading-relaxed ${dk ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'}`}>
                                  <strong className={`block mb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${dk ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <span>🎯</span> Key Points
                                  </strong>
                                  <div className="space-y-2 font-medium">
                                    {q.explanation.keyPoints.map((item, kpIdx) => (
                                      <div key={kpIdx} className="flex items-start gap-2.5 leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                        <span className="flex-1 text-slate-800 dark:text-slate-200">{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 📝 Additional Information (Static GK) */}
                              {q.explanation.additionalInfo && q.explanation.additionalInfo.length > 0 && (
                                <div className={`p-4 rounded-xl border text-sm md:text-base leading-relaxed ${dk ? 'bg-purple-950/20 border-purple-500/30 text-purple-200' : 'bg-purple-50/80 border-purple-200 text-purple-900'}`}>
                                  <strong className={`block mb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${dk ? 'text-purple-400' : 'text-purple-700'}`}>
                                    <span>📝</span> Additional Information (Static GK)
                                  </strong>
                                  <div className="space-y-2 font-medium">
                                    {q.explanation.additionalInfo.map((item, aiIdx) => (
                                      <div key={aiIdx} className="flex items-start gap-2.5 leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                                        <span className="flex-1 text-slate-800 dark:text-slate-200">{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    </div>

                    {/* Card Bottom Navigation Bar (Previous / Counter / Next) */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-200/80 dark:border-slate-700/80">
                      <button
                        onClick={() => {
                          const curFilterIdx = filteredQs.findIndex(item => item.originalIndex === idx);
                          if (curFilterIdx > 0) setActiveSolTab(filteredQs[curFilterIdx - 1].originalIndex);
                        }}
                        disabled={filteredQs.findIndex(item => item.originalIndex === idx) <= 0}
                        className="px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-black border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                      >
                        <i className="fa-solid fa-chevron-left text-[10px]"></i>
                        <span>Previous</span>
                      </button>
                      <div className="flex items-center gap-1 text-xs font-black">
                        <span className="text-violet-600 dark:text-violet-400">
                          {filteredQs.findIndex(item => item.originalIndex === idx) + 1}
                        </span>
                        <span className={ts}>/</span>
                        <span className={ts}>{filteredQs.length}</span>
                      </div>
                      <button
                        onClick={() => {
                          const curFilterIdx = filteredQs.findIndex(item => item.originalIndex === idx);
                          if (curFilterIdx < filteredQs.length - 1) setActiveSolTab(filteredQs[curFilterIdx + 1].originalIndex);
                        }}
                        disabled={filteredQs.findIndex(item => item.originalIndex === idx) >= filteredQs.length - 1}
                        className="px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-black border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white border-violet-600 shadow-sm shadow-violet-600/20"
                      >
                        <span>Next</span>
                        <i className="fa-solid fa-chevron-right text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar (Grid) */}
        <div className={`hidden sm:flex flex-col w-60 border-l overflow-visible relative flex-shrink-0 h-full z-10 ${sbg}`}>
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between relative z-40">
            <span className={`text-[10px] font-black uppercase tracking-widest ${ts}`}>SECTION: Test</span>
          </div>
          <div className="p-3 flex-1 overflow-y-auto custom-scroll">
            <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px'}}>
              {filteredQs.map((q) => {
                const i = q.originalIndex;
                const userAns = getStudentAnswer(activeAttempt.answers, q, i);
                const isCorrect = userAns === q.answer;
                const isSkipped = userAns === null || userAns === undefined;
                
                let bg, fg, br;
                if (isSkipped) {
                  bg = dk ? '#1e293b' : '#f1f5f9';
                  fg = dk ? '#64748b' : '#94a3b8';
                  br = dk ? '#334155' : '#cbd5e1';
                } else if (isCorrect) {
                  bg = dk ? '#052e16' : '#dcfce7';
                  fg = dk ? '#4ade80' : '#16a34a';
                  br = dk ? '#166534' : '#86efac';
                } else {
                  bg = dk ? '#450a0a' : '#fee2e2';
                  fg = dk ? '#f87171' : '#dc2626';
                  br = dk ? '#7f1d1d' : '#fca5a5';
                }
                
                const isActive = activeSolTab === i;
                if (isActive) br = '#8b5cf6'; // Highlight active border
                
                return (
                  <button key={i} onClick={() => setActiveSolTab(i)}
                  style={{
                    background: bg,
                    color: fg,
                    border: isActive ? '2px solid #7c3aed' : '2px solid '+br,
                    boxShadow: isActive ? '0 0 0 2px rgba(124,58,237,0.4)' : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    width:'34px', height:'34px', borderRadius:'6px',
                    fontWeight:'bold', fontSize:'11px', cursor:'pointer',
                    transition:'all 0.15s',
                    zIndex: isActive ? 10 : 1
                  }}>
                    {i+1}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Desktop Legend */}
          <div className={`p-4 border-t flex-shrink-0 z-40 ${dk ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
             <div className={`mb-3 font-black uppercase text-[10px] tracking-wider ${ts}`}>Speed Indicators</div>
             <div className="flex flex-col gap-3 text-xs font-bold">
                 <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="superfast" /> <span className={ts}>Superfast (&lt; {Math.ceil(targetTime * 0.5)}s)</span></div>
                 <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="ontime" /> <span className={ts}>On Time (⏳ {targetTime}s)</span></div>
                 <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="slow" /> <span className={ts}>Slow (&gt; {targetTime}s)</span></div>
                 <div className="flex items-center gap-2"><SpeedClockIcon size={16} type="ontime_incorrect" /> <span className={ts}>On Time Error</span></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.SolutionReview = SolutionReview;
  window.SpeedClockIcon = SpeedClockIcon;
}
