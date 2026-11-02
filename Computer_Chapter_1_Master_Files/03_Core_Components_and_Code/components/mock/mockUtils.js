// components/mock/mockUtils.js — Exam-Style Mock Test Utilities & Shuffling Engine
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

// ── Deterministic Hash & Seeded Shuffler ──
const hashStr = (str) => {
  let hash = 0;
  const s = String(str || 'ca_mock_seed');
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed) => {
  const s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
};

const seededShuffle = (arr, seedKey = 'ca_mock_2026') => {
  const seed = hashStr(seedKey);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const r = Math.abs(seededRandom(seed + i));
    const j = Math.floor(r * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const stableShuf = (arr) => {
  return [...arr].sort((a, b) => {
    const ha = hashStr((a.id || a.question) + "ca_mock_2026");
    const hb = hashStr((b.id || b.question) + "ca_mock_2026");
    return ha - hb;
  });
};

// ── Universal Student Answer Lookup (Safe Fallback: idx -> qid_id) ──
const getStudentAnswer = (answers, q, idx) => {
  if (!answers || typeof answers !== 'object') return null;
  if (idx !== undefined && answers[idx] !== undefined) return answers[idx];
  if (q && q.id !== undefined && answers[`qid_${q.id}`] !== undefined) return answers[`qid_${q.id}`];
  if (q && q.id !== undefined && typeof q.id === 'string' && isNaN(Number(q.id)) && answers[q.id] !== undefined) return answers[q.id];
  return null;
};

// ── Build 4 options for a question (with Option D stability for "All/None of above") ──
const isFixedOptionD = (opt) => {
  if (!opt || typeof opt !== 'string') return false;
  const s = opt.toLowerCase().trim();
  return (
    s.includes('उपर्युक्त सभी') ||
    s.includes('उपरोक्त सभी') ||
    s.includes('इनमें से कोई नहीं') ||
    s.includes('इनमें से कोई भी नहीं') ||
    s.includes('all of the above') ||
    s.includes('all the above') ||
    s.includes('all of above') ||
    s.includes('none of the above') ||
    s.includes('none of above')
  );
};

const makeOpts = (q, allQs) => {
  const seed = String(q.id || q.question || 'opt_seed');
  if (q.options && Array.isArray(q.options) && q.options.length >= 2) {
    const rawOpts = [...q.options];
    const dIdx = rawOpts.findIndex(isFixedOptionD);
    if (dIdx !== -1) {
      // Keep "All/None of above" option strictly at Option D (index 3) and shuffle only the other 3
      const fixedOpt = rawOpts[dIdx];
      const otherOpts = seededShuffle(rawOpts.filter((_, idx) => idx !== dIdx), seed);
      return [...otherOpts, fixedOpt];
    }
    return seededShuffle(rawOpts, seed);
  }
  const others = seededShuffle([...new Set(allQs.map(x=>x.answer))].filter(a=>a!==q.answer), seed).slice(0,3);
  return seededShuffle([...others, q.answer], seed + '_opts');
};

// ── Build monthly sets (Strictly 25-Question Balanced Sets) ──
const buildMonthly = (qs, mc) => {
  const tag = mc.monthlyExamTag || 'RRB/SSC IMP';
  const per = mc.questionsPerSet || 25;
  const min = mc.minQuestionsForTopicTest || 5;
  
  // Stable shuffle so chunks are random relative to study notes, but stable across reloads
  const fil = seededShuffle(qs.filter(q => q.examTag === tag), 'monthly_filter_seed');
  
  if (fil.length < min) return [];
  const getRoman = (num) => {
    const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII','XXXIX','XL'];
    return romans[num - 1] || String(num);
  };

  const rawChunks = fil.reduce((acc, q, i) => {
    const si = Math.floor(i/per);
    if (!acc[si]) acc[si] = [];
    acc[si].push(q);
    return acc;
  }, []);

  // Strictly only include full 25-question sets (discard incomplete trailing mini-sets e.g. 5 questions)
  const completeChunks = rawChunks.filter(chunk => chunk.length === per);

  return completeChunks.map((chunk, i) => {
    const testId = 'mt_' + i;
    return {
      id: testId,
      name: (window.caConfig && (window.caConfig.mode === 'chapter' || (window.caConfig.title && window.caConfig.title.toLowerCase().includes('computer')) || (window.caConfig.month && window.caConfig.month.toLowerCase().includes('chapter'))))
        ? 'कंप्यूटर चैप्टर 1 — मॉक टेस्ट ' + (i + 1)
        : 'Mock Test - ' + getRoman(i + 1),
      type: 'monthly',
      qs: seededShuffle(chunk, `monthly_test_${testId}`).map(q => ({...q, opts: makeOpts(q, qs)})), // Deterministic seed
      mins: Math.ceil(chunk.length * (mc.monthlyTimeMinutes || 15) / per),
      mark: mc.marksPerCorrect || 1,
      neg: mc.negativeMarking || 0.33,
    };
  });
};

// ── Build topic sets with 30-Question Buffer Rule & Balanced Splitting ──
const buildTopic = (qs, cats, mc) => {
  const min = mc.minQuestionsForTopicTest || 5;
  const tpq = mc.topicTimePerQuestion || 0.75;
  const mint = mc.topicMinTime || 5;
  const qps = mc.questionsPerSet || 25; // Default standard chunk size

  const smallCatQuestions = [];

  const mainTopicTests = cats.filter(c => c.id !== 'all').flatMap(cat => {
    // Stable shuffle for topics
    const cqs = seededShuffle(qs.filter(q => q.category === cat.id), `topic_${cat.id}_filter`);
    const totalCount = cqs.length;
    if (totalCount < min) {
      if (totalCount > 0) {
        smallCatQuestions.push(...cqs);
      }
      return [];
    }
    
    // Dynamic 30-Question Buffer Chunking
    const chunks = [];
    if (totalCount <= 30) {
      // Tier 1: 5 to 30 Questions (e.g. 18, 22, 27) -> 1 Single Complete Topic Master Capsule!
      chunks.push(cqs);
    } else if (totalCount <= 50) {
      // Tier 2: 31 to 50 Questions (e.g. 40 Qs) -> Even balanced split into 2 sets (e.g. 20 + 20)
      const half = Math.ceil(totalCount / 2);
      chunks.push(cqs.slice(0, half));
      chunks.push(cqs.slice(half));
    } else {
      // Tier 3: 51+ Questions -> Standard 25 chunks with tail-end buffer protection
      for (let i = 0; i < totalCount; i += qps) {
        const remaining = totalCount - i;
        if (remaining > 0 && remaining <= 5 && chunks.length > 0) {
          // If remaining is <= 5, merge into previous chunk so no tiny 2-3 question test is created
          chunks[chunks.length - 1] = chunks[chunks.length - 1].concat(cqs.slice(i));
          break;
        } else {
          chunks.push(cqs.slice(i, i + qps));
        }
      }
    }
    
    return chunks.map((chunk, index) => {
      const isMulti = chunks.length > 1;
      const setName = isMulti ? `${cat.label} — Set ${index + 1}` : `${cat.label} — Topic Test`;
      const setId = isMulti ? `tp_${cat.id}_set${index + 1}` : `tp_${cat.id}`;
      
      return {
        id: setId,
        name: setName,
        type: 'topic',
        qs: seededShuffle(chunk, `topic_test_${setId}`).map(q => ({...q, opts: makeOpts(q, qs)})), // Deterministic seed
        mins: Math.max(mint, Math.ceil(chunk.length * tpq)),
        mark: mc.marksPerCorrect || 1,
        neg: mc.negativeMarking || 0.33,
      };
    });
  }).filter(Boolean);

  // If there are micro-category questions (< 5 Qs each), create a Mixed & Other Topics Test
  if (smallCatQuestions.length > 0) {
    const mixedShuffled = seededShuffle(smallCatQuestions, 'topic_mixed_micro');
    mainTopicTests.push({
      id: 'tp_mixed_micro',
      name: 'Mixed & Other Topics Test (मिश्रित एवं अन्य टॉपिक्स)',
      type: 'topic',
      qs: seededShuffle(mixedShuffled, 'mixed_set').map(q => ({...q, opts: makeOpts(q, qs)})),
      mins: Math.max(mint, Math.ceil(mixedShuffled.length * tpq)),
      mark: mc.marksPerCorrect || 1,
      neg: mc.negativeMarking || 0.33,
    });
  }

  return mainTopicTests;
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

// ── Canonical Testbook Deduplication Engine ──
const deduplicateAttemptList = (list) => {
  if (!list || !Array.isArray(list) || list.length === 0) return [];
  if (list.length === 1) {
    const single = list[0];
    if (!single) return [];
    return [{
      ...single,
      attemptNumber: 1,
      attempt_number: 1,
      isOfficial: true
    }];
  }

  // Sort chronologically: oldest first, latest last
  const sorted = [...list].filter(Boolean).sort((a, b) => {
    const ta = new Date(a.timestamp || a.created_at || 0).getTime();
    const tb = new Date(b.timestamp || b.created_at || 0).getTime();
    return ta - tb;
  });

  const deduped = [];
  for (const item of sorted) {
    const itemTime = new Date(item.timestamp || item.created_at || 0).getTime();
    const itemScore = Number(item.score !== undefined ? item.score : 0);
    const itemTaken = Number(item.taken !== undefined ? item.taken : (item.time_taken || 0));
    const itemId = item.id || item.submission_id || null;

    const dupIndex = deduped.findIndex(existing => {
      const exId = existing.id || existing.submission_id || null;
      if (itemId && exId && itemId === exId) return true;

      const exTime = new Date(existing.timestamp || existing.created_at || 0).getTime();
      const exScore = Number(existing.score !== undefined ? existing.score : 0);
      const exTaken = Number(existing.taken !== undefined ? existing.taken : (existing.time_taken || 0));

      const timeDiff = Math.abs(itemTime - exTime);
      // Same test submission if timestamps are within 10 minutes (600,000 ms) AND score matches
      if (timeDiff < 600000 && Math.abs(itemScore - exScore) < 0.05) {
        if (Math.abs(itemTaken - exTaken) < 10 || itemTime === exTime || timeDiff < 60000) {
          return true;
        }
      }
      return false;
    });

    if (dupIndex !== -1) {
      // Merge richest fields into existing item
      const existing = deduped[dupIndex];
      deduped[dupIndex] = {
        ...existing,
        ...item,
        id: existing.id || item.id,
        userRank: (item.userRank !== undefined ? item.userRank : existing.userRank),
        totalParticipants: (item.totalParticipants !== undefined ? item.totalParticipants : existing.totalParticipants),
        leaderboard: item.leaderboard || existing.leaderboard,
        topRankers: item.topRankers || existing.topRankers,
        timestamp: Math.min(itemTime || Date.now(), new Date(existing.timestamp || existing.created_at || 0).getTime() || Date.now())
      };
    } else {
      deduped.push(item);
    }
  }

  // Canonical 1-based indexing for attempt numbers
  return deduped.map((att, idx) => ({
    ...att,
    attemptNumber: idx + 1,
    attempt_number: idx + 1,
    isOfficial: idx === 0
  }));
};

// ── Testbook Smart Attempt Date & Status Formatter ──
const formatAttemptStatus = (att, list) => {
  if (!att) return '';
  const cleanList = deduplicateAttemptList(list || []);
  const isReattempt = cleanList.length > 1 && att.attemptNumber !== 1 && att.attempt_number !== 1;
  const ts = att.timestamp || att.created_at;
  let dateText = 'Today';
  if (ts) {
    const d = new Date(ts);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfAtt = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (startOfAtt === startOfToday) {
      dateText = 'Today';
    } else if (startOfAtt === startOfYesterday) {
      dateText = 'Yesterday';
    } else {
      dateText = 'on ' + d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  }
  const prefix = isReattempt ? 'Reattempted ' : 'Attempted ';
  return `${prefix}${dateText}`;
};

// Expose on window for global modular access
if (typeof window !== 'undefined') {
  window.QS = QS;
  window.isToday = isToday;
  window.fmtDateText = fmtDateText;
  window.fmtDateOnly = fmtDateOnly;
  window.palColor = palColor;
  window.fmt = fmt;
  window.shuf = shuf;
  window.hashStr = hashStr;
  window.seededRandom = seededRandom;
  window.seededShuffle = seededShuffle;
  window.stableShuf = stableShuf;
  window.getStudentAnswer = getStudentAnswer;
  window.isFixedOptionD = isFixedOptionD;
  window.makeOpts = makeOpts;
  window.buildMonthly = buildMonthly;
  window.buildTopic = buildTopic;
  window.PaletteGrid = PaletteGrid;
  window.deduplicateAttemptList = deduplicateAttemptList;
  window.formatAttemptStatus = formatAttemptStatus;
}
