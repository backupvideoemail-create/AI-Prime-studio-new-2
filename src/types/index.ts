export type ScreenRoute = 
  | 'home'
  | 'create'
  | 'templates'
  | 'characters'
  | 'character-detail'
  | 'profile'
  | 'followers'
  | 'following'
  | 'favorites'
  | 'chats'
  | 'pricing'
  | 'how-it-works'
  | 'support'
  | 'faq'
  | 'more'
  | 'privacy'
  | 'terms';

export type LanguageCode = 'en' | 'hi';

export type CharacterCategory = 
  | 'all'
  | 'friendly'
  | 'cheerful'
  | 'calm'
  | 'playful'
  | 'creative'
  | 'adventure';

export interface AICharacter {
  id: string;
  name: string;
  gender?: 'female' | 'male';
  age: number; // adult age (>= 20)
  city: string;
  tagline: string;
  bio: string;
  personality: string;
  category: CharacterCategory;
  avatar: string;
  coverImage?: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  viewsCount: number;
  viewsBadge?: string; // e.g. "180.8K" matching screenshot
  isOnline?: boolean;
  isSeeded: boolean;
  isFavorite?: boolean;
  isFollowing?: boolean;
  tags: string[];
  greeting: string;
  samplePrompts: string[];
  gallery?: {
    url: string;
    title: string;
    style: string;
  }[];
}

export type TemplateCategory =
  | 'all'
  | 'trending'
  | 'viral'
  | 'royal'
  | 'wedding'
  | 'professional'
  | 'portrait'
  | 'cinematic'
  | 'fashion'
  | 'travel'
  | 'fitness'
  | 'social'
  | 'background'
  | 'creative';

export interface TemplateItem {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  badge?: string;
  // CRITICAL RULE: Before and After use the SAME fictional identity!
  beforeImage: string;
  afterImage: string;
  promptSuggestion: string;
  personName: string; // Fictional model name to explicitly enforce & communicate identity preservation
  likesCount?: number;
  likesDisplay?: string;
  gender?: 'male' | 'female' | 'unisex';
  subCategory?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  characterId: string;
  sender: 'user' | 'character';
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video';
  reaction?: string;
}

export interface RecentChatSummary {
  characterId: string;
  characterName: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isLoggedIn?: boolean;
  username: string;
  bio: string;
  avatar: string;
  membershipTier: 'Free' | 'Starter' | 'Pro Studio' | 'Free Starter' | 'Ultra VIP Lifetime' | string;
  creditsRemaining: number;
  followersCount: number;
  followingCount: number;
  favorites: string[];
  followingIds: string[];
}

export type PhotoStudioStep = 
  | 'upload'
  | 'options'
  | 'preview'
  | 'generating'
  | 'result';

export type GenerationProgressState = 
  | 'preparing'
  | 'uploading'
  | 'creating'
  | 'finalizing';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  credits: number;
  period: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}
