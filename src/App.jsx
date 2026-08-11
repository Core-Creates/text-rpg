import React from 'react';
import Game from './components/Game';

// ********************************** App Shell **********************************
// The outer leaf of the codex. Everything the player sees sits inside it.
function App() {
  return (
    <main className="codex">
      <p className="rubric">Incipit</p>
      <h1 className="codex-title">Text RPG</h1>
      <p className="flourish" aria-hidden="true">&#10087;</p>
      <Game />
    </main>
  );
}

export default App;
