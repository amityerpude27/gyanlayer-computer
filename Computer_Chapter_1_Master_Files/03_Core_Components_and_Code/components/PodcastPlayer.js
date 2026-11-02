// ================================================================
//  PodcastPlayer.js — Ultra-Smooth Draggable & Minimizable Audio Player
//  ✅ YouTube-Grade Speed Popover (0.75x to 2.0x) with Live Real-Time Change
//  ✅ Quick Question Jumper (मनचाहा प्रश्न तुरंत लगाएं) via 1-Click Popover
//  ✅ Seamless Drag & Drop anywhere on screen via mouse or touch
//  ✅ 1-Click Stealth / Minimize Mode for Clean YouTube Screen Recording
//  ✅ Pro Keyboard Hotkeys: [Space] Play/Pause, [→/N] Next, [←/P] Prev, [M] Minimize, [Esc] Close
// ================================================================

const PodcastPlayer = ({
  podcastState,
  onTogglePlay,
  onNext,
  onPrev,
  onChangeSpeed,
  onJumpTo,
  onClose,
  theme
}) => {
  if (!podcastState || !podcastState.isActive) return null;

  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  const {
    currentQ,
    currentIndex,
    totalCount,
    isPlaying,
    speed,
    scopeTitle
  } = podcastState;

  const currentQNum = currentQ ? currentQ.id : (currentIndex + 1);
  const qText = currentQ ? currentQ.question : "ऑडियो लोड हो रहा है...";

  // Minimize / Stealth mode state for screen recording
  const [isMinimized, setIsMinimized] = React.useState(false);

  // Popovers state
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const [showJumpMenu, setShowJumpMenu] = React.useState(false);
  const [jumpInputVal, setJumpInputVal] = React.useState('');
  const [feedbackToast, setFeedbackToast] = React.useState('');

  const triggerToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 2200);
  };

  // 🖱️ Ultra-Smooth Freeform Dragging State
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const isDraggingRef = React.useRef(false);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });

  const speedOptions = [
    { val: 0.75, label: '0.75x', tag: 'धीमा' },
    { val: 1.0,  label: '1.0x',  tag: 'सामान्य' },
    { val: 1.25, label: '1.25x ⚡', tag: 'अनुशंसित' },
    { val: 1.5,  label: '1.5x 🔥', tag: 'तेज़' },
    { val: 1.75, label: '1.75x', tag: 'सुपर' },
    { val: 2.0,  label: '2.0x 🚀', tag: '2x' }
  ];

  const handleSelectSpeed = (s) => {
    onChangeSpeed(s);
    setShowSpeedMenu(false);
    triggerToast(`⚡ स्पीड: ${s}x`);
  };

  const handleExecuteJump = (targetIdx) => {
    if (typeof onJumpTo === 'function') {
      onJumpTo(targetIdx);
    } else if (window.caPodcastController) {
      window.caPodcastController.jumpTo(targetIdx);
    }
    setShowJumpMenu(false);
    setJumpInputVal('');
    triggerToast(`🎯 Q.${typeof targetIdx === 'number' ? targetIdx + 1 : targetIdx} पर जंप किया`);
  };

  const handleJumpSubmit = (e) => {
    if (e) e.preventDefault();
    const parsed = parseInt(jumpInputVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalCount) {
      handleExecuteJump(parsed - 1);
    }
  };

  // ⌨️ Pro Studio Keyboard Shortcuts Engine
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyN') {
        e.preventDefault();
        onNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMinimized(prev => !prev);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (showSpeedMenu || showJumpMenu) {
          setShowSpeedMenu(false);
          setShowJumpMenu(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onNext, onPrev, onClose, showSpeedMenu, showJumpMenu]);

  // 🖱️ Drag Start
  const handleStartDrag = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.no-drag')) {
      return;
    }
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: clientX - pos.x,
      y: clientY - pos.y
    };
    document.body.style.userSelect = 'none';
  };

  React.useEffect(() => {
    const handleMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      setPos({
        x: clientX - dragOffsetRef.current.x,
        y: clientY - dragOffsetRef.current.y
      });
    };

    const handleEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      document.body.style.userSelect = '';
    };
  }, [pos]);

  const bgStyle = isDark
    ? 'bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
    : isWarm
    ? 'bg-[#faf6ee]/95 border-[#d6c4a1] text-[#4a3b32] shadow-[0_10px_30px_rgba(139,115,85,0.25)]'
    : 'bg-white/95 border-slate-300 text-slate-900 shadow-[0_10px_35px_rgba(0,0,0,0.15)]';

  const menuBg = isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div 
      onMouseDown={handleStartDrag}
      onTouchStart={handleStartDrag}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        cursor: 'move',
        touchAction: 'none'
      }}
      className="fixed bottom-16 sm:bottom-5 left-2 right-2 sm:left-auto sm:right-6 sm:w-[420px] z-50 animate-slide-up-app backdrop-blur-md select-none transition-shadow"
      title="माउस से पकड़कर स्क्रीन पर कहीं भी ले जाएं (Drag anywhere on screen)"
    >
      {/* 🔔 Transient Instant Feedback Toast */}
      {feedbackToast && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-lg animate-fade-in-app shrink-0 pointer-events-none whitespace-nowrap z-50">
          {feedbackToast}
        </div>
      )}

      {/* ⚡ SPEED POPOVER MENU (YouTube Grade) */}
      {showSpeedMenu && !isMinimized && (
        <div 
          onClick={e => e.stopPropagation()} 
          className={`no-drag absolute bottom-full mb-2 left-2 right-2 sm:left-auto sm:right-0 sm:w-64 p-3 rounded-2xl border shadow-2xl z-50 ${menuBg} animate-fade-in-app`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-black uppercase text-amber-500 flex items-center gap-1.5">
              <i className="fa-solid fa-gauge-high"></i> प्लेबैक स्पीड (Speed)
            </span>
            <button
              onClick={() => setShowSpeedMenu(false)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {speedOptions.map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleSelectSpeed(opt.val)}
                className={`py-2 px-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  speed === opt.val
                    ? 'bg-amber-500 text-white border-amber-400 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] ${speed === opt.val ? 'text-white' : 'text-slate-400'}`}>{opt.tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 DIRECT QUESTION JUMP POPOVER */}
      {showJumpMenu && !isMinimized && (
        <div 
          onClick={e => e.stopPropagation()} 
          className={`no-drag absolute bottom-full mb-2 left-2 right-2 sm:left-0 sm:right-auto sm:w-80 p-3 rounded-2xl border shadow-2xl z-50 ${menuBg} animate-fade-in-app`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-black uppercase text-amber-500 flex items-center gap-1.5">
              <i className="fa-solid fa-crosshairs"></i> मनचाहे प्रश्न पर जाएं
            </span>
            <button
              onClick={() => setShowJumpMenu(false)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 mb-2.5">
            <input
              type="number"
              min="1"
              max={totalCount}
              placeholder={`1 से ${totalCount}`}
              value={jumpInputVal}
              onChange={e => setJumpInputVal(e.target.value)}
              autoFocus
              className="flex-1 py-1.5 px-3 rounded-xl border border-amber-400/60 bg-white dark:bg-slate-900 text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95"
            >
              जाएं ▶
            </button>
          </form>

          {/* Quick Jump Chips */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => handleExecuteJump(0)}
              className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-amber-400 cursor-pointer"
            >
              ⏪ Q.1
            </button>
            <button
              type="button"
              onClick={() => handleExecuteJump(Math.max(0, currentIndex - 5))}
              disabled={currentIndex <= 0}
              className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-amber-400 disabled:opacity-30 cursor-pointer"
            >
              ◀ -5
            </button>
            <button
              type="button"
              onClick={() => handleExecuteJump(Math.min(totalCount - 1, currentIndex + 5))}
              disabled={currentIndex >= totalCount - 1}
              className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-amber-400 disabled:opacity-30 cursor-pointer"
            >
              +5 ▶
            </button>
            {totalCount >= 50 && (
              <button
                type="button"
                onClick={() => handleExecuteJump(49)}
                className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-amber-400 cursor-pointer"
              >
                Q.50
              </button>
            )}
            {totalCount >= 100 && (
              <button
                type="button"
                onClick={() => handleExecuteJump(99)}
                className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-amber-400 cursor-pointer"
              >
                Q.100
              </button>
            )}
            <button
              type="button"
              onClick={() => handleExecuteJump(totalCount - 1)}
              className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-amber-400 ml-auto cursor-pointer"
            >
              ⏩ अंतिम
            </button>
          </div>
        </div>
      )}

      {isMinimized ? (
        /* ── STEALTH MINIMIZED CAPSULE ── */
        <div className={`rounded-full border px-3 py-1.5 flex items-center justify-between gap-2.5 shadow-xl ${bgStyle}`}>
          <div className="text-slate-400 hover:text-amber-500 py-1 px-0.5 shrink-0">
            <i className="fa-solid fa-grip-vertical text-xs"></i>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowJumpMenu(prev => !prev); }}
              className="text-[11px] font-black text-amber-500 tracking-wide shrink-0 hover:underline cursor-pointer"
              title="प्रश्न बदलें"
            >
              Q.{currentQNum}/{totalCount}
            </button>
            <span className="text-[10.5px] font-bold truncate text-slate-600 dark:text-slate-300">
              {qText}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
            className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0 active:scale-95 transition-transform cursor-pointer"
            title={isPlaying ? "रोकें (Space)" : "चलाएं (Space)"}
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px]`}></i>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
            title="बड़ा करें (M)"
          >
            <i className="fa-solid fa-up-right-and-down-left-from-center text-[10px]"></i>
          </button>
        </div>
      ) : (
        /* ── FULL EXPANDED PLAYER ── */
        <div className={`rounded-2xl border p-2.5 sm:p-3 flex flex-col gap-2 shadow-2xl ${bgStyle}`}>
          
          {/* Top Info Row */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-slate-400 dark:text-slate-500 text-xs px-0.5">
                <i className="fa-solid fa-grip-vertical"></i>
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowJumpMenu(prev => !prev); setShowSpeedMenu(false); }}
                className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10.5px] font-black tracking-wide shrink-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
                title="मनचाहे प्रश्न पर जाएं (Click to Jump)"
              >
                <span>🎧 Q.{currentQNum}/{totalCount}</span>
                <i className="fa-solid fa-caret-down text-[8.5px] ml-1 opacity-80"></i>
              </button>
              <p className="text-xs font-bold truncate leading-tight flex-1 text-slate-700 dark:text-slate-200">
                {qText}
              </p>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                title="छोटा करें (M)"
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-minus text-xs"></i>
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                title="पॉडकास्ट बंद करें (Esc)"
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
            {/* Speed Toggle (Opens YouTube-like speed menu) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(prev => !prev); setShowJumpMenu(false); }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-transform active:scale-95 flex items-center gap-1 cursor-pointer ${
                  showSpeedMenu
                    ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
                    : 'border-amber-400/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
                title="स्पीड बदलें (YouTube Speed Picker)"
              >
                <span>⚡ {speed}x</span>
                <i className="fa-solid fa-sliders text-[9px] opacity-75"></i>
              </button>
            </div>

            {/* Player Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={currentIndex <= 0}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
                title="पिछला सवाल (← या P)"
              >
                <i className="fa-solid fa-backward-step text-xs"></i>
              </button>

              {/* Play / Pause Primary Button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 transition-transform active:scale-95 hover:scale-105 cursor-pointer"
                title={isPlaying ? "रोकें (Space)" : "चलाएं (Space)"}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                disabled={currentIndex >= totalCount - 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
                title="अगला सवाल (→ या N)"
              >
                <i className="fa-solid fa-forward-step text-xs"></i>
              </button>
            </div>

            {/* Scope Indicator */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                {scopeTitle || 'पॉडकास्ट'}
              </span>
              <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                Space: Play/Pause
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

window.PodcastPlayer = PodcastPlayer;
