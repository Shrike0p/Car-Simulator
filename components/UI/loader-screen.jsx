"use client";

import { useEffect, useState } from "react";

// --- Branding --------------------------------------------------------------
// The game "logo" lockup shown on the loader (NFS-style: small brand line on
// top, huge coloured name below). Rename these two to rebrand the whole screen.
const BRAND = "FULL THROTTLE";
const GAME_NAME = "APEX OUTLAWS";
const TAGLINE = "All experiences portrayed are for entertainment purposes only.";

// Pit-crew flavour text that rotates while things load. Pure cosmetics —
// this file intentionally has NO three.js/drei import so it can be used as the
// initial boot fallback in app/page.tsx without bloating the first bundle.
const TIPS = [
  "Warming up the tires...",
  "Calibrating the throttle...",
  "Fueling the beast...",
  "Tuning the suspension...",
  "Syncing the gearbox...",
  "Releasing the handbrake...",
  "Loading the racetrack...",
  "Polishing the chrome...",
];

const KEYS = [
  { cap: "W A S D", label: "Drive" },
  { cap: "SHIFT", label: "Boost" },
  { cap: "SPACE", label: "Handbrake" },
  { cap: "C", label: "Camera" },
];

// A faint city skyline silhouette along the bottom (the hazy backdrop behind
// the hero car), echoing the splash-art look.
const BUILDINGS = [
  [0, 70, 90], [74, 46, 140], [124, 60, 70], [188, 38, 120],
  [230, 80, 100], [314, 50, 160], [368, 64, 80], [436, 42, 130],
  [482, 72, 105], [558, 54, 175], [616, 60, 95], [680, 40, 135],
  [724, 78, 115], [806, 48, 150], [858, 66, 85], [928, 44, 125],
  [976, 74, 100], [1054, 52, 165], [1110, 62, 90], [1176, 40, 130],
];

function Skyline() {
  return (
    <svg
      className="gl-skyline"
      viewBox="0 0 1216 180"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {BUILDINGS.map(([x, w, h], i) => (
        <rect key={i} x={x} y={180 - h} width={w} height={h} />
      ))}
    </svg>
  );
}

// The progress instrument: a tachometer-style dial. The needle sweeps with real
// progress (or auto-sweeps back and forth when indeterminate), the arc fills up
// to a red "redline" zone near the top of the range.
function TachoGauge({ pct = 0, indeterminate = false }) {
  const cx = 100;
  const cy = 100;
  const R = 82; // arc radius
  const rn = 66; // needle length

  // Needle rotation driven by progress: 0% -> -90deg (left stop),
  // 100% -> +90deg (right stop / "full"). Eased via CSS transition.
  const needleAngle = -90 + (pct / 100) * 180;

  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const ta = Math.PI * (1 - i / 10);
    const ro = R;
    const ri = i % 5 === 0 ? R - 15 : R - 9;
    ticks.push({
      x1: cx + ro * Math.cos(ta),
      y1: cy - ro * Math.sin(ta),
      x2: cx + ri * Math.cos(ta),
      y2: cy - ri * Math.sin(ta),
      hot: i >= 9,
    });
  }

  const ARC = "M18 100 A82 82 0 0 1 182 100";

  return (
    <svg className="gl-gauge" viewBox="0 0 200 118" width="150" aria-hidden="true">
      <defs>
        {/* brushed-chrome gradient for the progress arc + needle */}
        <linearGradient id="glChrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f8fb" />
          <stop offset="0.28" stopColor="#c3c9d2" />
          <stop offset="0.5" stopColor="#8b929c" />
          <stop offset="0.62" stopColor="#eef1f5" />
          <stop offset="1" stopColor="#9aa0a9" />
        </linearGradient>
      </defs>
      {/* base track */}
      <path className="gl-track" d={ARC} pathLength="100" />
      {/* redline zone (last 15%) */}
      <path className="gl-redline" d={ARC} pathLength="100" strokeDasharray="0 85 15" />
      {/* filled progress */}
      {!indeterminate && (
        <path
          className="gl-prog"
          d={ARC}
          pathLength="100"
          strokeDasharray={`${pct} 100`}
        />
      )}
      {/* tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          className={t.hot ? "gl-tick gl-tick-hot" : "gl-tick"}
        />
      ))}
      {/* needle — sweeps left->right as progress goes 0->100% */}
      {indeterminate ? (
        <g className="gl-needle-sweep">
          <line x1={cx} y1={cy} x2={cx} y2={cy - rn} className="gl-needle" />
        </g>
      ) : (
        <g className="gl-needle-rot" style={{ transform: `rotate(${needleAngle}deg)` }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - rn} className="gl-needle" />
        </g>
      )}
      <circle cx={cx} cy={cy} r="7" className="gl-hub" />
      <circle cx={cx} cy={cy} r="2.5" className="gl-hub-dot" />
    </svg>
  );
}

// Boot fallback (no 3D showroom yet): a thin, slowly turning steering wheel.
function WheelSpinner() {
  return (
    <div className="gl-wheel">
      <svg viewBox="0 0 100 100" width="88" height="88" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="50" cy="50" r="44" />
          <circle cx="50" cy="50" r="11" />
          <line x1="50" y1="14" x2="50" y2="39" />
          <line x1="50" y1="61" x2="20" y2="80" />
          <line x1="50" y1="61" x2="80" y2="80" />
        </g>
      </svg>
    </div>
  );
}

// Full-screen animated loading screen (splash-art layout). Props:
//   progress      - 0-100, drives the tacho needle/arc (ignored when indeterminate)
//   indeterminate - no real % yet: needle auto-sweeps instead of a number
//   fading        - parent is fading us out (triggers the opacity transition)
//   label         - small line under the gauge (e.g. "BOOTING ENGINE")
//   title         - kept for API compat; the headline uses BRAND/GAME_NAME above
//   scene         - optional React node: a 3D <Canvas> shown as the hero
export default function LoaderScreen({
  progress = 0,
  indeterminate = false,
  fading = false,
  label = "",
  title = "",
  scene = null,
}) {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 1700);
    return () => clearInterval(id);
  }, []);

  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className={`gl-root${fading ? " gl-fade" : ""}`}>
      <style>{CSS}</style>

      {/* hazy backdrop: soft light + city skyline */}
      <div className="gl-haze">
        <Skyline />
      </div>

      {/* hero: rotating car showroom (or a quiet wheel while booting) */}
      <div className="gl-stage">{scene || <WheelSpinner />}</div>

      {/* game-name logo lockup */}
      <div className="gl-top">
        <div className="gl-brand">{title || BRAND}</div>
        <h1 className="gl-title">{GAME_NAME}</h1>
      </div>

      {/* control hints, bottom-left */}
      <div className="gl-keys">
        {KEYS.map((k) => (
          <div className="gl-key" key={k.cap}>
            <span className="gl-cap">{k.cap}</span>
            <span className="gl-klabel">{k.label}</span>
          </div>
        ))}
      </div>

      {/* progress gauge, bottom-right (the "spinner") */}
      <div className="gl-cluster">
        <TachoGauge pct={pct} indeterminate={indeterminate} />
        <div className="gl-readout">
          {indeterminate ? (
            <span className="gl-loading">
              LOADING<span className="gl-dots" />
            </span>
          ) : (
            <>
              <span className="gl-num">{pct}</span>
              <span className="gl-percent">%</span>
            </>
          )}
        </div>
        {label ? <div className="gl-label">{label}</div> : null}
      </div>

      {/* fine print + rotating tip, bottom-centre */}
      <div className="gl-footer">
        <div className="gl-tip">{TIPS[tip]}</div>
        <div className="gl-fine">{TAGLINE}</div>
      </div>
    </div>
  );
}

const CSS = `
.gl-root{
  position:fixed; inset:0; z-index:9999; overflow:hidden;
  background:linear-gradient(180deg,#ffffff 0%,#f4f4f5 42%,#e2e2e4 78%,#d3d3d6 100%);
  color:#16181c;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  opacity:1; transition:opacity .6s ease;
}
.gl-root.gl-fade{ opacity:0; pointer-events:none; }

/* backdrop haze + skyline */
.gl-haze{
  position:absolute; inset:0; z-index:0; pointer-events:none;
  background:radial-gradient(120% 80% at 50% 8%, #ffffff 0%, rgba(255,255,255,0) 55%);
}
.gl-skyline{
  position:absolute; left:0; right:0; bottom:0; width:100%; height:34%;
  fill:#c4c8ce; opacity:.55;
  -webkit-mask-image:linear-gradient(to top, #000 0%, transparent 92%);
  mask-image:linear-gradient(to top, #000 0%, transparent 92%);
}

/* the 3D showroom canvas fills the screen, sitting between bg and text */
.gl-stage{
  position:absolute; inset:0; z-index:1;
  display:flex; align-items:center; justify-content:center;
}
.gl-stage > canvas{ display:block; }

.gl-wheel{ color:rgba(22,24,28,.4); animation:gl-spin 4s linear infinite; }
@keyframes gl-spin{ to{ transform:rotate(360deg);} }

/* game-name lockup, top-centre */
.gl-top{
  position:absolute; top:0; left:0; right:0; z-index:3; text-align:center;
  padding:44px 20px 40px; pointer-events:none;
  background:linear-gradient(to bottom, rgba(255,255,255,.9) 30%, transparent);
}
.gl-brand{
  font-style:italic; font-weight:800; font-size:clamp(13px,1.8vw,20px);
  letter-spacing:.16em; text-transform:uppercase; color:#16181c; margin-bottom:2px;
  font-family:"Arial Narrow",Impact,"Helvetica Neue",sans-serif;
}
.gl-title{
  margin:0; font-style:italic; font-weight:800; text-transform:uppercase;
  font-size:clamp(40px,9vw,104px); line-height:.92; letter-spacing:.01em;
  color:#e4002b; text-shadow:0 3px 14px rgba(255,255,255,.7);
  font-family:"Arial Narrow",Impact,"Helvetica Neue",sans-serif;
}

/* progress gauge cluster, bottom-right */
.gl-cluster{
  position:absolute; right:38px; bottom:26px; z-index:3;
  display:flex; flex-direction:column; align-items:center; gap:0;
}
.gl-gauge{ display:block; }
.gl-track{ fill:none; stroke:rgba(22,24,28,.14); stroke-width:6; stroke-linecap:round; }
.gl-redline{ fill:none; stroke:#e4002b; stroke-width:6; opacity:.85; }
.gl-prog{
  fill:none; stroke:#e4002b; stroke-width:6; stroke-linecap:round;
  filter:drop-shadow(0 0 4px rgba(228,0,43,.5));
  transition:stroke-dasharray .3s ease-out;
}
.gl-tick{ stroke:rgba(22,24,28,.4); stroke-width:2; }
.gl-tick-hot{ stroke:#e4002b; }
.gl-needle{ stroke:#16181c; stroke-width:3; stroke-linecap:round; }
.gl-needle-sweep{
  transform-box:view-box; transform-origin:100px 100px;
  animation:gl-sweep 1.6s ease-in-out infinite alternate;
}
@keyframes gl-sweep{ from{ transform:rotate(-78deg);} to{ transform:rotate(78deg);} }
.gl-needle-rot{
  transform-box:view-box; transform-origin:100px 100px;
  transition:transform .35s ease-out;
}
.gl-hub{ fill:#ffffff; stroke:#16181c; stroke-width:2; }
.gl-hub-dot{ fill:#e4002b; }

.gl-readout{
  margin-top:-6px; display:flex; align-items:baseline; justify-content:center; gap:3px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.gl-num{ font-size:24px; font-weight:700; color:#16181c; letter-spacing:.02em; font-variant-numeric:tabular-nums; }
.gl-percent{ font-size:12px; color:#e4002b; }
.gl-loading{ font-size:14px; font-weight:700; letter-spacing:.22em; color:#e4002b; }
.gl-dots::after{ content:"..."; animation:gl-dots 1.3s steps(4,end) infinite; }
@keyframes gl-dots{ 0%{clip-path:inset(0 100% 0 0);} 100%{clip-path:inset(0 0 0 0);} }
.gl-label{ margin-top:2px; font-size:9px; letter-spacing:.3em; text-transform:uppercase;
  color:rgba(22,24,28,.4); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }

/* control hints, bottom-left */
.gl-keys{ position:absolute; left:38px; bottom:30px; z-index:3;
  display:flex; flex-direction:column; gap:8px; }
.gl-key{ display:flex; align-items:center; gap:8px; }
.gl-cap{
  font-size:10.5px; font-weight:700; letter-spacing:.08em; padding:5px 10px; border-radius:5px;
  color:#16181c; background:rgba(22,24,28,.05);
  border:1px solid rgba(22,24,28,.16); font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.gl-klabel{ font-size:11px; letter-spacing:.06em; color:rgba(22,24,28,.5); text-transform:uppercase; }

/* fine print + tip, bottom-centre */
.gl-footer{ position:absolute; left:0; right:0; bottom:22px; z-index:2; text-align:center;
  padding:0 210px; pointer-events:none; }
.gl-tip{ font-size:12.5px; color:rgba(22,24,28,.6); letter-spacing:.02em; min-height:18px;
  animation:gl-tipfade 1.9s ease-in-out infinite; }
@keyframes gl-tipfade{ 0%,100%{opacity:.5;} 50%{opacity:.95;} }
.gl-fine{ margin-top:6px; font-size:11px; color:rgba(22,24,28,.4); letter-spacing:.02em; }

@media (max-width:720px){
  .gl-keys{ display:none; }
  .gl-footer{ padding:0 150px; }
}

@media (prefers-reduced-motion: reduce){
  .gl-wheel,.gl-needle-sweep,.gl-tip{ animation:none; }
}
`;
