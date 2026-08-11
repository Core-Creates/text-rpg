# Text RPG

A short browser-based text adventure. You wake up in a dark forest with no memory
of how you got there, two paths in front of you, and a locked gate somewhere
downriver. Find the Emblem, open the gate, and step into the light.

Play it here: **https://core-creates.github.io/text-rpg/**

Built with React 18 on Vite, tested with Vitest. Ambient audio, scene transitions
and a confetti win screen are all handled client side, so there is no backend to
run.

## Playing

Every scene gives you a block of text and a set of buttons. Clicking a button
moves you to another scene and appends the new text to the adventure log at the
bottom of the page.

Three things carry across scenes:

- **Health** starts at 100 and drops when a choice carries damage.
- **Inventory** holds items picked up along the way. The Potion restores 20 health
  when used, capped at 100. The Emblem is required to open the gate.
- **Seed** is a per-session number that drives the deterministic per-scene random
  values available to scene text.

Audio settings live behind the button at the top right, with a volume slider and a
mute toggle. Browsers block autoplay until you interact with the page, so sound
starts after your first click.

## Running locally

Requires Node 20 or newer.

```bash
git clone https://github.com/Core-Creates/text-rpg.git
cd text-rpg
npm ci
npm run dev
```

The dev server opens on http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot module replacement |
| `npm test` | Vitest in interactive watch mode |
| `npm run test:run` | Single test run, the way CI runs it |
| `npm run build` | Production bundle into `build/` |
| `npm run preview` | Serve the built bundle locally to check it |

## Project layout

```
index.html              Page shell and Content Security Policy, Vite entry
vite.config.js          Build config and Vitest config, sets the Pages base path
public/                 Copied verbatim into the build: icons, manifest, robots
src/
  index.jsx             Mounts App into #root
  App.jsx               Shell, renders Game
  gameData.js           The scene graph: all text, choices, items and damage
  gameData.test.js      Structural tests over the scene graph
  styles.css            Global styling and the pixel sword cursor
  setupTests.js         Vitest setup, stubs jsdom media playback
  components/
    Game.jsx            State machine: health, inventory, visited scenes, win state
    Game.test.jsx       Playthrough tests driven through the UI
    Sound.jsx           Audio layer, matches sounds to scene and log keywords
```

## Adding a scene

Scenes live in `src/gameData.js` as keys on a single object. The minimum shape is
a `text` string and a `choices` array:

```js
clearing: {
  text: "A quiet clearing opens up. Moonlight pools on the grass.",
  choices: [
    { text: "Rest here", next: "clearing" },
    { text: "Head back", next: "intro" }
  ]
}
```

Each choice supports these fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `text` | yes | The button label |
| `next` | yes | Key of the scene to move to |
| `item` | no | Item added to the inventory on selection |
| `requires` | no | Item that must already be held, otherwise the move is refused |
| `damage` | no | Health subtracted on selection |

Both `text` and `choices` can instead be a function of `(visited, rand)`, which
lets a scene read differently the second time you enter it. `visited` is a boolean
and `rand` is the seeded value for that scene:

```js
choices: (visited) =>
  visited
    ? [{ text: "Go back", next: "intro" }]
    : [{ text: "Look closer", next: "discovery" }]
```

The tests in `src/gameData.test.js` walk the graph automatically, so a new scene
is checked for broken links, reachability from the intro, unwinnable item
requirements and accidental dead ends without writing anything new.

## Audio

Sound files are hosted in an S3 bucket and referenced directly as `<audio>`
sources in `src/components/Sound.js`. Playback is keyword driven: the component
looks at the current scene name, the current scene text and the last three log
entries, then starts or stops each track accordingly. A scene mentioning a river
starts the river loop whether or not it is the river scene.

## Deployment

Pushes to `main` trigger `.github/workflows/cicd.yml`, which installs
dependencies, audits them, runs the test suite, builds the production bundle and
publishes it to GitHub Pages. Pull requests against `main` run install, audit,
test and build without deploying. CodeQL runs alongside on both events.

The `base` option in `vite.config.js` sets the asset base path for the
`/text-rpg` subdirectory, and `homepage` in `package.json` records the same URL.
If the repository is ever renamed, both have to change or the deployed bundle
will request its assets from the wrong path.

See [SECURITY.md](SECURITY.md) for the threat model and the hardening applied to
the pipeline.

## Credits

Created by Corrina Alcoser.

Sound effects from freesound.org: River by klankbeeld, Growl by FK_Prod, Fanfare
by bone666138, Cave by HermanDV, Footsteps by ScreenplayTheater.

## License

MIT. See [LICENSE](LICENSE).
