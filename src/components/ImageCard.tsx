import React from 'react';
import { Check, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { CompressedImage } from '../types';

interface ImageCardProps {
  image: CompressedImage;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const calculateSavings = (original: number, compressed?: number): string => {
  if (!compressed) return '0%';
  const saving = ((original - compressed) / original) * 100;
  return `${saving.toFixed(1)}%`;
};

const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove, onRetry }) => {
  const handleDownload = () => {
    if (!image.compressedUrl) return;
    
    const link = document.createElement('a');
    link.href = image.compressedUrl;
    link.download = `compressed-${image.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getImagePreview = (): string => {
    return image.compressedUrl || URL.createObjectURL(image.originalFile);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative aspect-video bg-gray-100">
        <img
          src={getImagePreview()}
          alt={image.originalFile.name}
          className="w-full h-full object-contain"
        />
        {image.status === 'compressing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 text-white animate-spin mb-2" />
              <span className="text-white text-sm font-medium">
                {image.progress ? `${image.progress}%` : 'Compressing...'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-900 truncate" title={image.originalFile.name}>
            {image.originalFile.name}
          </h3>
          {image.status === 'success' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              <Check className="mr-1 h-3 w-3" />
              {calculateSavings(image.originalSize, image.compressedSize)}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Original</p>
            <p className="text-sm font-medium">{formatSize(image.originalSize)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Compressed</p>
            <p className="text-sm font-medium">
              {image.compressedSize ? formatSize(image.compressedSize) : '-'}
            </p>
          </div>
        </div>
        
        {image.status === 'error' && (
          <div className="mb-3 p-2 bg-red-50 rounded-md flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">
              {image.error || 'Failed to compress'}
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            onClick={() => onRemove(image.id)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Remove
          </button>
          
          {image.status === 'success' ? (
            <button
              onClick={handleDownload}
              className="flex items-center text-xs font-medium text-blue-500 hover:text-blue-700"
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </button>
          ) : image.status === 'error' ? (
            <button
              onClick={() => onRetry(image.id)}
              className="flex items-center text-xs font-medium text-blue-500 hover:text-blue-700"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;