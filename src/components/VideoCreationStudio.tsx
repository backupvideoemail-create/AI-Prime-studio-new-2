import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Video,
  Lock,
  ArrowRight,
  ShieldCheck,
  Film,
  AlertCircle,
  RefreshCw,
  Upload,
  User,
  CheckCircle2,
  Layers,
  Wand2,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { storageService } from '../services/storageService';
import { checkPlanEntitlement, getRequiredPlanName, ProductFeatureKey } from '../config/entitlements';
import { calculateAuthoritativeVideoCredits } from '../config/costCatalog';
import {
  generateTextToVideo,
  generateImageToVideo,
  generateVideoToVideo,
  generateFaceSwapVideo,
  VideoGenerationResult,
} from '../services/ai/videoService';
import { ScreenRoute } from '../types';
import { templateLibraryService, DynamicTemplate } from '../services/templateLibraryService';

// Sample demonstration assets for visual 3-box transformation
import indianPersonFace from '../assets/images/aarav_before_1790227490151.jpg';
import targetVideoFrame from '../assets/images/aarav_royal_after_1790227528118.jpg';
import swappedFinalFrame from '../assets/images/aarav_penthouse_after_1790227608456.jpg';

interface VideoCreationStudioProps {
  onRouteChange: (route: ScreenRoute) => void;
  userCredits: number;
  userTier: string;
  onOpenAuthModal?: () => void;
}

export const VideoCreationStudio: React.FC<VideoCreationStudioProps> = ({
  onRouteChange,
  userCredits,
  userTier,
  onOpenAuthModal,
}) => {
  const { language } = useLanguage();

  // Face-swap is default and #1 prominent as requested by user
  const [videoMode, setVideoMode] = useState<
    'face_swap_video' | 'image_to_video' | 'text_to_video' | 'video_to_video'
  >('face_swap_video');

  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<number>(5);
  const [resolution, setResolution] = useState<'1080p' | '4k'>('1080p');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceVideo, setSourceVideo] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [resultState, setResultState] = useState<VideoGenerationResult | null>(null);

  // Dynamic Video Template Library state
  const [videoTemplates, setVideoTemplates] = useState<DynamicTemplate[]>(() =>
    templateLibraryService.getVideoTemplates()
  );
  const [activePreviewVideo, setActivePreviewVideo] = useState<string | null>(null);
  const [isInteractiveDemoPlaying, setIsInteractiveDemoPlaying] = useState(false);

  useEffect(() => {
    templateLibraryService.loadTemplates().then(({ video }) => {
      if (video && video.length > 0) setVideoTemplates(video);
    });
  }, []);

  // Entitlement Check for current selected feature
  const isAllowed = checkPlanEntitlement(userTier, videoMode as ProductFeatureKey);
  const requiredPlanName = getRequiredPlanName(videoMode as ProductFeatureKey);

  // Server-authoritative calculation: duration × provider cost + 40% markup = required credits
  const costDetails = calculateAuthoritativeVideoCredits(videoMode, duration);
  const estimatedCost = costDetails.requiredCredits;

  const handleSelectTemplate = (tmpl: DynamicTemplate) => {
    if (tmpl.category === 'face_swap') {
      setVideoMode('face_swap_video');
    } else if (tmpl.category === 'image_to_video') {
      setVideoMode('image_to_video');
    } else if (tmpl.category === 'video_to_video') {
      setVideoMode('video_to_video');
    } else {
      setVideoMode('text_to_video');
    }
    setPrompt(tmpl.prompt);
    setResultState(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'face' | 'source') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (target === 'face') setFaceImage(dataUrl);
      else setSourceImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    const userProfile = storageService.getUserProfile();
    const isAuthed = userProfile.isLoggedIn || !!userProfile.email || !!userProfile.phone;
    if (!isAuthed) {
      if (onOpenAuthModal) onOpenAuthModal();
      else onRouteChange('pricing');
      return;
    }

    if (!isAllowed) {
      onRouteChange('pricing');
      return;
    }

    if (userCredits < estimatedCost) {
      onRouteChange('pricing');
      return;
    }

    // Step 1: Reserve credits
    const reservation = storageService.reserveCredits(
      estimatedCost,
      `${videoMode} generation (${duration}s ${resolution})`
    );

    if (!reservation.success || !reservation.reservationId) {
      onRouteChange('pricing');
      return;
    }

    setIsGenerating(true);
    setResultState(null);

    let result: VideoGenerationResult;

    if (videoMode === 'text_to_video') {
      result = await generateTextToVideo({
        prompt: prompt || 'Cinematic slow-motion shot, golden hour lighting, 4K HDR',
        durationSeconds: duration,
        resolution,
      });
    } else if (videoMode === 'image_to_video') {
      result = await generateImageToVideo({
        sourceImageUrl: sourceImage || undefined,
        prompt: prompt || 'Natural gentle breeze, soft smile and realistic cinematic motion',
        durationSeconds: duration,
        resolution,
      });
    } else if (videoMode === 'video_to_video') {
      result = await generateVideoToVideo({
        sourceVideoUrl: sourceVideo || undefined,
        prompt: prompt || 'Anime cyberpunk aesthetic, neon lights and dynamic motion',
        durationSeconds: duration,
        resolution,
      });
    } else {
      result = await generateFaceSwapVideo({
        sourceVideoUrl:
          sourceVideo ||
          'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-lights-39878-large.mp4',
        faceImageUrl: faceImage || sourceImage || '',
        durationSeconds: duration,
      });
    }

    setIsGenerating(false);
    setResultState(result);

    // Step 2: Finalize or Refund credits
    if (result.success && result.videoUrl) {
      storageService.finalizeCreditDeduction(reservation.reservationId, videoMode);
    } else {
      // Safely refund reserved credits
      storageService.refundReservedCredits(
        reservation.reservationId,
        estimatedCost,
        result.message || 'Generation provider pending configuration'
      );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================
          1. VISUAL 3-BOX INTERACTIVE FACE-SWAP SHOWCASE
          Indian Person Photo + Target Bollywood Video -> Swapped 4K Video
          ======================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1c1209] via-[#140e0b] to-[#07080a] border-2 border-[#d4af37]/60 shadow-[0_0_30px_rgba(212,175,55,0.25)] space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[10px] font-bold text-[#fceda7] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#d4af37]" />
              <span>{language === 'hi' ? 'वायरल न्यूरल फेस-स्वैप तकनीक' : '100% Neural Face-Swap Video'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
              {language === 'hi'
                ? 'दूसरे की वीडियो में अपना चेहरा लगाएं — 1-क्लिक फेस स्वैप'
                : 'Put Your Face Into Any Video — 1-Click Neural Face Swap'}
            </h3>
            <p className="text-xs text-gray-300">
              {language === 'hi'
                ? 'अपनी एक साधारण फोटो अपलोड करें और बॉलीवुड मूवी, सुपरकार या म्यूजिक वीडियो में खुद का चेहरा लाइव देखें।'
                : 'Upload your single facial photo and watch yourself star in viral movie trailers, royal wedding entries, and music videos.'}
            </p>
          </div>

          <span className="self-start sm:self-center px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
            🔥 Most Popular
          </span>
        </div>

        {/* 3-Box Interactive Face-Swap Visual Transformation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          {/* Box 1: Your Photo / Face */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black/50 border border-white/10 group">
            <img
              src={indianPersonFace}
              alt="Step 1: Your Face Photo"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">Step 1: आपकी फोटो</span>
              <span className="text-xs font-bold text-white leading-tight">साधारण इंडियन चेहरा (Your Face)</span>
            </div>
          </div>

          {/* Box 2: Target Movie / Actor Video */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black/50 border border-white/10 group">
            <img
              src={targetVideoFrame}
              alt="Step 2: Target Bollywood Video"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Step 2: टारगेट वीडियो</span>
              <span className="text-xs font-bold text-white leading-tight">बॉलीवुड हीरो सीन (Target Clip)</span>
            </div>
          </div>

          {/* Box 3: Final Face-Swapped Output with Play Button */}
          <div
            onClick={() => setIsInteractiveDemoPlaying(!isInteractiveDemoPlaying)}
            className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black/50 border-2 border-[#d4af37] shadow-lg shadow-[#d4af37]/30 group cursor-pointer"
          >
            {!isInteractiveDemoPlaying ? (
              <>
                <img
                  src={swappedFinalFrame}
                  alt="Step 3: Face Swapped 4K Video"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient text-[#07080a] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 ml-0.5 fill-current" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[10px] uppercase font-bold text-[#fceda7] tracking-wider">Step 3: फाइनल 4K वीडियो</span>
                  <span className="text-xs font-bold text-white leading-tight">100% सेम चेहरा वीडियो में लाइव!</span>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-lights-39878-large.mp4"
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[9px] text-[#fceda7] font-bold">
                  Demo Video
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. DYNAMIC VIDEO TEMPLATE LIBRARY GALLERY (Face Swap & Image to Video)
          ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#d4af37]" />
            <h4 className="text-xs sm:text-sm font-bold text-white font-cinzel">
              {language === 'hi' ? 'रेडी-टू-यूज़ वीडियो टेम्पलेट्स (1-क्लिक अप्लाई)' : 'Ready-to-Use Video Presets'}
            </h4>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {videoTemplates.length} Templates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {videoTemplates.map((vt) => (
            <div
              key={vt.id}
              onClick={() => handleSelectTemplate(vt)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#0d1017] border border-white/10 hover:border-[#d4af37] cursor-pointer shadow-md transition-all hover:scale-[1.03] flex flex-col justify-between"
            >
              <img
                src={vt.coverPath || vt.previewPath}
                alt={vt.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

              {/* Top Badge & Play Button */}
              <div className="relative z-10 p-2 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-bold text-[#fceda7] truncate max-w-[70%]">
                  {vt.badge || '🎬 4K Video'}
                </span>
                {vt.videoPath && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePreviewVideo(vt.videoPath || null);
                    }}
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center shrink-0 transition-colors"
                    title="Play Preview"
                  >
                    <Play className="w-3 h-3 ml-0.5 fill-current" />
                  </button>
                )}
              </div>

              {/* Bottom Info */}
              <div className="relative z-10 p-2 space-y-1">
                <h5 className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                  {vt.name}
                </h5>
                <div className="flex items-center justify-between text-[10px] text-gray-300">
                  <span className="text-[#d4af37] font-semibold">{vt.creditCost} Credits</span>
                  <span className="text-[9px] text-gray-400 uppercase font-mono">Use →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Studio Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
        <button
          onClick={() => {
            setVideoMode('face_swap_video');
            setResultState(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            videoMode === 'face_swap_video'
              ? 'bg-gold-gradient text-[#07080a] shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Face-Swap Video</span>
        </button>

        <button
          onClick={() => {
            setVideoMode('image_to_video');
            setResultState(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            videoMode === 'image_to_video'
              ? 'bg-gold-gradient text-[#07080a] shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Image-to-Video</span>
        </button>

        <button
          onClick={() => {
            setVideoMode('text_to_video');
            setResultState(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            videoMode === 'text_to_video'
              ? 'bg-gold-gradient text-[#07080a] shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Text-to-Video</span>
        </button>

        <button
          onClick={() => {
            setVideoMode('video_to_video');
            setResultState(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            videoMode === 'video_to_video'
              ? 'bg-gold-gradient text-[#07080a] shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video Restyling</span>
        </button>
      </div>

      {/* Feature Configuration & Inputs */}
      <div className="p-5 rounded-3xl bg-[#0c0e14] border border-white/[0.08] shadow-xl space-y-4">
        {/* Face Swap Upload inputs */}
        {videoMode === 'face_swap_video' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-dashed border-[#d4af37]/40 space-y-2 text-center">
              <span className="text-[10px] font-bold text-[#fceda7] uppercase tracking-wider block">
                १. आपका चेहरा (Face Image)
              </span>
              {faceImage ? (
                <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden border border-[#d4af37]">
                  <img src={faceImage} alt="Uploaded face" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFaceImage(null)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer py-3">
                  <Upload className="w-5 h-5 text-[#d4af37] mx-auto mb-1" />
                  <span className="text-xs text-gray-300 font-semibold block">फोटो अपलोड करें</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'face')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-dashed border-white/20 space-y-2 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                २. टारगेट वीडियो (Target Clip)
              </span>
              <p className="text-xs text-gray-400 py-3">
                डिफ़ॉल्ट बॉलीवुड / VIP मॉडल वीडियो क्लिप सक्रिय है
              </p>
            </div>
          </div>
        )}

        {/* Image to Video Upload inputs */}
        {videoMode === 'image_to_video' && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-[#d4af37]/40 space-y-2 text-center">
            <span className="text-[10px] font-bold text-[#fceda7] uppercase tracking-wider block">
              फोटो से सिनेमैटिक मूवी वीडियो (Upload Source Image)
            </span>
            {sourceImage ? (
              <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden border border-[#d4af37]">
                <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSourceImage(null)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white text-[10px]"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer py-3">
                <Upload className="w-5 h-5 text-[#d4af37] mx-auto mb-1" />
                <span className="text-xs text-gray-300 font-semibold block">अपनी फ़ोटो चुनें</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'source')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>सिनेमैटिक डायरेक्शन (Direction & Camera Prompt)</span>
            <span className="text-[10px] text-gray-500 font-mono">Optional</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Ultra 4K cinematic camera push-in, natural facial emotion, golden hour anamorphic flare..."
            className="w-full h-20 p-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Duration & Resolution */}
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-gray-300">अवधि चयन (Video Duration):</span>
              <span className="text-[10px] text-[#d4af37] font-mono">
                Min: {costDetails.minDuration}s • Max: {costDetails.maxDuration}s (Server Enforced)
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[3, 4, 5, 6, 7, 8].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    duration === d
                      ? 'bg-gradient-to-r from-[#ffe894] via-[#d4af37] to-[#aa7c11] text-[#07080a] font-extrabold shadow-md scale-[1.02]'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {d}s
                  {d === 3 && <span className="block text-[8px] font-normal leading-none opacity-80">Min</span>}
                  {d === 5 && <span className="block text-[8px] font-normal leading-none opacity-80">Std</span>}
                  {d === 8 && <span className="block text-[8px] font-normal leading-none opacity-80">Max</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">क्वालिटी (Quality Resolution)</label>
            <div className="grid grid-cols-2 gap-2">
              {(['1080p', '4k'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={`py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    resolution === r
                      ? 'bg-[#d4af37] text-black font-extrabold shadow-sm'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {r === '4k' ? '4K Ultra-HD' : '1080p Full HD'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Server-Authoritative Cost Calculation Box: Duration × Actual Cost + 40% Margin = Required Credits */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1c1209] to-[#0d1017] border border-[#d4af37]/40 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>लागत गणना ({costDetails.durationSeconds}s @ ₹{costDetails.baseCostPerSec}/s):</span>
            </span>
            <span className="font-extrabold text-[#fceda7] font-mono text-sm sm:text-base">
              {costDetails.requiredCredits} Credits
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.08] text-[10px]">
            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-gray-400 text-[9px] uppercase">Base Provider Cost</span>
              <span className="font-semibold text-white font-mono">₹{costDetails.providerCostINR}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-emerald-400 text-[9px] uppercase font-semibold">Business Markup</span>
              <span className="font-semibold text-emerald-300 font-mono">+40% (₹{costDetails.marginINR})</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-[#d4af37] text-[9px] uppercase">Total Cost INR</span>
              <span className="font-bold text-[#fceda7] font-mono">₹{costDetails.totalCostINR}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-cyan-300 text-[9px] uppercase">Required Credits</span>
              <span className="font-extrabold text-cyan-200 font-mono">{costDetails.requiredCredits}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isAllowed ? (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200 font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{requiredPlanName} प्लान आवश्यक है</span>
            </div>
            <button
              onClick={() => onRouteChange('pricing')}
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md active:scale-95"
            >
              VIP प्लान में अपग्रेड करें →
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-gold-gradient hover:brightness-110 text-[#07080a] font-bold text-xs sm:text-sm shadow-xl shadow-[#d4af37]/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#07080a]" />
                <span>4K वीडियो जनरेट हो रहा है...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-[#07080a] fill-current" />
                <span>4K वीडियो जनरेट करें ({estimatedCost} Credits)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Result Display */}
      {resultState && (
        <div className="p-5 rounded-3xl bg-[#0c0e14] border border-[#d4af37]/40 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{resultState.success ? 'वीडियो सफलतापूर्वक तैयार!' : 'Status'}</span>
            </div>
          </div>

          {resultState.videoUrl && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-lg">
              <video src={resultState.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
            </div>
          )}

          {resultState.message && (
            <p className="text-xs text-gray-300 leading-relaxed">{resultState.message}</p>
          )}
        </div>
      )}

      {/* Full-Screen Video Preview Modal */}
      {activePreviewVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActivePreviewVideo(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePreviewVideo(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white text-xs z-10"
            >
              ✕
            </button>
            <video src={activePreviewVideo} controls autoPlay loop className="w-full h-auto max-h-[75vh]" />
          </div>
        </div>
      )}
    </div>
  );
};
