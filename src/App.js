import React from 'react';
import Game from './components/Game';

function App() {
  return (
    <div className="App">
      <h1>🧙‍♀️ Text RPG</h1>
      <Game />
      <audio ref={audioRef} src="/assets/sounds/river.wav" preload="auto" />
    </div>
  );
}

export default App;
