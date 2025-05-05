import React, { createContext, useState, useContext, useEffect } from 'react';
import { ApiKeyContextType } from '../types';

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeySource, setApiKeySource] = useState<'environment' | 'localStorage' | 'userInput' | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState<boolean>(false);

  // 检查服务器端是否设置了API_KEY环境变量
  const checkServerApiKeyStatus = async () => {
    try {
      // 获取API基础URL
      const apiBaseUrl = import.meta.env.PROD ? '' : 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/status/apikey`);
      const data = await response.json();

      if (data.hasApiKey) {
        setIsApiKeySet(true);
        setApiKeySource('environment');
        // 如果服务器端有API_KEY，我们可以使用一个占位符
        // 实际的API_KEY会在服务器端使用
        setApiKey('environment-variable-set');
      }
    } catch (error) {
      console.error('Failed to check API key status:', error);
    }
  };

  useEffect(() => {
    // 首先检查服务器端API_KEY状态
    checkServerApiKeyStatus().then(() => {
      // 如果服务器端没有设置API_KEY，再检查前端
      // Check for API key from environment variables (injected at build time)
      const envApiKey = import.meta.env.VITE_API_KEY;

      if (envApiKey) {
        // If environment variable is set, use it
        setApiKey(envApiKey);
        setApiKeySource('environment');
        setIsApiKeySet(true);
      } else {
        // Otherwise fall back to localStorage
        const storedKey = localStorage.getItem('tinyPngApiKey');
        if (storedKey) {
          setApiKey(storedKey);
          setApiKeySource('localStorage');
          setIsApiKeySet(true);
        }
      }
    });
  }, []);

  const saveApiKey = (key: string) => {
    if (key) {
      // If a key is provided, save it to localStorage
      localStorage.setItem('tinyPngApiKey', key);
      setApiKey(key);
      setApiKeySource('userInput');
      setIsApiKeySet(true);
      setIsEditingApiKey(false); // Exit edit mode
    } else {
      // If an empty key is provided, enter edit mode
      setIsEditingApiKey(true);
    }
  };

  return (
    <ApiKeyContext.Provider value={{
      apiKey,
      setApiKey: saveApiKey,
      isApiKeySet,
      apiKeySource,
      isEditingApiKey,
      setIsEditingApiKey
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};