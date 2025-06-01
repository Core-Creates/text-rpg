import React, { useState } from 'react';

function Game() {
  const [health, setHealth] = useState(100);
  const [inventory, setInventory] = useState([]);
  const [log, setLog] = useState(["You wake up in a mysterious forest..."]);

  const handleExplore = () => {
    const foundItem = Math.random() > 0.5 ? "Potion" : "Nothing";
    const newLog = foundItem === "Potion" 
      ? "You found a healing potion!" 
      : "You find nothing of interest.";

    if (foundItem === "Potion") {
      setInventory([...inventory, foundItem]);
    }

    setLog([...log, newLog]);
  };

  const usePotion = () => {
    if (inventory.includes("Potion")) {
      setHealth(Math.min(100, health + 20));
      setInventory(inventory.filter(item => item !== "Potion"));
      setLog([...log, "You used a potion and restored health!"]);
    } else {
      setLog([...log, "No potions left!"]);
    }
  };

  return (
    <div>
      <p><strong>Health:</strong> {health}</p>
      <p><strong>Inventory:</strong> {inventory.join(", ") || "Empty"}</p>
      <button onClick={handleExplore}>Explore</button>
      <button onClick={usePotion}>Use Potion</button>
      <div style={{ marginTop: "1em" }}>
        <strong>Adventure Log:</strong>
        <ul>
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Game;