// ********************************** World Map **********************************
// A parchment chart of the scene graph. Places you have stood are lit and named,
// places you have only heard of are dim and unnamed, so the map doubles as a
// record of where you have been and a reason to keep walking.
import React from 'react';
import { MAP } from '../mapLayout';

// Anchor an edge to the centre of each node box.
const centre = (node) => ({ x: node.x + node.w / 2, y: node.y + node.h / 2 });

function WorldMap({ visited, current }) {
  const { nodes, edges, width, height } = MAP;

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
