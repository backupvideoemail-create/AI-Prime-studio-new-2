/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized AI Cost & Credit Engine Catalog
 * Section 8, 9, 10 of Master Final Build Instruction
 */

export interface CostItem {
  id: string;
  feature: string;
  name: string;
  provider: 'google_gemini' | 'higgsfield' | 'web_speech' | 'custom';
  pricingMethod: 'per_image' | 'per_second' | 'per_minute' | 'per_task';
  baseProviderCostINR: number; // in INR
  baseCredits: number;
  businessMarkup: number; // 0.40 = 40% markup
  resolutionOptions?: {
    resolution: string;
    multiplier: number;
  }[];
  durationOptions?: {
    seconds: number;
    multiplier: number;
  }[];
}

// 40% default business target markup over AI provider usage cost
export const DEFAULT_BUSINESS_MARKUP = 0.40;

// Base planning rule: 50 Credits = 1 standard image generation
export const BASE_CREDITS_PER_IMAGE = 50;

export const COST_CATALOG: Record<string, CostItem> = {
  text_to_image: {
    id: 'text_to_image',
    feature: 'Text-to-Image',
    name: 'Standard AI Photo Generation',
    provider: 'google_gemini',
    pricingMethod: 'per_image',
    baseProviderCostINR: 1.5,
    baseCredits: 50,
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
    resolutionOptions: [
      { resolution: '1080p', multiplier: 1.0 },
      { resolution: '2K QHD', multiplier: 1.5 },
      { resolution: '4K Ultra-HD', multiplier: 2.0 },
    ],
  },
  image_to_image: {
    id: 'image_to_image',
    feature: 'Image-to-Image',
    name: 'Photo Studio Enhancement & Styling',
    provider: 'google_gemini',
    pricingMethod: 'per_image',
    baseProviderCostINR: 1.5,
    baseCredits: 50,
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
    resolutionOptions: [
      { resolution: '1080p', multiplier: 1.0 },
      { resolution: '2K QHD', multiplier: 1.5 },
      { resolution: '4K Ultra-HD', multiplier: 2.0 },
    ],
  },
  text_to_video: {
    id: 'text_to_video',
    feature: 'Text-to-Video',
    name: 'Cinematic AI Video Generation',
    provider: 'higgsfield',
    pricingMethod: 'per_second',
    baseProviderCostINR: 12.0,
    baseCredits: 500, // 5s base
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
    durationOptions: [
      { seconds: 5, multiplier: 1.0 },
      { seconds: 10, multiplier: 2.0 },
    ],
    resolutionOptions: [
      { resolution: '720p', multiplier: 0.8 },
      { resolution: '1080p', multiplier: 1.0 },
      { resolution: '4K', multiplier: 1.8 },
    ],
  },
  image_to_video: {
    id: 'image_to_video',
    feature: 'Image-to-Video',
    name: 'Animate Still Photo to Motion Video',
    provider: 'higgsfield',
    pricingMethod: 'per_second',
    baseProviderCostINR: 14.0,
    baseCredits: 600, // 5s base
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
    durationOptions: [
      { seconds: 5, multiplier: 1.0 },
      { seconds: 10, multiplier: 2.0 },
    ],
    resolutionOptions: [
      { resolution: '720p', multiplier: 0.8 },
      { resolution: '1080p', multiplier: 1.0 },
      { resolution: '4K', multiplier: 1.8 },
    ],
  },
  video_to_video: {
    id: 'video_to_video',
    feature: 'Video-to-Video',
    name: 'Neural Video Re-styling & Transformation',
    provider: 'higgsfield',
    pricingMethod: 'per_second',
    baseProviderCostINR: 18.0,
    baseCredits: 800,
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
    durationOptions: [
      { seconds: 5, multiplier: 1.0 },
      { seconds: 10, multiplier: 2.0 },
    ],
  },
  face_swap_video: {
    id: 'face_swap_video',
    feature: 'Face Swap Video',
    name: 'High-Fidelity Neural Face Swap Video',
    provider: 'higgsfield',
    pricingMethod: 'per_task',
    baseProviderCostINR: 20.0,
    baseCredits: 750,
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
    durationOptions: [
      { seconds: 5, multiplier: 1.0 },
      { seconds: 15, multiplier: 1.8 },
      { seconds: 30, multiplier: 3.0 },
    ],
  },
  audio_call: {
    id: 'audio_call',
    feature: 'Audio Calling',
    name: 'Live 2-Way Spoken Voice Call',
    provider: 'google_gemini',
    pricingMethod: 'per_minute',
    baseProviderCostINR: 0.8,
    baseCredits: 20, // 20 credits per min
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
  },
  video_call: {
    id: 'video_call',
    feature: 'Video Calling',
    name: 'Live Neural Face-to-Face Video Call',
    provider: 'google_gemini',
    pricingMethod: 'per_minute',
    baseProviderCostINR: 2.5,
    baseCredits: 50, // 50 credits per min
    businessMarkup: DEFAULT_BUSINESS_MARKUP,
  },
};

/**
 * Calculates authoritative video credits based strictly on duration × provider cost + 40% markup
 * Server & Client Synchronized Calculation
 */
export function calculateAuthoritativeVideoCredits(
  mode: string,
  rawDurationSeconds: number = 5
) {
  const min = 3;
  const max = 8;
  const durationSeconds = Math.max(min, Math.min(max, Math.round(rawDurationSeconds || 5)));
  const costPerSecMap: Record<string, number> = {
    text_to_video: 12.0,
    image_to_video: 14.0,
    video_to_video: 18.0,
    face_swap_video: 20.0,
  };
  const baseCostPerSec = costPerSecMap[mode] || 14.0;
  const providerCostINR = durationSeconds * baseCostPerSec;
  const marginINR = providerCostINR * DEFAULT_BUSINESS_MARKUP; // 40% markup
  const totalCostINR = providerCostINR + marginINR;
  const requiredCredits = Math.ceil(totalCostINR * 10); // 10 credits per INR

  return {
    durationSeconds,
    minDuration: min,
    maxDuration: max,
    baseCostPerSec,
    providerCostINR: Math.round(providerCostINR * 100) / 100,
    marginINR: Math.round(marginINR * 100) / 100,
    totalCostINR: Math.round(totalCostINR * 100) / 100,
    requiredCredits,
  };
}

/**
 * Calculates required credits with configured business markup
 */
export function calculateEstimatedCredits(
  featureKey: string,
  options?: {
    durationSeconds?: number;
    resolution?: string;
  }
): number {
  if (
    featureKey === 'text_to_video' ||
    featureKey === 'image_to_video' ||
    featureKey === 'video_to_video' ||
    featureKey === 'face_swap_video'
  ) {
    return calculateAuthoritativeVideoCredits(featureKey, options?.durationSeconds || 5).requiredCredits;
  }

  const item = COST_CATALOG[featureKey];
  if (!item) return BASE_CREDITS_PER_IMAGE;

  let multiplier = 1.0;

  if (options?.durationSeconds && item.durationOptions) {
    const match = item.durationOptions.find((d) => d.seconds === options.durationSeconds);
    if (match) multiplier *= match.multiplier;
  }

  if (options?.resolution && item.resolutionOptions) {
    const match = item.resolutionOptions.find((r) => r.resolution === options.resolution);
    if (match) multiplier *= match.multiplier;
  }

  const calculated = Math.ceil(item.baseCredits * multiplier);
  return calculated;
}
