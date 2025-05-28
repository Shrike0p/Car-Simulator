import React from "react";

export function ControlsOverlay({ cameraMode, onCameraModeChange, carState }) {
  const cameraNames = {
    follow: "Third Person",
    front: "Front View",
    top: "Top Down",
    side: "Side View",
    cockpit: "Cockpit",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        color: "white",
        fontFamily: "monospace",
        fontSize: "14px",
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: "15px",
        borderRadius: "8px",
        zIndex: 1000,
        border: "2px solid #333",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <strong>🏎️ Car Controls:</strong>
      </div>
      <div>W - Forward</div>
      <div>S - Backward</div>
      <div>A - Turn Left</div>
      <div>D - Turn Right</div>
      <div>Shift - Boost</div>
      <div>Space - Handbrake</div>

      <div style={{ marginTop: "15px", marginBottom: "10px" }}>
        <strong>📹 Camera: {cameraNames[cameraMode]}</strong>
      </div>
      <div>C - Switch Camera</div>

      {carState && (
        <div style={{ marginTop: "15px" }}>
          <div
            style={{
              color: carState.isOnTrack ? "#00ff00" : "#ff0000",
              fontWeight: "bold",
            }}
          >
            {carState.isOnTrack ? "✅ On Track" : "❌ Off Track"}
          </div>
          <div>Speed: {Math.abs(carState.velocity * 100).toFixed(1)} km/h</div>
        </div>
      )}

      <div style={{ marginTop: "15px" }}>
        <button
          onClick={onCameraModeChange}
          style={{
            backgroundColor: "#444",
            color: "white",
            border: "1px solid #666",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          Switch Camera
        </button>
      </div>
    </div>
  );
}
