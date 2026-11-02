/*!
 * Yusuf Alper | Manyetik kum motoru
 * Dokunulunca dağılan, ardından yeniden bir araya gelen kum taneleri.
 * Tüm tasarım özel lisanslıdır.
 */
(function () {
  'use strict';
  var canvas = document.getElementById('sandCanvas');
  if (!canvas) return;
  var stage = canvas.parentElement;
  var hint = document.getElementById('sandHint');
  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var text = canvas.getAttribute('data-text') || 'YUSUF ALPER';

  var W = 0, H = 0, scale = 1, img = null, buf32 = null;
  var N = 0, X, Y, VX, VY, HX, HY, K, C;
  var running = false, visible = false, built = false, poured = false;
  var px = -9999, py = -9999, pvx = 0, pvy = 0, pActive = false, lastMove = 0, energy = 0;

  // Kum paleti (ABGR, little-endian)
  function abgr(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (255 << 24 | b << 16 | g << 8 | r) >>> 0;
  }
  var PALETTE = ['#f6e2b8', '#ecc98e', '#e0b574', '#d19f5a', '#c48a45', '#f9ecd0', '#b97d3c', '#e8c27f'].map(abgr);
  var BG = abgr('#000000');

  function fontReady() {
    if (document.fonts && document.fonts.load) {
      return Promise.race([
        document.fonts.load('700 100px "YA Display"'),
        new Promise(function (r) { setTimeout(r, 1500); })
      ]);
    }
    return Promise.resolve();
  }

  function build() {
    var rect = stage.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, rect.width < 700 ? 2 : 1.5);
    scale = dpr;
    W = Math.max(1, Math.floor(rect.width * dpr));
    H = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = W; canvas.height = H;
    img = ctx.createImageData(W, H);
    buf32 = new Uint32Array(img.data.buffer);

    // Metni gizli tuvale yaz
    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var o = off.getContext('2d');
    o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
    o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
    var words = text.split(' ');
    var twoLines = rect.width < 760 && words.length > 1;
    var lines = twoLines ? words : [text];
    var size = Math.floor(H * (twoLines ? 0.3 : 0.36));
    o.font = '700 ' + size + 'px "YA Display", system-ui, sans-serif';
    var maxW = 0;
    lines.forEach(function (l) { maxW = Math.max(maxW, o.measureText(l).width); });
    if (maxW > W * 0.86) { size = Math.floor(size * (W * 0.86) / maxW); o.font = '700 ' + size + 'px "YA Display", system-ui, sans-serif'; }
    var lh = size * 1.02;
    var y0 = H / 2 - (lines.length - 1) * lh / 2 - H * 0.03;
    lines.forEach(function (l, i) { o.fillText(l, W / 2, y0 + i * lh); });

    var data = o.getImageData(0, 0, W, H).data;
    var area = rect.width * rect.height;
    var target = Math.min(rect.width < 700 ? 5200 : 9500, Math.max(2500, area / 60));
    // Uygun örnekleme aralığını bul
    var lit = 0;
    for (var i = 0; i < data.length; i += 16) if (data[i] > 128) lit++;
    lit *= 4;
    var step = Math.max(2, Math.round(Math.sqrt(lit / target)));
    var pts = [];
    for (var y = 0; y < H; y += step) {
      for (var x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4] > 128) pts.push(x + (Math.random() - 0.5) * step * 0.9, y + (Math.random() - 0.5) * step * 0.9);
      }
    }
    var oldN = N, oX = X, oY = Y;
    N = pts.length / 2;
    X = new Float32Array(N); Y = new Float32Array(N); VX = new Float32Array(N); VY = new Float32Array(N);
    HX = new Float32Array(N); HY = new Float32Array(N); K = new Float32Array(N); C = new Uint32Array(N);
    for (var p = 0; p < N; p++) {
      HX[p] = pts[p * 2]; HY[p] = pts[p * 2 + 1];
      K[p] = 0.012 + Math.random() * 0.026;
      C[p] = PALETTE[(Math.random() * PALETTE.length) | 0];
      if (oldN && p < oldN) { X[p] = oX[p] * (W / Math.max(1, W)); Y[p] = oY[p]; }
      else if (!poured && !reduce) { X[p] = Math.random() * W; Y[p] = -Math.random() * H * 1.2 - 10; VY[p] = Math.random() * 4; }
      else { X[p] = HX[p]; Y[p] = HY[p]; }
    }
    built = true;
    if (reduce) { draw(); return; }
    wake();
  }

  function draw() {
    buf32.fill(BG);
    var Wm = W - 2, Hm = H - 2, big = scale >= 1.5;
    for (var i = 0; i < N; i++) {
      var x = X[i] | 0, y = Y[i] | 0;
      if (x < 0 || y < 0 || x > Wm || y > Hm) continue;
      var idx = y * W + x, c = C[i];
      buf32[idx] = c; buf32[idx + 1] = c;
      if (big) { buf32[idx + W] = c; buf32[idx + W + 1] = c; }
    }
    ctx.putImageData(img, 0, 0);
  }

  function step() {
    var R = 95 * scale, R2 = R * R;
    var now = performance.now();
    var active = pActive && now - lastMove < 140;
    var speed = Math.min(60, Math.sqrt(pvx * pvx + pvy * pvy));
    var force = 2.4 + speed * 0.09;
    var maxV = 0;
    for (var i = 0; i < N; i++) {
      var x = X[i], y = Y[i], vx = VX[i], vy = VY[i];
      if (active) {
        var dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          var dist = Math.sqrt(d2), f = (1 - dist / R); f = f * f * force;
          vx += dx / dist * f * 6 + pvx * f * 0.32 + (Math.random() - 0.5) * f * 2;
          vy += dy / dist * f * 6 + pvy * f * 0.32 + (Math.random() - 0.5) * f * 2;
        }
      }
      var k = K[i];
      vx += (HX[i] - x) * k;
      vy += (HY[i] - y) * k;
      vx *= 0.86; vy *= 0.86;
      x += vx; y += vy;
      X[i] = x; Y[i] = y; VX[i] = vx; VY[i] = vy;
      var m = (vx < 0 ? -vx : vx) + (vy < 0 ? -vy : vy);
      if (m > maxV) maxV = m;
    }
    pvx *= 0.8; pvy *= 0.8;
    return maxV;
  }

  function frame() {
    if (!visible) { running = false; return; }
    var m = step();
    draw();
    energy *= 0.9;
    if (window.YAAudio) window.YAAudio.sand(energy);
    if (m < 0.04 && energy < 0.01 && !(pActive && performance.now() - lastMove < 300)) {
      // Tüm taneler yerine oturdu: işlemciyi dinlendir
      for (var i = 0; i < N; i++) { X[i] = HX[i]; Y[i] = HY[i]; VX[i] = 0; VY[i] = 0; }
      draw();
      running = false;
      if (window.YAAudio) window.YAAudio.sand(0);
      return;
    }
    requestAnimationFrame(frame);
  }
  function wake() {
    if (running || !built || !visible || reduce) return;
    running = true; poured = true;
    requestAnimationFrame(frame);
  }

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    var nx = (e.clientX - r.left) * scale, ny = (e.clientY - r.top) * scale;
    if (pActive && px > -9000) {
      pvx = pvx * 0.4 + (nx - px) * 0.6; pvy = pvy * 0.4 + (ny - py) * 0.6;
      energy = Math.min(1, energy + Math.sqrt(pvx * pvx + pvy * pvy) / (40 * scale));
    }
    px = nx; py = ny; lastMove = performance.now(); pActive = true;
  }
  function hideHint() { if (hint) { hint.classList.add('is-gone'); hint = null; } }
  canvas.addEventListener('pointerdown', function (e) {
    pActive = true; px = -9999; pos(e); energy = Math.min(1, energy + 0.4);
    pvx += (Math.random() - 0.5) * 30; pvy += (Math.random() - 0.5) * 30;
    hideHint(); wake();
    if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (x) {} }
  });
  canvas.addEventListener('pointermove', function (e) { pos(e); wake(); }, { passive: true });
  function leave() { pActive = false; px = py = -9999; }
  canvas.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') leave(); });
  canvas.addEventListener('pointercancel', leave);
  canvas.addEventListener('pointerleave', leave);

  var rT = 0, lastW = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      var w = stage.getBoundingClientRect().width;
      if (Math.abs(w - lastW) < 2) return;
      lastW = w; build();
    }, 180);
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        visible = x.isIntersecting;
        if (visible) { if (!built) fontReady().then(function () { lastW = stage.getBoundingClientRect().width; build(); }); else wake(); }
      });
    }, { threshold: 0.15 }).observe(stage);
  } else {
    visible = true;
    fontReady().then(build);
  }
})();
