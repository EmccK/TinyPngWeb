import { CompressedImage, CompressedImageHistory } from '../types';

const HISTORY_KEY = 'compression-history';

export const saveToHistory = async (image: CompressedImage): Promise<void> => {
  if (image.status !== 'success' || !image.compressedSize || !image.compressedUrl) return;

  const history = getHistory();

  // Convert blob URL to data URL for storage
  let compressedDataUrl: string | undefined;
  try {
    const response = await fetch(image.compressedUrl);
    const blob = await response.blob();
    compressedDataUrl = await blobToDataURL(blob);
  } catch (error) {
    console.error('Failed to convert blob to data URL:', error);
  }

  const historyEntry: CompressedImageHistory = {
    id: image.id,
    originalName: image.originalFile.name,
    originalSize: image.originalSize,
    compressedSize: image.compressedSize,
    compressedAt: new Date().toISOString(),
    savings: ((image.originalSize - image.compressedSize) / image.originalSize) * 100,
    compressedDataUrl
  };

  history.unshift(historyEntry);

  // Keep only the last 50 items
  if (history.length > 50) {
    history.pop();
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// Helper function to convert Blob to Data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const getHistory = (): CompressedImageHistory[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};