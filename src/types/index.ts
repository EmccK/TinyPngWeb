export interface CompressedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  compressedSize?: number;
  compressedUrl?: string;
  status: 'idle' | 'compressing' | 'success' | 'error';
  error?: string;
  progress?: number;
}

export interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export interface CompressedImageHistory {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressedAt: string;
  savings: number;
  compressedDataUrl?: string; // Base64 data URL for the compressed image
}