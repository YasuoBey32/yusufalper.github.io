// AlperUp — on-device face analysis (MediaPipe Face Landmarker, 478 points)
// Multi-angle: front (neutral), two 3/4 side views, front smile.
import { FaceLandmarker, FilesetResolver } from '../vendor/vision_bundle.js';

let landmarker = null;
let mode = null;
export let delegateUsed = '';
export let lastError = '';
export let lastPose = null; // {yaw, pitch, roll} in degrees from the facial transformation matrix
const work = document.createElement('canvas');
const wctx = work.getContext('2d', { willReadFrequently: true });
// Copy any frame (video/canvas/img) to plain pixels; avoids WebGL texture paths that fail in some WebViews.
function pixels(src, maxSide) {
  const sw = src.videoWidth || src.naturalWidth || src.width, sh = src.videoHeight || src.naturalHeight || src.height;
  if (!sw || !sh) return null;
  const k = Math.min(1, maxSide / Math.max(sw, sh));
  const w = Math.round(sw * k), h = Math.round(sh * k);
  if (work.width !== w || work.height !== h) { work.width = w; work.height = h; }
  wctx.drawImage(src, 0, 0, w, h);
  return wctx.getImageData(0, 0, w, h);
}

export async function initFace() {
  if (landmarker) return landmarker;
  const fileset = await FilesetResolver.forVisionTasks('vendor/wasm');
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: 'models/face_landmarker.task', delegate },
    runningMode: 'IMAGE',
    numFaces: 1,
    minFaceDetectionConfidence: 0.3,
    minFacePresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
  });
  // CPU delegate: the GPU path silently returns no faces on many Android WebViews.
  try {
    landmarker = await FaceLandmarker.createFromOptions(fileset, opts('CPU'));
    delegateUsed = 'CPU';
  } catch (e) {
    landmarker = await FaceLandmarker.createFromOptions(fileset, opts('GPU'));
    delegateUsed = 'GPU';
  }
  mode = 'IMAGE';
  return landmarker;
}

async function setMode(m) {
  if (mode !== m) { await landmarker.setOptions({ runningMode: m }); mode = m; }
}

function poseFrom(r) {
  const M = r.facialTransformationMatrixes && r.facialTransformationMatrixes[0];
  if (!M || !M.data) return null;
  const m = M.data; // column-major 4x4; element(row,col) = m[col*4+row]
  const R = (r_, c) => m[c * 4 + r_];
  const yaw = (Math.atan2(R(0, 2), R(2, 2)) * 180) / Math.PI;
  const pitch = (Math.asin(Math.max(-1, Math.min(1, -R(1, 2)))) * 180) / Math.PI;
  const roll = (Math.atan2(R(1, 0), R(1, 1)) * 180) / Math.PI;
  return { yaw, pitch, roll };
}

function take(r) {
  lastError = '';
  const lm = r.faceLandmarks && r.faceLandmarks[0] ? r.faceLandmarks[0] : null;
  lastPose = lm ? poseFrom(r) : null;
  return lm;
}

export async function detectVideo(video, ts) {
  try {
    await setMode('VIDEO');
    const px = pixels(video, 640); if (!px) return null;
    return take(landmarker.detectForVideo(px, ts));
  } catch (e) { lastError = String(e && e.message || e); console.error(e); return null; }
}

export async function detectImage(source) {
  try {
    await setMode('IMAGE');
    let r = landmarker.detect(pixels(source, 1280));
    if (!(r.faceLandmarks && r.faceLandmarks[0])) r = landmarker.detect(pixels(source, 640)); // retry smaller
    return take(r);
  } catch (e) { lastError = String(e && e.message || e); console.error(e); return null; }
}

// ---------- geometry helpers ----------
const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const closeness = (v, ideal, tol) => clamp(100 - (Math.abs(v - ideal) / tol) * 100);
const rangeScore = (v, lo, hi, tol) => (v >= lo && v <= hi ? 100 : clamp(100 - ((v < lo ? lo - v : v - hi) / tol) * 100));
const deg = (r) => (r * 180) / Math.PI;
const angleAt = (a, b, c) => { // angle ABC in degrees (2D, any keys x/y)
  const v1 = { x: a.x - b.x, y: a.y - b.y }, v2 = { x: c.x - b.x, y: c.y - b.y };
  const cos = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y) || 1);
  return deg(Math.acos(Math.max(-1, Math.min(1, cos))));
};
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;

// Convert normalized landmarks to pixel space, undo yaw (3D) and roll so the eye line is horizontal.
function normalize(lm, w, h) {
  let P = lm.map((p) => ({ x: p.x * w, y: p.y * h, z: (p.z || 0) * w }));
  const a = P[234], b = P[454];
  const yawA = Math.atan2(b.z - a.z, b.x - a.x);
  const cy = Math.cos(-yawA), sy = Math.sin(-yawA);
  const c0 = mid(P[234], P[454]); const cz = (P[234].z + P[454].z) / 2;
  P = P.map((p) => ({ x: c0.x + (p.x - c0.x) * cy - (p.z - cz) * sy, y: p.y, z: cz + (p.x - c0.x) * sy + (p.z - cz) * cy }));
  const L = P[33], R = P[263];
  const ang = Math.atan2(R.y - L.y, R.x - L.x);
  const c = Math.cos(-ang), s = Math.sin(-ang);
  const o = mid(L, R);
  return {
    pts: P.map((p) => ({ x: (p.x - o.x) * c - (p.y - o.y) * s, y: (p.x - o.x) * s + (p.y - o.y) * c, z: p.z })),
    roll: deg(ang),
    yawDeg: deg(yawA),
  };
}

// Pixel size of the iris (horizontal visible iris diameter ≈ 11.7 mm in adults) → mm per pixel
function mmPerPx(lm, w, h) {
  const P = lm.map((p) => ({ x: p.x * w, y: p.y * h }));
  if (lm.length < 478) return null;
  const a = d(P[469], P[471]), b = d(P[474], P[476]);
  const iris = (a + b) / 2;
  return iris > 2 ? 11.7 / iris : null;
}

const PAIRS = [
  [33, 263], [133, 362], [159, 386], [145, 374], [70, 300], [105, 334], [107, 336],
  [61, 291], [40, 270], [91, 321], [234, 454], [93, 323], [132, 361], [58, 288],
  [172, 397], [136, 365], [149, 378], [50, 280], [116, 345], [129, 358], [98, 327],
];

// ---------- capture quality ----------
export function quality(lm, w, h, target = 'front', loose = false, yawOverride = null) {
  const { roll } = normalize(lm, w, h);
  const pts = lm.map((p) => ({ x: p.x * w, y: p.y * h }));
  const faceW = d(pts[234], pts[454]);
  const nose = pts[1];
  const eyeMid = mid(pts[33], pts[263]);
  const yaw2d = (nose.x - eyeMid.x) / faceW; // ~0 when frontal
  const yaw = yawOverride != null ? yawOverride : (lastPose ? lastPose.yaw : yaw2d * 120);
  const faceFrac = Math.max(...lm.map((p) => p.y)) - Math.min(...lm.map((p) => p.y));
  const issues = [];
  if (target === 'front' || target === 'smile') {
    if (Math.abs(yaw2d) > 0.06) issues.push('Başını hafifçe çevirmişsin, kameraya düz bak');
    if (Math.abs(roll) > 12) issues.push('Başın yana eğik, düz tut');
  } else {
    if (Math.abs(yaw) < (loose ? 14 : 20)) issues.push('Başını yavaşça yana çevir (yaklaşık 45°)');
    else if (Math.abs(yaw) > (loose ? 70 : 60)) issues.push('Biraz fazla döndün, azıcık geri gel');
  }
  if (faceFrac < (loose ? 0.27 : 0.32)) issues.push('Biraz yaklaş');
  if (faceFrac > (loose ? 0.96 : 0.92)) issues.push('Biraz uzaklaş');
  return { ok: issues.length === 0, issues, yaw, yaw2d, roll };
}

export function mouthRatio(lm, w, h) { const { pts: P } = normalize(lm, w, h); return d(P[61], P[291]) / d(P[234], P[454]); }

// ---------- 3D alignment of a side view onto the front reference ----------
const IDX = Array.from({ length: 468 }, (_, i) => i);
function cloud(lm, w, h) {
  const P = IDX.map((i) => ({ x: lm[i].x * w, y: lm[i].y * h, z: (lm[i].z || 0) * w }));
  const c = P.reduce((s, p) => ({ x: s.x + p.x / P.length, y: s.y + p.y / P.length, z: s.z + p.z / P.length }), { x: 0, y: 0, z: 0 });
  const Q = P.map((p) => ({ x: p.x - c.x, y: p.y - c.y, z: p.z - c.z }));
  const rms = Math.sqrt(Q.reduce((s, p) => s + p.x * p.x + p.y * p.y + p.z * p.z, 0) / Q.length);
  return { Q: Q.map((p) => ({ x: p.x / rms, y: p.y / rms, z: p.z / rms })), rms };
}
function rot(p, yaw, pitch, roll) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
  let x = p.x * cy + p.z * sy, z = -p.x * sy + p.z * cy, y = p.y; // yaw about y
  let y2 = y * cp - z * sp; z = y * sp + z * cp; y = y2;              // pitch about x
  const x2 = x * cr - y * sr; y = x * sr + y * cr; x = x2;           // roll about z
  return { x, y, z };
}
function alignErr(S, Rf, a) {
  let e = 0;
  for (let i = 0; i < S.length; i += 2) { const p = rot(S[i], a[0], a[1], a[2]), q = Rf[i]; e += (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2; }
  return e;
}
function alignTo(S, Rf) {
  let best = [0, 0, 0], be = Infinity;
  for (let yd = -90; yd <= 90; yd += 5) { const a = [yd * Math.PI / 180, 0, 0]; const e = alignErr(S, Rf, a); if (e < be) { be = e; best = a; } }
  let step = 4 * Math.PI / 180;
  while (step > 0.1 * Math.PI / 180) {
    let improved = false;
    for (let k = 0; k < 3; k++) for (const sgn of [-1, 1]) {
      const a = best.slice(); a[k] += sgn * step; const e = alignErr(S, Rf, a);
      if (e < be) { be = e; best = a; improved = true; }
    }
    if (!improved) step /= 2;
  }
  return { Q: S.map((p) => rot(p, best[0], best[1], best[2])), yawDeg: deg(best[0]), err: Math.sqrt(be / (S.length / 2)) };
}
// Front reference: undo yaw/roll so the face is frontal and upright
function frontRef(lm, w, h) {
  const n = normalize(lm, w, h).pts;
  const fake = n.map((p) => ({ x: p.x, y: p.y, z: p.z }));
  const P = IDX.map((i) => fake[i]);
  const c = P.reduce((s, p) => ({ x: s.x + p.x / P.length, y: s.y + p.y / P.length, z: s.z + p.z / P.length }), { x: 0, y: 0, z: 0 });
  const Q = P.map((p) => ({ x: p.x - c.x, y: p.y - c.y, z: p.z - c.z }));
  const rms = Math.sqrt(Q.reduce((s, p) => s + p.x * p.x + p.y * p.y + p.z * p.z, 0) / Q.length);
  return { Q: Q.map((p) => ({ x: p.x / rms, y: p.y / rms, z: p.z / rms })), rms };
}

// ---------- profile (side) metrics on an aligned cloud ----------
// Q: points in front frame, x right, y down, z away from camera. Forward = -z.
function profileMetrics(Q, mmU, sideSign) {
  // profile plane: x = forward (-z), y = down; then level it on an approximate Frankfort line (tragus → orbitale)
  const F0 = (i) => ({ x: -Q[i].z, y: Q[i].y });
  const trag = sideSign >= 0 ? 234 : 454, orb = sideSign >= 0 ? 145 : 374;
  const fa = Math.atan2(F0(orb).y - F0(trag).y, F0(orb).x - F0(trag).x);
  const ca = Math.cos(-fa), sa = Math.sin(-fa);
  const F = (i) => { const p = F0(i); return { x: p.x * ca - p.y * sa, y: p.x * sa + p.y * ca }; };
  const most = (ids) => ids.reduce((b, i) => (F(i).x > F(b).x ? i : b), ids[0]);
  const prn = most([1, 4, 5, 19, 94, 195]);
  const sn = 2, ls = 0, li = 17, g = 9, n = 168;
  const pog = most([152, 175, 199, 200, 18, 208, 428, 171, 396]);
  const me = 152;
  // E-line (Ricketts): pronasale → soft pogonion; negative = lips behind the line
  const E = (p) => { const a = F(prn), b = F(pog), q = F(p); const vx = b.x - a.x, vy = b.y - a.y; const L = Math.hypot(vx, vy); return ((q.x - a.x) * vy - (q.y - a.y) * vx) / L * -1; };
  let eUpper = E(ls) * mmU, eLower = E(li) * mmU;
  // sign check: lips must be on the same side as the face interior (behind the line = negative)
  // facial convexity (Legan & Burstone): angle between G–Sn and Sn–Pog'
  const conv = 180 - angleAt(F(g), F(sn), F(pog));
  // nasolabial angle: columella (Sn→nose base front) vs upper lip (Sn→Ls)
  const col = F(19);
  const nasolabial = angleAt(col, F(sn), F(ls));
  // chin projection relative to a vertical through soft-tissue nasion (zero meridian)
  const chinProj = (F(pog).x - F(n).x) * mmU;
  // nose projection (Goode): alar crease→tip vs nasion→tip
  const alar = { x: (F(129).x + F(358).x) / 2, y: (F(129).y + F(358).y) / 2 };
  const goode = Math.abs(F(prn).x - alar.x) / Math.hypot(F(prn).x - F(n).x, F(prn).y - F(n).y);
  // gonial angle: jaw contour on the visible side; gonion = point farthest from ear–menton chord
  const contour = sideSign >= 0 ? [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152] : [454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152];
  const ear = F(contour[0]), mn = F(me);
  let gon = contour[4], gd = -1;
  for (const i of contour.slice(1, -1)) {
    const p = F(i); const vx = mn.x - ear.x, vy = mn.y - ear.y; const dd = Math.abs((p.x - ear.x) * vy - (p.y - ear.y) * vx) / Math.hypot(vx, vy);
    if (dd > gd) { gd = dd; gon = i; }
  }
  const gonial = angleAt(ear, F(gon), mn);
  const jawLen = Math.hypot(F(gon).x - F(pog).x, F(gon).y - F(pog).y) * mmU;
  return { eUpper: r1(eUpper), eLower: r1(eLower), convexity: r1(conv), nasolabial: Math.round(nasolabial), chinProj: r1(chinProj), goode: r2(goode), gonial: Math.round(gonial), jawLen: Math.round(jawLen) };
}

export const PROFILE_NORMS = { convexity: [15, 22], eUpper: [-2, 3], eLower: [-2, 2], chinProj: [-14, -4], goode: [0.62, 0.76], gonial: [128, 138], nasolabial: [95, 120] };
const PN = PROFILE_NORMS;
function profileScores(p, male) {
  const s = {
    // ranges are calibrated to this landmark model's soft-tissue estimates (see PROFILE_NORMS)
    convexity: rangeScore(p.convexity, PN.convexity[0], PN.convexity[1], 10),
    eline: Math.round((rangeScore(p.eUpper, PN.eUpper[0], PN.eUpper[1], 6) + rangeScore(p.eLower, PN.eLower[0], PN.eLower[1], 6)) / 2),
    nasolabial: male ? rangeScore(p.nasolabial, 95, 115, 30) : rangeScore(p.nasolabial, 100, 122, 30),
    chin: rangeScore(p.chinProj, PN.chinProj[0], PN.chinProj[1], 12),
    nose: rangeScore(p.goode, PN.goode[0], PN.goode[1], 0.25),
    gonial: rangeScore(p.gonial, PN.gonial[0], PN.gonial[1], 22),
  };
  for (const k in s) s[k] = Math.round(s[k]);
  const total = Math.round(s.convexity * 0.22 + s.eline * 0.18 + s.nasolabial * 0.12 + s.chin * 0.2 + s.nose * 0.1 + s.gonial * 0.18);
  return { s, total };
}

// ---------- front analysis ----------
export function analyze(lm, w, h) {
  const { pts } = normalize(lm, w, h);
  const mmPx = mmPerPx(lm, w, h);
  const faceW = d(pts[234], pts[454]);
  const faceH = d(pts[10], pts[152]);
  const mm = (v) => (mmPx ? Math.round(v * mmPx) : null);

  // 1) Symmetry
  const midTop = mid(pts[9], pts[168]);
  const midBot = mid(pts[2], pts[152]);
  const axisX = (midTop.x + midBot.x) / 2;
  let asym = 0;
  for (const [l, r] of PAIRS) {
    const dl = axisX - pts[l].x, dr = pts[r].x - axisX;
    asym += Math.abs(dl - dr) / faceW + Math.abs(pts[l].y - pts[r].y) / faceW;
  }
  asym /= PAIRS.length;
  const symmetry = clamp(100 - (asym * 100 - 1) * 8.5);

  // 2) Vertical thirds (glabella→subnasale vs subnasale→menton)
  const middleThird = Math.abs(pts[2].y - pts[9].y);
  const lowerThird = Math.abs(pts[152].y - pts[2].y);
  const thirdsRatio = lowerThird / middleThird;
  const thirds = closeness(thirdsRatio, 1.0, 0.45);

  // 3) Lip–chin ratio
  const stomion = mid(pts[13], pts[14]);
  const upperLipH = Math.abs(stomion.y - pts[2].y);
  const chinH = Math.abs(pts[152].y - stomion.y);
  const lipChin = chinH / upperLipH;
  const lipChinScore = closeness(lipChin, 2.0, 1.1);

  // 4) Horizontal fifths
  const eyeWL = d(pts[33], pts[133]), eyeWR = d(pts[362], pts[263]);
  const eyeW = (eyeWL + eyeWR) / 2;
  const interCanthal = d(pts[133], pts[362]);
  const fifthsRatio = interCanthal / eyeW;
  const fifths = rangeScore(fifthsRatio, 0.95, 1.25, 0.45); // landmark corners sit slightly inside the true canthi

  // 5) Canthal tilt + eye opening
  const ct = ((pts[133].y - pts[33].y) / eyeWL + (pts[362].y - pts[263].y) / eyeWR) / 2;
  const canthalDeg = deg(Math.atan(ct));
  const eyeOpen = ((d(pts[159], pts[145]) / eyeWL) + (d(pts[386], pts[374]) / eyeWR)) / 2;
  const eyes = clamp(55 + (canthalDeg - 2) * 5 + (fifths - 60) * 0.3);

  // 6) Jaw (front view)
  const jawW = d(pts[172], pts[397]);
  const jawRatio = jawW / faceW;
  const jawAngle = angleAt(pts[234], pts[172], pts[152]);
  const jaw = clamp(closeness(jawRatio, 0.82, 0.35) * 0.5 + closeness(jawAngle, 140, 35) * 0.5);
  const chinW = d(pts[148], pts[377]);

  // 7) Nose width vs intercanthal; mouth vs nose (neoclassical canon ≈ 1.5)
  const noseW = d(pts[129], pts[358]);
  const noseRatio = noseW / interCanthal;
  const nose = closeness(noseRatio, 1.1, 0.6);
  const mouthW = d(pts[61], pts[291]);
  const mouthNose = mouthW / noseW;
  const mouthScore = closeness(mouthNose, 1.5, 0.6);

  // 8) Interpupillary distance / face width (Pallett et al. 2010: ≈ 0.46 most attractive)
  const irisL = lm.length >= 478 ? pts[468] : mid(pts[33], pts[133]);
  const irisR = lm.length >= 478 ? pts[473] : mid(pts[362], pts[263]);
  const ipd = d(irisL, irisR);
  const ipdRatio = ipd / faceW;
  const ipdScore = rangeScore(ipdRatio, 0.44, 0.49, 0.08);

  // 9) Lips
  const upperLip = Math.abs(pts[13].y - pts[0].y), lowerLip = Math.abs(pts[17].y - pts[14].y);
  const lipRatio = lowerLip / (upperLip || 1);

  // 10) Brow
  const browEye = (Math.abs(pts[105].y - pts[159].y) + Math.abs(pts[334].y - pts[386].y)) / 2;

  // fWHR and face length
  const upperFaceH = Math.abs(pts[0].y - mid(pts[105], pts[334]).y);
  const fwhr = faceW / upperFaceH;
  const lengthRatio = faceH / faceW;
  let shape;
  if (lengthRatio > 1.38) shape = 'uzun';
  else if (jawRatio > 0.86 && lengthRatio < 1.25) shape = 'kare';
  else if (jawRatio < 0.74) shape = 'kalp';
  else if (lengthRatio < 1.12) shape = 'yuvarlak';
  else shape = 'oval';

  const front = Math.round(
    symmetry * 0.24 + thirds * 0.13 + lipChinScore * 0.08 + fifths * 0.1 + eyes * 0.11 + jaw * 0.13 + nose * 0.07 + ipdScore * 0.08 + mouthScore * 0.06
  );

  return {
    harmony: front, front,
    scores: {
      symmetry: Math.round(symmetry), thirds: Math.round(thirds), lipChin: Math.round(lipChinScore),
      fifths: Math.round(fifths), eyes: Math.round(eyes), jaw: Math.round(jaw), nose: Math.round(nose),
      ipd: Math.round(ipdScore), mouth: Math.round(mouthScore),
    },
    raw: {
      asymmetryPct: r2(asym * 100), thirdsRatio: r2(thirdsRatio), lipChin: r2(lipChin),
      fifthsRatio: r2(fifthsRatio), canthalDeg: r1(canthalDeg), jawRatio: r2(jawRatio),
      jawAngle: Math.round(jawAngle), noseRatio: r2(noseRatio), fwhr: r2(fwhr), lengthRatio: r2(lengthRatio),
      ipdRatio: r2(ipdRatio), mouthNose: r2(mouthNose), lipRatio: r2(lipRatio), eyeOpen: r2(eyeOpen),
    },
    mm: mmPx ? {
      ipd: mm(ipd), faceW: mm(faceW), faceH: mm(faceH), noseW: mm(noseW), mouthW: mm(mouthW), jawW: mm(jawW), chinW: mm(chinW),
      philtrum: mm(Math.abs(pts[0].y - pts[2].y)), chinH: mm(Math.abs(pts[152].y - pts[17].y)), browEye: mm(browEye),
      upperLip: mm(upperLip), lowerLip: mm(lowerLip), eyeW: mm(eyeW), interCanthal: mm(interCanthal),
    } : null,
    shape,
  };
}

// ---------- smile ----------
function smileMetrics(front, smile) {
  const a = normalize(front.lm, front.w, front.h).pts, b = normalize(smile.lm, smile.w, smile.h).pts;
  const fa = d(a[234], a[454]), fb = d(b[234], b[454]);
  const widen = (d(b[61], b[291]) / fb) / (d(a[61], a[291]) / fa);
  const rise = (P, f, i) => (P[i].y - P[1].y) / f; // corner height below nose tip
  const riseL = rise(a, fa, 61) - rise(b, fb, 61), riseR = rise(a, fa, 291) - rise(b, fb, 291);
  const asym = Math.abs(riseL - riseR) / (Math.max(Math.abs(riseL), Math.abs(riseR)) || 1);
  const open = (P, f) => ((d(P[159], P[145]) + d(P[386], P[374])) / 2) / f;
  const eyeNarrow = open(b, fb) / (open(a, fa) || 1);
  const teeth = d(b[13], b[14]) / d(b[61], b[291]);
  const duchenne = eyeNarrow < 0.88;
  const score = Math.round(clamp(closeness(widen, 1.35, 0.4) * 0.35 + clamp(100 - asym * 160) * 0.35 + (duchenne ? 100 : 55) * 0.3));
  return { widen: r2(widen), asymPct: Math.round(asym * 100), eyeNarrow: r2(eyeNarrow), teeth: r2(teeth), duchenne, score };
}

// ---------- full multi-angle analysis ----------
// caps: { front: {lm,w,h}, left?, right?, smile? }
export function analyzeAll(caps, profile = {}) {
  const male = profile.gender !== 'kadin';
  const f = analyze(caps.front.lm, caps.front.w, caps.front.h);
  const ref = frontRef(caps.front.lm, caps.front.w, caps.front.h);
  const mmPx = mmPerPx(caps.front.lm, caps.front.w, caps.front.h);
  // ref units → mm. normalize() keeps pixel scale, so 1 ref unit = rms px
  const mmU = mmPx ? mmPx * ref.rms : null;
  const sides = [];
  for (const k of ['left', 'right']) {
    const c = caps[k]; if (!c) continue;
    const S = cloud(c.lm, c.w, c.h);
    const al = alignTo(S.Q, ref.Q);
    sides.push({ key: k, yaw: Math.round(al.yawDeg), err: al.err, m: profileMetrics(al.Q, mmU || 0.9 * ref.rms / 10, al.yawDeg) });
  }
  let prof = null, profSrc = null;
  if (sides.length) {
    const keys = Object.keys(sides[0].m);
    prof = {}; for (const k of keys) prof[k] = sides.reduce((s, x) => s + x.m[k], 0) / sides.length;
    for (const k of keys) prof[k] = ['nasolabial', 'gonial', 'jawLen'].includes(k) ? Math.round(prof[k]) : k === 'goode' ? r2(prof[k]) : r1(prof[k]);
    profSrc = 'side';
  }
  const ps = prof ? profileScores(prof, male) : null;
  // left vs right side difference (cheek/jaw projection)
  let sideDiff = null;
  if (sides.length === 2) sideDiff = Math.round(Math.abs(sides[0].m.gonial - sides[1].m.gonial));
  const sm = caps.smile ? smileMetrics(caps.front, caps.smile) : null;
  const wP = ps ? 0.25 : 0, wS = sm ? 0.07 : 0;
  const harmony = Math.round(f.front * (1 - wP - wS) + (ps ? ps.total * wP : 0) + (sm ? sm.score * wS : 0));
  return Object.assign(f, {
    harmony,
    profile: ps ? { ...prof, scores: ps.s, total: ps.total, src: profSrc, angles: sides.map((s) => s.yaw), sideDiff } : null,
    smile: sm,
    shots: Object.keys(caps).filter((k) => caps[k]),
  });
}

// Draw a premium-looking mesh overlay
const OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10];
export function drawMesh(ctx, lm, w, h, opts = {}) {
  ctx.save();
  ctx.lineWidth = opts.lineWidth || 1.5;
  ctx.strokeStyle = opts.color || 'rgba(255,140,60,0.9)';
  ctx.beginPath();
  OVAL.forEach((i, k) => { const p = lm[i]; k ? ctx.lineTo(p.x * w, p.y * h) : ctx.moveTo(p.x * w, p.y * h); });
  ctx.stroke();
  ctx.fillStyle = opts.dot || 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 468; i += opts.step || 3) {
    const p = lm[i];
    ctx.fillRect(p.x * w - 1, p.y * h - 1, 2, 2);
  }
  if (opts.keypoints) {
    const key = [33, 263, 133, 362, 1, 61, 291, 152, 172, 397, 234, 454, 9, 2];
    for (const i of key) {
      const p = lm[i];
      ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 4, 0, 7);
      ctx.fillStyle = '#FFB020'; ctx.fill();
    }
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.moveTo(lm[10].x * w, lm[10].y * h); ctx.lineTo(lm[152].x * w, lm[152].y * h); ctx.stroke();
  }
  ctx.restore();
}
