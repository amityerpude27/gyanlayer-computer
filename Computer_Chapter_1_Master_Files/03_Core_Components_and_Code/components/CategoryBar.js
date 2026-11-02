// ================================================================
//  CategoryBar.js — Category Filter + Search + PDF
//
//  ✅ Dynamic Sorting & Filtering based on Predefined Master Sequence
//  ✅ Limit of 6 on mobile, 12 on PC viewports
//  ✅ Expandable Flex-Wrap Layout (Kills popups/modals)
//  ✅ Colorized premium Font Awesome icons instead of emojis
// ================================================================

// Color map: category color → Tailwind classes (active / inactive / inactiveWarm / inactiveDark)
const CAT_COLORS = {
  indigo: {
    active:   'bg-violet-600 text-white border-violet-600 shadow-[0_4px_12px_-2px_rgba(124,58,237,0.4)]',
    inactive: 'bg-white text-violet-700 border-violet-200 hover:border-violet-400 hover:bg-violet-50',
    inactiveWarm: 'bg-[#faf7ef] text-[#6e5d4f] border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-violet-400',
    inactiveDark: 'bg-slate-800 text-violet-400 border-slate-700 hover:border-violet-500 hover:bg-slate-800/80',
  },
  teal: {
    active:   'bg-teal-600 text-white border-teal-600 shadow-[0_4px_12px_-2px_rgba(13,148,136,0.4)]',
    inactive: 'bg-white text-teal-700 border-teal-200 hover:border-teal-400 hover:bg-teal-50',
    inactiveWarm: 'bg-[#faf7ef] text-teal-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-teal-400',
    inactiveDark: 'bg-slate-800 text-teal-400 border-slate-700 hover:border-teal-500 hover:bg-slate-800/80',
  },
  orange: {
    active:   'bg-orange-500 text-white border-orange-500 shadow-[0_4px_12px_-2px_rgba(249,115,22,0.4)]',
    inactive: 'bg-white text-orange-700 border-orange-200 hover:border-orange-400 hover:bg-orange-50',
    inactiveWarm: 'bg-[#faf7ef] text-orange-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-orange-400',
    inactiveDark: 'bg-slate-800 text-orange-400 border-slate-700 hover:border-orange-500 hover:bg-slate-800/80',
  },
  amber: {
    active:   'bg-amber-500 text-white border-amber-500 shadow-[0_4px_12px_-2px_rgba(245,158,11,0.4)]',
    inactive: 'bg-white text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    inactiveWarm: 'bg-[#faf7ef] text-amber-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-amber-400',
    inactiveDark: 'bg-slate-800 text-amber-400 border-slate-700 hover:border-amber-500 hover:bg-slate-800/80',
  },
  green: {
    active:   'bg-green-600 text-white border-green-600 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]',
    inactive: 'bg-white text-green-700 border-green-200 hover:border-green-400 hover:bg-green-50',
    inactiveWarm: 'bg-[#faf7ef] text-green-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-green-400',
    inactiveDark: 'bg-slate-800 text-green-400 border-slate-700 hover:border-green-500 hover:bg-slate-800/80',
  },
  red: {
    active:   'bg-red-600 text-white border-red-600 shadow-[0_4px_12px_-2px_rgba(220,38,38,0.4)]',
    inactive: 'bg-white text-red-700 border-red-200 hover:border-red-400 hover:bg-red-50',
    inactiveWarm: 'bg-[#faf7ef] text-red-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-red-400',
    inactiveDark: 'bg-slate-800 text-red-400 border-slate-700 hover:border-red-500 hover:bg-slate-800/80',
  },
  slate: {
    active:   'bg-slate-600 text-white border-slate-600 shadow-[0_4px_12px_-2px_rgba(75,85,99,0.4)]',
    inactive: 'bg-white text-slate-700 border-slate-300 hover:border-slate-505 hover:bg-slate-55',
    inactiveWarm: 'bg-[#faf7ef] text-slate-700 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-slate-500',
    inactiveDark: 'bg-slate-805 text-slate-300 border-slate-700 hover:bg-slate-700/80',
  },
  blue: {
    active:   'bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)]',
    inactive: 'bg-white text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    inactiveWarm: 'bg-[#faf7ef] text-blue-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-blue-400',
    inactiveDark: 'bg-slate-800 text-blue-400 border-slate-700 hover:border-blue-500 hover:bg-slate-800/80',
  },
  purple: {
    active:   'bg-purple-600 text-white border-purple-600 shadow-[0_4px_12px_-2px_rgba(147,51,234,0.4)]',
    inactive: 'bg-white text-purple-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50',
    inactiveWarm: 'bg-[#faf7ef] text-purple-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-purple-400',
    inactiveDark: 'bg-slate-800 text-purple-400 border-slate-700 hover:border-purple-500 hover:bg-slate-800/80',
  },
};

const MOTIVATION_QUOTES = [
  { icon: '🎯', text: 'Rank 1 Focus', color: 'from-violet-500/15 via-indigo-500/15 to-violet-500/15 border-violet-300/60 dark:border-violet-700/60 text-violet-700 dark:text-violet-300' },
  { icon: '🔥', text: 'Target 100%', color: 'from-amber-500/15 via-orange-500/15 to-amber-500/15 border-amber-300/60 dark:border-amber-700/60 text-amber-700 dark:text-amber-300' },
  { icon: '⚡', text: 'Active Recall', color: 'from-cyan-500/15 via-blue-500/15 to-cyan-500/15 border-cyan-300/60 dark:border-cyan-700/60 text-cyan-700 dark:text-cyan-300' },
  { icon: '💡', text: 'Smart Revision', color: 'from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border-emerald-300/60 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300' },
  { icon: '🚀', text: 'Top Aspirant', color: 'from-fuchsia-500/15 via-pink-500/15 to-fuchsia-500/15 border-fuchsia-300/60 dark:border-fuchsia-700/60 text-fuchsia-700 dark:text-fuchsia-300' },
  { icon: '✨', text: 'Stay Focused', color: 'from-purple-500/15 via-violet-500/15 to-purple-500/15 border-purple-300/60 dark:border-purple-700/60 text-purple-700 dark:text-purple-300' },
  { icon: '🏆', text: 'Daily Winner', color: 'from-yellow-500/15 via-amber-500/15 to-yellow-500/15 border-amber-400/60 dark:border-amber-600/60 text-amber-800 dark:text-amber-200' }
];

const CategoryBar = ({
  categories, selectedCategory, setSelectedCategory,
  searchQuery, setSearchQuery, theme, allQuestions,
  viewMode = 'grid', setViewMode
}) => {
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';
  const isYouTubeStudio = Boolean(window.caConfig && window.caConfig.isYouTubeStudio);
  const scrollRef = useRef(null);
  const [showRight, setShowRight] = useState(true);
  const [showLeft,  setShowLeft]  = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Dynamic rotating motivational pill timer (every 6 seconds)
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % MOTIVATION_QUOTES.length);
    }, 6000);
    return () => clearInterval(quoteTimer);
  }, []);

  const currentQuote = MOTIVATION_QUOTES[quoteIdx];

  const barBg      = isDark ? 'bg-slate-950' : isWarm ? 'bg-[#faf8f2]' : 'bg-slate-50';
  const borderCol  = isDark ? 'border-slate-800' : isWarm ? 'border-[#e8dcb5]' : 'border-slate-200';
  
  // Fade gradients per theme
  const fadeGradientLeft = isDark
    ? 'from-slate-950 to-transparent'
    : isWarm
    ? 'from-[#faf8f2] to-transparent'
    : 'from-slate-50 to-transparent';

  const fadeGradientRight = isDark
    ? 'from-slate-950 to-transparent'
    : isWarm
    ? 'from-[#faf8f2] to-transparent'
    : 'from-slate-50 to-transparent';

  const inputCls   = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
    : isWarm
    ? 'bg-[#f5ebd0] border-[#d8ccaf] text-[#4a3b32] placeholder-[#a6987c] focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20'
    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20';

  const handleScroll = (e) => {
    if (isExpanded) return;
    const el = e.target;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  // Scroll category bar horizontally on chevron click
  const scroll = (direction) => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmt = direction === 'left' ? -220 : 220;
      el.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  // Check overflow on load/resize/category changes
  const checkOverflow = () => {
    const el = scrollRef.current;
    if (el && !isExpanded) {
      setShowLeft(el.scrollLeft > 8);
      setShowRight(el.scrollWidth > el.clientWidth + 8);
    }
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [categories, isExpanded]);

  // Click-outside auto-close for dropdown menu
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  // Bind mouse drag-to-scroll & mouse wheel events to Category Bar
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e) => {
      if (isExpanded) return;
      if (e.button !== 0) return; // left click only
      isDown = true;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none'; // prevent text selection
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      el.style.cursor = 'grab';
    };

    const onMouseUp = () => {
      isDown = false;
      el.style.cursor = 'grab';
    };

    const onMouseMove = (e) => {
      if (!isDown || isExpanded) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 2.0; // Fast scroll speed multiplier
      el.scrollLeft = scrollLeft - walk;
    };

    const onWheel = (e) => {
      if (isExpanded) return;
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 2.2; // 2.2x fast smooth scrolling speed factor
      }
    };

    // Set initial cursor style
    el.style.cursor = 'grab';

    // Attach listeners
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('wheel', onWheel);
    };
  }, [isExpanded]);

  // Scroll Hint (Bounce effect on mount to visually hint horizontal scrollability)
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = scrollRef.current;
      if (el && el.scrollLeft === 0 && !isExpanded) {
        el.scrollTo({ left: 65, behavior: 'smooth' });
        const returnTimer = setTimeout(() => {
          if (el && el.scrollLeft <= 70) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }, 500);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const handlePdf = () => {
    const el = document.getElementById('study-notes-content');
    if (!el || typeof html2pdf === 'undefined') return;
    html2pdf().set({
      margin: 8,
      filename: `Computer_Awareness_${window.caConfig.month || 'Chapter_1'}_${window.caConfig.year}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
  };

  // --- Dynamic Category Filtering & Predefined Master Sequence Sorting ---
  const getMasterIndex = (id) => {
    const norm = (id || '').toLowerCase();
    if (norm === 'all') return 0;
    if (norm === 'world' || norm === 'first_world') return 1;
    if (norm === 'india' || norm === 'first_india') return 2;
    if (norm === 'sports' || norm === 'sport') return 3;
    if (norm === 'sci' || norm === 'science') return 4;
    if (norm === 'env' || norm === 'ecology') return 5;
    if (norm === 'economy' || norm === 'banking') return 6;
    if (norm === 'awards' || norm === 'appointments') return 7;
    if (norm === 'schemes' || norm === 'govt' || norm === 'yojana') return 8;
    if (norm === 'summits' || norm === 'conferences') return 9;
    if (norm === 'defense' || norm === 'security') return 10;
    if (norm === 'national' || norm === 'state') return 11;
    if (norm === 'intl' || norm === 'international') return 12;
    if (norm === 'indices' || norm === 'reports') return 13;
    if (norm === 'art' || norm === 'culture') return 14;
    if (norm === 'days' || norm === 'themes') return 15;
    if (norm === 'books' || norm === 'authors') return 16;
    if (norm === 'space' || norm === 'isro') return 17;
    if (norm === 'misc' || norm === 'miscellaneous') return 18;
    return 999;
  };

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('ca-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const sortedCategories = useMemo(() => {
    return (categories || [])
      .filter(cat => {
        const count = cat.id === 'all'
          ? allQuestions.length
          : allQuestions.filter(q => q.category === cat.id).length;
        return cat.id === 'all' || count > 0;
      })
      .sort((a, b) => getMasterIndex(a.id) - getMasterIndex(b.id));
  }, [categories, allQuestions]);

  // Main high-count categories (Count >= 5 or 'all') vs low-count categories (< 5 Qs)
  const mainCategories = useMemo(() => {
    return sortedCategories.filter(cat => {
      if (cat.id === 'all') return true;
      const count = allQuestions.filter(q => q.category === cat.id).length;
      return count >= 5;
    });
  }, [sortedCategories, allQuestions]);

  const lowCountCategories = useMemo(() => {
    return sortedCategories.filter(cat => {
      if (cat.id === 'all') return false;
      const count = allQuestions.filter(q => q.category === cat.id).length;
      return count < 5;
    });
  }, [sortedCategories, allQuestions]);

  const threshold = 12;
  const visibleCats = isMobile
    ? sortedCategories
    : mainCategories.slice(0, threshold);

  // 'More' Dropdown categories: Sorted in DESCENDING ORDER by Question Count (highest first)
  const remainingCats = useMemo(() => {
    if (isMobile) return [];
    const overflowFromMain = mainCategories.slice(threshold);
    const combined = [...overflowFromMain, ...lowCountCategories];
    return combined.sort((a, b) => {
      const countA = allQuestions.filter(q => q.category === a.id).length;
      const countB = allQuestions.filter(q => q.category === b.id).length;
      if (countB !== countA) return countB - countA; // Descending by Question Count
      return getMasterIndex(a.id) - getMasterIndex(b.id); // Master sequence tie-breaker
    });
  }, [mainCategories, lowCountCategories, isMobile, allQuestions]);

  const hasMore = !isMobile && remainingCats.length > 0;
  const isRemainingActive = remainingCats.some(cat => cat.id === selectedCategory);

  return (
    <div id="ca-category-bar" className={`${barBg} border-b ${borderCol} px-3 sm:px-5 ${viewMode === 'map' ? 'py-1.5' : 'pt-2.5 pb-2.5'} flex-shrink-0 transition-colors duration-300`}>

      {/* ── CATEGORY PILLS (Horizontal scroll / wrapped grid - Hidden in Reading Map mode to maximize vertical space) ── */}
      {viewMode !== 'map' && (
        <div className="relative flex items-center mx-auto w-fit max-w-full mb-3 group/pills">
          {/* Left Scroll Chevron (Desktop only - hidden when expanded) */}
          {!isExpanded && showLeft && (
          <button
            onClick={() => scroll('left')}
            className={`absolute left-1.5 z-20 hidden md:flex items-center justify-center w-7 h-7 rounded-full border shadow-md hover:scale-105 active:scale-90 transition-all duration-150 ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-350 hover:text-white' 
                : isWarm 
                ? 'bg-[#f4efe0] border-[#d8ccaf] text-[#4a3b32] hover:bg-[#e8dcbd]' 
                : 'bg-white border-slate-200 text-slate-605 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Scroll Left"
          >
            <i className="fa-solid fa-chevron-left text-[9px]"></i>
          </button>
        )}

        {/* Left fade gradient (hidden when expanded) */}
        {!isExpanded && showLeft && (
          <div className={`absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r ${fadeGradientLeft}`} />
        )}

        {/* Scrollable pill row with fast mouse wheel support */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onWheel={(e) => { if (e.deltaY) { e.currentTarget.scrollLeft += e.deltaY * 1.5; } }}
          className="category-bar w-full px-1 py-1 gap-2.5 flex overflow-x-auto whitespace-nowrap scrollbar-hide select-none"
        >
          {visibleCats.map(cat => {
            const isActive = selectedCategory === cat.id;
            const count = cat.id === 'all'
              ? allQuestions.length
              : allQuestions.filter(q => q.category === cat.id).length;
            
            const isAll = cat.id === 'all';
            const colorSet = CAT_COLORS[cat.color] || CAT_COLORS.indigo;
            
            let cls = '';
            if (isActive) {
              if (isAll) {
                cls = 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-[0_4px_12px_0_rgba(124,58,237,0.45)]';
              } else {
                cls = colorSet.active;
              }
            } else {
              cls = isDark 
                ? colorSet.inactiveDark 
                : isWarm 
                ? colorSet.inactiveWarm 
                : colorSet.inactive;
            }

            return (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] ${cls}`}
              >
                <i className={`${cat.icon} text-[13px] ${isActive ? 'text-white' : cat.iconColor || 'text-slate-405'}`}></i>
                <span>{cat.label}</span>
                <span className={`text-[10px] font-black rounded-full px-2 py-0.5 transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : isDark 
                    ? 'bg-slate-700/80 text-slate-300' 
                    : isWarm
                    ? 'bg-[#e5dcbe] text-[#4a3b32]'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
          
          {/* Scroll spacer padding so elements don't get hidden behind sticky More */}
          {hasMore && <div className="flex-shrink-0 w-8 h-8" />}
        </div>

        {/* Sticky More Button with Left Fade Gradient */}
        {hasMore && (
          <div ref={dropdownRef} className={`absolute right-0 top-0 bottom-0 flex items-center z-20 pl-7 select-none pointer-events-none bg-gradient-to-l ${
            isDark 
              ? 'from-slate-950 via-slate-950/80 to-transparent' 
              : isWarm 
              ? 'from-[#faf8f2] via-[#faf8f2]/80 to-transparent' 
              : 'from-slate-50 via-slate-50/80 to-transparent'
          }`}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-md transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto ${
                isRemainingActive
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-[0_4px_12px_0_rgba(124,58,237,0.45)]'
                  : isExpanded
                  ? (isDark ? 'bg-slate-800 border-violet-500 text-violet-400' : 'bg-slate-100 border-violet-500 text-violet-600')
                  : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : isWarm
                  ? 'bg-[#f4efe0] border-[#d8ccaf] text-[#4a3b32]'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
              title="More Topics"
            >
              <i className={`fa-solid ${isExpanded ? 'fa-xmark' : 'fa-ellipsis-vertical'} text-xs`}></i>
            </button>
            
            {/* Dropdown Menu for Remaining Categories */}
            {isExpanded && (
              <div className={`absolute right-0 top-full mt-2 p-2 rounded-xl border shadow-xl z-50 flex flex-col gap-1.5 min-w-[200px] pointer-events-auto max-h-[60vh] overflow-y-auto ${
                isDark ? 'bg-slate-900 border-slate-700 shadow-black/50' : isWarm ? 'bg-[#faf8f2] border-[#e0d5b0]' : 'bg-white border-slate-200'
              }`}>
                {remainingCats.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  const count = allQuestions.filter(q => q.category === cat.id).length;
                  const colorSet = CAT_COLORS[cat.color] || CAT_COLORS.indigo;
                  
                  let cls = isActive ? colorSet.active : (isDark ? colorSet.inactiveDark : isWarm ? colorSet.inactiveWarm : colorSet.inactive);

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsExpanded(false);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${cls}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <i className={`${cat.icon} text-sm ${isActive ? 'text-white' : cat.iconColor || 'text-slate-405'}`}></i>
                        <span>{cat.label}</span>
                      </div>
                      <span className={`text-[10.5px] font-black rounded-full px-2 py-0.5 transition-all ${
                        isActive ? 'bg-white/20 text-white' : isDark ? 'bg-slate-700/80 text-slate-300' : isWarm ? 'bg-[#e5dcbe] text-[#4a3b32]' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Right Scroll Chevron (Desktop only - hidden when sticky button is shown) */}
        {!hasMore && showRight && (
          <button
            onClick={() => scroll('right')}
            className={`absolute right-1.5 z-20 hidden md:flex items-center justify-center w-7 h-7 rounded-full border shadow-md hover:scale-105 active:scale-90 transition-all duration-150 ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' 
                : isWarm 
                ? 'bg-[#f4efe0] border-[#d8ccaf] text-[#4a3b32] hover:bg-[#e8dcbd]' 
                : 'bg-white border-slate-200 text-slate-605 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Scroll Right"
          >
            <i className="fa-solid fa-chevron-right text-[9px]"></i>
          </button>
        )}

        {/* Right fade gradient (hidden when expanded or when sticky button is shown) */}
        {!isExpanded && !hasMore && showRight && (
          <div className={`absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l ${fadeGradientRight}`} />
        )}
      </div>
      )}

      {/* ── SEARCH & VIEW SWITCHER ROW (Unified Modern Command Bar) ── */}
      <div className="flex items-center justify-between py-1 gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Left: Search Input Box */}
        <div className="relative flex-1 min-w-[200px] sm:max-w-md md:max-w-lg transition-all duration-300">
          {/* Left Magnifying Glass Icon */}
          <i className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs ${
            isDark ? 'text-slate-400' : isWarm ? 'text-[#9e9075]' : 'text-slate-400'
          }`}></i>
          
          {/* Rounded Pill Input Box */}
          <input
            id="ca-search-input"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-24 py-2 sm:py-2 rounded-full text-xs font-medium border outline-none shadow-xs transition-all duration-200 focus:ring-2 focus:ring-indigo-500/40 ${inputCls}`}
          />
          
          {/* Right Side Action / Dynamic Motivational Badge */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className={`pointer-events-auto w-6 h-6 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
                  isDark ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                }`}
                title="Clear search"
              >
                <i className="fa-solid fa-xmark text-[11px]"></i>
              </button>
            ) : (
              /* Dynamic Motivational Aspirant Pill */
              <div className={`shrink-0 hidden xs:flex items-center gap-1.5 text-[9px] sm:text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs select-none bg-gradient-to-r ${currentQuote.color} transition-all duration-500`}>
                <span className="text-[10.5px] leading-none">{currentQuote.icon}</span>
                <span className="font-black tracking-wide truncate max-w-[90px] sm:max-w-none">{currentQuote.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Modern Integrated View Switcher Pill (Desktop & Laptop Only) */}
        {setViewMode && (
          <div className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Standard Infographic Cards Grid"
            >
              <i className="fa-solid fa-table-cells-large text-[10.5px]"></i>
              <span>Cards Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Quick Left-to-Right Reading Map (Fast Topic Scanner)"
            >
              <i className="fa-solid fa-sitemap text-[10.5px]"></i>
              <span>Reading Map</span>
            </button>
            {isYouTubeStudio && (
              <button
                onClick={() => setViewMode('slide')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'slide'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="1-Question Full Presentation Slide (S Key)"
              >
                <i className="fa-solid fa-display text-[10.5px]"></i>
                <span>Slide Deck [S]</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
