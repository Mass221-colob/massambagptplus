
import React, { useState, useRef } from 'react';
import { AdminConfig, FounderProfile, AppStats, Tone, AdminLog, ResponseLength, ResponseStyle } from '../types';

interface AdminPanelProps {
  config: AdminConfig;
  founder: FounderProfile;
  stats: AppStats;
  logs: AdminLog[];
  onUpdateConfig: (newConfig: Partial<AdminConfig>) => void;
  onUpdateFounder: (newFounder: Partial<FounderProfile>) => void;
  onLogout: () => void;
  onLog: (action: string, details: string) => void;
}

type Tab = 'dashboard' | 'ai' | 'content' | 'founder' | 'monetization' | 'security' | 'logs';

const AdminPanel: React.FC<AdminPanelProps> = ({ config, founder, stats, logs, onUpdateConfig, onUpdateFounder, onLogout, onLog }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'ai', label: 'Gestion de l\'IA', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'content', label: 'Gestion du Contenu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'founder', label: 'Profil Fondateur', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'monetization', label: 'Monétisation', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'security', label: 'Sécurité', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'logs', label: 'Journaux', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  const handleUpdateConfig = (newConfig: Partial<AdminConfig>) => {
    onUpdateConfig(newConfig);
    const key = Object.keys(newConfig)[0];
    onLog('Modification Config', `Mise à jour de la propriété: ${key}`);
  };

  const handleUpdateFounder = (newFounder: Partial<FounderProfile>) => {
    onUpdateFounder(newFounder);
    const key = Object.keys(newFounder)[0];
    onLog('Modification Profil', `Mise à jour du profil fondateur: ${key}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateFounder({ avatarUrl: reader.result as string });
        onLog('Import Image', 'Nouvelle photo de profil importée');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-50 dark:bg-gray-950 flex overflow-hidden animate-in slide-in-from-right duration-500">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl canva-gradient flex items-center justify-center text-white shadow-lg shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-gray-900 dark:text-white truncate">Admin Panel</h2>
              <p className="text-[10px] text-purple-600 font-bold uppercase truncate">Centre de Contrôle</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              onLog('Déconnexion', 'Session admin terminée');
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'founder' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil du Fondateur</h1>
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <img 
                      src={founder.avatarUrl} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/20 shadow-2xl transition-transform group-hover:scale-105" 
                      alt="Fondateur"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                      title="Importer une photo"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nom du Fondateur</label>
                      <input
                        type="text"
                        value={founder.name}
                        onChange={(e) => handleUpdateFounder({ name: e.target.value })}
                        placeholder="Nom complet"
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Profession / Titre</label>
                      <input
                        type="text"
                        value={founder.profession}
                        onChange={(e) => handleUpdateFounder({ profession: e.target.value })}
                        placeholder="Profession"
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Message de bienvenue du fondateur</label>
                  <textarea
                    rows={4}
                    value={founder.profileMessage}
                    onChange={(e) => handleUpdateFounder({ profileMessage: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aperçu global</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Utilisateurs" value={stats.totalUsers} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                <StatCard label="Conversations" value={stats.totalConversations} icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                <StatCard label="Revenu Est." value={stats.estimatedRevenue} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" color="bg-green-500" />
                <StatCard label="Temps moyen" value={stats.averageUsageTime} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuration de l'IA</h1>
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Comportement de base (System Instruction)</label>
                  <textarea
                    rows={4}
                    value={config.aiBehavior}
                    onChange={(e) => handleUpdateConfig({ aiBehavior: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Ton par défaut</label>
                    <select
                      value={config.defaultTone}
                      onChange={(e) => handleUpdateConfig({ defaultTone: e.target.value as Tone })}
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                    >
                      <option value={Tone.MOTIVATING}>🚀 Motivant</option>
                      <option value={Tone.PROFESSIONAL}>💼 Professionnel</option>
                      <option value={Tone.SIMPLE}>💡 Simple</option>
                      <option value={Tone.EDUCATIONAL}>🎓 Éducatif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Style de réponse</label>
                    <select
                      value={config.responseStyle}
                      onChange={(e) => handleUpdateConfig({ responseStyle: e.target.value as ResponseStyle })}
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                    >
                      <option value={ResponseStyle.COACH}>Coach (Motivant & Dynamique)</option>
                      <option value={ResponseStyle.EXPERT}>Expert (Technique & Approfondi)</option>
                      <option value={ResponseStyle.VULGARIZER}>Vulgarisateur (Simple & Clair)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Longueur des réponses</label>
                    <select
                      value={config.responseLength}
                      onChange={(e) => handleUpdateConfig({ responseLength: e.target.value as ResponseLength })}
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                    >
                      <option value={ResponseLength.SHORT}>Courte (Directe)</option>
                      <option value={ResponseLength.MEDIUM}>Moyenne (Équilibrée)</option>
                      <option value={ResponseLength.LONG}>Longue (Détaillée)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Expertises (séparées par virgules)</label>
                    <input
                      type="text"
                      value={config.specializations.join(', ')}
                      onChange={(e) => handleUpdateConfig({ specializations: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Journaux d'audit</h1>
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Horodatage</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-600">{log.action}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 italic">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = "bg-purple-600" }: { label: string, value: any, icon: string, color?: string }) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-md`}>
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  </div>
);

export default AdminPanel;
