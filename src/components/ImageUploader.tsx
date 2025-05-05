import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { CompressedImage } from '../types';
import { prepareImageForCompression } from '../services/tinyPngService';

interface ImageUploaderProps {
  onImagesAdded: (newImages: CompressedImage[]) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesAdded, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (imageFiles.length === 0) return;

      const preparedImages = imageFiles.map((file) =>
        prepareImageForCompression(file)
      );

      onImagesAdded(preparedImages);
    },
    [onImagesAdded, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) {
        handleFilesSelected(e.dataTransfer.files);
      }
    },
    [handleFilesSelected, disabled]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilesSelected(e.target.files);
    },
    [handleFilesSelected]
  );

  return (
    <div
      className={`w-full p-8 border-2 border-dashed rounded-lg transition-all duration-200 ${
        isDragging
          ? 'bg-blue-50 border-blue-500'
          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
      } ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) {
          document.getElementById('file-input')?.click();
        }
      }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <Upload
          className={`w-16 h-16 mb-4 ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`}
        />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          {isDragging ? 'Drop images here' : 'Drag & drop images here'}
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          or <span className="text-blue-500 font-medium">browse files</span>
        </p>
        <p className="text-xs text-gray-400">
          Supports JPG, PNG, WebP and GIF
        </p>
      </div>
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUploader;