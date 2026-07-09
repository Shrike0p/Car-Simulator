"use client"
import dynamic from "next/dynamic";
import LoaderScreen from "../components/UI/loader-screen";

// Dynamic import with loading component. LoaderScreen is drei-free, so using it
// here does NOT pull three.js into the initial bundle (keeps the code-split).
// `loading` already renders the boot screen while the chunk downloads, so no
// extra <Suspense> wrapper is needed here.
const CarScene = dynamic(() => import("../components/car-scene"), {
  ssr: false,
  loading: () => <LoaderScreen indeterminate label="BOOTING ENGINE" />,
});

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <CarScene />
    </div>
  );
}