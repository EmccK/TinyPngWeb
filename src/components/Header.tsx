import React from 'react';
import { ImageDown, Settings } from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

const Header: React.FC = () => {
  const { apiKey, setApiKey } = useApiKey();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
          <ImageDown className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-bold">TinyCompress</h1>
          </div>
          {apiKey && (
            <button
              onClick={() => setApiKey('')}
              className="flex items-center px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Change API Key
            </button>
          )}
        </div>
        <p className="mt-2 text-blue-100">
          Compress your images efficiently with TinyPNG's powerful API
        </p>
      </div>
    </header>
  );
};

export default Header;