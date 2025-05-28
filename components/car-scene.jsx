import { Canvas } from "@react-three/fiber";
import { useRef, Suspense, useState } from "react";
import {Loader} from "@/components/utility/loader"
import {Ground} from "@/components/utility/ground"
import { GLBTrack } from "./track/glb-track";
import {SimpleTrack} from "@/components/track/simple-track"
import {CarModel} from "@/components/car/car-model"
import {MultiCamera} from "@/components/camera/multi-camera"
import { ControlsOverlay } from "./UI/control-overlay";
import {LandingPage} from "@/components/UI/landing-page"
import {SceneLighting} from "@/components/UI/scene-lightning"
import {useCameraControls} from "@/lib/hooks/useCameraControls"

export default function CarScene() {
  const [carState, setCarState] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const { cameraMode, switchCamera } = useCameraControls();
  const trackRef = useRef();

  const handleStart = (car, map) => {
    setSelectedCar(car);
    setSelectedMap(map);
  };

  const handleBackToMenu = () => {
    setSelectedCar(null);
    setSelectedMap(null);
  };

  if (!selectedCar || !selectedMap) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <>
      <ControlsOverlay
        cameraMode={cameraMode}
        onCameraModeChange={switchCamera}
        carState={carState}
      />

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={handleBackToMenu}
          style={{
            backgroundColor: "#444",
            color: "white",
            border: "1px solid #666",
            padding: "10px 15px",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          Back to Menu
        </button>
      </div>

      <Canvas
        camera={{ position: [0, 6, 10], fov: 75 }}
        style={{
          background:
            "linear-gradient(to bottom, #87CEEB 0%, #98FB98 50%, #228B22 100%)",
          width: "100vw",
          height: "100vh",
        }}
      >
        <SceneLighting />
        <Ground />

        <Suspense fallback={<Loader />}>
          {selectedMap.isSimple ? (
            <SimpleTrack trackRef={trackRef} />
          ) : (
            <GLBTrack trackRef={trackRef} />
          )}
          <CarModel
            onStateChange={setCarState}
            trackRef={trackRef}
            useGLBTrack={!selectedMap.isSimple}
            carModel={selectedCar.model}
          />
        </Suspense>

        <MultiCamera carState={carState} cameraMode={cameraMode} />
      </Canvas>
    </>
  );
}
