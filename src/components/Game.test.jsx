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

const adventureLog = () =>
  screen.getByText('Adventure Log:').closest('div').querySelector('ul');

const logContains = (text) =>
  within(adventureLog()).queryByText(text) !== null;

// ********************************** Initial State **********************************
describe('initial state', () => {
  it('opens on the intro scene at full health with an empty inventory', () => {
    render(<Game />);

    expect(
      screen.getByText(/You wake up in a dark forest/)
    ).toBeInTheDocument();
    expect(screen.getByText('Health:').parentElement).toHaveTextContent('Health: 100');
    expect(screen.getByText('Inventory:').parentElement).toHaveTextContent('Inventory: Empty');
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

    expect(screen.getByText('Inventory:').parentElement).toHaveTextContent('Inventory: Potion');
    expect(screen.getByText(/You find a healing potion/)).toBeInTheDocument();
  });

  it('consumes the potion when it is used', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Search the water');
    await choose(user, 'Use Potion');

    expect(screen.getByText('Inventory:').parentElement).toHaveTextContent('Inventory: Empty');
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

    expect(screen.getByText('Inventory:').parentElement).toHaveTextContent('Emblem');

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

    expect(screen.queryByText('Credits:')).not.toBeInTheDocument();

    expect(
      await screen.findByText('Credits:', {}, { timeout: 4000 })
    ).toBeInTheDocument();
  }, 10000);
});

// ********************************** Known Behaviour **********************************
describe('cave arrival', () => {
  // handleChoice marks the destination visited before the destination renders,
  // so the cave shows its already-visited choices on the very first arrival and
  // the bear encounter cannot be reached through the UI. This test pins the
  // current behaviour; change it deliberately if the visited flag is fixed.
  it('shows the visited choice set on first arrival', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go north');

    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Investigate the growling' })
    ).not.toBeInTheDocument();
  });
});
