import { SketchfabModel } from "@/types";
import { X } from "lucide-react";

export const SketchPreview = ({
    selectPreviewedModel,
    closePreview,
    previewModel,
}: {
    selectPreviewedModel: () => void;
    closePreview: () => void;
    previewModel: SketchfabModel | null;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="relative w-full h-full max-w-5xl max-h-[80vh] bg-white rounded-lg overflow-hidden">
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
                <button
                    onClick={selectPreviewedModel}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                    Select This Model
                </button>
                <button
                    onClick={closePreview}
                    className="p-2 bg-white"
                >
                    <X size={20} />
                </button>
            </div>
            <iframe
                title={`Sketchfab Viewer - ${previewModel?.name}`}
                className="w-full h-full"
                src={previewModel?.embedUrl}
                allow="autoplay; fullscreen; vr"
                frameBorder="0"
            ></iframe>
        </div>
    </div>
);