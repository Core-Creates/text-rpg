# Text RPG

A short browser-based text adventure. You wake up in a dark forest with no memory
of how you got there, three paths in front of you, and a locked gate somewhere
downriver. Find the Emblem, open the gate, and step into the light.

Sixteen places, three items and two locked doors. The shrine that holds the
Emblem is pitch dark, so the lantern in the woodsman's hut has to be found first;
everything else, the bear, the ossuary and the watchtower, is optional.

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
  when used, capped at 100. The **Lantern** opens the shrine and the deep passage
  under the cave. The **Iron Key** unlocks the watchtower. The **Emblem** opens
  the gate and ends the game.
- **Seed** is a per-session number that drives the deterministic per-scene random
  values available to scene text.

The log keeps the opening line and the four most recent entries, folding the
middle away behind a toggle so the choices never drift far down the page. The
opening line always stays: it carries the illuminated capital, and an incipit
that vanished on the fifth move would be a strange thing for a codex to do.

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
| `npm run lint` | ESLint, the way CI runs it |

## Project layout

```
index.html              Page shell and Content Security Policy, Vite entry
vite.config.js          Build config, Vitest config, and the build-time CSP
eslint.config.js        ESLint flat config
public/                 Copied verbatim into the build: icons, manifest, robots
src/
  index.jsx             Mounts App into #root
  App.jsx               Shell, renders Game
  gameData.js           The scene graph: all text, choices, items and damage
  gameData.test.js      Structural tests over the scene graph
  styles.css            Font faces, global styling and the pixel sword cursor
  assets/fonts/         Self-hosted woff2 files, referenced from styles.css
  setupTests.js         Vitest setup, stubs jsdom media playback
  components/
    Game.jsx            State machine: health, inventory, visited scenes, win state
    Game.test.jsx       Playthrough tests driven through the UI
    Sound.jsx           Audio layer, matches sounds to scene and log keywords
    Ornaments.jsx       Deckle filter, vine border, flourishes, divider, wyvern
    Motifs.jsx          Ten woodcut blocks and the scene they each mark
    Motifs.test.jsx     Keeps the block mapping in step with the scene graph
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
  label: "The Clearing",
  text: "A quiet clearing opens up. Moonlight pools on the grass.",
  choices: [
    { text: "Look at the stars", next: "stars" },
    { text: "Head back", next: "intro" }
  ]
}
```

`label` is the name shown on the world map, and is described under
[The Known World](#the-known-world) below. A scene needs at least one choice
unless it ends the game, since `gameData.test.js` treats any other dead end as a
mistake.

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

The leaf is built in three layers, outermost first, the way a real illuminated
page is:

1. **A torn sheet of vellum.** The deckle edge is an SVG turbulence filter. It is
   applied to `.codex::before`, a bare parchment rectangle behind the content,
   and deliberately not to the leaf itself: filtering an element rasterises its
   whole subtree and softens every line of type on the page.
2. **A ruled floral border** set inside the torn edge. Four SVG strips carrying a
   tiled pattern of vermilion and lapis rosettes with gilt centres, strung on a
   green vine. The strips carry no `viewBox` on purpose, so user units equal CSS
   pixels and the flowers tile at a fixed size along an edge of any length rather
   than stretching to fit.
3. **Grotesques** perched on the border, two wyverns facing each other across
   the foot of the page. They mean nothing, which is the point of them. Hidden
   on narrow leaves, where there is no margin for them to stand in.
4. **The written area**, inset from all of it.

Past 78rem the leaf opens into a **two-page spread**: the miniature and the
marginal annotations on the verso, the narrative and the choices on the recto,
with a shaded gutter between. The pages are laid out in source order recto then
verso, so a screen reader and a narrow viewport both get the title, the story and
the choices before the map; `order` only moves the verso left once there is room
for two columns.

Each line of the record after the first carries a **woodcut block** in the
margin, keyed to the kind of place it was written in: a tree for the forest and
the thicket, waves for the river and the ford, a skull for the ossuary, a paw for
the bear. Ten blocks serve sixteen scenes, because the cut marks the *kind* of
place rather than the place, which is how a printer with a drawerful of blocks
would have done it. `Motifs.test.jsx` fails if a new scene has no block, or if a
block points at a scene that no longer exists.

The opening line takes no block. It has its versal, and two illuminations on one
line would fight.

Log entries therefore carry the scene they were written in alongside their text,
which is also why `Sound.jsx` reads `entry.text` rather than the entry itself.

The world map is treated as the page's miniature: an ultramarine ground powdered
with gilt bezants, under an ogee arch. `mapLayout.js` reserves `PAD_TOP` of
clearance so the first row of places clears the arch shoulders.

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
| `--lapis` | `#1F3A6E` | The ground the world map is painted on |
| `--vine` | `#4B6B3A` | The vine stringing the border rosettes |

Parchment and oxblood come from a Future Medieval palette; the deep brown ink,
gold and moss are carried over from
[lore-craft](https://github.com/madison-vega/lore-craft), an earlier project by
the same author.

Three faces do the typographic work: **UnifrakturMaguntia** for the blackletter
title and the versal, **Cinzel** for inscriptional Roman capitals on labels and
buttons, and **EB Garamond** for justified manuscript body text.

All three are **self-hosted** from `src/assets/fonts`, declared at the top of
`styles.css` and fingerprinted by Vite. Nothing is fetched from Google, which
keeps `style-src` and `font-src` at `'self'` and avoids handing visitor IPs to a
third party. Cinzel and EB Garamond are variable fonts, so one file serves both
the 400 and 600 declarations; the filenames carry no weight for that reason.
Faces are split by `unicode-range`, so an English page fetches only the latin
subsets.

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
