// ********************************** Game Component Tests **********************************
// Drives the game through the UI the way a player would, so scene transitions,
// inventory gating and the win condition stay wired together.

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from './Game';

// Confetti paints to a canvas, which jsdom does not implement. The win state is
// what matters here, not the particles.
vi.mock('react-confetti', () => ({
  __esModule: true,
  default: () => null
}));

// ********************************** Helpers **********************************
// delay: null skips user-event's inter-event waits. Nothing here depends on
// realistic input timing, and it keeps the suite fast.
const setupUser = () => userEvent.setup({ delay: null });

const choose = (user, label) =>
  user.click(screen.getByRole('button', { name: label }));

const adventureLog = () => screen.getByRole('list', { name: /adventure log/i });

// Each vital is a label span followed by its value span, inside one .vital block.
const vital = (label) => screen.getByText(label).parentElement;

const logContains = (text) =>
  within(adventureLog()).queryByText(text) !== null;

// ********************************** Initial State **********************************
describe('initial state', () => {
  it('opens on the intro scene at full health with an empty inventory', () => {
    render(<Game />);

    expect(
      screen.getByText(/You wake up in a dark forest/)
    ).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Health' })).toHaveAttribute('aria-valuenow', '100');
    expect(vital('Inventory')).toHaveTextContent('Empty');
  });

  it('offers both starting directions', () => {
    render(<Game />);

    expect(screen.getByRole('button', { name: 'Go north' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go east' })).toBeInTheDocument();
  });
});

// ********************************** Inventory **********************************
describe('inventory', () => {
  it('adds the potion to the inventory when the water is searched', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Search the water');

    expect(vital('Inventory')).toHaveTextContent('Potion');
    expect(screen.getByText(/You find a healing potion/)).toBeInTheDocument();
  });

  it('consumes the potion when it is used', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Search the water');
    await choose(user, 'Use Potion');

    expect(vital('Inventory')).toHaveTextContent('Empty');
    expect(logContains('You used a potion and restored health!')).toBe(true);
  });

  it('reports an empty pouch when there is no potion to use', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Use Potion');

    expect(logContains('No potions left!')).toBe(true);
  });
});

// ********************************** Gating **********************************
describe('the gate', () => {
  it('refuses to open without the Emblem and keeps the player in place', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Follow the river');
    await choose(user, 'Try to open the gate');

    expect(logContains('You need Emblem to do that.')).toBe(true);
    expect(screen.getByRole('button', { name: 'Search nearby' })).toBeInTheDocument();
  });
});

// ********************************** Win Condition **********************************
describe('winning', () => {
  it('completes the shrine route and shows the win banner', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Follow the river');
    await choose(user, 'Search nearby');
    await choose(user, 'Enter the shrine');
    await choose(user, 'Return to the gate');

    expect(vital('Inventory')).toHaveTextContent('Emblem');

    await choose(user, 'Try to open the gate');

    // Matched on the banner wording rather than "You win", which also appears
    // in the passGate log entry.
    expect(screen.getByText(/Thanks for playing/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Try to open the gate' })
    ).not.toBeInTheDocument();
  });

  // Real timers rather than vi.useFakeTimers. Vitest's fake timers replace
  // queueMicrotask and nextTick, which user-event depends on, and the clicks
  // deadlock. Waiting out the real two second delay is slower but honest.
  it('reveals the credits two seconds after the win', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Follow the river');
    await choose(user, 'Search nearby');
    await choose(user, 'Enter the shrine');
    await choose(user, 'Return to the gate');
    await choose(user, 'Try to open the gate');

    expect(screen.queryByText('Credits')).not.toBeInTheDocument();

    expect(
      await screen.findByText('Credits', {}, { timeout: 4000 })
    ).toBeInTheDocument();
  }, 10000);
});

// ********************************** Revisiting **********************************
// visited records scenes already departed, so a scene renders its first-visit
// form on arrival and its second-visit form only when you come back. These pin
// the fix: handleChoice used to mark the destination visited before it rendered,
// which showed every scene's second-visit form immediately and made the bear
// unreachable.
describe('revisiting a scene', () => {
  it('offers the first-visit choices on first arrival at the cave', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go north');

    expect(
      screen.getByRole('button', { name: 'Investigate the growling' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retreat quietly' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
    expect(logContains('You enter a cold cave. You hear growling ahead.')).toBe(true);
  });

  it('offers the second-visit choices on returning to the cave', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go north');
    await choose(user, 'Retreat quietly');
    await choose(user, 'Go north');

    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Investigate the growling' })
    ).not.toBeInTheDocument();
    expect(logContains('The cave is empty now, echoing with silence.')).toBe(true);
  });

  it('changes the gate text on a second visit', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Follow the river');
    expect(logContains('You come across a large gate with a glowing emblem.')).toBe(true);

    await choose(user, 'Go back');
    await choose(user, 'Follow the river');
    expect(logContains('The gate still stands, locked and unmoving.')).toBe(true);
  });
});

// ********************************** The Bear **********************************
// Unreachable through the UI until the visited flag was corrected.
describe('the bear', () => {
  it('costs 20 health to investigate the growling', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go north');
    await choose(user, 'Investigate the growling');

    expect(screen.getByRole('meter', { name: 'Health' })).toHaveAttribute(
      'aria-valuenow',
      '80'
    );
    expect(logContains('A bear chases you out! You barely escape.')).toBe(true);
  });

  it('restores health with a potion after the mauling, capped at 100', async () => {
    const user = setupUser();
    render(<Game />);

    // Collect the potion first, then go and get hurt.
    await choose(user, 'Go east');
    await choose(user, 'Search the water');
    await choose(user, 'Go back to the river');
    await choose(user, 'Return to the forest');
    await choose(user, 'Go north');
    await choose(user, 'Investigate the growling');

    expect(screen.getByRole('meter', { name: 'Health' })).toHaveAttribute(
      'aria-valuenow',
      '80'
    );

    await choose(user, 'Use Potion');

    expect(screen.getByRole('meter', { name: 'Health' })).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    expect(vital('Inventory')).toHaveTextContent('Empty');
  });
});
