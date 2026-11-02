/*!
 * Yusuf Alper | Etkileşim çekirdeği
 * Tüm tasarım özel lisanslıdır.
 */
(function () {
  'use strict';

  var d = document, w = window, html = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf = w.requestAnimationFrame.bind(w);
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ======================================================
     SES MOTORU: Özgün, üretilen ortam müziği ve dokunma efektleri
     ====================================================== */
  var Audio = (function () {
    var ctx = null, master = null, musicBus = null, sfxBus = null, verb = null;
    var started = false, timer = null, nextBar = 0, bar = 0;
    var BPM = 86, BEAT = 60 / BPM, BAR = BEAT * 4;
    // Am9 – Fmaj7 – Cmaj7 – G6 (MIDI)
    var CHORDS = [
      [45, 57, 60, 64, 67, 71],
      [41, 57, 60, 64, 65, 69],
      [48, 55, 59, 64, 67, 71],
      [43, 55, 59, 62, 64, 67]
    ];
    function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    function impulse(sec, decay) {
      var rate = ctx.sampleRate, len = Math.floor(rate * sec);
      var buf = ctx.createBuffer(2, len, rate);
      for (var ch = 0; ch < 2; ch++) {
        var data = buf.getChannelData(ch);
        for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
      return buf;
    }
    var noiseBuf = null;
    function noise() {
      if (noiseBuf) return noiseBuf;
      var len = ctx.sampleRate;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return noiseBuf;
    }

    function init() {
      if (ctx) return true;
      var AC = w.AudioContext || w.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { return false; }
      master = ctx.createGain(); master.gain.value = 0;
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 3;
      master.connect(comp); comp.connect(ctx.destination);
      verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.6);
      var verbGain = ctx.createGain(); verbGain.gain.value = 0.55;
      verb.connect(verbGain); verbGain.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = 1;
      musicBus.connect(master); musicBus.connect(verb);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 1.4;
      sfxBus.connect(master);
      return true;
    }

    function pad(t, notes) {
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 820; lp.Q.value = 0.4;
      var lfo = ctx.createOscillator(), lfoG = ctx.createGain();
      lfo.frequency.value = 0.18; lfoG.gain.value = 260; lfo.connect(lfoG); lfoG.connect(lp.frequency);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 1.4);
      g.gain.setValueAtTime(0.06, t + BAR - 0.4);
      g.gain.linearRampToValueAtTime(0, t + BAR + 1.6);
      lp.connect(g); g.connect(musicBus);
      notes.slice(1, 5).forEach(function (n, i) {
        ['triangle', 'sawtooth'].forEach(function (type, k) {
          var o = ctx.createOscillator(); o.type = type;
          o.frequency.value = mtof(n); o.detune.value = (k ? 7 : -5) + i;
          var og = ctx.createGain(); og.gain.value = k ? 0.18 : 0.5;
          o.connect(og); og.connect(lp); o.start(t); o.stop(t + BAR + 1.8);
        });
      });
      lfo.start(t); lfo.stop(t + BAR + 1.8);
    }
    function bass(t, n) {
      [0, 2.5].forEach(function (b) {
        var st = t + b * BEAT;
        var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(n - 12);
        var g = ctx.createGain(); g.gain.setValueAtTime(0, st);
        g.gain.linearRampToValueAtTime(0.16, st + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, st + BEAT * 1.6);
        o.connect(g); g.connect(master); o.start(st); o.stop(st + BEAT * 1.7);
      });
    }
    function pluck(t, n, v) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(n);
      var o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = mtof(n + 12);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.9);
      var g2 = ctx.createGain(); g2.gain.value = 0.18;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(musicBus);
      o.start(t); o2.start(t); o.stop(t + 1); o2.stop(t + 1);
    }
    function hat(t, v) {
      var s = ctx.createBufferSource(); s.buffer = noise();
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 8000;
      var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.06);
      s.connect(hp); hp.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + 0.08);
    }
    function scheduleBar(t) {
      var ch = CHORDS[bar % CHORDS.length];
      pad(t, ch);
      if (bar >= 1) bass(t, ch[0]);
      var arp = [ch[3], ch[4], ch[5], ch[4], ch[3] + 12, ch[5], ch[4], ch[2] + 12];
      for (var i = 0; i < 8; i++) {
        if (bar >= 2 && Math.random() > 0.38) pluck(t + i * BEAT / 2, arp[i], 0.05 + Math.random() * 0.03);
        if (bar >= 3) hat(t + i * BEAT / 2 + BEAT / 4, i % 2 ? 0.02 : 0.012);
      }
      bar++;
    }
    function loop() {
      if (!ctx) return;
      while (nextBar < ctx.currentTime + 1.2) { scheduleBar(nextBar); nextBar += BAR; }
    }
    function start() {
      if (reduce) return;
      if (!init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (started) return;
      started = true;
      nextBar = ctx.currentTime + 0.1;
      loop();
      timer = setInterval(loop, 300);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 6);
    }
    function tap(kind) {
      if (!ctx || !started) return;
      var t = ctx.currentTime;
      var f = kind === 'soft' ? 1760 : kind === 'low' ? 520 : 1180;
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.62, t + 0.12);
      var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.76;
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(kind === 'soft' ? 0.05 : 0.14, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0006, t + 0.28);
      var g2 = ctx.createGain(); g2.gain.value = 0.25;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(sfxBus); g.connect(verb);
      o.start(t); o2.start(t); o.stop(t + 0.3); o2.stop(t + 0.3);
    }
    var sandSrc = null, sandGain = null, sandFilter = null;
    function sand(level) {
      if (!ctx || !started) return;
      if (!sandSrc) {
        sandSrc = ctx.createBufferSource(); sandSrc.buffer = noise(); sandSrc.loop = true;
        sandFilter = ctx.createBiquadFilter(); sandFilter.type = 'bandpass'; sandFilter.frequency.value = 3200; sandFilter.Q.value = 0.9;
        sandGain = ctx.createGain(); sandGain.gain.value = 0;
        sandSrc.connect(sandFilter); sandFilter.connect(sandGain); sandGain.connect(sfxBus);
        sandSrc.start();
      }
      var t = ctx.currentTime;
      sandGain.gain.cancelScheduledValues(t);
      sandGain.gain.setTargetAtTime(Math.min(0.09, level * 0.09), t, 0.05);
      sandFilter.frequency.setTargetAtTime(2400 + level * 3000, t, 0.08);
    }
    d.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (d.hidden) ctx.suspend(); else if (started) ctx.resume();
    });
    return { start: start, tap: tap, sand: sand };
  })();
  w.YAAudio = Audio;

  function firstGesture() {
    Audio.start();
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) { d.removeEventListener(e, firstGesture, true); });
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) { d.addEventListener(e, firstGesture, { capture: true, passive: true }); });

  d.addEventListener('pointerdown', function (e) {
    var t = e.target.closest && e.target.closest('a,button,[data-video],.chip,.cert,.stat');
    if (t) Audio.tap(t.matches('a,button,[data-video]') ? 'tap' : 'soft');
  }, { passive: true });
  if (fine) {
    var lastHover = 0;
    d.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('[data-magnetic],.nav__links a,.prow,.pcard,.vcard');
      if (!t || e.relatedTarget && t.contains(e.relatedTarget)) return;
      var now = performance.now();
      if (now - lastHover > 90) { lastHover = now; Audio.tap('soft'); }
    }, { passive: true });
  }

  /* ======================================================
     METİN BÖLME
     ====================================================== */
  $$('[data-split]').forEach(function (el) {
    var txt = el.textContent; el.textContent = '';
    el.setAttribute('aria-label', txt);
    Array.prototype.forEach.call(txt, function (ch, i) {
      var s = d.createElement('span'); s.className = 'char'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--ci', i); s.textContent = ch === ' ' ? '\u00A0' : ch; el.appendChild(s);
    });
  });
  $$('[data-split-words]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/); el.textContent = '';
    el.setAttribute('aria-label', words.join(' '));
    words.forEach(function (wd, i) {
      var o = d.createElement('span'); o.className = 'word'; o.setAttribute('aria-hidden', 'true');
      var inn = d.createElement('span'); inn.textContent = wd; inn.style.setProperty('--wi', i);
      o.appendChild(inn); el.appendChild(o); el.appendChild(d.createTextNode(' '));
    });
  });

  /* ======================================================
     AÇILIŞ ANİMASYONU
     ====================================================== */
  function ready() { raf(function () { d.body.classList.add('is-ready'); }); }
  var intro = $('#intro');
  if (intro && !html.classList.contains('intro-done')) {
    var bar = $('#introBar'), cnt = $('#introCount'), t0 = performance.now(), DUR = 2100;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
      if (bar) bar.style.transform = 'scaleX(' + e + ')';
      if (cnt) cnt.textContent = (e * 100 | 0).toString().padStart(2, '0');
      if (p < 1) raf(tick); else {
        intro.classList.add('is-leaving');
        setTimeout(function () { html.classList.add('intro-done'); ready(); try { sessionStorage.setItem('ya-intro', '1'); } catch (e) {} }, 650);
        setTimeout(function () { intro.remove(); }, 1400);
      }
    })(t0);
  } else {
    if (intro) intro.remove();
    ready();
  }

  /* ======================================================
     KAYDIRMA: gösterim, ilerleme, menü
     ====================================================== */
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('[data-reveal-group]').forEach(function (g) {
      $$('[data-reveal]', g).forEach(function (el, i) { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (i % 6) * 0.07 + 's'); });
    });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }

  var nav = $('#nav'), prog = $('#scrollProgress'), lastY = w.scrollY, ticking = false;
  function onScroll() {
    var y = w.scrollY, max = d.documentElement.scrollHeight - w.innerHeight;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (nav && !d.body.classList.contains('menu-open')) {
      if (y > 140 && y > lastY + 4) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 140) nav.classList.remove('is-hidden');
    }
    lastY = y; ticking = false;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(onScroll); } }, { passive: true });
  onScroll();

  // Mobil menü
  var drawer = $('#drawer'), burger = $('#menuToggle');
  function setMenu(open) {
    if (!drawer || !burger) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!drawer.classList.contains('is-open')); });
  if (drawer) drawer.addEventListener('click', function (e) { if (e.target.closest('a') || e.target === drawer) setMenu(false); });

  /* ======================================================
     SAYAÇ
     ====================================================== */
  if ('IntersectionObserver' in w && !reduce) {
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        cio.unobserve(x.target);
        var el = x.target, end = parseInt(el.getAttribute('data-count'), 10), st = performance.now();
        if (!end) return;
        var from = end > 1000 ? end - 9 : 0;
        (function step(now) {
          var p = Math.min(1, (now - st) / 1600), e = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(from + (end - from) * e);
          if (p < 1) raf(step);
        })(st);
      });
    }, { threshold: 0.5 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ======================================================
     İMLEÇ, MANYETİK DÜĞMELER, IŞIK, EĞİM
     ====================================================== */
  if (fine && !reduce) {
    var cur = $('#cursor'), cx = -100, cy = -100, tx = -100, ty = -100, moving = false;
    d.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (cur && !cur.classList.contains('is-on')) cur.classList.add('is-on');
      if (!moving) { moving = true; raf(follow); }
    }, { passive: true });
    function follow() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      if (cur) cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) raf(follow); else moving = false;
    }
    d.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('a,button,[data-video]');
      if (cur) cur.classList.toggle('is-hover', !!t);
    }, { passive: true });
    d.addEventListener('pointerleave', function () { if (cur) cur.classList.remove('is-on'); });

    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.28, y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $$('[data-glow]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
    $$('[data-tilt]').forEach(function (el) {
      var host = el.closest('section') || el;
      host.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / w.innerWidth, y = (e.clientY - (r.top + r.height / 2)) / w.innerHeight;
        el.style.transform = 'perspective(800px) rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 14) + 'deg)';
      }, { passive: true });
      host.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ======================================================
     HERO VİDEO: görünür değilken durdur
     ====================================================== */
  var hv = $('.hero__video');
  if (hv && 'IntersectionObserver' in w) {
    new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); } else hv.pause(); });
    }).observe(hv);
  }

  /* ======================================================
     VİDEO OYNATICI
     ====================================================== */
  var lb = $('#lightbox'), lv = $('#lightboxVideo'), lc = $('#lightboxCap'), lastFocus = null;
  function openVideo(src, cap) {
    if (!lb || !lv) return;
    lastFocus = d.activeElement;
    lv.src = src; lc.textContent = cap || '';
    lb.hidden = false;
    d.body.style.overflow = 'hidden';
    raf(function () { raf(function () { lb.classList.add('is-open'); }); });
    var p = lv.play(); if (p && p.catch) p.catch(function () {});
    var btn = $('.lightbox__close', lb); if (btn) btn.focus({ preventScroll: true });
  }
  function closeVideo() {
    if (!lb || lb.hidden) return;
    lb.classList.remove('is-open');
    lv.pause();
    setTimeout(function () { lb.hidden = true; lv.removeAttribute('src'); lv.load(); d.body.style.overflow = ''; if (lastFocus) lastFocus.focus({ preventScroll: true }); }, 450);
  }
  d.addEventListener('click', function (e) {
    var v = e.target.closest('[data-video]');
    if (v) { e.preventDefault(); openVideo(v.getAttribute('data-video'), v.getAttribute('data-caption')); return; }
    if (e.target.closest('[data-close]')) closeVideo();
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeVideo(); setMenu(false); }
  });
  if (lv) lv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ======================================================
     İÇİNDEKİLER: aktif başlık
     ====================================================== */
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in w) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var tio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { tocLinks.forEach(function (a) { a.classList.remove('is-active'); }); var a = map[x.target.id]; if (a) a.classList.add('is-active'); }
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var h = d.getElementById(id); if (h) tio.observe(h); });
  }

  /* ======================================================
     İÇERİK KORUMA (özel lisans)
     ====================================================== */
  d.addEventListener('contextmenu', function (e) { if (e.target.closest('img,video,canvas')) e.preventDefault(); });
  d.addEventListener('dragstart', function (e) { if (e.target.closest('img,video')) e.preventDefault(); });

  /* ======================================================
     ÇEVRİMDIŞI DESTEK
     ====================================================== */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    w.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {}); });
  }
})();
