// MockTest.js — Exam-Style Mock Test (RRB/SSC Pattern)
// Reads config from window.caConfig.mockConfig

// ── States ──
const QS = { NV:'nv', NA:'na', ANS:'ans', MRK:'mrk', MA:'ma' };

// ── Date Formatting Helpers ──
const isToday = (ts) => {
  if (!ts) return false;
  const d = new Date(ts);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

const fmtDateText = (ts) => {
  if (!ts) return "recently";
  const d = new Date(ts);
  const today = new Date();
  if (d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()) {
    return "Today";
  }
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return "on " + d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
};

const fmtDateOnly = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
};

// ── Palette Colors ──
const palColor = (s, dk) => {
  if (s===QS.ANS) return { bg: dk?'#052e16':'#dcfce7', fg: dk?'#4ade80':'#16a34a', br: dk?'#166534':'#86efac' };
  if (s===QS.NA)  return { bg: dk?'#450a0a':'#fee2e2', fg: dk?'#f87171':'#dc2626', br: dk?'#7f1d1d':'#fca5a5' };
  if (s===QS.MRK) return { bg: dk?'#3b0764':'#fdf4ff', fg: dk?'#d946ef':'#a21caf', br: dk?'#7e22ce':'#d946ef' };
  if (s===QS.MA)  return { bg:'#7c3aed', fg:'#ffffff', br:'#6d28d9' };
  return { bg: dk?'#1e293b':'#f1f5f9', fg: dk?'#64748b':'#94a3b8', br: dk?'#334155':'#e2e8f0' };
};

// ── Format Time ──
const fmt = s => {
  const t = Math.max(0,s);
  return String(Math.floor(t/60)).padStart(2,'0') + ':' + String(t%60).padStart(2,'0');
};

// ── Shuffle ──
const shuf = arr => [...arr].sort(()=>Math.random()-0.5);

// ── Build 4 options for a question ──
const makeOpts = (q, allQs) => {
  const others = shuf([...new Set(allQs.map(x=>x.answer))].filter(a=>a!==q.answer)).slice(0,3);
  return shuf([...others, q.answer]);
};

// ── Build monthly sets ──
const buildMonthly = (qs, mc) => {
  const tag = mc.monthlyExamTag || 'RRB/SSC IMP';
  const per = mc.questionsPerSet || 25;
  const min = mc.minQuestionsForTopicTest || 5;
  const fil = qs.filter(q => q.examTag === tag);
  if (fil.length < min) return [];
  const rom = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  return fil.reduce((acc, q, i) => {
    const si = Math.floor(i/per);
    if (!acc[si]) acc[si] = [];
    acc[si].push(q);
    return acc;
  }, []).map((chunk, i) => ({
    id: 'mt_'+i,
    name: 'Mock Test - ' + (rom[i]||i+1),
    type: 'monthly',
    qs: chunk.map(q => ({...q, opts: makeOpts(q, qs)})),
    mins: Math.ceil(chunk.length * (mc.monthlyTimeMinutes || 15) / (mc.questionsPerSet || 25)),
    mark: mc.marksPerCorrect || 1,
    neg: mc.negativeMarking || 0.33,
  }));
};

// ── Build topic sets ──
const buildTopic = (qs, cats, mc) => {
  const min = mc.minQuestionsForTopicTest || 5;
  const tpq = mc.topicTimePerQuestion || 0.75;
  const mint = mc.topicMinTime || 5;
  return cats.filter(c=>c.id!=='all').map(cat => {
    const cqs = qs.filter(q=>q.category===cat.id);
    if (cqs.length < min) return null;
    return {
      id: 'tp_'+cat.id,
      name: cat.icon+' '+cat.label,
      type: 'topic',
      qs: cqs.map(q => ({...q, opts: makeOpts(q, qs)})),
      mins: Math.max(mint, Math.ceil(cqs.length*tpq)),
      mark: mc.marksPerCorrect || 1,
      neg: mc.negativeMarking || 0.33,
    };
  }).filter(Boolean);
};

// ════════════════════════════════════════════════════════
//  Palette Grid
// ════════════════════════════════════════════════════════
const PaletteGrid = ({states, cur, onJump, dk}) => {
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px'}}>
      {states.map((s,i) => {
        const pc = palColor(s,dk);
        const active = i===cur;
        return (
          <button key={i} onClick={()=>onJump(i)}
            style={{
              background: pc.bg,
              color: pc.fg,
              border: active ? '2px solid #7c3aed' : '2px solid '+pc.br,
              boxShadow: active ? '0 0 0 2px rgba(124,58,237,0.4)' : 'none',
              transform: active ? 'scale(1.1)' : 'scale(1)',
              width:'34px', height:'34px', borderRadius:'6px',
              fontWeight:'bold', fontSize:'11px', cursor:'pointer',
              transition:'all 0.15s'
            }}>
            {s===QS.MA ? '✓' : i+1}
          </button>
        );
      })}
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  SCREEN 1: Test Selection
// ════════════════════════════════════════════════════════
const TestSelector = ({monthly, topic, onStart, attempts, onViewSolution, onViewAnalysis, dk, wm}) => {
  const [tab, setTab] = useState('monthly');
  const [syllabusTest, setSyllabusTest] = useState(null);
  
  const tests = tab === 'monthly' ? monthly : topic;
  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';
  const borderCol = dk ? 'border-slate-700' : 'border-slate-200';
  const cats = (window.caConfig && window.caConfig.categories) || [];

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto pb-16 sm:pb-4">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-6">
        <div className={`relative flex w-full max-w-[320px] p-1 rounded-2xl border transition-all duration-300
          ${dk 
            ? 'bg-slate-900 border-slate-800' 
            : wm 
              ? 'bg-[#f4efe2] border-[#e6dcbe]' 
              : 'bg-slate-100/80 border-slate-200/50'}`}
        >
          {/* Sliding Indicator Background Pill */}
          <div 
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out
              ${dk 
                ? 'bg-violet-600 shadow-[0_4px_12px_rgba(109,40,217,0.35)]' 
                : wm 
                  ? 'bg-amber-600 shadow-[0_4px_12px_rgba(217,119,6,0.25)]' 
                  : 'bg-white shadow-[0_4px_12px_rgba(124,58,237,0.12)] border border-slate-250/10'}`}
            style={{
              transform: tab === 'monthly' ? 'translateX(0)' : 'translateX(100%)',
            }}
          />

          {/* Tab Button 1 */}
          <button 
            onClick={() => setTab('monthly')}
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
            <span>Monthly Mock</span>
          </button>

          {/* Tab Button 2 */}
          <button 
            onClick={() => setTab('topic')}
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

      {/* Info bar */}
      <div className={'rounded-xl px-4 py-2.5 mb-5 text-[11px] sm:text-xs font-medium ' + (dk?'bg-violet-950/40 text-violet-300 border border-violet-850':'bg-violet-50 text-violet-700 border border-violet-100')}>
        {tab === 'monthly'
          ? '📅 RRB/SSC Important questions. Har set mein 25 questions tak mock test pattern.'
          : '🏷️ Category-wise questions. Sabhi topics ke sets detailed speed practice ke liye.'}
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
            <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto pr-1">
              {Object.entries(
                syllabusTest.qs.reduce((acc, q) => {
                  const cat = cats.find(c => c.id === q.category);
                  const label = cat ? cat.label : 'General';
                  const icon = cat ? cat.icon : '📌';
                  if (!acc[label]) acc[label] = { count: 0, icon };
                  acc[label].count++;
                  return acc;
                }, {})
              ).map(([label, info]) => (
                <div key={label} className={`flex items-center justify-between p-2 rounded-xl text-xs border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                  <span className={tm}>{info.icon} {label}</span>
                  <span className={`font-black ${dk ? 'text-violet-400' : 'text-violet-600'}`}>{info.count} Questions</span>
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
              ? 'Koi monthly test nahi. globals.js mein "RRB/SSC IMP" examTag wale questions add karein.'
              : 'Koi topic test nahi. Har category mein 5+ questions add karein.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((t, i) => {
            const attemptList = attempts[t.id] || [];
            const isCompleted = attemptList.length > 0;
            const latestAttempt = isCompleted ? attemptList[attemptList.length - 1] : null;
            const isAttemptedToday = latestAttempt && isToday(latestAttempt.timestamp);

            const displayName = t.type === 'monthly' 
              ? `Current Affair — ${(window.caConfig && window.caConfig.month) || 'January'} ${(window.caConfig && window.caConfig.year) || '2026'} (${t.name})` 
              : t.name;

            // Border color based on status
            const statusBorder = isCompleted 
              ? 'border-l-[5px] border-l-violet-600' 
              : 'border-l-[5px] border-l-slate-350 dark:border-l-slate-700';

            return (
              <div key={t.id} className={`border-2 border-r-2 border-t-2 border-b-2 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all ${card} ${statusBorder}`}>
                <div className="flex-1 min-w-0">
                  {/* Top row: CT badge + Attempt Status */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${dk ? 'text-violet-400' : 'text-violet-600'}`}>
                      CT {i+1}
                    </span>
                    {isCompleted && (
                      isAttemptedToday ? (
                        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1 select-none">
                          <i className="fa-solid fa-calendar-check text-[10px]"></i> Attempted Today
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-750 dark:text-violet-400 font-extrabold flex items-center gap-1 select-none">
                          <i className="fa-solid fa-circle-check text-[10px]"></i> Attempted on {fmtDateOnly(latestAttempt.timestamp)}
                        </span>
                      )
                    )}
                  </div>

                  {/* Title */}
                  <p className={`text-sm sm:text-base font-extrabold mb-2 leading-tight ${tm}`}>
                    {displayName}
                  </p>

                  {/* Stats icons row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-xs">
                    <span className={`flex items-center gap-1 font-bold ${ts}`}>
                      <i className="fa-regular fa-circle-question text-[13px] text-violet-500"></i> {t.qs.length} Questions
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${ts}`}>
                      <i className="fa-regular fa-file-lines text-[13px] text-violet-500"></i> {t.qs.length * t.mark} Marks
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${ts}`}>
                      <i className="fa-regular fa-clock text-[13px] text-violet-500"></i> {t.mins} Mins
                    </span>
                  </div>

                  {/* Footer Row: Syllabus | Language | Score */}
                  <div className={`flex items-center gap-3 flex-wrap text-[11px] font-extrabold pt-2.5 border-t ${borderCol}`}>
                    <button onClick={() => setSyllabusTest(t)} className="text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-0.5">
                      Syllabus
                    </button>
                    <span className={ts}>|</span>
                    <span className={ts}>🌐 English, Hindi</span>
                    {isCompleted && (
                      <>
                        <span className={ts}>|</span>
                        <span className="text-green-600 flex items-center gap-1">
                          Latest Score: {latestAttempt.score}/{latestAttempt.max} Marks ({latestAttempt.acc}% Acc)
                        </span>
                        <span className={ts}>|</span>
                        <button onClick={() => onStart(t)} className="text-violet-600 hover:text-violet-700 hover:underline">
                          Reattempt ➔
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side buttons */}
                <div className="flex sm:flex-col justify-end gap-2.5 min-w-[120px] sm:self-center">
                  {isCompleted ? (
                    <>
                      <button onClick={() => onViewSolution(t)}
                        className={`flex-grow sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 border-2 text-center ${
                          dk 
                            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-violet-650' 
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-violet-500'
                        }`}>
                        Solution
                      </button>
                      <button onClick={() => onViewAnalysis(t)}
                        className={`flex-grow sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 border-2 text-center ${
                          dk 
                            ? 'border-violet-650 bg-violet-950/25 text-violet-400 hover:bg-violet-950/40' 
                            : 'border-violet-250 bg-violet-50/50 text-violet-700 hover:bg-violet-50'
                        }`}>
                        Analysis
                      </button>
                    </>
                  ) : (
                    <button onClick={() => onStart(t)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl transition-all active:scale-95 text-center shadow-md shadow-violet-600/15">
                      Start Now
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

// ════════════════════════════════════════════════════════
//  SCREEN 2: Instructions
// ════════════════════════════════════════════════════════
const Instructions = ({test, onBegin, onBack, dk, wm}) => {
  const [ok, setOk] = useState(false);
  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';
  const rules = [
    'Is test mein '+test.qs.length+' questions hain.',
    'Har question ke 4 options hain — sirf 1 sahi hai.',
    'Test '+test.mins+' minutes mein complete karna hai.',
    'Sahi jawab: +'+test.mark+' mark milega.',
    'Galat jawab: -'+test.neg+' mark katega (Negative Marking).',
    'Na attempt kiye questions ka koi penalty nahi.',
    '"Mark for Review" se questions flag kar sakte ho.',
    'Timer 0 hone par test auto-submit ho jaayega.',
  ];
  const legend = [
    [QS.NV,'Not Visited'],
    [QS.NA,'Not Answered'],
    [QS.ANS,'Answered'],
    [QS.MRK,'Marked for Review'],
    [QS.MA,'Marked + Answered'],
  ];

  return (
    <div className="p-2 sm:p-4 max-w-xl mx-auto flex flex-col justify-between h-full min-h-0">
      {/* Title & Basic Stats */}
      <div className={'border-2 rounded-xl p-2.5 mb-2 flex items-center justify-between gap-3 '+card}>
        <div>
          <h2 className={'text-sm sm:text-base font-black '+tm}>{test.name}</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={'text-[11px] sm:text-xs font-bold '+ts}>⏱ {test.mins} Min</span>
          <span className={'text-[11px] sm:text-xs font-bold '+ts}>📊 Max: {test.qs.length * test.mark} Marks</span>
          <span className="text-[11px] sm:text-xs text-rose-500 font-bold">❌ -{test.neg}/w</span>
        </div>
      </div>

      {/* Instructions list */}
      <div className={'border-2 rounded-xl p-3 mb-2 flex-1 min-h-0 overflow-y-auto '+card}>
        <p className={'text-[10px] font-black uppercase tracking-wider mb-2 '+(dk?'text-violet-400':'text-violet-605')}>निर्देश / Instructions</p>
        <ol className="space-y-1">
          {rules.map((r,i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className={'flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold '+(dk?'bg-slate-700 text-violet-400':'bg-violet-50 text-violet-600')}>{i+1}</span>
              <span className={'text-[11px] sm:text-xs leading-normal '+ts}>{r}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Palette Legend */}
      <div className={'border-2 rounded-xl p-3 mb-2 '+card}>
        <p className={'text-[10px] font-black uppercase tracking-wider mb-2 '+ts}>Question Palette Colors</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {legend.map(([s,lbl]) => {
            const pc = palColor(s,dk);
            return (
              <div key={s} className="flex items-center gap-2">
                <div style={{width:'22px',height:'22px',background:pc.bg,color:pc.fg,border:'1.5px solid '+pc.br,borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'bold',flexShrink:0}}>
                  {s===QS.MA?'✓':'1'}
                </div>
                <span className={'text-[10px] leading-none '+ts}>{lbl}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkbox and Buttons */}
      <div className="flex-shrink-0">
        <label className="flex items-center gap-2 cursor-pointer mb-2.5 select-none">
          <input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)} className="w-4 h-4 accent-violet-600 cursor-pointer"/>
          <span className={'text-xs font-semibold '+ts}>मैंने सभी निर्देश पढ़ और समझ लिए हैं।</span>
        </label>
        <div className="flex gap-3">
          <button onClick={onBack}
            className={'px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all active:scale-95 '+(dk?'border-slate-700 text-slate-400 bg-slate-800':'border-slate-200 text-slate-500 bg-white')}>
            ← Back
          </button>
          <button onClick={onBegin} disabled={!ok}
            className={'flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all active:scale-95 '+(ok?'bg-violet-600 hover:bg-violet-700 text-white':(dk?'bg-slate-800 text-slate-600 cursor-not-allowed':'bg-slate-100 text-slate-355 cursor-not-allowed'))}>
            I am ready to begin →
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  SCREEN 3: Live Test
// ════════════════════════════════════════════════════════
const LiveTest = ({test, dk, wm, onFinish, addMistake}) => {
  const N = test.qs.length;
  const totalSecs = test.mins * 60;

  const [cq, setCq] = useState(0);
  const [states, setStates] = useState(() => Array(N).fill(QS.NV));
  const [answers, setAnswers] = useState(() => Array(N).fill(null));
  const [secs, setSecs] = useState(totalSecs);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [showPal, setShowPal] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showLast, setShowLast] = useState(false);

  const stRef = useRef(states);
  const anRef = useRef(answers);
  const secRef = useRef(secs);
  useEffect(() => { stRef.current = states; }, [states]);
  useEffect(() => { anRef.current = answers; }, [answers]);
  useEffect(() => { secRef.current = secs; }, [secs]);

  // Mark visited
  useEffect(() => {
    setStates(prev => {
      if (prev[cq] !== QS.NV) return prev;
      const n = [...prev]; n[cq] = QS.NA; return n;
    });
  }, [cq]);

  // Submit function
  const doSubmit = (st, an, timeLeft) => {
    let ok=0, bad=0, skip=0;
    const wrong = [];
    test.qs.forEach((q,i) => {
      const att = st[i]===QS.ANS || st[i]===QS.MA;
      if (!att || !an[i]) { skip++; return; }
      if (an[i]===q.answer) ok++;
      else { bad++; wrong.push(q); }
    });
    wrong.forEach(q => addMistake && addMistake(q));
    const score = Math.max(0, Math.round((ok - bad*test.neg)*100)/100);
    const att = ok+bad;
    onFinish({ test, answers: an, correct:ok, wrong:bad, skip, score, max:N, acc: att>0?Math.round(ok/att*100):0, att, taken: totalSecs-timeLeft });
  };

  // Timer
  useEffect(() => {
    if (paused || done) return;
    if (secs <= 0) { setDone(true); return; }
    const id = setInterval(() => setSecs(t => {
      if (t <= 1) { setDone(true); return 0; }
      return t-1;
    }), 1000);
    return () => clearInterval(id);
  }, [paused, done, secs]);

  // Auto-submit on done
  useEffect(() => {
    if (done) doSubmit(stRef.current, anRef.current, secRef.current);
  }, [done]);

  const q = test.qs[cq];
  const aCnt = states.filter(s=>s===QS.ANS||s===QS.MA).length;
  const mCnt = states.filter(s=>s===QS.MRK||s===QS.MA).length;
  const naCnt = states.filter(s=>s===QS.NA).length;
  const nvCnt = states.filter(s=>s===QS.NV).length;
  const crit = secs < 120;

  const hdr = dk ? 'bg-slate-900 border-slate-800' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const sbg = dk ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const mbg = dk ? 'bg-slate-900' : wm ? 'bg-[#f5f0e0]' : 'bg-slate-100';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';

  const optClass = (opt) => {
    const sel = answers[cq]===opt;
    if (sel) return 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-95 ' + (dk ? 'border-violet-500 bg-violet-950/40 text-violet-300' : 'border-violet-500 bg-violet-50/50 text-violet-700');
    if (dk) return 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-95 border-slate-700 bg-slate-800 text-slate-205 hover:border-violet-500';
    return 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-95 border-slate-200 bg-white text-slate-700 hover:border-violet-300';
  };

  const circClass = (opt) => {
    const sel = answers[cq]===opt;
    if (sel) return 'w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 border-violet-500 bg-violet-600 text-white';
    if (dk) return 'w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 border-slate-600 text-slate-400';
    return 'w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 border-slate-300 text-slate-400';
  };

  const selectOpt = opt => setAnswers(prev => { const n=[...prev]; n[cq]=opt; return n; });
  const clearResp = () => {
    setAnswers(prev => { const n=[...prev]; n[cq]=null; return n; });
    setStates(prev => {
      const n=[...prev];
      if (n[cq]===QS.MA) n[cq]=QS.MRK;
      else if (n[cq]===QS.ANS) n[cq]=QS.NA;
      return n;
    });
  };
  const saveNext = () => {
    setStates(prev => { const n=[...prev]; n[cq]=answers[cq]!==null?QS.ANS:QS.NA; return n; });
    if (cq===N-1) setShowLast(true);
    else setCq(q=>q+1);
  };
  const markNext = () => {
    setStates(prev => { const n=[...prev]; n[cq]=answers[cq]!==null?QS.MA:QS.MRK; return n; });
    if (cq<N-1) setCq(q=>q+1);
  };
  const jumpTo = i => { setCq(i); setShowPal(false); };

  return (
    <div className={mbg} style={{display:'flex',flexDirection:'column',height:'105%'}} className="h-full">

      {/* Header */}
      <div className={'flex-shrink-0 border-b w-full ' + hdr}>
        <div className="max-w-7xl mx-auto w-full hidden sm:flex items-center px-4 py-2.5 gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={'text-[11px] font-semibold uppercase tracking-wider '+ts}>Section</span>
            <span className="bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded">Test</span>
          </div>
          <p className={'flex-1 text-center text-sm font-bold truncate '+tm}>{test.name}</p>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={'text-sm font-black tabular-nums '+(crit?'text-red-500 exam-timer-pulse':tm)}>Time Left: {fmt(secs)}</span>
            <button onClick={()=>setPaused(p=>!p)}
              className={'px-3 py-1 text-[11px] font-bold rounded-lg border transition-all '+(dk?'border-slate-700 text-slate-300 bg-slate-800':'border-slate-200 text-slate-600 bg-white')}>
              {paused?'▶ Resume':'⏸ Pause'}
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full flex sm:hidden items-center px-3 py-2 gap-2">
          <p className={'flex-1 text-[11px] font-bold truncate '+tm}>{test.name}</p>
          <span className={'text-sm font-black tabular-nums flex-shrink-0 '+(crit?'text-red-500':tm)}>{fmt(secs)}</span>
          <button onClick={()=>setPaused(p=>!p)}
            className={'w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 '+(dk?'bg-slate-800 text-slate-300':'bg-slate-100 text-slate-605')}>
            {paused?'▶':'⏸'}
          </button>
        </div>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={'rounded-2xl p-8 text-center max-w-xs w-full border-2 '+card}>
            <span className="text-5xl">⏸</span>
            <h3 className={'text-xl font-black mt-4 mb-2 '+tm}>Test Paused</h3>
            <p className={'text-sm mb-5 '+ts}>Timer ruka hua hai.</p>
            <button onClick={()=>setPaused(false)} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl">
              ▶ Resume Test
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex overflow-hidden border-x border-slate-100 dark:border-slate-800/20">

        {/* Question area */}
        <div style={{flex:1, overflowY:'auto'}}>
          <div className="p-3 sm:p-5 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className={'text-xs font-semibold '+ts}>
                Question No. <strong className={tm}>{cq+1}</strong> / {N}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700">+{test.mark}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">-{test.neg}</span>
              </div>
            </div>

            <div className={'border-2 rounded-xl p-4 sm:p-5 mb-3 '+card}>
              <p className={'text-sm sm:text-base font-bold leading-relaxed '+tm}>
                <span className={'font-black mr-2 '+ts}>Q{cq+1}.</span>
                {q.question}
              </p>
            </div>

            <div className="space-y-2.5">
              {(q.opts||[]).map((opt,i) => (
                <button key={i} onClick={()=>selectOpt(opt)} className={optClass(opt)}>
                  <span className={circClass(opt)}>{String.fromCharCode(65+i)}</span>
                  <span className="flex-1">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop sidebar palette */}
        <div className={'hidden sm:flex flex-col w-56 border-l flex-shrink-0 overflow-y-auto '+sbg}>
          <div className={'p-3 border-b '+(dk?'border-slate-800':'border-slate-200')}>
            {[[QS.ANS,'Answered',aCnt],[QS.MRK,'Marked',mCnt],[QS.NV,'Not Visited',nvCnt],[QS.NA,'Not Answered',naCnt]].map(([s,lbl,cnt]) => {
              const pc = palColor(s,dk);
              return (
                <div key={s} className="flex items-center gap-1.5 mb-1.5">
                  <div style={{width:'20px',height:'20px',background:pc.bg,color:pc.fg,border:'2px solid '+pc.br,borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'bold',flexShrink:0}}>{cnt}</div>
                  <span className={'text-[10px] '+ts}>{lbl}</span>
                </div>
              );
            })}
          </div>
          <div className={'px-3 py-2 border-b text-[10px] font-black uppercase tracking-widest '+(dk?'text-slate-500 border-slate-800':'text-slate-400 border-slate-200')}>SECTION: Test</div>
          <div className="p-3 flex-1">
            <PaletteGrid states={states} cur={cq} onJump={jumpTo} dk={dk} />
          </div>
          <div className={'p-3 border-t '+(dk?'border-slate-800':'border-slate-200')}>
            <button onClick={()=>setShowSub(true)} className="w-full py-2.5 text-xs font-black rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-all active:scale-95">
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className={'flex-shrink-0 border-t w-full ' + hdr}>
        <div className="max-w-7xl mx-auto w-full px-3 py-2.5 flex items-center gap-2">
          <button onClick={()=>setShowPal(true)}
            className="sm:hidden flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-violet-100 text-violet-705 text-sm font-black">
            📋
          </button>
          <button onClick={markNext}
            className={'flex-1 min-w-0 px-2 py-2 text-[10px] sm:text-[11px] font-bold rounded-xl border-2 transition-all active:scale-95 '+(dk?'border-fuchsia-805 bg-fuchsia-950/30 text-fuchsia-405':'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700')}>
            🚩 Mark & Next
          </button>
          <button onClick={clearResp}
            className={'flex-shrink-0 px-3 py-2 text-[11px] font-bold rounded-xl border-2 transition-all active:scale-95 '+(dk?'border-slate-705 text-slate-400':'border-slate-200 text-slate-500')}>
            Clear
          </button>
          <button onClick={saveNext}
            className="flex-shrink-0 px-4 py-2 text-xs font-black rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all active:scale-95">
            Save & Next →
          </button>
          <button onClick={()=>setShowSub(true)}
            className="hidden sm:flex flex-shrink-0 px-3 py-2 text-[11px] font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-95">
            Submit
          </button>
        </div>
      </div>

      {/* Mobile palette drawer */}
      {showPal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowPal(false)} />
          <div className={'relative rounded-t-2xl p-4 max-h-[65vh] overflow-y-auto '+(dk?'bg-slate-900':'bg-white')}>
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <p className={'text-xs font-black uppercase tracking-widest '+ts}>Question Palette</p>
              <button onClick={()=>setShowPal(false)} className={'text-xs font-bold '+ts}>✕ Close</button>
            </div>
            <PaletteGrid states={states} cur={cq} onJump={jumpTo} dk={dk} />
            <button onClick={()=>{setShowPal(false);setShowSub(true);}}
              className="w-full mt-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-xl active:scale-95">
              Submit Test
            </button>
          </div>
        </div>
      )}

      {/* Last Q dialog */}
      {showLast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={'rounded-2xl p-6 max-w-xs w-full border-2 '+card}>
            <p className={'text-sm mb-5 leading-relaxed '+tm}>Last question reach ho gaye. First question pe jaana chahoge?</p>
            <div className="flex gap-3">
              <button onClick={()=>{setShowLast(false);setShowSub(true);}}
                className={'flex-1 py-2.5 text-sm font-bold rounded-xl border-2 '+(dk?'border-slate-700 text-slate-300':'border-slate-200 text-slate-600')}>
                No
              </button>
              <button onClick={()=>{setShowLast(false);setCq(0);}}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit confirmation */}
      {showSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={'rounded-2xl p-5 w-full max-w-md border-2 '+card}>
            <p className={'text-sm font-bold text-center mb-4 '+ts}>Test Submit karo?</p>
            <div className={'rounded-xl overflow-hidden border mb-4 '+(dk?'border-slate-700':'border-slate-200')}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="p-2 text-left font-bold">Section</th>
                    <th className="p-2 text-center font-bold">Total</th>
                    <th className="p-2 text-center font-bold">Ans</th>
                    <th className="p-2 text-center font-bold">Not Ans</th>
                    <th className="p-2 text-center font-bold">Marked</th>
                    <th className="p-2 text-center font-bold">Not Visited</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={dk?'bg-slate-800 text-slate-200':'bg-slate-50 text-slate-700'}>
                    <td className="p-2 font-semibold">Test</td>
                    <td className="p-2 text-center font-bold">{N}</td>
                    <td className="p-2 text-center font-bold text-green-500">{aCnt}</td>
                    <td className="p-2 text-center font-bold text-red-500">{naCnt}</td>
                    <td className="p-2 text-center font-bold text-purple-500">{mCnt}</td>
                    <td className="p-2 text-center font-bold">{nvCnt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setShowSub(false)}
                className={'flex-1 py-2.5 text-sm font-bold rounded-xl border-2 '+(dk?'border-slate-700 text-slate-300':'border-slate-200 text-slate-600')}>
                Close
              </button>
              <button onClick={()=>doSubmit(states,answers,secs)}
                className="flex-1 py-2.5 text-sm font-black rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  SCREEN 4: Result
// ════════════════════════════════════════════════════════
const TestResult = ({res, onRetry, onBack, dk, wm}) => {
  const attemptsList = Array.isArray(res) ? res : [res];
  const [activeIdx, setActiveIdx] = useState(attemptsList.length - 1);
  const activeAttempt = attemptsList[activeIdx] || attemptsList[0] || {};

  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';
  const pct = activeAttempt.max>0 ? Math.round(activeAttempt.score/activeAttempt.max*100) : 0;
  const emoji = pct===100?'🏆':pct>=70?'🎉':pct>=40?'📚':'💪';
  const rcls = pct>=70?'text-green-500':pct>=40?'text-amber-500':'text-rose-500';

  useEffect(() => {
    if (pct===100 && typeof confetti !== 'undefined') {
      confetti({ particleCount:250, spread:90, origin:{y:0.55} });
    }
  }, [activeIdx]);

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto">
      <div className="text-center mb-5">
        <span className="text-5xl">{emoji}</span>
        <h2 className={'text-lg font-black mt-2 mb-1 '+tm}>{(activeAttempt.test && activeAttempt.test.name) || 'Mock Test'}</h2>
        <p className={'text-xs '+ts}>Test Complete!</p>
      </div>

      {/* Attempt Selector Tabs (like Testbook) */}
      {attemptsList.length > 1 && (
        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
          {attemptsList.map((att, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`px-3 py-1.5 rounded-t-xl text-xs font-black transition-all outline-none border-b-2 ${
                  isActive
                    ? 'border-b-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/10'
                    : 'border-b-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Attempt {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Attempt Time Info Bar */}
      <div className={`rounded-xl p-3 mb-4 border text-xs flex items-center gap-2 ${
        dk ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-650'
      }`}>
        <i className="fa-solid fa-circle-info text-violet-500"></i>
        <span>
          Attempt {activeIdx + 1} was made {fmtDateText(activeAttempt.timestamp)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {[
          ['🏆','Score',activeAttempt.score+'/'+activeAttempt.max, rcls],
          ['📝','Attempted',activeAttempt.att+'/'+((activeAttempt.test && activeAttempt.test.qs && activeAttempt.test.qs.length) || 0),'text-violet-500'],
          ['🎯','Accuracy',activeAttempt.acc+'%', activeAttempt.acc>=70?'text-green-500':'text-amber-500'],
          ['⏱','Time', fmt(activeAttempt.taken), 'text-teal-500'],
        ].map(([ico,lbl,val,col]) => (
          <div key={lbl} className={'border-2 rounded-xl p-3 text-center '+card}>
            <div className="text-xl mb-0.5">{ico}</div>
            <div className={'text-base sm:text-lg font-black '+col}>{val}</div>
            <div className={'text-[9px] mt-0.5 '+ts}>{lbl}</div>
          </div>
        ))}
      </div>

      <div className={'border-2 rounded-xl overflow-hidden mb-3 '+card}>
        <div className="grid grid-cols-3">
          <div className={'p-3 text-center border-r '+(dk?'border-slate-700':'border-slate-200')}>
            <div className="text-2xl font-black text-green-500">{activeAttempt.correct}</div>
            <div className={'text-[10px] mt-0.5 '+ts}>✅ Correct</div>
          </div>
          <div className={'p-3 text-center border-r '+(dk?'border-slate-700':'border-slate-200')}>
            <div className="text-2xl font-black text-rose-500">{activeAttempt.wrong}</div>
            <div className={'text-[10px] mt-0.5 '+ts}>❌ Wrong</div>
          </div>
          <div className="p-3 text-center">
            <div className={'text-2xl font-black '+ts}>{activeAttempt.skip}</div>
            <div className={'text-[10px] mt-0.5 '+ts}>⬜ Skipped</div>
          </div>
        </div>
      </div>

      {activeAttempt.wrong>0 && (
        <div className={'rounded-xl p-3 mb-3 border '+(dk?'bg-rose-950/30 border-rose-800/50':'bg-rose-50 border-rose-200')}>
          <p className={'text-xs '+(dk?'text-rose-300':'text-rose-700')}>
            ❌ <strong>{activeAttempt.wrong} galat jawab</strong> Mistake Hub mein save ho gaye!
          </p>
        </div>
      )}

      <div className={'border-2 rounded-xl p-4 mb-4 text-center '+card}>
        <p className={'text-sm font-bold '+rcls}>
          {pct===100?'🏆 Perfect! Kamaal kar diya!':pct>=70?'👍 Bahut Achha! Keep it up!':pct>=40?'📚 Theek hai! Aur practice karo.':'💪 Koshish karo! Mistake Hub check karo.'}
        </p>
        <p className={'text-xs mt-1 '+ts}>{activeAttempt.score} / {activeAttempt.max} ({pct}%)</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className={'flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-all active:scale-95 '+(dk?'border-slate-700 text-slate-300':'border-slate-200 text-slate-600')}>
          ← Tests List
        </button>
        <button onClick={onRetry}
          className="flex-1 py-2.5 text-sm font-black rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all active:scale-95">
          🔄 Retry
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  SCREEN 5: Solution Review
// ════════════════════════════════════════════════════════
const SolutionReview = ({res, onBack, dk, wm}) => {
  const attemptsList = Array.isArray(res) ? res : [res];
  const [activeIdx, setActiveIdx] = useState(attemptsList.length - 1);
  const activeAttempt = attemptsList[activeIdx] || attemptsList[0] || {};

  const card = dk ? 'bg-slate-800 border-slate-700' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';
  
  return (
    <div className="p-3 sm:p-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <button onClick={onBack} className={`text-xs font-bold flex items-center gap-1 hover:text-violet-650 ${ts}`}>
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </button>
          <h2 className={`text-base font-black mt-1.5 ${tm}`}>Solutions Review — {(activeAttempt.test && activeAttempt.test.name) || 'Mock Test'}</h2>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-black bg-violet-100 text-violet-705 dark:bg-violet-950/30 dark:text-violet-400`}>
          Score: {activeAttempt.score} / {activeAttempt.max} ({activeAttempt.acc}% Acc)
        </div>
      </div>

      {/* Attempt Selector Tabs (like Testbook) */}
      {attemptsList.length > 1 && (
        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
          {attemptsList.map((att, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`px-3 py-1.5 rounded-t-xl text-xs font-black transition-all outline-none border-b-2 ${
                  isActive
                    ? 'border-b-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/10'
                    : 'border-b-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Attempt {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Attempt Time Info Bar */}
      <div className={`rounded-xl p-3 mb-4 border text-xs flex items-center gap-2 ${
        dk ? 'bg-slate-900 border-slate-800 text-slate-350' : 'bg-slate-50 border-slate-200/85 text-slate-600'
      }`}>
        <i className="fa-solid fa-circle-info text-violet-500"></i>
        <span>
          Attempt {activeIdx + 1} was made {fmtDateText(activeAttempt.timestamp)}
        </span>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {((activeAttempt.test && activeAttempt.test.qs) || []).map((q, idx) => {
          const userAns = activeAttempt.answers ? activeAttempt.answers[idx] : null;
          const isCorrect = userAns === q.answer;
          
          return (
            <div key={q.id || idx} className={`border-2 rounded-2xl p-4 sm:p-5 relative ${card}`}>
              {/* Question status badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider ${dk ? 'text-violet-400' : 'text-violet-600'}`}>
                  Question {idx + 1}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                  userAns === null 
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                    : isCorrect 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                }`}>
                  {userAns === null ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              
              {/* Question text */}
              <p className={`text-sm sm:text-base font-bold mb-4 ${tm}`}>{q.question}</p>
              
              {/* Options */}
              <div className="space-y-2 mb-4">
                {q.opts.map((opt, oIdx) => {
                  const isOptCorrect = opt === q.answer;
                  const isOptSelected = opt === userAns;
                  
                  let optStyle = dk 
                    ? 'border-slate-705 bg-slate-800 text-slate-300' 
                    : 'border-slate-200 bg-white text-slate-700';
                  let circStyle = dk 
                    ? 'border-slate-650 bg-slate-700 text-slate-400' 
                    : 'border-slate-300 bg-slate-50 text-slate-500';
                  let statusIcon = null;

                  if (isOptCorrect) {
                    optStyle = dk 
                      ? 'border-green-600 bg-green-950/20 text-green-300' 
                      : 'border-green-500 bg-green-50/70 text-green-700';
                    circStyle = 'border-green-500 bg-green-500 text-white';
                    statusIcon = <i className="fa-solid fa-check text-xs ml-auto text-green-500"></i>;
                  } else if (isOptSelected && !isCorrect) {
                    optStyle = dk 
                      ? 'border-rose-600 bg-rose-950/20 text-rose-300' 
                      : 'border-rose-500 bg-rose-50/70 text-rose-700';
                    circStyle = 'border-rose-500 bg-rose-500 text-white';
                    statusIcon = <i className="fa-solid fa-xmark text-xs ml-auto text-rose-500"></i>;
                  }

                  return (
                    <div key={opt} className={`px-4 py-2.5 rounded-xl border-2 text-xs sm:text-sm flex items-center gap-3 ${optStyle}`}>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black ${circStyle}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="font-semibold">{opt}</span>
                      {statusIcon}
                    </div>
                  );
                })}
              </div>

              {/* Memory Trick / Mnemonic logic */}
              {q.memoryTrick && (
                <div className={`p-3 rounded-xl border text-xs ${
                  dk 
                    ? 'bg-violet-950/20 border-violet-900/40 text-violet-300' 
                    : 'bg-violet-50/50 border-violet-100 text-violet-850'
                }`}>
                  <strong className={`block mb-1 text-[10px] uppercase tracking-wider ${dk ? 'text-violet-400' : 'text-violet-600'}`}>
                    💡 Memory Trick
                  </strong>
                  <span>{q.memoryTrick}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-center">
        <button onClick={onBack} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
//  MAIN: MockTest
// ════════════════════════════════════════════════════════
const MockTest = ({questions, theme, addMistake}) => {
  const cfg = window.caConfig || {};
  const mc  = cfg.mockConfig  || {};
  const cats = cfg.categories || [];
  const dk = theme==='dark';
  const wm = theme==='warm';

  const [screen, setScreen] = useState('select');
  const [selTest, setSelTest] = useState(null);
  const [result, setResult] = useState(null);
  const [key, setKey] = useState(0);

  // Load attempt history from localStorage
  const [attempts, setAttempts] = useState(() => {
    try {
      const stored = localStorage.getItem('ca_mock_attempts');
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      // Migrate old format (single object) to new format (array of objects)
      const migrated = {};
      Object.keys(parsed).forEach(k => {
        if (Array.isArray(parsed[k])) {
          migrated[k] = parsed[k];
        } else if (parsed[k]) {
          migrated[k] = [parsed[k]];
        }
      });
      return migrated;
    } catch(e) {
      return {};
    }
  });

  const monthly = useMemo(() => buildMonthly(questions, mc), [questions]);
  const topic   = useMemo(() => buildTopic(questions, cats, mc), [questions, cats]);

  const start  = t  => { setSelTest(t); setScreen('inst'); };
  const begin  = () => setScreen('live');
  
  const finish = r  => { 
    const resultWithTime = { ...r, timestamp: Date.now() };
    setAttempts(prev => {
      const list = prev[r.test.id] ? [...prev[r.test.id]] : [];
      list.push(resultWithTime);
      const next = { ...prev, [r.test.id]: list };
      try {
        localStorage.setItem('ca_mock_attempts', JSON.stringify(next));
      } catch(e) {}
      setResult(list);
      return next;
    });
    setScreen('result'); 
  };

  const retry  = () => {
    if (!selTest) return;
    setKey(k=>k+1);
    setScreen('inst');
  };
  const back = () => { setSelTest(null); setResult(null); setScreen('select'); };

  const viewSolution = t => {
    setSelTest(t);
    setResult(attempts[t.id]);
    setScreen('solution');
  };

  const viewAnalysis = t => {
    setSelTest(t);
    setResult(attempts[t.id]);
    setScreen('result');
  };

  if (screen==='select')  return <TestSelector monthly={monthly} topic={topic} onStart={start} attempts={attempts} onViewSolution={viewSolution} onViewAnalysis={viewAnalysis} dk={dk} wm={wm} />;
  if (screen==='inst')    return <Instructions test={selTest} onBegin={begin} onBack={back} dk={dk} wm={wm} />;
  if (screen==='live')    return <LiveTest key={selTest.id+'_'+key} test={selTest} dk={dk} wm={wm} onFinish={finish} addMistake={addMistake} />;
  if (screen==='result')  return <TestResult res={result} onRetry={retry} onBack={back} dk={dk} wm={wm} />;
  if (screen==='solution') return <SolutionReview res={result} onBack={back} dk={dk} wm={wm} />;
  return null;
};
