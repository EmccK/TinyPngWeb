import React from 'react';
import { ImageDown, Settings, Key, CheckCircle } from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

const Header: React.FC = () => {
  const { apiKey, setApiKey, isApiKeySet, apiKeySource } = useApiKey();

  // 获取API密钥来源的显示文本
  const getApiKeySourceText = () => {
    switch (apiKeySource) {
      case 'environment':
        return '环境变量';
      case 'localStorage':
        return '本地存储';
      case 'userInput':
        return '用户输入';
      default:
        return '未设置';
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ImageDown className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">TinyCompress</h1>
          </div>
          <div className="flex items-center">
            {isApiKeySet && (
              <div className="flex items-center mr-4 px-3 py-1 bg-green-500/20 rounded-md">
                <CheckCircle className="h-4 w-4 mr-1 text-green-300" />
                <span className="text-xs text-green-100">API密钥已设置 ({getApiKeySourceText()})</span>
              </div>
            )}
            {apiKey && (
              <button
                onClick={() => setApiKey('')}
                className="flex items-center px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                更改API密钥
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-blue-100">
          使用TinyPNG强大的API高效压缩您的图片
        </p>
      </div>
    </header>
  );
};

export default Header;