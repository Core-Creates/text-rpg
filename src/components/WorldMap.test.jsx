// ********************************** World Map Tests **********************************
// The map is the only place that reveals progress, so the fog of war is worth
// pinning: a place you have not stood in must not give its name away.

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import WorldMap from './WorldMap';

const plate = () => screen.getByRole('img');

describe('world map', () => {
  it('names only the places that have been visited', () => {
    render(<WorldMap visited={{ intro: true, river: true }} current="river" />);

    expect(within(plate()).getByText('Dark Forest')).toBeInTheDocument();
    expect(within(plate()).getByText('The River')).toBeInTheDocument();
    expect(within(plate()).queryByText('Ancient Shrine')).not.toBeInTheDocument();
    expect(within(plate()).queryByText('The Gate')).not.toBeInTheDocument();
  });

  it('hides unvisited places behind a placeholder rather than omitting them', () => {
    render(<WorldMap visited={{ intro: true }} current="intro" />);

    // Eight scenes remain unvisited and each still occupies its place on the map.
    expect(within(plate()).getAllByText('. . .')).toHaveLength(8);
  });

  it('reports discovery progress to assistive technology', () => {
    render(<WorldMap visited={{ intro: true, cave: true }} current="cave" />);

    expect(plate()).toHaveAccessibleName('Map of the world. 2 of 9 places discovered.');
  });

  it('marks the current location apart from the merely visited', () => {
    const { container } = render(
      <WorldMap visited={{ intro: true, river: true }} current="river" />
    );

    expect(container.querySelectorAll('.place.is-here')).toHaveLength(1);
    expect(container.querySelector('.place.is-here text').textContent).toBe('The River');
    expect(container.querySelectorAll('.here-mark')).toHaveLength(1);
  });

  it('lights a road only when both of its ends are known', () => {
    const { container } = render(
      <WorldMap visited={{ intro: true, river: true }} current="river" />
    );

    const lit = container.querySelectorAll('.road.is-known');
    expect(lit).toHaveLength(1);
  });

  it('names where you stand even before you have left it', () => {
    // visited records scenes already departed, so on the opening turn it is
    // empty while the player is nonetheless standing in the forest.
    render(<WorldMap visited={{}} current="intro" />);

    expect(within(plate()).getByText('Dark Forest')).toBeInTheDocument();
    expect(within(plate()).getAllByText('. . .')).toHaveLength(8);
  });

  it('survives a current scene that is not on the map', () => {
    render(<WorldMap visited={{}} current="nowhere" />);

    expect(within(plate()).getAllByText('. . .')).toHaveLength(9);
  });
});
