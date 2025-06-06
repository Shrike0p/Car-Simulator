import { SearchX, X, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { WebIO } from '@gltf-transform/core';
import { prune, dedup, center } from '@gltf-transform/functions';
import {
  getAllModels,
  getModelsByNextCursor,
  getModelsBySearchQuery,
  downloadModels,
} from "@/app/api/clientApis";
import ModelCard from "./model-card";
import { useDebounce } from "use-debounce";
import useAssetValuesStore from "@/app/store/assetValueStore";

import { SketchfabModel } from "@/types";
import { SketchPreview } from "./sketch-fab-preview";
import { Button } from "../UI/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../UI/collapsible";


interface SketchfabResponse {
  results: SketchfabModel[];
  cursors?: {
    next: string | null;
  };
  err?: Error;
}

const SketchfabGallery = () => {
  const { selectedModel, setSelectedModel } = useAssetValuesStore();
  const [open, setOpen] = useState(false);

  const [models, setModels] = useState<SketchfabModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [previewModel, setPreviewModel] = useState<SketchfabModel | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useDebounce(searchQuery, 400);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (debouncedQuery === "") {
      fetchModels();
    } else {
      fetchModelsBySearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getAllModels();

      if (data.err) {
        setError("Failed to fetch models from Sketchfab");
        setLoading(false);
        return;
      }
      setModels(data.results);
      // const availableModels = await Promise.all(
      //     data.results.map(async (model: any) => {
      //         try {
      //             const response = await fetch(
      //                 `https://api.sketchfab.com/v3/models/${model.uid}`
      //             );
      //             return response.ok ? model : null;
      //         } catch (error) {
      //             console.error(
      //                 `Error checking model ${model.uid}:`,
      //                 error
      //             );
      //             return null;
      //         }
      //     })
      // );

      setNextCursor(data.cursors?.next || null);
      setLoading(false);
    } catch (error) {
      setError(`Something went wrong while fetching models: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const fetchModelsBySearch = async (query: string) => {
    try {
      setLoading(true);
      const data = await getModelsBySearchQuery(query);

      if (data.err) {
        setError("Failed to fetch models from Sketchfab");
        setLoading(false);
        return;
      }

      setModels(data.results);
      setNextCursor(data.cursors?.next || null);
      setLoading(false);
    } catch (error) {
      setError(`Something went wrong while fetching models: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleModelSelect = (model: SketchfabModel) => {
    if (selectedModel?.uid === model.uid) {
      setSelectedModel(null);
    } else {
      setSelectedModel(model);
    }
  };

  const handleModelPreview = (model: SketchfabModel) => {
    setPreviewModel(model);
  };

  const closePreview = () => {
    setPreviewModel(null);
  };

  const selectPreviewedModel = () => {
    if (previewModel) {
      setSelectedModel(previewModel);
      setPreviewModel(null);
    }
  };

  const clearSelection = () => {
    setDebouncedQuery("");
    setSearchQuery("");
  };

  const loadMore = async () => {
    if (!nextCursor) return;

    try {
      setIsLoadingMore(true);
      let data: SketchfabResponse;

      // Use search query if we have one, otherwise load general models
      if (debouncedQuery !== "") {
        data = await getModelsBySearchQuery(debouncedQuery, nextCursor);
      } else {
        data = await getModelsByNextCursor(nextCursor, "car");
      }

      if (data.err) {
        setError("Failed to fetch more models");
        setLoading(false);
        return;
      }

      setModels((prev) => {
        const allModels = [...prev, ...data.results];
        const uniqueModels = Array.from(new Map(allModels.map(m => [m.uid, m])).values());
        return uniqueModels;
      });
      setNextCursor(data.cursors?.next || null);
      setIsLoadingMore(false);
    } catch (error) {
      setError(`Something went wrong while fetching more models: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoadingMore(false);
    }
  };

  const optimizeModel = async (glbBlob: Blob): Promise<Blob> => {
    try {
      const io = new WebIO();

      // Convert blob to array buffer
      const arrayBuffer = await glbBlob.arrayBuffer();

      // Read the document
      const document = await io.readBinary(new Uint8Array(arrayBuffer));

      // Apply transformations to standardize the model
      await document.transform(
        // Center the model at the origin
        center(),
        // Remove unused nodes, materials, etc.
        prune(),
        // Remove duplicate vertices
        dedup()
      );

      const optimizedArrayBuffer = await io.writeBinary(document);

      const optimizedBlob = new Blob([optimizedArrayBuffer], { type: 'model/gltf-binary' });

      // Log optimization results
      console.log('Model optimization complete');
      console.log('Original size:', (glbBlob.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Optimized size:', (optimizedBlob.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Size reduction:', ((1 - optimizedBlob.size / glbBlob.size) * 100).toFixed(2), '%');

      return optimizedBlob;
    } catch (error) {
      console.error('Error optimizing model:', error);
      return glbBlob;
    }
  };

  const handleDownload = async (model: SketchfabModel) => {
    try {
      setIsDownloading(true);
      setError(null);

      const data = await downloadModels(model.uid);
      if (data.err) {
        setError("Failed to get download URL");
        return;
      }

      const glbUrl = data.glb?.url;
      if (!glbUrl) {
        setError("No GLB file URL found");
        return;
      }

      const response = await fetch(glbUrl);
      if (!response.ok) {
        throw new Error(`Failed to download model: ${response.statusText}`);
      }

      // Convert the model to a blob
      const originalBlob = await response.blob();

      console.log('Original model size:', (originalBlob.size / 1024 / 1024).toFixed(2), 'MB');

      console.log('Optimizing model...');
      const optimizedBlob = await optimizeModel(originalBlob);

      console.log('Optimized model size:', (optimizedBlob.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Size reduction:', ((1 - optimizedBlob.size / originalBlob.size) * 100).toFixed(2), '%');

      const localUrl = URL.createObjectURL(optimizedBlob);

      setDownloadedModels(prev => ({
        ...prev,
        [model.uid]: localUrl
      }));

      const updatedModel = {
        ...model,
        model: localUrl,
        isSketchfabModel: true
      };

      setSelectedModel(updatedModel);

    } catch (error) {
      setError(`Failed to download model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Cleanup function to revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(downloadedModels).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [downloadedModels]);

  return (
    <div className="relative w-full">

      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div
            className="bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-4 cursor-pointer hover:border-gray-600 transition-colors w-80"
          >
            <div className="flex items-center justify-between select-none">
              <div>
                <h3 className="text-lg font-bold text-white">Browse 3D Models</h3>
                <p className="text-sm text-gray-400">Choose from Sketchfab gallery</p>
                {selectedModel && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-green-400">Selected: {selectedModel.name}</p>
                    {!downloadedModels[selectedModel.uid] ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(selectedModel);
                        }}
                        disabled={isDownloading}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Download size={12} />
                        )}
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-green-400">✓ Downloaded</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-green-400">
                {open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="absolute top-full mt-2 w-full z-50 bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-700 p-4 max-h-[300px] overflow-y-auto shadow-lg">

            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 pr-8 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                maxLength={40}
              />
              {searchQuery && (
                <button
                  onClick={clearSelection}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Models */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, idx) => (
                    <ModelCardSkeleton key={idx} />
                  ))}
                </div>
              )}

              {!loading && models?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {models.map((model) => (
                    <ModelCard
                      key={model.uid}
                      model={model}
                      onClick={handleModelSelect}
                      onPreview={handleModelPreview}
                      isSelected={selectedModel?.uid === model.uid}
                    />
                  ))}
                </div>
              )}

              {!loading && models?.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <SearchX size={32} className="mb-2" />
                  <p className="text-sm text-center">
                    {debouncedQuery
                      ? `No models found matching "${debouncedQuery}"`
                      : "No models available"}
                  </p>
                </div>
              )}

              {/* Load More */}
              {isLoadingMore && (
                <div className="flex justify-center mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                </div>
              )}

              {nextCursor && !loading && !isLoadingMore && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={loadMore}
                    className="px-4 py-2 text-sm font-medium"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Preview */}
      {previewModel && (
        <SketchPreview
          selectPreviewedModel={selectPreviewedModel}
          closePreview={closePreview}
          previewModel={previewModel}
        />
      )}
    </div>
  );
};

export default SketchfabGallery;



const ModelCardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg overflow-hidden shadow-md transition-all duration-700">
    <div className="aspect-video bg-gray-200 relative">
      <div className="absolute bottom-1 right-1 rounded bg-gray-300 px-6 py-2"></div>
    </div>
    <div className="p-2 flex justify-between items-center">
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

// const NoModelsAvailable = ({ text }: { text: string }) => (
//   <div className="flex flex-col items-center justify-center gap-3 py-16">
//     <SearchX size={48} className="text-gray-400" />
//     <h3 className="text-xl font-semibold text-gray-600">No Models Found</h3>
//     <p className="text-sm text-gray-500 text-center">
//       We couldn&apos;t find any models matching
//       <span className="font-medium">{text}</span>.
//       <br />
//       Try adjusting your search or keywords.
//     </p>
//   </div>
// );