import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function MultiCamera({ carState, cameraMode }) {
  useFrame((state) => {
    if (!carState) return;

    const carPosition = carState.position;
    const carRotation = carState.rotation;

    let targetPosition = new THREE.Vector3();
    let lookAtPosition = new THREE.Vector3();

    switch (cameraMode) {
      case "follow":
        const followDistance = 8;
        const followHeight = 4;
        targetPosition.set(
          carPosition.x - Math.sin(carRotation) * followDistance,
          carPosition.y + followHeight,
          carPosition.z - Math.cos(carRotation) * followDistance
        );
        lookAtPosition.copy(carPosition);
        break;

      case "front":
        const frontDistance = 6;
        const frontHeight = 2;
        targetPosition.set(
          carPosition.x + Math.sin(carRotation) * frontDistance,
          carPosition.y + frontHeight,
          carPosition.z + Math.cos(carRotation) * frontDistance
        );
        lookAtPosition.copy(carPosition);
        break;

      case "top":
        targetPosition.set(carPosition.x, carPosition.y + 15, carPosition.z);
        lookAtPosition.copy(carPosition);
        break;

      case "side":
        const sideDistance = 10;
        const sideHeight = 3;
        targetPosition.set(
          carPosition.x + sideDistance,
          carPosition.y + sideHeight,
          carPosition.z
        );
        lookAtPosition.copy(carPosition);
        break;

      case "cockpit":
        const cockpitOffset = new THREE.Vector3(0, 1, 1);
        const rotatedOffset = cockpitOffset.clone();
        rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carRotation);
        targetPosition.copy(carPosition).add(rotatedOffset);

        const forwardDirection = new THREE.Vector3(
          Math.sin(carRotation),
          0,
          Math.cos(carRotation)
        );
        lookAtPosition
          .copy(targetPosition)
          .add(forwardDirection.multiplyScalar(10));
        break;

      default:
        return;
    }

    state.camera.position.lerp(targetPosition, 0.1);

    const currentLookAt = new THREE.Vector3();
    state.camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(state.camera.position);

    const targetLookDirection = lookAtPosition
      .clone()
      .sub(state.camera.position)
      .normalize();
    const currentLookDirection = currentLookAt
      .clone()
      .sub(state.camera.position)
      .normalize();

    const lerpedDirection = currentLookDirection.lerp(targetLookDirection, 0.1);
    const newLookAt = state.camera.position
      .clone()
      .add(lerpedDirection.multiplyScalar(10));

    state.camera.lookAt(newLookAt);
  });

  return null;
}
