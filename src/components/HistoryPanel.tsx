import React, { useState, useMemo } from 'react';
import { Download, Trash2, Clock, Calendar, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { CompressedImage, CompressedImageHistory } from '../types';
import { clearHistory } from '../services/historyService';

interface HistoryPanelProps {
  history: CompressedImageHistory[];
  onHistoryChange: () => void;
  currentImages?: CompressedImage[]; // 当前会话中的图片，用于显示当前统计
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onHistoryChange, currentImages = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [displayCount, setDisplayCount] = useState(3); // 默认显示3条记录

  // 计算当前会话的统计数据
  const currentStats = useMemo(() => {
    const successfulImages = currentImages.filter((img) => img.status === 'success');

    if (successfulImages.length === 0) {
      return null;
    }

    const totalOriginalSize = successfulImages.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressedSize = successfulImages.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
    const savedBytes = totalOriginalSize - totalCompressedSize;
    const savingsPercentage = totalOriginalSize > 0 ? (savedBytes / totalOriginalSize) * 100 : 0;

    return {
      totalImages: successfulImages.length,
      totalOriginalSize,
      totalCompressedSize,
      savedBytes,
      savingsPercentage,
    };
  }, [currentImages]);

  const handleDownload = (item: CompressedImageHistory) => {
    if (!item.compressedDataUrl) {
      alert('Compressed image data is not available');
      return;
    }

    const link = document.createElement('a');
    link.href = item.compressedDataUrl;
    link.download = `compressed-${item.originalName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all compression history?')) {
      clearHistory();
      onHistoryChange();
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setDisplayCount(history.length); // 展开时显示所有记录
    } else {
      setDisplayCount(3); // 折叠时只显示3条
    }
  };

  if (history.length === 0) {
    return null;
  }

  // 计算总体统计数据
  const totalOriginalSize = history.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = history.reduce((sum, img) => sum + img.compressedSize, 0);
  const totalSavedBytes = totalOriginalSize - totalCompressedSize;
  const savingsPercentage = (totalSavedBytes / totalOriginalSize) * 100;

  // 只显示前displayCount条记录
  const displayedHistory = history.slice(0, displayCount);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Compression Results</h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={toggleExpanded}
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center mr-4"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All ({history.length})
              </>
            )}
          </button>
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-500 hover:text-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* 当前会话统计数据 */}
      {currentStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Session</p>
            <p className="text-xl font-semibold text-gray-900">{currentStats.totalImages} Files</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Original Size</p>
            <p className="text-xl font-semibold text-gray-900">{formatSize(currentStats.totalOriginalSize)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Compressed Size</p>
            <p className="text-xl font-semibold text-gray-900">{formatSize(currentStats.totalCompressedSize)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Saved</p>
            <p className="text-xl font-semibold text-green-600">
              {formatSize(currentStats.savedBytes)} ({currentStats.savingsPercentage.toFixed(1)}%)
            </p>
          </div>
        </div>
      )}

      {/* 历史统计数据 */}
      {history.length > 0 && (
        <div className={`${currentStats ? 'border-t pt-4' : ''} mb-4`}>
          <h3 className="text-sm font-medium text-gray-700 mb-3">All-Time Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Files</p>
              <p className="text-xl font-semibold text-gray-900">{history.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Original Size</p>
              <p className="text-xl font-semibold text-gray-900">{formatSize(totalOriginalSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Compressed Size</p>
              <p className="text-xl font-semibold text-gray-900">{formatSize(totalCompressedSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Saved</p>
              <p className="text-xl font-semibold text-green-600">
                {formatSize(totalSavedBytes)} ({savingsPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录列表 */}
      {history.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center mb-3">
            <Clock className="h-4 w-4 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Recent Compressions</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {displayedHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  {item.compressedDataUrl ? (
                    <img
                      src={item.compressedDataUrl}
                      alt={item.originalName}
                      className="h-12 w-12 object-cover rounded mr-3"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                      <span className="text-xs text-gray-500">No img</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{item.originalName}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span className="mr-3">{formatDate(item.compressedAt)}</span>
                      <span className="mr-3">{formatSize(item.originalSize)} → {formatSize(item.compressedSize)}</span>
                      <span className="text-green-600">-{item.savings.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(item)}
                  disabled={!item.compressedDataUrl}
                  className={`flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 ${!item.compressedDataUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
