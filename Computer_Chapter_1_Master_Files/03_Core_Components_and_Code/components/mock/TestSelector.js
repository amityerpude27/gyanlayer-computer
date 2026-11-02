// components/mock/TestSelector.js — Exam-Style Mock Test Selection Dashboard

//  SCREEN 1: Test Selection
const TestSelector = ({monthly, topic, onStart, onResume, onStartFresh, inProgressMap, attempts, leaderboardMap, onViewSolution, onViewAnalysis, dk, wm}) => {
  const [tab, setTab] = useState('monthly');
  const [syllabusTest, setSyllabusTest] = useState(null);
  const listRef = useRef(null);
  
  const handleTabChange = (newTab) => {
    if (tab === newTab) return;
    setTab(newTab);
    // Instant 0ms reset (strictly no visible scrolling animation)
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
    const mainScroll = document.querySelector('.main-scroll');
    if (mainScroll) {
      mainScroll.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
    const mainScroll = document.querySelector('.main-scroll');
    if (mainScroll) {
      mainScroll.scrollTop = 0;
    }
  }, [tab]);

  const tests = tab === 'monthly' ? monthly : topic;
  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';
  const borderCol = dk ? 'border-slate-700' : 'border-slate-200';
  const cats = (window.caConfig && window.caConfig.categories) || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Segmented Controller (Tab Switcher) */}
      <div className="flex justify-center mb-6">
        <div className={`p-1.5 rounded-2xl flex items-center max-w-md w-full border relative transition-colors duration-300 ${dk ? 'bg-slate-900 border-slate-800' : wm ? 'bg-[#f4efe0] border-[#e0d5b0]' : 'bg-slate-100 border-slate-200'}`}>
          {/* Animated Sliding Background Pill */}
          <div 
            className={`absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300 ease-out shadow-sm
              ${tab === 'monthly' ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[calc(50%+3px)] w-[calc(50%-6px)]'}
              ${dk 
                ? 'bg-violet-600 shadow-violet-900/50' 
                : wm 
                  ? 'bg-amber-600 shadow-amber-900/20' 
                  : 'bg-white shadow-slate-200'}`}
          />

          {/* Tab Button 1 */}
          <button 
            onClick={() => handleTabChange('monthly')}
            className={`relative z-10 flex-grow py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 outline-none focus:outline-none hover:scale-[1.02] active:scale-[0.98]
              ${tab === 'monthly' 
                ? (dk || wm ? 'text-white' : 'text-violet-700 font-extrabold') 
                : dk 
                  ? 'text-slate-400 hover:text-slate-250' 
                  : wm 
                    ? 'text-[#6e5d4f] hover:text-[#4a3b32]' 
                    : 'text-slate-500 hover:text-slate-800'}`}
          >
            <i className={`fa-solid fa-calendar-days text-xs ${tab === 'monthly' ? (dk || wm ? 'text-white' : 'text-violet-600') : dk ? 'text-violet-400' : wm ? 'text-amber-600' : 'text-violet-500'}`}></i>
            <span>{window.caConfig && (window.caConfig.mode === 'chapter' || (window.caConfig.title && window.caConfig.title.toLowerCase().includes('computer')) || (window.caConfig.month && window.caConfig.month.toLowerCase().includes('chapter'))) ? 'Chapter Mock' : 'Monthly Mock'}</span>
          </button>

          {/* Tab Button 2 */}
          <button 
            onClick={() => handleTabChange('topic')}
            className={`relative z-10 flex-grow py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 outline-none focus:outline-none hover:scale-[1.02] active:scale-[0.98]
              ${tab === 'topic' 
                ? (dk || wm ? 'text-white' : 'text-violet-700 font-extrabold') 
                : dk 
                  ? 'text-slate-400 hover:text-slate-250' 
                  : wm 
                    ? 'text-[#6e5d4f] hover:text-[#4a3b32]' 
                    : 'text-slate-500 hover:text-slate-800'}`}
          >
            <i className={`fa-solid fa-tags text-xs ${tab === 'topic' ? (dk || wm ? 'text-white' : 'text-violet-600') : dk ? 'text-violet-400' : wm ? 'text-amber-600' : 'text-violet-500'}`}></i>
            <span>Topic-wise</span>
          </button>
        </div>
      </div>

      {/* Info bar (Strictly no reset button for students) */}
      <div className={'rounded-xl px-4 py-2.5 mb-5 text-[11px] sm:text-xs font-medium ' + (dk?'bg-violet-950/40 text-violet-300 border border-violet-850':'bg-violet-50 text-violet-700 border border-violet-100')}>
        <span>
          {tab === 'monthly'
            ? (window.caConfig && (window.caConfig.mode === 'chapter' || (window.caConfig.title && window.caConfig.title.toLowerCase().includes('computer')) || (window.caConfig.month && window.caConfig.month.toLowerCase().includes('chapter')))
                ? '📅 RRB NTPC & SSC Computer Chapter 1 Mock Tests. Har set mein 25 questions standard exam pattern.'
                : '📅 RRB/SSC Important questions. Har set mein 25 questions tak mock test pattern.')
            : '🏷️ Category-wise questions. Sabhi topics ke sets detailed speed practice ke liye.'}
        </span>
      </div>

      {/* Syllabus Modal */}
      {syllabusTest && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl p-6 max-w-sm w-full border-2 shadow-2xl transition-all duration-300 animate-in zoom-in-95 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-black flex items-center gap-1.5 ${tm}`}>
                <i className="fa-solid fa-book-bookmark text-violet-500"></i> Syllabus Breakdown
              </h3>
              <button onClick={() => setSyllabusTest(null)} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${dk ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p className={`text-xs font-bold mb-3 ${tm}`}>{syllabusTest.name}</p>
            <div className="grid grid-cols-1 gap-2 mb-4 max-h-[220px] overflow-y-auto pr-1 custom-scroll">
              {cats.filter(c => c.id !== 'all').map(cat => (
                <div key={cat.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold border ${dk ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  <span className="w-5 text-center text-violet-500 text-sm">
                    <i className={cat.icon}></i>
                  </span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSyllabusTest(null)} className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95">
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {tests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📝</p>
          <p className={'text-sm font-semibold '+tm}>
            {tab === 'monthly'
              ? (window.caConfig && (window.caConfig.mode === 'chapter' || (window.caConfig.title && window.caConfig.title.toLowerCase().includes('computer'))) ? 'Koi chapter mock test nahi mila. globals.js check karein.' : 'Koi monthly test nahi. globals.js mein "RRB/SSC IMP" examTag wale questions add karein.')
              : 'Koi topic test nahi. Har category mein 5+ questions add karein.'}
          </p>
        </div>
      ) : (
        <div ref={listRef} key={tab} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scroll">
          {tests.map((t, i) => {
            const rawAttemptList = (attempts && attempts[t.id]) 
              || (attempts && attempts[t.id.replace('_', '-')])
              || (attempts && attempts[t.id.replace('-', '_')])
              || (attempts && Object.keys(attempts).filter(k => k.toLowerCase() === t.id.toLowerCase() || k.replace(/[-_]/g, '') === t.id.replace(/[-_]/g, '')).map(k => attempts[k]).flat())
              || [];
            const attemptList = deduplicateAttemptList(rawAttemptList);
            const isCompleted = attemptList.length > 0;
            const latestAttempt = isCompleted ? attemptList[attemptList.length - 1] : null;
            const inProg = inProgressMap && inProgressMap[t.id];
            const isReattempt = attemptList.length > 1 && latestAttempt && latestAttempt.attemptNumber !== 1 && latestAttempt.attempt_number !== 1;

            // 🎯 Testbook Dynamic Rank & Live Supabase Leaderboard Resolution:
            const lb = (leaderboardMap && (
              leaderboardMap[t.id] || 
              leaderboardMap[t.id.replace('_', '-')] || 
              leaderboardMap[t.id.replace('-', '_')] ||
              (Object.keys(leaderboardMap).find(k => k.endsWith(t.id) || t.id.endsWith(k)) ? leaderboardMap[Object.keys(leaderboardMap).find(k => k.endsWith(t.id) || t.id.endsWith(k))] : null)
            )) || (latestAttempt && (latestAttempt.leaderboard || null));

            const totalParticipants = (lb && (Number(lb.totalParticipants) || (Array.isArray(lb.topRankers) ? lb.topRankers.length : 0)))
              || (latestAttempt && Number(latestAttempt.totalParticipants))
              || Math.max(attemptList.length, 1);

            const attemptRank = (lb && (Number(lb.userRank) || Number(lb.rank)))
              || (latestAttempt && Number(latestAttempt.userRank || latestAttempt.rank))
              || (() => {
                const myScore = Number((latestAttempt && latestAttempt.score) || 0);
                if (lb && Array.isArray(lb.topRankers) && lb.topRankers.length > 0) {
                  const higher = lb.topRankers.filter(r => Number(r.score || 0) > myScore).length;
                  return higher + 1;
                }
                if (attemptList.length <= 1) return 1;
                const higherCount = attemptList.filter(a => Number(a.score || 0) > myScore).length;
                return higherCount + 1;
              })();

            const displayTotal = Math.max(totalParticipants, attemptRank);

            const isComputerMode = window.caConfig && (
              window.caConfig.mode === 'chapter' || 
              (window.caConfig.title && window.caConfig.title.toLowerCase().includes('computer')) || 
              (window.caConfig.month && window.caConfig.month.toLowerCase().includes('chapter'))
            );

            const displayName = t.type === 'monthly'
              ? (isComputerMode
                  ? (t.name.includes('कंप्यूटर') ? t.name : `कंप्यूटर चैप्टर 1 — मॉक टेस्ट ${i + 1}`)
                  : `Current Affair — ${(window.caConfig && window.caConfig.month) || 'January'} ${(window.caConfig && window.caConfig.year) || '2026'} (${t.name})`)
              : t.name;

            // Border color based on status (Completed gets Testbook subtle emerald highlight)
            const statusBorder = inProg
              ? 'border-l-[5px] border-l-amber-500'
              : isCompleted 
              ? 'border-l-[5px] border-l-emerald-500 border-emerald-400/40 dark:border-emerald-700/50 bg-emerald-50/10 dark:bg-emerald-950/10' 
              : 'border-l-[5px] border-l-slate-350 dark:border-l-slate-700';

            const answeredCount = inProg ? (
              inProg.states 
                ? inProg.states.filter(s => s === QS.ANS || s === QS.MA || s === 'ans' || s === 'ma').length 
                : t.qs.filter((_, idx) => inProg.answers && (inProg.answers[idx] !== undefined || (t.qs[idx] && inProg.answers[t.qs[idx].id] !== undefined))).length
            ) : 0;

            return (
              <div key={t.id} className={`border-2 border-r-2 border-t-2 border-b-2 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all ${card} ${statusBorder}`}>
                <div className="flex-1 min-w-0">
                  {/* Top row: CT badge + In Progress / Attempt Badges */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${dk ? 'bg-violet-950/60 text-violet-400 border border-violet-800/60' : 'bg-violet-100 text-violet-700 border border-violet-200'}`}>
                      CT {i+1}
                    </span>
                    {inProg ? (
                      <span className="text-[9.5px] sm:text-xs px-2.5 py-0.5 rounded-lg font-black flex items-center gap-1 shadow-sm bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/40 animate-pulse">
                        <i className="fa-solid fa-hourglass-half text-[10px]"></i> In Progress ({answeredCount}/{t.qs.length} Qs • {fmt(inProg.secs)} left)
                      </span>
                    ) : isCompleted && latestAttempt ? (
                      <React.Fragment>
                        <span className={`text-[9.5px] sm:text-xs px-2.5 py-0.5 rounded-lg font-black flex items-center gap-1 shadow-sm ${latestAttempt.score >= (latestAttempt.max || 1) * 0.7 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'}`}>
                          <i className={`fa-solid ${isReattempt ? 'fa-rotate-right text-indigo-500' : 'fa-circle-check text-emerald-500'} text-[10px]`}></i>
                          {isReattempt ? 'Re-attempted' : 'Completed'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 select-none">
                          <i className="fa-solid fa-layer-group text-[9px]"></i> {isReattempt ? `Attempt ${attemptList.length}` : '1 Attempt'}
                        </span>
                      </React.Fragment>
                    ) : null}
                  </div>

                  {/* Title */}
                  <p className={`text-sm sm:text-base font-extrabold mb-1.5 leading-tight ${tm}`}>
                    {displayName}
                  </p>

                  {/* 📊 Testbook-Style Rank, Marks & Visual Score Progress Line */}
                  {isCompleted && latestAttempt ? (
                    <div className="space-y-1.5 mb-2.5">
                      <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold flex-wrap">
                        {displayTotal >= 5 ? (
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1 font-bold">
                            <i className="fa-solid fa-user-group text-slate-400 text-[11px]"></i> #{attemptRank}/{displayTotal} Rank
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-extrabold bg-amber-500/10 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-300/40 dark:border-amber-800">
                            <i className="fa-solid fa-lock text-[10px]"></i> Rank: Locked (Unlocks at 5 • {displayTotal}/5 Completed)
                          </span>
                        )}
                        <span className={ts}>•</span>
                        <span className="text-slate-700 dark:text-slate-200 font-black flex items-center gap-1">
                          <i className="fa-solid fa-bullseye text-emerald-600 dark:text-emerald-400 text-[11px]"></i> {latestAttempt.score}/{latestAttempt.max} Marks
                        </span>
                        <span className={ts}>•</span>
                        <span className={`font-black ${latestAttempt.acc >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                          {latestAttempt.acc}% Acc
                        </span>
                      </div>
                      {/* Testbook Score Progress Line */}
                      <div className="w-full max-w-xs sm:max-w-sm h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${latestAttempt.score >= (latestAttempt.max || 1) * 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, Math.max(0, (latestAttempt.score / (latestAttempt.max || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Stats icons row for unattempted */
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-xs">
                      <span className={`flex items-center gap-1 font-bold ${ts}`}>
                        <i className="fa-solid fa-clipboard-list text-[13px] text-violet-500"></i> {t.qs.length} Questions
                      </span>
                      <span className={`flex items-center gap-1 font-bold ${ts}`}>
                        <i className="fa-regular fa-file-lines text-[13px] text-violet-500"></i> {t.qs.length * t.mark} Marks
                      </span>
                      <span className={`flex items-center gap-1 font-bold ${ts}`}>
                        <i className="fa-regular fa-clock text-[13px] text-violet-500"></i> {t.mins} Mins
                      </span>
                    </div>
                  )}

                  {/* Footer Row: Attempted Date | Reattempt | Syllabus | Language | Share */}
                  <div className={`flex items-center justify-between gap-2 sm:gap-3 flex-wrap text-[10.5px] sm:text-[11px] font-extrabold pt-2 sm:pt-2.5 border-t ${borderCol}`}>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {isCompleted && latestAttempt && (
                        <React.Fragment>
                          <span className="text-slate-500 dark:text-slate-400 font-bold">
                            {formatAttemptStatus(latestAttempt, attemptList)}
                          </span>
                          <button onClick={() => onStart(t)} className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline font-black flex items-center gap-1 cursor-pointer">
                            <i className="fa-solid fa-rotate-right text-[10px]"></i> Reattempt ➔
                          </button>
                          <span className={ts}>|</span>
                        </React.Fragment>
                      )}
                      {inProg && (
                        <React.Fragment>
                          <button onClick={() => onStartFresh(t)} className="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer">
                            <i className="fa-solid fa-rotate-left text-[10px]"></i> Start Fresh (शुरू से दें)
                          </button>
                          <span className={ts}>|</span>
                        </React.Fragment>
                      )}
                      <button onClick={() => setSyllabusTest(t)} className="text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-0.5 cursor-pointer">
                        Syllabus
                      </button>
                      <span className={ts}>|</span>
                      <span className={ts}><i className="fa-solid fa-globe"></i> Hindi</span>
                    </div>
                    <button 
                      onClick={() => { if (window.dispatchEvent) window.dispatchEvent(new CustomEvent('ca_open_share', { detail: t })); }} 
                      className="text-slate-400 hover:text-violet-500 flex items-center gap-1 text-[10.5px] cursor-pointer"
                    >
                      <i className="fa-solid fa-share-nodes"></i> Share
                    </button>
                  </div>
                </div>

                {/* Right side buttons (Testbook Exact: Side-by-Side Solution & Analysis) */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                  {inProg ? (
                    <button onClick={() => onResume(t)}
                      className="flex-grow sm:flex-none w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-600 hover:to-violet-700 text-white text-xs font-black transition-all active:scale-95 shadow-[0_4px_12px_rgba(245,158,11,0.35)] text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-play text-xs"></i>
                      <span>Resume Test</span>
                    </button>
                  ) : isCompleted ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={() => onViewSolution(t)}
                        className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 border-2 text-center cursor-pointer shadow-xs ${
                          dk 
                            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-violet-500' 
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-violet-500'
                        }`}
                      >
                        Solution
                      </button>
                      <button onClick={() => onViewAnalysis(t)}
                        className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 border-2 text-center cursor-pointer shadow-xs ${
                          dk 
                            ? 'border-cyan-600 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/40' 
                            : 'border-cyan-500 bg-cyan-50/70 text-cyan-700 hover:bg-cyan-100/80'
                        }`}
                      >
                        Analysis
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => onStart(t)}
                      className="flex-grow sm:flex-none w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black transition-all active:scale-95 shadow-[0_4px_12px_rgba(124,58,237,0.25)] text-center flex items-center justify-center gap-1.5 cursor-pointer">
                      <i className="fa-solid fa-play text-xs"></i>
                      <span>Start Now</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.TestSelector = TestSelector;
}
