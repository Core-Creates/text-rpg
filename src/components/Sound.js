// src/components/Sound.js
import React, { useEffect, useRef } from 'react';

function Sound({ currentScene }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentScene === "river") {
      audioRef.current?.play().catch(() => {});
    } else {
      audioRef.current?.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentScene]);

  return (
    <audio ref={audioRef} src="/assets/sounds/river.wav" preload="auto" />
  );
}

export default Sound;
