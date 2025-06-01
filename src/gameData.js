// src/gameData.js

const gameData = {
  intro: {
    text: "You wake up in a dark forest. There are paths leading north and east.",
    choices: (visited, rand) => [
      { text: "Go north", next: "cave" },
      { text: "Go east", next: "river" },
      ...(rand > 0.8 ? [{ text: "Climb a tree to scout the area", next: "scout", item: "Forest Map" }] : []),
    ],
  },
  cave: {
    text: (visited, rand) => {
      if (!visited) return "You enter a cold cave. You hear growling ahead.";
      return rand < 0.5 ? "The cave is empty and eerily quiet." : "You find old tracks in the dust. Something was here.";
    },
    choices: (visited, rand) => [
      ...(rand > 0.6 ? [{ text: "Investigate the growling", next: "bear", damage: 20 }] : []),
      { text: "Run back", next: "intro" },
    ],
  },
  river: {
    text: (visited, rand) => {
      if (!visited) return "You reach a river. The current looks strong.";
      return rand < 0.5 ? "The river has risen. Crossing seems riskier now." : "You spot fish jumping in the water.";
    },
    choices: (visited, rand) => [
      { text: "Follow the river", next: "waterfall" },
      ...(rand > 0.3 ? [{ text: "Swim across", next: "acrossRiver", damage: 10, item: "Wet Cloak" }] : []),
    ],
  },
  bear: {
    text: (visited, rand) => {
      if (!visited) return "A bear chases you out! You barely escape.";
      return rand < 0.5 ? "You see claw marks on the cave wall." : "You hear distant growling again...";
    },
    choices: () => [
      { text: "Return to forest", next: "intro" },
    ],
  },
  acrossRiver: {
    text: () => "You manage to swim across and find a village. You're safe!",
    choices: () => [],
  },
  waterfall: {
    text: (visited, rand) => {
      if (!visited) return "You find a waterfall with a hidden path behind it.";
      return rand < 0.5 ? "The water roars louder than before." : "The path seems more worn, as if others came this way.";
    },
    choices: () => [
      { text: "Explore the path", next: "treasure", item: "Gold Coin" },
      { text: "Go back", next: "river" },
    ],
  },
  treasure: {
    text: () => "You find a hidden treasure! You win!",
    choices: () => [],
  },
  guardedGate: {
    text: (visited, rand) => {
      if (!visited) return "A guard blocks your way and demands a Gold Coin to pass.";
      return rand < 0.5 ? "The guard looks bored but still expects payment." : "The guard warns you this is your last chance.";
    },
    choices: () => [
      { text: "Offer Gold Coin", next: "passGate", requires: "Gold Coin" },
      { text: "Leave", next: "intro" },
    ],
  },
  passGate: {
    text: () => "The guard accepts your coin and lets you pass into a peaceful valley.",
    choices: () => [],
  },
  scout: {
    text: () => "You climb a tall tree and gain a better sense of the area. You can now navigate more easily.",
    choices: () => [
      { text: "Climb down and go north", next: "cave" },
      { text: "Climb down and go east", next: "river" },
    ],
  },
};

export default gameData;
