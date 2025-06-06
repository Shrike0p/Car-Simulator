import React, { useState } from "react";
import { AVAILABLE_CARS, AVAILABLE_MAPS } from "@/lib/config/gameConfig";
import { SelectionCard } from "./selection-card";
import { CarPreview } from "./garage-car-preview";
import SketchfabGallery from "../sketch-fab/sketch-fab-models";

export function LandingPage({ onStart }) {
  const [selectedCar, setSelectedCar] = useState(AVAILABLE_CARS[0]);
  const [selectedMap, setSelectedMap] = useState(AVAILABLE_MAPS[0]);
  const [showPreview, setShowPreview] = useState(true);

  const handleStartSimulation = () => {
    setShowPreview(false);
    setTimeout(() => {
      onStart(selectedCar, selectedMap);
    }, 100);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      {/* Car Preview */}
      {showPreview && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <CarPreview selectedCar={selectedCar} />
        </div>
      )}

      {/* Car Details Overlay */}
      <div className="absolute top-6 left-6 z-20 bg-black/60 p-4 rounded-lg shadow-lg backdrop-blur-sm max-w-xs">
        <h2 className="text-2xl font-bold">{selectedCar.name}</h2>
        <p className="text-sm">🏎️ Top Speed: {selectedCar.topSpeed} km/h</p>
        <p className="text-sm">
          ⚡ Acceleration: {selectedCar.acceleration}s (0-100)
        </p>
      </div>

      {/* Menu Section */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-6 items-center">
        <h1 className="text-5xl font-extrabold uppercase drop-shadow-[0_0_10px_rgba(0,255,0,0.7)]">
          Main Menu
        </h1>

        <div className="w-80">
          <SelectionCard
            title="Select Default Car"
            items={AVAILABLE_CARS}
            selectedItem={selectedCar}
            onSelect={setSelectedCar}
          />
        </div>
        <div className="w-80">
          <SketchfabGallery />
        </div>
        <div className="w-80">
          <SelectionCard
            title="Select Map"
            items={AVAILABLE_MAPS}
            selectedItem={selectedMap}
            onSelect={setSelectedMap}
          />
        </div>

        <button
          onClick={handleStartSimulation}
          className="mt-4 px-6 py-3 text-xl font-bold text-black bg-green-400 rounded-lg shadow-lg hover:bg-green-500 hover:scale-105 transition-transform duration-200"
        >
          Start Simulation 🚗💨
        </button>
      </div>
    </div>
  );
}
