/* Yusuf Alper | Çevrimdışı katman. Tüm tasarım özel lisanslıdır. */
'use strict';
var VERSION = 'ya-v1';
var STATIC = VERSION + '-static';
var PAGES = VERSION + '-pages';
var OFFLINE = '/cevrimdisi.html';
var PRECACHE = [
  OFFLINE,
  '/favicon.svg',
  '/assets/fonts/unbounded-latin-300-800.woff2',
  '/assets/fonts/unbounded-latin-ext-300-800.woff2',
  '/assets/fonts/manrope-latin-300-800.woff2',
  '/assets/fonts/manrope-latin-ext-300-800.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(STATIC).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf(VERSION) !== 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.indexOf('/assets/video/') === 0 && /\.(mp4|webm)$/.test(url.pathname)) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(PAGES).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match(OFFLINE); });
      })
    );
    return;
  }

  if (/\.(css|js|woff2|webp|jpg|png|svg)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && res.ok) { var copy = res.clone(); caches.open(STATIC).then(function (c) { c.put(req, copy); }); }
          return res;
        }).catch(function () { return hit; });
        return hit || net;
      })
    );
  }
});
