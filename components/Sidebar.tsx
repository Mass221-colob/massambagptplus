
import React, { useState } from 'react';
import { Conversation, Theme } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onToggleTheme: () => void;
  theme: Theme;
  onSearch: (term: string) => void;
  isPremium: boolean;
  adsEnabled: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversations, 
  activeId, 
  onSelect, 
  onNewChat, 
  onToggleTheme, 
  theme,
  onSearch,
  isPremium,
  adsEnabled
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 canva-gradient text-white py-3 px-4 rounded-xl font-medium shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Chat
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-all"
          />
          <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10 italic">Aucun historique de pensée</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-3 group transform hover:scale-[1.03] active:scale-[0.98] ${
                activeId === conv.id 
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/40' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0 transition-colors group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="truncate text-sm font-semibold flex-1">{conv.title}</span>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
        {adsEnabled && (
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center animate-pulse">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Sponsoring AdMob</span>
            <div className="h-12 flex items-center justify-center text-[10px] text-gray-400 italic">Annonce Partenaire</div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <button 
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-110 transition-all"
          >
            {theme === Theme.LIGHT ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">MassambaGPT Free</span>
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xs group-hover:scale-110 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-all">
              MD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
