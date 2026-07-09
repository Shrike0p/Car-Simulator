import React from "react";

// Dark carbon-fibre look: faint 45° pin-stripes over a soft centre-lit vignette.
const CARBON_BG = {
  backgroundImage: [
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 5px)",
    "radial-gradient(130% 130% at 50% 42%, #262626 0%, #141414 48%, #050505 100%)",
  ].join(","),
};

// Tier colour ramp, roughly mirroring the NFS "S+ > A > B" ranking.
export function tierColor(tier = "") {
  const t = tier.toUpperCase();
  if (t.startsWith("S")) return "#22c55e"; // green
  if (t.startsWith("A")) return "#a3e635"; // lime
  if (t.startsWith("B")) return "#facc15"; // amber
  return "#9ca3af"; // grey
}

// Small square badge showing a tier letter with a rating number (e.g. "A+ 264").
export function TierBadge({ tier, rating, size = "md" }) {
  const color = tierColor(tier);
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-bold tracking-wide ${pad}`}
      style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${color}55` }}
    >
      <span style={{ color }}>{tier}</span>
      {rating != null && <span className="text-neutral-100">{rating}</span>}
    </span>
  );
}

// A simple side-view car silhouette used as the tile artwork (no bitmaps needed).
export function CarSilhouette({ className = "", color = "currentColor" }) {
  return (
    <svg viewBox="0 0 120 46" className={className} aria-hidden="true">
      <path
        d="M4 33 Q9 33 13 32 L23 22 Q31 16 45 16 L73 16 Q84 16 95 24 L107 29 Q115 31 115 34 L115 36 Q115 38 112 38 L8 38 Q4 38 4 35 Z"
        fill={color}
      />
      <circle cx="33" cy="38" r="7.5" fill="#0a0b0e" />
      <circle cx="33" cy="38" r="4" fill={color} />
      <circle cx="92" cy="38" r="7.5" fill="#0a0b0e" />
      <circle cx="92" cy="38" r="4" fill={color} />
    </svg>
  );
}

// One selectable car in the bottom filmstrip.
export function CarTile({ car, selected, onSelect }) {
  const carTier=car.tier
  const carRating=car.rating
  return (
    <button
      onClick={() => onSelect(car)}
      style={CARBON_BG}
      className={`group relative shrink-0 w-48 h-28 rounded-md overflow-hidden text-left transition-all duration-200 ${
        selected && "border-2 border-white"
      }`}
    >
      <div className="flex justify-between h-full">
        <div className="flex flex-col justify-between">
        <TierBadge tier={carTier} rating={carRating}/>
        <span className="absolute bottom-1.5 left-2 text-[11px] font-bold tracking-wide text-white/90">
          {selected ? "SELECTED" : "OWNED"}
        </span>
        </div>
      {car.img ? (
        <img src={car.img} className="w-32 object-bottom object-contain" alt={car.name} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center pr-2">
          <CarSilhouette
            className="w-28 h-12"
            color={selected ? tierColor(carTier) : "#6b7280"}
          />
          <span className="text-[10px] text-neutral-400 mt-1 truncate max-w-[7rem]">
            {car.name}
          </span>
        </div>
      )}
      </div>

    </button>
  );
}

// A special filmstrip tile that opens the Sketchfab browser / shows the custom car.
export function CustomTile({ active, hasModel, name, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 w-40 h-28 rounded-md overflow-hidden text-left transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
        active
          ? "ring-2 ring-white"
          : "ring-1 ring-dashed ring-white/25 hover:ring-white/50"
      }`}
      style={{ background: "linear-gradient(160deg,#1a1d22 0%,#0d0f12 100%)" }}
    >
      <span className="text-2xl leading-none text-neutral-300">
        {hasModel ? "🚗" : "＋"}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-neutral-300 text-center px-2 truncate w-full">
        {hasModel ? name || "Custom Car" : "Sketchfab"}
      </span>
    </button>
  );
}

// The tab row above the filmstrip (cosmetic sort headers, NFS-style).
export function SortTabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-6 text-[11px] tracking-[0.18em] uppercase">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange && onChange(t)}
          className={`transition-colors ${
            active === t
              ? "text-neutral-100 border-b-2 border-white pb-1"
              : "text-neutral-500 hover:text-neutral-300 pb-1 border-b-2 border-transparent"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// A single labelled stat row (e.g. "TOP SPEED  190").
export function StatRow({ label, value, unit }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/8">
      <span className="text-[11px] tracking-[0.14em] uppercase text-neutral-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-neutral-100 tabular-nums">
        {value}
        {unit && <span className="text-neutral-500 text-xs ml-1">{unit}</span>}
      </span>
    </div>
  );
}

// Grip <-> Drift handling bar with a draggable-looking knob.
export function HandlingBar({ value = 50 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="py-2 border-b border-white/8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] tracking-[0.14em] uppercase text-neutral-400">
          Handling
        </span>
        <span className="text-xs font-semibold text-neutral-200">
          {pct}% Drift
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-neutral-300"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-[10px] uppercase tracking-wide text-neutral-500">
        <span>Grip</span>
        <span>Drift</span>
      </div>
    </div>
  );
}

// Segmented control reused for track selection (styled like NFS "target tier").
export function Segmented({ label, items, selectedId, onSelect }) {
  return (
    <div className="py-3 border-b border-white/8">
      <p className="text-[11px] tracking-[0.14em] uppercase text-neutral-400 mb-2">
        {label}
      </p>
      <div className="flex gap-1.5">
        {items.map((item) => {
          const on = selectedId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`flex-1 px-2 py-2 rounded text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                on
                  ? "bg-neutral-100 text-neutral-900"
                  : "bg-white/5 text-neutral-300 hover:bg-white/10"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
