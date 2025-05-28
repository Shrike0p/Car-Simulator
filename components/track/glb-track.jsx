import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
export function GLBTrack({ trackRef }) {
  const { scene } = useGLTF("/models/track.glb");

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false;
        }
      });
    }
  }, [scene]);

  return (
    <group ref={trackRef}>
      <primitive object={scene} scale={[1, 1, 1]} />
    </group>
  );
}
