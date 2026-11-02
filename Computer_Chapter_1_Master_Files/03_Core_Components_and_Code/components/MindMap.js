// ================================================================
//  MindMap.js — Reading Map (Visual Knowledge Tree & Rapid Scanning)
//  ✅ Left-to-Right Horizontal Tree Navigation
//  ✅ Root Hub (Left) ➔ Categories (Middle) ➔ Q&A Leaves (Right)
//  ✅ Minimalist Leaves: Question + Emerald Answer + Golden Trick
//  ✅ Direct Jump to Study Notes: [ 📖 Study Notes में विस्तार से देखें ➔ ]
//  ✅ Zero Bulky Text (Preserves Study Notes as primary deep learning powerhouse)
//  ✅ Category Filters, Search, Expand All / Collapse All
// ================================================================

const MindMap = ({
  questions = [],
  allQuestions = [],
  categories = [],
  theme = 'dark',
  month = 'जनवरी',
  year = 2026,
  searchQuery: externalSearchQuery = '',
  onOpenStudyCard
}) => {
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  // 🌟 Reading Map encompasses ALL 156 Questions across ALL Categories (Never filter out categories!)
  const sourceQuestions = React.useMemo(() => {
    if (allQuestions && allQuestions.length > 0) return allQuestions;
    if (window.caConfig && window.caConfig.questions && window.caConfig.questions.length > 0) return window.caConfig.questions;
    if (questions && questions.length > 0) return questions;
    return [];
  }, [allQuestions, questions]);

  // Selected category in Tree Mode ('all' or category ID)
  const [selectedCatId, setSelectedCatId] = React.useState('all');
  const rightStreamRef = React.useRef(null);

  // ⚡ Instant scroll-to-top reset on category change (0ms animated delay)
  React.useEffect(() => {
    if (rightStreamRef.current) {
      rightStreamRef.current.scrollTop = 0;
    }
  }, [selectedCatId]);
  
  // Expanded questions set (for trick / details toggle)
  const [expandedQs, setExpandedQs] = React.useState(new Set());

  // Search Query (Synced with external or local)
  const [searchQuery, setSearchQuery] = React.useState(externalSearchQuery || '');

  // 📍 Checkpoint State in Reading Map (Synced with globals / localStorage)
  const [checkpoint, setCheckpoint] = React.useState(() => {
    return window.getReadingCheckpoint ? window.getReadingCheckpoint('all') : null;
  });
  const [showBanner, setShowBanner] = React.useState(true);

  // Sync checkpoint on mount & on real-time update
  React.useEffect(() => {
    if (window.getReadingCheckpoint) {
      const cp = window.getReadingCheckpoint(selectedCatId || 'all');
      if (cp) setCheckpoint(cp);
    }
    const handleCpUpdate = () => {
      if (window.getReadingCheckpoint) {
        const cp = window.getReadingCheckpoint(selectedCatId || 'all');
        setCheckpoint(cp);
      }
    };
    window.addEventListener('ca_reading_checkpoint_updated', handleCpUpdate);
    return () => window.removeEventListener('ca_reading_checkpoint_updated', handleCpUpdate);
  }, [selectedCatId]);

  const handleMarkLastRead = (q) => {
    const isAlready = checkpoint && String(checkpoint.id) === String(q.id);
    if (isAlready) {
      if (window.clearReadingCheckpoint) {
        window.clearReadingCheckpoint('all');
        if (q.category) window.clearReadingCheckpoint(q.category);
      }
      setCheckpoint(null);
      setShowBanner(false);
    } else {
      if (window.setReadingCheckpoint) {
        window.setReadingCheckpoint('all', q);
        if (q.category) window.setReadingCheckpoint(q.category, q);
      }
      const cp = window.getReadingCheckpoint ? window.getReadingCheckpoint('all') : null;
      setCheckpoint(cp || q);
      setShowBanner(true);
    }
  };

  const handleContinueReading = () => {
    if (!checkpoint) return;
    if (checkpoint.category && selectedCatId !== checkpoint.category && selectedCatId !== 'all') {
      setSelectedCatId(checkpoint.category);
    }
    setTimeout(() => {
      const el = document.getElementById(`tree-leaf-${checkpoint.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-emerald-400');
        setTimeout(() => {
          if (el) el.classList.remove('ring-4', 'ring-emerald-400');
        }, 2500);
        setShowBanner(false);
      }
    }, 150);
  };

  const handleStartOver = () => {
    if (window.clearReadingCheckpoint) {
      window.clearReadingCheckpoint('all');
      if (checkpoint && checkpoint.category) window.clearReadingCheckpoint(checkpoint.category);
    }
    setCheckpoint(null);
    setShowBanner(false);
    setSelectedCatId('all');
    const scrollContainer = document.querySelector('.main-scroll');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Group questions by category (excluding 'all' to prevent duplicate 0 Qs entry)
  const categoryGroups = React.useMemo(() => {
    const map = {};
    (categories || []).forEach(c => {
      if (c && c.id && c.id !== 'all') {
        map[c.id] = { meta: c, questions: [] };
      }
    });

    (sourceQuestions || []).forEach(q => {
      const cat = q.category || 'misc';
      if (cat !== 'all') {
        if (!map[cat]) {
          map[cat] = { meta: { id: cat, label: cat, color: 'slate', icon: 'fa-circle-question' }, questions: [] };
        }
        map[cat].questions.push(q);
      }
    });

    // Keep only populated categories
    const cleanMap = {};
    Object.entries(map).forEach(([k, v]) => {
      if (v.questions && v.questions.length > 0) {
        cleanMap[k] = v;
      }
    });

    return cleanMap;
  }, [sourceQuestions, categories]);

  // Filtered categories and questions based on search
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return categoryGroups;
    const query = searchQuery.toLowerCase().trim();
    const result = {};

    Object.entries(categoryGroups).forEach(([catId, group]) => {
      const matchedQs = group.questions.filter(q => 
        (q.question || '').toLowerCase().includes(query) ||
        (q.answer || '').toLowerCase().includes(query) ||
        (q.memoryTrick || '').toLowerCase().includes(query) ||
        (group.meta.label || '').toLowerCase().includes(query)
      );

      if (matchedQs.length > 0) {
        result[catId] = {
          ...group,
          questions: matchedQs
        };
      }
    });

    return result;
  }, [categoryGroups, searchQuery]);

  // Total questions count in filtered set
  const totalFilteredCount = React.useMemo(() => {
    return Object.values(filteredGroups).reduce((acc, g) => acc + g.questions.length, 0);
  }, [filteredGroups]);

  // Active category questions for Right Leaf Stream (Strictly sorted by Serial Number 1..N in 'all' mode)
  const activeTreeQuestions = React.useMemo(() => {
    if (selectedCatId === 'all') {
      const baseList = [...sourceQuestions].sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
      if (!searchQuery.trim()) {
        return baseList;
      }
      const q = searchQuery.toLowerCase().trim();
      return baseList.filter(item => 
        (item.question || '').toLowerCase().includes(q) ||
        (item.answer || '').toLowerCase().includes(q) ||
        (item.memoryTrick || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }
    return (filteredGroups[selectedCatId] && filteredGroups[selectedCatId].questions) || [];
  }, [selectedCatId, filteredGroups, sourceQuestions, searchQuery]);

  // 🎯 Category question sequence map: For each question ID, calculate { catIndex, catTotal }
  const catStatsMap = React.useMemo(() => {
    const map = {};
    const catListMap = {};

    (sourceQuestions || []).forEach(q => {
      const cat = q.category || 'misc';
      if (!catListMap[cat]) catListMap[cat] = [];
      catListMap[cat].push(q);
    });

    Object.values(catListMap).forEach(list => {
      const total = list.length;
      list.forEach((q, idx) => {
        map[String(q.id)] = {
          catIndex: idx + 1,
          catTotal: total
        };
      });
    });

    return map;
  }, [sourceQuestions]);

  // Find index of current checkpoint in the active stream (for auto-checking read questions)
  const checkpointIdx = React.useMemo(() => {
    if (!checkpoint || !activeTreeQuestions || !activeTreeQuestions.length) return -1;
    return activeTreeQuestions.findIndex(q => String(q.id) === String(checkpoint.id));
  }, [checkpoint, activeTreeQuestions]);

  const toggleQuestionExpand = (qId) => {
    setExpandedQs(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleExpandAll = () => {
    const allQIds = new Set((sourceQuestions || []).map(q => q.id));
    setExpandedQs(allQIds);
  };

  const handleCollapseAll = () => {
    setExpandedQs(new Set());
  };

  // Color mapping helper
  const getCatColorClasses = (color = 'slate', isSelected = false) => {
    const colorMap = {
      blue: isDark ? 'border-blue-500/60 bg-blue-950/40 text-blue-300' : 'border-blue-300 bg-blue-50 text-blue-800',
      green: isDark ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' : 'border-emerald-300 bg-emerald-50 text-emerald-800',
      amber: isDark ? 'border-amber-500/60 bg-amber-950/40 text-amber-300' : 'border-amber-300 bg-amber-50 text-amber-800',
      purple: isDark ? 'border-purple-500/60 bg-purple-950/40 text-purple-300' : 'border-purple-300 bg-purple-50 text-purple-800',
      rose: isDark ? 'border-rose-500/60 bg-rose-950/40 text-rose-300' : 'border-rose-300 bg-rose-50 text-rose-800',
      teal: isDark ? 'border-teal-500/60 bg-teal-950/40 text-teal-300' : 'border-teal-300 bg-teal-50 text-teal-800',
      indigo: isDark ? 'border-indigo-500/60 bg-indigo-950/40 text-indigo-300' : 'border-indigo-300 bg-indigo-50 text-indigo-800',
      pink: isDark ? 'border-pink-500/60 bg-pink-950/40 text-pink-300' : 'border-pink-300 bg-pink-50 text-pink-800',
      cyan: isDark ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300' : 'border-cyan-300 bg-cyan-50 text-cyan-800',
      slate: isDark ? 'border-slate-700 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-800'
    };

    const selectedGlow = isDark 
      ? 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]' 
      : 'ring-2 ring-violet-500 shadow-md scale-[1.02]';

    return `${colorMap[color] || colorMap.slate} ${isSelected ? selectedGlow : 'hover:scale-[1.01]'}`;
  };

  const bgPanel = isDark 
    ? 'bg-slate-900/70 border-slate-800 text-slate-100' 
    : isWarm 
    ? 'bg-[#f4ecdb]/80 border-[#e2d2ad] text-[#4a3b32]' 
    : 'bg-white/80 border-slate-200 text-slate-900';

  const cardBg = isDark 
    ? 'bg-slate-950/80 border-slate-800/80 text-slate-100 hover:border-slate-700' 
    : isWarm 
    ? 'bg-[#faf6ee] border-[#ebdcb9] text-[#4a3b32] hover:border-amber-300' 
    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';

  return (
    <div className="w-full max-w-[1700px] mx-auto px-1 sm:px-2 py-1 flex flex-col h-full min-h-0 overflow-hidden animate-fade-in-app">
      
      {/* ── TOP CONTROL & ACTION TOOLBAR (Ultra-Sleek & Space-Optimized) ── */}
      <div className={`px-2.5 sm:px-3 py-1.5 rounded-xl border shadow-xs backdrop-blur-md mb-1.5 sm:mb-2 flex items-center justify-between gap-2 shrink-0 ${bgPanel}`}>
        
        {/* Left: Title & Quick Counter */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xs shrink-0 text-xs">
            <i className="fa-solid fa-sitemap"></i>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-black leading-tight truncate flex items-center gap-1.5">
              <span>🌳 {month} {year} Reading Map</span>
            </h2>
            <span className="text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold hidden sm:inline">
              {totalFilteredCount} प्रश्न • {Object.keys(filteredGroups).length} कैटेगरीज
            </span>
          </div>
        </div>

        {/* Right: Search & Expand Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Internal Filter */}
          <div className="relative w-32 xs:w-40 sm:w-52">
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ट्री में खोजें..."
              className={`w-full pl-7 pr-6 py-1 rounded-lg border text-[11px] font-medium outline-none transition-all ${
                isDark 
                  ? 'bg-slate-950/80 border-slate-800 text-slate-100 focus:border-amber-400' 
                  : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Expand All / Collapse All */}
          <button
            onClick={handleExpandAll}
            title="सभी प्रश्नों की ट्रिक्स खोलें"
            className="px-2 py-1 rounded-lg border text-[10.5px] font-bold transition-all active:scale-95 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <i className="fa-solid fa-up-right-and-down-left-from-center text-[8.5px]"></i>
            <span className="hidden sm:inline">Expand</span>
          </button>
          <button
            onClick={handleCollapseAll}
            title="सभी ट्रिक्स समेटें"
            className="px-2 py-1 rounded-lg border text-[10.5px] font-bold transition-all active:scale-95 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <i className="fa-solid fa-down-left-and-up-right-to-center text-[8.5px]"></i>
            <span className="hidden sm:inline">Collapse</span>
          </button>
        </div>
      </div>

      {/* ── 🌳 LEFT-TO-RIGHT HORIZONTAL READING MAP TREE ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-5 min-h-0 overflow-hidden">
        
        {/* ════ COLUMN 1 & 2: ROOT HUB + CATEGORIES (LEFT ANCHOR) ════ */}
        <div className="lg:w-[380px] xl:w-[410px] shrink-0 h-full flex flex-col gap-2.5 overflow-y-auto pr-1 main-scroll pb-16">
          
          {/* 🌟 ROOT NODE: Master Knowledge Hub */}
          <div 
            onClick={() => setSelectedCatId('all')}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer shadow-lg relative overflow-hidden ${
              selectedCatId === 'all'
                ? 'border-amber-500 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-indigo-500/15 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : `${bgPanel} hover:border-amber-400/50`
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                🌟 ROOT KNOWLEDGE HUB
              </span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                {totalFilteredCount} Questions
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black leading-snug">
              🌍 {month} {year} All Topics Hub
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              सभी कैटेगरीज के संपूर्ण 156 प्रश्नों का विजुअल ट्री
            </p>
          </div>

          {/* 🌳 CATEGORY NODES LIST */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <i className="fa-solid fa-code-branch"></i> टॉपिक शाखाएं (Categories)
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {Object.keys(filteredGroups).length} शाखाएं
            </span>
          </div>

          <div className="space-y-2 pb-6">
            {/* 🌟 1. All Categories / All Topics (Serial 1 to N) Option */}
            <div
              onClick={() => setSelectedCatId('all')}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${getCatColorClasses('indigo', selectedCatId === 'all')}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm shrink-0 font-bold">
                  <i className="fa-solid fa-layer-group"></i>
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold truncate leading-snug">
                    All Categories (सीरियल 1 से {sourceQuestions.length})
                  </h4>
                  <span className="text-[10px] opacity-75 font-medium">
                    सम्पूर्ण {sourceQuestions.length} प्रश्न क्रमानुसार
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/10 dark:bg-white/10">
                  {sourceQuestions.length} Qs
                </span>
                <i className={`fa-solid fa-chevron-right text-xs transition-transform duration-200 ${selectedCatId === 'all' ? 'translate-x-1 text-amber-500' : 'opacity-40'}`}></i>
              </div>
            </div>

            {Object.entries(filteredGroups).map(([catId, group]) => {
              const isSelected = selectedCatId === catId;
              const count = group.questions.length;
              const meta = group.meta;

              return (
                <div
                  key={catId}
                  onClick={() => setSelectedCatId(catId)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${getCatColorClasses(meta.color, isSelected)}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center text-sm shrink-0 font-bold">
                      <i className={`fa-solid ${meta.icon || 'fa-folder-open'}`}></i>
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate leading-snug">
                        {meta.label}
                      </h4>
                      <span className="text-[10px] opacity-75 font-medium">
                        {count} प्रश्न उपलब्ध
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {checkpoint && (checkpoint.category === catId || (!checkpoint.category && catId === 'all')) && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-2xs" title={`Active Reading Checkpoint at Q#${checkpoint.id}`}>
                        <i className="fa-solid fa-bookmark text-[8px]"></i>
                        <span className="hidden sm:inline">Q#{checkpoint.id}</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/10 dark:bg-white/10">
                      {count} Qs
                    </span>
                    <i className={`fa-solid fa-chevron-right text-xs transition-transform duration-200 ${isSelected ? 'translate-x-1 text-amber-500' : 'opacity-40'}`}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════ COLUMN 3: QUESTION & ANSWER RAPID READING LEAVES (RIGHT STREAM) ════ */}
        <div className="flex-1 h-full flex flex-col min-h-0 bg-slate-500/5 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-3 sm:p-4 overflow-hidden">
          
          {/* Active Branch Header Banner */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                <i className="fa-solid fa-arrow-right-long mr-1"></i> 
                {selectedCatId === 'all' ? 'सभी टॉपिक्स' : (filteredGroups[selectedCatId] && filteredGroups[selectedCatId].meta ? filteredGroups[selectedCatId].meta.label : 'टॉपिक')}
              </span>
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 truncate">
                ({activeTreeQuestions.length} प्रश्न उपलब्ध)
              </span>
            </div>

            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
              विस्तार से पढ़ने के लिए Study Notes बटन दबाएं
            </span>
          </div>

          {/* Questions Stream */}
          <div ref={rightStreamRef} className="flex-1 overflow-y-auto space-y-3 pr-1.5 main-scroll pb-20">
            {/* ── 🔖 Checkpoint Resume Banner in Reading Map ── */}
            {checkpoint && showBanner && (
              <div className={`p-3 rounded-2xl border-2 transition-all shadow-md mb-3 animate-fade-in-app ${
                isDark 
                  ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/50 text-emerald-200' 
                  : 'bg-gradient-to-r from-emerald-50 via-teal-50/80 to-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 w-full">
                  <div className="flex items-start gap-2 min-w-0 w-full sm:flex-1">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      <i className="fa-solid fa-bookmark"></i>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
                          LAST READ: Q#{checkpoint.id}
                        </span>
                        {checkpoint.category && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-[9px] font-bold text-emerald-800 dark:text-emerald-200">
                            {checkpoint.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight break-words">
                        {checkpoint.question}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto shrink-0 pt-0.5 sm:pt-0">
                    <button
                      onClick={handleContinueReading}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-xs active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-forward-step text-[9px]"></i>
                      <span className="truncate">Jump Q#{checkpoint.id}</span>
                    </button>
                    <button
                      onClick={handleStartOver}
                      className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                        isDark ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700' : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs'
                      }`}
                      title="Clear Checkpoint"
                    >
                      <i className="fa-solid fa-rotate-left text-[9px]"></i>
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTreeQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <i className="fa-solid fa-filter-circle-xmark text-4xl mb-3 opacity-50"></i>
                <p className="text-sm font-bold">कोई प्रश्न नहीं मिला</p>
                <p className="text-xs opacity-75">सर्च शब्द बदलें या दूसरी कैटेगरी चुनें</p>
              </div>
            ) : (
              activeTreeQuestions.map((q, idx) => {
                const isExpanded = expandedQs.has(q.id);
                const qNum = q.bookQNum || q.id || (idx + 1);
                const isCurrentCheckpoint = checkpointIdx !== -1 && idx === checkpointIdx;
                const isReadSoFar = checkpointIdx !== -1 && idx <= checkpointIdx;

                return (
                  <div
                    key={q.id || idx}
                    id={`tree-leaf-${q.id}`}
                    data-qid={q.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 shadow-xs ${cardBg} ${
                      isCurrentCheckpoint 
                        ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10 border-emerald-500/80' 
                        : isReadSoFar 
                        ? 'border-emerald-400/50 dark:border-emerald-700/50 bg-emerald-50/15 dark:bg-emerald-950/15' 
                        : ''
                    }`}
                  >
                    {/* Leaf Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {/* 1. Master Global Serial Number */}
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-600 text-white shadow-2xs">
                          Q.{qNum}
                        </span>

                        {/* 2. Category Question Sequence Badge (Question X of Y) — ONLY shown when a specific category is selected */}
                        {selectedCatId !== 'all' && (
                          <span className="px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700/80 flex items-center gap-1 shadow-2xs" title={`Category Question ${idx + 1} of ${activeTreeQuestions.length}`}>
                            <i className="fa-solid fa-bullseye text-[8.5px] text-violet-500"></i>
                            <span>Q. {idx + 1} of {activeTreeQuestions.length}</span>
                          </span>
                        )}

                        {/* 3. Category Label (when viewing 'all' topics mode) */}
                        {selectedCatId === 'all' && q.category && (
                          <span className="px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {((categories || []).find(c => c.id === q.category) || {}).label || q.category}
                          </span>
                        )}

                        {isReadSoFar && !isCurrentCheckpoint && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/30" title="Read so far">
                            <i className="fa-solid fa-check text-[9px]"></i>
                            <span>Read</span>
                          </span>
                        )}
                        {isCurrentCheckpoint && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-2xs" title="Current Reading Checkpoint">
                            <i className="fa-solid fa-bookmark text-[9px]"></i>
                            <span>Checkpoint</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <i className="fa-solid fa-calendar-days text-[9px] text-emerald-500 mr-1"></i>
                          {(q.date || "2026").replace(/^:\s*/, '')}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {q.examTag || "EXAM FOCUS"}
                        </span>
                      </div>

                      {/* Right Controls: Trick Toggle & Mark Read Checkpoint Button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {q.memoryTrick && (
                          <button
                            onClick={() => toggleQuestionExpand(q.id)}
                            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer mr-1"
                          >
                            <i className="fa-solid fa-lightbulb text-[10px]"></i>
                            <span>{isExpanded ? 'ट्रिक छिपाएं' : 'ट्रिक'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleMarkLastRead(q)}
                          className={`py-1 px-2.5 rounded-lg border text-[10.5px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer group ${
                            isCurrentCheckpoint
                              ? 'bg-emerald-600 hover:bg-rose-600 active:bg-rose-600 text-white border-emerald-500 hover:border-rose-500 shadow-xs ring-1 ring-emerald-400/40'
                              : isReadSoFar
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                              : (isDark ? 'bg-slate-800/90 text-slate-300 hover:text-emerald-400 border-slate-700' : 'bg-slate-100 text-slate-600 hover:text-emerald-600 border-slate-200')
                          }`}
                          title={isCurrentCheckpoint ? "Click or tap to clear checkpoint" : "Set as Reading Checkpoint"}
                        >
                          {isCurrentCheckpoint ? (
                            <React.Fragment>
                              <i className="fa-solid fa-check text-white group-hover:hidden text-[9px]"></i>
                              <i className="fa-solid fa-xmark hidden group-hover:inline text-white text-[9.5px]"></i>
                              <span className="group-hover:hidden flex items-center gap-1 font-black">
                                Saved <span className="opacity-80 text-[9px] sm:hidden">✕</span>
                              </span>
                              <span className="hidden group-hover:inline font-black">Clear ✕</span>
                            </React.Fragment>
                          ) : isReadSoFar ? (
                            <React.Fragment>
                              <i className="fa-solid fa-check text-emerald-600 dark:text-emerald-400 text-[9px]"></i>
                              <span>Read</span>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              <i className="fa-regular fa-bookmark text-slate-400 text-[9.5px]"></i>
                              <span>Mark Read</span>
                            </React.Fragment>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Question Text (Ergonomic Reading Typography: 14.5px-15.5px with Relaxed Line-Height) */}
                    <h4 className="text-[14px] sm:text-[15.5px] font-bold leading-relaxed mb-2.5 text-left text-slate-900 dark:text-slate-100">
                      {q.question}
                    </h4>

                    {/* Direct Answer (Gleaming High-Contrast Emerald Box) */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/40 text-emerald-950 dark:text-emerald-200 mb-2.5 flex items-start gap-2.5 shadow-2xs">
                      <i className="fa-solid fa-circle-check text-emerald-500 text-base mt-0.5 shrink-0"></i>
                      <div className="text-left">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
                          सटीक उत्तर (Correct Answer)
                        </span>
                        <span className="text-[14px] sm:text-[15.5px] font-black leading-relaxed text-emerald-800 dark:text-emerald-300">
                          {q.answer}
                        </span>
                      </div>
                    </div>

                    {/* Memory Trick (Expanded / Default) */}
                    {isExpanded && q.memoryTrick && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/35 text-amber-950 dark:text-amber-100 text-left text-xs sm:text-[13px] leading-relaxed font-semibold animate-fade-in-app mb-2.5">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                          <i className="fa-solid fa-lightbulb text-amber-500"></i>
                          <span>Memory Trick</span>
                        </div>
                        <p className="leading-relaxed font-bold">{q.memoryTrick}</p>
                      </div>
                    )}

                    {/* 🚀 Direct Jump Button to Study Notes Card */}
                    <button
                      onClick={() => onOpenStudyCard && onOpenStudyCard(q)}
                      title="Study Notes में इस प्रश्न का पूरा 360° विवरण देखें"
                      className="w-full mt-1 py-1.5 px-3 rounded-lg text-xs font-black border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 hover:from-violet-500/20 hover:to-indigo-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer shadow-2xs"
                    >
                      <i className="fa-solid fa-book-open text-[11px]"></i>
                      <span>Study Notes में 360° विस्तार से पढ़ें ➔</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
