import React, { createContext, useState, useContext, useEffect } from 'react';
import { ApiKeyContextType } from '../types';

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const storedKey = localStorage.getItem('tinyPngApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('tinyPngApiKey', key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey: saveApiKey }}>
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