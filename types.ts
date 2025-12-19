
export enum Tone {
  PROFESSIONAL = 'professionnel',
  MOTIVATING = 'motivant',
  SIMPLE = 'simple',
  EDUCATIONAL = 'éducatif'
}

export enum ResponseLength {
  SHORT = 'courte',
  MEDIUM = 'moyenne',
  LONG = 'longue'
}

export enum ResponseStyle {
  VULGARIZER = 'vulgarisateur simple',
  EXPERT = 'expert technique',
  COACH = 'coach motivant'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isPremium: boolean;
  joinedAt: number;
}

export interface AdminLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  status: 'success' | 'failure' | 'blocked';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isFavorite?: boolean;
  translations?: Record<string, string>;
  activeLanguage?: string;
  generationTime?: number; // Temps en millisecondes
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  tone: Tone;
  lastUpdated: number;
  preferredLanguage?: string;
}

export interface FounderProfile {
  name: string;
  profession: string;
  profileMessage: string;
  avatarUrl?: string;
}

export interface AdminConfig {
  secretCode: string;
  defaultTone: Tone;
  responseLength: ResponseLength;
  responseStyle: ResponseStyle;
  specializations: string[];
  aiBehavior: string;
  welcomePopupMessage: string;
  adsEnabled: boolean;
  premiumEnabled: boolean;
  panelActive: boolean;
}

export interface AppStats {
  totalUsers: number;
  totalConversations: number;
  topQuestions: string[];
  averageUsageTime: string;
  estimatedRevenue: string;
}

export interface MassambaDatabase {
  users: UserProfile[];
  conversations: Conversation[];
  adminConfig: AdminConfig;
  founderProfile: FounderProfile;
  securityLogs: AdminLog[];
  stats: AppStats;
}
