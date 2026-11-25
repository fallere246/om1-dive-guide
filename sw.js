// アセットを変更したら VERSION を上げる（古いキャッシュを捨てるため）
const VERSION = 'v2';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'assets/css/style.css', 'assets/js/app.js',
  'assets/img/icon.svg',
  'assets/img/manual/fig-bodycap.png',
  'assets/img/manual/fig-charge.png',
  'assets/img/manual/fig-close.png',
  'assets/img/manual/fig-hotshoe.png',
  'assets/img/manual/fig-load.png',
  'assets/img/manual/fig-open.png',
  'assets/img/manual/fig-port.png',
  'assets/img/manual/fig-vacuum.png',
  'assets/img/manual/flp09-attach.jpg',
  'assets/img/manual/flp09-prep.jpg',
  'assets/img/manual/flp09-remove.jpg',
  'assets/img/manual/parts-back.png',
  'assets/img/manual/parts-front.png',
  'assets/img/manual/parts-inside.png',
  'assets/img/manual/parts-top.png',
  'assets/img/manual/umg-adjust.jpg',
  'assets/img/product/10532_uh-om1_10.webp',
  'assets/img/product/10532_uh-om1_13.webp',
  'assets/img/product/10561_uh-om1_ii-1.webp',
  'assets/img/product/10561_uh-om1_ii-12.webp',
  'assets/img/product/10561_uh-om1_ii-14.webp',
  'assets/img/product/10561_uh-om1_ii-15.webp',
  'assets/img/product/10561_uh-om1_ii-16.webp',
  'assets/img/product/21352_umg-01.webp',
  'assets/img/product/21558_flp-09_2.webp',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネット優先・失敗したらキャッシュ（電波があれば最新を、なければ保存版を表示）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
