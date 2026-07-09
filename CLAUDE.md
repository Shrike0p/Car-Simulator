# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based 3D car driving simulator built with **Next.js 15 (App Router) + React 19 + React Three Fiber**. The player picks a car and a track on a landing page, then drives a GLB car model around a track with keyboard controls and switchable cameras. Cars can be either bundled GLB assets or models downloaded live from the **Sketchfab API** at runtime.

The parent `Learning/` folder is a collection of unrelated practice projects — see `../CLAUDE.md`. This project is self-contained; always work from within `Car-Simulator/`.

## Commands

Both `package-lock.json` and `pnpm-lock.yaml` are present; the repo has been maintained with **npm** (recent commits touch `package.json` deps directly), but pnpm works too. Pick one and stay consistent.

```bash
npm run dev      # next dev — http://localhost:3000
npm run build    # next build
npm run start    # next start (after build)
npm run lint     # next lint (eslint 9, flat config in eslint.config.mjs)
```

There is **no test suite**.

## Environment

- `NEXT_PUBLIC_SKETCHFAB_API_TOKEN` — required for the Sketchfab download flow (`app/api/clientApis.tsx`). It's `NEXT_PUBLIC_`, so it ships to the browser. `.env*` is gitignored; there is no `.env.example`. Search-only endpoints work without it; only `downloadModels` needs it.

## Architecture

### Rendering entry path
`app/page.tsx` dynamically imports `components/car-scene.jsx` with **`ssr: false`** (Three.js cannot render on the server — keep it that way). `car-scene.jsx` is the top-level orchestrator:

- Holds `selectedCar` / `selectedMap` in local state. While either is null it renders `LandingPage`; once both are set it mounts the R3F `<Canvas>`.
- Passes the whole scene graph: `SceneLighting`, `Ground`, a track (`SimpleTrack` vs `GLBTrack`, chosen by `selectedMap.isSimple`), `CarModel`, and `MultiCamera`.
- `carState` (position/rotation/velocity) flows **up** from `CarModel` via an `onStateChange` callback and back **down** into `MultiCamera` so the camera can follow the car.

### Driving physics — `components/car/car-model.jsx`
The core of the sim. Runs entirely inside a `useFrame` loop and mutates a **`useRef` (`carState.current`)** each frame — it deliberately does **not** call `setState` per frame (that would thrash React). It writes directly to the Three.js `group.current.position/rotation`. When changing driving feel, keep this ref-based, setState-free pattern.

- Tunable constants live in `lib/config/carConfig.js` (`CAR_CONFIG`: maxSpeed, acceleration, turnSpeed, friction, boost, gravity). These are the knobs for handling; don't hardcode magic numbers in the frame loop.
- On model load it computes a **uniform scale** (`calculateUniformScale`) from the GLB bounding box so every car normalizes to ~8 units regardless of source, and it traverses the scene to find wheel meshes by name (`wheel`/`tyre`/`tire`) to spin them.
- On/off-track state and ground height come from `useCollisionDetection`.

### Collision & ground — `lib/hooks/useCollisionDetection.js`
Casts a ray straight **down** from above the car onto the track meshes (`trackRef`). A hit → `isOnTrack: true` + ground height (with a Y offset that differs for GLB vs simple tracks); a miss → off-track, which the physics loop penalizes with `offTrackFriction` and reduced speed.

### Input & camera hooks
- `lib/hooks/useKeyboard.jsx` — WASD to drive, **Shift** = boost, **Space** = handbrake. Returns a live `keys` object read by the physics loop.
- `lib/hooks/useCameraControls.js` — cycles 5 camera modes (`follow`, `front`, `top`, `side`, `cockpit`) on the **`c`** key.
- `components/camera/multi-camera.jsx` — a `useFrame` component (renders `null`) that lerps the actual Three.js camera toward the target position/look-at for the current mode based on `carState`.

### Car/map catalog — `lib/config/gameConfig.js`
`AVAILABLE_CARS` and `AVAILABLE_MAPS` are the built-in options shown on the landing page. Car `model` paths point at `public/models/*.glb`. A map with `isSimple: true` uses the procedural `SimpleTrack` instead of a GLB.

### Sketchfab custom-car flow
1. `app/api/clientApis.tsx` — thin client over the Sketchfab v3 search/download REST API (search, cursor pagination, search-by-query, authenticated download).
2. `components/sketch-fab/sketch-fab-models.tsx` (`SketchfabGallery`) — search UI (debounced via `use-debounce`), downloads the GLB, then **optimizes it in-browser with `@gltf-transform`** (`center`, `prune`, `dedup`), wraps the result in a `URL.createObjectURL` blob URL, and stores the model.
3. `app/store/assetValueStore.ts` — a **Zustand** store holding the single `selectedModel`. This is the only global state; everything else is prop-drilled.
4. `components/UI/landing-page.jsx` — if `selectedModel.model` (the blob URL) exists, it overrides the built-in car and passes `isSketchfabModel: true` into the scene. The blob URL is loaded by `useGLTF` just like a static path.

## Conventions & gotchas

- **File typing is mixed on purpose.** UI shell, store, types, and the Sketchfab layer are `.ts`/`.tsx`; the entire 3D layer (car, camera, tracks, hooks, scene) is `.jsx`/`.js` and untyped. `allowJs` is on. Don't convert 3D files to TS wholesale unless asked.
- **Path alias `@/*` → repo root**, defined in *both* `tsconfig.json` and the webpack alias in `next.config.ts`. GLB/GLTF imports go through a `file-loader` webpack rule in `next.config.ts`; runtime models are loaded from `public/models/` by URL via `useGLTF`, not imported.
- **shadcn/ui** is set up (`components.json`, primitives in `components/UI/` like `button.tsx`, `collapsible.tsx`). Add primitives with the shadcn CLI. Tailwind is v3.4 (`tailwind.config.js` + `postcss.config.js`), not v4.
- Much of the driving UI uses **inline styles** (see `car-scene.jsx`, `control-overlay.jsx`) while the landing/gallery use Tailwind classes — match whichever the file you're editing already uses.
- Anything touching `window`, Three.js, or `useGLTF` must stay client-side (`"use client"` / inside the `ssr:false` dynamic import). Don't move 3D logic into a server component.
