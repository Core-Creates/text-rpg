// ********************************** Game Data Module **********************************
// This file defines the structure and logic for all scenes in the game.
// Each scene may include dynamic text, choices, items, and conditional effects.

const gameData = {
  // ********************************** Intro Scene **********************************
  // The player wakes up in a forest and can choose a direction to explore.
  intro: {
    text: "You wake up in a dark forest. There are paths leading north and east.",
    choices: [
      { text: "Go north", next: "cave" },
      { text: "Go east", next: "river" }
    ]
  },

  // ********************************** Cave Scene **********************************
  // The cave has different dialogue if already visited. Introduces danger (bear).
  cave: {
    text: (visited, rand) =>
      visited
        ? "The cave is empty now, echoing with silence."
        : "You enter a cold cave. You hear growling ahead.",
    choices: (visited) =>
      visited
        ? [{ text: "Go back", next: "intro" }]
        : [
            { text: "Investigate the growling", next: "bear", damage: 20 },
            { text: "Retreat quietly", next: "intro" }
          ]
  },

  // ********************************** River Scene **********************************
  // Player can search the river for items or follow it to the gate.
  river: {
    text: "A peaceful river flows here. Something glimmers under the water.",
    choices: [
      { text: "Search the water", next: "findPotion", item: "Potion" },
      { text: "Follow the river", next: "gate" },
      { text: "Return to the forest", next: "intro" }
    ]
  },

  // ********************************** Find Potion Scene **********************************
  // Grants a healing item to the player.
  findPotion: {
    text: "You find a healing potion and add it to your inventory.",
    choices: [{ text: "Go back to the river", next: "river" }]
  },

  // ********************************** Bear Encounter **********************************
  // A trap scene that causes damage and sends the player back.
  bear: {
    text: "A bear chases you out! You barely escape.",
    choices: [{ text: "Run back to the forest", next: "intro" }]
  },

  // ********************************** Gate Scene **********************************
  // Can only be opened with the Emblem item. Links to shrine path.
  gate: {
    text: (visited, rand) =>
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
  // Leads to shrine where player can collect the Emblem.
  sidePath: {
    text: "You find a hidden path leading to a shrine.",
    choices: [{ text: "Enter the shrine", next: "shrine" }]
  },

  // ********************************** Shrine Scene **********************************
  // Player acquires the Emblem needed to pass the gate.
  shrine: {
    text: "An ancient shrine with an Emblem on the altar. You take it.",
    choices: [{ text: "Return to the gate", next: "gate", item: "Emblem" }]
  },

  // ********************************** Pass Gate Scene **********************************
  // Final scene that ends the game with victory.
  passGate: {
    text: "The gate opens and you step through into the light. You win!",
    choices: []
  }
};

export default gameData;
// ********************************** Game Logic Notes **********************************
// - Each scene has a static text or a function that returns text based on whether it has been visited.