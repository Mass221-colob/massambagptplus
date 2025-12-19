
import React, { useState, useEffect } from 'react';

interface AdminLoginProps {
  correctCode: string;
  onSuccess: () => void;
  onCancel: () => void;
  onLog: (action: string, details: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ correctCode, onSuccess, onCancel, onLog }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem('massambagpt_admin_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem('massambagpt_admin_locked_until');
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    localStorage.setItem('massambagpt_admin_attempts', attempts.toString());
  }, [attempts]);

  useEffect(() => {
    if (lockedUntil) {
      localStorage.setItem('massambagpt_admin_locked_until', lockedUntil.toString());
    } else {
      localStorage.removeItem('massambagpt_admin_locked_until');
    }
  }, [lockedUntil]);

  const isBlocked = lockedUntil ? Date.now() < lockedUntil : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    if (code === correctCode) {
      setAttempts(0);
      setLockedUntil(null);
      onLog('Connexion réussie', 'Accès autorisé au Panel Admin');
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError('Code incorrect. Accès refusé.');
      setCode('');
      onLog('Tentative échouée', `Tentative d'accès avec code erroné. Tentative ${newAttempts}/3`);
      
      if (newAttempts >= 3) {
        const lockTime = Date.now() + 15 * 60 * 1000; // 15 minutes
        setLockedUntil(lockTime);
        setError('Accès bloqué pendant 15 minutes après 3 tentatives.');
        onLog('Verrouillage système', 'Accès bloqué pour 15 minutes');
      }
    }
  };

  const formatTimeLeft = () => {
    if (!lockedUntil) return '';
    const diff = Math.max(0, lockedUntil - Date.now());
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accès Administrateur</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 font-medium">
          {isBlocked ? `Sécurité activée. Réessayez dans ${formatTimeLeft()}.` : 'Veuillez entrer le code secret pour accéder au centre de contrôle.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            disabled={isBlocked}
            className={`w-full text-center text-3xl tracking-[1em] py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 transition-all text-gray-900 dark:text-white placeholder:text-gray-300 outline-none ${
              isBlocked ? 'border-red-200 dark:border-red-900 opacity-50' : 'border-transparent focus:border-purple-500'
            }`}
          />
          
          {error && (
            <p className="text-xs font-bold text-red-500">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isBlocked || code.length < 4}
              className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all ${
                isBlocked || code.length < 4
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'canva-gradient text-white hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isBlocked ? 'Système Verrouillé' : 'Valider'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
