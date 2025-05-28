import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {useKeyboard} from "@/lib/hooks/useKeyBoard"
import { useCollisionDetection } from "@/lib/hooks/useCollisionDetection";
import { CAR_CONFIG } from "@/lib/config/carConfig";

export function CarModel({ onStateChange, trackRef, useGLBTrack, carModel }) {
  const group = useRef();
  const keys = useKeyboard();
  const { scene } = useGLTF(carModel);
  const wheelRefs = useRef([]);

  // Find and store wheel meshes
  useEffect(() => {
    if (scene) {
      const wheels = [];
      scene.traverse((child) => {
        if (
          child.isMesh &&
          (child.name.toLowerCase().includes("wheel") ||
            child.name.toLowerCase().includes("tyre") ||
            child.name.toLowerCase().includes("tire"))
        ) {
          wheels.push(child);
        }
      });
      wheelRefs.current = wheels;
    }
  }, [scene]);

  const [carState, setCarState] = useState({
    position: new THREE.Vector3(0, 0.5, 15),
    rotation: 0,
    velocity: 0,
    angularVelocity: 0,
  });

  const { isOnTrack, groundHeight } = useCollisionDetection(
    trackRef,
    carState.position,
    useGLBTrack
  );

  const {
    maxSpeed,
    acceleration,
    deceleration,
    turnSpeed,
    boostMultiplier,
    gravity,
    groundFriction,
    offTrackFriction,
  } = CAR_CONFIG;

  useFrame(() => {
    // Rotate wheels based on velocity
    const wheelRotationSpeed = carState.velocity * 0.5;
    wheelRefs.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += wheelRotationSpeed;
      }
    });

    setCarState((prevState) => {
      let newVelocity = prevState.velocity;
      let newAngularVelocity = prevState.angularVelocity;
      let newRotation = prevState.rotation;
      let newPosition = prevState.position.clone();

      const currentFriction = isOnTrack ? groundFriction : offTrackFriction;
      const currentMaxSpeed = keys.shift
        ? maxSpeed * boostMultiplier * (isOnTrack ? 1 : 0.7)
        : maxSpeed * (isOnTrack ? 1 : 0.7);
      const currentAcceleration = keys.shift
        ? acceleration * 1.5 * (isOnTrack ? 1 : 0.8)
        : acceleration * (isOnTrack ? 1 : 0.8);

      // Forward/Backward movement
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

      newVelocity *= currentFriction;

      // Turning
      if (Math.abs(newVelocity) > 0.01) {
        if (keys.a) {
          newAngularVelocity =
            turnSpeed * (newVelocity / maxSpeed) * (isOnTrack ? 1 : 0.7);
        } else if (keys.d) {
          newAngularVelocity =
            -turnSpeed * (newVelocity / maxSpeed) * (isOnTrack ? 1 : 0.7);
        } else {
          newAngularVelocity *= 0.9;
        }
      } else {
        newAngularVelocity = 0;
      }

      // Handbrake
      if (keys.space) {
        newVelocity *= 0.95;
        newAngularVelocity *= 0.8;
      }

      newRotation += newAngularVelocity;

      // Position update
      const direction = new THREE.Vector3(
        Math.sin(newRotation),
        0,
        Math.cos(newRotation)
      );
      newPosition.add(direction.multiplyScalar(newVelocity));

      // Gravity and ground collision
      if (groundHeight !== undefined) {
        const targetY = groundHeight + (useGLBTrack ? 1.0 : 0.5);
        if (newPosition.y > targetY) {
          newPosition.y = Math.max(targetY, newPosition.y - gravity);
        } else {
          newPosition.y = targetY;
        }
      }

      const newState = {
        position: newPosition,
        rotation: newRotation,
        velocity: newVelocity,
        angularVelocity: newAngularVelocity,
        isOnTrack: isOnTrack,
      };

      if (onStateChange) {
        onStateChange(newState);
      }

      return newState;
    });

    if (group.current) {
      group.current.position.copy(carState.position);
      group.current.rotation.y = carState.rotation;
    }
  });

  return (
    <group ref={group} scale={1.5} position={[0, 0.3, 0]}>
      <primitive object={scene} scale={[1, 1, 1]} />
    </group>
  );
}
