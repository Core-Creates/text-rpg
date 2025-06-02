import { useWindowSize } from '@react-hook/window-size';
import React, { useState } from 'react';
import Confetti from 'react-confetti';
import gameData from '../gameData';
import Sound from './Sound';
// Game component for a text-based RPG with random elements

function Game() {
  const [width, height] = useWindowSize();
  const [nextScene, setNextScene] = useState('intro');
  const [gameWon, setGameWon] = useState(false);
  const [volume, setVolume] = useState(1); // default 50%
  const [muted, setMuted] = useState(false);
  const [currentScene, setCurrentScene] = useState('intro');
  const [health, setHealth] = useState(100);
  const [inventory, setInventory] = useState([]);
  const [log, setLog] = useState([gameData.intro.text]);
  const [visited, setVisited] = useState({ intro: true });
  const [sceneRandoms, setSceneRandoms] = useState({});
  const [globalSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const restartGame = () => {
    window.location.reload(); // or reset all state manually
  };
  const enableAudio = () => {
    const audios = document.querySelectorAll("audio");
    audios.forEach(audio => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => { });
    });
  };


  const seededRandom = (sceneName) => {
    const x = Math.sin(globalSeed + sceneName.length * 97) * 10000;
    return x - Math.floor(x);
  };

  const handleChoice = (choice) => {
    if (nextScene === "treasure" || nextScene === "passGate") {
      setGameWon(true);
    }
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

  const currentText = typeof scene.text === 'function'
    ? scene.text(visited[currentScene], rand)
    : scene.text;

  return (
    <div>
      {/* Sound component */}
      <Sound
        currentScene={currentScene}
        currentText={currentText}
        volume={volume}
        muted={muted}
      />

      <p><strong>Seed:</strong> {globalSeed}</p>
      <p><strong>Health:</strong> {health}</p>
      <p><strong>Inventory:</strong> {inventory.join(", ") || "Empty"}</p>
      <button onClick={usePotion}>Use Potion</button>

      {!gameWon && sceneChoices.map((choice, i) => (
        <button
          key={i}
          onClick={() => {
            enableAudio();
            handleChoice(choice);
          }}
          style={{ margin: '0.5em' }}
        >
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

      <div style={{ marginTop: "1em" }}>
        <h3>🔊 Audio Settings</h3>
        <label>
          Volume: {Math.round(volume * 100)}%
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            disabled={muted}
          />
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={muted}
            onChange={() => setMuted(!muted)}
          />{" "}
          Mute all sounds
        </label>
      </div>

      {/* ✅ Win Message */}
      {gameWon && (
        <>
          {/* Fireworks animation */}
          <Confetti width={width} height={height} />

          {/* Win message */}
          <div style={{ marginTop: "1em", backgroundColor: "#e6ffe6", padding: "1em", border: "2px solid green" }}>
            🎉 <strong>You win! Thanks for playing!</strong> 🎉
          </div>

          {/* Restart button */}
          <button
            onClick={restartGame}
            style={{
              marginTop: "1em",
              padding: "0.5em 1em",
              fontSize: "1.1em",
              backgroundColor: "#333",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            🔁 Restart Game
          </button>
        </>
      )}

    </div>
  );

}


export default Game;
