// src/components/Sound.js
import React, { useEffect, useRef, useState } from 'react';

function Sound({ currentScene, currentText, log, volume, muted, gameWon }) {
  const riverAudio = useRef(null);
  const growlAudio = useRef(null);
  const footstepsAudio = useRef(null);
  const caveAudio = useRef(null);
  const winAudio = useRef(null);

  const [canPlaySound, setCanPlaySound] = useState(false);

  useEffect(() => {
    const enable = () => {
      setCanPlaySound(true);
      window.removeEventListener("click", enable);
    };
    window.addEventListener("click", enable);
    return () => window.removeEventListener("click", enable);
  }, []);

  useEffect(() => {
    if (!canPlaySound) return;

    const recentLog = log.slice(-3).join(" ").toLowerCase();
    const text = currentText?.toLowerCase() || "";

    const audios = {
      river: riverAudio.current,
      growl: growlAudio.current,
      footsteps: footstepsAudio.current,
      cave: caveAudio.current,
      win: winAudio.current,
    };

    // Apply volume/mute to all
    for (const key in audios) {
      if (audios[key]) {
        audios[key].volume = volume;
        audios[key].muted = muted;
      }
    }

    // River sound
    if (text.includes("river") || recentLog.includes("stream")) {
      if (audios.river?.paused) audios.river.play().catch(() => {});
    } else {
      audios.river?.pause();
      audios.river.currentTime = 0;
    }

    // Growling
    if (text.includes("growl") || recentLog.includes("growl")) {
      if (audios.growl?.paused) audios.growl.play().catch(() => {});
    } else {
      audios.growl?.pause();
      audios.growl.currentTime = 0;
    }

    // Footsteps (movement indication)
    if (recentLog.includes("path") || text.includes("walk") || text.includes("step")) {
      if (audios.footsteps?.paused) audios.footsteps.play().catch(() => {});
    } else {
      audios.footsteps?.pause();
      audios.footsteps.currentTime = 0;
    }

    // Cave echo
    if (currentScene.includes("cave") || text.includes("echo")) {
      if (audios.cave?.paused) audios.cave.play().catch(() => {});
    } else {
      audios.cave?.pause();
      audios.cave.currentTime = 0;
    }

    // Victory fanfare
    if (gameWon) {
      audios.win?.play().catch(() => {});
    } else {
      audios.win?.pause();
      audios.win.currentTime = 0;
    }

  }, [canPlaySound, currentScene, currentText, log, volume, muted, gameWon]);

  return (
    <>
      <audio ref={riverAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/river.mp3" preload="auto" loop />
      <audio ref={growlAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/growlSound.mp3" preload="auto" />
      <audio ref={footstepsAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/footsteps.mp3" preload="auto" />
      <audio ref={caveAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/caveEcho.mp3" preload="auto" />
      <audio ref={winAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/victoryFanfare.mp3" preload="auto" />
    </>
  );
}

export default Sound;
