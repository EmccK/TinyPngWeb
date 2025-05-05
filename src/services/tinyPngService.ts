import { v4 as uuidv4 } from 'uuid';
import { CompressedImage } from '../types';
import { saveToHistory } from './historyService';

export const compressImage = async (
  file: File,
  apiKey: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; size: number; serverPath?: string; originalName?: string }> => {
  try {
    if (onProgress) {
      onProgress(25);
    }

    // Create form data to send the file
    const formData = new FormData();
    formData.append('image', file);
    formData.append('apiKey', apiKey);

    // 获取API基础URL
    const apiBaseUrl = import.meta.env.PROD ? '' : 'http://localhost:3001';

    // Call TinyPNG API through our proxy server
    const response = await fetch(`${apiBaseUrl}/api/tinypng/shrink/file`, {
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
      onProgress(75);
    }

    // 使用服务器返回的压缩图片URL
    const compressedUrl = responseData.compressedUrl;

    if (!compressedUrl) {
      throw new Error('No compressed URL received');
    }

    if (onProgress) {
      onProgress(100);
    }

    return {
      url: compressedUrl, // 使用服务器上的URL
      size: responseData.output.size,
      serverPath: responseData.compressedFile, // 保存服务器上的文件路径
      originalName: responseData.originalName // 保存原始文件名
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
          serverPath: result.serverPath, // 添加服务器路径
          originalName: result.originalName || image.originalFile.name // 添加原始文件名
        };

        updateImage(image.id, {
          compressedUrl: result.url,
          compressedSize: result.size,
          status: 'success',
          progress: 100,
          serverPath: result.serverPath, // 添加服务器路径
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