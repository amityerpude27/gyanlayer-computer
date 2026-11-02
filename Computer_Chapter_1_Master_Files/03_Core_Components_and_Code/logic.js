// ================================================================
//  CURRENT AFFAIRS TEMPLATE — logic.js
//  Main React Application Shell
//
//  ✅ EDIT THIS FILE FOR: Tab logic, State management,
//      App-level layout, App-level behavior changes
//  ❌ DO NOT add question content here — use globals.js
//  ❌ DO NOT use 100vh or 100dvh — use window.innerHeight
// ================================================================

// localStorage key for persisting mistakes per month
const STORAGE_KEY = `ca_mistakes_${(window.caConfig && window.caConfig.month)}_${(window.caConfig && window.caConfig.year)}`;
const READ_CARDS_KEY = `ca_read_cards_${(window.caConfig && window.caConfig.month)}_${(window.caConfig && window.caConfig.year)}`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[100dvh] p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
          <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 text-4xl">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h2 className="text-2xl font-bold mb-3">Oops! Something went wrong.</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            An unexpected error occurred while loading this section. This is a temporary glitch.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-600/30"
          >
            <i className="fa-solid fa-rotate-right mr-2"></i> Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const cfg = window.caConfig;

  // --- App State ---
  const [activeTab, setActiveTab]           = useState('notes');
  const [theme, setTheme]                   = useState('light');
  const [eyeCareModalOpen, setEyeCareModalOpen] = useState(false);
  const [podcastModalOpen, setPodcastModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [shareModalItem, setShareModalItem] = useState(null);
  const [podcastState, setPodcastState]     = useState(() => (window.caPodcastController ? window.caPodcastController.getState() : { isActive: false }));
  const [blueLight, setBlueLight]           = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery]       = useState('');
  const [viewMode, setViewMode]             = useState('grid'); // 'grid' | 'map' | 'slide'
  const [isTestActive, setIsTestActive]     = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState(null);
  const [showQuitModal, setShowQuitModal]   = useState(false);
  const [mistakes, setMistakes]             = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e){ return []; }
  });

  // 📖 Anti-Cheat Dwell-Time Read Cards Tracker
  const [readCardsSet, setReadCardsSet] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(READ_CARDS_KEY));
      return new Set(Array.isArray(saved) ? saved : []);
    } catch(e) { return new Set(); }
  });

  const handleTrackReadCard = useCallback((qId) => {
    if (!qId) return;
    setReadCardsSet(prev => {
      if (prev.has(String(qId))) return prev;
      const next = new Set(prev);
      next.add(String(qId));
      try {
        localStorage.setItem(READ_CARDS_KEY, JSON.stringify(Array.from(next)));
      } catch(e) {}
      return next;
    });
  }, []);

  const handleResetProgress = useCallback(() => {
    try {
      localStorage.removeItem(READ_CARDS_KEY);
      setReadCardsSet(new Set());
      if (cfg && cfg.categories) {
        window.clearReadingCheckpoint('all');
        cfg.categories.forEach(c => window.clearReadingCheckpoint(c.id));
      }
      alert("आपकी अध्ययन प्रगति (Progress) सफलतापूर्वक रीसेट कर दी गई है।");
      setProgressModalOpen(false);
    } catch(e) {}
  }, [cfg]);

  // 📝 Calculate Mock Test Stats from localStorage
  const testStats = useMemo(() => {
    try {
      const currentMonth = (cfg && cfg.month) || 'Module';
      const currentYear = (cfg && cfg.year) || 2026;
      const prefix = `ca_mock_result_${currentMonth}_${currentYear}`;
      let attempted = 0;
      let totalScore = 0;
      let totalMax = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          attempted++;
          try {
            const data = JSON.parse(localStorage.getItem(k));
            if (data && data.score !== undefined && data.total) {
              totalScore += Number(data.score);
              totalMax += Number(data.total);
            }
          } catch(e) {}
        }
      }
      const totalSets = (cfg && cfg.questions) ? Math.max(1, Math.ceil(cfg.questions.length / 25)) : 1;
      const avgAccuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
      return { totalTests: totalSets, attemptedTests: attempted, avgAccuracy };
    } catch(e) {
      return { totalTests: 1, attemptedTests: 0, avgAccuracy: 0 };
    }
  }, [cfg, activeTab]);

  const mistakeStats = useMemo(() => {
    return {
      totalRecorded: mistakes.length,
      cleared: 0
    };
  }, [mistakes]);

  // 📊 Weighted Preparation Percentage
  const preparedPct = useMemo(() => {
    const totalQ = (cfg && cfg.questions && cfg.questions.length) || 1;
    const readCount = readCardsSet.size;
    const notesWeight = Math.min(100, Math.round((readCount / totalQ) * 100));
    const mockWeight = testStats.totalTests > 0 ? Math.min(100, Math.round((testStats.attemptedTests / testStats.totalTests) * 100)) : 0;
    return Math.min(100, Math.round((notesWeight * 0.6) + (mockWeight * 0.4)));
  }, [cfg, readCardsSet, testStats]);

  // --- Subscribe to Podcast Controller ---
  useEffect(() => {
    if (window.caPodcastController) {
      const unsub = window.caPodcastController.subscribe((st) => {
        setPodcastState({ ...st });
      });
      return unsub;
    }
  }, []);

  const handleStartPodcast = useCallback(({ playlist, startIndex, speed, scopeTitle }) => {
    if (window.caPodcastController) {
      window.caPodcastController.start(playlist, startIndex, speed, scopeTitle);
    }
  }, []);

  // PWA-safe viewport height (never use 100vh!)
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  // --- PWA Viewport Height Fix ---
  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Smart Splash Loader Removal (Zero Unstyled Flash / Capacitor Native Gate) ---
  useEffect(() => {
    const splash = document.getElementById('splash-loader');
    const root = document.getElementById('root');

    let checkCount = 0;
    const checkReadyAndFade = () => {
      checkCount++;
      if (root && root.children.length > 0) {
        requestAnimationFrame(() => {
          root.classList.add('app-ready');
          if (splash) {
            splash.style.transition = 'opacity 0.4s ease';
            splash.style.opacity = '0';
            setTimeout(() => {
              if (splash && splash.parentNode) {
                splash.parentNode.removeChild(splash);
              }
            }, 450);
          }
        });
      } else if (checkCount < 60) {
        setTimeout(checkReadyAndFade, 50);
      } else {
        if (root) root.classList.add('app-ready');
        if (splash) {
          splash.style.opacity = '0';
          setTimeout(() => { if (splash && splash.parentNode) splash.parentNode.removeChild(splash); }, 450);
        }
      }
    };

    const timer = setTimeout(checkReadyAndFade, 350);
    return () => clearTimeout(timer);
  }, []);

  // --- Theme Class on <html> ---
  useEffect(() => {
    document.documentElement.className = `${theme} notranslate`;
  }, [theme]);

  // --- Persist mistakes to localStorage ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  }, [mistakes]);

  // --- Tab change: Guard active live test against accidental exit ---
  const handleTabChange = useCallback((tabId) => {
    if (window.caStopSpeech) window.caStopSpeech();
    if (isTestActive) {
      setPendingTabChange(tabId);
      setShowQuitModal(true);
      return;
    }
    setActiveTab(tabId);
    if (tabId !== 'notes') {
      setSearchQuery('');
    }
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isTestActive]);

  // --- Safety Quit Handlers ---
  const confirmQuitAndLeave = useCallback(() => {
    setIsTestActive(false);
    setShowQuitModal(false);
    if (window.forceQuitMockTest) {
      window.forceQuitMockTest();
    }
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
    }
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pendingTabChange]);

  const submitAndLeave = useCallback(() => {
    setIsTestActive(false);
    setShowQuitModal(false);
    setPendingTabChange(null);
    if (window.submitCurrentLiveMockTest) {
      window.submitCurrentLiveMockTest();
    }
  }, []);

  const cancelQuit = useCallback(() => {
    setShowQuitModal(false);
    setPendingTabChange(null);
  }, []);

  // --- Category change: scroll to top ---
  const handleCategoryChange = useCallback((catId) => {
    setSelectedCategory(catId);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  // --- Mistake Management ---
  const addMistake = useCallback((question) => {
    setMistakes(prev => {
      if (prev.find(m => m.id === question.id)) return prev; // no duplicates
      return [...prev, { ...question, addedAt: Date.now() }];
    });
  }, []);

  const removeMistake = useCallback((questionId) => {
    setMistakes(prev => prev.filter(m => m.id !== questionId));
  }, []);

  const clearMistakes = useCallback(() => setMistakes([]), []);

  // --- Filtered Questions (for Study Notes) ---
  const filteredQuestions = useMemo(() => {
    let qs = cfg.questions || [];
    if (selectedCategory !== 'all') {
      qs = qs.filter(q => q.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      qs = qs.filter(item =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.memoryTrick || '').toLowerCase().includes(q) ||
        (item.bookQNum && String(item.bookQNum) === q.replace(/\D/g, '')) ||
        (item.id && String(item.id) === q.replace(/\D/g, ''))
      );
    }
    return qs;
  }, [selectedCategory, searchQuery, cfg.questions]);

  // --- Theme Helpers ---
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  const bgClass = isDark
    ? 'bg-slate-950 text-slate-100'
    : isWarm
    ? 'bg-[#faf8f2] text-[#4a3b32]'
    : 'bg-slate-50 text-slate-800';

  const tabBarBg = isDark
    ? 'bg-slate-950/95 border-slate-800'
    : isWarm
    ? 'bg-[#faf8f2]/95 border-[#e8dcb5]'
    : 'bg-white/95 border-slate-200';

  // --- Tab Definitions ---
  const tabs = [
    { id: 'notes',    label: 'Study Notes', mLabel: 'Notes',    icon: 'fa-book-open'          },
    { id: 'flash',    label: 'Flash Cards', mLabel: 'Cards',    icon: 'fa-layer-group'        },
    { id: 'mock',     label: 'Mock Test',   mLabel: 'Test',     icon: 'fa-laptop-code'        },
    { id: 'mistakes', label: 'Mistake Hub', mLabel: 'Mistakes', icon: 'fa-circle-exclamation' },
  ];

  const title = cfg.title || `${cfg.month} ${cfg.year} – Ultimate Current Affairs`;
  const subtitle = cfg.subtitle || `${cfg.questions ? cfg.questions.length : 156} वन लाइनर (Speedy / Rapid Revision) with 360° Explanations, Memory Tricks and Mock Test`;

  const mainScrollRef = useRef(null);

  // Auto-scroll to top when category changes in Study Notes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  // ⌨️ Dedicated Studio Keyboard Shortcut [P] or [Shift + P] to Start / Toggle Podcast (100% Mouse-Free Recording)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }

      // [P] or [Shift + P]: 1-Click Start or Toggle Podcast Mode
      if ((e.code === 'KeyP' || e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (!podcastState.isActive) {
          const playlist = filteredQuestions && filteredQuestions.length > 0 ? filteredQuestions : (cfg.questions || []);
          const targetCat = (cfg.categories || []).find(c => c.id === selectedCategory);
          const scopeTitle = selectedCategory === 'all' ? 'सभी टॉपिक्स' : (targetCat ? targetCat.label : 'टॉपिक');
          const defaultSpeed = (window.caConfig && window.caConfig.isYouTubeStudio) ? 1.0 : 1.25;
          
          let startIndex = 0;
          if (typeof window.caCurrentSlideIndex === 'number' && window.caCurrentSlideIndex >= 0 && window.caCurrentSlideIndex < playlist.length) {
            startIndex = window.caCurrentSlideIndex;
          }

          let targetPartIndex = undefined;
          const parts = (window.caConfig && window.caConfig.youtubeAudioParts) ? window.caConfig.youtubeAudioParts : [];
          if (parts && parts.length > 0) {
            const targetQNum = startIndex + 1;
            const pIdx = parts.findIndex(p => targetQNum >= p.startQ && targetQNum <= p.endQ);
            if (pIdx !== -1) targetPartIndex = pIdx;
          }
          
          if (window.caPodcastController) {
            window.caPodcastController.start(playlist, startIndex, defaultSpeed, scopeTitle, targetPartIndex);
          }
          if (mainScrollRef.current) {
            mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          if (window.caPodcastController) {
            window.caPodcastController.togglePlay();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab, podcastState.isActive, filteredQuestions, selectedCategory, cfg.questions, cfg.categories]);

  return (
    <div
      style={{ height: `${viewportHeight}px` }}
      className={`flex flex-col overflow-hidden min-h-[100dvh] ${bgClass} transition-colors duration-300 animate-fade-in-app`}
    >
      {/* ============ EYE SHIELD OVERLAY ============
          z-9999, pointer-events: none
          Dynamic amber tint
      =============================================== */}
      {blueLight > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[9999]"
          style={{
            backgroundColor: `rgba(245, 158, 11, ${blueLight / 150})`,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* ============ APP HEADER ============ */}
      <AppHeader
        title={title}
        subtitle={subtitle}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        setTheme={setTheme}
        blueLight={blueLight}
        setBlueLight={setBlueLight}
        onOpenEyeCare={() => setEyeCareModalOpen(true)}
        onOpenProgress={() => setProgressModalOpen(true)}
        onOpenPodcast={() => setPodcastModalOpen(true)}
        preparedPct={preparedPct}
        isTestActive={isTestActive}
        mistakeCount={mistakes.length}
      />

      {/* ============ CATEGORY FILTER BAR (Study Notes only) ============ */}
      {activeTab === 'notes' && (
        <CategoryBar
          categories={cfg.categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          allQuestions={cfg.questions}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {/* ============ MAIN CONTENT AREA ============ */}
      <div 
        ref={mainScrollRef}
        className={`flex-1 flex flex-col min-h-0 ${(activeTab === 'notes' && viewMode !== 'map') || activeTab === 'mistakes' ? 'overflow-y-auto main-scroll pb-32 sm:pb-4 snap-y snap-mandatory md:snap-none scroll-smooth scroll-pb-32 md:scroll-pb-0' : 'overflow-hidden'}`}
      >
        <div key={activeTab} className="tab-fade-in h-full flex flex-col min-h-0">
          {activeTab === 'notes' && (
            <StudyNotes
              questions={filteredQuestions}
              allQuestions={cfg.questions}
              categories={cfg.categories}
              month={cfg.month}
              year={cfg.year}
              theme={theme}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              searchQuery={searchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onShareCard={(item) => setShareModalItem(item)}
              onTrackReadCard={handleTrackReadCard}
            />
          )}
          {activeTab === 'flash' && (
            <FlashCards
              questions={cfg.questions}
              theme={theme}
              addMistake={addMistake}
              goToMistakes={() => handleTabChange('mistakes')}
            />
          )}
          {activeTab === 'mock' && (
            <MockTest
              questions={cfg.questions}
              theme={theme}
              addMistake={addMistake}
              onTestStateChange={setIsTestActive}
            />
          )}

          {activeTab === 'mistakes' && (
            <MistakeHub
              mistakes={mistakes}
              theme={theme}
              removeMistake={removeMistake}
              clearMistakes={clearMistakes}
            />
          )}
        </div>
      </div>

      <EyeCareModal
        isOpen={eyeCareModalOpen}
        onClose={() => setEyeCareModalOpen(false)}
        currentTheme={theme}
        setTheme={setTheme}
        blueLight={blueLight}
        setBlueLight={setBlueLight}
      />

      {/* ============ 📊 MONTHLY PROGRESS & MASTERY MODAL ============ */}
      {typeof ProgressModal !== 'undefined' && (
        <ProgressModal
          isOpen={progressModalOpen}
          onClose={() => setProgressModalOpen(false)}
          totalQuestions={(cfg && cfg.questions && cfg.questions.length) || 0}
          readCount={readCardsSet.size}
          testStats={testStats}
          mistakeStats={mistakeStats}
          onResetProgress={handleResetProgress}
          theme={theme}
          month={(cfg && cfg.month) || 'Module'}
          year={(cfg && cfg.year) || 2026}
        />
      )}

      {/* ============ 📷 1-CLICK HD CARD SHARE MODAL ============ */}
      {typeof ShareCardModal !== 'undefined' && (
        <ShareCardModal
          isOpen={!!shareModalItem}
          onClose={() => setShareModalItem(null)}
          item={shareModalItem}
          theme={theme}
          catMeta={shareModalItem && cfg && cfg.categories ? cfg.categories.find(c => c.id === shareModalItem.category) : null}
        />
      )}

      {/* ============ CONTINUOUS PODCAST MODAL & PLAYER ============ */}
      {typeof PodcastModal !== 'undefined' && (
        <PodcastModal
          isOpen={podcastModalOpen}
          onClose={() => setPodcastModalOpen(false)}
          onStartPodcast={handleStartPodcast}
          questions={cfg.questions}
          categories={cfg.categories}
          selectedCategory={selectedCategory}
          theme={theme}
          checkpoint={window.getReadingCheckpoint ? window.getReadingCheckpoint(selectedCategory) : null}
          podcastState={podcastState}
        />
      )}

      {typeof PodcastPlayer !== 'undefined' && podcastState.isActive && (
        <PodcastPlayer
          podcastState={podcastState}
          onTogglePlay={() => window.caPodcastController && window.caPodcastController.togglePlay()}
          onNext={() => window.caPodcastController && window.caPodcastController.next()}
          onPrev={() => window.caPodcastController && window.caPodcastController.prev()}
          onChangeSpeed={(sp) => window.caPodcastController && window.caPodcastController.setSpeed(sp)}
          onJumpTo={(target) => window.caPodcastController && window.caPodcastController.jumpTo(target)}
          onClose={() => window.caPodcastController && window.caPodcastController.stop()}
          theme={theme}
        />
      )}

      {/* ============ MOBILE BOTTOM NAV ============
          Automatically hidden during Live Test to prevent accidental distraction / tap
      =============================================== */}
      {!isTestActive && (
        <BottomNav
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          theme={theme}
          mistakeCount={mistakes.length}
        />
      )}

      {/* ============ GLOBAL SAFETY QUIT TEST MODAL ============
          Guards against accidental tab switching during an active live test
      =========================================================== */}
      {showQuitModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-app">
          <div className={`rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="text-4xl mb-2">⏸️</div>
            <h3 className="text-base sm:text-lg font-black mb-1.5">Live Test in Progress (टेस्ट अभी चालू है!)</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              आपका टेस्ट अभी चालू है। आप क्या करना चाहते हैं?
            </p>
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={cancelQuit}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-play text-xs"></i>
                <span>Resume Test (टेस्ट जारी रखें)</span>
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={confirmQuitAndLeave}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5 ${
                    theme === 'dark' ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                  title="Save progress and resume later"
                >
                  <i className="fa-regular fa-floppy-disk text-xs"></i>
                  <span>Save & Pause</span>
                </button>
                <button 
                  onClick={submitAndLeave}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
                  title="Submit whatever is done and view score"
                >
                  <i className="fa-solid fa-check-double text-xs"></i>
                  <span>Submit Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mount React App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
