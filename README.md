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

Requires Node 22.22.2 or newer, which `engines` in `package.json` enforces.
The floor is set by jsdom 30, the strictest of the build dependencies.

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
    Ornaments.jsx       Gilt corner flourishes, divider and heraldic mark, as SVG
    WorldMap.jsx        The chart, with visited places lit and the rest dim
    WorldMap.test.jsx   Fog of war and current-location tests
  mapLayout.js          Derives map positions and edges from the scene graph
  mapLayout.test.js     Layout, label fit and edge derivation tests
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

## The Known World

The map is a chart of the scene graph, and it is derived rather than drawn. Add a
scene to `gameData.js` and it appears on the map on the next render, positioned
by a breadth-first layering from the intro: distance from the start gives the
row, order of discovery gives the column.

Places you have stood are lit in gold and named. Places you have only heard of
stay dim and nameless, so the chart doubles as a record of where you have been
and a reason to keep walking. A lozenge marks where you stand.

Give a scene a `label` for its name on the map. Without one it falls back to the
scene key split on camelCase, so `sidePath` reads as "Side Path". Labels have to
be short: SVG text neither wraps nor clips, so an over-long label spills across
the chart. `src/mapLayout.test.js` estimates the rendered width and fails if a
label no longer fits its box.

## Look and feel

A dark hall holding a single gilt-framed leaf. The parchment stays as the reading
surface, because long text needs it, but it now sits on near-black with a gold
hairline, drawn corner flourishes and a heraldic mark, the way the reference deck
floats every lit panel on darkness.

Inside the frame the page is an illuminated codex rather than a game HUD:
parchment ground, a ruled and framed writing area, a rubricated hierarchy, and a
gilt versal opening the adventure log.

Ornaments in `src/components/Ornaments.jsx` are inline SVG, drawn from scratch
rather than traced from stock artwork. SVG scales to any frame size, inherits
colour through `currentColor` so one shape serves every accent, and needs no
`img-src` entry in the Content Security Policy.

| Token | Value | Used for |
| --- | --- | --- |
| `--hall` | `#12100D` | The dark hall the leaf sits in |
| `--parchment` | `#ECEADA` | Page ground |
| `--ink` | `#21140F` | Body text |
| `--oxblood` | `#571E10` | Title, win panel, hover fills |
| `--vermilion` | `#A6321C` | Rubrics and section headings |
| `--gold` / `--gold-lit` | `#B8860B` / `#F8B700` | Versal, rules, lozenges |
| `--moss` | `#7A8646` | Health at full strength |

Parchment and oxblood come from a Future Medieval palette; the deep brown ink,
gold and moss are carried over from
[lore-craft](https://github.com/madison-vega/lore-craft), an earlier project by
the same author.

Three faces do the typographic work: **UnifrakturMaguntia** for the blackletter
title and the versal, **Cinzel** for inscriptional Roman capitals on labels and
buttons, and **EB Garamond** for justified manuscript body text.

All styling lives in `src/styles.css`. Two inline styles remain and are
deliberate: the health meter's width, and whatever `react-confetti` sets on its
canvas. The Content Security Policy is written to permit exactly that and no more.

One trap worth knowing before adding ornaments: CSS generated content is folded
into an element's accessible name, so `content: "\2767"` on a button makes screen
readers announce "floral heart, Go north". The choice lozenges are drawn with an
empty box and a background instead. jsdom does not apply CSS, so the test suite
cannot catch a regression here.

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
