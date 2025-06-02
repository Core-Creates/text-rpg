import React, { useEffect, useRef } from 'react';
import riverSound from '../../assets/sounds/river.wav';
//import { useGameContext } from '../context/GameContext';

const audioRef = useRef(null);

useEffect(() => {
  if (currentScene === "river") {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {}); // avoid autoplay error
    }
  } else {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }
}, [currentScene]);