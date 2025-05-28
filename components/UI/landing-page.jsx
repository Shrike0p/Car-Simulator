import React, { useState } from "react";
import { AVAILABLE_CARS, AVAILABLE_MAPS } from "@/lib/config/gameConfig";
import { SelectionCard } from "./selection-card";

export function LandingPage({ onStart }) {
  const [selectedCar, setSelectedCar] = useState(AVAILABLE_CARS[0]);
  const [selectedMap, setSelectedMap] = useState(AVAILABLE_MAPS[0]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(to bottom, #1a1a1a 0%, #2a2a2a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Car Simulator</h1>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <SelectionCard
          title="Select Car"
          items={AVAILABLE_CARS}
          selectedItem={selectedCar}
          onSelect={setSelectedCar}
        />
        <SelectionCard
          title="Select Map"
          items={AVAILABLE_MAPS}
          selectedItem={selectedMap}
          onSelect={setSelectedMap}
        />
      </div>

      <button
        onClick={() => onStart(selectedCar, selectedMap)}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        Start Simulation
      </button>
    </div>
  );
}
