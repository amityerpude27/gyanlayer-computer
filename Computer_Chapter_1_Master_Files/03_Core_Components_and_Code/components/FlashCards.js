// ================================================================
//  FlashCards.js  Flash Cards Tab (Tab 2)
//
//  ✅ EDIT THIS FILE FOR: Card flip design, control layout, audio
//  ✅ 3D Y-axis flip: Question (front)   Answer + Memory Trick (back)
//  ✅ 3D Y-axis flip: Question (front)    Answer + Memory Trick (back)
//  ✅ Premium slide transitions on next/prev swapping
//  ✅ Hierarchical Sub-Header Categorization: filters active deck
//  ✅ Interactive Sequential / Shuffle modes
//  ✅ Sound toggle + Synthesized sound effects (correct/wrong/flip)
//  ✅ Confetti rewards upon deck completion
//  ❌ DO NOT hardcode questions here   reads from globals.js via props
// ================================================================

// Color map: category color    Tailwind classes (active / inactive / inactiveWarm / inactiveDark)
const FLASH_CAT_COLORS = {
  indigo: {
    active:   'bg-violet-600 text-white border-violet-600 shadow-[0_4px_12px_-2px_rgba(124,58,237,0.4)]',
    inactive: 'bg-white text-violet-755 border-violet-200 hover:border-violet-400 hover:bg-violet-50',
    inactiveWarm: 'bg-[#faf7ef] text-[#6e5d4f] border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-violet-400',
    inactiveDark: 'bg-slate-800 text-violet-400 border-slate-700 hover:border-violet-500 hover:bg-slate-800/80',
  },
  teal: {
    active:   'bg-teal-600 text-white border-teal-600 shadow-[0_4px_12px_-2px_rgba(13,148,136,0.4)]',
    inactive: 'bg-white text-teal-755 border-teal-200 hover:border-teal-400 hover:bg-teal-50',
    inactiveWarm: 'bg-[#faf7ef] text-teal-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-teal-400',
    inactiveDark: 'bg-slate-800 text-teal-400 border-slate-700 hover:border-teal-500 hover:bg-slate-800/80',
  },
  orange: {
    active:   'bg-orange-500 text-white border-orange-500 shadow-[0_4px_12px_-2px_rgba(249,115,22,0.4)]',
    inactive: 'bg-white text-orange-755 border-orange-200 hover:border-orange-400 hover:bg-orange-50',
    inactiveWarm: 'bg-[#faf7ef] text-orange-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-orange-400',
    inactiveDark: 'bg-slate-800 text-orange-400 border-slate-700 hover:border-orange-500 hover:bg-slate-800/80',
  },
  amber: {
    active:   'bg-amber-500 text-white border-amber-500 shadow-[0_4px_12px_-2px_rgba(245,158,11,0.4)]',
    inactive: 'bg-white text-amber-755 border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    inactiveWarm: 'bg-[#faf7ef] text-amber-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-amber-400',
    inactiveDark: 'bg-slate-800 text-amber-400 border-slate-700 hover:border-amber-500 hover:bg-slate-800/80',
  },
  green: {
    active:   'bg-green-600 text-white border-green-600 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]',
    inactive: 'bg-white text-green-755 border-green-200 hover:border-green-400 hover:bg-green-50',
    inactiveWarm: 'bg-[#faf7ef] text-green-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-green-400',
    inactiveDark: 'bg-slate-800 text-green-400 border-slate-700 hover:border-green-500 hover:bg-slate-800/80',
  },
  red: {
    active:   'bg-red-600 text-white border-red-600 shadow-[0_4px_12px_-2px_rgba(220,38,38,0.4)]',
    inactive: 'bg-white text-red-755 border-red-200 hover:border-red-400 hover:bg-red-50',
    inactiveWarm: 'bg-[#faf7ef] text-red-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-red-400',
    inactiveDark: 'bg-slate-800 text-red-400 border-slate-700 hover:border-red-500 hover:bg-slate-800/80',
  },
  slate: {
    active:   'bg-slate-600 text-white border-slate-600 shadow-[0_4px_12px_-2px_rgba(75,85,99,0.4)]',
    inactive: 'bg-white text-slate-755 border-slate-300 hover:border-slate-500 hover:bg-slate-50',
    inactiveWarm: 'bg-[#faf7ef] text-slate-700 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-slate-500',
    inactiveDark: 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/80',
  },
  blue: {
    active:   'bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)]',
    inactive: 'bg-white text-blue-755 border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    inactiveWarm: 'bg-[#faf7ef] text-blue-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-indigo-400',
    inactiveDark: 'bg-slate-800 text-blue-400 border-slate-700 hover:border-blue-500 hover:bg-slate-800/80',
  },
  purple: {
    active:   'bg-purple-600 text-white border-purple-600 shadow-[0_4px_12px_-2px_rgba(147,51,234,0.4)]',
    inactive: 'bg-white text-purple-755 border-purple-200 hover:border-purple-400 hover:bg-purple-50',
    inactiveWarm: 'bg-[#faf7ef] text-purple-800 border-[#e0d5b0] hover:bg-[#f3eedc] hover:border-[#b45309]',
    inactiveDark: 'bg-slate-800 text-purple-400 border-slate-700 hover:border-purple-500 hover:bg-slate-800/80',
  },
};

const FlashCards = ({ questions, theme, addMistake, goToMistakes }) => {
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';
  const currentTheme = theme;

  const categories = (window.caConfig && window.caConfig.categories) ? window.caConfig.categories : [];

  // --- Category Sub-Header State ---
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollRef = useRef(null);
  const [showRight, setShowRight] = useState(true);
  const [showLeft,  setShowLeft]  = useState(false);

  // --- Flashcard Core States ---
  const [orderMode,        setOrderMode]        = useState('sequential');
  const [orderList,        setOrderList]        = useState([]);
  const [listIndex,        setListIndex]        = useState(0);
  const [isFlipped,        setIsFlipped]         = useState(false);
  const [transitionClass,  setTransitionClass]  = useState('');
  const [isCompleted,      setIsCompleted]      = useState(false);
  const [sessionMistakes,  setSessionMistakes]  = useState(0);
  const [confettiFired,    setConfettiFired]    = useState(false);
  const [isExpanded,       setIsExpanded]       = useState(false);

  // --- Anki Spaced Repetition States ---
  const [hardCount,        setHardCount]        = useState(0);
  const [goodCount,        setGoodCount]        = useState(0);
  const [masteredCount,    setMasteredCount]    = useState(0);

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

  const dropdownRef = useRef(null);

  // Click-outside auto-close for category dropdown menu
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

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMega = (window.caConfig && window.caConfig.mode === 'mega') || (window.caConfig && window.caConfig.questions && window.caConfig.questions.length >= 400);

  const sortedCategories = useMemo(() => {
    const allQs = questions || [];
    return (categories || [])
      .filter(cat => {
        const count = cat.id === 'all'
          ? allQs.length
          : allQs.filter(q => q && q.category === cat.id).length;
        return cat.id === 'all' || count > 0;
      })
      .sort((a, b) => getMasterIndex(a.id) - getMasterIndex(b.id));
  }, [categories, questions]);

  const mainCategories = useMemo(() => {
    const allQs = questions || [];
    return sortedCategories.filter(cat => {
      if (cat.id === 'all') return true;
      const count = allQs.filter(q => q && q.category === cat.id).length;
      return count >= 5;
    });
  }, [sortedCategories, questions]);

  const lowCountCategories = useMemo(() => {
    const allQs = questions || [];
    return sortedCategories.filter(cat => {
      if (cat.id === 'all') return false;
      const count = allQs.filter(q => q && q.category === cat.id).length;
      return count < 5;
    });
  }, [sortedCategories, questions]);

  const threshold = 12;
  const visibleCats = isMobile
    ? sortedCategories
    : mainCategories.slice(0, threshold);

  // 'More' Dropdown categories: Sorted in DESCENDING ORDER by Question Count (highest first)
  const remainingCats = useMemo(() => {
    if (isMobile) return [];
    const allQs = questions || [];
    const overflowFromMain = mainCategories.slice(threshold);
    const combined = [...overflowFromMain, ...lowCountCategories];
    return combined.sort((a, b) => {
      const countA = allQs.filter(q => q && q.category === a.id).length;
      const countB = allQs.filter(q => q && q.category === b.id).length;
      if (countB !== countA) return countB - countA; // Descending by Question Count
      return getMasterIndex(a.id) - getMasterIndex(b.id); // Master sequence tie-breaker
    });
  }, [mainCategories, lowCountCategories, isMobile, questions]);

  const hasMore = !isMobile && remainingCats.length > 0;
  const isRemainingActive = remainingCats.some(cat => cat.id === selectedCategory);

  // Local Toast notification
  const [toast, setToast] = useState({ message: '', icon: '', visible: false });

  // Dynamically filter deck based on category
  const filteredDeck = useMemo(() => {
    if (selectedCategory === 'all') return questions;
    return questions.filter(q => q.category === selectedCategory);
  }, [selectedCategory, questions]);

  // Re-generate orderList when orderMode or filteredDeck changes (instant reset pointers)
  useEffect(() => {
    let newOrder = filteredDeck.map((_, index) => index);
    if (orderMode === 'random') {
      for (let i = newOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
      }
    }
    setOrderList(newOrder);
    setListIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setSessionMistakes(0);
    setHardCount(0);
    setGoodCount(0);
    setMasteredCount(0);
    setConfettiFired(false);
  }, [orderMode, filteredDeck]);

  // Trigger celebration on deck completion
  useEffect(() => {
    if (isCompleted && sessionMistakes === 0 && !confettiFired) {
      setConfettiFired(true);
      if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 } });
      }
    }
  }, [isCompleted, sessionMistakes, confettiFired]);

  // --- Micro-interactions & Toast Helper ---
  const showToast = (message, icon = "✅") => {
    setToast({ message, icon, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2000);
  };

  // --- Category Bar Horizontal Scroll Helper ---
  const handleScroll = (e) => {
    const el = e.target;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmt = direction === 'left' ? -200 : 200;
      el.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  const checkOverflow = () => {
    const el = scrollRef.current;
    if (el) {
      setShowLeft(el.scrollLeft > 8);
      setShowRight(el.scrollWidth > el.clientWidth + 8);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  // Callback ref to dynamically bind/unbind event listeners even when DOM structure shifts
  const categoryBarRef = useCallback((el) => {
    // Cleanup previous element if any
    if (scrollRef.current && scrollRef.current._cleanupScrollListeners) {
      scrollRef.current._cleanupScrollListeners();
      scrollRef.current._cleanupScrollListeners = null;
    }

    scrollRef.current = el;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e) => {
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
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll speed multiplier
      el.scrollLeft = scrollLeft - walk;
    };

    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.85; // smooth scrolling speed factor
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

    // Store cleanup on node
    el._cleanupScrollListeners = () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // --- Core navigation handlers ---
  const changeCard = (direction, isForced = false) => {
    if (transitionClass && !isForced) return;
    
    if (direction === 'prev' && listIndex <= 0) {
      return;
    }

    if (direction === 'next' && listIndex >= orderList.length - 1) {
      setIsCompleted(true);
      return;
    }

    setTransitionClass(direction === 'next' ? 'animate-smooth-next' : 'animate-smooth-prev');
    
    setTimeout(() => {
      setIsFlipped(false);
      if (direction === 'next') setListIndex((prev) => Math.min(prev + 1, orderList.length - 1));
      else setListIndex((prev) => Math.max(0, prev - 1));
    }, 175); 

    setTimeout(() => {
      setTransitionClass('');
    }, 350);
  };

  const gradeCard = (rating) => {
    if (transitionClass || !orderList || orderList.length === 0) return;
    setTransitionClass('grading');

    const validIndex = (listIndex >= 0 && listIndex < orderList.length) ? listIndex : 0;
    const currentCard = (filteredDeck && orderList[validIndex] !== undefined) ? filteredDeck[orderList[validIndex]] : null;

    if (currentCard) {
      if (rating === 'hard' || rating === false) {
        if (addMistake && typeof addMistake === 'function') {
          addMistake(currentCard);
        }
        setHardCount(prev => prev + 1);
        setSessionMistakes(prev => prev + 1);

        // Anki Spaced Repetition Re-queue: Insert current question 3-4 cards later in the active deck
        const currentItemIndex = orderList[validIndex];
        const reinsertPos = Math.min(validIndex + 4, orderList.length);
        const updatedOrder = [...orderList];
        updatedOrder.splice(reinsertPos, 0, currentItemIndex);
        setOrderList(updatedOrder);
        showToast("🔴 Re-queued in 3 cards (Saved to Mistakes)", "🧠");
      } else { // 'easy' or true (Knew It!)
        setMasteredCount(prev => prev + 1);
        showToast("🟢 Knew It! (Mastered)", "🌟");
      }
    }

    setTimeout(() => {
      changeCard('next', true);
    }, 200);
  };

  // --- UI Styling Selectors ---
  const controlPanelBg = isDark
    ? 'bg-slate-900 border-slate-800'
    : isWarm
    ? 'bg-[#fcf8ee] border-[#ebdcb9]'
    : 'bg-white border-slate-100';

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-700'
    : isWarm
    ? 'bg-[#fcf8ee] border-[#ebdcb9]'
    : 'bg-white border-slate-200';

  const textMain = isDark ? 'text-slate-100' : isWarm ? 'text-[#3a2d26]' : 'text-slate-800';

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

  const trickBoxBg = isDark
    ? 'bg-slate-950/40 border-slate-800'
    : isWarm
    ? 'bg-[#f5ebd0] border-[#d8ccaf]'
    : 'bg-violet-50/50 border-violet-100';

  const trickTextCol = isDark
    ? 'text-slate-300'
    : isWarm
    ? 'text-[#5c4a35]'
    : 'text-violet-900';

  const renderCardText = (text, type = "question") => {
    const textStr = String(text || "");
    const len = textStr.length;
    
    const cardTextCol = currentTheme === 'dark' 
      ? 'text-slate-150 dark:text-slate-100' 
      : currentTheme === 'warm'
        ? 'text-[#3e3027]'
        : 'text-slate-800';

    let fontClass = "";
    if (type === "question") {
      if (len > 110) {
        fontClass = "font-bold text-[13.5px] sm:text-[15px] leading-relaxed";
      } else if (len > 60) {
        fontClass = "font-bold text-[15px] sm:text-[17px] leading-relaxed";
      } else {
        fontClass = "font-black text-[17px] sm:text-[19.5px] leading-relaxed";
      }
    } else { // answer
      if (len > 60) {
        fontClass = "font-extrabold text-[14.5px] sm:text-[16.5px] leading-relaxed text-amber-100";
      } else {
        fontClass = "font-black text-[17.5px] sm:text-[21px] leading-relaxed text-white";
      }
    }
    
    const colorClass = type === "question" ? cardTextCol : "";
    
    return (
      <span className={`text-center px-2 sm:px-4 max-w-full block select-text ${fontClass} ${colorClass}`}>
        {textStr}
      </span>
    );
  };


  // --- Dynamic category mapping helper: 100% matched with CategoryBar ---
  const getCategoryDetails = (catId) => {
    const categories = (window.caConfig && window.caConfig.categories) ? window.caConfig.categories : [];
    const cat = categories.find(c => c.id === catId);
    const label = cat ? cat.label.toUpperCase() : "GENERAL";
    const color = cat ? cat.color : "violet";
    
    // Directly pull the exact icon and iconColor configured in globals.js
    const fullIconClass = cat && cat.icon ? cat.icon : "fa-solid fa-layer-group";
    const iconColor = cat && cat.iconColor ? cat.iconColor : "text-violet-500";
    
    const colorMap = {
      violet: {
        icon: "text-violet-500",
        pill: "bg-violet-50/50 dark:bg-violet-950/10 border-violet-200 dark:border-violet-900/40 text-violet-600 dark:text-violet-400"
      },
      teal: {
        icon: "text-teal-500",
        pill: "bg-teal-50/50 dark:bg-teal-950/10 border-teal-200 dark:border-teal-900/40 text-teal-600 dark:text-teal-400"
      },
      orange: {
        icon: "text-orange-500",
        pill: "bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/40 text-orange-600 dark:text-orange-400"
      },
      amber: {
        icon: "text-amber-500",
        pill: "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400"
      },
      green: {
        icon: "text-green-500",
        pill: "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900/40 text-green-600 dark:text-green-400"
      },
      red: {
        icon: "text-rose-500",
        pill: "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400"
      },
      slate: {
        icon: "text-slate-500",
        pill: "bg-slate-50/50 dark:bg-slate-950/10 border-slate-200 dark:border-slate-800/40 text-slate-600 dark:text-slate-400"
      },
      fuchsia: {
        icon: "text-fuchsia-500",
        pill: "bg-fuchsia-50/50 dark:bg-fuchsia-950/10 border-fuchsia-200 dark:border-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400"
      },
      purple: {
        icon: "text-purple-500",
        pill: "bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900/40 text-purple-600 dark:text-purple-400"
      }
    };
    
    return {
      label,
      color,
      fullIconClass,
      iconColor,
      classes: colorMap[color] || colorMap.violet
    };
  };

  // --- Category Bar Rendering ---
  const renderCategoryBar = () => (
    <div className="relative flex items-center mx-auto w-fit max-w-full mb-4 sm:mb-8 px-2 select-none group/fc-pills">
      {/* Left Scroll Chevron (Desktop only - hidden when expanded) */}
      {!isExpanded && showLeft && (
        <button
          onClick={() => scroll('left')}
          className={`absolute left-3.5 z-20 hidden md:flex items-center justify-center w-7 h-7 rounded-full border shadow-md hover:scale-105 active:scale-90 transition-all duration-150 ${
            isDark 
              ? 'bg-slate-900 border-slate-700 text-slate-350 hover:text-white' 
              : isWarm 
              ? 'bg-[#f4efe0] border-[#d8ccaf] text-[#4a3b32] hover:bg-[#e8dcbd]' 
              : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Scroll Left"
        >
          <i className="fa-solid fa-chevron-left text-[9px]"></i>
        </button>
      )}

      {/* Left fade gradient (hidden when expanded) */}
      {!isExpanded && showLeft && (
        <div className={`absolute left-2 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r ${fadeGradientLeft}`} />
      )}

      {/* Scrollable pill row with fast mouse wheel support */}
      <div
        ref={categoryBarRef}
        onScroll={handleScroll}
        onWheel={(e) => { if (e.deltaY) { e.currentTarget.scrollLeft += e.deltaY * 1.5; } }}
        className="category-bar w-full px-1 py-1 gap-2.5 flex overflow-x-auto whitespace-nowrap scrollbar-hide"
      >
        {visibleCats.map(cat => {
          const isActive = selectedCategory === cat.id;
          const count = cat.id === 'all'
            ? questions.length
            : questions.filter(q => q.category === cat.id).length;
          
          const isAll = cat.id === 'all';
          const colorSet = FLASH_CAT_COLORS[cat.color] || FLASH_CAT_COLORS.indigo;
          
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
              id={`fc-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] ${cls}`}
            >
              <i className={`${cat.icon} text-[11px] sm:text-xs ${isActive ? 'text-white' : cat.iconColor || 'text-slate-400'}`}></i>
              <span>{cat.label}</span>
              <span className={`text-[9px] font-black rounded-full px-1.5 py-0.5 transition-all ${
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

      {/* Sticky More Button with Floating Dropdown Menu */}
      {hasMore && (
        <div ref={dropdownRef} className={`absolute right-1 top-0 bottom-0 flex items-center z-20 pl-7 select-none pointer-events-none bg-gradient-to-l ${
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
                : 'bg-white border-slate-205 text-slate-650 hover:bg-slate-50'
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
                const count = questions.filter(q => q.category === cat.id).length;
                const colorSet = FLASH_CAT_COLORS[cat.color] || FLASH_CAT_COLORS.indigo;
                
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
                      <i className={`${cat.icon} text-sm ${isActive ? 'text-white' : cat.iconColor || 'text-slate-400'}`}></i>
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

      {/* Right Scroll Chevron (Desktop only - hidden when expanded or when sticky button is shown) */}
      {!isExpanded && !hasMore && showRight && (
        <button
          onClick={() => scroll('right')}
          className={`absolute right-3.5 z-20 hidden md:flex items-center justify-center w-7 h-7 rounded-full border shadow-md hover:scale-105 active:scale-90 transition-all duration-150 ${
            isDark 
              ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' 
              : isWarm 
              ? 'bg-[#f4efe0] border-[#d8ccaf] text-[#4a3b32] hover:bg-[#e8dcbd]' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Scroll Right"
        >
          <i className="fa-solid fa-chevron-right text-[9px]"></i>
        </button>
      )}

      {/* Right fade gradient (hidden when expanded or when sticky button is shown) */}
      {!isExpanded && !hasMore && showRight && (
        <div className={`absolute right-2 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l ${fadeGradientRight}`} />
      )}
    </div>
  );

  // --- EMPTY STATE RENDERING ---
  if (orderList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-5 w-full">
        {renderCategoryBar()}
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <span className="text-5xl mb-4">📂</span>
          <p className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            इस category में कोई फ़्लैश कार्ड नहीं है।
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            कृपया कोई अन्य category चुनें।
          </p>
        </div>
      </div>
    );
  }

  // Active Deck values with 100% fail-safe fallback
  const validIndex = (listIndex >= 0 && listIndex < orderList.length) ? listIndex : 0;
  const currentCard = (filteredDeck && orderList && orderList[validIndex] !== undefined && filteredDeck[orderList[validIndex]]) 
    ? filteredDeck[orderList[validIndex]] 
    : (filteredDeck && filteredDeck[0]) ? filteredDeck[0] : (questions && questions[0]) ? questions[0] : {};

  const frontValue = currentCard.question || "कोई प्रश्न उपलब्ध नहीं है";
  const backValue  = currentCard.answer || "कोई उत्तर उपलब्ध नहीं है";

  return (
    <div className="flex flex-col items-center justify-start pt-3 px-1 pb-1 h-full w-full max-w-full">

      {/* Local Toast Alert */}
      <div 
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700/50 text-white text-[11px] sm:text-xs font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-400 pointer-events-none ease-out"
        style={{
          opacity: toast.visible ? 1 : 0,
          transform: toast.visible 
            ? 'translate(-50%, 0)' 
            : 'translate(-50%, -150%)',
          whiteSpace: 'nowrap'
        }}
      >
        <span className="text-sm sm:text-base leading-none">{toast.icon}</span>
        <span className="tracking-wide">{toast.message}</span>
      </div>

      {/* Category Bar Filter */}
      {renderCategoryBar()}

      {/* Control Switch Row (Sequential/Shuffle + Sound + Anki Stats) */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 items-center justify-center mb-3 sm:mb-4 w-full px-2">
        {/* 1. Sequential/Shuffle Switch */}
        <div className={`flex p-1 rounded-xl w-full max-w-[170px] sm:max-w-[210px] border ${controlPanelBg}`}>
          <button 
            onClick={() => setOrderMode('sequential')} 
            className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex justify-center items-center gap-0.5 sm:gap-1
              ${orderMode === 'sequential' 
                ? 'bg-violet-600 text-white shadow-xs' 
                : currentTheme === 'dark' 
                  ? 'text-slate-400 hover:bg-slate-800' 
                  : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Sequential
          </button>
          <button 
            onClick={() => setOrderMode('random')} 
            className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex justify-center items-center gap-0.5 sm:gap-1
              ${orderMode === 'random' 
                ? 'bg-fuchsia-500 text-white shadow-xs' 
                : currentTheme === 'dark' 
                  ? 'text-slate-400 hover:bg-slate-800' 
                  : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Shuffle
          </button>
        </div>

        {/* 2. Anki Live Memory Stats Tracker */}
        <div className={`flex items-center justify-center gap-2 sm:gap-2.5 py-1.5 px-3 rounded-xl border text-[10px] sm:text-xs font-black select-none ${controlPanelBg}`}>
          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1" title="Forgot (Re-queued in 3 cards & saved to Mistakes)">
            <span>🔴 Forgot:</span> <span>{hardCount}</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 font-normal">|</span>
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1" title="Knew It (Mastered)">
            <span>🟢 Knew It:</span> <span>{masteredCount}</span>
          </span>
        </div>
      </div>
      
      {/* ── CARD DISPLAY / COMPLETED Deck Screen ── */}
      {isCompleted ? (
        <div className={`flex flex-col items-center justify-center w-[92vw] max-w-[360px] sm:w-[420px] sm:max-w-none md:w-[480px] min-h-[350px] mx-auto animate-in zoom-in duration-500 rounded-2xl sm:rounded-3xl border shadow-sm p-5 sm:p-6 text-center mt-2
          ${currentTheme === 'dark' ? 'bg-slate-900 border-slate-800' : currentTheme === 'warm' ? 'bg-[#fcf8ee] border-[#ebdcb9]' : 'bg-white border-slate-100'}`}
        >
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🎉</div>
          <h2 className={`text-2xl sm:text-3xl font-black mb-1.5 ${currentTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Deck Completed!</h2>
          <p className="text-slate-500 font-bold mb-4 text-xs sm:text-sm">You reviewed all {orderList.length} flashcards.</p>
          
          {/* Anki Spaced Repetition Mastery Summary Grid */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-[300px] mx-auto mb-5">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-[10.5px] font-black text-rose-500 uppercase tracking-wider">Forgot (Weak)</p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">{hardCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-[10.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Knew It (Mastered)</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{masteredCount}</p>
            </div>
          </div>

          {sessionMistakes > 0 && (
             <button 
               onClick={goToMistakes}
               className="bg-rose-500/10 text-rose-500 px-4 py-3 rounded-xl mb-4 font-black text-[13px] sm:text-sm flex items-center justify-center gap-2 transition-all hover:bg-rose-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer w-full max-w-[280px] mx-auto border border-rose-500/20 shadow-sm"
             >
               <i className="fa-solid fa-triangle-exclamation text-lg"></i> Review {sessionMistakes} Weak Spots in Mistake Hub
               <i className="fa-solid fa-arrow-right ml-1"></i>
             </button>
          )}
          
          <button 
             onClick={() => {
               setListIndex(0);
               setIsCompleted(false);
               setSessionMistakes(0);
               setHardCount(0);
               setGoodCount(0);
               setMasteredCount(0);
               setIsFlipped(false);
               if (orderMode === 'random') {
                  let newOrder = [...orderList];
                  for (let i = newOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
                  }
                  setOrderList(newOrder);
               }
             }}
             className={`w-full py-3.5 sm:py-4 rounded-xl text-[13px] sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer
              ${currentTheme === 'dark' || currentTheme === 'warm' ? 'bg-violet-500/10 text-violet-500 border border-violet-500/20 hover:bg-violet-500/20' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
          >
             <i className="fa-solid fa-rotate-right text-lg"></i> Restart Deck
          </button>
        </div>
      ) : (
        <React.Fragment>
          {/* 📊 Sleek Micro-Progress Bar */}
          <div className="w-full max-w-[390px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[580px] mx-auto px-2 mb-2.5 sm:mb-3 flex items-center gap-2.5 select-none">
            <div className="flex-1 h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                style={{ width: `${((listIndex + 1) / orderList.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 font-mono tracking-tight shrink-0">
              {Math.round(((listIndex + 1) / orderList.length) * 100)}%
            </span>
          </div>

          {/* 🃏 The Master FlashCard Container (Crisp, Balanced & Proportional) */}
          <div 
            className={`perspective-1000 relative mx-auto w-[92vw] max-w-[390px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[580px] h-[310px] sm:h-[330px] md:h-[350px] cursor-pointer transition-transform duration-300 hover:scale-[1.01] ${transitionClass}`} 
            onClick={() => { if (!transitionClass) setIsFlipped(!isFlipped); }}
          >
            <div className={`relative w-full h-full preserve-3d rounded-3xl ${isFlipped ? 'rotate-y-180' : ''} ${transitionClass ? 'duration-0' : 'duration-700'}`}>
              
              {/* ── FRONT SIDE (The Hero Question Canvas) ── */}
              <div className={`absolute w-full h-full backface-hidden rounded-3xl border flex flex-col items-center justify-between p-4 sm:p-5 overflow-hidden transition-all duration-300
                ${currentTheme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)]' 
                  : currentTheme === 'warm'
                    ? 'bg-[#faf6ed] border-[#ebdcb9] text-[#4a3b32] shadow-[0_10px_30px_-8px_rgba(74,59,50,0.08)]'
                    : 'bg-white border-slate-200/90 text-slate-800 shadow-[0_10px_30px_-8px_rgba(99,102,241,0.08),0_2px_8px_rgba(0,0,0,0.04)]'}`}
              >
                 {/* Top Sub-Header Row: Guaranteed 100% Single Row on all Mobile Screens */}
                 <div className="w-full flex items-center justify-between select-none z-10 gap-1.5 min-w-0">
                    {/* Left Meta Group */}
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                       <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60 text-[10px] sm:text-xs font-black tracking-wide flex items-center gap-1 shrink-0">
                         <span>🧠</span>
                         <span>Think!</span>
                       </span>
                       <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 text-[9.5px] sm:text-xs font-bold shrink-0">
                         {listIndex + 1}/{orderList.length}
                       </span>
                       {isMega && currentCard.bookQNum && (
                         <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-sky-50/90 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 text-[9px] sm:text-xs font-black flex items-center gap-0.5 shrink-0">
                           <span>📖 Q.</span>
                           <span>{currentCard.bookQNum}</span>
                         </span>
                       )}
                    </div>

                    {/* Right Brand Group */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                       {currentCard.examTag && (
                         <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-rose-200/80 dark:border-rose-800/80 bg-rose-50/90 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[9px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0" title="Exam Focus">
                           <span className="text-[10px] sm:text-xs leading-none">🎯</span>
                           <span className="hidden sm:inline">{currentCard.examTag || "EXAM FOCUS"}</span>
                         </span>
                       )}
                       <div className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-[9.5px] font-black tracking-wider uppercase text-slate-500/90 dark:text-slate-400/90 bg-slate-100/90 dark:bg-slate-800/90 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-xs pointer-events-none select-none shrink-0" title="GyanLayer">
                         <img 
                           src={window.GYANLAYER_LOGO || "Logo Gyanlayer/clean_logo_512.png"} 
                           alt="GyanLayer" 
                           className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain inline-block shrink-0" 
                           onError={(e) => { e.target.onerror = null; if (window.GYANLAYER_LOGO) e.target.src = window.GYANLAYER_LOGO; }} 
                         />
                         <span className="hidden sm:inline">GYANLAYER</span>
                       </div>
                    </div>
                 </div>

                 {/* Main Content Area: Category + Question */}
                 <div className="w-full flex-1 flex flex-col items-center justify-center py-2 select-text">
                    {/* Floating Glowing Category Badge */}
                    {(() => {
                       const catDetails = getCategoryDetails(currentCard.category);
                       return (
                         <div className="flex flex-col items-center justify-center mb-2.5 select-none">
                           <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs mb-1.5 transition-transform hover:scale-105">
                             <i className={`${catDetails.fullIconClass} text-lg sm:text-xl ${catDetails.iconColor}`}></i>
                           </div>
                           <div className={`border rounded-full px-3.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-black tracking-wider uppercase shadow-xs ${catDetails.classes.pill}`}>
                              {catDetails.label}
                           </div>
                         </div>
                       );
                    })()}

                    {/* Question with Crisp Typography */}
                    <div className="w-full max-w-full px-3 sm:px-5 text-center mt-1">
                      <div className="text-[14.5px] sm:text-[16px] md:text-[17.5px] font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {renderCardText(frontValue, "question")}
                      </div>
                    </div>
                 </div>

                 {/* Bottom Indicator */}
                 <div className="w-full flex items-center justify-center select-none pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 text-violet-600 dark:text-violet-300 text-[10px] sm:text-xs font-black shadow-xs uppercase tracking-wider">
                       <i className="fa-solid fa-hand-point-up text-xs text-violet-500"></i> Tap to Flip
                    </span>
                 </div>
              </div>

              {/* ── BACK SIDE (Rich Vibrant Pink/Purple Bookish Canvas) ── */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl border border-purple-400/40 flex flex-col items-center justify-between p-4 sm:p-5 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-[0_16px_40px_-8px_rgba(147,51,234,0.45)]"
              >
                 {/* Top Header Row: Guaranteed 100% Single Row on all Mobile Screens */}
                 <div className="w-full flex items-center justify-between select-none z-10 text-white/90 gap-1.5 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/15 border border-white/20 text-white text-[9.5px] sm:text-xs font-bold shadow-xs shrink-0">
                        {listIndex + 1}/{orderList.length}
                      </span>
                      {isMega && currentCard.bookQNum && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/15 border border-white/20 text-sky-200 text-[9px] sm:text-xs font-bold shadow-xs shrink-0">
                          📖 Q. {currentCard.bookQNum}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-300/40 text-[9.5px] sm:text-xs font-black tracking-wider uppercase flex items-center gap-1 shrink-0">
                        <span>🎯</span>
                        <span>ANSWER</span>
                      </span>
                      <div className="bg-white/15 border border-white/20 rounded-lg px-1.5 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-black tracking-wider uppercase text-white/90 shadow-xs shrink-0" title="GyanLayer">
                        <img 
                          src={window.GYANLAYER_LOGO || "Logo Gyanlayer/clean_logo_512.png"} 
                          alt="GyanLayer" 
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0 brightness-200" 
                          onError={(e) => { e.target.onerror = null; if (window.GYANLAYER_LOGO) e.target.src = window.GYANLAYER_LOGO; }} 
                        />
                        <span className="hidden sm:inline">GYANLAYER</span>
                      </div>
                    </div>
                 </div>

                 {/* Center Answer and Memory Trick Container */}
                 <div className="flex-1 flex flex-col items-center justify-center w-full max-w-full my-auto py-1">
                   {/* Large bold golden answer */}
                   <div className="flex items-center justify-center gap-2 select-text mb-2 sm:mb-2.5 text-center">
                     <span className="text-xl sm:text-2xl md:text-3xl text-amber-300 shrink-0">👉</span>
                     <div className="text-xl sm:text-2xl md:text-[25px] font-black text-amber-200 drop-shadow-sm tracking-tight">
                       {renderCardText(backValue, "answer")}
                     </div>
                   </div>
                   
                   {/* Translucent Solid Luminous Trick Box (Zero Blurriness, Razor-Sharp Text & Vibrant Emojis) */}
                   {currentCard.memoryTrick && (
                      <div className="w-full bg-black/20 dark:bg-black/35 border border-white/30 rounded-2xl p-3 sm:p-4 shadow-md select-text mt-0.5 text-center">
                        <p className="text-[10px] sm:text-[11.5px] font-black uppercase tracking-widest mb-1.5 text-amber-300 flex items-center justify-center gap-1.5 select-none">
                          <span className="text-sm">💡</span> MEMORY TRICK
                        </p>
                        {(window.renderFormattedTrick || ((t, c) => <p className={c}>{t}</p>))(currentCard.memoryTrick, "text-white text-[13.5px] sm:text-[15px] md:text-[16px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]")}
                      </div>
                    )}
                 </div>

                 {/* Bottom flip-back helper */}
                 <div className="w-full flex items-center justify-center select-none pt-1">
                    <p className="text-[10px] sm:text-[11px] font-bold text-white/90 hover:text-white transition-colors uppercase tracking-wider">
                      <i className="fa-solid fa-rotate-left mr-1"></i> Tap to flip back
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Action buttons drawer */}
          <div className="h-14 sm:h-16 flex items-center justify-center w-full mt-4 sm:mt-5 mb-2">
            {!isFlipped ? (
              <div className="flex gap-4 sm:gap-6 items-center justify-center">
                <button 
                  onClick={() => changeCard('prev')} 
                  disabled={listIndex === 0}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full transition-all text-slate-500 active:scale-95 border shadow-sm ${
                    listIndex === 0 
                      ? 'opacity-35 cursor-not-allowed pointer-events-none' 
                      : 'hover:-translate-x-1 cursor-pointer'
                  } ${currentTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : currentTheme === 'warm' ? 'bg-[#fdfbf7] border-[#e1d5ba] text-amber-900 hover:bg-[#f4e8cb]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  title="Previous Card"
                >
                  <i className="fa-solid fa-chevron-left text-base sm:text-lg"></i>
                </button>
                <button 
                  onClick={() => changeCard('next')} 
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full shadow-md text-white active:scale-95 transition-all hover:scale-105
                    ${currentTheme === 'dark' ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/50' : currentTheme === 'warm' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/30'}`}
                  title="Next Card"
                >
                  <i className="fa-solid fa-chevron-right text-lg sm:text-xl"></i>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[340px] sm:max-w-[380px] md:max-w-[420px] animate-in fade-in duration-200 mx-auto px-1">
                {/* 1. Forgot (With Anki 3-card Spaced Re-queue) */}
                <button 
                  onClick={() => gradeCard('hard')}
                  className="py-2.5 sm:py-3 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-black tracking-wide transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer select-none"
                  title="Forgot (Re-queued in 3 cards & saved to Mistakes)"
                >
                  <span className="text-sm sm:text-base">🔴</span>
                  <span>Forgot</span>
                </button>

                {/* 2. Knew It! (Mastered) */}
                <button 
                  onClick={() => gradeCard('easy')}
                  className="py-2.5 sm:py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black tracking-wide transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-md shadow-emerald-500/30 cursor-pointer select-none"
                  title="Knew It! (Mastered)"
                >
                  <span className="text-sm sm:text-base">🟢</span>
                  <span>Knew It!</span>
                </button>
              </div>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
