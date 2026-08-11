// ********************************** Motif Tests **********************************
// The mapping is hand-written while the scene graph is not, so the thing worth
// guarding is that the two stay in step.

import React from 'react';
import { render } from '@testing-library/react';
import gameData from '../gameData';
import { Motif, motifNameFor, SCENE_MOTIF } from './Motifs';

describe('scene motifs', () => {
  it('gives every scene a block', () => {
    const missing = Object.keys(gameData).filter((name) => !motifNameFor(name));
    expect(missing).toEqual([]);
  });

  it('maps no block to a scene that does not exist', () => {
    const places = Object.keys(SCENE_MOTIF).filter((key) => key !== 'potion');
    const unknown = places.filter((name) => !gameData[name]);
    expect(unknown).toEqual([]);
  });

  it('renders a block for a known scene', () => {
    const { container } = render(<Motif scene="river" />);
    expect(container.querySelector('svg.motif')).toBeInTheDocument();
  });

  it('renders nothing for an unknown scene rather than throwing', () => {
    const { container } = render(<Motif scene="nowhere" />);
    expect(container.querySelector('svg.motif')).not.toBeInTheDocument();
  });

  it('gives the potion its own block, since it is not a place', () => {
    expect(motifNameFor('potion')).toBe('flask');
    expect(gameData.potion).toBeUndefined();
  });

  it('shares one block between places of the same kind', () => {
    // The cut marks the kind of place, not the place, so reuse is intended.
    expect(motifNameFor('intro')).toBe(motifNameFor('thicket'));
    expect(motifNameFor('river')).toBe(motifNameFor('bridge'));
    expect(motifNameFor('gate')).toBe(motifNameFor('passGate'));
    expect(motifNameFor('watchtower')).toBe(motifNameFor('tower'));
  });

  it('hides every block from assistive technology', () => {
    const { container } = render(<Motif scene="cave" />);
    expect(container.querySelector('svg.motif')).toHaveAttribute('aria-hidden', 'true');
  });
});
