import { create } from "zustand";
import { SketchfabModel } from "@/types";

interface AssetValuesStore {
  selectedModel: SketchfabModel | null;
  setSelectedModel: (model: SketchfabModel | null) => void;
}

// Store implementation
const useAssetValuesStore = create<AssetValuesStore>((set) => ({
  selectedModel: null,
  setSelectedModel: (model: SketchfabModel | null) =>
    set({ selectedModel: model }),
}));

export default useAssetValuesStore;
