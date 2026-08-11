// ********************************** Imports **********************************
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import gameData from '../gameData';
import Sound from './Sound';
import WorldMap from './WorldMap';
import { Divider } from './Ornaments';

// ********************************** Game Component **********************************
function Game() {
  // ********************************** State Initialization **********************************
  const [currentScene, setCurrentScene] = useState('intro');                // Current game scene
  const [health, setHealth] = useState(100);                                // Player health
  const [inventory, setInventory] = useState([]);                           // Items collected
  const [log, setLog] = useState([gameData.intro.text]);                   // Adventure log
  const [visited, setVisited] = useState({});                              // Scenes already left behind
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

    // Mark the scene being LEFT, not the one being entered. Marking the
    // destination set visited[currentScene] to true before that scene had
    // rendered, so every scene whose text or choices are a function of visited
    // showed its second-visit form on the very first arrival. That made the
    // bear encounter unreachable: the cave printed "you hear growling" into the
    // log while already offering only "Go back".
    setVisited(prev => ({ ...prev, [currentScene]: true }));
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

  // The health bar shifts from moss through gold to vermilion as it drains.
  const meterState = health > 60 ? '' : health > 25 ? ' is-wounded' : ' is-grave';

  // ********************************** UI Render **********************************
  return (
    <>
      {/* Sound handler for scene-triggered effects */}
      <Sound
        currentScene={currentScene}
        currentText={currentText}
        log={log}
        volume={volume}
        muted={muted}
        gameWon={gameWon}
      />

      {/* ********************************** Marginalia ********************************** */}
      <div className="marginalia">
        <button
          type="button"
          className="action"
          aria-expanded={showAudioSettings}
          onClick={() => setShowAudioSettings(!showAudioSettings)}
        >
          Sound
        </button>

        {showAudioSettings && (
          <div className="margin-note">
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
            <label>
              <input
                type="checkbox"
                checked={muted}
                onChange={() => setMuted(!muted)}
              />
              Mute all sounds
            </label>
          </div>
        )}
      </div>

      {/* ********************************** Vitals ********************************** */}
      <div className="vitals">
        <div className="vital">
          <span className="vital-label">Health</span>
          <span className="vital-value">{health}</span>
          <span
            className="meter"
            role="meter"
            aria-label="Health"
            aria-valuenow={health}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className={`meter-fill${meterState}`}
              style={{ width: `${health}%` }}
            />
          </span>
        </div>

        <div className="vital">
          <span className="vital-label">Inventory</span>
          <span className={`vital-value${inventory.length ? '' : ' is-empty'}`}>
            {inventory.join(", ") || "Empty"}
          </span>
        </div>

        <div className="vital">
          <span className="vital-label">Seed</span>
          <span className="vital-value">{globalSeed}</span>
        </div>
      </div>

      {/* ********************************** Adventure Log **********************************
          The log sits above the choices so the newest line of narrative is the
          text immediately preceding the buttons that answer it.
      */}
      <section aria-labelledby="log-heading">
        <h2 className="cartouche" id="log-heading">Adventure Log</h2>
        <ul className="log-entries" aria-label="Adventure log">
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </section>

      {/* ********************************** Choices ********************************** */}
      <nav className="choices" aria-label="Choices">
        {!gameWon && sceneChoices.map((choice, i) => (
          <button
            type="button"
            className="choice"
            key={i}
            onClick={() => handleChoice(choice)}
          >
            {choice.text}
          </button>
        ))}
        <button type="button" className="action" onClick={usePotion}>
          Use Potion
        </button>
      </nav>

      <Divider />

      {/* ********************************** World Map ********************************** */}
      <WorldMap visited={visited} current={currentScene} />

      {/* ********************************** Explicit ********************************** */}
      {gameWon && (
        <>
          <Confetti width={width} height={height} />
          <div className="explicit">
            <p className="explicit-title">You win</p>
            <p>Thanks for playing</p>
          </div>

          {showCredits && (
            <div className="colophon">
              <p className="colophon-title">Credits</p>
              <p>Created by Corrina Alcoser</p>
              <p>Powered by React</p>
              <p>Sound effects hosted on AWS S3, sourced from freesound.org</p>
              <p className="attribution">
                River by klankbeeld &middot; Growl by FK_Prod &middot; Fanfare by
                bone666138 &middot; Cave by HermanDV &middot; Footsteps by
                ScreenplayTheater
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ********************************** Export **********************************
export default Game;
