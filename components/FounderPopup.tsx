
import React from 'react';
import { FounderProfile } from '../types';

interface FounderPopupProps {
  founder: FounderProfile;
  message?: string;
  onClose: () => void;
}

const FounderPopup: React.FC<FounderPopupProps> = ({ founder, message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-75"></div>
          <img 
            src={founder.avatarUrl} 
            alt={founder.name}
            className="relative w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg mx-auto"
          />
        </div>

        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          MassambaGPT
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed">
          "{message || founder.profileMessage}"
        </p>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="font-semibold text-gray-900 dark:text-white">{founder.name}</p>
          <p className="text-sm text-gray-500">{founder.profession}</p>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full canva-gradient text-white py-3 rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
        >
          Commencer l'aventure
        </button>
      </div>
    </div>
  );
};

export default FounderPopup;
