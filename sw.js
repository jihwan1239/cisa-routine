// CISA 루틴 서비스 워커: 오프라인 캐시 + 연속 기록 알림
const PREFIX = 'cisa-routine:' + self.registration.scope + ':';
const CACHE = PREFIX + 'v4-pdf-ko';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './bank-d1.js', './bank-d2.js', './bank-d3.js', './bank-d4.js', './bank-d5.js',
  './bank-n1.js', './bank-n2.js', './bank-n3.js', './bank-n4.js', './bank-n4b.js', './bank-n5.js', './bank-pdf-ko.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// 같은 출처 요청은 네트워크 우선, 실패하면 캐시
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(e.request, cp))); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});

// 앱이 IndexedDB에 남긴 학습 상태 읽기
function openDb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('cisa-routine', 2);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'name' });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'id' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function getStatus() {
  const db = await openDb();
  return new Promise(res => {
    const q = db.transaction('meta').objectStore('meta').get('status');
    q.onsuccess = () => res(q.result || null);
    q.onerror = () => res(null);
  });
}
const dkey = (d = new Date()) => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const gapDays = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);

async function buildMessage() {
  let st = null;
  try { st = await getStatus(); } catch (_) {}
  const today = dkey();
  if (st && st.last) {
    const gap = gapDays(st.last, today);
    if (gap <= 0) return { title: `🔥 ${st.chain}일 연속 완료`, body: '오늘 공부는 이미 마쳤어요. 내일도 이어가요.', silent: true };
    if (st.chain > 0 && gap - 1 <= (st.freezes || 0)) {
      return { title: `🔥 ${st.chain}일 연속 기록이 끊기기 직전이에요`, body: '오늘 5문제만 풀면 기록이 이어져요.', silent: false };
    }
  }
  return { title: '오늘 CISA 5분 어때요?', body: '5문제로 새 연속 기록을 시작해 보세요.', silent: false };
}

self.addEventListener('push', e => {
  e.waitUntil((async () => {
    const m = await buildMessage();
    await self.registration.showNotification(m.title, {
      body: m.body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'streak',
      renotify: !m.silent, silent: m.silent, data: { url: self.registration.scope }
    });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
