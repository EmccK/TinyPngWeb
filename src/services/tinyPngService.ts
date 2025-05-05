import { v4 as uuidv4 } from 'uuid';
import { CompressedImage } from '../types';
import { saveToHistory } from './historyService';

export const compressImage = async (
  file: File,
  apiKey: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; size: number }> => {
  try {
    if (onProgress) {
      onProgress(25);
    }

    // Create form data to send the file
    const formData = new FormData();
    formData.append('image', file);
    formData.append('apiKey', apiKey);

    // Call TinyPNG API through our proxy server
    const response = await fetch('http://localhost:3001/api/tinypng/shrink/file', {
      method: 'POST',
      body: formData
    });

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to compress image');
    }

    // Parse the successful response
    const responseData = await response.json();

    if (onProgress) {
      onProgress(50);
    }

    // Get the URL of the compressed image from the Location header
    const outputUrl = responseData.location;

    if (!outputUrl) {
      throw new Error('No output URL received from TinyPNG');
    }

    // Download the compressed image through our proxy server
    const outputResponse = await fetch(`http://localhost:3001/api/tinypng/output?url=${encodeURIComponent(outputUrl)}&apiKey=${encodeURIComponent(apiKey)}`);

    if (!outputResponse.ok) {
      throw new Error('Failed to download compressed image');
    }

    if (onProgress) {
      onProgress(75);
    }

    // Create a blob from the compressed image data
    const compressedBlob = await outputResponse.blob();

    if (onProgress) {
      onProgress(100);
    }

    return {
      url: URL.createObjectURL(compressedBlob),
      size: responseData.output.size,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const processImages = async (
  images: CompressedImage[],
  apiKey: string,
  updateImage: (id: string, updates: Partial<CompressedImage>) => void
): Promise<void> => {
  await Promise.all(
    images.map(async (image) => {
      try {
        updateImage(image.id, { status: 'compressing', progress: 0 });

        const result = await compressImage(image.originalFile, apiKey, (progress) => {
          updateImage(image.id, { progress });
        });

        const updatedImage = {
          ...image,
          compressedUrl: result.url,
          compressedSize: result.size,
          status: 'success' as const,
          progress: 100,
        };

        updateImage(image.id, {
          compressedUrl: result.url,
          compressedSize: result.size,
          status: 'success',
          progress: 100,
        });

        // Save successful compression to history
        await saveToHistory(updatedImage);
      } catch (error) {
        updateImage(image.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })
  );
};

export const prepareImageForCompression = (file: File): CompressedImage => {
  return {
    id: uuidv4(),
    originalFile: file,
    originalSize: file.size,
    status: 'idle',
  };
};