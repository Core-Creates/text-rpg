// ********************************** Game Data Tests **********************************
// Structural checks on the scene graph. These are pure data tests with no DOM,
// so they catch broken links and unreachable content as soon as a scene is edited.

import gameData from './gameData';

// ********************************** Helpers **********************************
// Scenes may express text and choices either as a value or as a function of
// (visited, rand). Resolve both shapes so the graph can be walked uniformly.
const resolveChoices = (scene, visited) =>
  typeof scene.choices === 'function' ? scene.choices(visited, 0.5) : scene.choices;

const resolveText = (scene, visited) =>
  typeof scene.text === 'function' ? scene.text(visited, 0.5) : scene.text;

// Every choice a scene can ever offer, across both the visited and unvisited states.
const allChoices = (scene) => [
  ...resolveChoices(scene, false),
  ...resolveChoices(scene, true)
];

const sceneNames = Object.keys(gameData);

// ********************************** Scene Shape **********************************
describe('scene shape', () => {
  it.each(sceneNames)('%s produces text in both visited states', (name) => {
    const scene = gameData[name];
    expect(typeof resolveText(scene, false)).toBe('string');
    expect(resolveText(scene, false).length).toBeGreaterThan(0);
    expect(typeof resolveText(scene, true)).toBe('string');
    expect(resolveText(scene, true).length).toBeGreaterThan(0);
  });

  it.each(sceneNames)('%s produces an array of choices in both visited states', (name) => {
    const scene = gameData[name];
    expect(Array.isArray(resolveChoices(scene, false))).toBe(true);
    expect(Array.isArray(resolveChoices(scene, true))).toBe(true);
  });

  it.each(sceneNames)('%s gives every choice a label and a destination', (name) => {
    allChoices(gameData[name]).forEach((choice) => {
      expect(typeof choice.text).toBe('string');
      expect(choice.text.length).toBeGreaterThan(0);
      expect(typeof choice.next).toBe('string');
    });
  });
});

// ********************************** Graph Integrity **********************************
describe('graph integrity', () => {
  it('points every choice at a scene that exists', () => {
    const broken = [];
    sceneNames.forEach((name) => {
      allChoices(gameData[name]).forEach((choice) => {
        if (!gameData[choice.next]) {
          broken.push(`${name} -> ${choice.next}`);
        }
      });
    });
    expect(broken).toEqual([]);
  });

  it('reaches every scene from the intro', () => {
    const seen = new Set(['intro']);
    const queue = ['intro'];

    while (queue.length > 0) {
      const name = queue.shift();
      allChoices(gameData[name]).forEach((choice) => {
        if (gameData[choice.next] && !seen.has(choice.next)) {
          seen.add(choice.next);
          queue.push(choice.next);
        }
      });
    }

    const unreachable = sceneNames.filter((name) => !seen.has(name));
    expect(unreachable).toEqual([]);
  });

  it('ends the game at passGate with no further choices', () => {
    expect(resolveChoices(gameData.passGate, false)).toHaveLength(0);
  });

  it('leaves no dead end other than the winning scene', () => {
    const deadEnds = sceneNames.filter(
      (name) => allChoices(gameData[name]).length === 0
    );
    expect(deadEnds).toEqual(['passGate']);
  });
});

// ********************************** Progression Rules **********************************
describe('progression rules', () => {
  it('gates the win behind the Emblem', () => {
    const winning = resolveChoices(gameData.gate, false).find(
      (choice) => choice.next === 'passGate'
    );
    expect(winning).toBeDefined();
    expect(winning.requires).toBe('Emblem');
  });

  it('grants every required item somewhere in the graph', () => {
    const required = new Set();
    const granted = new Set();

    sceneNames.forEach((name) => {
      allChoices(gameData[name]).forEach((choice) => {
        if (choice.requires) required.add(choice.requires);
        if (choice.item) granted.add(choice.item);
      });
    });

    const ungrantable = [...required].filter((item) => !granted.has(item));
    expect(ungrantable).toEqual([]);
  });

  it('reaches the Emblem without needing the Emblem', () => {
    // Walk the graph collecting items, refusing any choice whose requirement is
    // not yet satisfied. The Emblem must be reachable under those rules or the
    // game is unwinnable.
    const inventory = new Set();
    const seen = new Set(['intro']);
    let queue = ['intro'];
    let progressed = true;

    while (progressed) {
      progressed = false;
      const deferred = [];

      while (queue.length > 0) {
        const name = queue.shift();
        allChoices(gameData[name]).forEach((choice) => {
          if (choice.requires && !inventory.has(choice.requires)) {
            deferred.push(name);
            return;
          }
          if (choice.item && !inventory.has(choice.item)) {
            inventory.add(choice.item);
            progressed = true;
          }
          if (gameData[choice.next] && !seen.has(choice.next)) {
            seen.add(choice.next);
            queue.push(choice.next);
            progressed = true;
          }
        });
      }

      queue = deferred;
    }

    expect(inventory.has('Emblem')).toBe(true);
  });

  it('never applies negative damage', () => {
    sceneNames.forEach((name) => {
      allChoices(gameData[name]).forEach((choice) => {
        if (choice.damage !== undefined) {
          expect(choice.damage).toBeGreaterThan(0);
        }
      });
    });
  });
});
