"use client"
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import with loading component
const CarScene = dynamic(() => import("../components/car-scene"), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "#f0f0f0"
    }}>
      <div>Loading 3D Scene...</div>
    </div>
  )
});

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Suspense fallback={
        <div style={{ 
          width: "100vw", 
          height: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          backgroundColor: "#f0f0f0"
        }}>
          <div>Loading...</div>
        </div>
      }>
        <CarScene />
      </Suspense>
    </div>
  );
}