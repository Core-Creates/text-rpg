import React, { useState } from "react";

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
  

function TextRPG() {
  const [currentScene, setCurrentScene] = useState("intro");
  const [health, setHealth] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState(["intro"]);
  const [visited, setVisited] = useState({ intro: true });
  const [itemLocations, setItemLocations] = useState({});
  const [sceneRandoms, setSceneRandoms] = useState({});

  const [globalSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const seededRandom = (sceneName) => {
    const x = Math.sin(globalSeed + sceneName.length * 97) * 10000;
    return x - Math.floor(x);
  };

  const handleChoice = (choice) => {
    if (choice.requires && !inventory.includes(choice.requires)) {
      alert(`You need ${choice.requires} to do that.`);
      return;
    }

    const damage = choice.damage || 0;
    const item = choice.item;
    const nextScene = choice.next;

    setHealth((prevHealth) => {
      const newHealth = Math.max(prevHealth - damage, 0);
      if (newHealth === 0) {
        setGameOver(true);
      }
      return newHealth;
    });

    if (item) {
      setInventory((prev) => [...prev, item]);
      setItemLocations((prev) => ({ ...prev, [item]: nextScene }));
    }

    setVisited((prev) => ({ ...prev, [nextScene]: true }));
    setSceneRandoms((prev) => ({ ...prev, [nextScene]: seededRandom(nextScene) }));
    setCurrentScene(nextScene);
    setHistory((prev) => [...prev, nextScene]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousScene = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentScene(previousScene);
    }
  };

  const resetGame = () => {
    window.location.reload(); // force new seed
  };

  const sceneObj = gameData[currentScene];
  const rand = sceneRandoms[currentScene] || seededRandom(currentScene);
  const sceneText = typeof sceneObj.text === "function"
    ? sceneObj.text(visited[currentScene], rand)
    : sceneObj.text;
  const sceneChoices = typeof sceneObj.choices === "function"
    ? sceneObj.choices(visited[currentScene], rand)
    : sceneObj.choices;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <label>Seed:</label>
        <p>{globalSeed}</p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Health:</label>
        <div style={{ height: "20px", backgroundColor: "#eee", borderRadius: "5px", overflow: "hidden" }}>
          <div style={{ width: `${health}%`, backgroundColor: health > 50 ? "green" : health > 20 ? "orange" : "red", height: "100%", transition: "width 0.3s ease" }}></div>
        </div>
        <p>{health} HP</p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Inventory:</label>
        <ul>
          {inventory.length === 0 ? (
            <li>(empty)</li>
          ) : (
            inventory.map((item, idx) => (
              <li key={idx}>{item} (found in {itemLocations[item]})</li>
            ))
          )}
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Map History:</label>
        <ul>
          {history.map((sceneId, idx) => (
            <li key={idx}>{sceneId}</li>
          ))}
        </ul>
      </div>

      <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
        <p>{gameOver ? "You have collapsed from your injuries. Game Over." : sceneText}</p>
      </div>

      <div>
        {gameOver ? (
          <button onClick={resetGame} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Restart Game
          </button>
        ) : sceneChoices.length > 0 ? (
          <>
            {sceneChoices.map((choice, idx) => (
              <button key={idx} onClick={() => handleChoice(choice)} style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem 1rem", cursor: "pointer" }}>
                {choice.text}
              </button>
            ))}
            <button onClick={goBack} style={{ display: "block", margin: "1rem 0 0", padding: "0.5rem 1rem", cursor: "pointer" }} disabled={history.length <= 1}>
              Go Back
            </button>
          </>
        ) : (
          <button onClick={resetGame} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Restart
          </button>
        )}
      </div>
    </div>
  );
}

export default TextRPG;
