/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Feature Flags
 * Section 35 of Master Final Build Instruction
 * Note: These flags are configuration controls, NOT a reason to show "Coming Soon".
 * All planned features are visible in the UI with plan-based entitlement.
 */

export const FEATURE_FLAGS = {
  PHOTO_STUDIO_ENABLED: true,
  AI_CHARACTER_ENABLED: true,
  TEXT_TO_VIDEO_ENABLED: true,
  IMAGE_TO_VIDEO_ENABLED: true,
  VIDEO_TO_VIDEO_ENABLED: true,
  FACE_SWAP_ENABLED: true,
  AUDIO_CALL_ENABLED: true,
  VIDEO_CALL_ENABLED: true,
  PAYMENTS_ENABLED: false, // True once live Razorpay API credentials are configured in environment
  TOP_UP_ENABLED: true,
  PROMO_CODES_ENABLED: true,
  INTERNAL_TEST_ACCESS_ENABLED: true, // Secure owner test access with server-side validation
  DASHBOARD_ENABLED: true,
  ADMIN_FEATURES_ENABLED: false,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
