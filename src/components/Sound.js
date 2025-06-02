// src/components/Sound.js
import React, { useEffect, useRef } from 'react';

function Sound({ currentScene, currentText }) {
  const riverAudio = useRef(null);
  const growlAudio = useRef(null);

  useEffect(() => {
    // RIVER
    if (currentScene === "river") {
      riverAudio.current?.play().catch(() => {});
    } else {
      riverAudio.current?.pause();
      riverAudio.current.currentTime = 0;
    }

    // GROWL (triggered if "growling" is in text)
    if (currentText?.toLowerCase().includes("growling")) {
      growlAudio.current?.play().catch(() => {});
    } else {
      growlAudio.current?.pause();
      growlAudio.current.currentTime = 0;
    }
  }, [currentScene, currentText]);

  return (
    <>
      <audio ref={riverAudio} src="/assets/sounds/river.wav" preload="auto" loop />
      <audio ref={growlAudio} src="/assets/sounds/growl.wav" preload="auto" />
    </>
  );
}

export default Sound;
