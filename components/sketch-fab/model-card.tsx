import React from 'react';
import { Eye, Check, CircleDollarSign } from 'lucide-react';
import { SketchfabModel } from '@/types';
import { Button } from '../UI/button';

interface ModelCardProps {
    model: SketchfabModel;
    onClick?: (model: SketchfabModel) => void;
    onPreview?: (model: SketchfabModel) => void;
    isSelected?: boolean;
    disabled?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({
    model,
    onClick,
    onPreview,
    isSelected = false,
    disabled = false
}) => {
    const thumbnail = model.thumbnails.images.find(img => img.width === 720) ||
        model.thumbnails.images[0];

    const handleClick = () => {
        if (onClick && !disabled) {
            onClick(model);
        }
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPreview) {
            onPreview(model);
        }
    };

    const formatFileSize = (sizeInBytes: number | null | undefined): string => {
        if (!sizeInBytes || sizeInBytes === 0) return '0 Bytes';

        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        let i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
        let size = sizeInBytes / Math.pow(1024, i);
        if (size >= 100 && i < units.length - 1) {
            size /= 1024;
            i++;
        }
        return `${size.toFixed(2)} ${units[i]}`;
    };

    return (
        <div
            className={`bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 
                ${isSelected ? 'ring-2 ring-green-500' : ''} 
                ${disabled ? 'opacity-50' : 'hover:shadow-lg cursor-pointer'}`}
            onClick={handleClick}
        >
            <div className="relative aspect-video bg-gray-200">
                {isSelected && (
                    <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1">
                        <Check size={16} />
                    </div>
                )}

                {
                    !model.isDownloadable && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-gray-800 bg-opacity-80 px-1 py-1 shadow-md backdrop-blur-sm">
                            <CircleDollarSign className="h-4 w-4 text-yellow-400" />
                        </div>
                    )
                }

                <div className="absolute bottom-1 right-1 rounded bg-gray-900 bg-opacity-80 px-2 py-1 text-xs font-semibold text-gray-200 shadow backdrop-blur-sm">
                    {formatFileSize(model?.archives?.glb?.size)}
                </div>

                <img
                    src={thumbnail.url}
                    alt={model.name}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="p-2 flex justify-between items-center">
                <h3 className="text-sm truncate">{model.name}</h3>

                <Button
                    size="sm"
                    className='flex-shrink-0 bg-transparent hover:bg-transparent text-black shadow-none p-0 pl-4'
                    onClick={handlePreview}
                    disabled={disabled}
                >
                    <Eye size={18} />
                </Button>
            </div>
        </div>
    );
};

export default ModelCard;