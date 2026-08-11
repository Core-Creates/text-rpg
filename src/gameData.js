// ********************************** Game Data Module **********************************
// This file defines the structure and logic for all scenes in the game.
// Each scene may include dynamic text, choices, items, and conditional effects.
//
// label is the name shown on the world map. Keep it under about fourteen
// characters: SVG text neither wraps nor clips, and src/mapLayout.test.js will
// fail if a label no longer fits its box.

const gameData = {
  // ********************************** Intro Scene **********************************
  // The player wakes in the forest. Three directions, one of which is essential.
  intro: {
    label: "Dark Forest",
    text: "You wake up in a dark forest. Paths lead north, east and west.",
    choices: [
      { text: "Go north", next: "cave" },
      { text: "Go east", next: "river" },
      { text: "Go west", next: "thicket" }
    ]
  },

  // ********************************** Cave Scene **********************************
  // First visit hides a bear. Once the cave is known, the way down opens.
  cave: {
    label: "Cold Cave",
    text: (visited) =>
      visited
        ? "The cave is quiet now. A crack in the floor drops into darkness."
        : "You enter a cold cave. You hear growling ahead.",
    choices: (visited) =>
      visited
        ? [
            { text: "Climb down the crack", next: "deepDark" },
            { text: "Go back", next: "intro" }
          ]
        : [
            { text: "Investigate the growling", next: "bear", damage: 20 },
            { text: "Retreat quietly", next: "intro" }
          ]
  },

  // ********************************** Bear Encounter **********************************
  // A trap scene that costs health and sends the player back.
  bear: {
    label: "The Bear",
    text: "A bear chases you out! You barely escape.",
    choices: [{ text: "Run back to the forest", next: "intro" }]
  },

  // ********************************** The Deep **********************************
  // Impassable without light, which sends the player west for the lantern.
  deepDark: {
    label: "The Deep",
    text: "The passage narrows into a blackness your eyes refuse to enter.",
    choices: [
      { text: "Press on into the dark", next: "ossuary", requires: "Lantern" },
      { text: "Climb back up", next: "cave" }
    ]
  },

  // ********************************** Ossuary **********************************
  // Optional branch. Grants the key to the watchtower.
  ossuary: {
    label: "The Ossuary",
    text: "Lantern light finds stacked bones and an iron key on a stone shelf.",
    choices: [{ text: "Take the key and go", next: "deepDark", item: "Iron Key" }]
  },

  // ********************************** Thicket **********************************
  // The western road, and the only source of light.
  thicket: {
    label: "The Thicket",
    text: "Brambles close over the path. Woodsmoke drifts from somewhere ahead.",
    choices: [
      { text: "Follow the smoke", next: "hut" },
      { text: "Return to the forest", next: "intro" }
    ]
  },

  // ********************************** Woodsman's Hut **********************************
  // Grants the Lantern, which gates both the shrine and the ossuary.
  hut: {
    label: "Woodsman Hut",
    text: (visited) =>
      visited
        ? "The hut is empty. Cold ash, and the smell of pine."
        : "An abandoned hut. A lantern still hangs by the door, and it is full.",
    choices: (visited) =>
      visited
        ? [{ text: "Step back outside", next: "thicket" }]
        : [{ text: "Take the lantern", next: "thicket", item: "Lantern" }]
  },

  // ********************************** River Scene **********************************
  // The eastern road. Branches to the ford, the gate, and a healing item.
  river: {
    label: "The River",
    text: "A peaceful river flows here. Something glimmers under the water.",
    choices: [
      { text: "Search the water", next: "findPotion", item: "Potion" },
      { text: "Follow the river", next: "gate" },
      { text: "Cross at the ford", next: "bridge", damage: 10 },
      { text: "Return to the forest", next: "intro" }
    ]
  },

  // ********************************** Find Potion Scene **********************************
  // Grants a healing item to the player.
  findPotion: {
    label: "Still Water",
    text: "You find a healing potion and add it to your inventory.",
    choices: [{ text: "Go back to the river", next: "river" }]
  },

  // ********************************** Old Bridge **********************************
  // Reached by wading, which is why the crossing costs health.
  bridge: {
    label: "Old Bridge",
    text: "You wade out cold and shaking. A collapsed bridge leans on the far bank.",
    choices: [
      { text: "Climb the bank", next: "watchtower" },
      { text: "Wade back", next: "river" }
    ]
  },

  // ********************************** Watchtower **********************************
  // Optional reward branch, locked behind the ossuary key.
  watchtower: {
    label: "Watchtower",
    text: "A watchtower leans over the water, its door banded and locked.",
    choices: [
      { text: "Unlock the door", next: "tower", requires: "Iron Key" },
      { text: "Go back down", next: "bridge" }
    ]
  },

  // ********************************** Tower Room **********************************
  // Pays out a potion and a look at the road ahead.
  tower: {
    label: "Tower Room",
    text: "From the top you see the gate, the shrine beyond it, and a potion on the sill.",
    choices: [{ text: "Take it and climb down", next: "watchtower", item: "Potion" }]
  },

  // ********************************** Gate Scene **********************************
  // Can only be opened with the Emblem. Links to the shrine path.
  gate: {
    label: "The Gate",
    text: (visited) =>
      visited
        ? "The gate still stands, locked and unmoving."
        : "You come across a large gate with a glowing emblem.",
    choices: [
      { text: "Try to open the gate", next: "passGate", requires: "Emblem" },
      { text: "Search nearby", next: "sidePath" },
      { text: "Go back", next: "river" }
    ]
  },

  // ********************************** Side Path Scene **********************************
  // Leads to the shrine, which is too dark to enter empty-handed.
  sidePath: {
    label: "Hidden Path",
    text: "You find a hidden path leading to a shrine. Its doorway is black.",
    choices: [
      { text: "Enter the shrine", next: "shrine", requires: "Lantern" },
      { text: "Go back to the gate", next: "gate" }
    ]
  },

  // ********************************** Shrine Scene **********************************
  // Player acquires the Emblem needed to pass the gate.
  shrine: {
    label: "Ancient Shrine",
    text: "An ancient shrine with an Emblem on the altar. You take it.",
    choices: [{ text: "Return to the gate", next: "gate", item: "Emblem" }]
  },

  // ********************************** Pass Gate Scene **********************************
  // Final scene that ends the game with victory.
  passGate: {
    label: "The Light",
    text: "The gate opens and you step through into the light. You win!",
    choices: []
  }
};

export default gameData;
// ********************************** Game Logic Notes **********************************
// - Each scene has static text or a function of (visited, rand) returning text.
// - visited records scenes already LEFT, so a scene shows its first-visit form on
//   arrival and its second-visit form only when the player comes back.
// - A choice with requires is refused until the item is held; the player stays put.
