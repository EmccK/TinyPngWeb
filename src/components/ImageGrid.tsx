import React from 'react';
import { CompressedImage } from '../types';
import ImageCard from './ImageCard';

interface ImageGridProps {
  images: CompressedImage[];
  onRemoveImage: (id: string) => void;
  onRetryImage: (id: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onRemoveImage, 
  onRetryImage 
}) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Images</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onRemove={onRemoveImage}
            onRetry={onRetryImage}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;