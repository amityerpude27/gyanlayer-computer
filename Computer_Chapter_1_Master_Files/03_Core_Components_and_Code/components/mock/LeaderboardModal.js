// components/mock/LeaderboardModal.js — Testbook All-India Leaderboard & Percentile Engine

// ── Official National Testing Agency (NTA) & Testbook Percentile Engine ──
// Formula: (Count of aspirants with raw score <= candidate's score / Total aspirants) * 100
// Equivalent with Rank R and Total N: ((N - R + 1) / N) * 100
// ════════════════════════════════════════════════════════
const computeOfficialPercentile = (myScore, userRank, totalCount, candidateList) => {
  const totalN = Math.max(1, Number(totalCount) || (candidateList ? candidateList.length : 1));
  if (totalN <= 1) return '100.0';

  // Method 1: If candidateList is available, count exact candidates with score <= myScore (handles ties natively)
  if (Array.isArray(candidateList) && candidateList.length > 0) {
    const numScore = Number(myScore !== undefined ? myScore : 0);
    const countLessOrEqual = candidateList.filter(c => Number(c.score !== undefined ? c.score : 0) <= numScore).length;
    // Ensure effective count is at least 1 (the candidate themselves) and does not exceed totalN
    const effectiveCount = Math.max(1, Math.min(totalN, countLessOrEqual));
    const pctile = (effectiveCount / totalN) * 100;
    return Math.max(0.1, Math.min(100.0, pctile)).toFixed(1);
  }

  // Method 2: Authentic Rank-based NTA formula: ((N - R + 1) / N) * 100
  const r = Math.max(1, Math.min(totalN, Number(userRank) || 1));
  const pctile = ((totalN - r + 1) / totalN) * 100;
  return Math.max(0.1, Math.min(100.0, pctile)).toFixed(1);
};


// ── Podium Name Formatter (First Name + Surname Initial e.g. "Amit Y.") ──
const formatPodiumName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'Aspirant';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
};

// ── Disambiguated Candidate Name Helper (Testbook Standard: 100% Clean Names Without Cryptic Hashes) ──
const getCandidateDisplayName = (cand, allCandidates = [], isPodium = false) => {
  if (!cand) return 'Aspirant';
  const rawName = cand.name || cand.user_name || 'Aspirant';
  return isPodium ? formatPodiumName(rawName) : rawName;
};

// ── Testbook-Grade Leaderboard Modal Component ──
const LeaderboardModal = ({ isOpen, onClose, userRank, totalCandidates, activeAttempt, userName, unifiedTopRankers, realLeaderboard, dk, wm }) => {
  if (!isOpen) return null;

  const card = dk ? 'bg-slate-900 border-slate-800' : wm ? 'bg-[#faf7ef] border-[#e0d5b0]' : 'bg-white border-slate-200';
  const tm = dk ? 'text-slate-100' : 'text-slate-800';
  const ts = dk ? 'text-slate-400' : 'text-slate-500';

  const att = activeAttempt || {};
  const maxMarks = att.max || 25;
  const timeTaken = att.taken || 180;
  const scoreMarks = att.score !== undefined ? att.score : 0;
  const totCand = typeof totalCandidates === 'number' ? totalCandidates.toLocaleString() : (totalCandidates || '1');

  // Pure Real Rankers List (No Fake Bots, 100% Mathematically Authentic & Tied with Current Score)
  const rankers = (unifiedTopRankers && Array.isArray(unifiedTopRankers) && unifiedTopRankers.length > 0)
    ? unifiedTopRankers
    : (realLeaderboard && realLeaderboard.topRankers && Array.isArray(realLeaderboard.topRankers) && realLeaderboard.topRankers.length > 0)
    ? realLeaderboard.topRankers
    : [
        {
          rank: userRank || 1,
          name: userName || 'You',
          score: scoreMarks,
          time: timeTaken,
          avatar: (window.caConfig && window.caConfig.userAvatar) || window.caUserAvatar || (typeof localStorage !== 'undefined' ? localStorage.getItem('ca_user_avatar') : null) || '👨‍🎓',
          isLocalUser: true,
          isCurrentUser: true
        }
      ];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in-app overflow-y-auto custom-scroll">
      <div className={`w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden relative z-10 ${card}`}>
        {/* Header */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg sm:text-xl text-amber-500 shrink-0">
              🏆
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black leading-tight ${tm}`}>Test Leaderboard</h3>
              <p className={`text-[11px] sm:text-xs font-bold ${ts} mt-0.5`}>
                {att.test ? att.test.name : 'Mock Test'} • Total Aspirants: {totCand}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {Number(totalCandidates) < 5 ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-lock"></i>
            </div>
            <h4 className={`text-base font-extrabold ${tm}`}>Leaderboard Unlocks at 5 Students</h4>
            <p className={`text-xs ${ts} max-w-xs mx-auto leading-relaxed`}>
              Abhi is test ko {totCand} student{Number(totalCandidates) > 1 ? 's ne' : ' ne'} attempt kiya hai. Jaise hi 5 students complete karenge, full podium aur rankings live ho jayengi!
            </p>
            <div className="pt-2">
              <button onClick={onClose} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all cursor-pointer">
                Theek Hai (Got it)
              </button>
            </div>
          </div>
        ) : (
          <React.Fragment>
            {/* Top 3 Podium Cards */}
            {rankers.length >= 2 ? (
              <div className="px-2 sm:px-4 pt-3 sm:pt-4 pb-2 grid grid-cols-3 gap-1.5 sm:gap-3 bg-gradient-to-b from-indigo-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 shrink-0">
                {/* 2nd Slot (Podium Position 2) */}
                {rankers[1] ? (
                  <div className={`flex flex-col items-center justify-end p-1.5 sm:p-2.5 rounded-xl border text-center min-w-0 ${rankers[1].rank === 1 ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700'}`}>
                    <div className="relative inline-block my-0.5">
                      {rankers[1].avatar && typeof rankers[1].avatar === 'string' && (rankers[1].avatar.startsWith('http') || rankers[1].avatar.startsWith('data:')) ? (
                        <img 
                          src={rankers[1].avatar} 
                          alt="" 
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600 shadow-sm mx-auto" 
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm shadow-sm mx-auto">
                          {rankers[1].avatar || '👨‍🎓'}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-xs sm:text-sm drop-shadow">{rankers[1].rank === 1 ? '🥇' : '🥈'}</span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-black mt-0.5 ${rankers[1].rank === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>Rank {rankers[1].rank}</span>
                    <div className="w-full flex items-center justify-center gap-1 mt-0.5 min-w-0" title={rankers[1].name}>
                      <span className={`text-[10.5px] sm:text-xs font-extrabold truncate ${tm}`}>
                        {getCandidateDisplayName(rankers[1], rankers, true)}
                      </span>
                      {rankers[1].isCurrentUser && (
                        <span className="shrink-0 px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-black ${rankers[1].rank === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{rankers[1].score}/{maxMarks}</span>
                  </div>
                ) : <div />}
                {/* 1st Slot (Center Podium) */}
                {rankers[0] && (
                  <div className="flex flex-col items-center justify-end p-1.5 sm:p-2.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-center shadow-md relative -translate-y-1 min-w-0">
                    <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[8px] sm:text-[9px] font-black tracking-wider uppercase shadow-xs">
                      Topper
                    </span>
                    <div className="relative inline-block mt-1 my-0.5">
                      {rankers[0].avatar && typeof rankers[0].avatar === 'string' && (rankers[0].avatar.startsWith('http') || rankers[0].avatar.startsWith('data:')) ? (
                        <img 
                          src={rankers[0].avatar} 
                          alt="" 
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400 shadow-md mx-auto ring-2 ring-amber-400/40" 
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-500/20 flex items-center justify-center text-base shadow-sm mx-auto border-2 border-amber-400">
                          {rankers[0].avatar || '👨‍🎓'}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-sm sm:text-base drop-shadow">🥇</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-400 mt-0.5">Rank {rankers[0].rank || 1}</span>
                    <div className="w-full flex items-center justify-center gap-1 mt-0.5 min-w-0" title={rankers[0].name}>
                      <span className={`text-[10.5px] sm:text-xs font-extrabold truncate ${tm}`}>
                        {getCandidateDisplayName(rankers[0], rankers, true)}
                      </span>
                      {rankers[0].isCurrentUser && (
                        <span className="shrink-0 px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-600 dark:text-amber-400">{rankers[0].score}/{maxMarks}</span>
                  </div>
                )}
                {/* 3rd Slot (Podium Position 3) */}
                {rankers[2] ? (
                  <div className={`flex flex-col items-center justify-end p-1.5 sm:p-2.5 rounded-xl border text-center min-w-0 ${rankers[2].rank === 1 ? 'bg-amber-500/10 border-amber-500/40' : rankers[2].rank === 2 ? 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700' : 'bg-amber-700/10 dark:bg-amber-900/20 border-amber-600/30'}`}>
                    <div className="relative inline-block my-0.5">
                      {rankers[2].avatar && typeof rankers[2].avatar === 'string' && (rankers[2].avatar.startsWith('http') || rankers[2].avatar.startsWith('data:')) ? (
                        <img 
                          src={rankers[2].avatar} 
                          alt="" 
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-amber-600/40 shadow-sm mx-auto" 
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm shadow-sm mx-auto">
                          {rankers[2].avatar || '👨‍🎓'}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-xs sm:text-sm drop-shadow">{rankers[2].rank === 1 ? '🥇' : rankers[2].rank === 2 ? '🥈' : '🥉'}</span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-black mt-0.5 ${rankers[2].rank <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-amber-700 dark:text-amber-400'}`}>Rank {rankers[2].rank}</span>
                    <div className="w-full flex items-center justify-center gap-1 mt-0.5 min-w-0" title={rankers[2].name}>
                      <span className={`text-[10.5px] sm:text-xs font-extrabold truncate ${tm}`}>
                        {getCandidateDisplayName(rankers[2], rankers, true)}
                      </span>
                      {rankers[2].isCurrentUser && (
                        <span className="shrink-0 px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-600 dark:text-amber-400">{rankers[2].score}/{maxMarks}</span>
                  </div>
                ) : <div />}
              </div>
            ) : null}

            {/* Scrollable Rankers List */}
            <div className="p-2 sm:p-3 space-y-1.5 overflow-y-auto flex-1 custom-scroll max-h-[48vh] sm:max-h-[44vh]">
              {rankers.map((r, i) => {
                const isMe = r.isCurrentUser;
                const rRank = r.rank !== undefined ? r.rank : (i + 1);
                return (
                  <div
                    key={r.userId || i}
                    className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-2 sm:gap-3 transition-all ${
                      isMe
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm ring-1 ring-amber-400/40'
                        : dk
                        ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                        : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        rRank === 1 ? 'bg-amber-500 text-slate-950' : rRank === 2 ? 'bg-slate-300 text-slate-900' : rRank === 3 ? 'bg-amber-700 text-white' : dk ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {rRank}
                      </div>
                      {r.avatar && (typeof r.avatar === 'string') && (r.avatar.startsWith('http') || r.avatar.startsWith('data:')) ? (
                        <img 
                          src={r.avatar} 
                          alt="" 
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700" 
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-sm sm:text-base shrink-0">{r.avatar || '👨‍🎓'}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs sm:text-sm font-extrabold truncate ${tm}`}>
                            {getCandidateDisplayName(r, rankers, false)}
                          </p>
                          {isMe && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[8px] sm:text-[8.5px] uppercase tracking-wider font-black shrink-0 shadow-xs">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] font-bold ${ts} flex items-center gap-2 mt-0.5`}>
                          <span>⏱️ {fmt(r.time || 0)}</span>
                          {r.accuracy !== undefined && <span>• 🎯 {r.accuracy}% Acc</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs sm:text-sm font-black block ${isMe ? 'text-amber-600 dark:text-amber-400' : dk ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {r.score}/{maxMarks}
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold block">Marks</span>
                    </div>
                  </div>
                );
              })}
              {!realLeaderboard && (
                <div className="p-3 my-2 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  ⚡ All-India Live Leaderboard connects automatically inside GyanLayer App.
                </div>
              )}
            </div>

            {/* Sticky "YOU" Rank Card at Bottom */}
            {(() => {
              const myCandidateObj = rankers.find(r => r.isCurrentUser);
              const myAv = (myCandidateObj && myCandidateObj.avatar && myCandidateObj.avatar !== '👨‍🎓')
                ? myCandidateObj.avatar
                : (window.caConfig && window.caConfig.userAvatar) || window.caUserAvatar || (typeof localStorage !== 'undefined' ? localStorage.getItem('ca_user_avatar') : null) || '👨‍🎓';
              return (
                <div className="p-2.5 sm:p-3.5 bg-indigo-600 text-white flex items-center justify-between shrink-0 shadow-lg">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
                      #{userRank}
                    </div>
                    {myAv && typeof myAv === 'string' && (myAv.startsWith('http') || myAv.startsWith('data:')) ? (
                      <img 
                        src={myAv} 
                        alt="" 
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white/40 shrink-0" 
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center text-sm shrink-0">
                        {myAv || '👨‍🎓'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-black flex items-center gap-1.5 truncate">
                        <span>{userName}</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[8.5px] sm:text-[9px] uppercase tracking-wider font-extrabold">YOU</span>
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-indigo-200 block">
                        Rank {userRank} of {totCand} • ⏱️ {fmt(timeTaken)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-white block">{scoreMarks}/{maxMarks}</span>
                    <span className="text-[9.5px] sm:text-[10px] text-indigo-200 font-bold">{computeOfficialPercentile(scoreMarks, userRank, totCand, rankers)}%ile</span>
                  </div>
                </div>
              );
            })()}
          </React.Fragment>
        )}
      </div>
    </div>,
    document.body
  );
};

if (typeof window !== 'undefined') {
  window.LeaderboardModal = LeaderboardModal;
  window.computeOfficialPercentile = computeOfficialPercentile;
  window.formatPodiumName = formatPodiumName;
  window.getCandidateDisplayName = getCandidateDisplayName;
}
