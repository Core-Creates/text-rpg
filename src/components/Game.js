// ********************************** Imports **********************************
import React, { useState } from 'react';
import gameData from '../gameData';

// ********************************** Game Component **********************************
function Game() {
  // ********************************** State Initialization **********************************
  const [currentScene, setCurrentScene] = useState('intro');                // Tracks current scene name
  const [health, setHealth] = useState(100);                                // Player health (0-100)
  const [inventory, setInventory] = useState([]);                           // Player inventory items
  const [log, setLog] = useState([gameData.intro.text]);                   // Adventure log showing past events
  const [visited, setVisited] = useState({ intro: true });                 // Tracks visited scenes
  const [sceneRandoms, setSceneRandoms] = useState({});                    // Stores random values per scene
  const [globalSeed] = useState(() => Math.floor(Math.random() * 1000000)); // Game-wide random seed for determinism

  // ********************************** Random Number Generator **********************************
  const seededRandom = (sceneName) => {
    // Generates a deterministic pseudo-random value based on global seed and scene name
    const x = Math.sin(globalSeed + sceneName.length * 97) * 10000;
    return x - Math.floor(x);
  };

  // ********************************** Handle Scene Transitions **********************************
  const handleChoice = (choice) => {
    // Check item requirement before proceeding
    if (choice.requires && !inventory.includes(choice.requires)) {
      setLog(prev => [...prev, `You need ${choice.requires} to do that.`]);
      return;
    }

    const damage = choice.damage || 0;
    const item = choice.item;
    const nextScene = choice.next;

    // Update health and inventory
    setHealth(prev => Math.max(prev - damage, 0));
    if (item) setInventory(prev => [...prev, item]);

    // Update scene state
    setVisited(prev => ({ ...prev, [nextScene]: true }));
    setSceneRandoms(prev => ({ ...prev, [nextScene]: seededRandom(nextScene) }));
    setCurrentScene(nextScene);

    // Get new text based on random and visited
    const rand = sceneRandoms[nextScene] || seededRandom(nextScene);
    const newText = typeof gameData[nextScene].text === 'function'
      ? gameData[nextScene].text(visited[nextScene], rand)
      : gameData[nextScene].text;

    setLog(prev => [...prev, newText]);
  };

  // ********************************** Health Potion Logic **********************************
  const usePotion = () => {
    if (inventory.includes("Potion")) {
      setHealth(Math.min(100, health + 20));
      setInventory(inventory.filter(item => item !== "Potion"));
      setLog([...log, "You used a potion and restored health!"]);
    } else {
      setLog([...log, "No potions left!"]);
    }
  };

  // ********************************** Scene Configuration **********************************
  const rand = sceneRandoms[currentScene] || seededRandom(currentScene);  // Retrieve scene's random seed
  const scene = gameData[currentScene];                                   // Retrieve scene data
  const sceneChoices = typeof scene.choices === 'function'
    ? scene.choices(visited[currentScene], rand)
    : scene.choices;

  const currentText = typeof scene.text === 'function'
    ? scene.text(visited[currentScene], rand)
    : scene.text;

  // ********************************** Render Game Interface **********************************
  return (
    <div>
      <p><strong>Seed:</strong> {globalSeed}</p>
      <p><strong>Health:</strong> {health}</p>
      <p><strong>Inventory:</strong> {inventory.join(", ") || "Empty"}</p>
      <button onClick={usePotion}>Use Potion</button>

      {sceneChoices.map((choice, i) => (
        <button key={i} onClick={() => handleChoice(choice)} style={{ margin: '0.5em' }}>
          {choice.text}
        </button>
      ))}

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

// ********************************** Export **********************************
export default Game;
// This component represents the main game logic and UI for the text-based RPG.
// It handles state management, scene transitions, inventory, and health.