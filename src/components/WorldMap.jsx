// ********************************** World Map **********************************
// A parchment chart of the scene graph. Places you have stood are lit and named,
// places you have only heard of are dim and unnamed, so the map doubles as a
// record of where you have been and a reason to keep walking.
import React, { useId } from 'react';
import { MAP } from '../mapLayout';

// Anchor an edge to the centre of each node box.
const centre = (node) => ({ x: node.x + node.w / 2, y: node.y + node.h / 2 });

// An ogee arch, the onion-shaped opening the miniature sits under in an
// illuminated codex. Drawn from the plate dimensions so it always fits.
// mapLayout reserves PAD_TOP of clearance so the first row clears the shoulders.
const ogee = (w, h) => {
  const spring = 66; // where the arch leaves the vertical jambs
  const m = 3;
  const apex = 3;
  return [
    `M${m},${h - m}`,
    `L${m},${spring}`,
    // Each side is one cubic that rises, turns inward, and arrives at the apex
    // from below. The two meet at a cusp, which is what points the arch.
    `C${m},${spring * 0.52} ${w * 0.40},${spring * 0.74} ${w / 2},${apex}`,
    `C${w * 0.60},${spring * 0.74} ${w - m},${spring * 0.52} ${w - m},${spring}`,
    `L${w - m},${h - m}`,
    'Z'
  ].join(' ');
};

function WorldMap({ visited, current }) {
  const { nodes, edges, width, height } = MAP;
  const clipId = useId();
  const arch = ogee(width, height);

  // Where you stand counts as known even before you leave it, since visited
  // only records scenes already departed.
  const seen = (name) => Boolean(visited[name]) || name === current;

  return (
    <section className="chart" aria-labelledby="chart-heading">
      <h2 className="cartouche" id="chart-heading">The Known World</h2>

      <svg
        className="chart-plate"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Map of the world. ${
          Object.keys(nodes).filter(seen).length
        } of ${Object.keys(nodes).length} places discovered.`}
      >
        {/* The lapis field, clipped to the arch, with gilt bezants scattered
            through it the way an illuminated ground is powdered with gold. */}
        <defs>
          <clipPath id={`arch-${clipId}`}>
            <path d={arch} />
          </clipPath>
          <pattern id={`bezants-${clipId}`} patternUnits="userSpaceOnUse" width="34" height="34">
            <circle cx="7" cy="9" r="1.15" fill="var(--gold)" opacity="0.55" />
            <circle cx="24" cy="25" r="1.15" fill="var(--gold)" opacity="0.45" />
            <circle cx="29" cy="6" r="0.8" fill="var(--gold-lit)" opacity="0.4" />
          </pattern>
        </defs>

        <g clipPath={`url(#arch-${clipId})`}>
          <rect className="chart-field" x="0" y="0" width={width} height={height} />
          <rect x="0" y="0" width={width} height={height} fill={`url(#bezants-${clipId})`} />
        </g>

        <path className="chart-arch" d={arch} />

        {/* Roads first, so the place markers sit over them. */}
        <g className="chart-roads">
          {edges.map(({ from, to }) => {
            const a = centre(nodes[from]);
            const b = centre(nodes[to]);
            const known = seen(from) && seen(to);
            return (
              <line
                key={`${from}-${to}`}
                className={known ? 'road is-known' : 'road'}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              />
            );
          })}
        </g>

        <g className="chart-places">
          {Object.values(nodes).map((node) => {
            const here = node.name === current;
            const known = seen(node.name);
            const state = here ? ' is-here' : known ? ' is-known' : '';

            return (
              <g key={node.name} className={`place${state}`}>
                <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="2" />
                <text
                  x={node.x + node.w / 2}
                  y={node.y + node.h / 2}
                  dominantBaseline="central"
                  textAnchor="middle"
                >
                  {known ? node.label : '. . .'}
                </text>
                {here && (
                  /* A lozenge marks where you stand. */
                  <path
                    className="here-mark"
                    d={`M${node.x + node.w / 2} ${node.y - 11}
                        l5 6 l-5 6 l-5 -6 Z`}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </section>
  );
}

export default WorldMap;
