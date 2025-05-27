import { Canvas, useFrame } from "@react-three/fiber";
import {useGLTF } from "@react-three/drei";
import { useRef, Suspense, useState, useEffect } from "react";
import * as THREE from "three";

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

function useKeyboard() {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false,
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, [key]: true }));
      }
      if (event.key === "Shift") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, shift: true }));
      }
      if (event.key === " ") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, space: true }));
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, [key]: false }));
      }
      if (event.key === "Shift") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, shift: false }));
      }
      if (event.key === " ") {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, space: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
}

function CarModel() {
  const group = useRef();
  const keys = useKeyboard();
  const { scene } = useGLTF("/models/car.glb");

  const [carState, setCarState] = useState({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    velocity: 0,
    angularVelocity: 0,
  });

  const maxSpeed = 0.3;
  const acceleration = 0.01;
  const deceleration = 0.008;
  const turnSpeed = 0.04;
  const boostMultiplier = 2;

  const clonedScene = scene.clone();

  useFrame(() => {
    setCarState((prevState) => {
      let newVelocity = prevState.velocity;
      let newAngularVelocity = prevState.angularVelocity;
      let newRotation = prevState.rotation;
      let newPosition = prevState.position.clone();

      const currentMaxSpeed = keys.shift
        ? maxSpeed * boostMultiplier
        : maxSpeed;
      const currentAcceleration = keys.shift
        ? acceleration * 1.5
        : acceleration;

      if (keys.w) {
        newVelocity = Math.min(
          newVelocity + currentAcceleration,
          currentMaxSpeed
        );
      } else if (keys.s) {
        newVelocity = Math.max(
          newVelocity - currentAcceleration,
          -currentMaxSpeed * 0.6
        );
      } else {
        if (newVelocity > 0) {
          newVelocity = Math.max(0, newVelocity - deceleration);
        } else if (newVelocity < 0) {
          newVelocity = Math.min(0, newVelocity + deceleration);
        }
      }

      if (Math.abs(newVelocity) > 0.01) {
        if (keys.a) {
          newAngularVelocity = turnSpeed * (newVelocity / maxSpeed);
        } else if (keys.d) {
          newAngularVelocity = -turnSpeed * (newVelocity / maxSpeed);
        } else {
          newAngularVelocity *= 0.9; 
        }
      } else {
        newAngularVelocity = 0;
      }

      if (keys.space) {
        newVelocity *= 0.95;
        newAngularVelocity *= 0.8;
      }

      newRotation += newAngularVelocity;

      const direction = new THREE.Vector3(
        Math.sin(newRotation),
        0,
        Math.cos(newRotation)
      );

      newPosition.add(direction.multiplyScalar(newVelocity));

      return {
        position: newPosition,
        rotation: newRotation,
        velocity: newVelocity,
        angularVelocity: newAngularVelocity,
      };
    });

    if (group.current) {
      group.current.position.copy(carState.position);
      group.current.rotation.y = carState.rotation;
    }
  });

  return (
    <group ref={group} scale={0.5} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

function FollowCamera({ target }) {
  const cameraRef = useRef();

  useFrame((state) => {
    if (target.current && cameraRef.current) {
      const carPosition = target.current.position;
      const carRotation = target.current.rotation.y;

      const cameraDistance = 8;
      const cameraHeight = 4;

      const cameraX = carPosition.x - Math.sin(carRotation) * cameraDistance;
      const cameraZ = carPosition.z - Math.cos(carRotation) * cameraDistance;

      state.camera.position.lerp(
        new THREE.Vector3(cameraX, carPosition.y + cameraHeight, cameraZ),
        0.05
      );

      state.camera.lookAt(carPosition);
    }
  });

  return null;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#4a5568" />
    </mesh>
  );
}

function ControlsOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        color: "white",
        fontFamily: "monospace",
        fontSize: "14px",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
      }}
    >
      <div>
        <strong>Controls:</strong>
      </div>
      <div>W - Forward</div>
      <div>S - Backward</div>
      <div>A - Turn Left</div>
      <div>D - Turn Right</div>
      <div>Shift - Boost</div>
      <div>Space - Handbrake</div>
    </div>
  );
}

export default function CarScene() {
  const carRef = useRef();

  return (
    <>
      <ControlsOverlay />
      <Canvas
        camera={{ position: [0, 6, 10], fov: 60 }}
        style={{ background: "linear-gradient(to bottom, #87CEEB, #98FB98)" }}
      >
        <ambientLight intensity={5.6} />
        <directionalLight
          position={[50, 50, 50]}
          intensity={1}
          castShadow
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <pointLight position={[-10, 10, -10]} intensity={10.3} />

        <Ground />

        <Suspense fallback={<Loader />}>
          <CarModel ref={carRef} />
        </Suspense>

        <FollowCamera target={carRef} />
      </Canvas>
    </>
  );
}

useGLTF.preload("/models/car.glb");
