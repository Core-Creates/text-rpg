// ********************************** Map Layout **********************************
// Derives a drawable map from the scene graph. Nothing here is hand-positioned,
// so a scene added to gameData.js appears on the map without further work.
//
// Layout is a breadth-first layering from the intro: distance from the start
// gives the row, and order of discovery gives the column within that row.

import gameData from './gameData';

const NODE_W = 104;
const NODE_H = 30;
const COL_GAP = 18;
const ROW_GAP = 28;
const PAD = 14;

// A depth with more scenes than this wraps onto further rows. Without a cap the
// chart grows wider than its plate, and since the SVG scales to fit, every label
// shrinks until none of them are legible.
const MAX_PER_ROW = 4;

// Scenes may express choices as a value or a function of (visited, rand).
// Both branches are collected, so an edge that only appears on a revisit is
// still drawn.
const allChoices = (scene) => {
  const resolve = (visited) =>
    typeof scene.choices === 'function' ? scene.choices(visited, 0.5) : scene.choices;
  return [...resolve(false), ...resolve(true)];
};

// A scene without an explicit label falls back to its key, split on camelCase.
const labelFor = (name) =>
  gameData[name].label ||
  name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

export function buildMap() {
  // ********************************** Rows by Distance **********************************
  const depth = { intro: 0 };
  const queue = ['intro'];

  while (queue.length > 0) {
    const name = queue.shift();
    allChoices(gameData[name]).forEach((choice) => {
      if (gameData[choice.next] && depth[choice.next] === undefined) {
        depth[choice.next] = depth[name] + 1;
        queue.push(choice.next);
      }
    });
  }

  // Anything unreachable still gets a row rather than vanishing from the map.
  Object.keys(gameData).forEach((name) => {
    if (depth[name] === undefined) depth[name] = 0;
  });

  // Group by distance, then wrap any group that is too wide onto further rows.
  const byDepth = [];
  Object.keys(gameData).forEach((name) => {
    const d = depth[name];
    if (!byDepth[d]) byDepth[d] = [];
    byDepth[d].push(name);
  });

  const rows = [];
  byDepth.forEach((group) => {
    if (!group) return;
    for (let i = 0; i < group.length; i += MAX_PER_ROW) {
      rows.push(group.slice(i, i + MAX_PER_ROW));
    }
  });

  // ********************************** Positions **********************************
  const widest = Math.max(...rows.map((r) => r.length));
  const width = widest * NODE_W + (widest - 1) * COL_GAP + PAD * 2;
  const height = rows.length * NODE_H + (rows.length - 1) * ROW_GAP + PAD * 2;

  const nodes = {};
  rows.forEach((row, r) => {
    const rowWidth = row.length * NODE_W + (row.length - 1) * COL_GAP;
    const startX = (width - rowWidth) / 2;
    row.forEach((name, c) => {
      nodes[name] = {
        name,
        label: labelFor(name),
        x: startX + c * (NODE_W + COL_GAP),
        y: PAD + r * (NODE_H + ROW_GAP),
        w: NODE_W,
        h: NODE_H
      };
    });
  });

  // ********************************** Edges **********************************
  // Deduplicated and undirected: a path back the way you came is the same road.
  const seen = new Set();
  const edges = [];

  Object.keys(gameData).forEach((from) => {
    allChoices(gameData[from]).forEach((choice) => {
      const to = choice.next;
      if (!gameData[to] || to === from) return;
      const key = [from, to].sort().join('->');
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ from, to });
    });
  });

  return { nodes, edges, width, height };
}

export const MAP = buildMap();
