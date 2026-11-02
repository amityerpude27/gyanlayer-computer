// components/MockTest.js — Exam-Style Mock Test Main Coordinator & State Router

// ════════════════════════════════════════════════════════
//  MAIN: MockTest
// ════════════════════════════════════════════════════════
const MockTest = ({questions, theme, addMistake, onTestStateChange}) => {
  const cfg = window.caConfig || {};
  const mc  = cfg.mockConfig  || {};
  const cats = cfg.categories || [];
  const dk = theme==='dark';
  const wm = theme==='warm';

  const [screen, setScreen] = useState('select');
  const [selTest, setSelTest] = useState(null);
  const [result, setResult] = useState(null);
  const [key, setKey] = useState(0);

  // Synchronize active live test status with global app shell (locks bottom nav & guards tab switches)
  useEffect(() => {
    const isLive = screen === 'live';
    if (onTestStateChange) {
      onTestStateChange(isLive);
    }
    window.forceQuitMockTest = () => {
      setSelTest(null);
      setResult(null);
      setScreen('select');
      if (onTestStateChange) onTestStateChange(false);
    };
    return () => {
      if (onTestStateChange) onTestStateChange(false);
      delete window.forceQuitMockTest;
    };
  }, [screen, onTestStateChange]);

  // Unique key based on month and year to prevent cache collision across months
  const storageKey = `ca_mock_attempts_${cfg.month || 'default'}_${cfg.year || ''}`;

  // Load attempt history with multi-key resilient storage
  const [attempts, setAttempts] = useState(() => {
    try {
      let stored = localStorage.getItem(storageKey);
      if (!stored && cfg.month) stored = localStorage.getItem('ca_mock_attempts_' + cfg.month);
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      const migrated = {};
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          const tid = (item.test && item.test.id) || item.test_id || item.id;
          if (tid) {
            if (!migrated[tid]) migrated[tid] = [];
            migrated[tid].push({
              ...item,
              score: Number(item.score),
              max: Number(item.max || item.total || 1),
              acc: Number(item.acc !== undefined ? item.acc : (item.accuracy || 0)),
              taken: Number(item.taken !== undefined ? item.taken : (item.time_taken || 0)),
              timestamp: item.timestamp || item.created_at || Date.now(),
              test: item.test || { id: tid, name: item.test_name || 'Mock Test', mark: 1, neg: 0.33 }
            });
          }
        });
      } else if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach(k => {
          const rawList = Array.isArray(parsed[k]) ? parsed[k] : [parsed[k]];
          migrated[k] = rawList.filter(Boolean).map(item => {
            const tid = (item.test && item.test.id) || item.testId || item.test_id || k;
            return {
              ...item,
              score: Number(item.score || 0),
              max: Number(item.max || item.total || 1),
              acc: Number(item.acc !== undefined ? item.acc : (item.accuracy || 0)),
              taken: Number(item.taken !== undefined ? item.taken : (item.time_taken || 0)),
              timestamp: item.timestamp || item.created_at || Date.now(),
              test: item.test || {
                id: tid,
                name: item.testName || item.test_name || 'Mock Test',
                type: item.testType || item.type || 'monthly',
                mins: item.mins || 15,
                mark: item.mark || 1,
                neg: item.neg || 0.33
              }
            };
          });
        });
      }
      Object.keys(migrated).forEach(k => {
        migrated[k] = deduplicateAttemptList(migrated[k]);
      });
      // 🛡️ Enterprise Foreign Attempt Purge: Drop attempts with questions not in current month
      const currentValidQIds = new Set((questions || []).map(q => String(q.id)));
      const sanitized = {};
      Object.keys(migrated).forEach(k => {
        const validAttempts = migrated[k].filter(att => {
          if (att.test && Array.isArray(att.test.qs) && att.test.qs.length > 0) {
            return att.test.qs.every(q => currentValidQIds.has(String(q.id)));
          }
          return true;
        });
        if (validAttempts.length > 0) {
          sanitized[k] = validAttempts;
        }
      });
      return sanitized;
    } catch(e) {
      return {};
    }
  });

  // 🏆 Persistent real-time leaderboard cache for multi-user sync
  const [leaderboardMap, setLeaderboardMap] = useState(() => {
    try {
      const stored = localStorage.getItem('ca_real_leaderboards');
      return stored ? JSON.parse(stored) : {};
    } catch(e) {
      return {};
    }
  });

  const handleRealLeaderboardUpdate = (lbData, explicitTestId) => {
    if (!lbData) return;
    const tid = lbData.test_id || lbData.testId || lbData.raw_test_id || explicitTestId || (selTest && selTest.id);
    if (!tid) return;

    const realRank = lbData.userRank !== undefined ? Number(lbData.userRank) : (lbData.rank !== undefined ? Number(lbData.rank) : null);
    const realTotal = lbData.totalParticipants !== undefined ? Number(lbData.totalParticipants) : (lbData.total !== undefined ? Number(lbData.total) : (Array.isArray(lbData.topRankers) ? lbData.topRankers.length : null));

    // 1. Update leaderboardMap state and localStorage
    setLeaderboardMap(prev => {
      const updated = {
        ...prev,
        [tid]: lbData
      };
      if (lbData.raw_test_id) {
        updated[lbData.raw_test_id] = lbData;
      }
      if (tid.match(/^[a-z]+_\d{4}_/i)) {
        const stripped = tid.replace(/^[a-z]+_\d{4}_/i, '');
        updated[stripped] = lbData;
      }
      if (tid.includes('_')) {
        const simpleKey = tid.split('_').slice(-2).join('_'); // e.g. "tp_0"
        updated[simpleKey] = lbData;
      }
      try {
        localStorage.setItem('ca_real_leaderboards', JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });

    // 2. Update attempts in state and localStorage so the test card always reflects real rank & total participants
    setAttempts(prev => {
      let changed = false;
      const next = { ...prev };
      const keysToUpdate = Object.keys(next).filter(k => 
        k === tid || 
        k.toLowerCase() === tid.toLowerCase() || 
        tid.endsWith(k) || 
        k.endsWith(tid) ||
        k.replace(/[-_]/g, '') === tid.replace(/[-_]/g, '')
      );
      if (keysToUpdate.length === 0 && tid) {
        keysToUpdate.push(tid);
      }

      keysToUpdate.forEach(k => {
        const list = next[k] ? [...next[k]] : [];
        if (list.length > 0) {
          const latest = { ...list[list.length - 1] };
          if (realRank !== null) {
            latest.userRank = realRank;
          } else if (Array.isArray(lbData.topRankers) && lbData.topRankers.length > 0) {
            const myScore = Number(latest.score || 0);
            const myTime = Number(latest.taken || 0);
            const higher = lbData.topRankers.filter(r => {
              const rScore = Number(r.score || 0);
              const rTime = Number(r.time || 0);
              if (rScore > myScore) return true;
              if (rScore === myScore && rTime < myTime) return true;
              return false;
            }).length;
            latest.userRank = higher + 1;
          }
          if (realTotal !== null) latest.totalParticipants = realTotal;
          if (lbData.topRankers) latest.topRankers = lbData.topRankers;
          latest.leaderboard = lbData;
          list[list.length - 1] = latest;
          next[k] = list;
          changed = true;
        }
      });

      if (changed) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
          if (cfg.month) localStorage.setItem(`ca_mock_attempts_${cfg.month}`, JSON.stringify(next));
        } catch(e) {}
      }
      return next;
    });
  };

  // ☁️ Ingest Lifetime Supabase Attempt History from parent GyanLayer app / Admin Panel
  useEffect(() => {
    // ⚡ Trigger Direct Supabase Real-Time Leaderboard Sync on mount
    if (typeof window !== 'undefined' && window.syncAllSupabaseLeaderboards) {
      window.syncAllSupabaseLeaderboards();
    }
    // 📢 Ping Parent App on Mount to Request Stored Lifetime Attempts & User Profile
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_USER_PROFILE' }, '*');
        window.parent.postMessage({
          type: 'REQUEST_ATTEMPT_HISTORY',
          month: cfg.month,
          year: cfg.year
        }, '*');

        // Request live leaderboards for all previously attempted tests
        const attemptedKeys = Object.keys(attempts || {});
        attemptedKeys.forEach(rawTid => {
          const testMonth = cfg.month || 'January';
          const testYear = cfg.year || '2026';
          const resolvedTestId = (rawTid.includes('_mt_') || rawTid.includes('_tp_'))
            ? rawTid
            : `${testMonth.toLowerCase().replace(/\s+/g, '_')}_${testYear}_${rawTid}`;
          window.parent.postMessage({
            type: 'REQUEST_LEADERBOARD',
            payload: {
              test_id: resolvedTestId,
              raw_test_id: rawTid,
              month: testMonth,
              year: testYear
            }
          }, '*');
        });
      }
    } catch(e) {}

    const parseAndMergeAttempts = (raw, isAuthoritative = false) => {
      if (raw === undefined || raw === null) return;
      const normalized = {};
      if (Array.isArray(raw)) {
        raw.forEach(item => {
          if (!item) return;
          const fullTid = (item.test && item.test.id) || item.test_id || item.id;
          const rawTid = item.raw_test_id || (fullTid && (fullTid.includes('_mt_') ? 'mt_' + fullTid.split('_mt_')[1] : (fullTid.includes('_tp_') ? 'tp_' + fullTid.split('_tp_')[1] : fullTid)));
          
          const normTime = item.created_at 
            ? new Date(item.created_at).getTime() 
            : (typeof item.timestamp === 'number' ? item.timestamp : (item.timestamp ? new Date(item.timestamp).getTime() : Date.now()));
          const attemptNum = Number(item.attemptNumber || item.attempt_number || 1);

          const attemptObj = {
            ...item,
            score: Number(item.score || 0),
            max: Number(item.max || item.total || 1),
            acc: Number(item.acc !== undefined ? item.acc : (item.accuracy || 0)),
            taken: Number(item.taken !== undefined ? item.taken : (item.time_taken || 0)),
            correct: item.correct !== undefined ? item.correct : (item.correct_count !== undefined ? item.correct_count : item.cor),
            cor: item.correct !== undefined ? item.correct : (item.correct_count !== undefined ? item.correct_count : item.cor),
            wrong: item.wrong !== undefined ? item.wrong : (item.wrong_count !== undefined ? item.wrong_count : item.wrg),
            wrg: item.wrong !== undefined ? item.wrong : (item.wrong_count !== undefined ? item.wrong_count : item.wrg),
            skip: item.skip !== undefined ? item.skip : (item.skip_count !== undefined ? item.skip_count : item.skp),
            skp: item.skip !== undefined ? item.skip : (item.skip_count !== undefined ? item.skip_count : item.skp),
            answers: item.answers || {},
            times: item.times || {},
            timestamp: normTime,
            created_at: item.created_at || new Date(normTime).toISOString(),
            userRank: item.userRank !== undefined ? Number(item.userRank) : (item.user_rank !== undefined ? Number(item.user_rank) : (item.rank !== undefined ? Number(item.rank) : undefined)),
            totalParticipants: item.totalParticipants !== undefined ? Number(item.totalParticipants) : (item.total_participants !== undefined ? Number(item.total_participants) : undefined),
            attemptNumber: attemptNum,
            attempt_number: attemptNum,
            isOfficial: item.isOfficial !== undefined ? item.isOfficial : (item.is_official !== undefined ? item.is_official : (attemptNum === 1)),
            test: item.test || { id: rawTid || fullTid, name: item.test_name || 'Mock Test', mark: 1, neg: 0.33 }
          };

          const keysToSet = new Set([fullTid, rawTid].filter(Boolean));
          keysToSet.forEach(tid => {
            if (!normalized[tid]) normalized[tid] = [];
            normalized[tid].push(attemptObj);
          });
        });
      } else if (typeof raw === 'object') {
        Object.keys(raw).forEach(k => {
          if (Array.isArray(raw[k])) {
            normalized[k] = raw[k];
          } else if (raw[k]) {
            normalized[k] = [raw[k]];
          }
        });
      }

      setAttempts(prev => {
        const merged = isAuthoritative ? {} : { ...prev };
        const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(normalized)]);

        allKeys.forEach(tid => {
          const fromSupabase = normalized[tid] || [];
          const fromPrev = prev[tid] || [];

          let combined;
          if (isAuthoritative) {
            // Keep authoritative Supabase attempts, plus any attempt finished in last 45s in this session
            const recentLocal = fromPrev.filter(p => {
              const pTime = new Date(p.timestamp || p.created_at || 0).getTime();
              return (Date.now() - pTime < 45000);
            });
            combined = [...fromSupabase, ...recentLocal];
          } else {
            combined = [...fromPrev, ...fromSupabase];
          }

          const deduped = deduplicateAttemptList(combined);
          if (deduped.length > 0) {
            merged[tid] = deduped;
          }
        });

        try {
          localStorage.setItem(storageKey, JSON.stringify(merged));
        } catch(err) {}
        return merged;
      });
    };

    const handleAttemptsMsg = (e) => {
      try {
        if (!e.data) return;
        if (e.data.type === 'SET_ATTEMPT_HISTORY' || e.data.type === 'SET_MOCK_ATTEMPTS' || e.data.type === 'SYNC_SUPABASE_ATTEMPTS') {
          const supabaseAttempts = e.data.payload || e.data.data || e.data.attempts;
          parseAndMergeAttempts(supabaseAttempts, true);
        }
        if (e.data.type === 'SET_REAL_LEADERBOARD') {
          const lbData = e.data.payload || e.data.data || e.data.leaderboard || e.data;
          if (lbData) handleRealLeaderboardUpdate(lbData);
        }
        if (e.data.type === 'SET_USER_NAME') {
          const uPayload = e.data.payload || e.data.data || e.data;
          if (uPayload && typeof uPayload === 'object') {
            if (uPayload.name) window.caUserName = uPayload.name;
            if (uPayload.userId || uPayload.id) window.caUserId = uPayload.userId || uPayload.id;
          }
        }
      } catch(err) {
        console.error('[MockTest] Ingest Supabase attempts error:', err);
      }
    };
    const handleCustomAttempts = (e) => {
      if (e.detail) {
        const supabaseAttempts = e.detail.payload || e.detail.data || e.detail;
        parseAndMergeAttempts(supabaseAttempts, true);
      }
    };
    const handleCustomLeaderboard = (e) => {
      if (e.detail) {
        const lb = e.detail.payload || e.detail.data || e.detail;
        handleRealLeaderboardUpdate(lb);
      }
    };
    window.addEventListener('message', handleAttemptsMsg);
    window.addEventListener('ca_set_mock_attempts', handleCustomAttempts);
    window.addEventListener('ca_real_leaderboard', handleCustomLeaderboard);
    return () => {
      window.removeEventListener('message', handleAttemptsMsg);
      window.removeEventListener('ca_set_mock_attempts', handleCustomAttempts);
      window.removeEventListener('ca_real_leaderboard', handleCustomLeaderboard);
    };
  }, [storageKey, cfg.month, cfg.year]);


  // In-progress test session persistence key
  const inProgressKey = `ca_mock_inprogress_${cfg.month || 'default'}_${cfg.year || ''}`;
  const [inProgressMap, setInProgressMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(inProgressKey)) || {};
    } catch(e) {
      return {};
    }
  });

  // Refresh in-progress map & leaderboards whenever user returns to select screen
  useEffect(() => {
    if (screen === 'select') {
      try {
        setInProgressMap(JSON.parse(localStorage.getItem(inProgressKey)) || {});
      } catch(e) {}
      if (typeof window !== 'undefined' && window.syncAllSupabaseLeaderboards) {
        window.syncAllSupabaseLeaderboards();
      }
    }
  }, [screen, inProgressKey]);

  const monthly = useMemo(() => buildMonthly(questions, mc), [questions]);
  const topic   = useMemo(() => buildTopic(questions, cats, mc), [questions, cats]);

  // 📢 Broadcast Complete Tests Count & Metadata to Parent GyanLayer App / Course Dashboard
  useEffect(() => {
    try {
      const testsMeta = {
        month: cfg.month || 'January',
        year: cfg.year || (new Date().getFullYear()),
        totalQuestions: questions.length,
        monthlyTestsCount: monthly.length,
        topicTestsCount: topic.length,
        totalTestsCount: monthly.length + topic.length,
        monthlyTests: monthly.map(t => ({ id: t.id, name: t.name, questionsCount: t.qs.length, mins: t.mins, mark: t.mark, neg: t.neg })),
        topicTests: topic.map(t => ({ id: t.id, name: t.name, questionsCount: t.qs.length, mins: t.mins, mark: t.mark, neg: t.neg }))
      };
      window.caTestsMetadata = testsMeta;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'SET_MODULE_TESTS_METADATA',
          payload: testsMeta
        }, '*');
      }
    } catch(e) {
      console.warn('[MockTest] Broadcast tests meta failed:', e);
    }
  }, [monthly, topic]);

  const start  = t  => { setSelTest(t); setScreen('inst'); };
  const begin  = () => setScreen('live');
  
  const resume = t => {
    setSelTest(t);
    setScreen('live');
  };

  const startFresh = t => {
    try {
      const all = JSON.parse(localStorage.getItem(inProgressKey)) || {};
      delete all[t.id];
      localStorage.setItem(inProgressKey, JSON.stringify(all));
      setInProgressMap(all);
    } catch(e) {}
    setSelTest(t);
    setKey(k=>k+1);
    setScreen('inst');
  };

  const finish = r  => { 
    const rawPrevList = (attempts && (attempts[r.test.id] || attempts[r.test.id.replace('_', '-')] || attempts[r.test.id.replace('-', '_')])) || [];
    const prevList = deduplicateAttemptList(rawPrevList);
    const isFirstAttempt = prevList.length === 0;
    const attemptNumber = prevList.length + 1;

    // 🎯 Testbook Authentic Attempt Rank Calculation
    const allScores = [...prevList.map(a => Number(a.score || 0)), Number(r.score || 0)];
    const myScore = Number(r.score || 0);
    const computedLocalRank = allScores.filter(s => s > myScore).length + 1;
    const totalAttemptsCount = allScores.length;

    // Check if we already have real leaderboard information cached for this test
    const existingLb = (leaderboardMap && (
      leaderboardMap[r.test.id] || 
      leaderboardMap[r.test.id.replace('_', '-')] || 
      leaderboardMap[r.test.id.replace('-', '_')] ||
      (Object.keys(leaderboardMap).find(k => k.endsWith(r.test.id) || r.test.id.endsWith(k)) ? leaderboardMap[Object.keys(leaderboardMap).find(k => k.endsWith(r.test.id) || r.test.id.endsWith(k))] : null)
    )) || null;

    let initialUserRank = computedLocalRank;
    let initialTotalParticipants = totalAttemptsCount;

    if (existingLb) {
      if (existingLb.topRankers && Array.isArray(existingLb.topRankers) && existingLb.topRankers.length > 0) {
        const higherScorers = existingLb.topRankers.filter(rk => Number(rk.score || 0) > myScore).length;
        initialUserRank = higherScorers + 1;
        initialTotalParticipants = Math.max(Number(existingLb.totalParticipants) || existingLb.topRankers.length, initialUserRank);
      } else if (existingLb.totalParticipants) {
        initialTotalParticipants = Math.max(Number(existingLb.totalParticipants), initialUserRank);
      }
    }

    const resultWithTime = { 
      ...r, 
      test: {
        id: r.test.id,
        name: r.test.name,
        type: r.test.type,
        mins: r.test.mins,
        mark: r.test.mark,
        neg: r.test.neg,
        qs: r.test.qs
      },
      timestamp: Date.now(),
      isOfficial: isFirstAttempt,
      attemptNumber: attemptNumber,
      attempt_number: attemptNumber,
      userRank: initialUserRank,
      totalParticipants: initialTotalParticipants
    };
    if (window.dispatchMockTestResult) {
      window.dispatchMockTestResult(resultWithTime);
    }
    if (window.parent && window.parent !== window) {
      try {
        const testMonth = (window.caConfig && window.caConfig.month) || 'January';
        const testYear = (window.caConfig && window.caConfig.year) || '2026';
        const rawTid = r.test.id;
        const resolvedTestId = (rawTid.includes('_mt_') || rawTid.includes('_tp_'))
          ? rawTid
          : `${testMonth.toLowerCase().replace(/\s+/g, '_')}_${testYear}_${rawTid}`;
        window.parent.postMessage({
          type: 'REQUEST_LEADERBOARD',
          payload: {
            test_id: resolvedTestId,
            raw_test_id: rawTid,
            month: testMonth,
            year: testYear
          }
        }, '*');
      } catch(e) {}
    }
    setAttempts(prev => {
      const rawList = prev[r.test.id] ? [...prev[r.test.id]] : [];
      const list = deduplicateAttemptList([...rawList, resultWithTime]);
      const next = { ...prev, [r.test.id]: list };
      if (r.test.id.includes('_')) {
        next[r.test.id.replace('_', '-')] = list;
      }
      // Lightweight, quota-safe serialization for mobile Webviews & Android Apps (strips bulky questions array)
      const cleanNext = {};
      Object.keys(next).forEach(tid => {
        cleanNext[tid] = next[tid].map(att => ({
          testId: (att.test && att.test.id) || att.testId || tid,
          testName: (att.test && att.test.name) || att.testName || 'Mock Test',
          testType: (att.test && att.test.type) || att.testType || 'monthly',
          mins: (att.test && att.test.mins) || att.mins || 15,
          mark: (att.test && att.test.mark) || att.mark || 1,
          neg: (att.test && att.test.neg) || att.neg || 0.33,
          score: Number(att.score),
          max: Number(att.max),
          acc: Number(att.acc),
          taken: Number(att.taken),
          correct: att.correct !== undefined ? att.correct : att.cor,
          wrong: att.wrong,
          skip: att.skip !== undefined ? att.skip : att.skp,
          answers: att.answers || {},
          times: att.times || (att.qTimes ? att.qTimes : {}),
          qTimes: att.qTimes || [],
          timestamp: att.timestamp || Date.now(),
          isOfficial: att.isOfficial,
          attemptNumber: att.attemptNumber,
          userRank: att.userRank || initialUserRank,
          totalParticipants: att.totalParticipants || initialTotalParticipants
        }));
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify(cleanNext));
        if (cfg.month) localStorage.setItem(`ca_mock_attempts_${cfg.month}`, JSON.stringify(cleanNext));
      } catch(e) {
        console.warn('[MockTest] LocalStorage save warning:', e);
      }
      setResult(list);
      return next;
    });
    setSelTest(r.test);
    setScreen('result'); 
  };

  const retry  = () => {
    if (!selTest) return;
    setKey(k=>k+1);
    setScreen('inst');
  };
  const back = () => { setSelTest(null); setResult(null); setScreen('select'); };

  const viewSolution = t => {
    setSelTest(t);
    const attList = (attempts && (
      attempts[t.id] ||
      attempts[t.id.replace('_', '-')] ||
      attempts[t.id.replace('-', '_')] ||
      (Object.keys(attempts).find(k => k.toLowerCase() === t.id.toLowerCase() || k.endsWith(t.id) || t.id.endsWith(k)) && attempts[Object.keys(attempts).find(k => k.toLowerCase() === t.id.toLowerCase() || k.endsWith(t.id) || t.id.endsWith(k))])
    )) || [];
    if (attList.length > 0) {
      const enrichedList = attList.map(att => ({
        ...att,
        test: (att.test && att.test.qs && att.test.qs.length > 0) ? att.test : t
      }));
      setResult(enrichedList);
    } else {
      setResult([{
        test: t,
        score: 0,
        max: t.qs.length * t.mark,
        acc: 0,
        taken: 0,
        answers: {},
        times: {},
        timestamp: Date.now(),
        isOfficial: true,
        attemptNumber: 1
      }]);
    }
    setScreen('solution');
  };

  const viewAnalysis = t => {
    setSelTest(t);
    const attList = (attempts && (
      attempts[t.id] ||
      attempts[t.id.replace('_', '-')] ||
      attempts[t.id.replace('-', '_')] ||
      (Object.keys(attempts).find(k => k.toLowerCase() === t.id.toLowerCase() || k.endsWith(t.id) || t.id.endsWith(k)) && attempts[Object.keys(attempts).find(k => k.toLowerCase() === t.id.toLowerCase() || k.endsWith(t.id) || t.id.endsWith(k))])
    )) || [];
    if (attList.length > 0) {
      const enrichedList = attList.map(att => ({
        ...att,
        test: (att.test && att.test.qs && att.test.qs.length > 0) ? att.test : t
      }));
      setResult(enrichedList);
      setScreen('result');
    } else {
      setResult([{
        test: t,
        score: 0,
        max: t.qs.length * t.mark,
        acc: 0,
        taken: 0,
        answers: {},
        times: {},
        timestamp: Date.now(),
        isOfficial: true,
        attemptNumber: 1
      }]);
      setScreen('result');
    }
  };

  const clearAllHistory = () => {
    try {
      localStorage.removeItem(storageKey);
      if (cfg.month) localStorage.removeItem(`ca_mock_attempts_${cfg.month}`);
      localStorage.removeItem(inProgressKey);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('ca_mock') || k.includes('mock_attempt') || k.startsWith('ca_mistake'))) {
          localStorage.removeItem(k);
        }
      }
      setAttempts({});
      setInProgressMap({});
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CLEAR_MOCK_ATTEMPTS', month: cfg.month, year: cfg.year }, '*');
      }
    } catch(e) {
      console.warn('[MockTest] Clear history warning:', e);
    }
  };

  useEffect(() => {
    window.clearMockHistory = clearAllHistory;
    return () => {
      delete window.clearMockHistory;
    };
  }, [storageKey, inProgressKey, cfg.month, cfg.year]);

  if (screen==='select')  return <TestSelector monthly={monthly} topic={topic} onStart={start} onResume={resume} onStartFresh={startFresh} inProgressMap={inProgressMap} attempts={attempts} leaderboardMap={leaderboardMap} onViewSolution={viewSolution} onViewAnalysis={viewAnalysis} dk={dk} wm={wm} />;
  if (screen==='inst')    return <Instructions test={selTest} onBegin={begin} onBack={back} dk={dk} wm={wm} />;
  if (screen==='live')    return <LiveTest key={selTest.id+'_'+key} test={selTest} dk={dk} wm={wm} onFinish={finish} onExit={back} addMistake={addMistake} />;
  if (screen==='result')  return <TestResult res={result} leaderboardMap={leaderboardMap} onSyncLeaderboard={handleRealLeaderboardUpdate} onRetry={retry} onBack={back} onViewSolution={viewSolution} dk={dk} wm={wm} />;
  if (screen==='solution') return <SolutionReview res={result} onBack={back} onViewAnalysis={(t) => { if(t) viewAnalysis(t); else setScreen('result'); }} onReattempt={(t) => { start(t || (result && result[0] && result[0].test)); }} dk={dk} wm={wm} />;
  return null;
};

if (typeof window !== 'undefined') {
  window.MockTest = MockTest;
}
