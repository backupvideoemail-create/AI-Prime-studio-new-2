/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified Modular AI Services Barrel
 * Part 1 Foundation: Decoupled Provider-Agnostic Interfaces
 * Allows switching upstream models and providers without touching UI components.
 */

// 1. Image Generation & Enhancement
export { generateImage } from './imageService';
export type { GenerateImageParams, GenerateImageResult } from './imageService';

// 2. Chat & Character Conversation
export { generateChat } from './chatService';
export type { GenerateChatParams, GenerateChatResult } from './chatService';

// 3. Video Generation & Neural Face Swap
export {
  generateTextToVideo,
  generateImageToVideo,
  generateVideoToVideo,
  generateFaceSwapVideo,
} from './videoService';
export type { VideoGenerationParams, VideoGenerationResult } from './videoService';

// 4. Live Audio & Video Calling Sessions
export {
  createAudioSession,
  createVideoSession,
  generateSpeech,
  getIndianFemaleVoice,
} from './liveService';
export type {
  AudioSessionParams,
  VideoSessionParams,
  LiveCallSessionResult,
  VoiceOptions,
} from './liveService';
