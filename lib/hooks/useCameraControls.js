import { useState, useEffect } from "react";

const CAMERA_MODES = ["follow", "front", "top", "side", "cockpit"];

export function useCameraControls(initialMode = "follow") {
  const [cameraMode, setCameraMode] = useState(initialMode);
  const [keyPressed, setKeyPressed] = useState(false);

  const switchCamera = () => {
    const currentIndex = CAMERA_MODES.indexOf(cameraMode);
    const nextIndex = (currentIndex + 1) % CAMERA_MODES.length;
    setCameraMode(CAMERA_MODES[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "c" && !keyPressed) {
        setKeyPressed(true);
        switchCamera();
      }
    };

    const handleKeyUp = (event) => {
      if (event.key.toLowerCase() === "c") {
        setKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cameraMode, keyPressed]);

  return { cameraMode, switchCamera };
}
