import React, { useState } from "react";
import { AVAILABLE_CARS, AVAILABLE_MAPS } from "@/lib/config/gameConfig";
import { CarPreview } from "./garage-car-preview";
import { GameLoader } from "./game-loader";
import SketchfabGallery from "../sketch-fab/sketch-fab-models";
import useAssetValuesStore from "@/app/store/assetValueStore";
import {
  TierBadge,
  CarTile,
  CustomTile,
  SortTabs,
  StatRow,
  HandlingBar,
  Segmented,
} from "./garage-ui";

const SORT_TABS = ["Rating", "Model Name", "Top Speed", "Manufacturer"];

export function LandingPage({ onStart }) {
  const [selectedCar, setSelectedCar] = useState(AVAILABLE_CARS[0]);
  const [selectedMap, setSelectedMap] = useState(AVAILABLE_MAPS[0]);
  const [showPreview, setShowPreview] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [sortTab, setSortTab] = useState(SORT_TABS[0]);
  const { selectedModel, setSelectedModel } = useAssetValuesStore();

  // A downloaded Sketchfab model (has a blob URL) takes over as the active car.
  const customActive = !!(selectedModel && selectedModel.model);

  const customCar = customActive
    ? {
        ...selectedModel,
        name: selectedModel.name || "Custom Car",
        manufacturer: "Sketchfab",
        topSpeed: 200,
        acceleration: 5,
        rating: "—",
        tier: "S",
        drivetrain: "—",
        handling: 50,
        isSketchfabModel: true,
        model: selectedModel.model,
        modelUid: selectedModel.uid,
      }
    : null;

  const activeCar = customCar || selectedCar;

  // A Sketchfab model chosen in the browser but not yet downloaded blocks start.
  const disabled = selectedModel && !selectedModel.model;

  const selectBuiltIn = (car) => {
    setSelectedModel(null); // drop any custom model
    setSelectedCar(car);
  };

  const handleStartSimulation = () => {
    setShowPreview(false);
    setTimeout(() => onStart(activeCar, selectedMap), 100);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden text-neutral-200 font-sans"
      style={{
        background:
          "radial-gradient(120% 120% at 30% 20%,#22262d 0%,#141619 45%,#0a0b0e 100%)",
      }}
    >
      {/* Seamless cover: keep the splash up until the garage GLBs are ready. */}
      <GameLoader carModel={activeCar.model} />

      {/* Giant watermark word behind the car (NFS "OWNED" vibe) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="font-black uppercase tracking-tighter leading-none"
          style={{
            fontSize: "22vw",
            color: "rgba(255,255,255,0.03)",
            transform: "translateY(-6%)",
          }}
        >
          Garage
        </span>
      </div>

      {/* Hero car preview — interactive so you can grab-drag the turntable */}
      {showPreview && (
        <div className="absolute inset-0 z-[1]">
          <CarPreview selectedCar={activeCar} />
        </div>
      )}

      {/* readability gradients */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      <div className="absolute inset-y-0 right-0 w-[520px] z-[2] pointer-events-none bg-gradient-to-l from-black/70 to-transparent" />

      {/* Top-left breadcrumb */}
      <div className="absolute top-7 left-9 z-20 pointer-events-none">
        <p className="text-[11px] tracking-[0.34em] uppercase text-neutral-500 font-medium">
          Rides / <span className="text-neutral-200">All My Rides</span>
        </p>
      </div>

      {/* Top-right brand badge */}
      <div className="absolute top-6 right-9 z-20 flex items-center gap-3 pointer-events-none">
        <span className="text-sm font-semibold tracking-[0.2em] uppercase text-neutral-300">
          Apex Outlaws
        </span>
        <span className="px-2.5 py-1 rounded bg-white/8 border border-white/12 text-[11px] font-bold tracking-wide text-emerald-400">
          {AVAILABLE_CARS.length + (customActive ? 1 : 0)} CARS
        </span>
      </div>

      {/* Right-hand stats panel */}
      <div className="absolute top-24 right-9 z-20 w-[340px]">
        <div className="rounded-lg bg-black/45 backdrop-blur-md border border-white/10 overflow-hidden">
          {/* header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/10">
            <p className="text-[11px] tracking-[0.24em] uppercase text-neutral-500">
              {activeCar.manufacturer}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-50 leading-tight truncate">
              {activeCar.name}
            </h2>
            <div className="mt-2.5 flex items-center gap-2">
              <TierBadge tier={activeCar.tier} rating={activeCar.rating} />
              {customActive && (
                <span className="text-[11px] text-neutral-400">
                  Custom 3D model · Sketchfab
                </span>
              )}
            </div>
          </div>

          {/* body */}
          <div className="px-4 pb-4">
            <Segmented
              label="Track"
              items={AVAILABLE_MAPS}
              selectedId={selectedMap.id}
              onSelect={setSelectedMap}
            />
            <HandlingBar value={activeCar.handling} />
            <StatRow label="Traction" value={activeCar.drivetrain} />
            <StatRow label="Top Speed" value={activeCar.topSpeed} unit="km/h" />
            <StatRow label="0 – 100" value={activeCar.acceleration} unit="s" />

            <button
              onClick={handleStartSimulation}
              disabled={disabled}
              className={`mt-4 w-full px-6 py-3 text-sm font-semibold tracking-[0.14em] uppercase rounded-md transition-colors duration-200 ${
                disabled
                  ? "bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed"
                  : "bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
              }`}
            >
              {disabled ? "Download model first" : "Drive"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom filmstrip */}
      <div className="absolute bottom-0 inset-x-0 z-20">
        <div className="px-9 pb-5 pt-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="mb-3 flex items-center justify-between">
            <SortTabs tabs={SORT_TABS} active={sortTab} onChange={setSortTab} />
            <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              Select your ride
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {AVAILABLE_CARS.map((car) => (
              <CarTile
                key={car.id}
                car={car}
                selected={!customActive && selectedCar.id === car.id}
                onSelect={selectBuiltIn}
              />
            ))}

            {/* <CustomTile
              active={customActive}
              hasModel={customActive}
              name={customCar?.name}
              onClick={() => setGalleryOpen((v) => !v)}
            /> */}
          </div>
        </div>
      </div>

      {/* Sketchfab browser — floats top-left when opened so its dropdown has room */}
      {galleryOpen && (
        <div className="absolute top-16 left-9 z-30 w-[360px]">
          <SketchfabGallery />
        </div>
      )}
    </div>
  );
}
