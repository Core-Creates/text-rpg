// ********************************** Scene Motifs **********************************
// A small engraving in the margin beside each line of the record, keyed to the
// place that line was written in. The block-printed marks in the EaTemp deck are
// the reference: flat, two-tone, and heavy enough to read at a glance.
//
// These render around 20px, so they are cut as silhouettes. Anything finer would
// close up and turn to mud, which is exactly the constraint a real woodcut has.
import React from 'react';

const wrap = (children) => (
  <svg className="motif" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

// ********************************** The Blocks **********************************
const BLOCKS = {
  tree: wrap(
    <g fill="currentColor">
      <path d="M11 22h2v-5h-2z" />
      <path d="M12 1 6 9h3l-4 6h5v3h4v-3h5l-4-6h3z" />
    </g>
  ),

  cave: wrap(
    <g fill="currentColor">
      <path d="M2 22 C2 11 6 4 12 4 C18 4 22 11 22 22 Z" />
      <path d="M8 22 C8 16 9 13 12 13 C15 13 16 16 16 22 Z" fill="var(--parchment)" />
    </g>
  ),

  water: wrap(
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M2 8 C5 5, 8 11, 12 8 C16 5, 19 11, 22 8" />
      <path d="M2 14 C5 11, 8 17, 12 14 C16 11, 19 17, 22 14" />
      <path d="M2 20 C5 17, 8 23, 12 20 C16 17, 19 23, 22 20" />
    </g>
  ),

  gate: wrap(
    <g fill="currentColor">
      <path d="M2 22V9C2 5 6 2 12 2C18 2 22 5 22 9V22h-3V9C19 6.5 16 5 12 5C8 5 5 6.5 5 9V22Z" />
      <path d="M6 10h12v2H6zM6 15h12v2H6zM11 9h2v13h-2z" />
    </g>
  ),

  shrine: wrap(
    <g fill="currentColor">
      <path d="M12 1 4 9v13h5V13h6v9h5V9Z" />
      <path d="M11 15h2v7h-2z" fill="var(--parchment)" />
      <circle cx="12" cy="7" r="2" fill="var(--parchment)" />
    </g>
  ),

  hut: wrap(
    <g fill="currentColor">
      <path d="M12 2 1 11h3v11h16V11h3Z" />
      <path d="M10 14h4v8h-4z" fill="var(--parchment)" />
    </g>
  ),

  tower: wrap(
    <g fill="currentColor">
      <path d="M5 6h2V3h2v3h2V3h2v3h2V3h2v3h2v3H5Z" />
      <path d="M6 9h12v13H6Z" />
      <path d="M10 15h4v7h-4z" fill="var(--parchment)" />
      <path d="M10 11h4v2h-4z" fill="var(--parchment)" />
    </g>
  ),

  beast: wrap(
    <g fill="currentColor">
      <ellipse cx="12" cy="16" rx="6" ry="5.5" />
      <ellipse cx="5" cy="9" rx="2.6" ry="3.2" />
      <ellipse cx="10" cy="6" rx="2.6" ry="3.4" />
      <ellipse cx="15" cy="6" rx="2.6" ry="3.4" />
      <ellipse cx="20" cy="9" rx="2.6" ry="3.2" />
    </g>
  ),

  bones: wrap(
    <g fill="currentColor">
      <path d="M12 2C7 2 4 5.5 4 10c0 3 1.5 5 3 6v4h10v-4c1.5-1 3-3 3-6 0-4.5-3-8-8-8Z" />
      <circle cx="9" cy="10" r="2" fill="var(--parchment)" />
      <circle cx="15" cy="10" r="2" fill="var(--parchment)" />
      <path d="M11 14h2v3h-2z" fill="var(--parchment)" />
    </g>
  ),

  flask: wrap(
    <g fill="currentColor">
      <path d="M9 2h6v2h-1v5l5 9c1 2 0 4-2 4H7c-2 0-3-2-2-4l5-9V4H9Z" />
      <path d="M8 15h8l2 3.5c.4.8 0 1.5-1 1.5H7c-1 0-1.4-.7-1-1.5Z" fill="var(--vermilion)" />
    </g>
  )
};

// ********************************** Scene to Block **********************************
// Several places share a block on purpose. The motif marks the kind of place the
// line was written in, not the place itself, which is how a printer with a
// drawerful of cuts would have done it.
const SCENE_MOTIF = {
  intro: 'tree',
  thicket: 'tree',
  cave: 'cave',
  deepDark: 'cave',
  ossuary: 'bones',
  bear: 'beast',
  hut: 'hut',
  river: 'water',
  findPotion: 'water',
  bridge: 'water',
  watchtower: 'tower',
  tower: 'tower',
  gate: 'gate',
  passGate: 'gate',
  sidePath: 'shrine',
  shrine: 'shrine',

  // Not a place. Entries the player writes rather than walks into.
  potion: 'flask'
};

export function motifNameFor(scene) {
  return SCENE_MOTIF[scene] || null;
}

export function Motif({ scene }) {
  const name = motifNameFor(scene);
  return name ? BLOCKS[name] : null;
}

export { SCENE_MOTIF };
