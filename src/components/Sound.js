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
    if (currentScene === "river") {
      river?.play().catch(() => {});
    } else {
      river?.pause();
      river.currentTime = 0;
    }

    // Growl sound based on text
    if (currentText?.toLowerCase().includes("growling")) {
      growl?.play().catch(() => {});
    } else {
      growl?.pause();
      growl.currentTime = 0;
    }
  }, [currentScene, currentText, volume, muted]);

  return (
    <>
      <audio ref={riverAudio} src="/assets/sounds/river.wav" preload="auto" loop />
      <audio ref={growlAudio} src="/assets/sounds/growl.wav" preload="auto" />
    </>
  );
}

export default Sound;
