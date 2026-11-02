// ================================================================
//  CURRENT AFFAIRS TEMPLATE — bridge.js
//  ✅ EDIT THIS FILE FOR: Parent app messaging, iframe communication
//  ❌ DO NOT add UI or content logic here
// ================================================================

// SafeStorage Guard & Month-Namespaced Cache Engine
window.safeStorage = {
  getItem: function(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      if (!val) return fallback;
      return JSON.parse(val);
    } catch(e) {
      console.warn("Corrupted storage detected for key:", key, ". Auto-healing state...");
      try { localStorage.removeItem(key); } catch(err) {}
      return fallback;
    }
  },
  setItem: function(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch(e) {
      console.error("Failed to write to localStorage:", e);
    }
  }
};

// ⚡ Persistent Client User Identification (Guarantees unique ID across browsers/devices)
(function initPersistentUserId() {
  if (typeof window === 'undefined') return;
  try {
    let uid = window.caUserId || localStorage.getItem('ca_user_id') || localStorage.getItem('ca_client_uid');
    if (!uid) {
      uid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('ca_client_uid', uid);
    }
    window.caUserId = uid;
    const uEmail = window.caUserEmail || localStorage.getItem('ca_user_email');
    if (uEmail) window.caUserEmail = uEmail;
  } catch(e) {}
})();

// ⚡ Network-First Auto-Busting Cache-Storage ServiceWorker Engine
(function registerNetworkFirstServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const currentMonth = (window.caConfig && window.caConfig.month) ? window.caConfig.month : 'Master';
  const currentYear = (window.caConfig && window.caConfig.year) ? window.caConfig.year : new Date().getFullYear();
  const buildTimestamp = window.caBuildTimestamp || Date.now();
  const cacheName = `gyanlayer_cache_${currentMonth}_${currentYear}_v${buildTimestamp}`;

  const swCode = `
    const CACHE_NAME = '${cacheName}';
    self.addEventListener('install', (evt) => {
      self.skipWaiting();
    });
    self.addEventListener('activate', (evt) => {
      evt.waitUntil(
        caches.keys().then((keys) => {
          return Promise.all(
            keys.map((key) => {
              if (key !== CACHE_NAME && key.startsWith('gyanlayer_cache_')) {
                console.log('Purging old stale cache:', key);
                return caches.delete(key);
              }
            })
          );
        }).then(() => self.clients.claim())
      );
    });
    self.addEventListener('fetch', (evt) => {
      if (evt.request.method !== 'GET') return;
      evt.respondWith(
        fetch(evt.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => caches.match(evt.request))
      );
    });
  `;

  try {
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    navigator.serviceWorker.register(swUrl).catch(err => console.warn("SW registration bypassed:", err));
  } catch(e) {
    console.warn("SW init bypassed safely");
  }
})();

window.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  if (!type) return;

  switch (type) {
    case 'SET_THEME':
      // Parent app can set theme: 'light' | 'dark' | 'warm'
      if ((data && data.theme)) {
        document.documentElement.className = data.theme;
      }
      break;

    case 'PING':
      // Respond to parent app health check
      if (event.source) {
        event.source.postMessage({
          type: 'PONG',
          app: 'CurrentAffairs',
          month: (window.caConfig && window.caConfig.month),
          year: (window.caConfig && window.caConfig.year),
          status: 'ready'
        }, '*');
      }
      break;

    case 'GET_TESTS_INFO':
    case 'GET_INFO':
      // Parent app requests complete module info & mock tests breakdown
      if (event.source) {
        const meta = window.caTestsMetadata || {};
        event.source.postMessage({
          type: 'MODULE_INFO',
          data: {
            name: `${(window.caConfig && window.caConfig.month)} ${(window.caConfig && window.caConfig.year)} – Ultimate Current Affairs`,
            month: (window.caConfig && window.caConfig.month),
            year: (window.caConfig && window.caConfig.year),
            totalQuestions: (window.caConfig && window.caConfig.questions && window.caConfig.questions.length) || 0,
            monthlyTestsCount: meta.monthlyTestsCount || 0,
            topicTestsCount: meta.topicTestsCount || 0,
            totalTestsCount: meta.totalTestsCount || 0,
            monthlyTests: meta.monthlyTests || [],
            topicTests: meta.topicTests || [],
            categories: (window.caConfig && window.caConfig.categories && window.caConfig.categories.map(c => c.label)) || []
          }
        }, '*');
      }
      break;

    case 'SET_REAL_LEADERBOARD':
      // Parent App sends Real Supabase Leaderboard + Rank
      try {
        const lbData = event.data.payload || event.data.data || (data && (data.payload || data)) || event.data;
        window.dispatchEvent(new CustomEvent('ca_real_leaderboard', { detail: lbData }));
      } catch (e) {}
      break;

    case 'SET_USER_NAME':
    case 'SET_USER_INFO':
    case 'SET_USER':
      // Parent App passes user's actual profile name & ID
      try {
        const uPayload = event.data.payload || event.data.data || (data && (data.payload || data)) || event.data;
        if (uPayload) {
          if (typeof uPayload === 'object') {
            if (uPayload.name) {
              window.caUserName = uPayload.name;
              try { localStorage.setItem('ca_user_name', uPayload.name); } catch(e) {}
            }
            if (uPayload.userId || uPayload.id || uPayload.user_id) {
              window.caUserId = uPayload.userId || uPayload.id || uPayload.user_id;
              try { localStorage.setItem('ca_user_id', window.caUserId); } catch(e) {}
            }
            if (uPayload.email || uPayload.user_email) {
              window.caUserEmail = uPayload.email || uPayload.user_email;
              try { localStorage.setItem('ca_user_email', window.caUserEmail); } catch(e) {}
            }
            const foundAvatar = uPayload.avatar || uPayload.avatar_url || uPayload.photo || uPayload.picture || uPayload.image;
            if (foundAvatar) {
              window.caUserAvatar = foundAvatar;
              try { localStorage.setItem('ca_user_avatar', foundAvatar); } catch(e) {}
            }
          } else if (typeof uPayload === 'string') {
            window.caUserName = uPayload;
            try { localStorage.setItem('ca_user_name', uPayload); } catch(e) {}
          }
        }
        window.dispatchEvent(new CustomEvent('ca_set_user_name', { detail: uPayload }));
      } catch (e) {}
      break;

    case 'SET_AUDIO_BASE_URL':
      // Parent App or Admin Panel passes Remote Audio CDN URL
      try {
        const audioUrl = (event.data && (event.data.payload || event.data.data || event.data.url)) || (data && (data.url || data));
        if (audioUrl && typeof audioUrl === 'string' && window.caConfig) {
          window.caConfig.audioBaseUrl = audioUrl;
        }
      } catch (e) {}
      break;

    case 'SET_ATTEMPT_HISTORY':
    case 'SET_MOCK_ATTEMPTS':
    case 'SYNC_SUPABASE_ATTEMPTS':
      // Parent App passes lifetime test attempts from Supabase
      try {
        const attData = event.data.payload || event.data.data || (data && (data.payload || data)) || event.data;
        window.dispatchEvent(new CustomEvent('ca_set_mock_attempts', { detail: attData }));
      } catch (e) {}
      break;

    case 'SET_READ_CHECKPOINTS':
    case 'SET_READING_CHECKPOINTS':
    case 'SYNC_READ_CHECKPOINTS':
      // Parent App passes user's saved reading checkpoints
      try {
        const cpData = event.data.payload || event.data.data || (data && (data.payload || data)) || event.data;
        if (cpData && typeof cpData === 'object' && window.restoreReadingCheckpoints) {
          window.restoreReadingCheckpoints(cpData);
        }
      } catch (e) {
        console.warn('[Bridge] Error handling SET_READ_CHECKPOINTS:', e);
      }
      break;

    default:
      break;
  }
});

// ⚡ Helper to calculate full test metadata eagerly on 0ms load
function getOrCalculateTestsMeta() {
  if (window.caTestsMetadata && window.caTestsMetadata.totalTestsCount > 0) return window.caTestsMetadata;
  try {
    const cfg = window.caConfig || {};
    const qs = cfg.questions || [];
    const cats = cfg.categories || [];
    const mc = cfg.mockConfig || {};

    const tag = mc.monthlyExamTag || 'EXAM FOCUS';
    const per = mc.questionsPerSet || 25;
    const fil = qs.filter(q => q.examTag === tag);
    const monthlyCount = Math.floor(fil.length / per);

    const min = mc.minQuestionsForTopicTest || 5;
    const qps = mc.questionsPerSet || 25;
    let topicCount = 0;
    const smallCat = [];

    cats.filter(c => c.id !== 'all').forEach(cat => {
      const cqs = qs.filter(q => q.category === cat.id);
      const total = cqs.length;
      if (total < min) {
        if (total > 0) smallCat.push(...cqs);
        return;
      }
      if (total <= 30) {
        topicCount += 1;
      } else if (total <= 50) {
        topicCount += 2;
      } else {
        topicCount += Math.ceil(total / qps);
      }
    });
    if (smallCat.length > 0) topicCount += 1;

    const meta = {
      month: cfg.month || 'January',
      year: cfg.year || (new Date().getFullYear()),
      totalQuestions: qs.length,
      monthlyTestsCount: monthlyCount,
      topicTestsCount: topicCount,
      totalTestsCount: monthlyCount + topicCount
    };
    window.caTestsMetadata = meta;
    return meta;
  } catch(e) {
    return null;
  }
}

// ⚡ Auto-Handshake with Parent App on Load (Requests User Profile & Supabase Attempts)
(function initParentHandshake() {
  const sendHandshake = () => {
    try {
      if (window.parent && window.parent !== window) {
        const testsMeta = getOrCalculateTestsMeta();
        if (testsMeta) {
          window.parent.postMessage({
            type: 'SET_MODULE_TESTS_METADATA',
            payload: testsMeta
          }, '*');
          window.parent.postMessage({
            type: 'MODULE_INFO',
            data: testsMeta
          }, '*');
        }

        window.parent.postMessage({
          type: 'REQUEST_USER_PROFILE',
          payload: {
            app: 'CurrentAffairs',
            month: (window.caConfig && window.caConfig.month) || 'January',
            year: (window.caConfig && window.caConfig.year) || new Date().getFullYear()
          }
        }, '*');
        window.parent.postMessage({
          type: 'REQUEST_ATTEMPT_HISTORY',
          payload: {
            app: 'CurrentAffairs',
            month: (window.caConfig && window.caConfig.month) || 'January',
            year: (window.caConfig && window.caConfig.year) || new Date().getFullYear()
          }
        }, '*');
        window.parent.postMessage({
          type: 'REQUEST_READ_CHECKPOINTS',
          month: (window.caConfig && window.caConfig.month) || 'January',
          year: (window.caConfig && window.caConfig.year) || new Date().getFullYear(),
          payload: {
            app: 'CurrentAffairs',
            month: (window.caConfig && window.caConfig.month) || 'January',
            year: (window.caConfig && window.caConfig.year) || new Date().getFullYear()
          }
        }, '*');
      }
    } catch (e) {
      console.warn('[Bridge] Handshake init bypassed:', e);
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    sendHandshake();
  } else {
    window.addEventListener('DOMContentLoaded', sendHandshake);
  }
  // Repeat after short intervals to ensure parent iframe listener has fully mounted
  setTimeout(sendHandshake, 500);
  setTimeout(sendHandshake, 1500);
})();

// Dispatch Reading Checkpoint to parent GyanLayer app
window.dispatchReadingCheckpointEvent = (category, item, isClear = false, allCheckpoints = null) => {
  try {
    const month = (window.caConfig && window.caConfig.month) || 'January';
    const year = (window.caConfig && window.caConfig.year) || new Date().getFullYear();
    const checkpointsMap = allCheckpoints || (window.getAllReadingCheckpoints ? window.getAllReadingCheckpoints() : {});

    const message = {
      type: 'SAVE_READ_CHECKPOINT',
      month: month,
      year: year,
      category: category || 'all',
      isClear: isClear,
      checkpoint: item ? {
        id: item.id,
        bookQNum: item.bookQNum || null,
        question: item.question,
        category: item.category,
        timestamp: Date.now()
      } : null,
      allCheckpoints: checkpointsMap,
      payload: {
        month: month,
        year: year,
        category: category || 'all',
        isClear: isClear,
        allCheckpoints: checkpointsMap
      }
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  } catch (e) {
    console.warn('[Bridge] Reading checkpoint dispatch failed:', e);
  }
};

// Dispatch bookmark to parent GyanLayer app
window.dispatchBookmarkEvent = (item, isBookmarked = true) => {
  try {
    const payload = {
      type: isBookmarked ? 'SAVE_BOOKMARK' : 'REMOVE_BOOKMARK',
      payload: { // 🔴 MUST BE payload, not data, as per GyanLayer spec
        reference_id: `ca_${(window.caConfig && window.caConfig.month)}_${item.id}`,
        title: item.question,
        category: 'Current Affairs',
        topic: `${(window.caConfig && window.caConfig.month)} ${(window.caConfig && window.caConfig.year)}`,
        question_text: item.question,
        correct_answer: item.answer,
        explanation: item.memoryTrick || ''
      }
    };
    if (window.parent !== window) {
      window.parent.postMessage(payload, '*');
    } else {
      console.log(`[Bridge] Standalone mode. ${payload.type}:`, payload);
    }
  } catch (e) {
    console.error('[Bridge] Bookmark dispatch failed:', e);
  }
};

// Dispatch Mock Test Result to parent Revision Engine & Supabase Leaderboard
window.dispatchMockTestResult = (result) => {
  try {
    const isOfficial = result.isOfficial !== false && (result.attemptNumber === 1 || !result.attemptNumber);
    // Bulletproof time calculation: if taken is missing or 0, fallback to sum of per-question times
    const rawTaken = Number(result.taken !== undefined && !isNaN(result.taken) ? result.taken : (result.time_taken || 0));
    const sumQTimes = Array.isArray(result.qTimes) ? result.qTimes.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
    const finalTimeTaken = rawTaken > 0 ? rawTaken : (sumQTimes > 0 ? sumQTimes : 1);

    // 🔴 EXACT structure required by GyanLayer: { type: 'TEST_COMPLETED', score, total, is_official }
    const payload = {
      type: 'TEST_COMPLETED',
      score: result.score,
      total: result.max,
      accuracy: result.acc,
      time_taken: finalTimeTaken,
      timeTaken: finalTimeTaken,
      is_official: isOfficial,
      attempt_number: result.attemptNumber || 1,
      // Extra rich telemetry for Supabase Real-Time Leaderboard & Lifetime History
      extra: {
        test_id: result.test.id,
        test_name: result.test.name,
        correct: result.cor !== undefined ? result.cor : result.correct,
        wrong: result.wrong,
        skip: result.skp !== undefined ? result.skp : result.skip,
        accuracy: result.acc,
        time_taken: finalTimeTaken,
        timeTaken: finalTimeTaken,
        is_official: isOfficial,
        attempt_number: result.attemptNumber || 1,
        user_id: window.caUserId || null,
        user_name: window.caUserName || (window.caConfig && window.caConfig.userName) || 'Aspirant',
        user_email: window.caUserEmail || (window.caConfig && (window.caConfig.userEmail || window.caConfig.email)) || null,
        avatar_url: window.caUserAvatar || (window.caConfig && window.caConfig.userAvatar) || (typeof localStorage !== 'undefined' ? localStorage.getItem('ca_user_avatar') : null) || null,
        month: (window.caConfig && window.caConfig.month),
        year: (window.caConfig && window.caConfig.year),
        timestamp: result.timestamp,
        answers: result.answers || {},
        times: result.qTimes || result.times || {},
        qTimes: result.qTimes || []
      }
    };
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, '*');
    } else {
      console.log('[Bridge] Standalone mode. TEST_COMPLETED:', payload);
    }
    // Also dispatch custom DOM event for hybrid app webviews
    window.dispatchEvent(new CustomEvent('ca_mock_test_finished', { detail: payload }));
  } catch(e) {
    console.error('[Bridge] Mock Test Result dispatch failed:', e);
  }
};

// ════════════════════════════════════════════════════════
//  ⚡ DIRECT SUPABASE LEADERBOARD & ATTEMPT SYNC ENGINE
//  Pulls live multi-user submissions directly from Supabase REST API
//  Calculates official All-India Rankings, Topper & Peer statistics
// ════════════════════════════════════════════════════════
window.isSyncingSupabaseLeaderboards = false;

window.syncAllSupabaseLeaderboards = function() {
  if (typeof window === 'undefined') return;
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey) return;
  if (window.isSyncingSupabaseLeaderboards) return;

  window.isSyncingSupabaseLeaderboards = true;
  const currentMonth = (window.caConfig && window.caConfig.month) || 'January';
  const currentYear = (window.caConfig && window.caConfig.year) || new Date().getFullYear();
  const endpoint = cfg.url + '/rest/v1/mock_test_submissions?select=*&order=score.desc,time_taken.asc';

  fetch(endpoint, {
    method: 'GET',
    headers: {
      'apikey': cfg.anonKey,
      'Authorization': 'Bearer ' + cfg.anonKey
    }
  })
  .then(function(res) {
    if (!res.ok) {
      console.warn('[Bridge] Supabase leaderboard sync HTTP status:', res.status);
      window.isSyncingSupabaseLeaderboards = false;
      return null;
    }
    return res.json();
  })
  .then(function(allSubmissions) {
    if (!Array.isArray(allSubmissions) || allSubmissions.length === 0) {
      window.isSyncingSupabaseLeaderboards = false;
      return;
    }

    const monthKey = currentMonth.toLowerCase().trim();
    const yearKey = String(currentYear).trim();

    const testGroups = {};
    const myUserSubmissions = [];

    allSubmissions.forEach(function(sub) {
      const tid = sub.test_id || sub.raw_test_id;
      if (!tid) return;

      if (sub.month && sub.month.toLowerCase().trim() !== monthKey) return;
      if (sub.year && String(sub.year).trim() !== yearKey) return;

      if (!testGroups[tid]) testGroups[tid] = [];
      testGroups[tid].push(sub);

      if (window.caUserId && sub.user_id && String(sub.user_id) === String(window.caUserId)) {
        myUserSubmissions.push(sub);
        if (sub.avatar_url && !window.caUserAvatar) {
          window.caUserAvatar = sub.avatar_url;
          try { localStorage.setItem('ca_user_avatar', sub.avatar_url); } catch(e) {}
        }
      } else if (window.caUserEmail && sub.email && String(sub.email).toLowerCase().trim() === String(window.caUserEmail).toLowerCase().trim()) {
        myUserSubmissions.push(sub);
        if (sub.avatar_url && !window.caUserAvatar) {
          window.caUserAvatar = sub.avatar_url;
          try { localStorage.setItem('ca_user_avatar', sub.avatar_url); } catch(e) {}
        }
      }
    });

    if (myUserSubmissions.length > 0) {
      try {
        window.dispatchEvent(new CustomEvent('ca_set_mock_attempts', { detail: myUserSubmissions }));
      } catch(e) {}
    }

    let cachedLbMap = {};
    try {
      const stored = localStorage.getItem('ca_real_leaderboards');
      if (stored) cachedLbMap = JSON.parse(stored);
    } catch(e) {}

    Object.keys(testGroups).forEach(function(tid) {
      const subs = testGroups[tid];
      const userMap = {};

      subs.forEach(function(s) {
        // Group candidate submissions by unique student identity:
        // Prioritize: user_id > email > submission id > unique timestamp
        // ⚠️ CRITICAL: NEVER group by user_name alone! Multiple students can share identical names.
        const ukey = (s.user_id && String(s.user_id).trim()) ||
                     (s.email && String(s.email).toLowerCase().trim()) ||
                     (s.id && String(s.id)) ||
                     (s.created_at ? 'ts_' + s.created_at : Math.random().toString());

        if (!userMap[ukey]) {
          userMap[ukey] = s;
        } else {
          const prev = userMap[ukey];
          if (s.is_official && !prev.is_official) {
            userMap[ukey] = s;
          } else if (Number(s.score) > Number(prev.score)) {
            userMap[ukey] = s;
          } else if (Number(s.score) === Number(prev.score) && Number(s.time_taken) < Number(prev.time_taken)) {
            userMap[ukey] = s;
          }
        }
      });

      const uniqueList = Object.values(userMap);
      uniqueList.sort(function(a, b) {
        const sa = Number(a.score || 0);
        const sb = Number(b.score || 0);
        if (sb !== sa) return sb - sa;
        const ta = Number(a.time_taken || 0);
        const tb = Number(b.time_taken || 0);
        return ta - tb;
      });

      let curRank = 1;
      uniqueList.forEach(function(s, idx) {
        if (idx > 0) {
          const prev = uniqueList[idx - 1];
          const isTie = Number(s.score) === Number(prev.score) && Number(s.time_taken) === Number(prev.time_taken);
          if (!isTie) {
            curRank = idx + 1;
          }
        }
        s.rank = curRank;
      });

      const totalParticipants = uniqueList.length;
      const topRankers = uniqueList.map(function(s) {
        return {
          rank: s.rank,
          name: s.user_name || 'Aspirant',
          score: Number(s.score),
          time: Number(s.time_taken || 0),
          accuracy: Number(s.accuracy || 0),
          avatar: s.avatar_url || '👨‍🎓',
          userId: s.user_id || s.id || null,
          id: s.id || null,
          email: s.email || s.user_email || null,
          timestamp: s.created_at ? new Date(s.created_at).getTime() : null,
          isOfficial: s.is_official !== false
        };
      });

      const topper = topRankers[0] || null;
      const avgScore = totalParticipants > 0 ? Number((uniqueList.reduce(function(acc, x) { return acc + Number(x.score || 0); }, 0) / totalParticipants).toFixed(2)) : 0;
      const avgTime = totalParticipants > 0 ? Math.round(uniqueList.reduce(function(acc, x) { return acc + Number(x.time_taken || 0); }, 0) / totalParticipants) : 0;
      const avgAccuracy = totalParticipants > 0 ? Math.round(uniqueList.reduce(function(acc, x) { return acc + Number(x.accuracy || 0); }, 0) / totalParticipants) : 0;

      let normId = tid;
      if (normId.startsWith(monthKey + '_' + yearKey + '_')) {
        normId = normId.substring((monthKey + '_' + yearKey + '_').length);
      } else if (normId.match(/^[a-z]+_\d{4}_/i)) {
        normId = normId.replace(/^[a-z]+_\d{4}_/i, '');
      }

      let resolvedUserRank = null;
      if (window.caUserId || window.caUserEmail) {
        const foundMe = topRankers.find(function(r) {
          if (window.caUserId && r.userId && String(r.userId) === String(window.caUserId)) return true;
          if (window.caUserEmail && r.email && String(r.email).toLowerCase().trim() === String(window.caUserEmail).toLowerCase().trim()) return true;
          return false;
        });
        if (foundMe) {
          resolvedUserRank = foundMe.rank;
          foundMe.isCurrentUser = true;
        }
      }

      const lbPayload = {
        test_id: tid,
        raw_test_id: normId,
        totalParticipants: totalParticipants,
        total: totalParticipants,
        userRank: resolvedUserRank,
        rank: resolvedUserRank,
        topRankers: topRankers,
        topper: topper,
        avgScore: avgScore,
        avgTime: avgTime,
        avgAccuracy: avgAccuracy
      };

      cachedLbMap[tid] = lbPayload;
      cachedLbMap[normId] = lbPayload;
      if (tid.includes('_')) {
        const simpleKey = tid.split('_').slice(-2).join('_');
        cachedLbMap[simpleKey] = lbPayload;
      }

      window.dispatchEvent(new CustomEvent('ca_real_leaderboard', { detail: lbPayload }));
      if (normId !== tid) {
        window.dispatchEvent(new CustomEvent('ca_real_leaderboard', { detail: Object.assign({}, lbPayload, { test_id: normId }) }));
      }
    });

    try {
      localStorage.setItem('ca_real_leaderboards', JSON.stringify(cachedLbMap));
    } catch(e) {}

    console.log('[Bridge] Supabase leaderboards synced successfully (' + Object.keys(testGroups).length + ' tests, ' + allSubmissions.length + ' submissions).');
  })
  .catch(function(err) {
    console.warn('[Bridge] Error during Supabase leaderboard sync:', err);
  })
  .finally(function() {
    window.isSyncingSupabaseLeaderboards = false;
  });
};

// Auto-trigger sync on load, on focus, and after test submission
(function initSupabaseLeaderboardSync() {
  if (typeof window === 'undefined') return;
  const triggerSync = () => {
    if (window.syncAllSupabaseLeaderboards) {
      window.syncAllSupabaseLeaderboards();
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(triggerSync, 100);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(triggerSync, 100));
  }
  // Also sync after short intervals to ensure network and configs are hot
  setTimeout(triggerSync, 800);
  setTimeout(triggerSync, 2500);

  // Sync when window gains focus (student switching between tabs)
  window.addEventListener('focus', () => {
    triggerSync();
  });

  // Re-sync after mock test completes
  window.addEventListener('ca_mock_test_finished', () => {
    setTimeout(triggerSync, 1500);
    setTimeout(triggerSync, 3500);
  });
})();

// ════════════════════════════════════════════════════════
//  🎙️ Dual-Engine Neural Voiceover & Speech Synthesizer
//  Priority 1: Pre-Generated Madhur Neural MP3 (0ms Ultra-Quality)
//  Priority 2: Native Web Speech API Fallback
//  STRICT CONSTRAINT: Manual Click-Only (Zero Auto-Play)
// ════════════════════════════════════════════════════════
window.caCurrentSpeakingId = null;
window.caCurrentAudioObj = null;
window.caAudioAbortFlag = false;

window.caStopSpeech = function() {
  if (typeof window !== 'undefined') {
    window.caAudioAbortFlag = true;
    const prevId = window.caCurrentSpeakingId;
    if (window.caCurrentAudioObj) {
      try {
        window.caCurrentAudioObj.pause();
        window.caCurrentAudioObj.currentTime = 0;
        window.caCurrentAudioObj.src = "";
      } catch(e) {}
      window.caCurrentAudioObj = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch(e) {}
    }
    window.caCurrentSpeakingId = null;
    try {
      window.dispatchEvent(new CustomEvent('ca-speech-stopped', { detail: { stoppedId: prevId } }));
    } catch(e) {}
  }
};

window.caToggleAudio = function(id, onEndCallback, onStartCallback) {
  if (window.caCurrentSpeakingId === id || (window.caCurrentAudioObj && !window.caCurrentAudioObj.paused)) {
    window.caStopSpeech();
    return false;
  }
  window.caSpeak("", id, onEndCallback, onStartCallback);
  return true;
};

window.caSpeak = function(textOrQ, id, onEndCallback, onStartCallback) {
  // If a manual single-card audio click happened while podcast was active (and not called from podcast itself)
  const isPodcastCaller = typeof id === 'string' && id.startsWith('podcast-');
  if (!isPodcastCaller && window.caPodcastController && window.caPodcastController.isActive && window.caPodcastController.isPlaying) {
    window.caPodcastController.pause();
  }

  // Stop any active single-card audio
  window.caStopSpeech();
  window.caAudioAbortFlag = false;

  // Resolve question object and question number
  let qNum = null;
  let qObj = null;

  if (typeof textOrQ === 'object' && textOrQ !== null) {
    qObj = textOrQ;
    qNum = String(qObj.id);
  } else if (typeof id === 'object' && id !== null) {
    qObj = id;
    qNum = String(qObj.id);
  } else if (typeof id === 'string') {
    const m = id.match(/\d+/);
    if (m) qNum = m[0];
  } else if (typeof id === 'number') {
    qNum = String(id);
  }

  if (!qObj && qNum && window.caConfig && window.caConfig.questions) {
    qObj = window.caConfig.questions.find(q => String(q.id) === String(qNum));
  }

  const speakingTagId = (typeof id === 'string' || typeof id === 'number') ? id : (qNum ? `card-${qNum}` : 'ca-speech');

  // Play pre-generated natural Madhur Neural MP3 files
  if (qNum) {
    const isStudio = !!(window.caConfig && window.caConfig.isYouTubeStudio);
    const customBase = (window.caConfig && window.caConfig.audioBaseUrl) ? window.caConfig.audioBaseUrl.replace(/\/+$/, '') : '';

    const candidatePaths = [
      (customBase && (!window.location || window.location.protocol !== 'file:')) ? `${customBase}/q_${qNum}.mp3` : null,
      isStudio ? `audio_youtube/q_${qNum}.mp3` : `audio/q_${qNum}.mp3`,
      isStudio ? `./audio_youtube/q_${qNum}.mp3` : `./audio/q_${qNum}.mp3`,
      isStudio ? `../audio_youtube/q_${qNum}.mp3` : `../audio/q_${qNum}.mp3`,
      `${(window.caConfig && window.caConfig.month) || 'February'}_Current_Affairs_${(window.caConfig && window.caConfig.year) || '2026'}_onelinear/audio/q_${qNum}.mp3`,
      `Website_Apps_HTML/audio/q_${qNum}.mp3`,
      `audio/q_${qNum}.mp3`,
      `audio_youtube/q_${qNum}.mp3`,
      (customBase && window.location && window.location.protocol === 'file:') ? `${customBase}/q_${qNum}.mp3` : null
    ].filter(Boolean);

    let pathIdx = 0;
    const tryNextAudio = () => {
      if (window.caAudioAbortFlag) return;
      if (pathIdx >= candidatePaths.length) {
        window.caCurrentAudioObj = null;
        window.caCurrentSpeakingId = null;
        try { window.dispatchEvent(new CustomEvent('ca-speech-stopped', { detail: { stoppedId: speakingTagId } })); } catch(e) {}
        if (onEndCallback) onEndCallback();
        return;
      }
      const p = candidatePaths[pathIdx++];
      try {
        if (window.caAudioAbortFlag) return;
        if (!window.caSharedAudio) {
          window.caSharedAudio = new Audio();
        }
        const audio = window.caSharedAudio;
        window.caCurrentAudioObj = audio;
        window.caCurrentSpeakingId = speakingTagId;

        audio.onplay = () => {
          if (window.caAudioAbortFlag) {
            try { audio.pause(); audio.currentTime = 0; } catch(e) {}
            return;
          }
          if (onStartCallback) onStartCallback();
          try { window.dispatchEvent(new CustomEvent('ca-speech-started', { detail: { id: speakingTagId } })); } catch(e) {}
        };

        audio.onended = () => {
          window.caCurrentSpeakingId = null;
          window.caCurrentAudioObj = null;
          try { window.dispatchEvent(new CustomEvent('ca-speech-stopped', { detail: { stoppedId: speakingTagId } })); } catch(e) {}
          if (onEndCallback) onEndCallback();
        };

        audio.onerror = () => {
          if (!window.caAudioAbortFlag) tryNextAudio();
        };

        const savedSpeed = (window.caPodcastController && window.caPodcastController.speed) || parseFloat(localStorage.getItem('ca_podcast_speed')) || 1.0;
        try {
          audio.defaultPlaybackRate = savedSpeed;
          audio.playbackRate = savedSpeed;
        } catch(e) {}

        audio.onloadedmetadata = () => {
          try {
            audio.defaultPlaybackRate = savedSpeed;
            audio.playbackRate = savedSpeed;
          } catch(e) {}
        };

        audio.pause();
        audio.preload = 'auto';
        audio.src = p;
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            try {
              audio.defaultPlaybackRate = savedSpeed;
              audio.playbackRate = savedSpeed;
            } catch(e) {}
          }).catch(() => {
            if (!window.caAudioAbortFlag) tryNextAudio();
          });
        }
      } catch(e) {
        if (!window.caAudioAbortFlag) tryNextAudio();
      }
    };

    tryNextAudio();
    return true;
  }

  if (onEndCallback) onEndCallback();
  return false;
};

// ════════════════════════════════════════════════════════
//  🎧 Continuous Hands-Free Podcast Controller Engine
//  ✅ Sequential Audio Playback with 1.2s Natural Pause
//  ✅ MediaSession Lockscreen & Bluetooth Earphone Integration
//  ✅ Smart Card Auto-Scroll & Visual Highlighter
//  ✅ Speed Controller (1.0x, 1.25x, 1.5x)
// ════════════════════════════════════════════════════════
window.caPodcastController = {
  isActive: false,
  playlist: [],
  currentIndex: 0,
  speed: (typeof window !== 'undefined' && window.caConfig && window.caConfig.isYouTubeStudio) ? 1.0 : 1.25,
  isPlaying: false,
  scopeTitle: '',
  audioObj: null,
  pauseTimer: null,
  listeners: [],
  activePartIndex: 0,
  wakeLock: null,

  requestWakeLock: function() {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !this.wakeLock) {
        navigator.wakeLock.request('screen').then(lock => {
          this.wakeLock = lock;
        }).catch(() => {});
      }
    } catch(e) {}
  },

  releaseWakeLock: function() {
    try {
      if (this.wakeLock) {
        this.wakeLock.release();
        this.wakeLock = null;
      }
    } catch(e) {}
  },

  subscribe: function(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  },

  notify: function() {
    const state = this.getState();
    this.listeners.forEach(cb => {
      try { cb(state); } catch(e) {}
    });
  },

  getParts: function() {
    return (window.caConfig && window.caConfig.youtubeAudioParts) ? window.caConfig.youtubeAudioParts : [];
  },

  getCurrentPart: function() {
    const parts = this.getParts();
    if (!parts || !parts.length) return null;
    return parts[this.activePartIndex] || parts[0];
  },

  getState: function() {
    const currentPart = this.getCurrentPart();
    return {
      isActive: this.isActive,
      currentIndex: this.currentIndex,
      currentQ: this.playlist[this.currentIndex] || null,
      totalCount: this.playlist.length,
      isPlaying: this.isPlaying,
      speed: this.speed,
      scopeTitle: this.scopeTitle,
      activePartIndex: this.activePartIndex,
      activePart: currentPart,
      allParts: this.getParts()
    };
  },

  start: function(playlist, startIndex, speed, scopeTitle, targetPartIndex) {
    if (!playlist || playlist.length === 0) return;
    this.stop(); // Stop any existing audio/podcast

    this.isActive = true;
    this.playlist = playlist;
    const defaultSpeed = (window.caConfig && window.caConfig.isYouTubeStudio) ? 1.0 : 1.25;
    this.speed = (typeof speed === 'number' && speed > 0) ? speed : defaultSpeed;
    this.scopeTitle = scopeTitle || 'पॉडकास्ट';

    const parts = this.getParts();
    const reqIndex = Math.max(0, Math.min(startIndex || 0, playlist.length - 1));
    const targetQNum = reqIndex + 1;
    const isFilteredCategory = this.playlist && window.caConfig && window.caConfig.questions && (this.playlist.length < window.caConfig.questions.length);

    if (parts && parts.length > 0 && !isFilteredCategory) {
      if (typeof targetPartIndex === 'number' && targetPartIndex >= 0 && targetPartIndex < parts.length) {
        this.activePartIndex = targetPartIndex;
        this.currentIndex = parts[targetPartIndex].startQ - 1;
      } else {
        // Find which part contains targetQNum
        let foundP = parts.findIndex(p => targetQNum >= p.startQ && targetQNum <= p.endQ);
        this.activePartIndex = foundP !== -1 ? foundP : 0;
        this.currentIndex = reqIndex;
      }
    } else {
      this.currentIndex = reqIndex;
    }

    this.isPlaying = true;
    this.requestWakeLock();
    this.playCurrent();
    this.setupMediaSession();
    this.notify();
  },

  setPart: function(partNum, shouldAutoPlay = false) {
    const parts = this.getParts();
    if (!parts || !parts.length) return;
    const pIdx = Math.max(0, Math.min(partNum - 1, parts.length - 1));
    this.activePartIndex = pIdx;
    this.currentIndex = parts[pIdx].startQ - 1;
    if (!this.playlist || this.playlist.length === 0) {
      this.playlist = (window.caConfig && window.caConfig.questions) || [];
    }
    this.isActive = true;
    if (this.audioObj) {
      try { this.audioObj.pause(); } catch(e) {}
      this.audioObj = null;
    }
    window.caStopSpeech();
    
    if (shouldAutoPlay) {
      this.isPlaying = true;
      this.requestWakeLock();
      this.playCurrent();
      this.setupMediaSession();
    } else {
      this.isPlaying = false;
    }
    this.notify();
  },

  playCurrent: function() {
    if (!this.isActive) return;
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }

    const currentQ = this.playlist[this.currentIndex];
    if (!currentQ) {
      this.stop();
      return;
    }

    // Stop single card speech if any
    window.caStopSpeech();

    const parts = this.getParts();
    const isYouTubeStudio = !!(window.caConfig && window.caConfig.isYouTubeStudio);
    const isFilteredCategory = this.playlist && window.caConfig && window.caConfig.questions && (this.playlist.length < window.caConfig.questions.length);

    // 🎙️ BRANCH A: Multi-Part Continuous Audio Sync Mode (YouTube Studio Edition for Full 156 Qs)
    if (isYouTubeStudio && parts && parts.length > 0 && !isFilteredCategory) {
      const currentPart = this.getCurrentPart();
      if (!currentPart) return;

      const expectedAudioFile = currentPart.file || `custom_audio/Part_${currentPart.part}.mp3`;
      const currentQNum = this.currentIndex + 1;
      const qInPartIdx = Math.max(0, currentQNum - currentPart.startQ);
      const targetCueTime = (currentPart.cues && currentPart.cues[qInPartIdx] !== undefined)
        ? currentPart.cues[qInPartIdx]
        : (qInPartIdx * (currentPart.duration / currentPart.count));

      // If audio is already loaded for this part, just seek
      if (this.audioObj && this.audioObj.dataset && this.audioObj.dataset.partFile === expectedAudioFile) {
        if (Math.abs(this.audioObj.currentTime - targetCueTime) > 1.5) {
          try { this.audioObj.currentTime = targetCueTime; } catch(e) {}
        }
        if (this.audioObj.paused) {
          this.audioObj.playbackRate = this.speed || 1.0;
          this.audioObj.play().catch(() => {});
        }
        this.scrollToActiveCard(currentQ.id);
        this.notify();
        return;
      }

      // Load new Part Audio
      if (this.audioObj) {
        try { this.audioObj.pause(); } catch(e) {}
      }

      const tryPlayFallback = () => {
        // Fallback 1: Try individual MP3 or Browser Speech
        const fallbackAudio = new Audio(`audio/q_${currentQ.id}.mp3`);
        this.audioObj = fallbackAudio;
        fallbackAudio.playbackRate = this.speed || 1.0;
        fallbackAudio.onplay = () => { this.isPlaying = true; this.notify(); };
        fallbackAudio.onended = () => {
          this.audioObj = null;
          if (this.currentIndex < this.playlist.length - 1) {
            this.pauseTimer = setTimeout(() => {
              if (this.isActive) { this.currentIndex++; this.playCurrent(); this.notify(); }
            }, 1000);
          } else { this.isPlaying = false; this.notify(); }
        };
        fallbackAudio.onerror = () => {
          this.audioObj = null;
          if (window.caSpeak) {
            this.isPlaying = true;
            this.notify();
            window.caSpeak(currentQ, () => {
              if (this.isActive) {
                if (this.currentIndex < this.playlist.length - 1) {
                  this.currentIndex++;
                  this.playCurrent();
                  this.notify();
                } else { this.isPlaying = false; this.notify(); }
              }
            });
          }
        };
        fallbackAudio.play().catch(() => {
          fallbackAudio.onerror();
        });
      };

      const audio = new Audio(expectedAudioFile);
      audio.dataset.partFile = expectedAudioFile;
      this.audioObj = audio;
      audio.playbackRate = this.speed || 1.0;

      audio.onloadedmetadata = () => {
        try { audio.currentTime = targetCueTime; } catch(e) {}
      };

      audio.ontimeupdate = () => {
        if (!this.isActive || !this.isPlaying) return;
        const ct = audio.currentTime;
        const cues = currentPart.cues || [];
        let matchingQInPart = 0;
        for (let i = 0; i < cues.length; i++) {
          if (ct >= cues[i] - 0.3) {
            matchingQInPart = i;
          }
        }
        const syncedQIdx = (currentPart.startQ - 1) + matchingQInPart;
        if (this.currentIndex !== syncedQIdx && syncedQIdx < this.playlist.length) {
          this.currentIndex = syncedQIdx;
          const newlyActiveQ = this.playlist[this.currentIndex];
          if (newlyActiveQ) {
            this.scrollToActiveCard(newlyActiveQ.id);
            this.updateMediaSessionMetadata(newlyActiveQ);
          }
          this.notify();
        }
      };

      audio.onplay = () => {
        this.isPlaying = true;
        this.updateMediaSessionMetadata(currentQ);
        this.notify();
      };

      audio.onpause = () => {
        if (!this.pauseTimer) {
          this.isPlaying = false;
          this.notify();
        }
      };

      audio.onended = () => {
        this.audioObj = null;
        const isStudio = !!(window.caConfig && window.caConfig.isYouTubeStudio);
        if (isStudio) {
          this.isPlaying = false;
          this.notify();
          return;
        }
        if (this.activePartIndex < parts.length - 1) {
          this.activePartIndex++;
          const nextP = parts[this.activePartIndex];
          this.currentIndex = nextP.startQ - 1;
          this.isPlaying = true;
          this.notify();
          this.pauseTimer = setTimeout(() => {
            if (this.isActive) this.playCurrent();
          }, 1000);
        } else {
          this.isPlaying = false;
          this.notify();
        }
      };

      audio.onerror = () => {
        console.warn("Part Audio missing, falling back smoothly:", expectedAudioFile);
        this.audioObj = null;
        tryPlayFallback();
      };

      this.scrollToActiveCard(currentQ.id);
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          tryPlayFallback();
        });
      }
      return;
    }

    // 📱 BRANCH B: Standard Per-Question Rapid MP3 Mode
    const tryStandardPlayback = () => {
      const isStudio = !!(window.caConfig && window.caConfig.isYouTubeStudio);
      const customBase = (window.caConfig && window.caConfig.audioBaseUrl) ? window.caConfig.audioBaseUrl.replace(/\/+$/, '') : '';

      const candidatePaths = [
        customBase ? `${customBase}/q_${currentQ.id}.mp3` : null,
        isStudio ? `audio_youtube/q_${currentQ.id}.mp3` : `audio/q_${currentQ.id}.mp3`,
        isStudio ? `./audio_youtube/q_${currentQ.id}.mp3` : `./audio/q_${currentQ.id}.mp3`,
        isStudio ? `../audio_youtube/q_${currentQ.id}.mp3` : `../audio/q_${currentQ.id}.mp3`,
        `January_Current_Affairs_2026_onelinear/audio/q_${currentQ.id}.mp3`,
        `Website_Apps_HTML/audio/q_${currentQ.id}.mp3`,
        `audio/q_${currentQ.id}.mp3`,
        `audio_youtube/q_${currentQ.id}.mp3`
      ].filter(Boolean);

      let pathIdx = 0;
      const tryNextStandard = () => {
        if (pathIdx >= candidatePaths.length) {
          this.audioObj = null;
          this.isPlaying = false;
          this.notify();
          try {
            window.dispatchEvent(new CustomEvent('ca-audio-missing', {
              detail: {
                questionId: currentQ ? currentQ.id : null,
                message: 'ऑडियो फाइल सर्वर पर उपलब्ध नहीं है।'
              }
            }));
          } catch(e) {}
          return;
        }

        const audioPath = candidatePaths[pathIdx++];
        try {
          if (!window.caSharedAudio) {
            window.caSharedAudio = new Audio();
          }
          const audio = window.caSharedAudio;
          this.audioObj = audio;

          // ⚡ Lock speed firmly on element and prevent browser resetting to 1.0
          const currentSpeed = this.speed || 1.25;
          try {
            audio.defaultPlaybackRate = currentSpeed;
            audio.playbackRate = currentSpeed;
          } catch(e) {}

          const enforceSpeed = () => {
            if (this.speed) {
              try {
                audio.defaultPlaybackRate = this.speed;
                audio.playbackRate = this.speed;
              } catch(e) {}
            }
          };

          this.scrollToActiveCard(currentQ.id);

          audio.onloadedmetadata = enforceSpeed;
          audio.oncanplay = enforceSpeed;

          audio.onplay = () => {
            enforceSpeed();
            this.isPlaying = true;
            this.updateMediaSessionMetadata(currentQ);
            this.notify();

            // 🚀 Pre-buffer NEXT question's audio in background so next transition starts in 0ms!
            if (this.currentIndex < this.playlist.length - 1) {
              const nextQ = this.playlist[this.currentIndex + 1];
              if (nextQ && nextQ.id) {
                const nextAudioUrl = customBase ? `${customBase}/q_${nextQ.id}.mp3` : `audio/q_${nextQ.id}.mp3`;
                if (!window.caPreloadAudio) window.caPreloadAudio = new Audio();
                window.caPreloadAudio.preload = 'auto';
                window.caPreloadAudio.src = nextAudioUrl;
              }
            }
          };

          audio.onpause = () => {
            if (!this.pauseTimer) {
              this.isPlaying = false;
              this.notify();
            }
          };

          audio.onended = () => {
            if (this.currentIndex >= this.playlist.length - 1) {
              this.isPlaying = false;
              this.notify();
              return;
            }

            this.isPlaying = true;
            this.notify();
            this.pauseTimer = setTimeout(() => {
              if (this.isActive) {
                this.currentIndex++;
                this.playCurrent();
                this.notify();
              }
            }, 450);
          };

          audio.onerror = () => {
            tryNextStandard();
          };

          audio.pause();
          audio.preload = 'auto';
          audio.src = audioPath;
          audio.load();
          const p = audio.play();
          if (p !== undefined) {
            p.then(() => {
              enforceSpeed();
            }).catch(() => {
              tryNextStandard();
            });
          }
        } catch(e) {
          tryNextStandard();
        }
      };

      tryNextStandard();
    };

    tryStandardPlayback();
  },

  togglePlay: function() {
    if (!this.isActive) {
      if (this.playlist && this.playlist.length > 0) {
        this.start(this.playlist, this.currentIndex);
      }
      return;
    }
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  },

  pause: function() {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    if (this.audioObj) {
      try { this.audioObj.pause(); } catch(e) {}
    }
    window.caStopSpeech();
    this.isPlaying = false;
    this.notify();
  },

  resume: function() {
    if (this.audioObj && this.audioObj.paused) {
      try {
        const curSpd = this.speed || 1.25;
        this.audioObj.defaultPlaybackRate = curSpd;
        this.audioObj.playbackRate = curSpd;
        this.audioObj.play();
        this.isPlaying = true;
        this.notify();
        return;
      } catch(e) {}
    }
    this.playCurrent();
  },

  next: function() {
    if (!this.isActive) return;
    if (this.currentIndex < this.playlist.length - 1) {
      if (this.pauseTimer) clearTimeout(this.pauseTimer);
      this.currentIndex++;
      this.playCurrent();
      this.notify();
    }
  },

  prev: function() {
    if (!this.isActive) return;
    if (this.currentIndex > 0) {
      if (this.pauseTimer) clearTimeout(this.pauseTimer);
      this.currentIndex--;
      this.playCurrent();
      this.notify();
    }
  },

  jumpTo: function(target) {
    if (!this.isActive) {
      if (!this.playlist || this.playlist.length === 0) {
        this.playlist = (window.caConfig && window.caConfig.questions) || [];
      }
      this.isActive = true;
    }

    let targetIdx = -1;
    if (typeof target === 'number') {
      if (target >= 0 && target < this.playlist.length) {
        targetIdx = target;
      } else {
        const found = this.playlist.findIndex(q => parseInt(q.id, 10) === target);
        if (found !== -1) targetIdx = found;
      }
    } else if (typeof target === 'string') {
      const found = this.playlist.findIndex(q => String(q.id) === String(target));
      if (found !== -1) targetIdx = found;
    }

    if (targetIdx !== -1) {
      if (this.pauseTimer) {
        clearTimeout(this.pauseTimer);
        this.pauseTimer = null;
      }
      this.currentIndex = targetIdx;
      this.isPlaying = true;
      this.requestWakeLock();
      this.playCurrent();
      this.notify();
    }
  },

  setSpeed: function(newSpeed) {
    const val = parseFloat(newSpeed);
    if (isNaN(val) || val <= 0) return;
    this.speed = val;
    if (this.audioObj) {
      try {
        this.audioObj.defaultPlaybackRate = val;
        this.audioObj.playbackRate = val;
      } catch(e) {}
    }
    try {
      localStorage.setItem('ca_podcast_speed', String(val));
    } catch(e) {}
    this.notify();
  },

  stop: function() {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    if (this.audioObj) {
      try {
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
      } catch(e) {}
      this.audioObj = null;
    }
    window.caStopSpeech();
    this.releaseWakeLock();
    this.isActive = false;
    this.isPlaying = false;
    this.notify();
  },

  scrollToActiveCard: function(qId) {
    if (typeof document === 'undefined') return;
    try {
      const cardEl = document.getElementById(`ca-card-${qId}`) || document.querySelector(`[data-qid="${qId}"]`) || document.getElementById(`card-q-${qId}`);
      if (!cardEl) return;

      const scrollContainer = document.querySelector('.main-scroll');
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();

        const topSafe = containerRect.top + 20;
        const bottomSafe = containerRect.bottom - 100;

        // 🎥 STEADY CAMERA TECHNIQUE:
        // If card is already comfortably visible within .main-scroll, DO NOT jump!
        if (cardRect.top >= topSafe && cardRect.bottom <= bottomSafe) {
          return;
        }

        // When moving to the next row (e.g. Card 4, 7, 10), scroll .main-scroll smoothly
        const scrollDelta = cardRect.top - containerRect.top;
        scrollContainer.scrollTo({
          top: Math.max(0, scrollContainer.scrollTop + scrollDelta - 20),
          behavior: 'smooth'
        });
      } else {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch(e) {}
  },

  setupMediaSession: function() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    } catch(e) {}
  },

  updateMediaSessionMetadata: function(currentQ) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !window.MediaMetadata) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Q.${currentQ.id}: ${currentQ.question}`,
        artist: 'GyanLayer Current Affairs Podcast',
        album: `${this.scopeTitle} (${this.currentIndex + 1}/${this.playlist.length})`
      });
    } catch(e) {}
  }
};
