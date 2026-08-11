import React from 'react';
import Game from './components/Game';
import { CornerFlourish, HeraldicMark } from './components/Ornaments';

// ********************************** App Shell **********************************
// The hall holds a single gilt-framed leaf. The four flourishes are one shape
// rotated into each corner by CSS.
function App() {
  return (
    <div className="hall">
      <main className="codex">
        <div className="corners" aria-hidden="true">
          <CornerFlourish />
          <CornerFlourish />
          <CornerFlourish />
          <CornerFlourish />
        </div>

        <header className="codex-header">
          <HeraldicMark />
          <p className="rubric">Incipit</p>
          <h1 className="codex-title">Text RPG</h1>
        </header>

        <Game />
      </main>
    </div>
  );
}

export default App;
