// src/components/Sound.js
import React, { useEffect, useRef, useState } from 'react';

function Sound({ currentScene, currentText, log, volume, muted }) {
  const riverAudio = useRef(null);
  const growlAudio = useRef(null);
  const [canPlaySound, setCanPlaySound] = useState(false);

  // Enable sound after user interacts
  useEffect(() => {
    const handleUserGesture = () => {
      setCanPlaySound(true);
      window.removeEventListener("click", handleUserGesture);
    };
    window.addEventListener("click", handleUserGesture);
    return () => window.removeEventListener("click", handleUserGesture);
  }, []);

  useEffect(() => {
    if (!canPlaySound) return;

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

    const recentLog = log.slice(-3).join(" ").toLowerCase();
    const text = currentText?.toLowerCase() || "";

    // River sound logic
    const shouldPlayRiver = (
      currentScene === "river" ||
      text.includes("river") || text.includes("stream") ||
      recentLog.includes("river") || recentLog.includes("stream")
    );

    if (river) {
      if (shouldPlayRiver && river.paused) {
        river.play().catch(() => {});
      } else if (!shouldPlayRiver && !river.paused) {
        river.pause();
        river.currentTime = 0;
      }
    }

    // Growl sound logic
    const shouldPlayGrowl = (
      text.includes("growl") ||
      recentLog.includes("growl")
    );

    if (growl) {
      if (shouldPlayGrowl && growl.paused) {
        growl.play().catch(() => {});
      } else if (!shouldPlayGrowl && !growl.paused) {
        growl.pause();
        growl.currentTime = 0;
      }
    }

  }, [canPlaySound, currentScene, currentText, log, volume, muted]);

  return (
    <>
      <audio
        ref={riverAudio}
        src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/river.mp3"
        preload="auto"
        loop
      />
      <audio
        ref={growlAudio}
        src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/growlSound.mp3"
        preload="auto"
      />
    </>
  );
}

export default Sound;
