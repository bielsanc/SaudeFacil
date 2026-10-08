// Trajetoria do fluxo de sangue, em coordenadas do canvas original (1024 x 1536).
// Sentido: u = 0 (parte inferior, saida direita) -> u = 1 (parte superior, perto da bolsa).
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 1536;

// Pontos de controle sobre o eixo central do vaso (formato de "S").
const CONTROL_POINTS = [
  // eixo central do vaso na arte (canvas 1024 x 1536), de baixo para cima
  { x: 647, y: 1507 },
  { x: 587, y: 1377 },
  { x: 562, y: 1251 },
  { x: 476, y: 1097 },
  { x: 469, y: 1012 },
  { x: 513, y: 880 },
  { x: 601, y: 791 },
  { x: 708, y: 671 },
  { x: 720, y: 622 },
  { x: 672, y: 546 },
  { x: 592, y: 482 },
  { x: 520, y: 442 },
  { x: 450, y: 412 },
  { x: 380, y: 396 },
  { x: 310, y: 390 },
  { x: 250, y: 388 },
];

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a, b, c, d) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

// Amostra a spline em muitos pontos e reparametriza por comprimento de arco,
// assim u anda em velocidade uniforme ao longo do vaso.
function buildPath(stepsPerSegment = 24) {
  const pts = CONTROL_POINTS;
  const raw = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < stepsPerSegment; s += 1) {
      raw.push(catmullRom(p0, p1, p2, p3, s / stepsPerSegment));
    }
  }
  raw.push(pts[pts.length - 1]);

  const lengths = [0];
  for (let i = 1; i < raw.length; i += 1) {
    lengths.push(lengths[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y));
  }
  return { raw, lengths, total: lengths[lengths.length - 1] };
}

const PATH = buildPath();
export const PATH_LENGTH = PATH.total;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function getPathPoint(u) {
  const target = clamp01(u) * PATH.total;
  let lo = 0;
  let hi = PATH.lengths.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (PATH.lengths[mid] <= target) lo = mid;
    else hi = mid;
  }
  const span = PATH.lengths[hi] - PATH.lengths[lo] || 1;
  const k = (target - PATH.lengths[lo]) / span;
  const a = PATH.raw[lo];
  const b = PATH.raw[hi];
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

// Direcao (graus) da trajetoria em u.
export function getPathAngle(u) {
  const d = 0.01;
  const a = getPathPoint(u - d);
  const b = getPathPoint(u + d);
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

// Projeta um ponto do canvas no ponto mais proximo da trajetoria (retorna u).
export function projectOnPath(x, y) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < PATH.raw.length; i += 1) {
    const dist = (PATH.raw[i].x - x) ** 2 + (PATH.raw[i].y - y) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return PATH.lengths[best] / PATH.total;
}
