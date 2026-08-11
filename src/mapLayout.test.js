// ********************************** Map Layout Tests **********************************
// The map is derived from the scene graph rather than hand-positioned, so these
// check the derivation holds for whatever gameData contains.

import gameData from './gameData';
import { MAP, buildMap } from './mapLayout';

const sceneNames = Object.keys(gameData);

describe('map layout', () => {
  it('places every scene', () => {
    expect(Object.keys(MAP.nodes).sort()).toEqual(sceneNames.sort());
  });

  it('gives every scene a readable label', () => {
    Object.values(MAP.nodes).forEach((node) => {
      expect(typeof node.label).toBe('string');
      expect(node.label.length).toBeGreaterThan(0);
      // A label should read as words, never as a raw camelCase key.
      expect(node.label).not.toMatch(/[a-z][A-Z]/);
    });
  });

  it('keeps every label inside its node box', () => {
    // SVG text does not wrap or clip, so a label wider than its box silently
    // spills across the map. Estimated against Cinzel uppercase at 9.5px with
    // 0.06em tracking, which is what .place text sets.
    const CHAR_W = 9.5 * 0.62 + 9.5 * 0.06;
    const PADDING = 8;

    const overflowing = Object.values(MAP.nodes)
      .filter((node) => node.label.length * CHAR_W > node.w - PADDING)
      .map((node) => `${node.label} (${node.label.length} chars)`);

    expect(overflowing).toEqual([]);
  });

  it('keeps every node inside the plate', () => {
    Object.values(MAP.nodes).forEach((node) => {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.x + node.w).toBeLessThanOrEqual(MAP.width);
      expect(node.y + node.h).toBeLessThanOrEqual(MAP.height);
    });
  });

  it('never overlaps two nodes', () => {
    const boxes = Object.values(MAP.nodes);
    const overlaps = [];

    boxes.forEach((a, i) => {
      boxes.slice(i + 1).forEach((b) => {
        const apart =
          a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
        if (!apart) overlaps.push(`${a.name} over ${b.name}`);
      });
    });

    expect(overlaps).toEqual([]);
  });

  it('draws an edge for every connection, in one direction only', () => {
    const keys = MAP.edges.map(({ from, to }) => [from, to].sort().join('->'));
    expect(new Set(keys).size).toBe(keys.length);

    MAP.edges.forEach(({ from, to }) => {
      expect(gameData[from]).toBeDefined();
      expect(gameData[to]).toBeDefined();
      expect(from).not.toBe(to);
    });
  });

  it('connects the intro to both opening directions', () => {
    const fromIntro = MAP.edges
      .filter(({ from, to }) => from === 'intro' || to === 'intro')
      .map(({ from, to }) => (from === 'intro' ? to : from));

    expect(fromIntro).toEqual(expect.arrayContaining(['cave', 'river']));
  });

  it('puts the intro on the first row and the win beneath it', () => {
    expect(MAP.nodes.intro.y).toBeLessThan(MAP.nodes.passGate.y);
  });

  it('is deterministic', () => {
    expect(buildMap()).toEqual(MAP);
  });
});
