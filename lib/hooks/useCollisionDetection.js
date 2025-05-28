import { useState, useEffect } from "react";
import * as THREE from "three";

export function useCollisionDetection(trackRef, carPosition, useGLBTrack) {
  const [isOnTrack, setIsOnTrack] = useState(true);
  const [groundHeight, setGroundHeight] = useState(0);

  useEffect(() => {
    if (!trackRef.current || !carPosition) return;

    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3(
      carPosition.x,
      carPosition.y + 5,
      carPosition.z
    );
    const direction = new THREE.Vector3(0, -1, 0);

    raycaster.set(origin, direction);

    const meshes = [];
    trackRef.current.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });

    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const heightOffset = useGLBTrack ? 1.0 : 0.5;
      setGroundHeight(intersects[0].point.y + heightOffset);
      setIsOnTrack(true);
    } else {
      setIsOnTrack(false);
    }
  }, [carPosition, trackRef, useGLBTrack]);

  return { isOnTrack, groundHeight };
}
