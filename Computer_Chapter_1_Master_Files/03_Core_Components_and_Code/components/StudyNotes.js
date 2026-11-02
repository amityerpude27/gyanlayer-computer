// ================================================================
//  StudyNotes.js — Study Notes Tab (Tab 1)
//
//  ✅ Premium 3-column desktop layout (lg:grid-cols-3)
//  ✅ CSS Scroll Snapping enabled on mobile & desktop (snap-start scroll-mt-28)
//  ✅ Bulletproof bottom spacer (h-40 md:h-0) to resolve mobile snap cutoff
//  ✅ Compact mobile proportions (px-4 py-3) to fit viewport perfectly
//  ✅ Large icons on desktop (w-6 h-6 lg:w-7 lg:h-7)
//  ✅ leading-relaxed styling on all text so Hindi matras never overlap
//  ✅ Scaled typography (Question: text-lg to lg:text-xl)
// ================================================================

// Light theme card styles per category
// Dynamic color map per category color or category ID with luxury ambient borders & top jewel bars
const COLOR_CARD_LIGHT = {
  teal:     { wrap: 'border-[2px] sm:border-[2.5px] border-teal-500/85 hover:border-teal-600 bg-white shadow-[0_8px_25px_-5px_rgba(20,184,166,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',       badge: 'bg-teal-50 text-teal-800 border border-teal-300/90 shadow-2xs font-extrabold',          dot: 'bg-teal-500', topBar: 'bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-400' },
  orange:   { wrap: 'border-[2px] sm:border-[2.5px] border-orange-500/85 hover:border-orange-600 bg-white shadow-[0_8px_25px_-5px_rgba(249,115,22,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',   badge: 'bg-orange-50 text-orange-800 border border-orange-300/90 shadow-2xs font-extrabold',      dot: 'bg-orange-500', topBar: 'bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400' },
  amber:    { wrap: 'border-[2px] sm:border-[2.5px] border-amber-500/85 hover:border-amber-600 bg-white shadow-[0_8px_25px_-5px_rgba(245,158,11,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',     badge: 'bg-amber-50 text-amber-800 border border-amber-300/90 shadow-2xs font-extrabold',        dot: 'bg-amber-500', topBar: 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400' },
  green:    { wrap: 'border-[2px] sm:border-[2.5px] border-emerald-500/85 hover:border-emerald-600 bg-white shadow-[0_8px_25px_-5px_rgba(16,185,129,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-300/90 shadow-2xs font-extrabold',  dot: 'bg-emerald-500', topBar: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400' },
  red:      { wrap: 'border-[2px] sm:border-[2.5px] border-rose-500/85 hover:border-rose-600 bg-white shadow-[0_8px_25px_-5px_rgba(244,63,94,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',       badge: 'bg-rose-50 text-rose-800 border border-rose-300/90 shadow-2xs font-extrabold',          dot: 'bg-rose-500', topBar: 'bg-gradient-to-r from-rose-400 via-rose-500 to-pink-400' },
  blue:     { wrap: 'border-[2px] sm:border-[2.5px] border-blue-500/85 hover:border-blue-600 bg-white shadow-[0_8px_25px_-5px_rgba(59,130,246,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',       badge: 'bg-blue-50 text-blue-800 border border-blue-300/90 shadow-2xs font-extrabold',          dot: 'bg-blue-500', topBar: 'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400' },
  purple:   { wrap: 'border-[2px] sm:border-[2.5px] border-purple-500/85 hover:border-purple-600 bg-white shadow-[0_8px_25px_-5px_rgba(168,85,247,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',   badge: 'bg-purple-50 text-purple-800 border border-purple-300/90 shadow-2xs font-extrabold',      dot: 'bg-purple-500', topBar: 'bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400' },
  indigo:   { wrap: 'border-[2px] sm:border-[2.5px] border-indigo-500/85 hover:border-indigo-600 bg-white shadow-[0_8px_25px_-5px_rgba(99,102,241,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',   badge: 'bg-indigo-50 text-indigo-800 border border-indigo-300/90 shadow-2xs font-extrabold',      dot: 'bg-indigo-500', topBar: 'bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-400' },
  pink:     { wrap: 'border-[2px] sm:border-[2.5px] border-pink-500/85 hover:border-pink-600 bg-white shadow-[0_8px_25px_-5px_rgba(236,72,153,0.25),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',       badge: 'bg-pink-50 text-pink-800 border border-pink-300/90 shadow-2xs font-extrabold',          dot: 'bg-pink-500', topBar: 'bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400' },
  slate:    { wrap: 'border-[2px] sm:border-[2.5px] border-slate-400/85 hover:border-slate-500 bg-white shadow-[0_8px_25px_-5px_rgba(100,116,139,0.22),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',   badge: 'bg-slate-50 text-slate-800 border border-slate-300/90 shadow-2xs font-extrabold',        dot: 'bg-slate-500', topBar: 'bg-gradient-to-r from-slate-400 via-slate-500 to-zinc-400' },
  default:  { wrap: 'border-[2px] sm:border-[2.5px] border-slate-400/85 hover:border-slate-500 bg-white shadow-[0_8px_25px_-5px_rgba(100,116,139,0.22),0_3px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl',   badge: 'bg-slate-50 text-slate-800 border border-slate-300/90 shadow-2xs font-extrabold',        dot: 'bg-slate-400', topBar: 'bg-gradient-to-r from-slate-400 via-slate-500 to-zinc-400' },
};

const COLOR_CARD_DARK = {
  teal:     { wrap: 'border-[2px] sm:border-[2.5px] border-teal-500/70 hover:border-teal-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(20,184,166,0.25)] hover:shadow-2xl',       badge: 'bg-teal-950/90 text-teal-200 border border-teal-600/90 shadow-2xs font-extrabold',          dot: 'bg-teal-400', topBar: 'bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400' },
  orange:   { wrap: 'border-[2px] sm:border-[2.5px] border-orange-500/70 hover:border-orange-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(249,115,22,0.25)] hover:shadow-2xl',   badge: 'bg-orange-950/90 text-orange-200 border border-orange-600/90 shadow-2xs font-extrabold',      dot: 'bg-orange-400', topBar: 'bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400' },
  amber:    { wrap: 'border-[2px] sm:border-[2.5px] border-amber-500/70 hover:border-amber-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(245,158,11,0.25)] hover:shadow-2xl',     badge: 'bg-amber-950/90 text-amber-200 border border-amber-600/90 shadow-2xs font-extrabold',        dot: 'bg-amber-400', topBar: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400' },
  green:    { wrap: 'border-[2px] sm:border-[2.5px] border-emerald-500/70 hover:border-emerald-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.25)] hover:shadow-2xl', badge: 'bg-emerald-950/90 text-emerald-200 border border-emerald-600/90 shadow-2xs font-extrabold',  dot: 'bg-emerald-400', topBar: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400' },
  red:      { wrap: 'border-[2px] sm:border-[2.5px] border-rose-500/70 hover:border-rose-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(244,63,94,0.25)] hover:shadow-2xl',       badge: 'bg-rose-950/90 text-rose-200 border border-rose-600/90 shadow-2xs font-extrabold',          dot: 'bg-rose-400', topBar: 'bg-gradient-to-r from-rose-500 via-rose-400 to-pink-400' },
  blue:     { wrap: 'border-[2px] sm:border-[2.5px] border-blue-500/70 hover:border-blue-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(59,130,246,0.25)] hover:shadow-2xl',       badge: 'bg-blue-950/90 text-blue-200 border border-blue-600/90 shadow-2xs font-extrabold',          dot: 'bg-blue-400', topBar: 'bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400' },
  purple:   { wrap: 'border-[2px] sm:border-[2.5px] border-purple-500/70 hover:border-purple-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(168,85,247,0.25)] hover:shadow-2xl',   badge: 'bg-purple-950/90 text-purple-200 border border-purple-800/90 shadow-2xs font-extrabold',      dot: 'bg-purple-400', topBar: 'bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400' },
  indigo:   { wrap: 'border-[2px] sm:border-[2.5px] border-indigo-500/70 hover:border-indigo-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.25)] hover:shadow-2xl',   badge: 'bg-indigo-950/90 text-indigo-200 border border-indigo-700/80 shadow-2xs font-extrabold',      dot: 'bg-indigo-400', topBar: 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400' },
  pink:     { wrap: 'border-[2px] sm:border-[2.5px] border-pink-500/70 hover:border-pink-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_20px_rgba(236,72,153,0.25)] hover:shadow-2xl',       badge: 'bg-pink-950/90 text-pink-200 border border-pink-700/80 shadow-2xs font-extrabold',          dot: 'bg-pink-400', topBar: 'bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400' },
  slate:    { wrap: 'border-[2px] sm:border-[2.5px] border-slate-600/80 hover:border-slate-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_16px_rgba(148,163,184,0.18)] hover:shadow-2xl',     badge: 'bg-slate-800 text-slate-200 border border-slate-600 shadow-2xs font-extrabold',              dot: 'bg-slate-400', topBar: 'bg-gradient-to-r from-slate-500 via-slate-400 to-zinc-400' },
  default:  { wrap: 'border-[2px] sm:border-[2.5px] border-slate-600/80 hover:border-slate-400 bg-slate-900 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_0_16px_rgba(148,163,184,0.18)] hover:shadow-2xl',     badge: 'bg-slate-800 text-slate-200 border border-slate-600 shadow-2xs font-extrabold',              dot: 'bg-slate-400', topBar: 'bg-gradient-to-r from-slate-500 via-slate-400 to-zinc-400' },
};

const CARD_LIGHT = {
  first_world:   COLOR_CARD_LIGHT.teal,
  world:         COLOR_CARD_LIGHT.teal,
  first_india:   COLOR_CARD_LIGHT.amber,
  india:         COLOR_CARD_LIGHT.amber,
  awards:        COLOR_CARD_LIGHT.amber,
  science:       COLOR_CARD_LIGHT.purple,
  sci:           COLOR_CARD_LIGHT.purple,
  sports:        COLOR_CARD_LIGHT.red,
  defense:       COLOR_CARD_LIGHT.slate,
  international: COLOR_CARD_LIGHT.blue,
  intl:          COLOR_CARD_LIGHT.blue,
  national:      COLOR_CARD_LIGHT.orange,
  economy:       COLOR_CARD_LIGHT.green,
  schemes:       COLOR_CARD_LIGHT.indigo,
  summits:       COLOR_CARD_LIGHT.blue,
  indices:       COLOR_CARD_LIGHT.teal,
  art:           COLOR_CARD_LIGHT.indigo,
  days:          COLOR_CARD_LIGHT.amber,
  books:         COLOR_CARD_LIGHT.pink,
  space:         COLOR_CARD_LIGHT.purple,
  env:           COLOR_CARD_LIGHT.green,
  misc:          COLOR_CARD_LIGHT.slate,
  default:       COLOR_CARD_LIGHT.default,
};

// Dark theme card styles per category
const CARD_DARK = {
  first_world:   COLOR_CARD_DARK.teal,
  world:         COLOR_CARD_DARK.teal,
  first_india:   COLOR_CARD_DARK.amber,
  india:         COLOR_CARD_DARK.amber,
  awards:        COLOR_CARD_DARK.amber,
  science:       COLOR_CARD_DARK.purple,
  sci:           COLOR_CARD_DARK.purple,
  sports:        COLOR_CARD_DARK.red,
  defense:       COLOR_CARD_DARK.slate,
  international: COLOR_CARD_DARK.blue,
  intl:          COLOR_CARD_DARK.blue,
  national:      COLOR_CARD_DARK.orange,
  economy:       COLOR_CARD_DARK.green,
  schemes:       COLOR_CARD_DARK.indigo,
  summits:       COLOR_CARD_DARK.blue,
  indices:       COLOR_CARD_DARK.teal,
  art:           COLOR_CARD_DARK.indigo,
  days:          COLOR_CARD_DARK.amber,
  books:         COLOR_CARD_DARK.pink,
  space:         COLOR_CARD_DARK.purple,
  env:           COLOR_CARD_DARK.green,
  misc:          COLOR_CARD_DARK.slate,
  default:       COLOR_CARD_DARK.default,
};

// Concise mobile category names to guarantee 100% 1-line fit without truncation
const SHORT_CATEGORY_LABELS = {
  first_world:   'World: 1st',
  world:         'World: 1st',
  first_india:   'India: 1st',
  india:         'India: 1st',
  sports:        'Sports',
  science:       'Sci & Tech',
  sci:           'Sci & Tech',
  space:         'Space & ISRO',
  isro:          'Space & ISRO',
  env:           'Environment',
  ecology:       'Environment',
  environment:   'Environment',
  defense:       'Defense',
  defence:       'Defense',
  awards:        'Awards',
  books:         'Books',
  schemes:       'Schemes',
  summits:       'Summits',
  indices:       'Indices',
  days:          'Imp. Days',
  art:           'Art & Culture',
  economy:       'Economy',
  banking:       'Economy',
  national:      'National',
  international: 'International',
  intl:          'International',
  misc:          'General GK',
};

// Get category label + icon + color from config
const getCategoryMeta = (catId) => {
  const categories = (window.caConfig && window.caConfig.categories) ? window.caConfig.categories : [];
  const normalizedId = (catId || '').toLowerCase().trim();
  const cat = categories.find(c => {
    const cid = (c.id || '').toLowerCase();
    return cid === normalizedId ||
      (cid === 'international' && normalizedId === 'intl') ||
      (cid === 'intl' && normalizedId === 'international') ||
      (cid === 'first_world' && normalizedId === 'world') ||
      (cid === 'first_india' && normalizedId === 'india') ||
      (cid === 'science' && normalizedId === 'sci') ||
      (cid === 'space' && normalizedId === 'isro') ||
      (cid === 'env' && (normalizedId === 'ecology' || normalizedId === 'environment'));
  });
  const cleanLabel = (catId || 'General').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const fullLabel = cat ? (cat.label || cat.name) : cleanLabel;
  const shortLabel = SHORT_CATEGORY_LABELS[normalizedId] || (cat && (cat.shortLabel || cat.shortName)) || fullLabel;
  return { 
    label: fullLabel, 
    shortLabel: shortLabel,
    name: cat ? cat.name : fullLabel,
    emoji: (cat && cat.emoji) || (cat && cat.name ? cat.name.split(' ')[0] : '💡'),
    icon: (cat && cat.icon) || 'fa-solid fa-bookmark', 
    color: (cat && cat.color) || 'slate' 
  };
};

// 💡 Universal Memory Trick Formatter with Hanging Indent (Zero duplicate icons & flawless alignment)
const renderFormattedTrick = (trickStr, textClassName = "") => {
  if (!trickStr) return null;
  const cleanStr = trickStr.replace(/^(?:💡|🧠|🎯)\s*/, '').trim();
  const chars = Array.from(cleanStr);
  if (chars.length > 0) {
    const first = chars[0];
    const cp = first.codePointAt(0);
    const isEmoji = cp > 0x1F000 || (cp >= 0x2600 && cp <= 0x27BF) || (cp >= 0x2300 && cp <= 0x23FF);
    if (isEmoji) {
      let idx = 1;
      while (idx < chars.length && (chars[idx] === '\uFE0F' || chars[idx] === '\uFE0E' || chars[idx] === '\u200D' || (chars[idx - 1] === '\u200D'))) {
        idx++;
      }
      const emoji = chars.slice(0, idx).join('');
      const text = cleanStr.slice(emoji.length).trim();
      return (
        <div className="flex items-start gap-2 text-left select-text w-full">
          <span className="shrink-0 text-sm sm:text-base leading-snug select-none pt-0.5">{emoji}</span>
          <p className={`flex-1 font-semibold leading-relaxed tracking-wide ${textClassName}`}>
            {text}
          </p>
        </div>
      );
    }
  }
  return (
    <p className={`font-semibold leading-relaxed tracking-wide text-left select-text ${textClassName}`}>
      {cleanStr}
    </p>
  );
};
window.renderFormattedTrick = renderFormattedTrick;

// Individual current affairs card
const CACard = ({ 
  item, 
  index, 
  theme, 
  activeCategory, 
  categoryTotal, 
  catStats,
  checkpoint, 
  checkpointIndex, 
  onMarkLastRead, 
  onShareCard, 
  onTrackReadCard, 
  isPodcastActive,
  isExpanded360,
  onToggle360,
  cardHeightClass
}) => {
  const [localShowDetails, setLocalShowDetails] = useState(false);
  const showDetails = isExpanded360 !== undefined ? isExpanded360 : localShowDetails;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isDark = theme === 'dark';
  const isMega = (window.caConfig && (window.caConfig.mode === 'mega' || window.caConfig.isMega === true)) || (window.caConfig && window.caConfig.questions && window.caConfig.questions.length >= 400);
  const catMeta = getCategoryMeta(item.category);
  const catColor = catMeta.color || 'slate';

  // ⏱️ Anti-Cheat Dwell-Time Observer (Card is only counted as Read if viewed for >= 3.5s)
  useEffect(() => {
    if (!onTrackReadCard) return;
    let dwellTimer = null;
    const cardEl = document.getElementById(`ca-card-${item.id}`);
    if (!cardEl || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          dwellTimer = setTimeout(() => {
            onTrackReadCard(item.id);
          }, 3500);
        } else {
          if (dwellTimer) {
            clearTimeout(dwellTimer);
            dwellTimer = null;
          }
        }
      });
    }, { threshold: 0.5 });

    observer.observe(cardEl);
    return () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      observer.disconnect();
    };
  }, [item.id, onTrackReadCard]);

  useEffect(() => {
    const handleGlobalStarted = (e) => {
      if (e && e.detail && e.detail.id === `card-${item.id}`) {
        setIsSpeaking(true);
      } else {
        setIsSpeaking(false);
      }
    };
    const handleGlobalStop = (e) => {
      if (!e || !e.detail || !e.detail.stoppedId || e.detail.stoppedId === `card-${item.id}` || window.caCurrentSpeakingId !== `card-${item.id}`) {
        setIsSpeaking(false);
      }
    };
    window.addEventListener('ca-speech-started', handleGlobalStarted);
    window.addEventListener('ca-speech-stopped', handleGlobalStop);
    return () => {
      window.removeEventListener('ca-speech-started', handleGlobalStarted);
      window.removeEventListener('ca-speech-stopped', handleGlobalStop);
      if (window.caCurrentSpeakingId === `card-${item.id}`) {
        window.caStopSpeech();
      }
    };
  }, [item.id]);

  const handleToggleAudio = (e) => {
    e.stopPropagation();
    if (onTrackReadCard) onTrackReadCard(item.id);
    if (isSpeaking || window.caCurrentSpeakingId === `card-${item.id}` || (window.caCurrentAudioObj && !window.caCurrentAudioObj.paused)) {
      window.caStopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      window.caSpeak(
        item,
        `card-${item.id}`,
        () => setIsSpeaking(false),
        () => setIsSpeaking(true)
      );
    }
  };
  
  const cStyle = isDark 
    ? (CARD_DARK[item.category] || COLOR_CARD_DARK[catColor] || CARD_DARK.default) 
    : (CARD_LIGHT[item.category] || COLOR_CARD_LIGHT[catColor] || CARD_LIGHT.default);
  const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const tagBg = isDark 
    ? 'bg-rose-950/70 text-rose-300 border-rose-800/80' 
    : 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-xs';
  
  const answerBox = isDark 
    ? 'bg-indigo-950/30 border-indigo-500/30' 
    : 'bg-indigo-50/50 border-indigo-100/90';
  const answerTxt = isDark ? 'text-indigo-300' : 'text-indigo-800';
  const labelAns = isDark ? 'text-indigo-400' : 'text-indigo-600';
  
  // 💡 Golden Vault Memory Trick Container
  const trickBox = isDark 
    ? 'bg-gradient-to-br from-amber-950/30 via-yellow-950/20 to-orange-950/30 border-amber-500/40 shadow-xs' 
    : 'bg-gradient-to-br from-amber-500/[0.08] via-yellow-500/[0.06] to-orange-500/[0.08] border-amber-300/60 shadow-xs';
  const trickTxt = isDark ? 'text-amber-200' : 'text-amber-900';
  const labelTrick = isDark ? 'text-amber-400' : 'text-amber-600';

  const isCurrentCheckpoint = checkpoint && String(checkpoint.id) === String(item.id);
  const isReadSoFar = checkpointIndex !== null && (index + 1) <= checkpointIndex;

  return (
    <div 
      id={`ca-card-${item.id}`}
      data-qid={item.id}
      className={`ca-card relative w-full ${cardHeightClass || 'h-full'} flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border transition-all duration-300 snap-start scroll-mt-2 sm:scroll-mt-4 ${cStyle.wrap} 
        ${isPodcastActive ? 'ca-podcast-glow ring-2 ring-amber-400 dark:ring-amber-400 z-10' : isCurrentCheckpoint ? 'ring-2 ring-emerald-400/80 dark:ring-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}
    >
      {/* 🌟 Luxury Category Edge Accent Indicator */}
      <div className={`absolute top-0 left-6 right-6 h-[3px] sm:h-[3.5px] rounded-b-full ${cStyle.topBar || cStyle.dot} opacity-90 shadow-xs pointer-events-none`}></div>

      {/* ── Main Top & Middle Content Section ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 mb-3 min-w-0 h-7 sm:h-8">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1 overflow-hidden">
            {/* Exam Focus Badge */}
            <span className={`shrink-0 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8.5px] sm:text-xs font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 ${tagBg}`}>
              <span className="text-[10px] sm:text-xs leading-none select-none">🎯</span>
              <span className="hidden sm:inline">{item.examTag || "EXAM FOCUS"}</span>
              <span className="inline sm:hidden">{item.examTag ? item.examTag.split(' ')[0] : "FOCUS"}</span>
            </span>

            {/* Category Badge with Emoji */}
            <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 min-w-0 ${cStyle.badge}`} title={catMeta.name || catMeta.label}>
              <span className="shrink-0 text-[10.5px] sm:text-xs leading-none select-none">{catMeta.emoji || (catMeta.name ? catMeta.name.split(' ')[0] : '📁')}</span>
              <span className="hidden md:inline truncate">{catMeta.label}</span>
              <span className="inline md:hidden truncate">{catMeta.shortLabel || catMeta.label}</span>
            </div>
          </div>
          
          {/* Header Right: Live Sound Wave Equalizer Badge or GyanLayer Watermark */}
          {isPodcastActive ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 dark:bg-amber-400/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-[8.5px] sm:text-[9.5px] font-black tracking-wide shrink-0">
              <span className="flex items-end gap-0.5 h-3 pr-0.5">
                <span className="w-0.5 bg-amber-500 rounded-full animate-eq-1"></span>
                <span className="w-0.5 bg-amber-500 rounded-full animate-eq-2"></span>
                <span className="w-0.5 bg-amber-500 rounded-full animate-eq-3"></span>
                <span className="w-0.5 bg-amber-500 rounded-full animate-eq-4"></span>
              </span>
              <span className="uppercase text-[8.5px]">AUDIO</span>
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-1 text-[8px] sm:text-[9.5px] font-black tracking-wider uppercase text-slate-500/80 dark:text-slate-400/80 bg-slate-100/70 dark:bg-slate-800/70 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 pointer-events-none select-none">
              <img src={window.GYANLAYER_LOGO || "Logo Gyanlayer/clean_logo_512.png"} alt="GyanLayer Logo" className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain inline-block shrink-0" onError={(e) => { e.target.onerror = null; if (window.GYANLAYER_LOGO) e.target.src = window.GYANLAYER_LOGO; }} />
              <span>GYANLAYER</span>
            </div>
          )}
        </div>

        {/* ── Optional Image ── */}
        {item.image && (
          <div className="w-full h-40 sm:h-48 md:h-56 mb-3 sm:mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
            <img src={item.image} alt="Reference" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        {/* ── Date & Master Q# Meta Bar (Symmetrically Balanced Left & Right) ── */}
        <div className={`flex items-center justify-between gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-3 min-w-0 ${textMuted}`}>
          {/* Left: Date Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9.5px] sm:text-xs font-bold bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-xs shrink-0">
            <i className="fa-solid fa-calendar-days text-[11px] text-indigo-500 dark:text-indigo-400"></i>
            <span className="truncate">{(item.date || "2025–2026").replace(/^:\s*/, '')}</span>
          </div>

          {/* Right: Master Question ID / Category Sequence & Speedy Book Reference */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isMega && item.bookQNum ? (
              <div className="px-2.5 py-1 rounded-lg text-[9.5px] sm:text-xs font-black bg-sky-50/90 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 flex items-center gap-1 shadow-xs shrink-0" title="Speedy Book Question Reference">
                <span>📖 Book Q.</span>
                <span>{item.bookQNum}</span>
              </div>
            ) : (activeCategory !== 'all' ? (
              <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/70 flex items-center gap-1 shadow-xs" title={`Category Question ${index + 1} of ${categoryTotal || 1}`}>
                <i className="fa-solid fa-bullseye text-[8.5px] text-violet-500"></i>
                <span>Q. {index + 1} of {categoryTotal || (index + 1)}</span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* ── Question (Strict Block Alignment & Balanced Min-Height) ── */}
        <div className={`min-h-[5rem] sm:min-h-[5.5rem] flex-1 flex items-start gap-2.5 sm:gap-3 text-base sm:text-lg lg:text-xl font-bold leading-relaxed mb-2.5 ${textMain}`}>
          <div className={`shrink-0 flex items-center justify-end font-black tracking-tight min-w-[2.25rem] text-right pt-[1px] md:pt-0.5 select-none ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            <span>{item.id}.</span>
            {isReadSoFar && (
              <span 
                className={`text-xs sm:text-sm ml-1 font-black ${isCurrentCheckpoint ? 'text-emerald-500' : 'text-emerald-500/80 dark:text-emerald-400/80'}`}
                title={isCurrentCheckpoint ? "Current Reading Checkpoint" : "Read"}
              >
                {isCurrentCheckpoint ? <i className="fa-solid fa-bookmark text-[10px] text-emerald-500"></i> : '✓'}
              </span>
            )}
          </div>
          <span className="flex-1 text-left leading-relaxed">{item.question}</span>
        </div>

        {/* ── Answer (Uniform Proportion & Studio Soft Highlight) ── */}
        <div className={`min-h-[4rem] sm:min-h-[4.25rem] rounded-xl p-2.5 sm:p-3.5 border ${answerBox} mb-2.5 shadow-xs flex flex-col justify-center transition-all duration-300 ${isPodcastActive ? 'ring-2 ring-emerald-400/90 dark:ring-emerald-400/90 shadow-md shadow-emerald-500/20 bg-emerald-500/10' : ''}`}>
          <div className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5 ${labelAns}`}>
            <i className="fa-solid fa-circle-check text-xs"></i>
            <span>Correct Answer</span>
          </div>
          <p className={`text-sm sm:text-base font-bold leading-relaxed text-left ${answerTxt}`}>{item.answer}</p>
        </div>

        {/* ── Memory Trick (Flawless Typography & Uniform Proportion) ── */}
        {item.memoryTrick && (
          <div className={`min-h-[4.25rem] sm:min-h-[4.5rem] rounded-xl p-2.5 sm:p-3.5 border ${trickBox} mb-2.5 shadow-xs flex flex-col justify-center`}>
            <div className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${labelTrick}`}>
              <i className="fa-solid fa-lightbulb text-xs"></i>
              <span>Memory Trick</span>
            </div>
            {renderFormattedTrick(item.memoryTrick, `text-xs sm:text-sm ${trickTxt}`)}
          </div>
        )}

        {/* ── Card Bottom Action Bar (Audio + 360° Details + Mark Read) ── */}
        <div className="mt-auto pt-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 🔊 Audio Reader Button (Manual Click Only, 0 Auto-Play) */}
            <button
              onClick={handleToggleAudio}
              className={`py-2 sm:py-2.5 px-2 sm:px-2.5 rounded-xl border text-[10.5px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-xs shrink-0 cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500 border-amber-400 text-white animate-pulse shadow-amber-500/30'
                  : (isDark ? 'bg-slate-800/90 border-slate-700 text-amber-300 hover:bg-slate-750 hover:border-amber-500/40' : 'bg-amber-50/90 border-amber-200 text-amber-800 hover:bg-amber-100')
              }`}
              title={isSpeaking ? "ऑडियो रोकें (Stop)" : "ऑडियो सुनें (Listen)"}
            >
              <i className={`fa-solid ${isSpeaking ? 'fa-volume-high text-amber-100' : 'fa-volume-low text-amber-500'} text-xs`}></i>
              <span className="text-[10px] sm:text-xs font-bold">{isSpeaking ? 'रोकें' : 'सुनें'}</span>
            </button>

            {/* 360° Details Inline Toggle Button */}
            {item.explanation ? (
              <button
                onClick={() => {
                  if (onToggle360) {
                    onToggle360(item.id);
                  } else {
                    setLocalShowDetails(!localShowDetails);
                  }
                  if (!showDetails && onTrackReadCard) onTrackReadCard(item.id);
                }}
                className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-xs min-w-0 cursor-pointer ${
                  showDetails
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : (isDark ? 'bg-slate-800/90 border-slate-700 text-indigo-300 hover:bg-slate-750' : 'bg-slate-100/90 border-slate-200 text-indigo-600 hover:bg-slate-150')
                }`}
                title="360° विस्तृत व्याख्या देखें"
              >
                <i className={`fa-solid ${showDetails ? 'fa-chevron-up text-[10px]' : 'fa-circle-info text-xs'} shrink-0`}></i>
                <span className="truncate">
                  <span className="inline sm:hidden">{showDetails ? "Hide" : "360°"}</span>
                  <span className="hidden sm:inline">{showDetails ? "Hide 360°" : "360° Details"}</span>
                </span>
              </button>
            ) : null}

            {/* Share / Save Card Image Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onTrackReadCard) onTrackReadCard(item.id);
                if (onShareCard) onShareCard(item);
              }}
              title="कार्ड इमेज शेयर करें (Share / Save Image)"
              className={`py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-xs shrink-0 cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/90 text-cyan-300 hover:text-cyan-200 border-slate-700 hover:border-cyan-500/50' 
                  : 'bg-cyan-50/90 text-cyan-700 hover:text-cyan-800 border-cyan-200 hover:border-cyan-300'
              }`}
            >
              <i className="fa-solid fa-share-nodes text-xs"></i>
            </button>

            {/* Mark Read Checkpoint Button (Smooth Solid Transition, No Glitch) */}
            <button
              onClick={() => {
                if (onTrackReadCard) onTrackReadCard(item.id);
                onMarkLastRead(item);
              }}
              className={`py-2 sm:py-2.5 px-2 sm:px-2.5 rounded-xl border text-[10.5px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-xs shrink-0 ${
                isCurrentCheckpoint
                  ? 'bg-emerald-600 hover:bg-rose-600 text-white border-emerald-500 group shadow-emerald-900/20'
                  : (isDark ? 'bg-slate-800/90 text-slate-300 hover:text-indigo-300 border-slate-700 hover:border-indigo-500/50' : 'bg-slate-100/90 text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-300')
              }`}
              title={isCurrentCheckpoint ? "Click to clear checkpoint" : "Set as Reading Checkpoint"}
            >
              {isCurrentCheckpoint ? (
                <React.Fragment>
                  <i className="fa-solid fa-check text-white group-hover:hidden text-xs"></i>
                  <i className="fa-solid fa-xmark hidden group-hover:inline text-white text-[10px]"></i>
                  <span className="group-hover:hidden text-[10.5px] sm:text-xs font-black flex items-center gap-1">
                    Saved <span className="opacity-80 text-[9.5px] sm:hidden">✕</span>
                  </span>
                  <span className="hidden group-hover:inline text-[10.5px] sm:text-xs font-black">Clear ✕</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <i className="fa-regular fa-bookmark text-indigo-500 dark:text-indigo-400 text-xs"></i>
                  <span className="text-[10.5px] sm:text-xs font-bold">Mark Read</span>
                </React.Fragment>
              )}
            </button>

            {/* Shift / Repeat Info Badge (Placed in open space next to Mark Read) */}
            {item.shiftInfo && (
              <div 
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-xl border text-[9.5px] sm:text-[10.5px] font-extrabold flex items-center justify-center gap-1 min-w-0 select-none shadow-xs ${
                  isDark 
                    ? 'bg-amber-950/30 text-amber-300 border-amber-800/60' 
                    : 'bg-amber-50/90 text-amber-800 border-amber-200/90'
                }`}
                title={item.rawDate || item.shiftInfo}
              >
                <span>{item.shiftInfo}</span>
              </div>
            )}
          </div>

          {/* ── Expanded Inline Accordion Details (In News, Key Points, Static GK) ── */}
          {showDetails && item.explanation && (
            <div className="mt-3 space-y-2.5 text-xs sm:text-sm animate-fade-in-app pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
              {item.explanation.inNews && (
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-blue-950/20 border-blue-800 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'}`}>
                  <strong className="block mb-1 font-black text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400">📰 In News</strong>
                  <p className="leading-relaxed text-left font-medium">{item.explanation.inNews}</p>
                </div>
              )}
              {item.explanation.keyPoints && item.explanation.keyPoints.length > 0 && (
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-emerald-950/20 border-emerald-800 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'}`}>
                  <strong className="block mb-1.5 font-black text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">🎯 Key Points</strong>
                  <div className="space-y-1.5 font-medium">
                    {item.explanation.keyPoints.map((kp, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span className="flex-1 text-left">{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {item.explanation.additionalInfo && item.explanation.additionalInfo.length > 0 && (
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-purple-950/20 border-purple-800 text-purple-200' : 'bg-purple-50/80 border-purple-200 text-purple-900'}`}>
                  <strong className="block mb-1.5 font-black text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-400">📝 Additional Information (Static GK)</strong>
                  <div className="space-y-1.5 font-medium">
                    {item.explanation.additionalInfo.map((ai, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                        <span className="flex-1 text-left">{ai}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🎬 Ultra-Premium 16:9 Widescreen Cinema Presentation Slide Card for YouTube Videos & Studio Screen Recording
const CinemaSlideCard = ({ 
  item, 
  index, 
  totalCount, 
  theme, 
  selectedCategory, 
  onNext, 
  onPrev, 
  onToggleView, 
  isPlaying,
  onTogglePlay,
  isTheaterMode,
  onToggleTheater,
  onSelectPart
}) => {
  const isDark = theme === 'dark';
  const catMeta = getCategoryMeta(item.category || selectedCategory);
  const catColor = catMeta.color || 'slate';
  
  const cStyle = isDark 
    ? (CARD_DARK[item.category] || COLOR_CARD_DARK[catColor] || CARD_DARK.default) 
    : (CARD_LIGHT[item.category] || COLOR_CARD_LIGHT[catColor] || CARD_LIGHT.default);

  const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const answerBox = isDark 
    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.25)]' 
    : 'bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-sm';
  const trickBox = isDark 
    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
    : 'bg-amber-50/80 border-amber-300 text-amber-900';
  const explainBox = isDark
    ? 'bg-slate-900/80 border-slate-700/80 text-slate-200'
    : 'bg-slate-50/90 border-slate-200 text-slate-800';

  const progressPercent = Math.round(((index + 1) / totalCount) * 100);

  const allParts = (window.caConfig && window.caConfig.youtubeAudioParts) ? window.caConfig.youtubeAudioParts : [];
  const currentPartObj = allParts.find(p => (index + 1) >= p.startQ && (index + 1) <= p.endQ) || allParts[0];
  const currentPartNum = currentPartObj ? currentPartObj.part : 1;

  return (
    <div className="w-full max-w-[1780px] mx-auto flex flex-col items-center justify-center animate-fade-in-app py-0">
      {/* ── 16:9 Widescreen Master Broadcast Tablet ── */}
      <div className={`relative w-full rounded-3xl p-6 sm:p-8 md:p-9 border-2 transition-all duration-300 shadow-2xl ${cStyle.wrap} border-amber-500/90 dark:border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50`}>
        
        {/* ── Top Horizontal Progress Line ── */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200/50 dark:bg-slate-800/80 rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ── 2-COLUMN 16:9 WIDESCREEN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ════════ LEFT COLUMN (Core Q&A Hero ~ 7 Cols) ════════ */}
          <div className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-5">
            
            {/* Top Meta Badges */}
            <div className="flex items-center justify-between gap-2 flex-wrap min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shadow-xs">
                  <span>🎯</span>
                  <span>{item.examTag || "EXAM FOCUS"}</span>
                </span>
                <div className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${cStyle.badge}`} title={catMeta.name || catMeta.label}>
                  <span className="text-sm shrink-0 leading-none select-none">{catMeta.emoji || (catMeta.name ? catMeta.name.split(' ')[0] : '📁')}</span>
                  <span>{catMeta.label}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <i className="fa-solid fa-calendar-days text-indigo-500"></i>
                  <span className="truncate">{(item.date || "2025–2026").replace(/^:\s*/, '')}</span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-xs font-black shrink-0">
                <span>QUESTION {index + 1} OF {totalCount}</span>
              </div>
            </div>

            {/* Optional Image */}
            {item.image && (
              <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm">
                <img src={item.image} alt="Reference" className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}

            {/* Question Text (Spacious Hindi Line Height & Beautiful Margin) */}
            <div className="flex items-start gap-3.5 sm:gap-4 my-1.5 sm:my-2.5">
              <span className="shrink-0 px-3.5 py-1.5 rounded-xl bg-violet-600 text-white font-black text-base sm:text-lg md:text-xl shadow-sm select-none mt-1">
                Q.{item.id}
              </span>
              <h2 style={{ lineHeight: '1.85' }} className={`text-xl sm:text-2xl lg:text-[25px] xl:text-[28px] font-black text-left tracking-normal ${textMain}`}>
                {item.question}
              </h2>
            </div>

            {/* Correct Answer Box (Ample Padding, High-Contrast & Verified Badge) */}
            <div className={`rounded-2xl p-4 sm:p-4.5 border-2 ${answerBox} transition-all duration-300 flex items-center justify-between gap-4 my-2 shadow-sm`}>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <i className="fa-solid fa-circle-check text-base"></i>
                  <span>Correct Answer (सही उत्तर)</span>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-[32px] font-black text-left leading-normal text-emerald-950 dark:text-emerald-100">
                  {item.answer}
                </p>
              </div>
              <div className="shrink-0 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-check-double text-xs"></i>
                <span>VERIFIED</span>
              </div>
            </div>

            {/* Memory Trick Box (Golden Accent with Luxurious Breathing Room) */}
            {item.memoryTrick && (
              <div className={`rounded-2xl p-4 sm:p-4.5 border-2 ${trickBox} shadow-xs my-2`}>
                <div className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <i className="fa-solid fa-lightbulb text-sm"></i>
                  <span>Memory Trick (याद रखने की ट्रिक)</span>
                </div>
                <div style={{ lineHeight: '1.75' }}>
                  {renderFormattedTrick(item.memoryTrick, "text-base sm:text-lg lg:text-[18px] font-bold")}
                </div>
              </div>
            )}

          </div>

          {/* ════════ RIGHT COLUMN (360° Facts & Studio Dock ~ 5 Cols) ════════ */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 sm:space-y-5 h-full">
            
            {/* Top Studio Watermark Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Live Audio Equalizer Badge & Part Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-black tracking-wide shadow-xs">
                  <span className="flex items-end gap-0.5 h-3.5 pr-0.5">
                    <span className={`w-0.5 bg-amber-500 rounded-full ${isPlaying ? 'animate-eq-1' : 'h-1'}`}></span>
                    <span className={`w-0.5 bg-amber-500 rounded-full ${isPlaying ? 'animate-eq-2' : 'h-2'}`}></span>
                    <span className={`w-0.5 bg-amber-500 rounded-full ${isPlaying ? 'animate-eq-3' : 'h-1'}`}></span>
                    <span className={`w-0.5 bg-amber-500 rounded-full ${isPlaying ? 'animate-eq-4' : 'h-2.5'}`}></span>
                  </span>
                  <span>{isPlaying ? 'LIVE AUDIO SYNC' : 'STUDIO BROADCAST'}</span>
                </div>

                {/* 🎙️ Part Selector Dropdown (Parts 1 to 11) */}
                {window.caConfig && window.caConfig.youtubeAudioParts && (
                  <div className="flex items-center gap-1.5 bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/30 rounded-xl px-2.5 py-1">
                    <i className="fa-solid fa-microphone-lines text-indigo-600 dark:text-indigo-400 text-xs"></i>
                    <select
                      value={currentPartNum}
                      onChange={(e) => onSelectPart && onSelectPart(Number(e.target.value))}
                      className="bg-transparent text-xs font-black text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer pr-1"
                      title="Select Audio Part to Record / Play"
                    >
                      {window.caConfig.youtubeAudioParts.map(p => (
                        <option key={p.part} value={p.part} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* GyanLayer Watermark Badge */}
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-500/80 dark:text-slate-400/80 bg-slate-100/70 dark:bg-slate-800/70 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 pointer-events-none select-none">
                <img src={window.GYANLAYER_LOGO || "Logo Gyanlayer/clean_logo_512.png"} alt="GyanLayer Logo" className="w-4 h-4 object-contain inline-block shrink-0" onError={(e) => { e.target.onerror = null; if (window.GYANLAYER_LOGO) e.target.src = window.GYANLAYER_LOGO; }} />
                <span>GYANLAYER</span>
              </div>
            </div>

            {/* 360° Explanation Card (Broadcast HD High-Contrast Typography) */}
            {item.explanation && (
              <div className={`rounded-2xl p-4 sm:p-5 border-2 ${explainBox} leading-relaxed text-left max-h-[580px] overflow-y-auto main-scroll shadow-md`}>
                <div className="text-xs sm:text-sm font-black uppercase tracking-wider mb-2.5 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 sticky top-0 bg-inherit py-1 z-10">
                  <i className="fa-solid fa-circle-info text-base"></i>
                  <span>360° Detailed Explanation</span>
                </div>
                {typeof item.explanation === 'string' ? (
                  <p className="text-base sm:text-lg font-bold leading-relaxed text-slate-900 dark:text-slate-100">{item.explanation}</p>
                ) : (
                  <div className="space-y-3">
                    {item.explanation.inNews && (
                      <div className="p-3.5 rounded-xl bg-blue-500/15 dark:bg-blue-950/70 border-2 border-blue-500/40 shadow-xs">
                        <strong className="block text-xs sm:text-sm font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                          <span>📰</span>
                          <span>In News</span>
                        </strong>
                        <p className="text-sm sm:text-base md:text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-relaxed">{item.explanation.inNews}</p>
                      </div>
                    )}
                    {item.explanation.keyPoints && item.explanation.keyPoints.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/70 border-2 border-emerald-500/40 shadow-xs">
                        <strong className="block text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5">
                          <span>🎯</span>
                          <span>Key Points</span>
                        </strong>
                        <div className="space-y-2">
                          {item.explanation.keyPoints.map((kp, kIdx) => (
                            <div key={kIdx} className="flex items-start gap-2.5 text-sm sm:text-base md:text-[17px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-xs"></span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">{kp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.explanation.additionalInfo && item.explanation.additionalInfo.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-purple-500/15 dark:bg-purple-950/70 border-2 border-purple-500/40 shadow-xs">
                        <strong className="block text-xs sm:text-sm font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5 flex items-center gap-1.5">
                          <span>📝</span>
                          <span>Extra Facts (Static GK)</span>
                        </strong>
                        <div className="space-y-2">
                          {item.explanation.additionalInfo.map((ai, aIdx) => (
                            <div key={aIdx} className="flex items-start gap-2.5 text-sm sm:text-base md:text-[17px]">
                              <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0 shadow-xs"></span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">{ai}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Broadcast Control Dock */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onPrev}
                  disabled={index === 0}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Previous Question Slide (← Arrow Key)"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                  <span>Prev [←]</span>
                </button>
                <button
                  onClick={onNext}
                  disabled={index >= totalCount - 1}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Next Question Slide (→ Arrow Key)"
                >
                  <span>Next [→]</span>
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={onTogglePlay}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Play/Pause Podcast (P / Space Key)"
                >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                  <span>{isPlaying ? 'Pause' : 'Play [P]'}</span>
                </button>
                <button
                  onClick={onToggleTheater}
                  className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isTheaterMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Toggle 100% Full-Screen Theater Mode (T or F Key)"
                >
                  <i className={`fa-solid ${isTheaterMode ? 'fa-compress' : 'fa-expand'} text-xs`}></i>
                  <span>{isTheaterMode ? 'Exit Theater [T]' : 'Theater [T]'}</span>
                </button>
                <button
                  onClick={onToggleView}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Switch to Grid View (S Key)"
                >
                  <i className="fa-solid fa-table-cells-large text-xs"></i>
                  <span>Grid [S]</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

// Study Notes tab root
const StudyNotes = ({
  questions = [],
  allQuestions = [],
  categories = [],
  month = 'जनवरी',
  year = 2026,
  theme = 'dark',
  selectedCategory = 'all',
  setSelectedCategory,
  searchQuery = '',
  viewMode: propViewMode,
  setViewMode: propSetViewMode,
  onShareCard,
  onTrackReadCard
}) => {
  const isDark = theme === 'dark';
  const isYouTubeStudio = Boolean(window.caConfig && window.caConfig.isYouTubeStudio);
  const [checkpoint, setCheckpoint] = useState(() => window.getReadingCheckpoint(selectedCategory));
  const [showBanner, setShowBanner] = useState(true);
  
  // 🪟 View Mode: 'grid' (Default Infographic Cards) vs 'map' (Reading Map Tree) vs 'slide' (Presentation Deck)
  const [localViewMode, setLocalViewMode] = useState(() => isYouTubeStudio ? 'slide' : 'grid');
  const viewMode = propViewMode !== undefined ? propViewMode : localViewMode;
  const setViewMode = propSetViewMode || setLocalViewMode;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // 🎬 100% Immersive Full-Screen Broadcast Theater Mode (Activated via [T] or toggle button)
  const [isTheaterMode, setIsTheaterMode] = useState(() => Boolean(isYouTubeStudio));

  useEffect(() => {
    window.caSetCurrentSlideIndex = setCurrentSlideIndex;
    window.caSetViewMode = setViewMode;
    window.caSetTheaterMode = setIsTheaterMode;
    return () => {
      window.caSetCurrentSlideIndex = null;
    };
  }, [setViewMode]);

  useEffect(() => {
    if (isYouTubeStudio && viewMode === 'slide' && isTheaterMode) {
      document.body.classList.add('ca-theater-mode');
    } else {
      document.body.classList.remove('ca-theater-mode');
    }
    return () => {
      document.body.classList.remove('ca-theater-mode');
    };
  }, [viewMode, isTheaterMode, isYouTubeStudio]);

  // Dynamic category-relative question serial number (e.g. Question #5 in Sports)
  const categoryQuestionIndex = useMemo(() => {
    if (!checkpoint || !questions || !questions.length) return null;
    const idx = questions.findIndex(q => String(q.id) === String(checkpoint.id));
    return idx !== -1 ? idx + 1 : null;
  }, [checkpoint, questions]);

  // 🎯 Category question sequence map: For each question ID, calculate { catIndex, catTotal }
  const catStatsMap = useMemo(() => {
    const map = {};
    const catListMap = {};
    const source = (allQuestions && allQuestions.length > 0) ? allQuestions : ((window.caConfig && window.caConfig.questions) || questions || []);

    source.forEach(q => {
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
  }, [allQuestions, questions]);

  // ⚡ High-Performance Progressive Chunk Rendering (0ms Instant Load)
  const [visibleCount, setVisibleCount] = useState(() => {
    if (categoryQuestionIndex && categoryQuestionIndex > 30) {
      return Math.min(categoryQuestionIndex + 15, questions.length);
    }
    return Math.min(30, questions.length);
  });

  // ⚡ Instant scroll-to-top reset on category change (0ms animated delay)
  useEffect(() => {
    const scrollEl = document.querySelector('.main-scroll');
    if (scrollEl) {
      scrollEl.scrollTop = 0;
    }
    setVisibleCount(30);
  }, [selectedCategory]);

  const observerRef = useRef(null);
  const [activePodcastQId, setActivePodcastQId] = useState(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);

  // 📐 Responsive Grid Column Tracker & 360° Isolated Accordion Engine
  const [gridCols, setGridCols] = useState(() => (typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1) : 3));
  const [expanded360Set, setExpanded360Set] = useState(() => new Set());

  useEffect(() => {
    const updateGridCols = () => {
      const w = window.innerWidth;
      setGridCols(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    window.addEventListener('resize', updateGridCols);
    return () => window.removeEventListener('resize', updateGridCols);
  }, []);

  const handleToggle360 = useCallback((qId) => {
    const sId = String(qId);
    setExpanded360Set(prev => {
      const next = new Set(prev);
      if (next.has(sId)) {
        next.delete(sId);
      } else {
        next.add(sId);
      }
      return next;
    });
  }, []);

  // 🌟 Unified Top-Level Podcast Spotlight & Slide Sync Observer
  useEffect(() => {
    if (window.caPodcastController) {
      const unsub = window.caPodcastController.subscribe((state) => {
        if (state && state.isActive && state.currentQ) {
          const targetId = String(state.currentQ.id);
          setActivePodcastQId(targetId);
          setIsPodcastPlaying(state.isPlaying === true);

          // Auto-sync current slide index in Slide Mode
          const idx = questions.findIndex(q => String(q.id) === targetId);
          if (idx !== -1) {
            setCurrentSlideIndex(idx);
            if (idx >= visibleCount - 4) {
              setVisibleCount(prev => Math.min(Math.max(prev, idx + 25), questions.length));
            }
          }
        } else {
          setActivePodcastQId(null);
          setIsPodcastPlaying(false);
        }
      });
      return unsub;
    }
  }, [questions, visibleCount]);

  // Keyboard Shortcuts: [S] for Slide/Grid Toggle (Studio Only), [T]/[F] for Theater Mode (Studio Only), [←] [→] for Slide Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (!isYouTubeStudio) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setViewMode(prev => prev === 'slide' ? 'grid' : 'slide');
      } else if (e.key === 't' || e.key === 'T' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsTheaterMode(prev => !prev);
      } else if (e.key === 'ArrowRight' && viewMode === 'slide') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(questions.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' && viewMode === 'slide') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, questions.length, isYouTubeStudio]);

  const [customSlideItem, setCustomSlideItem] = useState(null);

  useEffect(() => {
    window.caSetCustomSlideItem = (customItem, customIdx) => {
      setCustomSlideItem(customItem);
      if (typeof customIdx === 'number') {
        setCurrentSlideIndex(customIdx);
        window.caCurrentSlideIndex = customIdx;
      }
    };
  }, []);

  // Keep window.caCurrentSlideIndex synchronized for 1-click [P] keyboard shortcut
  useEffect(() => {
    window.caCurrentSlideIndex = currentSlideIndex;
  }, [currentSlideIndex]);

  // Sync checkpoint & reset chunk count when category tab or questions change
  useEffect(() => {
    const cp = window.getReadingCheckpoint(selectedCategory);
    setCheckpoint(cp);
    setShowBanner(true);

    let initialCount = 30;
    if (cp && questions && questions.length) {
      const idx = questions.findIndex(q => String(q.id) === String(cp.id));
      if (idx !== -1) {
        if (idx >= 30) initialCount = Math.min(idx + 15, questions.length);
        setCurrentSlideIndex(idx);
      }
    }
    setVisibleCount(Math.min(initialCount, questions.length));
  }, [selectedCategory, questions.length]);

  // 🔄 Real-time listener for checkpoint updates (e.g. from Parent App SET_READ_CHECKPOINTS)
  useEffect(() => {
    const handleCpUpdate = () => {
      const cp = window.getReadingCheckpoint(selectedCategory);
      setCheckpoint(cp);
      if (cp) setShowBanner(true);
    };
    window.addEventListener('ca_reading_checkpoint_updated', handleCpUpdate);
    return () => window.removeEventListener('ca_reading_checkpoint_updated', handleCpUpdate);
  }, [selectedCategory]);

  // ⚡ IntersectionObserver for 0ms Smooth Progressive Virtual Chunk Loading
  useEffect(() => {
    if (visibleCount >= questions.length) return;

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 30, questions.length));
        }
      }, { rootMargin: '600px' });

      const el = observerRef.current;
      if (el) observer.observe(el);
      return () => {
        if (el) observer.unobserve(el);
      };
    } else {
      const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800) {
          setVisibleCount(prev => Math.min(prev + 30, questions.length));
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [visibleCount, questions.length]);

  const handleMarkLastRead = (item) => {
    const isAlready = checkpoint && String(checkpoint.id) === String(item.id);
    if (isAlready) {
      window.clearReadingCheckpoint(selectedCategory);
      setCheckpoint(null);
      setShowBanner(false);
    } else {
      window.setReadingCheckpoint(selectedCategory, item);
      const cp = window.getReadingCheckpoint(selectedCategory);
      setCheckpoint(cp);
      setShowBanner(true);
    }
  };

  const handleContinueReading = () => {
    if (!checkpoint) return;
    const targetIdx = questions.findIndex(q => String(q.id) === String(checkpoint.id));
    if (targetIdx !== -1) {
      if (viewMode === 'slide') {
        setCurrentSlideIndex(targetIdx);
        setShowBanner(false);
      } else {
        const needsMore = targetIdx >= visibleCount;
        if (needsMore) {
          setVisibleCount(Math.min(targetIdx + 20, questions.length));
        }
        setTimeout(() => {
          const targetEl = document.getElementById(`ca-card-${checkpoint.id}`) ||
                           document.querySelector(`[data-qid="${checkpoint.id}"]`) ||
                           document.getElementById(`card-q-${checkpoint.id}`);
          if (targetEl) {
            const scrollContainer = document.querySelector('.main-scroll');
            if (scrollContainer) {
              const containerRect = scrollContainer.getBoundingClientRect();
              const targetRect = targetEl.getBoundingClientRect();
              const targetScrollTop = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - 10;
              scrollContainer.style.scrollSnapType = 'none';
              scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
              setTimeout(() => {
                if (scrollContainer) scrollContainer.style.scrollSnapType = '';
              }, 900);
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            targetEl.classList.add('ring-4', 'ring-emerald-500', 'shadow-2xl');
            setTimeout(() => {
              if (targetEl) targetEl.classList.remove('ring-4', 'ring-emerald-500', 'shadow-2xl');
            }, 3000);
          }
        }, needsMore ? 180 : 50);
      }
    }
  };

  const handleStartOver = () => {
    window.clearReadingCheckpoint(selectedCategory);
    setCheckpoint(null);
    setShowBanner(false);
    setCurrentSlideIndex(0);
    const scrollEl = document.querySelector('.main-scroll');
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePodcast = () => {
    if (window.caPodcastController) {
      if (isPodcastPlaying) {
        window.caPodcastController.pause();
      } else {
        const defaultSpeed = (window.caConfig && window.caConfig.isYouTubeStudio) ? 1.0 : 1.25;
        window.caPodcastController.start(questions, currentSlideIndex, defaultSpeed, 'YouTube Studio');
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <p className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          कोई परिणाम नहीं मिला
        </p>
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          दूसरी category चुनें या search शब्द बदलें
        </p>
      </div>
    );
  }

  const catMeta = getCategoryMeta(selectedCategory);
  const isMega = (window.caConfig && (window.caConfig.mode === 'mega' || window.caConfig.isMega === true)) || (window.caConfig && window.caConfig.questions && window.caConfig.questions.length >= 400);

  // ── VIEW 1: 🌳 Left-to-Right Reading Map Tree (Pinned Full-Height View - Desktop & Laptop Only) ──
  if (viewMode === 'map' && (typeof window === 'undefined' || window.innerWidth >= 768)) {
    return (
      <div className="w-full max-w-[1700px] mx-auto h-full flex-1 flex flex-col min-h-0 overflow-hidden px-1 sm:px-2 pt-0.5">
        <MindMap
          questions={allQuestions && allQuestions.length > 0 ? allQuestions : questions}
          allQuestions={allQuestions && allQuestions.length > 0 ? allQuestions : questions}
          categories={categories}
          month={month}
          year={year}
          theme={theme}
          searchQuery={searchQuery}
          onOpenStudyCard={(q) => {
            setViewMode('grid');
            if (setSelectedCategory && q && q.category) {
              setSelectedCategory(q.category);
            }
            setTimeout(() => {
              const el = document.getElementById(`ca-card-${q.id}`) || document.querySelector(`[data-qid="${q.id}"]`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-emerald-400');
                setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-400'), 2500);
              }
            }, 150);
          }}
        />
      </div>
    );
  }

  return (
    <div id="study-notes-content" className={`w-full ${isYouTubeStudio && viewMode === 'slide' ? 'max-w-[1850px] px-2 sm:px-4 lg:px-6 py-1 flex-1 flex flex-col justify-center' : 'max-w-[1500px] px-3 sm:px-6 lg:px-8 py-3 sm:py-5'} mx-auto`}>
      {/* ── 🔖 Per-Topic Instant Resume Reading Glassmorphic Banner ── */}
      {checkpoint && showBanner && (() => {
        const cpStats = catStatsMap[String(checkpoint.id)];
        const qObj = (allQuestions && allQuestions.length > 0 ? allQuestions : questions).find(q => String(q.id) === String(checkpoint.id)) || checkpoint;
        const qCatObj = categories.find(c => c.id === (qObj.category || selectedCategory));
        const topicLabel = (selectedCategory !== 'all' ? catMeta.label : (qCatObj ? qCatObj.label : 'All Topics'));
        const topicIndex = cpStats ? cpStats.catIndex : categoryQuestionIndex;
        const topicTotal = cpStats ? cpStats.catTotal : questions.length;

        return (
          <div className={`snap-start scroll-mt-2 sm:scroll-mt-4 mb-3.5 sm:mb-4 p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all shadow-md animate-fade-in-app ${
            isDark 
              ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/50 text-emerald-200' 
              : 'bg-gradient-to-r from-emerald-50 via-teal-50/80 to-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
              
              {/* Left: Icon & Dual Info Badges */}
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full sm:flex-1">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs">
                  <i className="fa-solid fa-bookmark"></i>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10.5px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate max-w-[150px] sm:max-w-none">
                      Last Read: {topicLabel}
                    </span>
                    
                    {/* Dual Number Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {topicIndex && topicTotal && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-[10.5px] font-black tracking-tight">
                          Topic: {topicIndex} of {topicTotal}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] sm:text-[10.5px] font-black shadow-2xs">
                        Main Q# {checkpoint.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-0.5 sm:pt-0">
                <button
                  onClick={handleContinueReading}
                  className="py-2 sm:py-1.5 px-3 sm:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-forward-step text-xs"></i>
                  <span className="truncate">
                    Continue {topicIndex ? `(${topicIndex}/${topicTotal})` : `(Q#${checkpoint.id})`}
                  </span>
                </button>
                <button
                  onClick={handleStartOver}
                  className={`py-2 sm:py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700' 
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs'
                  }`}
                  title="Start Over from Q# 1"
                >
                  <i className="fa-solid fa-rotate-left text-xs"></i>
                  <span>Start Over</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Subheader Controls Bar (Question Count) ── */}
      <div className="ca-theater-hide-on-broadcast flex items-center justify-between mb-2 min-w-0">
        <p className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {questions.length} प्रश्न मिले
        </p>
      </div>

      {/* ── VIEW 2: 🎬 Full-Screen 1-Question Cinema Slide Presentation Deck (Studio Only) ── */}
      {isYouTubeStudio && viewMode === 'slide' ? (
        <CinemaSlideCard
          item={customSlideItem || questions[currentSlideIndex] || questions[0]}
          index={customSlideItem ? (parseInt(customSlideItem.id, 10) - 1 || currentSlideIndex) : currentSlideIndex}
          totalCount={questions.length}
          theme={theme}
          selectedCategory={selectedCategory}
          onNext={() => {
            const nextIdx = Math.min(questions.length - 1, currentSlideIndex + 1);
            setCurrentSlideIndex(nextIdx);
            if (isPodcastPlaying && window.caPodcastController) {
              window.caPodcastController.currentIndex = nextIdx;
              window.caPodcastController.playCurrent();
            }
          }}
          onPrev={() => {
            const prevIdx = Math.max(0, currentSlideIndex - 1);
            setCurrentSlideIndex(prevIdx);
            if (isPodcastPlaying && window.caPodcastController) {
              window.caPodcastController.currentIndex = prevIdx;
              window.caPodcastController.playCurrent();
            }
          }}
          onToggleView={() => setViewMode('grid')}
          isPlaying={isPodcastPlaying}
          onTogglePlay={handleTogglePodcast}
          isTheaterMode={isTheaterMode}
          onToggleTheater={() => setIsTheaterMode(prev => !prev)}
          onSelectPart={(partNum) => {
            const parts = (window.caConfig && window.caConfig.youtubeAudioParts) ? window.caConfig.youtubeAudioParts : [];
            const targetP = parts.find(p => p.part === partNum);
            if (targetP) {
              const startIdx = targetP.startQ - 1;
              setCurrentSlideIndex(startIdx);
              window.caCurrentSlideIndex = startIdx;
              window.caActivePartNum = partNum;
              if (window.caPodcastController) {
                window.caPodcastController.setPart(partNum, false);
              }
            }
          }}
        />
      ) : (
        /* ── VIEW 3: ▦ Standard Symmetrical Uniform Card Grid (Default) ── */
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full transition-all duration-300 ${activePodcastQId ? 'ca-cinema-container' : ''}`}>
          {questions.slice(0, visibleCount).map((item, i) => {
            const rowIndex = Math.floor(i / gridCols);
            const rowStart = rowIndex * gridCols;
            const rowEnd = rowStart + gridCols;
            const rowSlice = questions.slice(rowStart, rowEnd);
            const rowHasExpanded = rowSlice.some(q => expanded360Set.has(String(q.id)));
            const isThisExpanded = expanded360Set.has(String(item.id));
            const cardHeightClass = (rowHasExpanded && !isThisExpanded) ? 'self-start h-auto' : 'h-full';

            return (
              <CACard
                key={item.id}
                item={item}
                index={i}
                theme={theme}
                activeCategory={selectedCategory}
                categoryTotal={questions.length}
                catStats={catStatsMap[String(item.id)]}
                checkpoint={checkpoint}
                checkpointIndex={categoryQuestionIndex}
                onMarkLastRead={handleMarkLastRead}
                onShareCard={onShareCard}
                onTrackReadCard={onTrackReadCard}
                isPodcastActive={activePodcastQId === String(item.id)}
                isExpanded360={isThisExpanded}
                onToggle360={handleToggle360}
                cardHeightClass={cardHeightClass}
              />
            );
          })}

          {/* ⚡ High-Speed Virtualized Loading Sentinel */}
          {visibleCount < questions.length && (
            <div 
              ref={observerRef} 
              className="w-full py-8 flex flex-col items-center justify-center gap-2 col-span-full"
            >
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-slate-400">Loading more questions... ({visibleCount}/{questions.length})</span>
            </div>
          )}
        </div>
      )}

      {/* Bulletproof mobile scroll snapping spacer */}
      <div className="h-40 md:h-0 w-full shrink-0 pointer-events-none snap-none" />
    </div>
  );
};
