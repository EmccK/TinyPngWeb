import React, { useState, useCallback, useEffect } from 'react';
import { useApiKey } from './context/ApiKeyContext';
import { CompressedImage, CompressedImageHistory } from './types';
import { processImages } from './services/tinyPngService';
import { getHistory } from './services/historyService';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ApiKeyForm from './components/ApiKeyForm';
import ImageUploader from './components/ImageUploader';
import ImageGrid from './components/ImageGrid';
import Stats from './components/Stats';
import HistoryPanel from './components/HistoryPanel';

function App() {
  const { apiKey } = useApiKey();
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<CompressedImageHistory[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // Load history on component mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleImagesAdded = useCallback((newImages: CompressedImage[]) => {
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const updateImage = useCallback((id: string, updates: Partial<CompressedImage>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  }, []);

  const handleCompressImages = useCallback(async () => {
    if (!apiKey || images.length === 0 || isProcessing) return;

    const pendingImages = images.filter(
      (img) => img.status === 'idle' || img.status === 'error'
    );

    if (pendingImages.length === 0) return;

    setIsProcessing(true);

    try {
      await processImages(pendingImages, apiKey, updateImage);
      // Refresh history after compression
      setHistory(getHistory());
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, images, isProcessing, updateImage]);

  const handleRetryImage = useCallback(
    async (id: string) => {
      const image = images.find((img) => img.id === id);
      if (!image) return;

      updateImage(id, { status: 'idle', error: undefined });

      try {
        // Process this single image
        await processImages([{ ...image, status: 'idle' }], apiKey, updateImage);
        // Refresh history after compression
        setHistory(getHistory());
      } catch (error) {
        console.error('Error retrying image:', error);
      }
    },
    [apiKey, images, updateImage]
  );

  // Handler for history changes
  const handleHistoryChange = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const pendingImagesCount = images.filter(
    (img) => img.status === 'idle' || img.status === 'error'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {!apiKey && <ApiKeyForm />}

          {apiKey && (
            <>
              {/* Show history panel at the top */}
              <HistoryPanel
                history={history}
                onHistoryChange={handleHistoryChange}
                currentImages={images}
              />

              <ImageUploader onImagesAdded={handleImagesAdded} disabled={isProcessing} />

              {pendingImagesCount > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleCompressImages}
                    disabled={isProcessing}
                    className={`px-6 py-2 rounded-md text-white font-medium
                              ${
                                isProcessing
                                  ? 'bg-blue-300 cursor-not-allowed'
                                  : 'bg-blue-500 hover:bg-blue-600 shadow-sm'
                              }
                              transition-all duration-200`}
                  >
                    {isProcessing
                      ? 'Compressing...'
                      : `Compress ${pendingImagesCount} Image${
                          pendingImagesCount !== 1 ? 's' : ''
                        }`}
                  </button>
                </div>
              )}

              <ImageGrid
                images={images}
                onRemoveImage={handleRemoveImage}
                onRetryImage={handleRetryImage}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;