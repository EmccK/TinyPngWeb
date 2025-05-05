import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 px-4 sm:px-6 border-t border-gray-200 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 mb-4 sm:mb-0">
          © {new Date().getFullYear()} TinyCompress. All rights reserved.
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-red-500 mx-1" />
          <span>Powered by <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">TinyPNG</a></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;