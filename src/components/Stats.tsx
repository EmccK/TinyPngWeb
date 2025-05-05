import React, { useMemo } from 'react';
import { CompressedImage, CompressedImageHistory } from '../types';
import { getHistory } from '../services/historyService';
import { BarChart2 } from 'lucide-react';

interface StatsProps {
  images: CompressedImage[];
}

const Stats: React.FC<StatsProps> = ({ images }) => {
  const history = useMemo(() => getHistory(), []);
  
  const stats = useMemo(() => {
    const successfulImages = images.filter((img) => img.status === 'success');
    
    if (successfulImages.length === 0 && history.length === 0) {
      return null;
    }
    
    const totalOriginalSize = successfulImages.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressedSize = successfulImages.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
    
    // Add historical stats
    const historicalOriginalSize = history.reduce((sum, img) => sum + img.originalSize, 0);
    const historicalCompressedSize = history.reduce((sum, img) => sum + img.compressedSize, 0);
    
    const savedBytes = totalOriginalSize - totalCompressedSize;
    const historicalSavedBytes = historicalOriginalSize - historicalCompressedSize;
    
    const savingsPercentage = (savedBytes / totalOriginalSize) * 100;
    const historicalSavingsPercentage = (historicalSavedBytes / historicalOriginalSize) * 100;
    
    return {
      totalImages: successfulImages.length,
      historicalImages: history.length,
      totalOriginalSize,
      historicalOriginalSize,
      totalCompressedSize,
      historicalCompressedSize,
      savedBytes,
      historicalSavedBytes,
      savingsPercentage,
      historicalSavingsPercentage,
    };
  }, [images, history]);
  
  if (!stats || images.length === 0) {
    return null;
  }
  
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
      <div className="flex items-center mb-3">
        <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">Compression Results</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Total Files</p>
          <p className="text-xl font-semibold text-gray-900">{stats.totalImages}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Original Size</p>
          <p className="text-xl font-semibold text-gray-900">{formatSize(stats.totalOriginalSize)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Compressed Size</p>
          <p className="text-xl font-semibold text-gray-900">{formatSize(stats.totalCompressedSize)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Saved</p>
          <p className="text-xl font-semibold text-green-600">
            {formatSize(stats.savedBytes)} ({stats.savingsPercentage.toFixed(1)}%)
          </p>
        </div>
      </div>
      
      {stats.historicalImages > 0 && (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">All-Time Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Files</p>
              <p className="text-xl font-semibold text-gray-900">{stats.historicalImages}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Original Size</p>
              <p className="text-xl font-semibold text-gray-900">{formatSize(stats.historicalOriginalSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Compressed Size</p>
              <p className="text-xl font-semibold text-gray-900">{formatSize(stats.historicalCompressedSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Saved</p>
              <p className="text-xl font-semibold text-green-600">
                {formatSize(stats.historicalSavedBytes)} ({stats.historicalSavingsPercentage.toFixed(1)}%)
              </p>
            </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Stats;