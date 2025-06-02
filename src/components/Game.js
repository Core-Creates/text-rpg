import React, { useState } from 'react';
import gameData from '../gameData';
import Sound from './Sound';
// Game component for a text-based RPG with random elements

function Game() {
  const [currentScene, setCurrentScene] = useState('intro');
  const [health, setHealth] = useState(100);
  const [inventory, setInventory] = useState([]);
  const [log, setLog] = useState([gameData.intro.text]);
  const [visited, setVisited] = useState({ intro: true });
  const [sceneRandoms, setSceneRandoms] = useState({});
  const [globalSeed] = useState(() => Math.floor(Math.random() * 1000000));

  const seededRandom = (sceneName) => {
    const x = Math.sin(globalSeed + sceneName.length * 97) * 10000;
    return x - Math.floor(x);
  };

  const handleChoice = (choice) => {
    if (choice.requires && !inventory.includes(choice.requires)) {
      setLog(prev => [...prev, `You need ${choice.requires} to do that.`]);
      return;
    }

    const damage = choice.damage || 0;
    const item = choice.item;
    const nextScene = choice.next;

    setHealth(prev => Math.max(prev - damage, 0));
    if (item) setInventory(prev => [...prev, item]);

    setVisited(prev => ({ ...prev, [nextScene]: true }));
    setSceneRandoms(prev => ({ ...prev, [nextScene]: seededRandom(nextScene) }));
    setCurrentScene(nextScene);

    const rand = sceneRandoms[nextScene] || seededRandom(nextScene);
    const newText = typeof gameData[nextScene].text === 'function'
      ? gameData[nextScene].text(visited[nextScene], rand)
      : gameData[nextScene].text;

    setLog(prev => [...prev, newText]);
  };

  const usePotion = () => {
    if (inventory.includes("Potion")) {
      setHealth(Math.min(100, health + 20));
      setInventory(inventory.filter(item => item !== "Potion"));
      setLog([...log, "You used a potion and restored health!"]);
    } else {
      setLog([...log, "No potions left!"]);
    }
  };

  const rand = sceneRandoms[currentScene] || seededRandom(currentScene);
  const scene = gameData[currentScene];
  const sceneChoices = typeof scene.choices === 'function'
    ? scene.choices(visited[currentScene], rand)
    : scene.choices;

  return (
  <div>
    {/* Sound component added here */}
    <Sound currentScene={currentScene} />

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


export default Game;
