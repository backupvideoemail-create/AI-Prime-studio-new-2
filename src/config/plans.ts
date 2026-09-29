/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Plan & Pricing Configuration
 * Section 4 & 5 of Master Final Build Instruction
 */

export {
  PLAN_ENTITLEMENTS,
  TOP_UP_PACKS,
  checkPlanEntitlement,
  getRequiredPlanName,
  normalizeTierToPlanId,
} from './entitlements';
export type { PlanId, ProductFeatureKey, PlanEntitlementConfig, TopUpPack } from './entitlements';

export interface PlanConfig {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number; // Stored price amount
  periodText: string;
  billingCycle: 'free' | '48h_trial' | 'weekly';
  currency: string;
  creditsPerMonth: number;
  generationsCount: number;
  resolution: '1080p' | '2K QHD' | '4K Ultra-HD' | '8K Cinematic';
  features: string[];
  disclosureNotice?: string;
  hasVoiceCall: boolean;
  hasVideoCall: boolean;
  hasMediaAttachments: boolean;
  hasVideoGeneration: boolean;
  hasVideoFaceSwapEarlyAccess: boolean;
  hasWatermark: boolean;
  hasVerifiedBadge: boolean;
  hasSupport24x7: boolean;
  gpuPriority: 'standard' | 'high' | 'ultra' | 'dedicated';
  popular?: boolean;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  generations: number;
  price: number;
  currency: string;
  badge?: string;
  description: string;
}

export const CREDITS_PER_GENERATION = 50;
export const SIGNUP_FREE_CREDITS = 0; // Section 5: Free Signup has 0 purchased generation credits

export const PLAN_SETTINGS = {
  creditsPerGeneration: 50,
  freeWelcomeCredits: 0,
  trialPrice: 2,
  trialCredits: 150,
  plusWeeklyPrice: 99,
  plusWeeklyCredits: 400,
  proWeeklyPrice: 199,
  proWeeklyCredits: 1000,
  ultraProWeeklyPrice: 299,
  ultraProWeeklyCredits: 1500,
  ultraProMaxWeeklyPrice: 999,
  ultraProMaxWeeklyCredits: 5000,
};

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free Signup',
    priceMonthly: 0,
    periodText: 'lifetime',
    billingCycle: 'free',
    currency: '₹',
    creditsPerMonth: 0,
    generationsCount: 0,
    resolution: '1080p',
    features: [
      'Limited AI Friends Chat (Google DeepMind)',
      'Preview Templates & Prompts',
      'Subtle AI CLUB watermark on exports',
      '❌ Audio Voice Calling (Pro में अनलॉक)',
      '❌ AI Video Generation (Ultra Pro में अनलॉक)',
      '❌ Video Calling (Ultra Pro Max में अनलॉक)',
      '❌ Face Swap Video (Ultra Pro Max में अनलॉक)',
      '❌ Verified Blue Tick Badge Locked',
    ],
    hasVoiceCall: false,
    hasVideoCall: false,
    hasMediaAttachments: false,
    hasVideoGeneration: false,
    hasVideoFaceSwapEarlyAccess: false,
    hasWatermark: true,
    hasVerifiedBadge: false,
    hasSupport24x7: false,
    gpuPriority: 'standard',
  },
  {
    id: 'trial',
    name: '₹2 Intro Trial',
    badge: '2 Days Free Trial ₹2 🔥',
    popular: true,
    priceMonthly: PLAN_SETTINGS.trialPrice,
    periodText: '2 days',
    billingCycle: '48h_trial',
    currency: '₹',
    creditsPerMonth: PLAN_SETTINGS.trialCredits,
    generationsCount: 3,
    resolution: '2K QHD',
    features: [
      '150 Generation Credits',
      'AI Photo Studio & Image Generation',
      'Extended AI Friends Chat',
      'Zero Watermark on Trial Creations',
      '2 Days VIP Trial Access',
      'Cancel anytime with 1 click',
      '❌ Audio Voice Calling (Pro में अनलॉक)',
      '❌ Premium Video Generation (Ultra Pro में अनलॉक)',
      '❌ Video Calling (Ultra Pro Max में अनलॉक)',
      '❌ Face Swap Video (Ultra Pro Max में अनलॉक)',
    ],
    hasVoiceCall: false,
    hasVideoCall: false,
    hasMediaAttachments: true,
    hasVideoGeneration: false,
    hasVideoFaceSwapEarlyAccess: false,
    hasWatermark: false,
    hasVerifiedBadge: false,
    hasSupport24x7: true,
    gpuPriority: 'high',
  },
  {
    id: 'plus',
    name: 'PLUS',
    badge: 'Creator Essential',
    priceMonthly: PLAN_SETTINGS.plusWeeklyPrice,
    periodText: 'week',
    billingCycle: 'weekly',
    currency: '₹',
    creditsPerMonth: PLAN_SETTINGS.plusWeeklyCredits,
    generationsCount: 8,
    resolution: '2K QHD',
    features: [
      '400 Credits / week',
      'AI Friends Chat — Fair Use',
      'Text-to-Image Generation',
      'Image-to-Image Photo Enhancement',
      'Zero Watermark on all exports',
      'Official Verified Blue Tick (ब्लू टिक) Badge',
      '24/7 Priority Support Included',
      '❌ Audio Calling Locked (Pro में अनलॉक)',
      '❌ AI Video Generation (Ultra Pro में अनलॉक)',
      '❌ Video Calling Locked (Ultra Pro Max में अनलॉक)',
      '❌ Face Swap Video (Ultra Pro Max में अनलॉक)',
    ],
    hasVoiceCall: false,
    hasVideoCall: false,
    hasMediaAttachments: true,
    hasVideoGeneration: false,
    hasVideoFaceSwapEarlyAccess: false,
    hasWatermark: false,
    hasVerifiedBadge: true,
    hasSupport24x7: true,
    gpuPriority: 'high',
  },
  {
    id: 'pro',
    name: 'PRO',
    badge: 'Audio Voice Plan 🔥',
    popular: true,
    priceMonthly: PLAN_SETTINGS.proWeeklyPrice,
    periodText: 'week',
    billingCycle: 'weekly',
    currency: '₹',
    creditsPerMonth: PLAN_SETTINGS.proWeeklyCredits,
    generationsCount: 20,
    resolution: '4K Ultra-HD',
    features: [
      '1,000 Credits / week',
      '📞 Live 2-Way Audio Voice Calling UNLOCKED',
      'AI Friends Chat — Fair Use',
      'Text-to-Image & Image-to-Image Presets',
      'Google DeepMind High-IQ Companion Voice',
      'Official Verified Blue Tick (ब्लू टिक) Badge',
      '24/7 Priority VIP Customer Support',
      '❌ AI Video Generation (Ultra Pro में अनलॉक)',
      '❌ Video Calling (Ultra Pro Max में अनलॉक)',
      '❌ Face Swap Video (Ultra Pro Max में अनलॉक)',
    ],
    hasVoiceCall: true,
    hasVideoCall: false,
    hasMediaAttachments: true,
    hasVideoGeneration: false,
    hasVideoFaceSwapEarlyAccess: false,
    hasWatermark: false,
    hasVerifiedBadge: true,
    hasSupport24x7: true,
    gpuPriority: 'ultra',
  },
  {
    id: 'ultra_pro',
    name: 'ULTRA PRO',
    badge: 'AI Video Creator ⚡',
    priceMonthly: PLAN_SETTINGS.ultraProWeeklyPrice,
    periodText: 'week',
    billingCycle: 'weekly',
    currency: '₹',
    creditsPerMonth: PLAN_SETTINGS.ultraProWeeklyCredits,
    generationsCount: 30,
    resolution: '4K Ultra-HD',
    features: [
      '1,500 Credits / week',
      '🎬 Text-to-Video & Image-to-Video UNLOCKED',
      '📞 Live 2-Way Audio Voice Calling UNLOCKED',
      'AI Friends Chat — Fair Use',
      'Official Verified Blue Tick (ब्लू टिक) Badge',
      '24/7 Dedicated VIP Customer Support',
      '❌ Video Calling (Ultra Pro Max में अनलॉक)',
      '❌ Face Swap Video (Ultra Pro Max में अनलॉक)',
    ],
    hasVoiceCall: true,
    hasVideoCall: false,
    hasMediaAttachments: true,
    hasVideoGeneration: true,
    hasVideoFaceSwapEarlyAccess: false,
    hasWatermark: false,
    hasVerifiedBadge: true,
    hasSupport24x7: true,
    gpuPriority: 'ultra',
  },
  {
    id: 'ultra_pro_max',
    name: 'ULTRA PRO MAX',
    badge: 'FLAGSHIP VIP 👑',
    priceMonthly: PLAN_SETTINGS.ultraProMaxWeeklyPrice,
    periodText: 'week',
    billingCycle: 'weekly',
    currency: '₹',
    creditsPerMonth: PLAN_SETTINGS.ultraProMaxWeeklyCredits,
    generationsCount: 100,
    resolution: '8K Cinematic',
    features: [
      '5,000 Credits / week (All Creations Included)',
      '📹 Live Face-to-Face AI Video Calling UNLOCKED',
      '📞 Unlimited 2-Way Audio Voice Calling UNLOCKED',
      '🎬 Premium Video: Text-to-Video, Image-to-Video, Video-to-Video',
      '🎭 High-Fidelity Neural Face-Swap Video UNLOCKED',
      'AI Friends Chat — Fair Use',
      'Official Verified Blue Tick (ब्लू टिक) Badge',
      '24/7 Dedicated Priority VIP Email Support',
      'Generation usage consumes credits',
    ],
    hasVoiceCall: true,
    hasVideoCall: true,
    hasMediaAttachments: true,
    hasVideoGeneration: true,
    hasVideoFaceSwapEarlyAccess: true,
    hasWatermark: false,
    hasVerifiedBadge: true,
    hasSupport24x7: true,
    gpuPriority: 'dedicated',
  },
];

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack_500',
    name: '500 Top-Up Credits',
    credits: 500,
    generations: 10,
    price: 99,
    currency: '₹',
    description: 'Universal credits for AI Photos, Videos, Face Swap & Voice Calls',
  },
  {
    id: 'pack_1000',
    name: '1,000 Top-Up Credits',
    credits: 1000,
    generations: 20,
    price: 189,
    currency: '₹',
    badge: 'Popular',
    description: 'Universal credits for AI Photos, Videos, Face Swap & Voice Calls',
  },
  {
    id: 'pack_2500',
    name: '2,500 Top-Up Credits',
    credits: 2500,
    generations: 50,
    price: 399,
    currency: '₹',
    description: 'Universal credits for AI Photos, Videos, Face Swap & Voice Calls',
  },
  {
    id: 'pack_5000',
    name: '5,000 Top-Up Credits',
    credits: 5000,
    generations: 100,
    price: 699,
    currency: '₹',
    badge: 'Best Value',
    description: 'Universal credits for AI Photos, Videos, Face Swap & Voice Calls',
  },
];

export function canAccessVoiceCall(userTier: string = 'Free'): boolean {
  const normalized = (userTier || '').toLowerCase();
  return (
    normalized.includes('pro') ||
    normalized.includes('ultra') ||
    normalized.includes('vip') ||
    normalized.includes('owner')
  );
}

export function canAccessVideoCall(userTier: string = 'Free'): boolean {
  const normalized = (userTier || '').toLowerCase();
  // Section 5: Video Call is locked in Ultra Pro, exclusive to Ultra Pro Max / VIP / Owner
  return (
    normalized.includes('ultra pro max') ||
    normalized.includes('ultra-pro-max') ||
    normalized.includes('vip') ||
    normalized.includes('owner')
  );
}

export function canAccessVideoGeneration(userTier: string = 'Free'): boolean {
  const normalized = (userTier || '').toLowerCase();
  return (
    normalized.includes('ultra pro') ||
    normalized.includes('ultra_pro') ||
    normalized.includes('ultra pro max') ||
    normalized.includes('ultra-pro-max') ||
    normalized.includes('vip') ||
    normalized.includes('owner')
  );
}

export function canAccessMediaAttachments(userTier: string = 'Free'): boolean {
  const normalized = (userTier || '').toLowerCase();
  return (
    normalized.includes('trial') ||
    normalized.includes('plus') ||
    normalized.includes('pro') ||
    normalized.includes('ultra') ||
    normalized.includes('vip') ||
    normalized.includes('owner')
  );
}

export function canAccessVideoFaceSwap(userTier: string = 'Free'): boolean {
  const normalized = (userTier || '').toLowerCase();
  // Section 5: Face Swap Video locked in Ultra Pro, exclusive to Ultra Pro Max / VIP / Owner
  return (
    normalized.includes('ultra pro max') ||
    normalized.includes('ultra-pro-max') ||
    normalized.includes('vip') ||
    normalized.includes('owner')
  );
}

export function hasVerifiedBadge(userTier: string = 'Free'): boolean {
  const normalized = (userTier || '').toLowerCase();
  if (!normalized || normalized === 'free' || normalized.includes('free')) return false;
  return (
    normalized.includes('plus') ||
    normalized.includes('pro') ||
    normalized.includes('ultra') ||
    normalized.includes('vip') ||
    normalized.includes('owner')
  );
}

export function hasPrioritySupport(userTier: string = 'Free'): boolean {
  const normalized = (userTier || '').toLowerCase();
  if (!normalized || normalized === 'free' || normalized.includes('free')) return false;
  return (
    normalized.includes('trial') ||
    normalized.includes('plus') ||
    normalized.includes('pro') ||
    normalized.includes('ultra') ||
    normalized.includes('vip') ||
    normalized.includes('owner')
  );
}
