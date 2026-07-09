import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

// Where the turntable sits in the scene, and how fast it spins (radians/sec).
const TURNTABLE_POS = [0, -10, -120];
const SPIN_SPEED = 0.45; // ~14s per full rotation — slow showroom pace

function CarModel({ modelPath, isSketchfabModel }) {
  const { scene } = useGLTF(modelPath);

  const { clonedScene, scale, offset } = useMemo(() => {
    const clonedScene = scene.clone();

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Get the largest dimension (length, width, or height)
    const maxDimension = Math.max(size.x, size.y, size.z);

    // Target size for all cars (adjust this value to make cars bigger/smaller)
    const targetSize = 380;

    // Calculate uniform scale
    const uniformScale = targetSize / maxDimension;

    // Sit the car ON the turntable's centre: middle over the pivot (x/z = 0)
    // and the wheels resting on the platform surface (bottom at y = 0). The
    // turntable group handles the final world placement + rotation.
    const offset = [
      -center.x * uniformScale,
      -box.min.y * uniformScale,
      -center.z * uniformScale,
    ];

    return { clonedScene, scale: uniformScale, offset };
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      scale={[scale, scale, scale]}
      position={offset}
    />
  );
}

// A spinning "tray" the car rides on. Only its children rotate, so the garage
// around it stays perfectly still — like a real dealership turntable.
// Auto-spins by default; grab-and-drag with the mouse to spin it yourself.
// Auto-spin pauses only while actively dragging, then resumes immediately.
function Turntable({ children }) {
  const ref = useRef();
  const { gl } = useThree();
  const drag = useRef({ active: false, lastX: 0 });

  useEffect(() => {
    const el = gl.domElement;
    el.style.cursor = "grab";

    const onDown = (e) => {
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      el.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!drag.current.active || !ref.current) return;
      const dx = e.clientX - drag.current.lastX;
      drag.current.lastX = e.clientX;
      ref.current.rotation.y += dx * 0.01; // drag sensitivity
    };
    const onUp = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.style.cursor = "";
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    // idle auto-spin whenever the user isn't actively dragging
    if (!drag.current.active) {
      ref.current.rotation.y += delta * SPIN_SPEED;
    }
  });

  return (
    <group ref={ref} position={TURNTABLE_POS}>
      {children}
    </group>
  );
}

function GarageEnvironment() {
  const { scene } = useGLTF("/models/garage_warehouse.glb");
  return <primitive object={scene} position={[500, 0, 900]} />;
}

export function CarPreview({ selectedCar }) {
  const modelPath = selectedCar?.model;

  if (!modelPath) {
    return null;
  }

  return (
    <Canvas camera={{ position: [100, 200, 400], fov: 60 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <GarageEnvironment />
        <Turntable>
          <CarModel
            modelPath={modelPath}
            isSketchfabModel={selectedCar?.isSketchfabModel}
          />
        </Turntable>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Suspense>
    </Canvas>
  );
}
