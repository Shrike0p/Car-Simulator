import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function CarModel({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  
  const { clonedScene, scale, position } = useMemo(() => {
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
    
    // Calculate position offset to center the car properly
    // We want the bottom of the car to sit on a consistent Y level
    const targetY = -10; // Base Y position
    const carBottomY = box.min.y * uniformScale;
    const adjustedY = targetY - carBottomY;
    
    // Center the car horizontally and depth-wise
    const adjustedPosition = [
      -center.x * uniformScale, // Center X
      adjustedY,                // Adjust Y so bottom sits at targetY
      -120 - center.z * uniformScale // Center Z at target depth
    ];

    
    return { clonedScene, scale: uniformScale, position: adjustedPosition };
  }, [scene, modelPath]);

  return (
    <primitive 
      object={clonedScene} 
      scale={[scale, scale, scale]} 
      position={position} 
    />
  );
}

function GarageEnvironment() {
  const { scene } = useGLTF("/models/garage_warehouse.glb");
  return <primitive object={scene} position={[500, 0, 900]} />;
}

export function CarPreview({ selectedCar }) {
  return (
    <Canvas camera={{ position: [100, 200, 400], fov: 60 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <GarageEnvironment />
        <CarModel modelPath={selectedCar.model} />
        <OrbitControls enableZoom={false} />
      </Suspense>
    </Canvas>
  );
}