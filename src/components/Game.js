// ********************************** Imports **********************************
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import gameData from '../gameData';
import Sound from './Sound';

// ********************************** Game Component **********************************
function Game() {
  // ********************************** State Initialization **********************************
  const [currentScene, setCurrentScene] = useState('intro');                // Current game scene
  const [health, setHealth] = useState(100);                                // Player health
  const [inventory, setInventory] = useState([]);                           // Items collected
  const [log, setLog] = useState([gameData.intro.text]);                   // Adventure log
  const [visited, setVisited] = useState({ intro: true });                 // Visited scenes
  const [sceneRandoms, setSceneRandoms] = useState({});                    // Scene-based RNG
  const [globalSeed] = useState(() => Math.floor(Math.random() * 1000000));// Global RNG seed
  const [gameWon, setGameWon] = useState(false);                           // Flag for win condition
  const [showCredits, setShowCredits] = useState(false);                   // Flag for showing credits
  const [volume, setVolume] = useState(1);                                  // Audio volume level
  const [muted, setMuted] = useState(false);                                // Mute toggle
  const [showAudioSettings, setShowAudioSettings] = useState(false);        // Toggle audio panel

  const [width, height] = useWindowSize();                                  // Window size for Confetti

  // ********************************** Show Credits After Win **********************************
  useEffect(() => {
    if (gameWon) {
      const creditTimer = setTimeout(() => setShowCredits(true), 2000);
      return () => clearTimeout(creditTimer);
    }
  }, [gameWon]);

  // ********************************** Deterministic Random Per Scene **********************************
  const seededRandom = (sceneName) => {
    const x = Math.sin(globalSeed + sceneName.length * 97) * 10000;
    return x - Math.floor(x);
  };

  // ********************************** Scene Transition Logic **********************************
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

    if (nextScene === 'treasure' || nextScene === 'passGate') {
      setGameWon(true);
    }
  };

  // ********************************** Potion Health Logic **********************************
  const usePotion = () => {
    if (inventory.includes("Potion")) {
      setHealth(Math.min(100, health + 20));
      setInventory(inventory.filter(item => item !== "Potion"));
      setLog([...log, "You used a potion and restored health!"]);
    } else {
      setLog([...log, "No potions left!"]);
    }
  };

  // ********************************** Current Scene Info **********************************
  const rand = sceneRandoms[currentScene] || seededRandom(currentScene);
  const scene = gameData[currentScene];
  const sceneChoices = typeof scene.choices === 'function'
    ? scene.choices(visited[currentScene], rand)
    : scene.choices;

  const currentText = typeof scene.text === 'function'
    ? scene.text(visited[currentScene], rand)
    : scene.text;

  // ********************************** UI Render **********************************
  return (
    <div>
      {/* Sound handler for scene-triggered effects */}
      <Sound
        currentScene={currentScene}
        currentText={currentText}
        log={log}
        volume={volume}
        muted={muted}
        gameWon={gameWon}
      />

      {/* Audio Settings Panel */}
      <div style={{ textAlign: 'right', marginBottom: '1em' }}>
        <button onClick={() => setShowAudioSettings(!showAudioSettings)}>🔊 Audio Settings</button>
        {showAudioSettings && (
          <div style={{ background: '#222', padding: '1em', borderRadius: '8px', color: '#fff' }}>
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
              /> Mute all sounds
            </label>
          </div>
        )}
      </div>

      <p><strong>Seed:</strong> {globalSeed}</p>
      <p><strong>Health:</strong> {health}</p>
      <p><strong>Inventory:</strong> {inventory.join(", ") || "Empty"}</p>
      <button onClick={usePotion}>Use Potion</button>

      {!gameWon && sceneChoices.map((choice, i) => (
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

      {gameWon && (
        <>
          <Confetti width={width} height={height} />
          <div style={{ marginTop: "2em", backgroundColor: '#61DAFB', padding: "1em", color: 'black', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>
            🎉 You win! Thanks for playing! 🎉
          </div>

          {showCredits && (
            <div style={{ marginTop: "1em", backgroundColor: '#61DAFB', padding: "1em", borderRadius: '6px', color: 'black' }}>
              <p><strong>Credits:</strong></p>
              <p>Created by Corrina Alcoser</p>
              <p>Sound effects hosted on AWS S3</p>
              <p>All sounds from freesound.org</p>
              <p>River - klankbeeld | Growl - FK_Prod | Fanfare - bone666138 | Cave - HermanDV | Footsteps - ScreenplayTheater</p>
              <p>Powered by React.js</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ********************************** Export **********************************
export default Game;
// ********************************** Notes **********************************