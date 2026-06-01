/*
 * The Yolk — interactive demo (2D case of Tovey's polynomial-time yolk algorithm).
 *
 * Rewritten for correctness, speed, and clarity. Highlights vs. the original:
 *   - p5 *instance* mode + noLoop()/redraw(): nothing is recomputed every frame and
 *     no DOM buttons are leaked (the old code created 3 buttons ~60x/sec inside draw(),
 *     which is what actually "overwhelmed the memory", not the point count).
 *   - Lines are stored in normalized normal form (a*x + b*y + c = 0, a^2 + b^2 = 1),
 *     so vertical lines and divide-by-zero are no longer special cases.
 *   - The yolk is computed correctly: center = argmin over candidates of
 *     ( max over median lines of distance ), i.e. a min-max (the old code took a
 *     global max, giving the wrong center and radius). Candidates are the incenter
 *     AND excenters of every triple of median lines, then a convex sub-gradient
 *     refinement guarantees optimality and lets it scale to many points.
 *
 * Geometry is plain, side-effect-free JS (the `Geo` object) so it can be reasoned
 * about independently of the rendering.
 */

'use strict';

/* ------------------------------------------------------------------ *
 * Geometry — pure functions, no p5, no globals.
 * A line is { a, b, c, i, j } with a*x + b*y + c = 0 and a^2 + b^2 = 1.
 * i, j are the indices of the point(s) the line is pinned to (j may equal i).
 * ------------------------------------------------------------------ */
const Geo = {
  EPS: 1e-7,

  /** Normalized line through two points. */
  lineThrough(p, q, i, j) {
    // Direction (dx, dy); normal is (-dy, dx).
    let a = -(q[1] - p[1]);
    let b = q[0] - p[0];
    const len = Math.hypot(a, b) || 1;
    a /= len;
    b /= len;
    const c = -(a * p[0] + b * p[1]);
    return { a, b, c, i, j };
  },

  /** Line through point p with a given unit direction angle (radians). */
  lineThroughAngle(p, theta, i) {
    const a = -Math.sin(theta);
    const b = Math.cos(theta);
    const c = -(a * p[0] + b * p[1]);
    return { a, b, c, i, j: i };
  },

  signedDist(line, pt) {
    return line.a * pt[0] + line.b * pt[1] + line.c;
  },

  dist(line, pt) {
    return Math.abs(Geo.signedDist(line, pt));
  },

  /**
   * Is `line` a median hyperplane for `points`?
   * Each closed half-plane must contain at least ceil(n/2) points; points
   * lying on the line count toward both sides.
   */
  isMedian(line, points) {
    const threshold = Math.ceil(points.length / 2);
    let above = 0;
    let below = 0;
    for (const pt of points) {
      const d = Geo.signedDist(line, pt);
      if (d >= -Geo.EPS) above++;
      if (d <= Geo.EPS) below++;
    }
    return above >= threshold && below >= threshold;
  },

  /** Intersection of two normalized lines, or null if (near) parallel. */
  intersect(l1, l2) {
    const det = l1.a * l2.b - l2.a * l1.b;
    if (Math.abs(det) < Geo.EPS) return null;
    const x = (l1.b * l2.c - l2.b * l1.c) / det;
    const y = (l2.a * l1.c - l1.a * l2.c) / det;
    return [x, y];
  },

  /**
   * The (up to 4) points equidistant from three lines: the incenter and the
   * three excenters of the triangle they form. Returns the valid finite ones.
   */
  equidistantPoints(l1, l2, l3) {
    const out = [];
    for (const s2 of [1, -1]) {
      for (const s3 of [1, -1]) {
        // Solve L1 = s2*L2 and L1 = s3*L3 (as linear equations in x, y).
        const A1 = l1.a - s2 * l2.a;
        const B1 = l1.b - s2 * l2.b;
        const C1 = l1.c - s2 * l2.c;
        const A2 = l1.a - s3 * l3.a;
        const B2 = l1.b - s3 * l3.b;
        const C2 = l1.c - s3 * l3.c;
        const det = A1 * B2 - A2 * B1;
        if (Math.abs(det) < Geo.EPS) continue;
        const x = (B1 * C2 - B2 * C1) / det;
        const y = (A2 * C1 - A1 * C2) / det;
        out.push([x, y]);
      }
    }
    return out;
  },

  /** Radius needed for a ball at `center` to touch the furthest of `lines`. */
  enclosingRadius(center, lines) {
    let r = 0;
    for (const l of lines) {
      const d = Geo.dist(l, center);
      if (d > r) r = d;
    }
    return r;
  },

  /**
   * Convex refinement of the yolk center. f(x) = max_i dist(x, line_i) is convex;
   * a projected sub-gradient walk converges to the true minimizer. Cheap (O(iters * |lines|))
   * and independent of how many candidate centers we enumerated — this is what keeps
   * the demo correct and fast even with many points.
   */
  refineCenter(seed, lines, iters = 600) {
    if (lines.length === 0) return { center: seed, radius: 0 };
    let x = seed.slice();
    let best = x.slice();
    let bestR = Geo.enclosingRadius(x, lines);
    let step = bestR > 0 ? bestR : 1;
    for (let t = 0; t < iters; t++) {
      // Active constraint = furthest line; its sub-gradient is its (signed) unit normal.
      let far = lines[0];
      let farD = -1;
      let sign = 1;
      for (const l of lines) {
        const sd = Geo.signedDist(l, x);
        const d = Math.abs(sd);
        if (d > farD) {
          farD = d;
          far = l;
          sign = sd >= 0 ? 1 : -1;
        }
      }
      step *= 0.992; // slowly cooling step size
      x = [x[0] - step * sign * far.a, x[1] - step * sign * far.b];
      const r = Geo.enclosingRadius(x, lines);
      if (r < bestR) {
        bestR = r;
        best = x.slice();
      }
    }
    return { center: best, radius: bestR };
  },

  centroid(points) {
    let sx = 0;
    let sy = 0;
    for (const p of points) {
      sx += p[0];
      sy += p[1];
    }
    return [sx / points.length, sy / points.length];
  },
};

/* ------------------------------------------------------------------ *
 * The demo — p5 instance mode.
 * ------------------------------------------------------------------ */

// Step descriptions shown in the sidebar. Index === step number. Each one
// explains both what is drawn and why that stage matters.
const STEPS = [
  'Click anywhere to drop points — use an odd number, at least 3. Click a point again to remove it. Think of these as the “voters” whose middle we want to find.',
  'Click anywhere to drop points — use an odd number, at least 3. Click a point again to remove it. Think of these as the “voters” whose middle we want to find.',
  'Every pair of points defines a line (a hyperplane in 2D). This is the full B = 2 family — all lines pinned to two points. Most of them aren’t special yet.',
  'A line is a median hyperplane when each side holds at least half of the points. Highlighted in blue are the B = 2 lines that pass that test — the ones that constrain the yolk.',
  'A hyperplane can also be pinned to a single point and rotated freely — the B = 1 family. Shown is an illustrative fan of such lines through each point.',
  'Now keep only the B = 1 lines that are also median: each side still holds at least half the points. The full theory uses these too, alongside the B = 2 lines.',
  'Both families of median hyperplanes at once — B = 2 in blue, B = 1 in red. The yolk is the smallest ball that touches every one of them.',
  'Each triple of median lines forms a triangle. Its incenter and three excenters are the points equidistant from all three lines. Collecting these over every triple gives the candidate set E.',
  'Tovey proves the yolk’s center is always one of these candidates — so the search shrinks from the whole plane to this finite set E.',
  'For each candidate, measure the distance to its furthest median line. The candidate with the smallest such distance is the yolk center, and that distance is the radius — a min-max, not a plain maximum.',
  'The yolk: the smallest ball meeting every median hyperplane — the geometric “middle” of the point set. Press Next or Reset to try another configuration.',
];
const LAST_STEP = STEPS.length - 1;

const PALETTE = {
  bg: '#0f1320',
  grid: '#1b2236',
  point: '#ffd23f',
  pointEdge: '#0f1320',
  b2: '#5aa9ff',
  b1: '#ff6b8b',
  candidate: '#2ee6a6',
  yolk: '#2ee6a6',
  yolkFill: 'rgba(46,230,166,0.10)',
  faint: 'rgba(255,255,255,0.10)',
};

const sketch = (p) => {
  let canvasSize = 560;
  const HIT_RADIUS = 12; // px: click within this of a point to remove it

  // Mutable demo state.
  let step = 1;
  let points = [];
  let b2Lines = [];
  let medB2 = [];
  let b1Lines = [];
  let medB1 = [];
  let candidates = [];
  let yolk = null; // { center: [x,y], radius }

  /* ---- computation ---- */

  function computeB2() {
    b2Lines = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        b2Lines.push(Geo.lineThrough(points[i], points[j], i, j));
      }
    }
  }

  function computeMedB2() {
    if (b2Lines.length === 0) computeB2();
    medB2 = b2Lines.filter((l) => Geo.isMedian(l, points));
  }

  // Illustrative B = 1 family: a fan of lines rotated about each point.
  function computeB1() {
    b1Lines = [];
    const STEPS_PER = 18;
    for (let i = 0; i < points.length; i++) {
      for (let k = 0; k < STEPS_PER; k++) {
        const theta = (Math.PI * k) / STEPS_PER;
        b1Lines.push(Geo.lineThroughAngle(points[i], theta, i));
      }
    }
  }

  function computeMedB1() {
    if (b1Lines.length === 0) computeB1();
    medB1 = b1Lines.filter((l) => Geo.isMedian(l, points));
  }

  function computeCandidates() {
    if (medB2.length === 0) computeMedB2();
    candidates = [];
    const m = medB2.length;
    // Cap triple enumeration so display stays responsive; the convex
    // refinement (below) still guarantees the true optimum regardless.
    const TRIPLE_CAP = 60000;
    let count = 0;
    outer: for (let i = 0; i < m - 2; i++) {
      for (let h = i + 1; h < m - 1; h++) {
        for (let k = h + 1; k < m; k++) {
          if (++count > TRIPLE_CAP) break outer;
          for (const e of Geo.equidistantPoints(medB2[i], medB2[h], medB2[k])) {
            candidates.push(e);
          }
        }
      }
    }
  }

  function computeYolk() {
    if (candidates.length === 0) computeCandidates();
    if (medB2.length === 0) {
      yolk = null;
      return;
    }
    // Best discrete candidate (the paper's set E)...
    let bestC = candidates[0] || Geo.centroid(points);
    let bestR = Geo.enclosingRadius(bestC, medB2);
    for (const c of candidates) {
      const r = Geo.enclosingRadius(c, medB2);
      if (r < bestR) {
        bestR = r;
        bestC = c;
      }
    }
    // ...then refine convexly to the true min-max optimum.
    const seed = bestC;
    const refined = Geo.refineCenter(seed, medB2);
    const fromCentroid = Geo.refineCenter(Geo.centroid(points), medB2);
    let best = { center: bestC, radius: bestR };
    for (const cand of [refined, fromCentroid]) {
      if (cand.radius < best.radius) best = cand;
    }
    yolk = best;
  }

  // Recompute everything the current step needs (idempotent, cached upstream).
  function ensureComputed() {
    if (points.length < 3) return;
    if (step >= 2) computeB2();
    if (step >= 3) computeMedB2();
    if (step >= 4) computeB1();
    if (step >= 5) computeMedB1();
    if (step >= 7) computeCandidates();
    if (step >= 9) computeYolk();
  }

  /* ---- drawing helpers ---- */

  // Clip a normalized line to the canvas box and return its two endpoints.
  function clipLine(l) {
    const W = canvasSize;
    const H = canvasSize;
    const pts = [];
    const push = (x, y) => {
      if (x >= -0.5 && x <= W + 0.5 && y >= -0.5 && y <= H + 0.5) pts.push([x, y]);
    };
    if (Math.abs(l.b) > Geo.EPS) {
      push(0, -(l.a * 0 + l.c) / l.b);
      push(W, -(l.a * W + l.c) / l.b);
    }
    if (Math.abs(l.a) > Geo.EPS) {
      push(-(l.b * 0 + l.c) / l.a, 0);
      push(-(l.b * H + l.c) / l.a, H);
    }
    return pts.length >= 2 ? [pts[0], pts[1]] : null;
  }

  function drawLine(l) {
    const seg = clipLine(l);
    if (seg) p.line(seg[0][0], seg[0][1], seg[1][0], seg[1][1]);
  }

  function drawLines(lines, col, weight) {
    p.stroke(col);
    p.strokeWeight(weight);
    for (const l of lines) drawLine(l);
  }

  function drawGrid() {
    p.stroke(PALETTE.grid);
    p.strokeWeight(1);
    const gap = 40;
    for (let x = gap; x < canvasSize; x += gap) p.line(x, 0, x, canvasSize);
    for (let y = gap; y < canvasSize; y += gap) p.line(0, y, canvasSize, y);
  }

  function drawPoints() {
    for (let i = 0; i < points.length; i++) {
      p.stroke(PALETTE.pointEdge);
      p.strokeWeight(2);
      p.fill(PALETTE.point);
      p.circle(points[i][0], points[i][1], 11);
    }
  }

  function drawCandidates() {
    p.noStroke();
    p.fill(PALETTE.candidate);
    for (const c of candidates) {
      if (c[0] >= 0 && c[0] <= canvasSize && c[1] >= 0 && c[1] <= canvasSize) {
        p.circle(c[0], c[1], 4);
      }
    }
  }

  function drawYolk() {
    if (!yolk) return;
    p.noFill();
    p.stroke(PALETTE.yolk);
    p.strokeWeight(2.5);
    p.circle(yolk.center[0], yolk.center[1], yolk.radius * 2);
    p.fill(PALETTE.yolkFill);
    p.noStroke();
    p.circle(yolk.center[0], yolk.center[1], yolk.radius * 2);
    p.fill(PALETTE.yolk);
    p.noStroke();
    p.circle(yolk.center[0], yolk.center[1], 7);
  }

  /* ---- the render for the current step ---- */

  function render() {
    p.background(PALETTE.bg);
    drawGrid();

    const enough = points.length >= 3;

    if (enough) {
      switch (step) {
        case 2:
          drawLines(b2Lines, PALETTE.faint, 1);
          break;
        case 3:
          drawLines(b2Lines, PALETTE.faint, 1);
          drawLines(medB2, PALETTE.b2, 1.4);
          break;
        case 4:
          drawLines(b1Lines, PALETTE.faint, 1);
          break;
        case 5:
          drawLines(b1Lines, PALETTE.faint, 1);
          drawLines(medB1, PALETTE.b1, 1.2);
          break;
        case 6:
          drawLines(medB2, PALETTE.b2, 1.4);
          drawLines(medB1, PALETTE.b1, 1.2);
          break;
        case 7:
          drawLines(medB2, 'rgba(90,169,255,0.35)', 1);
          drawCandidates();
          break;
        case 8:
          drawLines(medB2, 'rgba(90,169,255,0.35)', 1);
          drawCandidates();
          break;
        case 9:
          drawLines(medB2, 'rgba(90,169,255,0.45)', 1);
          drawCandidates();
          drawYolk();
          break;
        case 10:
          drawLines(medB2, PALETTE.b2, 1.2);
          drawLines(medB1, 'rgba(255,107,139,0.5)', 1);
          drawYolk();
          break;
        default:
          break;
      }
    }

    drawPoints();
    updateHud(enough);
  }

  /* ---- HUD / DOM glue ---- */

  function updateHud(enough) {
    const stepEl = document.getElementById('step-text');
    const countEl = document.getElementById('count');
    const statEl = document.getElementById('stat');
    const idxEl = document.getElementById('step-index');
    if (idxEl) idxEl.textContent = `Step ${Math.max(1, step)} / ${LAST_STEP}`;
    if (stepEl) stepEl.textContent = STEPS[step] || STEPS[1];
    if (countEl) countEl.textContent = `${points.length} pts`;
    if (statEl) {
      if (!enough) {
        statEl.textContent = '';
      } else if (step >= 9 && yolk) {
        statEl.textContent = `${medB2.length} median lines · radius ${yolk.radius.toFixed(1)}px`;
      } else if (step >= 3) {
        statEl.textContent = `${medB2.length} median lines`;
      } else {
        statEl.textContent = `${b2Lines.length} hyperplanes`;
      }
    }
    if (points.length % 2 === 0 && points.length >= 3) {
      if (statEl) statEl.textContent += '  ⚠ even count — add one more for a clean median';
    }
  }

  /* ---- navigation ---- */

  function goNext() {
    if (step <= 1 && points.length < 3) return;
    if (step >= LAST_STEP) {
      reset();
      return;
    }
    step++;
    ensureComputed();
    p.redraw();
  }

  function goBack() {
    if (step <= 1) return;
    step--;
    ensureComputed();
    p.redraw();
  }

  function reset() {
    step = 1;
    points = [];
    b2Lines = medB2 = b1Lines = medB1 = candidates = [];
    yolk = null;
    p.redraw();
  }

  function clearLines() {
    b2Lines = medB2 = b1Lines = medB1 = candidates = [];
    yolk = null;
  }

  function randomPoints() {
    reset();
    const n = 7;
    const pad = 70;
    // deterministic-ish spread using p5's RNG
    for (let i = 0; i < n; i++) {
      points.push([
        p.random(pad, canvasSize - pad),
        p.random(pad, canvasSize - pad),
      ]);
    }
    p.redraw();
  }

  /* ---- p5 lifecycle ---- */

  p.setup = () => {
    canvasSize = pickSize();
    const c = p.createCanvas(canvasSize, canvasSize);
    c.parent('canvas-holder');
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.noLoop();

    wireButton('btn-back', goBack);
    wireButton('btn-next', goNext);
    wireButton('btn-reset', reset);
    wireButton('btn-random', randomPoints);
    wireButton('btn-clear', () => {
      points = [];
      clearLines();
      step = 1;
      p.redraw();
    });

    p.redraw();
  };

  p.draw = () => {
    render();
  };

  p.mousePressed = () => {
    if (step > 1) return; // only edit points on the first step
    const mx = p.mouseX;
    const my = p.mouseY;
    if (mx < 0 || my < 0 || mx > canvasSize || my > canvasSize) return;

    // Click near an existing point removes it; otherwise add a new one.
    for (let i = 0; i < points.length; i++) {
      if (Math.hypot(points[i][0] - mx, points[i][1] - my) <= HIT_RADIUS) {
        points.splice(i, 1);
        clearLines();
        p.redraw();
        return;
      }
    }
    points.push([mx, my]);
    clearLines();
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.keyCode === p.RIGHT_ARROW) goNext();
    else if (p.keyCode === p.LEFT_ARROW) goBack();
    else if (p.key === 'r' || p.key === 'R') reset();
  };

  p.windowResized = () => {
    canvasSize = pickSize();
    p.resizeCanvas(canvasSize, canvasSize);
    p.redraw();
  };

  /* ---- small utilities ---- */

  function pickSize() {
    const holder = document.getElementById('canvas-holder');
    const avail = holder ? holder.clientWidth : window.innerWidth;
    return Math.max(320, Math.min(640, Math.floor(avail)));
  }

  function wireButton(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
};

// Boot once the DOM is ready (the control bar must exist first).
window.addEventListener('DOMContentLoaded', () => {
  new p5(sketch);
});
