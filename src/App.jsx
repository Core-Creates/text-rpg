import React from 'react';
import Game from './components/Game';
import { CornerFlourish, DeckleFilter, HeraldicMark, VineBorder } from './components/Ornaments';

// ********************************** App Shell **********************************
// The hall holds a single leaf. The leaf is built in three layers, outermost
// first, the way a real illuminated page is: a torn sheet of vellum, a ruled
// floral border set inside its edge, then the written area.
function App() {
  return (
    <div className="hall">
      <DeckleFilter />

      <main className="codex">
        <div className="border" aria-hidden="true">
          <VineBorder orientation="horizontal" />
          <VineBorder orientation="horizontal" />
          <VineBorder orientation="vertical" />
          <VineBorder orientation="vertical" />
        </div>

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
