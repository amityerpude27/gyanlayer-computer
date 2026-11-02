// ================================================================
//  MistakeHub.js 🎯 Mistake Hub Tab (Tab 4)
//
//  ✅ EDIT THIS FILE FOR: Mistake card layout, practice mode UI
//  ✅ Auto-collects: FlashCards "भूल गया" + MockTest wrong answers
//  ✅ Practice Mode: Flip cards, MCQ practice, and Mistake Tests
//  ✅ Remove individual mistake when learned
//  ✅ Clear All button
//  ❌ DO NOT add question data here
// ================================================================

const MistakeHub = ({ mistakes, theme, removeMistake, clearMistakes }) => {
  const isDark = theme === 'dark';
  const allQuestions = (window.caConfig && window.caConfig.questions) || [];
  const isWarm = theme === 'warm';
  
  const [bookmarkedIds, setBookmarkedIds] = React.useState({});
  const handleBookmark = (e, item) => {
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const isCurrentlyBookmarked = !!prev[item.id];
      if (!isCurrentlyBookmarked) {
        if (window.dispatchBookmarkEvent) window.dispatchBookmarkEvent(item, true);
        return { ...prev, [item.id]: true };
      }
      return prev;
    });
  };

  // Helper to render FA strings or Emojis
  const renderIcon = (iconStr) => {
    if (!iconStr) return null;
    if (iconStr.includes('fa-')) return <i className={`${iconStr} fa-fw`}></i>;
    return <span>{iconStr}</span>;
  };

  // --- STATE HOOKS ---
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceType, setPracticeType] = useState('select'); // 'select' | 'flashcard' | 'mcq' | 'test'
  
  // Flashcard & MCQ state
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mcqOpts, setMcqOpts] = useState([]);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [mcqAnswered, setMcqAnswered] = useState(false);

  // Test Mode state
  const [testIdx, setTestIdx] = useState(0);
  const [testAnswers, setTestAnswers] = useState({}); // questionId -> selectedOption
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testOptsMap, setTestOptsMap] = useState({});
  const [cleanUpChecked, setCleanUpChecked] = useState({}); // questionId -> boolean

  // List view filters & UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showClearConf, setShowClearConf] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCatDrop, setShowCatDrop] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [openExplanations, setOpenExplanations] = useState({});
  const toggleExp = (qId) => setOpenExplanations(prev => ({ ...prev, [qId]: !prev[qId] }));
  const catDropRef = useRef(null);
  const cardsContainerRef = useRef(null);

  // Auto-scroll to top when category changes
  useEffect(() => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filterCategory]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catDropRef.current && !catDropRef.current.contains(e.target)) {
        setShowCatDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- LOCAL STORAGE METADATA (MISS TRACKER) ---
  const [metadata, setMetadata] = useState(() => {
    try {
      const stored = localStorage.getItem('ca_mistakes_metadata');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const incrementMissCount = (id) => {
    setMetadata(prev => {
      const updated = {
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          missCount: ((prev[id] && prev[id].missCount ? prev[id].missCount : 1) + 1),
          lastMissed: Date.now()
        }
      };
      localStorage.setItem('ca_mistakes_metadata', JSON.stringify(updated));
      return updated;
    });
  };

  // --- THEME CLASSES ---
  const cardBg  = isDark ? 'bg-slate-900 border-slate-800' : isWarm ? 'bg-[#fcf8ee] border-[#e8dcb5]' : 'bg-white border-slate-200';
  const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderCol = isDark ? 'border-slate-800' : 'border-slate-200';
  const sbg = isDark ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200';

  // --- CALCULATE ANALYTICS & MASTERYSYLLABUS ---
  const totalQuestionsCount = (window.caConfig && window.caConfig.questions && window.caConfig.questions.length) ? window.caConfig.questions.length : 1;
  const masteryPercentage = Math.max(0, Math.round((1 - mistakes.length / totalQuestionsCount) * 100));

  const categoryStats = useMemo(() => {
    const stats = {};
    mistakes.forEach(m => {
      stats[m.category] = (stats[m.category] || 0) + 1;
    });
    const cats = (window.caConfig && window.caConfig.categories) ? window.caConfig.categories : [];
    return Object.entries(stats).map(([catId, count]) => {
      const catObj = cats.find(c => c.id === catId) || { label: catId, icon: '❓', color: 'indigo' };
      return { id: catId, count, ...catObj };
    }).sort((a, b) => b.count - a.count);
  }, [mistakes]);

  const weakestCategory = categoryStats[0] || null;

  // --- FILTER MISTAKES FOR LIST VIEW ---
  const filteredMistakes = useMemo(() => {
    return mistakes.filter(m => {
      const matchCat = filterCategory === 'all' || m.category === filterCategory;
      const matchText = !searchQuery.trim() || 
        m.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchText;
    });
  }, [mistakes, filterCategory, searchQuery]);

  // (Internal MCQ option generation removed. MCQ Practice Mode now uses MockTest.js)

  // --- LAUNCH MISTAKE TEST MODE ---
  const startTestMode = () => {
    const allQuestions = (window.caConfig && window.caConfig.questions) ? window.caConfig.questions : [];
    const mapping = {};
    const cleanupMapping = {};
    mistakes.forEach(m => {
      const others = [...new Set(allQuestions.map(x => x.answer))].filter(a => a !== m.answer);
      const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
      mapping[m.id] = [...shuffledOthers, m.answer].sort(() => Math.random() - 0.5);
      cleanupMapping[m.id] = true; // checked by default
    });
    setTestOptsMap(mapping);
    setCleanUpChecked(cleanupMapping);
    setTestAnswers({});
    setTestIdx(0);
    setTestSubmitted(false);
    setPracticeType('test');
    setPracticeMode(true);
  };

  const handleTestOptionSelect = (qId, option) => {
    setTestAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const submitTest = () => {
    // Audit incorrect items to increment miss count
    mistakes.forEach(m => {
      const ans = testAnswers[m.id];
      if (ans && ans !== m.answer) {
        incrementMissCount(m.id);
      }
    });
    setTestSubmitted(true);
  };

  const handleCleanUpExit = (doCleanUp) => {
    if (doCleanUp) {
      // Remove all checked correct items
      mistakes.forEach(m => {
        const isCorrect = testAnswers[m.id] === m.answer;
        if (isCorrect && cleanUpChecked[m.id]) {
          removeMistake(m.id);
        }
      });
    }
    // reset states
    setPracticeMode(false);
    setPracticeType('select');
    setTestSubmitted(false);
    setTestAnswers({});
  };

  // --- TRIGGER CONFETTI ON SUCCESS ---
  const triggerSuccessConfetti = () => {
    if (typeof confetti !== 'undefined') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
  };

  // 🧊 EMPTY STATE 🧊
  if (mistakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] px-6 text-center">
        <span className="text-6xl mb-4">🎯</span>
        <h2 className={`text-xl font-black mb-2 ${textMain}`}>Mistake Hub is Empty!</h2>
        <p className={`text-sm max-w-xs ${textSub}`}>
          Incorrect answers in Mock Tests or cards marked as "Forgot" in Flash Cards will appear here automatically.
        </p>
        <div className={`mt-6 rounded-2xl p-4 max-w-xs w-full ${sbg}`}>
          <p className="text-xs text-violet-500 font-semibold mb-1">💡 Pro-Tip</p>
          <p className={`text-[11px] leading-relaxed ${textSub}`}>
            Revising mistakes regularly builds active recall and moves them to your permanent memory. Use Practice Mode!
          </p>
        </div>
      </div>
    );
  }

  //    SMART REVISION MODE   
  if (practiceMode) {
    const safeIdx = practiceIdx % mistakes.length;
    const staleCurrent = mistakes[safeIdx];
    const current = allQuestions.find(q => q.id === staleCurrent.id) || staleCurrent;
    const itemMeta = metadata[current.id] || { missCount: 1 };

    return (
      <div className="flex flex-col items-center px-4 py-5 max-w-lg mx-auto w-full h-full min-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-6">
          <button
            onClick={() => { setPracticeMode(false); setFlipped(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
            }`}
          >
            ⬅ Exit Session
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => handleBookmark(e, current)}
              title="Save to GyanLayer"
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all active:scale-90 border ${
                bookmarkedIds[current.id] 
                  ? 'bg-violet-100 border-violet-200 text-violet-600 dark:bg-violet-900/40 dark:border-violet-700 dark:text-violet-400' 
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500 hover:text-violet-400' : 'bg-white border-gray-200 text-slate-400 hover:text-violet-500')
              }`}
            >
              <i className={bookmarkedIds[current.id] ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}></i>
            </button>
            <span className={`text-[10px] font-black uppercase tracking-widest ${textSub}`}>Progress</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              {safeIdx + 1} / {mistakes.length}
            </span>
          </div>
        </div>

        {/* The Card */}
        <div
          className="w-full flex-1 flex flex-col justify-center cursor-pointer select-none transition-all duration-300"
          onClick={() => { if (!flipped) setFlipped(true); }}
        >
          <div className={`w-full rounded-2xl border-2 p-6 sm:p-8 flex flex-col justify-between shadow-sm transition-all duration-500 min-h-[300px] ${
            flipped ? (isDark ? 'bg-slate-900 border-violet-500/50' : 'bg-white border-violet-300') : cardBg
          }`}>
            
            <div className="flex items-center justify-center w-full mb-6">
              {(current.category || current.subject) && (
                <span className={`text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full ${
                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {((window.caConfig && window.caConfig.categories) ? (window.caConfig.categories.find(c => c.id === (current.category || current.subject)) || {}) : {}).label || current.subject || 'GENERAL'}
                </span>
              )}
            </div>

            {/* Question */}
            <p className={`text-lg sm:text-xl font-black text-center leading-relaxed my-auto ${textMain}`}>
              {current.question}
            </p>

            {/* Tap to Reveal Indicator */}
            {!flipped && (
              <div className="mt-8 text-center animate-pulse">
                <span className={`text-[11px] font-bold tracking-widest px-4 py-2 rounded-full border ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-gray-200 text-slate-500'
                }`}>
                  <i className="fa-solid fa-hand-pointer mr-2"></i>TAP TO REVEAL ANSWER
                </span>
              </div>
            )}

            {/* Answer Section (Revealed) */}
            {flipped && (
              <div className="mt-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <p className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 mb-2">  CORRECT ANSWER:</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-snug mb-4">
                  {current.answer || current.correctAnswer || "Answer not found"}
                </p>
                
                {(current.memoryTrick || current.hint) && (
                  <div className={`rounded-xl p-3 sm:p-4 text-sm leading-relaxed border whitespace-pre-line ${
                    isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-200/90' : 'bg-amber-50 border-amber-100 text-amber-800'
                  }`}>
                    <strong className="block mb-1 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">💡 MEMORY TRICK</strong>
                    {(window.renderFormattedTrick || ((t, c) => <p className={c}>{t}</p>))(current.memoryTrick || current.hint, isDark ? 'text-amber-200/90' : 'text-amber-800')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rating Actions (Visible only when flipped) */}
        {flipped && (
          <div className="w-full mt-6 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-300">
            <p className={`text-xs text-center font-bold uppercase tracking-wider mb-1 ${textSub}`}>Be honest, did you remember this?</p>
            <div className="flex gap-2 sm:gap-3 w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                  setTimeout(() => setPracticeIdx(p => (p + 1) % mistakes.length), 150);
                }}
                className={`flex-1 py-3 px-2 flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-95 ${
                  isDark ? 'border-rose-900/50 bg-rose-950/30 hover:bg-rose-900/50' : 'border-rose-200 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                <span className="text-xl mb-1">😓</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>FORGOT</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                  setTimeout(() => setPracticeIdx(p => (p + 1) % mistakes.length), 150);
                }}
                className={`flex-1 py-3 px-2 flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-95 ${
                  isDark ? 'border-amber-900/50 bg-amber-950/30 hover:bg-amber-900/50' : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <span className="text-xl mb-1">🤔</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>VAGUE</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSuccessConfetti();
                  removeMistake(current.id);
                  setFlipped(false);
                  if (safeIdx >= mistakes.length - 1) setPracticeIdx(0);
                }}
                className={`flex-1 py-3 px-2 flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-95 ${
                  isDark ? 'border-green-800 bg-green-900/40 hover:bg-green-800/60' : 'border-green-300 bg-green-100 hover:bg-green-200'
                }`}
              >
                <span className="text-xl mb-1">🤩</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>PERFECT!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 🧊 4. MAIN LIST VIEW 🧊
  return (
    <div className="flex flex-col h-full w-full">
      
      {/* 🧊 STICKY MASTER HEADER 🧊 */}
      <div className={`sticky top-0 z-40 py-4 px-3 sm:px-5 border-b mb-4 flex flex-col gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Top/Left: Title & Quick Stats */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h2 className={`text-base md:text-lg font-black ${textMain}`}>Mistake Hub</h2>
              <p className={`text-[11px] md:text-xs ${textSub}`}>
                {mistakes.length} mistakes ⬢ Mastery: {masteryPercentage}%
              </p>
            </div>
          </div>

          {/* Bottom/Right: Search, Filter, Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Compact Search */}
            <div className="relative w-full md:w-56 lg:w-64">
              <i className={`fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ${textSub}`}></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mistakes..."
                className={`w-full text-xs pl-9 pr-4 py-2 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-violet-500' : 'bg-slate-50 border-gray-200 text-slate-800 focus:border-violet-300'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:text-slate-800 dark:hover:text-slate-100 ${textSub}`}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Smart Category Dropdown (Popover on Desktop, Bottom Sheet on Mobile) */}
            <div className="relative flex-1 md:flex-none" ref={catDropRef}>
              <button 
                onClick={() => setShowCatDrop(!showCatDrop)}
                className={`w-full flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-xl border outline-none font-bold transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-violet-500' : 'bg-slate-50 border-gray-200 text-slate-650 hover:border-violet-300'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                  {filterCategory === 'all' ? 'All Categories' : (
                    <React.Fragment>
                      {renderIcon(((window.caConfig && window.caConfig.categories) ? (window.caConfig.categories.find(c => c.id === filterCategory) || {}) : {}).icon)}
                      <span className="truncate">{((window.caConfig && window.caConfig.categories) ? (window.caConfig.categories.find(c => c.id === filterCategory) || {}) : {}).label}</span>
                    </React.Fragment>
                  )}
                </span>
                <i className="fa-solid fa-chevron-down text-[10px]"></i>
              </button>

              {/* Desktop Popover */}
              {showCatDrop && (
                <div className="hidden md:block absolute top-full right-0 mt-2 min-w-[220px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl rounded-xl z-50 overflow-hidden">
                   <div className="max-h-60 overflow-y-auto py-1">
                     <button onClick={() => { setFilterCategory('all'); setShowCatDrop(false); }} className={`w-full text-left px-4 py-3 text-xs border-b last:border-0 transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700 text-slate-200' : 'border-gray-100 hover:bg-slate-50 text-slate-700'}`}>
                       All Categories
                     </button>
                     {((window.caConfig && window.caConfig.categories) ? window.caConfig.categories : []).filter(c => c.id !== 'all').map(c => (
                       <button key={c.id} onClick={() => { setFilterCategory(c.id); setShowCatDrop(false); }} className={`w-full text-left px-4 py-3 text-xs flex items-center gap-2.5 border-b last:border-0 transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700 text-slate-200' : 'border-gray-100 hover:bg-slate-50 text-slate-700'}`}>
                         <span className="w-4 text-center">{renderIcon(c.icon)}</span>
                         <span className="truncate">{c.label}</span>
                       </button>
                     ))}
                   </div>
                </div>
              )}
            </div>

            {/* Core Actions */}
            <div className="flex gap-2 ml-auto md:ml-0">
               <button
                 onClick={() => { setPracticeIdx(0); setFlipped(false); setPracticeMode(true); }}
                 className="px-3 py-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center"
               >
                 <i className="fa-solid fa-dumbbell sm:mr-1.5"></i><span className="hidden sm:inline">Smart Revision</span>
               </button>
               
               {!showClearConf ? (
                 <button
                   onClick={() => setShowClearConf(true)}
                   className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all active:scale-95 flex items-center ${
                     isDark ? 'border-slate-700 bg-slate-900 text-slate-400 hover:border-rose-700 hover:text-rose-450' : 'bg-slate-50 border-gray-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
                   }`}
                   title="Clear All"
                 >
                   <i className="fa-solid fa-trash-can sm:mr-1.5"></i><span className="hidden sm:inline">Clear All</span>
                 </button>
               ) : (
                 <div className="flex gap-1.5">
                   <button
                     onClick={() => { clearMistakes(); setShowClearConf(false); }}
                     className="px-3 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all"
                   >
                     Yes
                   </button>
                   <button
                     onClick={() => setShowClearConf(false)}
                     className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                       isDark ? 'border-slate-700 bg-slate-900 text-slate-400' : 'bg-slate-50 border-gray-200 text-slate-500'
                     }`}
                   >
                     No
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* 🧊 MOBILE BOTTOM SHEET FOR CATEGORIES 🧊 */}
      {showCatDrop && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCatDrop(false)}></div>
          <div className={`relative w-full rounded-t-3xl p-4 pb-8 max-h-[80vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4"></div>
            <h3 className={`text-base font-black mb-4 px-2 ${textMain}`}>Select Category</h3>
            <div className="flex flex-col gap-1">
              <button onClick={() => { setFilterCategory('all'); setShowCatDrop(false); }} className={`w-full text-left px-4 py-3.5 text-sm font-bold rounded-xl transition-colors ${filterCategory === 'all' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                All Categories
              </button>
              {((window.caConfig && window.caConfig.categories) ? window.caConfig.categories : []).filter(c => c.id !== 'all').map(c => (
                <button key={c.id} onClick={() => { setFilterCategory(c.id); setShowCatDrop(false); }} className={`w-full text-left px-4 py-3.5 text-sm font-bold rounded-xl flex items-center gap-3 transition-colors ${filterCategory === c.id ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <span className="w-6 text-center text-lg">{renderIcon(c.icon)}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🧊 SCROLLABLE CONTENT AREA 🧊 */}
      <div ref={cardsContainerRef} className="px-3 sm:px-5 pb-32 sm:pb-16 flex-1 overflow-y-auto main-scroll">
        
        {/* Analytics Collapsible Card */}
        <div className={`border rounded-2xl p-4 mb-5 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => setShowAnalytics(a => !a)}
            className={`w-full flex items-center justify-between text-xs font-black tracking-wider uppercase ${textMain}`}
          >
            <span className="flex items-center gap-2"><i className="fa-solid fa-chart-pie text-indigo-500"></i> Weak Topic Analytics</span>
            <span>{showAnalytics ? '▼ Close' : '▲ Show'}</span>
          </button>

          {showAnalytics && (
            <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-150'}`}>
              {/* Weakest stats */}
              <div className="space-y-4">
                <p className={`text-sm ${textSub}`}>
                  Memory Strength: <strong className={masteryPercentage >= 70 ? 'text-green-600' : 'text-amber-600'}>{masteryPercentage}%</strong>
                </p>
                {weakestCategory ? (
                  <div className={`rounded-xl p-4 flex items-center gap-3 border ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-300' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <span className="text-2xl">🚨</span>
                    <div>
                      <p className="text-sm font-bold mb-0.5">Weakest Area</p>
                      <p className={`text-xs sm:text-sm ${isDark ? 'text-red-200/80' : 'text-red-800/80'}`}>
                        You have the most errors in <strong>{renderIcon(weakestCategory.icon)} {weakestCategory.label}</strong> ({weakestCategory.count} mistakes).
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${textSub}`}>No weak topics identified yet. Keep practice alive!</p>
                )}
              </div>

              {/* Distribution chart */}
              <div className="space-y-3">
                <p className={`text-xs font-black uppercase ${textSub}`}>Mistake Distribution</p>
                <div className="space-y-4 max-h-32 overflow-y-auto pr-2">
                  {categoryStats.map(c => {
                    const percent = Math.round((c.count / mistakes.length) * 100);
                    return (
                      <div key={c.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5">{renderIcon(c.icon)} {c.label}</span>
                          <span>{c.count} ({percent}%)</span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Mistake Cards Grid */}
      {filteredMistakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMistakes.map((staleItem, i) => {
            const item = allQuestions.find(q => q.id === staleItem.id) || staleItem;
            const itemMeta = metadata[item.id] || { missCount: 1 };
            let diffBadge = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
            let diffText = `Missed ${itemMeta.missCount}x`;
            if (itemMeta.missCount === 1) {
              diffBadge = 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900';
              diffText = '1st Attempt Miss';
            } else if (itemMeta.missCount >= 3) {
              diffBadge = 'text-red-500 bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-800 font-extrabold animate-pulse';
              diffText = `Critical Error (${itemMeta.missCount}x)`;
            }

            return (
              <div
                key={item.id}
                className={`ca-card rounded-2xl sm:rounded-3xl border-2 p-3.5 sm:p-5 flex flex-col justify-between ${cardBg}`}
              >
                <div>
                  {/* Top: Badges + Bookmark + Remove */}
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap sm:flex-nowrap">
                    {/* Left: Attempt Miss Badge */}
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${diffBadge}`}>
                      {diffText}
                    </span>
                    
                    {/* Right: Category Badge + Bookmark + Remove */}
                    <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                      {(item.category || item.subject) && window.caConfig && window.caConfig.categories && window.caConfig.categories.find(c => c.id === (item.category || item.subject)) && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border max-w-[110px] sm:max-w-[140px] truncate shrink-0 ${
                          isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`} title={window.caConfig.categories.find(c => c.id === (item.category || item.subject)).label}>
                          {renderIcon(window.caConfig.categories.find(c => c.id === (item.category || item.subject)).icon)}
                          <span className="truncate">{window.caConfig.categories.find(c => c.id === (item.category || item.subject)).label}</span>
                        </span>
                      )}
                      
                      <button 
                        onClick={(e) => handleBookmark(e, item)}
                        title="Save to GyanLayer"
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 border ${
                          bookmarkedIds[item.id] 
                            ? 'bg-violet-100 border-violet-200 text-violet-600 dark:bg-violet-900/40 dark:border-violet-700 dark:text-violet-400' 
                            : (isDark ? 'border-slate-700 text-slate-400 hover:text-violet-400 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:text-violet-500 hover:bg-slate-100')
                        }`}
                      >
                        <i className={bookmarkedIds[item.id] ? "fa-solid fa-bookmark text-xs" : "fa-regular fa-bookmark text-xs"}></i>
                      </button>

                      <button
                        onClick={() => removeMistake(item.id)}
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 border ${
                          isDark ? 'border-rose-900/40 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40' : 'border-rose-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                        title="Remove Mistake"
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                      </button>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="flex items-start gap-2 mb-3">
                    <span className="shrink-0 text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                      Q.{item.id}
                    </span>
                    <p className={`text-sm sm:text-base font-bold leading-relaxed flex-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                      {item.question}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  {/* Correct Answer */}
                  <div className="mb-2.5">
                    <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                      isDark ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}>
                      <span className="text-base shrink-0 leading-none mt-0.5">✅</span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider block mb-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          Correct Answer (सही उत्तर)
                        </span>
                        <p className="text-xs sm:text-sm font-bold break-words leading-snug">
                          {item.answer || item.correctAnswer || "Answer not found"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Memory Trick */}
                  {(item.memoryTrick || item.hint) && (
                    <div className={`mt-2.5 rounded-xl p-3 sm:p-3.5 border text-xs sm:text-sm leading-relaxed ${
                      isDark 
                        ? 'bg-gradient-to-br from-amber-950/30 to-amber-900/20 border-amber-800/40 text-amber-200' 
                        : 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-200/80 text-amber-950 shadow-sm'
                    }`}>
                      <strong className={`block mb-1.5 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                        <span>💡</span> Memory Trick (याद रखने की ट्रिक)
                      </strong>
                      <div className="leading-relaxed">
                        {(window.renderFormattedTrick || ((t, c) => <p className={c}>{t}</p>))(item.memoryTrick || item.hint, isDark ? 'text-amber-100' : 'text-amber-950')}
                      </div>
                    </div>
                  )}

                  {/* 360° Detailed Explanation Toggle */}
                  {item.explanation && (item.explanation.inNews || (item.explanation.keyPoints && item.explanation.keyPoints.length > 0) || (item.explanation.additionalInfo && item.explanation.additionalInfo.length > 0)) && (() => {
                    const isExpOpen = !!openExplanations[item.id];
                    return (
                      <div className="mt-2.5">
                        <button
                          onClick={() => toggleExp(item.id)}
                          className={`w-full py-2 px-3 rounded-xl border text-[11px] font-black flex items-center justify-between transition-all active:scale-95 shadow-sm cursor-pointer ${
                            isDark 
                              ? 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/50' 
                              : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-book-open"></i>
                            <span>{isExpOpen ? "Hide Explanation" : "📖 View 360° Explanation"}</span>
                          </span>
                          <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${isExpOpen ? 'rotate-180' : ''}`}></i>
                        </button>

                        {isExpOpen && (
                          <div className="mt-2 space-y-2 text-xs leading-relaxed animate-fade-in-app">
                            {item.explanation.inNews && (
                              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-blue-950/20 border-blue-500/30 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'}`}>
                                <strong className={`block mb-1 text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                  📰 In News
                                </strong>
                                <p className="font-medium leading-relaxed">{item.explanation.inNews}</p>
                              </div>
                            )}

                            {item.explanation.keyPoints && item.explanation.keyPoints.length > 0 && (
                              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'}`}>
                                <strong className={`block mb-1 text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                  🎯 Key Points
                                </strong>
                                <div className="space-y-1 font-medium">
                                  {item.explanation.keyPoints.map((pt, kpIdx) => (
                                    <div key={kpIdx} className="flex items-start gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                                      <span className="flex-1">{pt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.explanation.additionalInfo && item.explanation.additionalInfo.length > 0 && (
                              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-purple-950/20 border-purple-500/30 text-purple-200' : 'bg-purple-50/80 border-purple-200 text-purple-900'}`}>
                                <strong className={`block mb-1 text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                                  📝 Additional Information (Static GK)
                                </strong>
                                <div className="space-y-1 font-medium">
                                  {item.explanation.additionalInfo.map((pt, aiIdx) => (
                                    <div key={aiIdx} className="flex items-start gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                                      <span className="flex-1">{pt}</span>
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className={`text-sm ${textSub}`}>No matching mistakes found. Clear your search filters to view all.</p>
        </div>
      )}
      </div>

    </div>
  );
};
