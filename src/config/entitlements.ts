/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Plan-Entitlement Architecture
 * Section 4 & 5 of Master Final Build Instruction
 */

export type PlanId = 
  | 'free'
  | 'trial'
  | 'plus'
  | 'pro'
  | 'ultra_pro'
  | 'ultra_pro_max';

export type ProductFeatureKey =
  | 'chat'
  | 'text_to_image'
  | 'image_to_image'
  | 'text_to_video'
  | 'image_to_video'
  | 'video_to_video'
  | 'face_swap_video'
  | 'audio_call'
  | 'video_call';

export interface PlanEntitlementConfig {
  id: PlanId;
  name: string;
  badge?: string;
  price: number;
  periodText: string;
  billingCycle: 'free' | '48h_trial' | 'weekly';
  creditsGranted: number;
  disclosureNotice?: string;
  featuresSummary: string[];
  entitlements: Record<ProductFeatureKey, boolean>;
  watermark: boolean;
  priorityQueue: 'standard' | 'high' | 'ultra' | 'dedicated';
  popular?: boolean;
}

export const PLAN_ENTITLEMENTS: Record<PlanId, PlanEntitlementConfig> = {
  free: {
    id: 'free',
    name: 'Free Signup',
    price: 0,
    periodText: 'lifetime',
    billingCycle: 'free',
    creditsGranted: 0,
    featuresSummary: [
      'Limited AI Friends Chat',
      '0 Purchased Generation Credits',
      'Standard Processing Queue',
      'Subtle Studio Watermark',
      'Premium Generation Tools Locked',
    ],
    entitlements: {
      chat: true,
      text_to_image: false,
      image_to_image: false,
      text_to_video: false,
      image_to_video: false,
      video_to_video: false,
      face_swap_video: false,
      audio_call: false,
      video_call: false,
    },
    watermark: true,
    priorityQueue: 'standard',
  },
  trial: {
    id: 'trial',
    name: '₹2 Intro Trial',
    badge: '48h Trial Offer 🔥',
    price: 2,
    periodText: '48 hours',
    billingCycle: '48h_trial',
    creditsGranted: 150,
    disclosureNotice:
      'Pay ₹2 today. Your trial lasts 48 hours. After the trial, ₹999/week will be charged automatically until cancelled.',
    featuresSummary: [
      '150 Generation Credits (3 Photos)',
      'Extended AI Friends Chat',
      'Photo Creation & Studio Presets',
      '48 Hours Access Duration',
      'Renews at ₹999/week unless cancelled',
    ],
    entitlements: {
      chat: true,
      text_to_image: true,
      image_to_image: true,
      text_to_video: false,
      image_to_video: false,
      video_to_video: false,
      face_swap_video: false,
      audio_call: false,
      video_call: false,
    },
    watermark: false,
    priorityQueue: 'high',
    popular: true,
  },
  plus: {
    id: 'plus',
    name: 'PLUS',
    badge: 'Creator Essential',
    price: 99,
    periodText: 'week',
    billingCycle: 'weekly',
    creditsGranted: 400,
    featuresSummary: [
      '400 Credits / week (8 Photos)',
      'AI Friends Chat — Fair Use',
      'Text-to-Image Generation',
      'Image-to-Image Studio Editing',
      'Zero Watermark Exports',
    ],
    entitlements: {
      chat: true,
      text_to_image: true,
      image_to_image: true,
      text_to_video: false,
      image_to_video: false,
      video_to_video: false,
      face_swap_video: false,
      audio_call: false,
      video_call: false,
    },
    watermark: false,
    priorityQueue: 'high',
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    badge: 'Audio Voice Plan 🔥',
    price: 199,
    periodText: 'week',
    billingCycle: 'weekly',
    creditsGranted: 1000,
    featuresSummary: [
      '1,000 Credits / week (20 Photos)',
      'AI Friends Chat — Fair Use',
      'Text-to-Image & Image-to-Image',
      '2-Way Audio Voice Calling Access',
      'Verified Blue Tick Profile Badge',
    ],
    entitlements: {
      chat: true,
      text_to_image: true,
      image_to_image: true,
      text_to_video: false,
      image_to_video: false,
      video_to_video: false,
      face_swap_video: false,
      audio_call: true,
      video_call: false,
    },
    watermark: false,
    priorityQueue: 'high',
    popular: true,
  },
  ultra_pro: {
    id: 'ultra_pro',
    name: 'ULTRA PRO',
    badge: 'Video Creator',
    price: 299,
    periodText: 'week',
    billingCycle: 'weekly',
    creditsGranted: 1500,
    featuresSummary: [
      '1,500 Credits / week (30 Photos)',
      'AI Friends Chat — Fair Use',
      'Text-to-Image & Image-to-Image',
      'Text-to-Video & Image-to-Video',
      'Audio Calling Included',
    ],
    entitlements: {
      chat: true,
      text_to_image: true,
      image_to_image: true,
      text_to_video: true,
      image_to_video: true,
      video_to_video: false,
      face_swap_video: false,
      audio_call: true,
      video_call: false,
    },
    watermark: false,
    priorityQueue: 'ultra',
  },
  ultra_pro_max: {
    id: 'ultra_pro_max',
    name: 'ULTRA PRO MAX',
    badge: 'All-In-One Powerhouse 👑',
    price: 999,
    periodText: 'week',
    billingCycle: 'weekly',
    creditsGranted: 5000,
    featuresSummary: [
      '5,000 Credits / week',
      'All Premium AI Tools Unlocked',
      'Premium Video Generation Included',
      'Text-to-Video, Image-to-Video & Video-to-Video',
      'Face-Swap Video Unlocked',
      'Live Face-to-Face Video Calling',
      'Live 2-Way Audio Calling',
      'AI Friends Chat — Fair Use',
      'Generation usage consumes credits',
    ],
    entitlements: {
      chat: true,
      text_to_image: true,
      image_to_image: true,
      text_to_video: true,
      image_to_video: true,
      video_to_video: true,
      face_swap_video: true,
      audio_call: true,
      video_call: true,
    },
    watermark: false,
    priorityQueue: 'dedicated',
  },
};

export interface TopUpPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  badge?: string;
  description: string;
}

export const TOP_UP_PACKS: TopUpPack[] = [
  {
    id: 'topup_500',
    name: '500 Credits Pack',
    credits: 500,
    price: 99,
    description: '10 Standard Photos or 1 AI Video',
  },
  {
    id: 'topup_1000',
    name: '1,000 Credits Pack',
    credits: 1000,
    price: 189,
    badge: 'Popular',
    description: '20 Standard Photos or 2 AI Videos',
  },
  {
    id: 'topup_2500',
    name: '2,500 Credits Pack',
    credits: 2500,
    price: 399,
    description: '50 Standard Photos or 5 AI Videos',
  },
  {
    id: 'topup_5000',
    name: '5,000 Credits Pack',
    credits: 5000,
    price: 699,
    badge: 'Best Value',
    description: '100 Standard Photos or 10 AI Videos',
  },
];

/**
 * Normalizes user membershipTier string to standard PlanId
 */
export function normalizeTierToPlanId(tier?: string): PlanId {
  if (!tier) return 'free';
  const t = tier.toLowerCase();
  if (t.includes('ultra pro max') || t.includes('lifetime') || t.includes('owner') || t.includes('vip')) {
    return 'ultra_pro_max';
  }
  if (t.includes('ultra pro') || t.includes('ultra')) {
    return 'ultra_pro';
  }
  if (t.includes('pro')) {
    return 'pro';
  }
  if (t.includes('plus')) {
    return 'plus';
  }
  if (t.includes('trial')) {
    return 'trial';
  }
  return 'free';
}

/**
 * Checks whether user's plan grants access to a specific product feature
 */
export function checkPlanEntitlement(
  userTier: string | undefined,
  featureKey: ProductFeatureKey
): boolean {
  const planId = normalizeTierToPlanId(userTier);
  const planConfig = PLAN_ENTITLEMENTS[planId];
  if (!planConfig) return false;
  return !!planConfig.entitlements[featureKey];
}

/**
 * Returns human-readable minimum required plan name for a locked feature
 */
export function getRequiredPlanName(featureKey: ProductFeatureKey): string {
  if (featureKey === 'video_call' || featureKey === 'face_swap_video' || featureKey === 'video_to_video') {
    return 'Ultra Pro Max (₹999/week)';
  }
  if (featureKey === 'text_to_video' || featureKey === 'image_to_video') {
    return 'Ultra Pro (₹299/week)';
  }
  if (featureKey === 'audio_call') {
    return 'Pro (₹199/week)';
  }
  return 'Plus (₹99/week)';
}
