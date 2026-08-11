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

// The canonical winning route. The lantern is mandatory: the shrine doorway is
// dark, so the west road has to be walked before the east one pays out.
const walkToTheLight = async (user) => {
  await choose(user, 'Go west');
  await choose(user, 'Follow the smoke');
  await choose(user, 'Take the lantern');
  await choose(user, 'Return to the forest');
  await choose(user, 'Go east');
  await choose(user, 'Follow the river');
  await choose(user, 'Search nearby');
  await choose(user, 'Enter the shrine');
  await choose(user, 'Return to the gate');
  await choose(user, 'Try to open the gate');
};

// queryAllByText rather than queryByText: revisiting a scene writes its text
// into the log again, and the single-match query throws on the duplicate.
const logContains = (text) =>
  within(adventureLog()).queryAllByText(text).length > 0;

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

    await walkToTheLight(user);

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

    await walkToTheLight(user);

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

    expect(screen.getByRole('button', { name: 'Climb down the crack' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Investigate the growling' })
    ).not.toBeInTheDocument();
    expect(
      logContains('The cave is quiet now. A crack in the floor drops into darkness.')
    ).toBe(true);
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

// ********************************** The Western Road **********************************
// The lantern gates both the shrine and the deep, so the west road is mandatory.
describe('the lantern', () => {
  it('is refused entry to the shrine without it', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Follow the river');
    await choose(user, 'Search nearby');
    await choose(user, 'Enter the shrine');

    expect(logContains('You need Lantern to do that.')).toBe(true);
    expect(screen.getByRole('button', { name: 'Enter the shrine' })).toBeInTheDocument();
  });

  it('is taken from the hut and opens the shrine', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go west');
    await choose(user, 'Follow the smoke');
    await choose(user, 'Take the lantern');

    expect(vital('Inventory')).toHaveTextContent('Lantern');

    await choose(user, 'Return to the forest');
    await choose(user, 'Go east');
    await choose(user, 'Follow the river');
    await choose(user, 'Search nearby');
    await choose(user, 'Enter the shrine');
    // The Emblem is granted by leaving the shrine, not by entering it.
    await choose(user, 'Return to the gate');

    expect(vital('Inventory')).toHaveTextContent('Emblem');
  });

  it('leaves the hut empty once the lantern is gone', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go west');
    await choose(user, 'Follow the smoke');
    await choose(user, 'Take the lantern');
    await choose(user, 'Follow the smoke');

    expect(screen.getByRole('button', { name: 'Step back outside' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Take the lantern' })
    ).not.toBeInTheDocument();
  });
});

// ********************************** The Optional Road **********************************
// Neither the ossuary nor the tower is needed to win. Both should still work.
describe('the ossuary and the tower', () => {
  it('refuses the deep without a lantern and yields the key with one', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go north');
    await choose(user, 'Retreat quietly');
    await choose(user, 'Go north');
    await choose(user, 'Climb down the crack');
    await choose(user, 'Press on into the dark');

    expect(logContains('You need Lantern to do that.')).toBe(true);

    await choose(user, 'Climb back up');
    await choose(user, 'Go back');
    await choose(user, 'Go west');
    await choose(user, 'Follow the smoke');
    await choose(user, 'Take the lantern');
    await choose(user, 'Return to the forest');
    await choose(user, 'Go north');
    await choose(user, 'Climb down the crack');
    await choose(user, 'Press on into the dark');
    await choose(user, 'Take the key and go');

    expect(vital('Inventory')).toHaveTextContent('Iron Key');
  });

  it('charges health to cross the ford', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Cross at the ford');

    expect(screen.getByRole('meter', { name: 'Health' })).toHaveAttribute(
      'aria-valuenow',
      '90'
    );
  });

  it('keeps the tower locked without the iron key', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Cross at the ford');
    await choose(user, 'Climb the bank');
    await choose(user, 'Unlock the door');

    expect(logContains('You need Iron Key to do that.')).toBe(true);
  });
});

// ********************************** Folding the Log **********************************
// A long playthrough would otherwise push the choices far below the fold.
describe('the folded log', () => {
  const entries = () => within(adventureLog()).getAllByRole('listitem');

  it('shows no toggle while the record is short', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go east');
    await choose(user, 'Search the water');

    expect(entries()).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /Read all/ })).not.toBeInTheDocument();
  });

  it('folds the middle away once the record runs long, keeping the incipit', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go west');
    await choose(user, 'Follow the smoke');
    await choose(user, 'Take the lantern');
    await choose(user, 'Return to the forest');
    await choose(user, 'Go east');
    await choose(user, 'Follow the river');

    // The opening line plus the four most recent. The elision mark between them
    // is aria-hidden, so it is deliberately absent from the accessible list.
    expect(entries()).toHaveLength(5);
    // The incipit survives at the head, the newest line survives at the foot,
    // and the hut in the middle is folded away.
    expect(logContains('You wake up in a dark forest. Paths lead north, east and west.')).toBe(true);
    expect(logContains('You come across a large gate with a glowing emblem.')).toBe(true);
    expect(
      logContains('An abandoned hut. A lantern still hangs by the door, and it is full.')
    ).toBe(false);
  });

  it('keeps the versal on the opening line rather than on the elision', async () => {
    const user = setupUser();
    const { container } = render(<Game />);

    await choose(user, 'Go west');
    await choose(user, 'Follow the smoke');
    await choose(user, 'Take the lantern');
    await choose(user, 'Return to the forest');
    await choose(user, 'Go east');

    const versals = container.querySelectorAll('.log-entries li.versal');
    expect(versals).toHaveLength(1);
    expect(versals[0].textContent).toMatch(/^You wake up/);
  });

  it('unfolds the whole record on request, and folds it back', async () => {
    const user = setupUser();
    render(<Game />);

    await choose(user, 'Go west');
    await choose(user, 'Follow the smoke');
    await choose(user, 'Take the lantern');
    await choose(user, 'Return to the forest');
    await choose(user, 'Go east');
    await choose(user, 'Follow the river');

    await user.click(screen.getByRole('button', { name: 'Read all 7 entries' }));

    expect(entries()).toHaveLength(7);
    expect(logContains('Brambles close over the path. Woodsmoke drifts from somewhere ahead.')).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Fold the record away' }));

    expect(entries()).toHaveLength(5);
  });
});
