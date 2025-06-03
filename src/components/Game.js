import React, { useState } from 'react';
import gameData from '../gameData';

// ********************************** Main Game Component **********************************
function Game() {
  // ********************************** State Management **********************************

  const [currentScene, setCurrentScene] = useState('intro');       // Current scene name
  const [health, setHealth] = useState(100);                       // Player health value
  const [inventory, setInventory] = useState([]);                  // Items currently held by player
  const [log, setLog] = useState([gameData.intro.text]);          // Adventure log tracking narrative events
  const [visited, setVisited] = useState({ intro: true });         // Tracks which scenes have been visited
  const [sceneRandoms, setSceneRandoms] = useState({});            // Pre-generated pseudo-random values per scene
  const [globalSeed] = useState(() => Math.floor(Math.random() * 1000000));  // Consistent random seed for game session

  // ********************************** Random Number Generator **********************************
  const seededRandom = (sceneName) => {
    // Generates a reproducible random value per scene based on globalSeed
    const x = Math.sin(globalSeed + sceneName.length * 97) * 10000;
    return x - Math.floor(x);
  };

  // ********************************** Handle Player Choice **********************************
  const handleChoice = (choice) => {
    // Check for required item before allowing the choice
    if (choice.requires && !inventory.includes(choice.requires)) {
      setLog(prev => [...prev, `You need ${choice.requires} to do that.`]);
      return;
    }

    const damage = choice.damage || 0;     // Damage inflicted by choice (if any)
    const item = choice.item;              // Item gained from this choice
    const nextScene = choice.next;         // Scene to transition to next

    setHealth(prev => Math.max(prev - damage, 0)); // Apply damage if applicable
    if (item) setInventory(prev => [...prev, item]); // Add item to inventory if applicable

    setVisited(prev => ({ ...prev, [nextScene]: true }));                  // Mark new scene as visited
    setSceneRandoms(prev => ({ ...prev, [nextScene]: seededRandom(nextScene) })); // Pre-compute RNG for scene
    setCurrentScene(nextScene);                                            // Move to new scene

    // Get new scene text (function or static string)
    const rand = sceneRandoms[nextScene] || seededRandom(nextScene);
    const newText = typeof gameData[nextScene].text === 'function'
      ? gameData[nextScene].text(visited[nextScene], rand)
      : gameData[nextScene].text;

    setLog(prev => [...prev, newText]); // Append new text to adventure log
  };

  // ********************************** Use Potion Action **********************************
  const usePotion = () => {
    if (inventory.includes("Potion")) {
      setHealth(Math.min(100, health + 20));                        // Heal up to 100 max
      setInventory(inventory.filter(item => item !== "Potion"));   // Remove used potion
      setLog([...log, "You used a potion and restored health!"]);
    } else {
      setLog([...log, "No potions left!"]);
    }
  };

  // ********************************** Scene & Choice Preparation **********************************
  const rand = sceneRandoms[currentScene] || seededRandom(currentScene); // Get stored or generate random
  const scene = gameData[currentScene];                                  // Current scene data
  const sceneChoices = typeof scene.choices === 'function'
    ? scene.choices(visited[currentScene], rand)                         // Handle dynamic choices
    : scene.choices;

  // ********************************** Render UI **********************************
  return (
    <div>
      {/* Game Stats */}
      <p><strong>Seed:</strong> {globalSeed}</p>
      <p><strong>Health:</strong> {health}</p>
      <p><strong>Inventory:</strong> {inventory.join(", ") || "Empty"}</p>
      <button onClick={usePotion}>Use Potion</button>

      {/* Render Scene Choices */}
      {sceneChoices.map((choice, i) => (
        <button key={i} onClick={() => handleChoice(choice)} style={{ margin: '0.5em' }}>
          {choice.text}
        </button>
      ))}

      {/* Render Adventure Log */}
      <div style={{ marginTop: "1em" }}>
        <strong>Adventure Log:</strong>
        <ul>
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Game;
