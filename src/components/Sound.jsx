// ********************************** Imports **********************************
import React, { useEffect, useRef } from 'react';

// ********************************** Sound Component **********************************
/**
 * Handles all sound logic based on scene, text, and game state.
 * Uses refs to control HTML5 audio elements.
 */
function Sound({ currentScene, currentText, log, volume, muted, gameWon }) {
  // ********************************** Audio References **********************************
  const riverAudio = useRef(null);     // River background sound
  const growlAudio = useRef(null);     // Monster growl sound
  const caveAudio = useRef(null);      // Ambient cave sound
  const winFanfare = useRef(null);     // Victory fanfare
  const footstepsAudio = useRef(null); // Footstep walking sound

  // ********************************** Sound Logic Hook **********************************
  useEffect(() => {
    // Get all audio refs
    const river = riverAudio.current;
    const growl = growlAudio.current;
    const cave = caveAudio.current;
    const fanfare = winFanfare.current;
    const footsteps = footstepsAudio.current;

    // Apply global audio settings
    [river, growl, cave, fanfare, footsteps].forEach(sound => {
      if (sound) {
        sound.volume = volume;
        sound.muted = muted;
      }
    });

    const recentLog = log.slice(-3).join(" ").toLowerCase();

    // ********************************** River Logic **********************************
    if (
      currentScene === "river" ||
      currentText?.toLowerCase().includes("river") ||
      recentLog.includes("river") || recentLog.includes("stream")
    ) {
      river?.play().catch(() => {});
    } else {
      river?.pause();
      river.currentTime = 0;
    }

    // ********************************** Growl Logic **********************************
    if (
      currentText?.toLowerCase().includes("growl") ||
      recentLog.includes("growl")
    ) {
      growl?.play().catch(() => {});
    } else {
      growl?.pause();
      growl.currentTime = 0;
    }

    // ********************************** Cave Logic **********************************
    if (
      currentScene === "cave" ||
      currentText?.toLowerCase().includes("cave") ||
      recentLog.includes("cave")
    ) {
      cave?.play().catch(() => {});
    } else {
      cave?.pause();
      cave.currentTime = 0;
    }

    // ********************************** Footsteps Logic **********************************
    if (
      currentText?.toLowerCase().includes("walk") ||
      recentLog.includes("walk") ||
      recentLog.includes("step") ||
      recentLog.includes("path")
    ) {
      footsteps?.play().catch(() => {});
    } else {
      footsteps?.pause();
      footsteps.currentTime = 0;
    }

    // ********************************** Fanfare Logic **********************************
    if (gameWon && fanfare) {
      fanfare.play().catch(() => {});
    }
  }, [currentScene, currentText, log, volume, muted, gameWon]);

  // ********************************** Render Audio Tags **********************************
  return (
    <>
      <audio ref={riverAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/river.mp3" preload="auto" loop />
      <audio ref={growlAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/growlSound.mp3" preload="auto" />
      <audio ref={caveAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/cave-ambience.mp3" preload="auto" loop />
      <audio ref={winFanfare} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/fanfare.mp3" preload="auto" />
      <audio ref={footstepsAudio} src="https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com/footsteps.mp3" preload="auto" />
    </>
  );
}

export default Sound;
