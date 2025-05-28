export function SimpleTrack({ trackRef }) {
    return (
      <group ref={trackRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[15, 25, 32]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>
    );
  }