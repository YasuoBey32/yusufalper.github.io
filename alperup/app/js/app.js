// AlperUp — app shell
import { QUESTIONS, activeQuestions, CATS, SOURCES, PRODUCTS, trendyol, shoppingList, report, scoreAll, buildPlan, insights, bmiOf } from './plan.js';

const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const KEY = 'alperup_v1';
const S = Object.assign({ profile: {}, answers: {}, scans: [], plan: null, done: {}, step: 'welcome' }, JSON.parse(localStorage.getItem(KEY) || '{}'));
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const dayKey = (d) => d.toISOString().slice(0, 10);
let face = null; // lazy-loaded module
let stream = null;
let tmpScan = null; // { front: {canvas, lm}, left?, right?, smile? } kept in memory only
let caps = {}; let stage = 0;
const STAGES = [
  { k: 'front', t: 'Önden', hint: 'Kameraya düz bak, nötr ifade' },
  { k: 'left', t: 'Bir yana dön', hint: 'Başını yavaşça bir omzuna doğru ~45° çevir' },
  { k: 'right', t: 'Diğer yana dön', hint: 'Şimdi diğer tarafa ~45° çevir' },
  { k: 'smile', t: 'Gülümse', hint: 'Kameraya düz bak, dişlerin görünecek şekilde gülümse' },
];
const QS = () => activeQuestions(S.profile);
function startScan() { caps = {}; stage = 0; tmpScan = {}; go('scan'); }
let qIndex = 0;
let onlyMissing = false;

function toast(t) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 1800); }
function vibrate(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

const NAV = [];
function go(step, fromBack) {
  stopCam();
  if (!fromBack && S.step && S.step !== step) NAV.push(S.step);
  S.step = step; save(); render(); window.scrollTo(0, 0);
}
function onBack() {
  const sh = document.getElementById('sheet');
  if (!sh.classList.contains('hidden')) return sh.classList.add('hidden');
  if (S.step === 'analyzing') return;
  if (S.step === 'quiz' && qIndex > 0) { qIndex--; return render(); }
  if (S.plan) {
    if (S.step === 'today') return window.Capacitor?.Plugins?.App?.exitApp();
    return go('today', true);
  }
  const prev = NAV.pop();
  if (prev) go(prev, true); else window.Capacitor?.Plugins?.App?.exitApp();
}
try {
  const P = window.Capacitor?.Plugins;
  P?.App?.addListener('backButton', onBack);
  P?.StatusBar?.setBackgroundColor({ color: '#0A0A0B' }); P?.StatusBar?.setStyle({ style: 'DARK' });
} catch (e) {}

function render() {
  const tabs = ['today', 'plan', 'analysis', 'me'];
  $('#tabbar').classList.toggle('hidden', !tabs.includes(S.step));
  document.querySelectorAll('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.step));
  (VIEWS[S.step] || VIEWS.welcome)();
}
document.querySelectorAll('#tabbar button').forEach((b) => (b.onclick = () => { vibrate(); go(b.dataset.tab); }));

const LOGO = `<div class="logo"><b>A↑</b><span class="lname">AlperUp<svg class="trflag" viewBox="0 0 30 20" aria-label="Türk bayrağı"><rect width="30" height="20" fill="#E30A17"/><circle cx="11.25" cy="10" r="5" fill="#fff"/><circle cx="12.5" cy="10" r="4" fill="#E30A17"/><polygon fill="#fff" transform="translate(17.6 10) rotate(-90)" points="0,-2.5 0.588,-0.809 2.378,-0.773 0.951,0.309 1.469,2.023 0,1 -1.469,2.023 -0.951,0.309 -2.378,-0.773 -0.588,-0.809"/></svg></span></div>`;
function topbar(pct, backTo) {
  return `<div class="top"><button class="back" data-back="${backTo || ''}">‹</button><div class="prog"><i style="width:${pct}%"></i></div></div>`;
}
function bindBack(fn) { const b = $('[data-back]'); if (b) b.onclick = fn; }

// ------------------------------------------------------------------ VIEWS
const VIEWS = {
  welcome() {
    app.innerHTML = `<div class="screen">
      <div class="hero center">
        ${LOGO}
        <h1 style="margin-top:34px">Hayatının en iyi<br><span class="gtext">versiyonuna</span> yüksel.</h1>
        <p style="margin-top:14px">Yapay zekâ yüz analizi + bilimsel olarak kanıtlanmış yöntemlerle sana özel glow up planı.</p>
      </div>
      <div class="card" style="margin-top:8px">
        <div class="feat"><div class="fi">◈</div><div><b>478 noktalı yüz analizi</b><span>Simetri, yüz oranları, çene hattı ve göz bölgesi telefonunda, cihaz içinde ölçülür.</span></div></div>
        <div class="feat"><div class="fi">✦</div><div><b>Kişiye özel protokol</b><span>Cilt, vücut, stil, sosyal çekim ve zihin için sana uyan adımlar.</span></div></div>
        <div class="feat"><div class="fi">▲</div><div><b>Bilime dayalı</b><span>Her öneri hakemli araştırmalara dayanır. Mit yok, boş vaat yok.</span></div></div>
        <div class="feat"><div class="fi">🔒</div><div><b>Fotoğrafın telefonundan çıkmaz</b><span>Analiz tamamen cihazında yapılır, hiçbir sunucuya yüklenmez.</span></div></div>
      </div>
      <div class="bottom"><button class="btn" id="go">Analizime başla</button></div></div>`;
    $('#go').onclick = () => { vibrate(); go('profile'); };
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios && !navigator.standalone && !window.Capacitor?.isNativePlatform?.()) {
      const n = document.createElement('div'); n.className = 'note iosnote';
      n.innerHTML = '<b>📲 iPhone\'a uygulama gibi ekle</b><br>Safari\'de alttaki Paylaş (□↑) düğmesine dokun → <b>Ana Ekrana Ekle</b>. Böylece AlperUp tam ekran açılır ve verilerin kalıcı olur.';
      $('.screen').insertBefore(n, $('.screen .card'));
    }
  },

  profile() {
    const p = S.profile;
    app.innerHTML = `<div class="screen">${topbar(6)}
      <h2>Seni tanıyalım</h2><p style="margin:8px 0 22px">Planın yaşına, cinsiyetine ve vücuduna göre hesaplanır.</p>
      <div class="field"><label>Adın</label><input id="name" value="${esc(p.name)}" placeholder="Adın" autocomplete="off"></div>
      <div class="field"><label>Cinsiyet</label><div class="seg">
        <button class="opt ${p.gender === 'erkek' ? 'sel' : ''}" data-g="erkek">Erkek</button>
        <button class="opt ${p.gender === 'kadin' ? 'sel' : ''}" data-g="kadin">Kadın</button></div></div>
      <div class="row2">
        <div class="field"><label>Yaş</label><input id="age" type="number" inputmode="numeric" value="${esc(p.age)}" placeholder="19"></div>
        <div class="field"><label>Boy (cm)</label><input id="height" type="number" inputmode="numeric" value="${esc(p.height)}" placeholder="178"></div>
      </div>
      <div class="field"><label>Kilo (kg)</label><input id="weight" type="number" inputmode="numeric" value="${esc(p.weight)}" placeholder="72"></div>
      <div class="bottom"><button class="btn" id="next">Devam</button></div></div>`;
    bindBack(() => go('welcome'));
    document.querySelectorAll('[data-g]').forEach((b) => (b.onclick = () => { p.gender = b.dataset.g; document.querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('sel', x === b)); vibrate(); }));
    $('#next').onclick = () => {
      p.name = $('#name').value.trim(); p.age = $('#age').value; p.height = $('#height').value; p.weight = $('#weight').value;
      if (!p.name || !p.gender || !p.age || !p.height || !p.weight) return toast('Lütfen tüm alanları doldur');
      if (+p.age < 13) return toast('AlperUp 13 yaş ve üzeri içindir');
      save(); go('goals');
    };
  },

  goals() {
    const G = [['yuz', '😎 Daha çekici bir yüz'], ['cilt', '✨ Pürüzsüz cilt'], ['vucut', '💪 Fit bir vücut'], ['stil', '👔 Stil & bakım'], ['iliski', '❤️ İlişki & flört'], ['zihin', '🧠 Özgüven & disiplin']];
    const sel = new Set(S.profile.goals || []);
    app.innerHTML = `<div class="screen">${topbar(12)}
      <h2>Neyi yükseltmek istiyorsun?</h2><p style="margin:8px 0 22px">Birden fazla seçebilirsin. Planın bunlara öncelik verecek.</p>
      <div class="chips">${G.map(([k, t]) => `<button class="chip ${sel.has(k) ? 'sel' : ''}" data-k="${k}">${t}</button>`).join('')}</div>
      <div class="bottom"><button class="btn" id="next">Devam</button></div></div>`;
    bindBack(() => go('profile'));
    document.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { vibrate(); sel.has(c.dataset.k) ? sel.delete(c.dataset.k) : sel.add(c.dataset.k); c.classList.toggle('sel'); }));
    $('#next').onclick = () => { if (!sel.size) return toast('En az bir hedef seç'); S.profile.goals = [...sel]; qIndex = 0; save(); go('quiz'); };
  },

  quiz() {
    const QL = QS(); if (qIndex >= QL.length) qIndex = QL.length - 1;
    const q = QL[qIndex];
    const pct = 12 + Math.round((qIndex / QL.length) * 70);
    const catN = { body: 'Vücut', skin: 'Cilt', style: 'Stil & bakım', social: 'Sosyal', mind: 'Zihin', meta: 'Plan' }[q.cat] || '';
    app.innerHTML = `<div class="screen">${topbar(pct)}
      <div class="qhero"><div class="kicker" style="color:#FFD2B0">${catN}</div><h2>${esc(q.text)}</h2>${q.sub ? `<p>${esc(q.sub)}</p>` : ''}</div>
      ${q.options.map((o, i) => `<button class="opt ${S.answers[q.id] === o.v ? 'sel' : ''}" data-i="${i}">${esc(o.t)}</button>`).join('')}
      <p class="center" style="font-size:13px;margin-top:8px">${qIndex + 1} / ${QL.length}</p></div>`;
    bindBack(() => { if (qIndex > 0) { qIndex--; render(); } else go('goals'); });
    document.querySelectorAll('.opt').forEach((b) => (b.onclick = () => {
      vibrate(); S.answers[q.id] = q.options[+b.dataset.i].v; b.classList.add('sel'); save();
      setTimeout(() => {
        let nx = qIndex + 1;
        if (onlyMissing) { nx = QL.findIndex((x, i) => i > qIndex && S.answers[x.id] === undefined); if (nx < 0) nx = QL.length; }
        if (nx < QL.length) { qIndex = nx; render(); } else { onlyMissing = false; go(S.plan ? 'requizDone' : 'scanIntro'); }
      }, 180);
    }));
  },

  scanIntro() {
    app.innerHTML = `<div class="screen">${topbar(85)}
      <h2>Şimdi geniş yüz taraması</h2><p style="margin:8px 0 20px">4 çekim yapacağız; her biri farklı ölçümler için:</p>
      <div class="card">
        <div class="feat"><div class="fi">😐</div><div><b>1 · Önden</b><span>Simetri, oranlar, göz bölgesi, burun, ağız, milimetre ölçüleri.</span></div></div>
        <div class="feat"><div class="fi">↪</div><div><b>2–3 · Sağ ve sol yan (~45°)</b><span>Profil: çene ucu, çene köşesi açısı, E-çizgisi, burun–dudak açısı.</span></div></div>
        <div class="feat"><div class="fi">😁</div><div><b>4 · Gülümseme</b><span>Gülümseme simetrisi ve gözlerle gülümseme.</span></div></div>
      </div>
      <div class="card">
        <div class="feat"><div class="fi">💡</div><div><b>Önden, eşit ışık</b><span>Pencereye dön. Gözlük ve şapka yok, saçını alnından çek.</span></div></div>
        <div class="feat"><div class="fi">🤳</div><div><b>Otomatik çekim</b><span>Doğru açıyı yakaladığında kendisi çeker. Telefonu göz hizasında tut.</span></div></div>
        <div class="feat"><div class="fi">🔒</div><div><b>Gizlilik</b><span>Fotoğraflar sadece bu cihazda işlenir ve kaydedilmez.</span></div></div>
      </div>
      <div class="bottom"><button class="btn" id="cam">Taramaya başla</button></div></div>`;
    bindBack(() => { qIndex = QS().length - 1; go('quiz'); });
    $('#cam').onclick = () => startScan();
  },

  async scan() {
    if (!tmpScan) { caps = {}; stage = 0; tmpScan = {}; }
    app.innerHTML = `<div class="screen">${topbar(88)}
      <div class="stagebar">${STAGES.map((x, i) => `<div data-st="${i}"><i></i><span>${x.t}</span></div>`).join('')}</div>
      <div class="cam"><video id="v" playsinline muted autoplay></video><canvas id="ov" class="mirror"></canvas><div class="ovalguide" id="og"></div><div class="camtitle" id="ct"></div><div class="camhint" id="hint">Model yükleniyor…</div></div>
      <button class="shutter" id="shot" disabled></button>
      <div class="scanlinks"><button class="linkbtn" id="up">Galeriden seç</button><button class="linkbtn" id="skip">Bu adımı atla</button></div>
      <input type="file" id="file" accept="image/*" class="hidden"></div>`;
    bindBack(() => go('scanIntro'));
    const v = $('#v'), ov = $('#ov'), hint = $('#hint'), og = $('#og'), shot = $('#shot');
    let busy = false, okFrames = 0, onReject = null;
    const paint = () => {
      document.querySelectorAll('[data-st]').forEach((el) => { const i = +el.dataset.st; el.className = i < stage ? (caps[STAGES[i].k] ? 'done' : 'skip') : i === stage ? 'cur' : ''; });
      $('#ct').textContent = `${stage + 1}/4 · ${STAGES[stage].hint}`;
      $('#skip').style.visibility = stage === 0 ? 'hidden' : 'visible';
      okFrames = 0; shot.disabled = true; og.classList.remove('ok');
    };
    const advance = async () => {
      stage++;
      if (stage >= STAGES.length) { stopCam(); return finalizeScan(); }
      vibrate(30); paint();
    };
    const capture = async (c, src = 'cam') => {
      if (busy) return; busy = true;
      const r = await processCanvas(c, STAGES[stage].k, src);
      busy = false;
      if (r === true) { toast(['Önden çekim tamam ✓', 'Yan çekim tamam ✓', 'İkinci yan tamam ✓', 'Gülümseme tamam ✓'][stage]); await advance(); }
      else { toast(r); okFrames = 0; if (typeof onReject === 'function') onReject(r); }
    };
    $('#up').onclick = () => $('#file').click();
    $('#file').onchange = async (e) => { const c = await fileCanvas(e.target.files[0]); e.target.value = ''; if (c) capture(c, 'file'); };
    $('#skip').onclick = () => { vibrate(); advance(); };
    paint();
    let initP;
    try {
      face = face || (await import('./face.js'));
      initP = face.initFace(); initP.catch(() => {});
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      v.srcObject = stream; await v.play();
    } catch (e) {
      hint.textContent = 'Kameraya erişilemedi. Galeriden fotoğraf seçebilirsin.'; console.error(e); return;
    }
    try { await initP; } catch (e) { hint.textContent = 'Model yüklenemedi: ' + String(e && e.message || e).slice(0, 80); console.error(e); return; }
    const ctx = ov.getContext('2d');
    let last = 0;
    const grab = () => { const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; const cx = c.getContext('2d'); cx.translate(c.width, 0); cx.scale(-1, 1); cx.drawImage(v, 0, 0); return c; };
    // Stabilised live loop: tolerates dropped frames, smooths yaw, uses hysteresis and a cooldown after a rejected capture
    let miss = 0, yawS = null, lastLm = null, hintAt = 0, hintTxt = '', coolUntil = 0;
    const setHint = (txt, force) => { const n = performance.now(); if (txt === hintTxt) return; if (!force && n - hintAt < 600) return; hintTxt = txt; hintAt = n; hint.textContent = txt; };
    const loop = async (t) => {
      if (S.step !== 'scan' || !stream) return;
      if (!busy && t - last > 90 && v.readyState >= 2) {
        last = t;
        if (ov.width !== v.videoWidth) { ov.width = v.videoWidth; ov.height = v.videoHeight; }
        const lm = await face.detectVideo(v, performance.now());
        const st = STAGES[stage].k;
        if (lm) {
          miss = 0; lastLm = lm;
          const rawYaw = face.lastPose ? face.lastPose.yaw : null;
          yawS = rawYaw == null ? null : (yawS == null ? rawYaw : yawS * 0.6 + rawYaw * 0.4);
          ctx.clearRect(0, 0, ov.width, ov.height);
          face.drawMesh(ctx, lm, ov.width, ov.height, { step: 4 });
          const q = face.quality(lm, ov.width, ov.height, st, okFrames > 0, (st === 'left' || st === 'right') ? yawS : null);
          // live video is not mirrored, captures are: a camera capture's yaw sign is the opposite of the live one
          if (q.ok && st === 'right' && caps.left && caps.left.src === 'cam' && Math.sign(q.yaw) === -Math.sign(caps.left.yaw)) { q.ok = false; q.issues.push('Bu aynı taraf, başını diğer yana çevir'); }
          if (q.ok && st === 'smile' && caps.front && face.mouthRatio(lm, ov.width, ov.height) < caps.front.mr * (okFrames > 0 ? 1.06 : 1.1)) { q.ok = false; q.issues.push('Dişlerin görünecek şekilde içten gülümse 😁'); }
          const cooling = performance.now() < coolUntil;
          if (q.ok && !cooling) okFrames++; else if (!q.ok) okFrames = Math.max(0, okFrames - 2);
          if (!cooling) setHint(q.ok ? (okFrames > 4 ? 'Çekiliyor 📸' : 'Sabit kal…') : q.issues[0], q.ok);
          og.classList.toggle('ok', okFrames > 2); shot.disabled = okFrames <= 2 && !q.ok;
          if (okFrames === 7) { vibrate(30); capture(grab()); }
        } else if (++miss >= 5) {
          // only give up after several consecutive missed frames (side views drop frames often)
          ctx.clearRect(0, 0, ov.width, ov.height); lastLm = null; yawS = null;
          setHint(face.lastError ? 'Hata: ' + face.lastError.slice(0, 80) : (st === 'left' || st === 'right') ? 'Yüzünü kaybettim, biraz daha az dön' : 'Yüzünü ovalin içine getir, ışığa dön', true);
          og.classList.remove('ok'); shot.disabled = true; okFrames = 0;
        }
      }
      requestAnimationFrame(loop);
    };
    onReject = (r) => { coolUntil = performance.now() + 1800; setHint(r, true); };
    requestAnimationFrame(loop);
    shot.onclick = () => { vibrate(30); capture(grab()); };
  },

  requizDone() {
    const last = S.scans.at(-1);
    if (last) { last.score = scoreAll(S.profile, S.answers, last.face); }
    S.plan = Object.assign(buildPlan(S.profile, S.answers, last?.face, last ? last.score : scoreAll(S.profile, S.answers, null)), { startedAt: S.plan.startedAt });
    save(); toast('Cevapların güncellendi, planın yenilendi'); go('analysis');
  },

  analyzing() {
    const steps = ['478 nokta haritalanıyor', 'Simetri ve oranlar ölçülüyor', 'Profil: çene, burun, dudak açıları', 'Gülümseme analiz ediliyor', 'Milimetre ölçüleri hesaplanıyor', 'Alışkanlıkların analiz ediliyor', 'Genel analiz raporun yazılıyor'];
    app.innerHTML = `<div class="screen"><div class="scanbox"><canvas id="pc"></canvas><div class="scanline"></div></div>
      <h2 class="center">Analiz ediliyor…</h2><ul class="steps" style="margin-top:18px">${steps.map((s) => `<li><i>✓</i>${s}</li>`).join('')}</ul></div>`;
    const pc = $('#pc');
    if (tmpScan && tmpScan.front) { const ts = tmpScan.front; pc.width = ts.canvas.width; pc.height = ts.canvas.height; const cx = pc.getContext('2d'); cx.drawImage(ts.canvas, 0, 0); face.drawMesh(cx, ts.lm, pc.width, pc.height, { step: 2, keypoints: true, lineWidth: 3 }); }
    const lis = document.querySelectorAll('.steps li');
    lis.forEach((li, i) => setTimeout(() => { li.classList.add('on'); vibrate(8); }, 650 * (i + 1)));
    setTimeout(() => go('results'), 650 * (steps.length + 1));
  },

  results() {
    const scan = S.scans[S.scans.length - 1];
    if (!scan) return go('scanIntro');
    const { score, face: f } = scan;
    const ins = insights(f, score, S.answers);
    const firstTime = !S.plan;
    app.innerHTML = `<div class="screen">
      <div class="kicker center" style="margin-top:10px">Yüz taraman hazır</div>
      <h2 class="center">${esc(S.profile.name)}, işte sonuçların</h2>
      ${tmpScan && tmpScan.front ? `<div class="shots" style="margin-top:18px">${STAGES.filter((x) => tmpScan[x.k]).map((x) => `<div><canvas data-shot="${x.k}"></canvas><span>${x.t}</span></div>`).join('')}</div>` : ''}
      <div class="card glow"><div class="rings">${ring(score.overall, 'Skorun', '#FF7A1F')}${ring(score.potential, 'Potansiyelin', '#2BD67B')}</div>
        <p class="center" style="font-size:13.5px;margin-top:8px">Planı 12 hafta uygularsan ulaşabileceğin tahmini skor: <b style="color:var(--good)">${score.potential}</b></p></div>
      <div class="card"><h3>Kategoriler</h3>${Object.entries(CATS).map(([k, c]) => bar(c.name, score.cats[k])).join('')}</div>
      <div class="card"><h3>Güçlü yönlerin</h3><div style="margin-top:8px">${ins.good.map((x) => `<span class="tag g">✓ ${esc(x)}</span>`).join('')}</div>
        <h3 style="margin-top:18px">Gelişim alanların</h3><div style="margin-top:8px">${ins.improve.length ? ins.improve.map((x) => `<span class="tag b">↑ ${esc(x)}</span>`).join('') : '<span class="mute">Belirgin zayıf alan yok, harika!</span>'}</div></div>
      ${f ? faceCard(f) : ''}
      ${reportHTML(f, score)}
      ${ins.lowMood ? `<div class="note">Son haftalarda kendini sık sık kötü hissettiğini söyledin. Bu çok insani ve yalnız değilsin. Bir psikolog veya psikiyatrla konuşmak gerçekten fark yaratır. Acil bir durumda 112'yi arayabilirsin.</div>` : ''}
      <div class="note">Skorlar yüz oranlarının ve alışkanlıklarının bilimsel referanslarla karşılaştırmasıdır; bir insanın değerini ölçmez. Çekicilik algısı kültüre ve kişiye göre değişir.</div>
      <div class="bottom"><button class="btn" id="next">${firstTime ? 'Kişisel planımı oluştur' : 'Plana dön'}</button></div></div>`;
    drawShots(); bindReport();
    requestAnimationFrame(() => document.querySelectorAll('.bar .bt i').forEach((i) => (i.style.width = i.dataset.w + '%')));
    $('#next').onclick = () => {
      if (firstTime) { S.plan = buildPlan(S.profile, S.answers, f, score); S.plan.startedAt = today(); }
      else { S.plan = Object.assign(buildPlan(S.profile, S.answers, f, score), { startedAt: S.plan.startedAt }); }
      save(); go(firstTime ? 'planReady' : 'today');
    };
  },

  planReady() {
    const P = S.plan;
    app.innerHTML = `<div class="screen"><div class="hero center"><div class="kicker">12 haftalık program</div>
      <h1>Senin için bir<br><span class="gtext">glow up planı</span><br>oluşturduk</h1><p style="margin-top:12px">Yüz taraman ve cevaplarına göre.</p></div>
      <div class="card"><h3>Odak alanların</h3>${P.focus.map((k, i) => `<div class="feat"><div class="fi">${i + 1}</div><div><b>${CATS[k].name}</b><span>${esc(P.modules.find((m) => m.key === k).why)}</span></div></div>`).join('')}</div>
      <div class="card"><h3>Nasıl işler?</h3><div class="feat"><div class="fi">◎</div><div><b>Her gün kısa görevler</b><span>Bugün sekmesinde seni bekleyen, zamanına göre ayarlanmış görevler.</span></div></div>
      <div class="feat"><div class="fi">↻</div><div><b>Haftalık yeniden tarama</b><span>Her hafta tekrar tara, skorunun yükselişini grafikte gör.</span></div></div>
      <div class="feat"><div class="fi">🔥</div><div><b>Seri</b><span>Alışkanlıkların otomatikleşmesi ortalama 66 gün sürer. Seriyi kırma.</span></div></div></div>
      <div class="bottom"><button class="btn" id="go">Başlayalım</button></div></div>`;
    $('#go').onclick = () => { vibrate(30); go('today'); };
  },

  today() {
    if (!S.plan) return go('welcome');
    const tasks = dailyTasks();
    const d = S.done[today()] || {};
    const doneN = tasks.filter((t) => d[t.id]).length;
    const pct = tasks.length ? Math.round((doneN / tasks.length) * 100) : 0;
    const wk = weekInfo();
    const weekly = allTasks().filter((t) => t.freq === 'weekly' && t.core);
    const groups = { sabah: 'Sabah', gün: 'Gün içinde', akşam: 'Akşam' };
    app.innerHTML = `<div class="screen">
      <div class="brandrow">${LOGO}</div>
      <div class="hello"><div><p style="font-size:14px">${greet()}</p><h2>${esc(S.profile.name)}</h2></div><div class="streak">🔥 ${streak()}</div></div>
      <div class="card glow dayprog">${ring(pct, 'Bugün', '#FF7A1F', 92)}<div><div class="kicker">Hafta ${wk.week} / 12</div><b style="font-size:17px">${doneN} / ${tasks.length} görev</b><p style="font-size:13px;margin-top:4px">${pct === 100 ? 'Bugünü tamamladın. Efsane! 🏆' : 'Her tik seni potansiyeline yaklaştırıyor.'}</p></div></div>
      <div class="card"><div class="week">${wk.days.map((x) => `<div class="${x.cls}">${x.l}<i>${x.cls === 'f' ? '✓' : ''}</i></div>`).join('')}</div></div>
      ${Object.entries(groups).map(([g, gl]) => { const ts = tasks.filter((t) => t.time === g); return ts.length ? `<div class="sec">${gl}</div>${ts.map((t) => taskHTML(t, d[t.id])).join('')}` : ''; }).join('')}
      ${weekly.length ? `<div class="sec">Bu hafta</div>${weekly.map((t) => taskHTML(t, weeklyDone(t), true)).join('')}` : ''}
      ${missingQ() ? `<div class="card glow" style="margin-top:14px"><div class="kicker">Yeni</div><b>Genel analizin için ${missingQ()} yeni soru</b><p style="font-size:13.5px;margin:6px 0 14px">Saç, sakal, diş, stres, beslenme ve daha fazlası. Cevaplarsan raporun ve planın kişiselleşir.</p><button class="btn" id="newq">Soruları cevapla</button></div>` : ''}
      ${rescanDue() ? `<div class="card glow" style="margin-top:14px"><div class="kicker">Haftalık kontrol</div><b>Yeniden tarama zamanı</b><p style="font-size:13.5px;margin:6px 0 14px">İlerlemeni ölçmek için yüzünü tekrar tara.</p><button class="btn" id="rescan">Şimdi tara</button></div>` : ''}
    </div>`;
    bindTasks();
    const rs = $('#rescan'); if (rs) rs.onclick = () => startScan();
    const nq = $('#newq'); if (nq) nq.onclick = () => { onlyMissing = true; const QL = QS(); qIndex = Math.max(0, QL.findIndex((q) => S.answers[q.id] === undefined)); go('quiz'); };
  },

  plan() {
    const P = S.plan;
    const wk = weekInfo().week;
    const phases = [
      { w: '1–4', t: 'Temel', d: 'Cilt rutini, uyku düzeni, ilk antrenmanlar ve sosyal ısınma.' },
      { w: '5–8', t: 'İvme', d: 'Ağırlıkları artır, stilini yenile, sosyal görevleri büyüt.' },
      { w: '9–12', t: 'Dönüşüm', d: 'Alışkanlıklar otomatik. Sonuçlar görünür, skor yükselir.' },
    ];
    const cur = wk <= 4 ? 0 : wk <= 8 ? 1 : 2;
    app.innerHTML = `<div class="screen"><h2 style="margin:10px 0 6px">Planın</h2><p style="margin-bottom:16px">Zayıf alanlarından başlayarak sıralandı.</p>
      <div class="phase">${phases.map((p, i) => `<div class="${i === cur ? 'cur' : ''}"><div class="kicker">Hafta ${p.w}</div><b>${p.t}</b><span>${p.d}</span></div>`).join('')}</div>
      ${P.modules.map((m) => `<div class="mod"><h3>${CATS[m.key].icon} ${esc(m.title)} <span class="pill">${S.scans.length ? S.scans[S.scans.length - 1].score.cats[m.key] : ''}</span></h3>
        <p class="why">${esc(m.why)}</p>${m.src ? `<p class="src">Kaynak: ${srcLink(m.src)}</p>` : ''}
        ${m.tasks.map((t) => `<div class="task" data-info="${t.id}" style="background:var(--card2)"><div><div class="tt">${esc(t.title)}</div><div class="meta">${t.freq === 'weekly' ? (t.perWeek ? `HAFTADA ${t.perWeek}×` : 'HAFTALIK') : 'HER GÜN'}${t.mins ? ` · ${t.mins} DK` : ''}${t.src ? ' · 📚 KANITLI' : ''}${t.prod && t.prod.length ? ' · 🛒' : ''}</div></div></div>`).join('')}</div>`).join('')}
      ${shopHTML(P)}
      <div class="mod"><h3>📚 Bilimsel kaynaklar</h3><p class="why">Her kaynağa dokununca makalenin orijinal sayfası açılır.</p><ul class="list" style="margin-top:12px">${Object.keys(SOURCES).map((k) => `<li><a class="slink" href="${SOURCES[k].url}">${esc(SOURCES[k].t)}</a><br><span class="sn">${esc(SOURCES[k].n)}</span></li>`).join('')}</ul></div></div>`;
    document.querySelectorAll('[data-info]').forEach((el) => (el.onclick = () => showTask(el.dataset.info)));
  },

  analysis() {
    const last = S.scans[S.scans.length - 1];
    if (!last) return go('scanIntro');
    const hist = S.scans.slice(-8);
    const first = S.scans[0];
    const diff = last.score.overall - first.score.overall;
    app.innerHTML = `<div class="screen"><h2 style="margin:10px 0 16px">Analiz</h2>
      <div class="card glow"><div class="rings">${ring(last.score.overall, 'Şu an', '#FF7A1F')}${ring(last.score.potential, 'Potansiyel', '#2BD67B')}</div>
      <p class="center" style="margin-top:8px;font-size:14px">${S.scans.length > 1 ? `İlk taramadan bu yana <b style="color:${diff >= 0 ? 'var(--good)' : 'var(--bad)'}">${diff >= 0 ? '+' : ''}${diff}</b> puan` : 'İlerlemeni görmek için her hafta yeniden tara.'}</p></div>
      ${hist.length > 1 ? `<div class="card"><h3>Skor geçmişi</h3><div class="chart">${hist.map((h) => `<div style="height:${Math.max(6, h.score.overall)}%"><span>${h.score.overall}</span></div>`).join('')}</div><div class="chartx">${hist.map((h) => `<span>${h.date.slice(8, 10)}.${h.date.slice(5, 7)}</span>`).join('')}</div></div>` : ''}
      <div class="card"><h3>Kategoriler</h3>${Object.entries(CATS).map(([k, c]) => bar(c.name, last.score.cats[k])).join('')}</div>
      ${last.face ? faceCard(last.face) : ''}
      ${reportHTML(last.face, last.score)}
      <button class="btn" id="rescan">Yeniden tara</button>
      <button class="btn ghost" id="requiz" style="margin-top:10px">Soruları yeniden cevapla</button></div>`;
    requestAnimationFrame(() => document.querySelectorAll('.bar .bt i').forEach((i) => (i.style.width = i.dataset.w + '%')));
    bindReport();
    $('#rescan').onclick = () => startScan();
    $('#requiz').onclick = () => { qIndex = 0; go('quiz'); };
  },

  me() {
    const p = S.profile; const bmi = bmiOf(p);
    const total = Object.values(S.done).reduce((s, d) => s + Object.values(d).filter(Boolean).length, 0);
    app.innerHTML = `<div class="screen"><h2 style="margin:10px 0 16px">Profil</h2>
      <div class="card"><div class="logo" style="font-size:20px"><b>${esc((p.name || 'A')[0].toUpperCase())}</b>${esc(p.name)}</div>
      <div class="metric" style="margin-top:12px"><span>Yaş</span><span class="mv">${esc(p.age)}</span></div>
      <div class="metric"><span>Boy / Kilo</span><span class="mv">${esc(p.height)} cm · ${esc(p.weight)} kg</span></div>
      <div class="metric"><span>Vücut kitle indeksi</span><span class="mv">${bmi ? bmi.toFixed(1) : '-'}</span></div>
      <div class="metric"><span>Tamamlanan görev</span><span class="mv">${total}</span></div>
      <div class="metric"><span>En uzun seri</span><span class="mv">🔥 ${streak()}</span></div></div>
      <div class="field"><label>Kilonu güncelle (kg)</label><input id="w" type="number" inputmode="numeric" value="${esc(p.weight)}"></div>
      <button class="btn ghost" id="savew">Kaydet</button>
      <div class="note" style="margin-top:18px">AlperUp tıbbi tavsiye vermez. Cilt hastalıkları, kilo sorunları veya ruh sağlığı için bir uzmana danış.</div>
      <button class="btn ghost" id="reset" style="margin-top:10px;color:var(--bad)">Tüm verileri sil ve baştan başla</button>
      <div class="rsec devsec" style="margin-top:18px"><button class="rh"><span>👨‍💻 Geliştirici</span><i>⌄</i></button><div class="rb">
        <div class="devhead"><img src="img/dev.webp" alt="Yusuf Alper"><div><b>Yusuf Alper</b><span>AlperUp'ı tasarlayan ve geliştiren kişi</span></div></div>
        <p>Bursa doğumlu. 2017'den beri yazılımla uğraşıyor; siber güvenlik, RF ve donanım Ar-Ge, yazılım geliştirme alanlarında çalışıyor. Afyon Kocatepe Üniversitesi Uluslararası Ticaret ve Finansman bölümünde okuyor.</p>
        <div class="devstats"><div><b>2017</b><span>Yazılıma ilk adım</span></div><div><b>30</b><span>Resmi sertifika</span></div><div><b>9</b><span>Programlama dili</span></div><div><b>4</b><span>Donanım projesi</span></div></div>
        <div class="devtags"><span>Python</span><span>C/C++</span><span>JavaScript</span><span>Kotlin</span><span>Java</span><span>Kali Linux</span><span>ESP32-S3</span></div>
        <div class="devlinks"><a href="https://www.yusufalper.com.tr">🌐 Web sitesi</a><a href="https://www.instagram.com/yyusufalp32">Instagram</a><a href="https://github.com/YasuoBey32">GitHub</a><a href="https://t.me/yyusufalp32">Telegram</a></div>
        <p class="devnote">AlperUp; yüz analizi, kişiye özel plan motoru ve bilimsel kaynak sistemiyle Türkiye için geliştirildi. 🇹🇷</p>
      </div></div>
      <p class="center" style="font-size:12px;margin-top:14px">AlperUp v1.3.0 · Geliştiren: Yusuf Alper<br>Verilerin yalnızca bu cihazda saklanır.</p></div>`;
    document.querySelectorAll('.devsec .rh').forEach((b) => (b.onclick = () => b.parentElement.classList.toggle('open')));
    $('#savew').onclick = () => { p.weight = $('#w').value; S.plan = Object.assign(buildPlan(p, S.answers, S.scans.at(-1)?.face, scoreAll(p, S.answers, S.scans.at(-1)?.face)), { startedAt: S.plan.startedAt }); save(); toast('Kaydedildi, planın güncellendi'); };
    $('#reset').onclick = () => { if (confirm('Tüm verilerin silinecek. Emin misin?')) { localStorage.removeItem(KEY); location.reload(); } };
  },
};

// ------------------------------------------------------------------ helpers
async function fileCanvas(file) {
  if (!file) return null;
  face = face || (await import('./face.js'));
  toast('Fotoğraf işleniyor…');
  await face.initFace();
  const img = new Image(); img.src = URL.createObjectURL(file); await img.decode();
  const sc = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = img.width * sc; c.height = img.height * sc;
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

// Detect + validate one capture for a stage. Returns true or an error message.
async function processCanvas(c, k, src = 'cam') {
  const lm = await face.detectImage(c);
  if (!lm) return face.lastError ? 'Hata: ' + face.lastError.slice(0, 80) : 'Yüz bulunamadı, yüzün net göründüğü bir kare dene';
  const q = face.quality(lm, c.width, c.height, k);
  if ((k === 'front' || k === 'smile') && Math.abs(q.yaw2d) > 0.08) return 'Yüz tam karşıdan görünmüyor, tekrar dene';
  if ((k === 'left' || k === 'right') && Math.abs(q.yaw) < 14) return 'Başın yeterince yana dönük değil (~45° olmalı)';
  if (k === 'right' && caps.left && Math.sign(q.yaw) === Math.sign(caps.left.yaw)) return 'Bu, ilk yan çekimle aynı taraf. Diğer tarafa dön.';
  const mr = face.mouthRatio(lm, c.width, c.height);
  if (k === 'smile' && caps.front && mr < caps.front.mr * 1.08) return 'Gülümseme algılanmadı, dişlerin görünecek şekilde gülümse';
  caps[k] = { lm, w: c.width, h: c.height, yaw: q.yaw, mr, src };
  // crop to face for display
  const xs = lm.map((p) => p.x * c.width), ys = lm.map((p) => p.y * c.height);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cw = Math.max(x1 - x0, (y1 - y0) * 0.75) * 1.5, ch = cw * 4 / 3, cx0 = (x0 + x1) / 2 - cw / 2, cy0 = (y0 + y1) / 2 - ch / 2;
  const out = document.createElement('canvas'); out.width = 450; out.height = 600;
  const oc = out.getContext('2d'); oc.fillStyle = '#000'; oc.fillRect(0, 0, 450, 600);
  oc.drawImage(c, cx0, cy0, cw, ch, 0, 0, 450, 600);
  tmpScan[k] = { canvas: out, lm: lm.map((p) => ({ x: (p.x * c.width - cx0) / cw, y: (p.y * c.height - cy0) / ch })) };
  return true;
}

function finalizeScan() {
  if (!caps.front) { toast('Önden çekim gerekli'); stage = 0; return go('scan'); }
  const f = face.analyzeAll(caps, S.profile);
  const score = scoreAll(S.profile, S.answers, f);
  S.scans.push({ date: today(), face: f, score });
  if (S.scans.length > 30) S.scans.splice(0, S.scans.length - 30);
  caps = {};
  save(); go('analyzing');
}

function drawShots() {
  document.querySelectorAll('[data-shot]').forEach((cv) => {
    const ts = tmpScan && tmpScan[cv.dataset.shot]; if (!ts) return;
    cv.width = ts.canvas.width; cv.height = ts.canvas.height;
    const cx = cv.getContext('2d'); cx.drawImage(ts.canvas, 0, 0);
    face.drawMesh(cx, ts.lm, cv.width, cv.height, { step: 4, keypoints: cv.dataset.shot === 'front', lineWidth: 2 });
  });
}

const srcLink = (k) => (SOURCES[k] ? `<a class="slink" href="${SOURCES[k].url}">${esc(SOURCES[k].t)}</a>` : '');
const prodHTML = (id) => { const p = PRODUCTS[id]; if (!p) return ''; return `<a class="prod" href="${trendyol(p.q)}"><div><b>${esc(p.n)}</b><span>Örnek: ${esc(p.q)} · ${esc(p.why)}</span></div><em>Trendyol ›</em></a>`; };

function shopHTML(plan) {
  const L = shoppingList(plan);
  if (!L.length) return '';
  return `<div class="mod"><h3>🛒 Alışveriş listen</h3><p class="why">Planındaki görevler için önerilen ürün türleri. Linkler Trendyol'da arama sonucunu açar; aynı içerikteki başka markalar da olur. Reklam veya ortaklık yok.</p>${L.map((p) => prodHTML(p.id)).join('')}</div>`;
}

function reportHTML(f, score) {
  const R = report(S.profile, S.answers, f && f.front != null ? f : null, score);
  return `<div class="card rep"><h3>📋 Genel analiz raporun</h3><p style="font-size:13px;margin:4px 0 6px">Cevapların ve yüz taramana göre. Başlığa dokunarak aç/kapat.</p>
    ${R.map((sec, i) => `<div class="rsec ${i < 2 ? 'open' : ''}"><button class="rh"><span>${sec.icon} ${esc(sec.title)}</span><i>⌄</i></button><div class="rb">${sec.paras.map((p) => `<p>${esc(p.text)}${p.src && SOURCES[p.src] ? `<a class="cite" href="${SOURCES[p.src].url}">📚 ${esc(SOURCES[p.src].t.split('(')[0].trim())} (${esc((SOURCES[p.src].t.match(/\((\d{4})\)/) || [])[1] || '')})</a>` : ''}</p>`).join('')}</div></div>`).join('')}</div>`;
}
function bindReport() { document.querySelectorAll('.rsec .rh').forEach((b) => (b.onclick = () => { vibrate(); b.parentElement.classList.toggle('open'); })); }

function missingQ() { return QS().filter((q) => S.answers[q.id] === undefined).length; }

function stopCam() { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } }

function ring(v, label, color, size = 132) {
  const r = size / 2 - 9, C = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="#26262B" stroke-width="10" fill="none"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - v / 100)}" style="transition:stroke-dashoffset 1s"/></svg>
    <div class="rv"><div><b style="${size < 120 ? 'font-size:26px' : ''}">${v}</b><span>${label}</span></div></div></div>`;
}
function colorFor(v) { return v >= 75 ? 'linear-gradient(90deg,#1FB86A,#2BD67B)' : v >= 55 ? 'var(--grad)' : 'linear-gradient(90deg,#E0303F,#FF4D5E)'; }
function bar(name, v) { return `<div class="bar"><div class="bl"><span>${name}</span><span>${v}</span></div><div class="bt"><i data-w="${v}" style="width:0;background:${colorFor(v)}"></i></div></div>`; }

function faceCard(f) {
  if (f.front == null) return `<div class="card"><h3>Yüz analizi <span class="pill" style="float:right">${f.harmony}</span></h3><p class="mnote" style="margin-top:8px">Bu tarama eski sürümle yapıldı. Önden, iki yandan ve gülümseyerek yapılan geniş analiz için "Yeniden tara"ya dokun.</p></div>`;
  const r = f.raw, s = f.scores, mm = f.mm;
  const shapeN = { oval: 'Oval', kare: 'Kare', yuvarlak: 'Yuvarlak', uzun: 'Uzun', kalp: 'Kalp' }[f.shape];
  const col = (v) => (v >= 75 ? 'var(--good)' : v >= 55 ? 'var(--a2)' : 'var(--bad)');
  const row = ([n, v, d]) => `<div class="metric"><div>${n}<small>${d}</small></div><div class="mv" style="color:${v == null ? 'var(--text)' : col(v)}">${v == null ? '' : v}</div></div>`;
  const F = [
    ['Simetri', s.symmetry, `Sapma: %${r.asymmetryPct}. Hiçbir yüz %100 simetrik değildir.`],
    ['Dikey oranlar', s.thirds, `Orta/alt yüz oranı ${r.thirdsRatio} (ideal ≈ 1,00)`],
    ['Dudak–çene oranı', s.lipChin, `${r.lipChin} (ideal ≈ 2,0)`],
    ['Göz aralığı', s.fifths, `Göz arası / göz genişliği ${r.fifthsRatio} (ideal ≈ 1,0–1,2)`],
    ['Göz bölgesi', s.eyes, `Kantal eğim ${r.canthalDeg > 0 ? '+' : ''}${r.canthalDeg}° ${r.canthalDeg > 2 ? '(pozitif ✓)' : r.canthalDeg < -2 ? '(negatif)' : '(nötr)'}`],
    ['Göz bebeği mesafesi', s.ipd, `Yüz genişliğinin %${Math.round(r.ipdRatio * 100)}'i (en çekici ≈ %46)`],
    ['Çene hattı (önden)', s.jaw, `Çene/elmacık genişliği ${r.jawRatio}, açı ${r.jawAngle}°`],
    ['Burun uyumu', s.nose, `Burun / göz arası ${r.noseRatio} (ideal ≈ 1,0–1,1)`],
    ['Ağız–burun oranı', s.mouth, `Ağız / burun genişliği ${r.mouthNose} (klasik ≈ 1,5)`],
  ];
  const p = f.profile;
  const PR = p ? [
    ['Profil konveksliği', p.scores.convexity, `${p.convexity}° (bu ölçümde dengeli aralık ≈ 15–22°)`],
    ['Çene ucu konumu', p.scores.chin, `Burun kökü dikeyinin ${Math.abs(p.chinProj)} mm ${p.chinProj < 0 ? 'gerisinde' : 'önünde'}`],
    ['Çene köşesi (gonial) açısı', p.scores.gonial, `≈ ${p.gonial}° · çene uzunluğu ≈ ${p.jawLen} mm`],
    ['E-çizgisi (dudak konumu)', p.scores.eline, `Üst dudak ${p.eUpper} mm, alt dudak ${p.eLower} mm`],
    ['Nazolabiyal açı', p.scores.nasolabial, `${p.nasolabial}° (erkek ≈ 90–110°, kadın ≈ 100–120°)`],
    ['Burun projeksiyonu', p.scores.nose, `Goode oranı ${p.goode}`],
  ] : [];
  const SM = f.smile ? [
    ['Gülümseme genişliği', null, `Ağız %${Math.round((f.smile.widen - 1) * 100)} genişliyor`],
    ['Gülümseme simetrisi', Math.max(0, 100 - f.smile.asymPct), `Köşeler arası fark %${f.smile.asymPct}`],
    ['Gözlerle gülümseme', f.smile.duchenne ? 100 : 50, f.smile.duchenne ? 'Evet, Duchenne gülümsemesi ✓' : 'Gözlere az yansıyor'],
  ] : [];
  const MM = mm ? [
    ['Göz bebekleri arası', null, `${mm.ipd} mm`], ['Yüz genişliği', null, `${mm.faceW} mm`], ['Yüz yüksekliği (alın–çene)', null, `${mm.faceH} mm`],
    ['Çene genişliği', null, `${mm.jawW} mm · çene ucu ${mm.chinW} mm`], ['Burun genişliği', null, `${mm.noseW} mm`], ['Ağız genişliği', null, `${mm.mouthW} mm`],
    ['Filtrum (burun–dudak)', null, `${mm.philtrum} mm`], ['Çene yüksekliği', null, `${mm.chinH} mm`], ['Dudaklar (üst / alt)', null, `${mm.upperLip} / ${mm.lowerLip} mm`],
    ['Göz genişliği / göz arası', null, `${mm.eyeW} / ${mm.interCanthal} mm`], ['Kaş–göz mesafesi', null, `${mm.browEye} mm`],
  ] : [];
  const sub = (t, rows, extra = '') => (rows.length ? `<div class="msec">${t}</div>${extra}${rows.map(row).join('')}` : '');
  return `<div class="card"><h3>Geniş yüz analizi <span class="pill" style="float:right">${f.harmony}</span></h3>
    <p style="font-size:13px;margin:6px 0 4px">Yüz şekli: <b style="color:var(--text)">${shapeN}</b> · fWHR ${r.fwhr} · ${(f.shots || ['front']).length} çekim</p>
    ${sub(`Önden · ${f.front ?? f.harmony}`, F)}
    ${p ? sub(`Profil · ${p.total}`, PR, `<p class="mnote">Yan çekimlerin 3B olarak önden çekime hizalanıp ölçüldü (${p.angles.map((a) => Math.abs(a) + '°').join(', ')}). Değerler tahminidir.</p>`) : `<div class="msec">Profil</div><p class="mnote">Yan çekim yapılmadı. Yeniden taramada sağ ve sol çekimleri yaparsan çene ucu, çene köşesi açısı ve dudak–burun açıları da ölçülür.</p>`}
    ${sub(`Gülümseme${f.smile ? ' · ' + f.smile.score : ''}`, SM)}
    ${sub('Ölçüler (iris çapına göre, ±%5–10)', MM)}</div>`;
}

function allTasks() { return S.plan.modules.flatMap((m) => m.tasks); }
function dailyTasks() { return allTasks().filter((t) => t.freq === 'daily' && t.core); }
function weekStart(d = new Date()) { const x = new Date(d); const k = (x.getDay() + 6) % 7; x.setDate(x.getDate() - k); x.setHours(12); return x; }
function weeklyDone(t) {
  const ws = weekStart(); let n = 0;
  for (let i = 0; i < 7; i++) { const x = new Date(ws); x.setDate(ws.getDate() + i); if ((S.done[dayKey(x)] || {})[t.id]) n++; }
  return t.perWeek ? n >= t.perWeek : n >= 1;
}
function weeklyCount(t) { const ws = weekStart(); let n = 0; for (let i = 0; i < 7; i++) { const x = new Date(ws); x.setDate(ws.getDate() + i); if ((S.done[dayKey(x)] || {})[t.id]) n++; } return n; }
function dayPct(k) { const d = S.done[k] || {}; const ts = dailyTasks(); return ts.length ? ts.filter((t) => d[t.id]).length / ts.length : 0; }
function streak() { let n = 0; const x = new Date(); x.setHours(12); if (dayPct(dayKey(x)) < 0.6) x.setDate(x.getDate() - 1); while (dayPct(dayKey(x)) >= 0.6) { n++; x.setDate(x.getDate() - 1); } return n; }
function weekInfo() {
  const start = new Date((S.plan.startedAt || today()) + 'T12:00:00');
  const week = Math.min(12, Math.floor((Date.now() - start) / 6048e5) + 1);
  const ws = weekStart(); const L = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  const days = L.map((l, i) => { const x = new Date(ws); x.setDate(ws.getDate() + i); const k = dayKey(x); const p = dayPct(k); return { l, cls: k === today() ? (p >= 0.6 ? 'f t' : 't') : p >= 0.6 ? 'f' : p > 0 ? 'p' : '' }; });
  return { week, days };
}
function rescanDue() { const last = S.scans.at(-1); return !last || (Date.now() - new Date(last.date + 'T12:00:00')) / 864e5 >= 7; }
function greet() { const h = new Date().getHours(); return h < 12 ? 'Günaydın ☀️' : h < 18 ? 'İyi günler 👋' : 'İyi akşamlar 🌙'; }

function taskHTML(t, done, weekly) {
  const meta = weekly && t.perWeek ? `${weeklyCount(t)} / ${t.perWeek} BU HAFTA` : (t.mins ? `${t.mins} DK` : 'ALIŞKANLIK');
  return `<div class="task ${done ? 'done' : ''}" data-t="${t.id}"><div class="ck">${done ? '✓' : ''}</div><div style="flex:1" data-info="${t.id}"><div class="tt">${esc(t.title)}</div><div class="td">${esc(t.detail.length > 90 ? t.detail.slice(0, 88) + '…' : t.detail)}</div><div class="meta">${CATS[t.module].name.toUpperCase()} · ${meta}</div></div></div>`;
}
function bindTasks() {
  document.querySelectorAll('.task .ck').forEach((ck) => (ck.onclick = (e) => {
    e.stopPropagation();
    const id = ck.parentElement.dataset.t; const d = (S.done[today()] ||= {});
    d[id] = !d[id]; vibrate(d[id] ? 25 : 8); save(); render();
    const ts = dailyTasks(); if (d[id] && ts.every((t) => d[t.id])) toast('🏆 Bugünü tamamladın!');
  }));
  document.querySelectorAll('[data-info]').forEach((el) => (el.onclick = () => showTask(el.dataset.info)));
}
function showTask(id) {
  const t = allTasks().find((x) => x.id === id); if (!t) return;
  const sh = $('#sheet');
  sh.innerHTML = `<div class="in"><div class="grab"></div><div class="kicker">${CATS[t.module].name}</div><h2>${esc(t.title)}</h2>
    <p style="margin:12px 0;color:#D8D8DE;font-size:15.5px">${esc(t.detail)}</p>
    ${t.src && SOURCES[t.src] ? `<div class="note"><b>📚 Bilimsel not</b><br>${esc(SOURCES[t.src].n)}<br><a class="slink" href="${SOURCES[t.src].url}">${esc(SOURCES[t.src].t)}</a></div>` : ''}
    ${t.prod && t.prod.length ? `<div class="msec" style="margin-top:14px">Önerilen ürünler</div>${t.prod.map(prodHTML).join('')}<p class="mnote">Linkler Trendyol'da arama sonuçlarını açar. Reklam veya ortaklık yok.</p>` : ''}
    <button class="btn ghost" id="cl" style="margin-top:12px">Kapat</button></div>`;
  sh.classList.remove('hidden');
  const close = () => sh.classList.add('hidden');
  $('#cl').onclick = close; sh.onclick = (e) => { if (e.target === sh) close(); };
}

// boot
if (S.plan && !['today', 'plan', 'analysis', 'me'].includes(S.step)) S.step = 'today';
if (!S.plan && ['scan', 'analyzing', 'results'].includes(S.step)) S.step = 'scanIntro';
if (S.step === 'quiz') { const QL = QS(); const i = QL.findIndex((q) => S.answers[q.id] === undefined); qIndex = i < 0 ? QL.length - 1 : i; }
render();
