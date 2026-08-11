import React from 'react';
import Game from './components/Game';
import {
  CornerFlourish,
  DeckleFilter,
  HeraldicMark,
  VineBorder,
  Wyvern
} from './components/Ornaments';

// ********************************** App Shell **********************************
// The hall holds a single leaf. The leaf is built in layers, outermost first,
// the way a real illuminated page is: a torn sheet of vellum, a ruled floral
// border set inside its edge, grotesques perched on that border, then the
// written area, which opens into two pages when there is room.
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

        {/* Grotesques in the lower margin, facing one another across the foot
            of the page. They mean nothing, which is the point of them. */}
        <div className="grotesques" aria-hidden="true">
          <Wyvern />
          <Wyvern />
        </div>

        <header className="codex-header">
          <HeraldicMark />
          <p className="rubric">Incipit</p>
          <h1 className="codex-title">Text RPG</h1>
        </header>

        <div className="spread">
          <Game />
        </div>
      </main>
    </div>
  );
}

export default App;
