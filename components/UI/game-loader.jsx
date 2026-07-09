"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useProgress,
  Environment,
  Lightformer,
  ContactShadows,
  Center,
  Clone,
} from "@react-three/drei";
import * as THREE from "three";
import LoaderScreen from "./loader-screen";

// The hero car, rotating on the spot. Uses <Clone> so it can share the GLB
// with the real in-game car (which mounts the original object via <primitive>)
// without stealing it out of the main scene graph.
function ShowroomCar({ carModel }) {
  const { scene } = useGLTF(carModel);
  const spin = useRef();

  // Normalize any model to a consistent showroom size (target ~3 units).
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z) || 1;
    return 3 / max;
  }, [scene]);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={spin}>
      {/* fully centered so the car sits in the middle of the frame */}
      <Center>
        <group scale={scale}>
          <Clone object={scene} />
        </group>
      </Center>
    </group>
  );
}

// Aim the camera slightly above the pedestal so the car is well framed.
function Rig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

function Showroom({ carModel }) {
  return (
  <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0.6, 1.5, 6.4], fov: 40 }}
      style={{ background: "transparent" }}
    >
      <Rig />
      <ambientLight intensity={0.8} />
      <spotLight
        position={[4, 8, 5]}
        angle={0.5}
        penumbra={1}
        intensity={1.6}
        castShadow
      />

      {/* extra frontal fill so the car reads bright against the white splash */}
      <directionalLight position={[0, 3, 8]} intensity={1.2} color="#ffffff" />

      <Suspense fallback={null}>
        {carModel ? <ShowroomCar carModel={carModel} /> : null}

        {/* In-memory studio env map — bright neutral showroom (white splash art) */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3.2} position={[0, 4, -4]} scale={[10, 4, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={2.2} position={[-5, 3, 2]} scale={[4, 6, 1]} color="#eef2f6" />
          <Lightformer form="rect" intensity={2.2} position={[5, 3, 2]} scale={[4, 6, 1]} color="#ffffff" />
          <Lightformer form="ring" intensity={1.6} position={[0, 6, 3]} scale={5} color="#ffffff" />
        </Environment>
      </Suspense>

      {/* soft contact shadow grounds the car (no solid pedestal) */}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={14} blur={2.6} far={5} />
    </Canvas>
  );
}

/**
 * Overlay shown while the in-Canvas GLB assets (car + track) load.
 * Reads real load progress from three's DefaultLoadingManager via drei's
 * useProgress, eases the number, keeps itself visible for a minimum time so it
 * never just flashes, then crossfades out. Renders nothing once done.
 *
 * Mount it OUTSIDE the main <Canvas> but inside a tree that also mounts it, so
 * the world assets stream in parallel while the hero car spins.
 */
export function GameLoader({ carModel, minDuration = 1600 }) {
  const { active, progress, total } = useProgress();

  const [display, setDisplay] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  const mountRef = useRef(0);
  const startedRef = useRef(false); // have we seen any real asset yet?

  if (mountRef.current === 0) mountRef.current = Date.now();
  if (total > 0) startedRef.current = true;
  const indeterminate = !startedRef.current;

  // Ease the displayed number toward the real (lumpy) progress.
  useEffect(() => {
    if (indeterminate) return;
    let raf;
    const tick = () => {
      setDisplay((d) => {
        const next = d + (progress - d) * 0.18;
        return progress - d < 0.5 ? progress : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, indeterminate]);

  // Completion: everything loaded and settled -> fade out (respecting minDuration).
  useEffect(() => {
    if (indeterminate) return;
    if (progress >= 100 && !active) {
      const wait = Math.max(minDuration - (Date.now() - mountRef.current), 300);
      const t = setTimeout(() => setFading(true), wait);
      return () => clearTimeout(t);
    }
  }, [progress, active, indeterminate, minDuration]);

  // Safety net: if assets are already cached and no load ever registers,
  // don't get stuck on the indeterminate screen forever.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!startedRef.current && !active) setFading(true);
    }, 2600);
    return () => clearTimeout(t);
  }, [active]);

  // After the crossfade finishes, unmount so clicks pass through.
  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => setGone(true), 650);
    return () => clearTimeout(t);
  }, [fading]);

  if (gone) return null;

  return (
    <LoaderScreen
      progress={display}
      indeterminate={indeterminate}
      fading={fading}
      label="LOADING ASSETS"
      scene={<Showroom carModel={carModel} />}
    />
  );
}

export default GameLoader;
