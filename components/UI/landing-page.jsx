import React, { useState } from "react";
import { AVAILABLE_CARS, AVAILABLE_MAPS } from "@/lib/config/gameConfig";
import { SelectionCard } from "./selection-card";
import { CarPreview } from "./garage-car-preview";
import SketchfabGallery from "../sketch-fab/sketch-fab-models";
import useAssetValuesStore from "@/app/store/assetValueStore";

export function LandingPage({ onStart }) {
  const [selectedCar, setSelectedCar] = useState(AVAILABLE_CARS[0]);
  const [selectedMap, setSelectedMap] = useState(AVAILABLE_MAPS[0]);
  const [showPreview, setShowPreview] = useState(true);
  const { selectedModel } = useAssetValuesStore();

  const handleStartSimulation = () => {
    setShowPreview(false);
    setTimeout(() => {
      // If a Sketchfab model is selected and has a model URL, use that instead of the default car
      const carToUse =
        selectedModel && selectedModel.model
          ? {
              ...selectedModel,
              name: selectedModel.name || "Custom Car",
              topSpeed: 200,
              acceleration: 5,
              isSketchfabModel: true,
              model: selectedModel.model, 
              modelUid: selectedModel.uid,
            }
          : selectedCar;

      onStart(carToUse, selectedMap);
    }, 100);
  };

  // Create a safe car object for preview
  const previewCar =
    selectedModel && selectedModel.model
      ? {
          ...selectedModel,
          name: selectedModel.name || "Custom Car",
          topSpeed: 200,
          acceleration: 5,
          isSketchfabModel: true,
          model: selectedModel.model,
        }
      : selectedCar;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      {/* Car Preview */}
      {showPreview && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <CarPreview selectedCar={previewCar} />
        </div>
      )}

      {/* Car Details Overlay */}
      <div className="absolute top-6 left-6 z-20 bg-black/60 p-4 rounded-lg shadow-lg backdrop-blur-sm max-w-xs">
        <h2 className="text-2xl font-bold">
          {selectedModel && selectedModel.name
            ? selectedModel.name
            : selectedCar.name}
        </h2>
        {selectedModel && selectedModel.model ? (
          <>
            <p className="text-sm">🏎️ Custom 3D Model</p>
            <p className="text-sm text-green-400">Downloaded from Sketchfab</p>
          </>
        ) : (
          <>
            <p className="text-sm">🏎️ Top Speed: {selectedCar.topSpeed} km/h</p>
            <p className="text-sm">
              ⚡ Acceleration: {selectedCar.acceleration}s (0-100)
            </p>
          </>
        )}
      </div>

      {/* Menu Section */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-6 items-center">
        <h1 className="text-5xl font-extrabold uppercase drop-shadow-[0_0_10px_rgba(0,255,0,0.7)]">
          Main Menu
        </h1>

        {(!selectedModel || !selectedModel.model) && (
          <div className="w-80">
            <SelectionCard
              title="Select Default Car"
              items={AVAILABLE_CARS}
              selectedItem={selectedCar}
              onSelect={setSelectedCar}
            />
          </div>
        )}

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
          disabled={selectedModel && !selectedModel.model}
          className={`mt-4 px-6 py-3 text-xl font-bold text-black rounded-lg shadow-lg transition-transform duration-200 ${
            selectedModel && !selectedModel.model
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-400 hover:bg-green-500 hover:scale-105"
          }`}
        >
          {selectedModel && !selectedModel.model
            ? "Download Model First"
            : "Start Simulation 🚗💨"}
        </button>
      </div>
    </div>
  );
}
