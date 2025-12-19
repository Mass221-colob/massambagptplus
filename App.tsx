
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Conversation, 
  Message, 
  Tone, 
  Theme, 
  AdminConfig,
  FounderProfile,
  AppStats,
  AdminLog,
  UserProfile,
  MassambaDatabase
} from './types';
import { DEFAULT_FOUNDER, DEFAULT_ADMIN_CONFIG, MOCK_STATS } from './constants';
import { geminiService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import FounderPopup from './components/FounderPopup';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

/**
 * Composant Typewriter pour un affichage mot par mot fluide et humain
 */
const Typewriter: React.FC<{ text: string; isStreaming?: boolean }> = ({ text, isStreaming }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      setWordIndex(words.length);
    }
  }, [isStreaming, text]);

  useEffect(() => {
    if (isStreaming && wordIndex < words.length) {
      const delay = Math.floor(Math.random() * 50) + 40; // Vitesse variable pour effet humain
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + (prev ? ' ' : '') + words[wordIndex]);
        setWordIndex(prev => prev + 1);
      }, delay); 
      return () => clearTimeout(timer);
    }
  }, [isStreaming, wordIndex, words]);

  return (
    <div className="relative inline">
      {displayedText}
      {isStreaming && (
        <span className="inline-block w-1 h-4 ml-1 bg-purple-500 animate-pulse align-middle rounded-full" />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [db, setDb] = useState<MassambaDatabase>(() => {
    const saved = localStorage.getItem('massambagpt_db');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.conversations = parsed.conversations.map((c: Conversation) => ({
        ...c,
        messages: c.messages.map((m: Message) => ({ ...m, isStreaming: false }))
      }));
      return parsed;
    }
    return {
      users: [{ id: 'user-1', name: 'Utilisateur Invité', email: 'guest@massambagpt.com', isPremium: false, joinedAt: Date.now() }],
      conversations: [],
      adminConfig: DEFAULT_ADMIN_CONFIG,
      founderProfile: DEFAULT_FOUNDER,
      securityLogs: [],
      stats: MOCK_STATS
    };
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [filteredTerm, setFilteredTerm] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [showFounderPopup, setShowFounderPopup] = useState(() => !localStorage.getItem('massambagpt_visited'));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const lastClickTime = useRef<number>(0);
  const [clickCount, setClickCount] = useState(0);
  const longPressTimer = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('massambagpt_db', JSON.stringify(db));
  }, [db]);

  useEffect(() => {
    scrollToBottom();
  }, [activeId, db.conversations, isLoading, isThinking]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "fr-FR";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputText(prev =>
            prev + (prev ? " " : "") + finalTranscript
          );
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addAdminLog = (action: string, details: string, status: 'success' | 'failure' | 'blocked' = 'success') => {
    const newLog: AdminLog = { id: uuidv4(), timestamp: Date.now(), action, details, status };
    setDb(prev => ({ ...prev, securityLogs: [newLog, ...prev.securityLogs].slice(0, 100) }));
  };

  const handleLogoClick = () => {
    if (!db.adminConfig.panelActive) return;
    const now = Date.now();
    if (now - lastClickTime.current > 500) { setClickCount(1); } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount === 5) { setIsAdminLoginOpen(true); setClickCount(0); }
    }
    lastClickTime.current = now;
  };

  const startLongPress = () => { if (db.adminConfig.panelActive) longPressTimer.current = setTimeout(() => setIsAdminLoginOpen(true), 5000); };
  const stopLongPress = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } };

  const toggleListening = () => {
    if (isListening) { 
      recognitionRef.current?.stop(); 
    } else {
      if (!recognitionRef.current) return alert("Microphone non supporté");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }

    const userPrompt = inputText;
    setInputText('');
    setIsLoading(true);
    setIsThinking(true);
    const startTime = Date.now();

    const userMsg: Message = { id: uuidv4(), role: 'user', content: userPrompt, timestamp: Date.now() };

    let currentConvId = activeId;
    let historyToPass: { role: 'user' | 'model', parts: { text: string }[] }[] = [];

    if (!currentConvId) {
      const newId = uuidv4();
      const newConv: Conversation = {
        id: newId,
        userId: 'user-1',
        title: userPrompt.slice(0, 30) + (userPrompt.length > 30 ? '...' : ''),
        messages: [userMsg],
        tone: db.adminConfig.defaultTone,
        lastUpdated: Date.now(),
        preferredLanguage: 'fr'
      };
      setDb(prev => ({ ...prev, conversations: [newConv, ...prev.conversations] }));
      setActiveId(newId);
      currentConvId = newId;
    } else {
      const existingConv = db.conversations.find(c => c.id === currentConvId);
      if (existingConv) {
        historyToPass = existingConv.messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));
      }
      setDb(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === currentConvId ? { ...c, messages: [...c.messages, userMsg], lastUpdated: Date.now() } : c
        )
      }));
    }

    const assistantMsgId = uuidv4();
    const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true };
    
    setDb(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => 
        c.id === currentConvId ? { ...c, messages: [...c.messages, assistantMsg] } : c
      )
    }));

    try {
      await geminiService.streamResponse(
        userPrompt,
        db.adminConfig.defaultTone,
        (cleanedContent) => {
          if (isThinking) setIsThinking(false);
          setDb(prev => ({
            ...prev,
            conversations: prev.conversations.map(c => 
              c.id === currentConvId ? {
                ...c,
                messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, content: cleanedContent } : m)
              } : c
            )
          }));
        },
        db.adminConfig.aiBehavior,
        db.adminConfig.specializations,
        db.adminConfig.responseLength,
        db.adminConfig.responseStyle,
        historyToPass
      );

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setDb(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === currentConvId ? {
            ...c,
            messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, generationTime: duration, isStreaming: false } : m)
          } : c
        )
      }));

    } catch (err) {
      console.error(err);
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = (updates: Partial<AdminConfig>) => {
    setDb(prev => ({ ...prev, adminConfig: { ...prev.adminConfig, ...updates } }));
  };

  const handleUpdateFounder = (updates: Partial<FounderProfile>) => {
    setDb(prev => ({ ...prev, founderProfile: { ...prev.founderProfile, ...updates } }));
  };

  const activeConversation = db.conversations.find(c => c.id === activeId);
  const filteredConversations = db.conversations.filter(c => 
    c.title.toLowerCase().includes(filteredTerm.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(filteredTerm.toLowerCase()))
  );

  return (
    <div className={`flex h-screen overflow-hidden ${theme === Theme.DARK ? 'dark bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {showFounderPopup && (
        <FounderPopup 
          founder={db.founderProfile} 
          message={db.adminConfig.welcomePopupMessage}
          onClose={() => { setShowFounderPopup(false); localStorage.setItem('massambagpt_visited', 'true'); }} 
        />
      )}

      {isAdminLoginOpen && (
        <AdminLogin 
          correctCode={db.adminConfig.secretCode}
          onSuccess={() => { setIsAdminLoginOpen(false); setIsAdminPanelOpen(true); }}
          onCancel={() => setIsAdminLoginOpen(false)}
          onLog={addAdminLog}
        />
      )}

      {isAdminPanelOpen && (
        <AdminPanel 
          config={db.adminConfig}
          founder={db.founderProfile}
          stats={db.stats}
          logs={db.securityLogs}
          onUpdateConfig={handleUpdateConfig}
          onUpdateFounder={handleUpdateFounder}
          onLogout={() => setIsAdminPanelOpen(false)}
          onLog={addAdminLog}
        />
      )}

      <div className="hidden md:flex w-72 shrink-0">
        <Sidebar 
          conversations={filteredConversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNewChat={() => setActiveId(null)}
          onToggleTheme={() => setTheme(prev => prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
          theme={theme}
          onSearch={setFilteredTerm}
          isPremium={db.users[0]?.isPremium || false}
          adsEnabled={db.adminConfig.adsEnabled}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 glass-effect sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 
              onClick={handleLogoClick}
              onMouseDown={startLongPress}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer select-none transform hover:scale-105 transition-transform"
            >
              MassambaGPT
            </h1>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full uppercase tracking-tighter">GRATUIT</span>
          </div>
          <div className="flex items-center gap-4">
             {db.adminConfig.adsEnabled && (
               <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 animate-pulse">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span className="text-[10px] font-bold text-gray-400">PUBS ACTIVÉES</span>
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {db.adminConfig.adsEnabled && (
            <div className="max-w-4xl mx-auto mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-100 dark:border-purple-800/50 rounded-2xl text-center transform hover:scale-[1.005] transition-transform cursor-pointer group">
              <span className="text-[8px] font-black text-purple-400 dark:text-purple-600 uppercase tracking-widest block mb-0.5 group-hover:text-purple-500">Partenaire Officiel</span>
              <p className="text-[11px] text-purple-600 dark:text-purple-300 font-semibold">Découvrez des opportunités uniques • Publicité solidaire</p>
            </div>
          )}

          {!activeConversation ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex items-center justify-center text-4xl transform hover:rotate-6 transition-transform hover:scale-110 cursor-default">🌍</div>
              </div>
              <div>
                <h2 className="text-4xl font-extrabold mb-3">Pensez plus grand.</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-medium">MassambaGPT est à ton écoute pour propulser tes projets vers de nouveaux sommets.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {db.adminConfig.specializations.slice(0, 4).map((spec, i) => (
                  <button 
                    key={i}
                    onClick={() => { setInputText(`Peux-tu m'aider à progresser en ${spec} ?`); }}
                    className="p-5 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-2xl text-left border border-gray-100 dark:border-gray-700 transition-all hover:scale-[1.02] hover:shadow-xl group"
                  >
                    <div className="font-bold text-sm mb-1 group-hover:text-purple-600 transition-colors">Aide en {spec}</div>
                    <div className="text-xs text-gray-400">Clique pour lancer la discussion 🚀</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {activeConversation.messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300 group`}>
                  <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl shadow-sm relative transition-all duration-300 transform hover:scale-[1.01] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:brightness-110 shadow-purple-500/10' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium tracking-tight">
                      {msg.role === 'assistant' ? <Typewriter text={msg.content} isStreaming={msg.isStreaming} /> : msg.content}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        {msg.role === 'user' ? 'Toi' : 'MassambaGPT'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {msg.role === 'assistant' && msg.content && !msg.isStreaming && (
                      <button 
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className={`p-1.5 rounded-lg transition-all ${copiedId === msg.id ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 opacity-0 group-hover:opacity-100'}`}
                        title="Copier le message"
                      >
                        {copiedId === msg.id ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {isThinking && (
                <div className="flex flex-col items-start animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-[13px] font-bold text-purple-600 dark:text-purple-400 italic">Analyse en cours...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent z-10">
          <form 
            onSubmit={handleSendMessage} 
            className="max-w-4xl mx-auto flex items-end gap-3 bg-white dark:bg-gray-800 p-2 pl-5 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 transition-all group"
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Écoute en cours..." : "Discute avec ton coach MassambaGPT..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-4 outline-none resize-none max-h-40 font-medium"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex items-center gap-2 mb-2 mr-2">
              <button 
                type="button" 
                onClick={toggleListening} 
                title="Microphone"
                className={`p-3.5 rounded-full transition-all hover:scale-110 active:scale-90 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-lg' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-purple-500'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !inputText.trim()} 
                title="Envoyer"
                className={`p-3.5 rounded-full shadow-lg transition-all ${isLoading || !inputText.trim() ? 'bg-gray-100 dark:bg-gray-700 text-gray-300 cursor-not-allowed' : 'canva-gradient text-white hover:scale-110 active:scale-95 shadow-purple-500/30'}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
              </button>
            </div>
          </form>
          <p className="text-[9px] text-center mt-4 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest opacity-80">
            Une création de Massamba Diop • L'excellence au service de ta vision
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
