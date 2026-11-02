// components/mock/LiveTest.js — CBT Exam Interface & Real-Time Palette Engine

// ════════════════════════════════════════════════════════
//  SCREEN 3: Live Test
// ════════════════════════════════════════════════════════
const LiveTest = ({test, dk, wm, onFinish, onExit, addMistake}) => {
  const inProgressKey = `ca_mock_inprogress_${(window.caConfig && window.caConfig.month) || 'default'}_${(window.caConfig && window.caConfig.year) || ''}`;
  
  const getExistingSession = () => {
    try {
      const all = JSON.parse(localStorage.getItem(inProgressKey)) || {};
      return all[test.id] || null;
    } catch(e) { return null; }
  };
  const existing = getExistingSession();

  const [answers, setAnswers] = useState(() => (existing && existing.answers ? existing.answers : {}));
  const [states, setStates] = useState(() => (existing && existing.states ? existing.states : test.qs.map(()=>QS.NV)));
  const [cq, setCq] = useState(() => (existing && existing.cq !== undefined ? existing.cq : 0));
  const [qTimes, setQTimes] = useState(() => (existing && existing.qTimes ? existing.qTimes : test.qs.map(()=>0)));
  const [secs, setSecs] = useState(() => (existing && existing.secs !== undefined ? existing.secs : test.mins * 60));
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  
  const [showPal, setShowPal] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showLast, setShowLast] = useState(false);

  // Initial setup for first question state
  useEffect(() => {
    if (!existing) {
      const n=[...states]; if(n[0]===QS.NV) n[0]=QS.NA; setStates(n);
    }
  }, []);

  // Auto-save in-progress state to localStorage
  useEffect(() => {
    if (done) return;
    try {
      const all = JSON.parse(localStorage.getItem(inProgressKey)) || {};
      all[test.id] = {
        testId: test.id,
        cq,
        answers,
        states,
        qTimes,
        secs,
        totalQs: test.qs.length,
        lastUpdated: Date.now()
      };
      localStorage.setItem(inProgressKey, JSON.stringify(all));
    } catch(e) {}
  }, [cq, answers, states, qTimes, secs, done, test.id, inProgressKey]);

  // Timer
  useEffect(() => {
    if (paused || done || secs <= 0) return;
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { setDone(true); return 0; }
        return s - 1;
      });
      setQTimes(prev => {
        const n = [...prev];
        n[cq] += 1;
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, done, secs, cq]);

  // Submit trigger
  useEffect(() => {
    if (done) doSubmit();
  }, [done]);

  const doSubmit = () => {
    // Clear in-progress session on submission
    try {
      const all = JSON.parse(localStorage.getItem(inProgressKey)) || {};
      delete all[test.id];
      localStorage.setItem(inProgressKey, JSON.stringify(all));
    } catch(e) {}

    let score=0, acc=0, cor=0, wrg=0;
    test.qs.forEach((q, i) => {
      const userAns = getStudentAnswer(answers, q, i);
      if (userAns !== null && userAns !== undefined) {
        if (userAns === q.answer) { score += test.mark; cor++; }
        else { score -= test.neg; wrg++; addMistake(q); }
      }
    });
    if (cor+wrg > 0) acc = Math.round((cor / (cor+wrg)) * 100);

    // Bulletproof Time Capture Fix: Calculate elapsed seconds with qTimes fallback
    const totalSecs = (Number(test.mins) || 15) * 60;
    const timeSpent = Math.max(0, totalSecs - secs);
    const sumQTimes = (qTimes || []).reduce((acc, t) => acc + (Number(t) || 0), 0);
    const finalTaken = timeSpent > 0 ? timeSpent : (sumQTimes > 0 ? sumQTimes : 1);

    const result = {
      test,
      timestamp: Date.now(),
      score: Number(score.toFixed(2)),
      max: test.qs.length * test.mark,
      correct: cor,
      cor: cor,
      wrong: wrg,
      wrg: wrg,
      skip: test.qs.length - (cor+wrg),
      skp: test.qs.length - (cor+wrg),
      acc,
      taken: finalTaken,
      answers,
      states,
      qTimes,
      att: cor+wrg
    };
    onFinish(result);
  };

  // Expose global hooks for top navigation and tab switches
  useEffect(() => {
    window.submitCurrentLiveMockTest = () => doSubmit();
    window.saveAndPauseCurrentLiveMockTest = () => { if (onExit) onExit(); };
    window.submitLiveTestWithAllCorrect = () => {
      const perfectAnswers = {};
      const perfectStates = test.qs.map(() => QS.ANS);
      test.qs.forEach((q, i) => {
        perfectAnswers[i] = q.answer;
        if (q && q.id !== undefined) {
          perfectAnswers['qid_' + q.id] = q.answer;
        }
      });
      try {
        const all = JSON.parse(localStorage.getItem(inProgressKey)) || {};
        delete all[test.id];
        localStorage.setItem(inProgressKey, JSON.stringify(all));
      } catch(e) {}

      const score = test.qs.length * test.mark;
      const cor = test.qs.length;
      const finalTaken = test.qs.length * 11;

      const result = {
        test,
        timestamp: Date.now(),
        score: Number(score.toFixed(2)),
        max: score,
        correct: cor,
        cor: cor,
        wrong: 0,
        wrg: 0,
        skip: 0,
        skp: 0,
        acc: 100,
        taken: finalTaken,
        answers: perfectAnswers,
        states: perfectStates,
        qTimes: test.qs.map(() => 11),
        att: cor
      };
      onFinish(result);
    };
    return () => {
      delete window.submitCurrentLiveMockTest;
      delete window.saveAndPauseCurrentLiveMockTest;
      delete window.submitLiveTestWithAllCorrect;
    };
  });

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

  const userCurAns = getStudentAnswer(answers, q, cq);

  const optClass = (opt) => {
    const sel = userCurAns === opt;
    if (sel) return 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-95 ' + (dk ? 'border-violet-500 bg-violet-950/40 text-violet-300' : 'border-violet-500 bg-violet-50/50 text-violet-700');
    if (dk) return 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-95 border-slate-700 bg-slate-800 text-slate-205 hover:border-violet-500';
    return 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-95 border-slate-200 bg-white text-slate-700 hover:border-violet-300';
  };

  const circClass = (opt) => {
    const sel = userCurAns === opt;
    if (sel) return 'w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 border-violet-500 bg-violet-600 text-white';
    if (dk) return 'w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 border-slate-600 text-slate-400';
    return 'w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 border-slate-300 text-slate-400';
  };

  const selectOpt = opt => setAnswers(prev => { 
    const n = { ...prev }; 
    n[cq] = opt; 
    if (q && q.id !== undefined) {
      n[`qid_${q.id}`] = opt;
    }
    return n; 
  });
  const clearResp = () => {
    setAnswers(prev => { 
      const n = { ...prev }; 
      delete n[cq]; 
      if (q && q.id !== undefined) {
        delete n[`qid_${q.id}`];
      }
      return n; 
    });
    setStates(prev => {
      const n=[...prev];
      if (n[cq]===QS.MA) n[cq]=QS.MRK;
      else if (n[cq]===QS.ANS) n[cq]=QS.NA;
      return n;
    });
  };

  const goNext = () => {
    if (cq < test.qs.length - 1) {
      setCq(cq+1);
      setStates(prev => {
        const n=[...prev];
        if (n[cq+1]===QS.NV) n[cq+1]=QS.NA;
        return n;
      });
    } else {
      setShowLast(true);
    }
  };

  const saveNext = () => {
    setStates(prev => {
      const n=[...prev];
      if (answers[cq]) n[cq] = QS.ANS;
      else if (n[cq] !== QS.MRK) n[cq] = QS.NA;
      return n;
    });
    goNext();
  };

  const markNext = () => {
    setStates(prev => {
      const n=[...prev];
      if (answers[cq]) n[cq] = QS.MA;
      else n[cq] = QS.MRK;
      return n;
    });
    goNext();
  };

  const jumpTo = i => {
    setStates(prev => {
      const n=[...prev];
      if (answers[cq]) {
        if (n[cq]!==QS.MRK && n[cq]!==QS.MA) n[cq]=QS.ANS;
      } else {
        if (n[cq]!==QS.MRK && n[cq]!==QS.MA) n[cq]=QS.NA;
      }
      if (n[i]===QS.NV) n[i]=QS.NA;
      return n;
    });
    setCq(i);
    setShowPal(false);
  };

  return (
    <div className="w-full h-full flex flex-col max-w-5xl mx-auto md:p-2 sm:p-4">
      <style>{`
        .bottom-nav-safe { display: none !important; }
        #root > div { padding-bottom: 0 !important; }
      `}</style>
      
      {/* Header */}
      <div className={'flex-shrink-0 border-b w-full ' + hdr}>
        <div className="max-w-7xl mx-auto w-full hidden sm:flex items-center px-4 py-2.5 gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={'text-[11px] font-semibold uppercase tracking-wider '+ts}>Section</span>
            <span className="bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded">Test</span>
          </div>
          <p className={'flex-1 text-center text-sm font-bold truncate '+tm}>{test.name}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={'text-sm font-black tabular-nums mr-2 '+(crit?'text-red-500 exam-timer-pulse':tm)}>Time Left: {fmt(secs)}</span>
            <button onClick={()=>setPaused(p=>!p)}
              className={'px-3 py-1 text-[11px] font-bold rounded-lg border transition-all active:scale-95 '+(dk?'border-slate-700 text-slate-300 bg-slate-800':'border-slate-200 text-slate-600 bg-white')}>
              {paused?'▶ Resume':'⏸ Pause'}
            </button>
            <button onClick={()=>setShowQuitModal(true)}
              className="px-3 py-1 text-[11px] font-bold rounded-lg border border-rose-500/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all active:scale-95"
              title="Quit Test"
            >
              ✕ Quit
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full flex sm:hidden items-center px-3 py-2 gap-2">
          <p className={'flex-1 text-[11px] font-bold truncate '+tm}>{test.name}</p>
          <span className={'text-sm font-black tabular-nums flex-shrink-0 '+(crit?'text-red-500 exam-timer-pulse':tm)}>{fmt(secs)}</span>
          <button onClick={()=>setPaused(p=>!p)}
            className={'w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 active:scale-95 '+(dk?'bg-slate-800 text-slate-300':'bg-slate-100 text-slate-605')}>
            {paused?'▶':'⏸'}
          </button>
          <button onClick={()=>setShowQuitModal(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 active:scale-95 font-bold"
            title="Quit Test"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Safety Quit / Pause / Submit Test Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border ${dk ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="text-4xl mb-2">⏸️</div>
            <h3 className="text-base sm:text-lg font-black mb-1">Live Test in Progress (टेस्ट अभी चालू है!)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              आपने <strong>{test.qs.length}</strong> में से <strong>{aCnt}</strong> प्रश्न हल कर लिए हैं (Time Left: <span className="font-bold text-violet-600 dark:text-violet-400">{fmt(secs)}</span>)।
              आप क्या करना चाहते हैं?
            </p>
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => setShowQuitModal(false)} 
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-play text-xs"></i>
                <span>Resume Test (टेस्ट जारी रखें)</span>
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => { setShowQuitModal(false); if (onExit) onExit(); }} 
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5 ${
                    dk ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                  title="Save progress and resume later"
                >
                  <i className="fa-regular fa-floppy-disk text-xs"></i>
                  <span>Save & Pause</span>
                </button>
                <button 
                  onClick={() => { setShowQuitModal(false); doSubmit(); }} 
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
                  title="Submit whatever is done and calculate score"
                >
                  <i className="fa-solid fa-check-double text-xs"></i>
                  <span>Submit Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause overlay (Testbook Style) */}
      {paused && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center sm:p-6 p-4">
          {/* Desktop Version */}
          <div className={'hidden sm:block rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full border '+(dk?'bg-slate-900 border-slate-700':'bg-white border-slate-200')}>
            <table className="w-full text-center">
              <thead>
                <tr className="bg-[#12b1b2] text-white">
                  <th className="py-3 px-2 text-sm font-bold border-r border-[#0e9697]">Section</th>
                  <th className="py-3 px-2 text-sm font-bold border-r border-[#0e9697]">No. of questions</th>
                  <th className="py-3 px-2 text-sm font-bold border-r border-[#0e9697]">Answered</th>
                  <th className="py-3 px-2 text-sm font-bold border-r border-[#0e9697]">Not Answered</th>
                  <th className="py-3 px-2 text-sm font-bold border-r border-[#0e9697]">Marked for Review</th>
                  <th className="py-3 px-2 text-sm font-bold">Not Visited</th>
                </tr>
              </thead>
              <tbody className={dk?'text-slate-200':'text-slate-800'}>
                <tr>
                  <td className={'py-4 font-semibold border-r '+(dk?'border-slate-700':'border-slate-200')}>Test</td>
                  <td className={'py-4 border-r '+(dk?'border-slate-700':'border-slate-200')}>{test.qs.length}</td>
                  <td className={'py-4 border-r '+(dk?'border-slate-700':'border-slate-200')}>{aCnt}</td>
                  <td className={'py-4 border-r '+(dk?'border-slate-700':'border-slate-200')}>{naCnt}</td>
                  <td className={'py-4 border-r '+(dk?'border-slate-700':'border-slate-200')}>{mCnt}</td>
                  <td className="py-4">{nvCnt}</td>
                </tr>
              </tbody>
            </table>
            <div className={'px-4 py-3 flex justify-between items-center border-t '+(dk?'border-slate-700 bg-slate-800/50':'border-slate-200 bg-slate-50')}>
              <button onClick={()=>{ setPaused(false); setShowQuitModal(true); }} className="px-5 py-2 rounded bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-all">Quit Test</button>
              <button onClick={()=>setPaused(false)} className="px-5 py-2 rounded bg-[#12b1b2] text-white text-sm font-bold hover:bg-[#0e9697] transition-all">Resume Test</button>
            </div>
          </div>

          {/* Mobile Version */}
          <div className={'sm:hidden rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl '+(dk?'bg-[#2a2c33] text-slate-200':'bg-[#2a2c33] text-slate-200')}>
            <div className="px-5 py-4 space-y-4">
              <div className="flex justify-between items-center text-lg pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3"><i className="fa-regular fa-clock text-slate-400"></i> <span className="font-semibold text-slate-300">Time Left</span></div>
                <span className="font-bold text-blue-400">{fmt(secs)}</span>
              </div>
              <div className="flex justify-between items-center text-lg pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3"><i className="fa-solid fa-check text-slate-400"></i> <span className="font-semibold text-slate-300">Attempted</span></div>
                <span className="font-bold text-white">{aCnt}</span>
              </div>
              <div className="flex justify-between items-center text-lg pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3"><i className="fa-solid fa-circle-minus text-slate-400"></i> <span className="font-semibold text-slate-300">Unattempted</span></div>
                <span className="font-bold text-white">{test.qs.length - aCnt}</span>
              </div>
              <div className="flex justify-between items-center text-lg pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3"><i className="fa-regular fa-star text-slate-400"></i> <span className="font-semibold text-slate-300">Marked</span></div>
                <span className="font-bold text-white">{mCnt}</span>
              </div>
            </div>
            
            <div className="px-5 pb-6 pt-2 text-center">
              <p className="text-white font-bold text-lg mb-5">Do you want to Resume the test?</p>
              <div className="flex gap-3">
                <button onClick={()=>setPaused(false)} className="flex-1 py-3 rounded-lg bg-[#4a84f3] text-white font-bold text-lg shadow-lg active:scale-95 transition-all">Resume Test</button>
                <button onClick={()=>{ setPaused(false); setShowQuitModal(true); }} className="flex-1 py-3 rounded-lg bg-rose-600 text-white font-bold text-lg shadow-lg active:scale-95 transition-all">Quit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Body Split Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex overflow-hidden sm:border-x border-slate-200 dark:border-slate-800/20">

        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950 relative">
          
          {/* Scrollable Question Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scroll">
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className={'text-xs font-semibold '+ts}>
                  Question No. <strong className={tm}>{cq+1}</strong> / {test.qs.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700">+{test.mark}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">-{test.neg}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${dk?'border-slate-700 text-slate-300':'border-slate-300 text-slate-600'}`}>
                    Time {fmt(qTimes[cq])}
                  </span>
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

          {/* Left Side: Question Footer (Sticky Bottom) */}
          <div className={`shrink-0 border-t w-full p-2.5 sm:p-3 flex items-center justify-between gap-2 z-50 ${hdr}`}>
            {/* Left Group */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={markNext}
                className={`px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg border-2 transition-all active:scale-95 flex items-center gap-1 ${dk?'border-amber-600/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/50':'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                <span className="text-[12px]">🚩</span>
                <span className="hidden sm:inline">Mark for Review</span><span className="sm:hidden">Mark</span>
              </button>
              <button onClick={clearResp}
                className={`px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg border-2 transition-all active:scale-95 ${dk?'border-slate-700 text-slate-400 hover:bg-slate-800':'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                <span className="hidden sm:inline">Clear Response</span><span className="sm:hidden">Clear</span>
              </button>
            </div>
            {/* Right Group */}
            <div className="flex items-center gap-2">
              <button onClick={()=>setShowPal(true)}
                className="sm:hidden flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-violet-100 text-violet-700 text-xs font-black active:scale-95">
                📋
              </button>
              <button onClick={saveNext}
                className="px-4 sm:px-6 py-2 text-[11px] sm:text-sm font-black rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 transition-all active:scale-95">
                Save & Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Desktop Sidebar Palette */}
        <div className={`hidden sm:flex flex-col w-64 border-l flex-shrink-0 ${sbg}`}>
          <div className={`p-3 border-b ${dk?'border-slate-800':'border-slate-200'}`}>
            {[[QS.ANS,'Answered',aCnt],[QS.MRK,'Marked',mCnt],[QS.NV,'Not Visited',nvCnt],[QS.NA,'Not Answered',naCnt]].map(([s,lbl,cnt]) => {
              const pc = palColor(s,dk);
              return (
                <div key={s} className="flex items-center gap-2 mb-1.5">
                  <div style={{width:'22px',height:'22px',background:pc.bg,color:pc.fg,border:'2px solid '+pc.br,borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'black',flexShrink:0}}>{cnt}</div>
                  <span className={`text-[11px] font-semibold ${dk?'text-slate-300':'text-slate-600'}`}>{lbl}</span>
                </div>
              );
            })}
          </div>
          <div className={`px-4 py-2 border-b text-[10px] font-black uppercase tracking-widest ${dk?'text-slate-500 border-slate-800':'text-slate-400 border-slate-200'}`}>
            SECTION: Test
          </div>
          <div className="p-3 flex-1 overflow-y-auto custom-scroll">
            <PaletteGrid states={states} cur={cq} onJump={jumpTo} dk={dk} />
          </div>
          {/* Right Side: Submit Button Footer */}
          <div className={`shrink-0 p-3 border-t ${dk?'border-slate-800':'border-slate-200'}`}>
            <button onClick={()=>setShowSub(true)} className="w-full py-3 text-sm font-black rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 transition-all active:scale-95">
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Mobile palette bottom-sheet drawer */}
      {showPal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in-app" onClick={()=>setShowPal(false)} />
          <div className={'relative flex flex-col overflow-hidden rounded-t-3xl max-h-[85vh] w-full shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 border-t-2 '+(dk?'bg-slate-900 border-slate-700':'bg-white border-slate-200')}>
            {/* Drag Handle Bar */}
            <div className="pt-3 pb-1 cursor-pointer flex flex-col items-center" onClick={()=>setShowPal(false)}>
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className={`shrink-0 px-4 py-3 border-b flex items-center justify-between ${dk?'border-slate-800':'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">📋</span>
                <p className={'text-xs font-black uppercase tracking-wider '+tm}>Question Palette</p>
              </div>
              <button onClick={()=>setShowPal(false)} className={'text-xs font-black px-2.5 py-1 rounded-lg border transition-all active:scale-95 '+(dk?'bg-slate-800 text-slate-300 border-slate-700':'bg-slate-100 text-slate-600 border-slate-200')}>
                ✕ Close
              </button>
            </div>

            {/* Status Legend Row */}
            <div className={`px-4 py-2 border-b flex items-center justify-between text-[10px] font-bold overflow-x-auto gap-2 ${dk?'border-slate-800 bg-slate-950/40':'border-slate-100 bg-slate-50'}`}>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Ans ({aCnt})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Unans ({naCnt})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Mark ({mCnt})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Not Vis ({nvCnt})</span>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0 p-4 custom-scroll">
              <PaletteGrid states={states} cur={cq} onJump={jumpTo} dk={dk} />
            </div>

            <div className={`shrink-0 p-4 border-t ${dk?'border-slate-800 bg-slate-900':'border-slate-100 bg-white'} shadow-[0_-10px_15px_rgba(0,0,0,0.05)]`}>
              <button onClick={()=>{setShowPal(false);setShowSub(true);}}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-xl active:scale-95 shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2">
                <i className="fa-solid fa-paper-plane text-xs"></i>
                <span>Submit Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Q dialog */}
      {showLast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className={'rounded-2xl p-6 max-w-xs w-full border-2 '+card}>
            <p className={'text-sm mb-5 leading-relaxed '+tm}>You have reached the last question of the test. Do you want to go to the first question?</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className={'rounded-2xl p-5 w-full max-w-md border-2 '+card}>
            <p className={'text-sm font-bold text-center mb-4 '+ts}>Are you sure you want to submit the test?</p>
            <div className={'rounded-xl overflow-hidden border mb-4 '+(dk?'border-slate-700':'border-slate-200')}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="py-2 text-center border-r border-teal-500">Attempted</th>
                    <th className="py-2 text-center border-r border-teal-500">Marked</th>
                    <th className="py-2 text-center">Unanswered</th>
                  </tr>
                </thead>
                <tbody className={dk?'bg-slate-800':'bg-slate-50'}>
                  <tr>
                    <td className="py-3 text-center border-r font-black text-teal-600 dark:border-slate-700">{aCnt}</td>
                    <td className="py-3 text-center border-r font-black text-amber-600 dark:border-slate-700">{mCnt}</td>
                    <td className="py-3 text-center font-black text-rose-600">{test.qs.length - (aCnt+mCnt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowSub(false)}
                className={'flex-1 py-3 text-sm font-bold rounded-xl border-2 '+(dk?'border-slate-700 text-slate-300 hover:bg-slate-800':'border-slate-200 text-slate-600 hover:bg-slate-100')}>
                Cancel
              </button>
              <button onClick={()=>setDone(true)}
                className="flex-1 py-3 text-sm font-black rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 active:scale-95">
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.LiveTest = LiveTest;
}
