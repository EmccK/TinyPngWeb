import React, { useState } from 'react';
import { Key, Check, AlertCircle } from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

const ApiKeyForm: React.FC = () => {
  const { apiKey, setApiKey } = useApiKey();
  const [inputKey, setInputKey] = useState(apiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center mb-4">
        <Key className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">TinyPNG API Key</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your API key
          </label>
          <input
            id="api-key"
            type="text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your TinyPNG API key"
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Don't have an API key? <a href="https://tinypng.com/developers" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Get one for free</a>
          </p>
        </div>
        
        <button
          type="submit"
          disabled={!inputKey}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                    shadow-sm text-sm font-medium text-white 
                    ${
                      !inputKey
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
        >
          Save API Key
        </button>
      </form>
    </div>
  );
};

export default ApiKeyForm;