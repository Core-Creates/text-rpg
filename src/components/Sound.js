// src/components/Sound.js
import React, { useEffect, useRef } from 'react';

function Sound({ currentScene, currentText, volume, muted }) {
  const riverAudio = useRef(null);
  const growlAudio = useRef(null);

  useEffect(() => {
    const river = riverAudio.current;
    const growl = growlAudio.current;

    if (river) {
      river.volume = volume;
      river.muted = muted;
    }
    if (growl) {
      growl.volume = volume;
      growl.muted = muted;
    }

    // River sound
    if (currentText?.toLowerCase().includes("river") || currentText?.toLowerCase().includes("stream") || currentScene === "river") {
      river?.play().catch(() => {});
    } else {
      river?.pause();
      river.currentTime = 0;
    }

    // Growl sound based on text
    if (currentText?.toLowerCase().includes("growling") || currentText?.toLowerCase().includes("growl") || currentScene === "forest") {
      growl?.play().catch(() => {});
    } else {
      growl?.pause();
      growl.currentTime = 0;
    }
  }, [currentScene, currentText, volume, muted]);

  return (
    <>
      <audio ref={riverAudio} src="/assets/sounds/river.mp3" preload="auto" />
      <audio ref={growlAudio} src="/assets/sounds/growlSound.mp3" preload="auto" />
    </>
  );
}

export default Sound;
