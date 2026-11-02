// ================================================================
//  PodcastModal.js — Continuous Hands-Free Podcast Settings Modal
//  ✅ Seamless Speed Change with Zero Playback Interruption (No Reset to Q1)
//  ✅ Quick Jump to Current Q, Q.1, Saved Checkpoint, or Any Custom Question
//  ✅ Full YouTube-grade Speed Picker (0.75x to 2.0x) with Real-Time Audio Feedback
// ================================================================

const PodcastModal = ({
  isOpen,
  onClose,
  onStartPodcast,
  questions,
  categories,
  selectedCategory,
  theme,
  checkpoint,
  podcastState
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';
  const isCurrentlyActive = Boolean(podcastState && podcastState.isActive);

  // Filter questions by active category if needed
  const activeCatQs = React.useMemo(() => {
    if (!questions) return [];
    if (selectedCategory === 'all') return questions;
    return questions.filter(q => q && q.category === selectedCategory);
  }, [questions, selectedCategory]);

  const catMeta = (categories || []).find(c => c.id === selectedCategory) || { name: 'सभी टॉपिक्स' };

  // Determine current active question number if running
  const activeCurrentQ = podcastState && podcastState.currentQ;
  const activeCurrentQNum = activeCurrentQ ? activeCurrentQ.id : (podcastState ? podcastState.currentIndex + 1 : 1);

  // Local state
  const [scope, setScope] = React.useState(selectedCategory === 'all' ? 'all' : 'topic');
  const [startMode, setStartMode] = React.useState(() => {
    if (isCurrentlyActive) return 'current';
    if (checkpoint) return 'checkpoint';
    return 'first';
  });
  const [customNum, setCustomNum] = React.useState('');
  const [speed, setSpeed] = React.useState(() => {
    if (podcastState && podcastState.speed) return podcastState.speed;
    if (typeof localStorage !== 'undefined') {
      const saved = parseFloat(localStorage.getItem('ca_podcast_speed'));
      if (!isNaN(saved) && saved > 0) return saved;
    }
    return 1.25;
  });

  const [speedAppliedNotice, setSpeedAppliedNotice] = React.useState(false);

  const playlist = scope === 'all' ? questions : activeCatQs;
  const totalCount = playlist.length;

  const handleSelectSpeed = (s) => {
    setSpeed(s);
    setSpeedAppliedNotice(true);
    setTimeout(() => setSpeedAppliedNotice(false), 2000);
    // Real-time apply to active controller
    if (window.caPodcastController && isCurrentlyActive) {
      window.caPodcastController.setSpeed(s);
    }
  };

  const handleAction = () => {
    // If user just wanted to keep playing current question and apply settings
    if (startMode === 'current' && isCurrentlyActive) {
      if (window.caPodcastController) {
        window.caPodcastController.setSpeed(speed);
        if (!podcastState.isPlaying) {
          window.caPodcastController.resume();
        }
      }
      onClose();
      return;
    }

    let startIndex = 0;
    if (startMode === 'current' && isCurrentlyActive) {
      startIndex = podcastState.currentIndex || 0;
    } else if (startMode === 'checkpoint' && checkpoint) {
      const idx = playlist.findIndex(q => String(q.id) === String(checkpoint.id));
      if (idx !== -1) startIndex = idx;
    } else if (startMode === 'custom') {
      const parsed = parseInt(customNum, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        const idx = playlist.findIndex(q => parseInt(q.id, 10) === parsed);
        if (idx !== -1) startIndex = idx;
        else startIndex = Math.min(Math.max(0, parsed - 1), playlist.length - 1);
      }
    }

    onStartPodcast({
      playlist,
      startIndex,
      speed,
      scopeTitle: scope === 'all' ? 'सभी टॉपिक्स' : catMeta.name
    });
    onClose();
  };

  const modalBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : isWarm ? 'bg-[#faf6ee] border-[#ebdcb9] text-[#4a3b32]' : 'bg-white border-slate-200 text-slate-900';
  const cardSectionBg = isDark ? 'bg-slate-950/60 border-slate-800' : isWarm ? 'bg-[#f4ecdb] border-[#e2d2ad]' : 'bg-slate-50 border-slate-200/80';

  const speedOptions = [
    { val: 0.75, label: '0.75x', desc: 'धीमा' },
    { val: 1.0,  label: '1.0x',  desc: 'सामान्य' },
    { val: 1.25, label: '1.25x ⚡', desc: 'अनुशंसित' },
    { val: 1.5,  label: '1.5x 🔥', desc: 'फ़ास्ट' },
    { val: 1.75, label: '1.75x', desc: 'सुपर' },
    { val: 2.0,  label: '2.0x 🚀', desc: '2x स्पीड' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in-app">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${modalBg}`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
              <i className="fa-solid fa-headphones text-lg"></i>
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight">🎧 पॉडकास्ट मोड (Podcast)</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">बिना स्क्रीन देखे लगातार पूरे करंट अफेयर्स सुनें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Live Active Status Banner (If podcast is running) */}
        {isCurrentlyActive && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <span className="font-black truncate">चालू पॉडकास्ट: Q.{activeCurrentQNum} ({podcastState.isPlaying ? 'बज रहा है 🔊' : 'रोका गया ⏸️'})</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] shrink-0">
              {podcastState.speed}x Active
            </span>
          </div>
        )}

        {/* 1. Scope Selector */}
        <div className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${cardSectionBg}`}>
          <label className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <i className="fa-solid fa-layer-group"></i> 1. टॉपिक स्कोप चुनें
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scope === 'all'
                  ? 'bg-amber-500 border-amber-400 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>🌐 सभी ({questions ? questions.length : 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('topic')}
              disabled={selectedCategory === 'all'}
              className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 truncate cursor-pointer ${
                selectedCategory === 'all'
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
                  : scope === 'topic'
                  ? 'bg-amber-500 border-amber-400 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title={selectedCategory === 'all' ? "पहले ऊपर से कोई टॉपिक चुनें" : catMeta.name}
            >
              <span className="truncate">🎯 {selectedCategory === 'all' ? 'टॉपिक चुनें' : `${catMeta.name} (${activeCatQs.length})`}</span>
            </button>
          </div>
        </div>

        {/* 2. Start Position Selector */}
        <div className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 ${cardSectionBg}`}>
          <label className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <i className="fa-solid fa-play"></i> 2. कहाँ से सुनना है?
          </label>
          <div className={`grid ${isCurrentlyActive ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-1.5`}>
            {isCurrentlyActive && (
              <button
                type="button"
                onClick={() => setStartMode('current')}
                className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer truncate ${
                  startMode === 'current'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm font-black ring-2 ring-emerald-400/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title={`चालू प्रश्न Q.${activeCurrentQNum} से ही सुनें`}
              >
                ▶️ Q.{activeCurrentQNum} चालू
              </button>
            )}
            <button
              type="button"
              onClick={() => setStartMode('first')}
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                startMode === 'first'
                  ? 'bg-amber-500 border-amber-400 text-white shadow-sm font-black'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              🔄 Q. 1 से
            </button>
            <button
              type="button"
              onClick={() => setStartMode('checkpoint')}
              disabled={!checkpoint}
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition-all text-center truncate cursor-pointer ${
                !checkpoint
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
                  : startMode === 'checkpoint'
                  ? 'bg-amber-500 border-amber-400 text-white shadow-sm font-black'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title={checkpoint ? `Saved Q.${checkpoint.id}` : "कोई चेकपॉइंट सेव नहीं है"}
            >
              🔖 {checkpoint ? `Q.${checkpoint.id}` : 'चेकपॉइंट'}
            </button>
            <button
              type="button"
              onClick={() => setStartMode('custom')}
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                startMode === 'custom'
                  ? 'bg-amber-500 border-amber-400 text-white shadow-sm font-black'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              🔢 मनचाहा No.
            </button>
          </div>

          {startMode === 'custom' && (
            <div className="flex items-center gap-2 mt-1 animate-fade-in-app">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">प्रश्न संख्या (1–{totalCount}):</span>
              <input
                type="number"
                min="1"
                max={totalCount}
                placeholder={`1 से ${totalCount}`}
                value={customNum}
                onChange={e => setCustomNum(e.target.value)}
                autoFocus
                className="flex-1 py-1.5 px-3 rounded-xl border border-amber-400/60 bg-white dark:bg-slate-900 text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* 3. Playback Speed Selector (YouTube Grade) */}
        <div className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${cardSectionBg}`}>
          <div className="flex items-center justify-between">
            <label className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <i className="fa-solid fa-gauge-high"></i> 3. आवाज की स्पीड (Playback Speed)
            </label>
            {speedAppliedNotice && (
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 animate-pulse">
                ⚡ स्पीड लागू हो गई!
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {speedOptions.map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleSelectSpeed(opt.val)}
                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  speed === opt.val
                    ? 'bg-amber-500 border-amber-400 text-white font-black shadow-sm ring-1 ring-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                }`}
                title={opt.desc}
              >
                <div className="text-xs font-black">{opt.label}</div>
                <div className={`text-[8.5px] opacity-80 ${speed === opt.val ? 'text-white' : 'text-slate-400'}`}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isCurrentlyActive && startMode === 'current' ? (
            <React.Fragment>
              <i className="fa-solid fa-circle-check text-lg"></i>
              <span>✅ सेटिंग्स लागू करें (Q.{activeCurrentQNum} चालू रखें)</span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <i className="fa-solid fa-circle-play text-lg"></i>
              <span>
                {startMode === 'first' 
                  ? `पॉडकास्ट शुरू करें (${totalCount} सवाल)` 
                  : startMode === 'custom' && customNum
                  ? `Q.${customNum} से शुरू करें`
                  : startMode === 'checkpoint' && checkpoint
                  ? `Q.${checkpoint.id} से शुरू करें`
                  : `पॉडकास्ट शुरू करें`}
              </span>
            </React.Fragment>
          )}
        </button>

      </div>
    </div>
  );
};

window.PodcastModal = PodcastModal;
