import React, { useState, useRef, useEffect } from 'react';
import { ScreenRoute, TemplateItem } from '../types';
import { useLanguage } from '../i18n';
import { TEMPLATES } from '../data/templates';
import { templateLibraryService, DynamicTemplate } from '../services/templateLibraryService';
import { generateImage } from '../services/ai/imageService';
import { storageService } from '../services/storageService';
import { BeforeAfterSlider } from '../components/photo-studio/BeforeAfterSlider';
import { VideoCreationStudio } from '../components/VideoCreationStudio';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Layers,
  FileCheck,
  Clock,
  ShieldCheck,
  ExternalLink,
  Wand2,
  Video,
} from 'lucide-react';

/**
 * Client-side canvas studio lighting & cinematic color grade
 * Enhances the user's ACTUAL photo preserving 100% facial identity
 */
async function applyStudioPhotoEnhancement(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      // Draw original user photo
      ctx.drawImage(img, 0, 0, w, h);

      // 1. Studio Keylight & Rim Vignette
      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.42,
        w * 0.18,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.72
      );
      vignette.addColorStop(0, 'rgba(255, 240, 195, 0.18)');
      vignette.addColorStop(0.5, 'rgba(212, 175, 55, 0.06)');
      vignette.addColorStop(1, 'rgba(4, 6, 10, 0.48)');

      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // 2. Warm Golden Rim Tone & Skin Glow
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(245, 195, 120, 0.24)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // 3. Crisp Studio Contrast
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(15, 15, 25, 0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // 4. Studio Watermark
      ctx.save();
      const fontSize = Math.max(14, Math.floor(w * 0.026));
      ctx.font = `600 ${fontSize}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillText('AI Club Studio 4K', w - 18, h - 18);
      ctx.restore();

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

interface CreateScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  preselectedTemplateId?: string | null;
  onOpenPromoModal?: () => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({
  onRouteChange,
  preselectedTemplateId,
  onOpenPromoModal,
}) => {
  const { t, language } = useLanguage();

  // Top Studio Mode: 'photo' | 'video'
  const [activeStudioTab, setActiveStudioTab] = useState<'photo' | 'video'>('photo');

  // Workflow states: 'upload' | 'options' | 'preview' | 'generating' | 'result'
  const [step, setStep] = useState<'upload' | 'options' | 'preview' | 'generating' | 'result'>('upload');

  // Image Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Helper to map dynamic library templates to TemplateItem
  const toTemplateItem = (dt: DynamicTemplate): TemplateItem => ({
    id: dt.id,
    name: dt.name,
    category: (dt.category as any) || 'royal',
    description: dt.description,
    badge: dt.badge,
    beforeImage: dt.beforePath || dt.previewPath,
    afterImage: dt.afterPath || dt.previewPath,
    promptSuggestion: dt.prompt,
    personName: 'Model',
    likesCount: dt.likesCount || 24000,
    likesDisplay: `${((dt.likesCount || 24000) / 1000).toFixed(1)}K`,
    gender: dt.gender,
    subCategory: dt.subCategory,
    tags: dt.tags,
  });

  const [dynamicPhotoTemplates, setDynamicPhotoTemplates] = useState<TemplateItem[]>(() => {
    const lib = templateLibraryService.getPhotoTemplates();
    return lib && lib.length > 0 ? lib.map(toTemplateItem) : TEMPLATES;
  });

  // Editing option: 'template' | 'custom'
  const [editOption, setEditOption] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(() => {
    const lib = templateLibraryService.getPhotoTemplates();
    return lib && lib.length > 0 ? toTemplateItem(lib[0]) : TEMPLATES[0];
  });
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Generation percentage & wait time state
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState<number>(15);
  const [progressStatusText, setProgressStatusText] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [isCreditsDepleted, setIsCreditsDepleted] = useState<boolean>(false);
  const [isEnhancingLocally, setIsEnhancingLocally] = useState<boolean>(false);
  const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] = useState<boolean>(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<any>(null);

  // Load dynamic templates from /template-library/photo/
  useEffect(() => {
    templateLibraryService.loadTemplates().then(({ photo }) => {
      if (photo && photo.length > 0) {
        const mapped = photo.map(toTemplateItem);
        setDynamicPhotoTemplates(mapped);
        if (preselectedTemplateId) {
          const found = mapped.find((t) => t.id === preselectedTemplateId);
          if (found) {
            setSelectedTemplate(found);
            setEditOption('template');
          }
        }
      }
    });
  }, [preselectedTemplateId]);

  // Local studio enhancement handler (runs on user's actual photo)
  const handleEnhanceLocally = async () => {
    if (!uploadedImage) return;

    const userProfile = storageService.getUserProfile();
    const isVip =
      userProfile.membershipTier?.includes('VIP') ||
      userProfile.membershipTier?.includes('Ultra') ||
      userProfile.membershipTier?.includes('Owner');
    const currentCredits = storageService.getCredits();

    if (!isVip && currentCredits < 50) {
      setIsInsufficientCreditsModalOpen(true);
      return;
    }

    setIsEnhancingLocally(true);
    try {
      const enhanced = await applyStudioPhotoEnhancement(uploadedImage);
      setResultImage(enhanced);
      setStep('result');
      await storageService.deductCredit(50);
      storageService.saveCreation({
        id: `local_${Date.now()}`,
        imageUrl: enhanced,
        promptOrTemplate: `${selectedTemplate.name} (4K Studio Lighting)`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsEnhancingLocally(false);
    }
  };

  // Initialize preselected template if navigated from templates gallery
  useEffect(() => {
    if (preselectedTemplateId) {
      const found = dynamicPhotoTemplates.find((t) => t.id === preselectedTemplateId);
      if (found) {
        setSelectedTemplate(found);
        setEditOption('template');
      }
    }
  }, [preselectedTemplateId, dynamicPhotoTemplates]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // File validation
  const validateAndProcessFile = (file: File) => {
    setUploadError(null);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validMimes.includes(file.type)) {
      setUploadError(
        language === 'hi'
          ? 'अमान्य फॉर्मेट। कृपया केवल JPG, PNG या WEBP फोटो चुनें।'
          : 'Invalid format. Please upload JPG, PNG, or WEBP images only.'
      );
      return;
    }

    // 12MB size limit
    if (file.size > 12 * 1024 * 1024) {
      setUploadError(
        language === 'hi'
          ? 'फोटो बहुत बड़ी है। अधिकतम 12MB की फोटो मान्य है।'
          : 'File is too large. Maximum supported photo size is 12MB.'
      );
      return;
    }

    setMimeType(file.type);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setStep('options');
    };
    reader.onerror = () => {
      setUploadError(
        language === 'hi'
          ? 'फोटो लोड करने में समस्या आई। कृपया दूसरी फोटो चुनें।'
          : 'Failed to read photo file. Please try another image.'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Sample quick suggestions
  const quickSuggestions = [
    language === 'hi' ? 'मुझे गोवा बीच (Goa Beach) पर खड़ा कर दो, सूर्यास्त और समुद्र की लहरों के साथ' : 'Put me on Goa Beach at sunset with crashing waves and tropical vacation shirt',
    language === 'hi' ? 'ब्लैक लक्जरी सूट, गोल्ड स्टूडियो लाइटिंग और रिच बिलियनेयर लुक' : 'Black luxury tailored suit, warm gold rim lighting, billionaire executive aesthetic',
    language === 'hi' ? 'रॉयल पैलेस में शादी की शेरवानी और सुनहरी लाइटिंग' : 'Regal royal palace courtyard with golden hour lighting',
    language === 'hi' ? 'हाई-राइज पेंटहाउस बालकनी और रात का शहर' : 'Luxury penthouse terrace overlooking skyscraper night skyline',
    language === 'hi' ? 'मुंबई मरीन ड्राइव पर विंटेज लेदर जैकेट, बाइक और सनसेट' : 'Marine Drive promenade with vintage leather biker jacket at sunset',
    language === 'hi' ? 'पेरिस का कैफ़े, ट्रेंच कोट और कॉफ़ी टेबल' : 'Cozy Parisian street bistro with warm coffee and autumn coat',
    language === 'hi' ? 'क्रिकेट स्टेडियम में मैचडे जर्सी और फ्लडलाइट्स' : 'Cricket stadium hero with matchday jersey under bright floodlights',
  ];

  // Execute Generation with continuous live percentage & countdown timer
  const handleStartGeneration = async () => {
    // Check if user is VIP / Ultra (Unlimited credits) or has at least 50 credits
    const userProfile = storageService.getUserProfile();
    const isVip =
      userProfile.membershipTier?.includes('VIP') ||
      userProfile.membershipTier?.includes('Ultra') ||
      userProfile.membershipTier?.includes('Owner');
    const currentCredits = storageService.getCredits();

    if (!isVip && currentCredits < 50) {
      setIsInsufficientCreditsModalOpen(true);
      return;
    }

    setStep('generating');
    setGenError(null);
    setProgressPercent(2);
    setEstimatedSeconds(14);
    setProgressStatusText(
      language === 'hi'
        ? 'चेहरे के फीचर्स और त्वचा की पहचान हो रही है...'
        : 'Scanning facial landmarks & facial contours...'
    );

    const startTime = Date.now();
    const targetDurationMs = 15000; // estimated 15 seconds

    // Interval to increment progress percentage realistically
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const linearRatio = elapsed / targetDurationMs;

      // Realistic non-linear progress curve that slows down near 95% while waiting for server response
      let currentVal = Math.min(
        95,
        Math.floor(linearRatio * 90 + Math.sin(linearRatio * Math.PI) * 5)
      );

      setProgressPercent((prev) => Math.max(prev, Math.min(95, currentVal)));

      const remainingSec = Math.max(1, Math.ceil((targetDurationMs - elapsed) / 1000));
      setEstimatedSeconds(remainingSec);

      if (currentVal < 20) {
        setProgressStatusText(
          language === 'hi'
            ? '🔍 चेहरे की संरचना और असली पहचान सुरक्षित की जा रही है...'
            : '🔍 Locking authentic facial identity & facial contours...'
        );
      } else if (currentVal < 45) {
        setProgressStatusText(
          language === 'hi'
            ? '✨ सामान्य बैकग्राउंड को हटाकर नया माहौल तैयार किया जा रहा है...'
            : '✨ Removing background & composing realistic high-definition scene...'
        );
      } else if (currentVal < 70) {
        setProgressStatusText(
          language === 'hi'
            ? '🎨 4K सिनेमैटिक स्टूडियो लाइटिंग और नए कपड़े जोड़े जा रहे हैं...'
            : '🎨 Applying 4K cinematic studio rim lighting & wardrobe styling...'
        );
      } else if (currentVal < 92) {
        setProgressStatusText(
          language === 'hi'
            ? '💎 त्वचा की बनावट व हाई-रेज़ोल्यूशन डिटेल्स की फिनिशिंग...'
            : '💎 Refining skin textures & rendering ultra-HD depth of field...'
        );
      } else {
        setProgressStatusText(
          language === 'hi'
            ? '⚡ मास्टरपीस लगभग तैयार है...'
            : '⚡ Finalizing your AI Club studio portrait...'
        );
      }
    }, 180);

    const promptText = editOption === 'custom' ? customPrompt : selectedTemplate.promptSuggestion;
    const templateName = editOption === 'template' ? selectedTemplate.name : undefined;

    const result = await generateImage({
      prompt: promptText,
      templateName,
      imageBase64: uploadedImage || undefined,
      mimeType,
      userId: userProfile.id,
    });

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (result.success && result.imageUrl) {
      // Smoothly advance to 100%
      setProgressPercent(100);
      setEstimatedSeconds(0);
      setProgressStatusText(
        language === 'hi' ? '✅ फोटो तैयार हो गई!' : '✅ Masterpiece Ready!'
      );

      await storageService.deductCredit(50);

      setTimeout(() => {
        setResultImage(result.imageUrl!);
        setStep('result');
        // Save creation in history
        storageService.saveCreation({
          id: `gen_${Date.now()}`,
          imageUrl: result.imageUrl!,
          promptOrTemplate: editOption === 'template' ? selectedTemplate.name : customPrompt,
          timestamp: new Date().toISOString(),
        });
      }, 400);
    } else if (result.code === 'INSUFFICIENT_CREDITS') {
      setIsInsufficientCreditsModalOpen(true);
      setStep('options');
    } else if (
      result.code === 'CREDITS_DEPLETED' ||
      result.code === 'QUOTA_EXHAUSTED' ||
      result.error?.includes('depleted') ||
      result.error?.includes('prepayment') ||
      result.error?.includes('quota') ||
      result.error?.includes('402') ||
      result.error?.includes('429')
    ) {
      setIsCreditsDepleted(true);
      setGenError(
        language === 'hi'
          ? 'Google AI Studio के प्रीपेमेंट क्रेडिट समाप्त हो गए हैं ($0 Balance)। AI मॉडल आपकी असली फोटो को बिना एक्टिव बैलेंस के प्रोसेस नहीं कर सका।'
          : 'Google AI Studio prepayment credits are depleted ($0 balance). The AI model cannot process your photo without active balance.'
      );
      setStep('preview');
    } else {
      setIsCreditsDepleted(false);
      setGenError(
        result.error ||
          (language === 'hi'
            ? 'फोटो एडिट करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Photo generation encountered a temporary delay. Please retry.')
      );
      setStep('preview');
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `ai-club-portrait-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share && resultImage) {
      try {
        await navigator.share({
          title: 'AI Club Studio Portrait',
          text: 'Check out my studio transformation created with AI Club!',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!');
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResultImage(null);
    setGenError(null);
    setProgressPercent(0);
    setStep('upload');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn pb-16">
      {/* Studio Mode Switcher: AI Photo Studio vs AI Video & Face Swap Studio */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-[#0c0e14] border border-white/[0.08] inline-flex">
          <button
            onClick={() => setActiveStudioTab('photo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStudioTab === 'photo'
                ? 'bg-gold-gradient text-[#07080a] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>AI Photo Studio</span>
          </button>
          <button
            onClick={() => setActiveStudioTab('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStudioTab === 'video'
                ? 'bg-gold-gradient text-[#07080a] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>AI Video & Motion Studio</span>
          </button>
        </div>
      </div>

      {/* RENDER VIDEO CREATION STUDIO IF TAB IS VIDEO */}
      {activeStudioTab === 'video' ? (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1712] border border-[#d4af37]/30 text-xs font-semibold text-[#fceda7]">
              <Video className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Cinematic AI Video Generation</span>
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              {language === 'hi' ? 'एआई वीडियो व फेस-स्वैप स्टूडियो' : 'AI Video & Neural Face Swap Studio'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              {language === 'hi'
                ? 'टेक्स्ट-टू-वीडियो, इमेज एनिमेशन और अल्ट्रा-एचडी वीडियो फेस-स्वैप — सीधे आपके सब्सक्रिप्शन प्लान से।'
                : 'Text-to-Video, Motion Animation & Face Swap Video — powered strictly by your subscription entitlement.'}
            </p>
          </div>

          <VideoCreationStudio
            onRouteChange={onRouteChange}
            userCredits={storageService.getCredits()}
            userTier={storageService.getUserProfile().membershipTier}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1712] border border-[#d4af37]/30 text-xs font-semibold text-[#fceda7]">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>AI Club Photo Studio</span>
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              {language === 'hi' ? 'असली फोटो एडिटिंग व बैकग्राउंड चेंज' : 'Realistic Portrait Enhancement & Studio Makeover'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              {language === 'hi'
                ? 'चेहरा बिल्कुल वही रहेगा — सिर्फ बैकग्राउंड, लाइटिंग और स्टाइलिंग 4K स्टूडियो क्वालिटी में बदल जाएगी।'
                : 'Exact facial identity preserved — background, lighting, and attire transformed into 4K studio perfection.'}
            </p>
          </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-gray-400">
        <span className={step === 'upload' ? 'text-[#fceda7] font-bold' : ''}>
          1. {language === 'hi' ? 'अपलोड' : 'Upload'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className={step === 'options' ? 'text-[#fceda7] font-bold' : ''}>
          2. {language === 'hi' ? 'स्टाइल या निर्देश' : 'Template or Prompt'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className={step === 'preview' || step === 'generating' ? 'text-[#fceda7] font-bold' : ''}>
          3. {language === 'hi' ? 'प्रोसेस' : 'Process'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className={step === 'result' ? 'text-[#fceda7] font-bold' : ''}>
          4. {language === 'hi' ? 'रिजल्ट' : 'Result'}
        </span>
      </div>

      {/* STEP 1: PHOTO UPLOAD */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37]/60 rounded-3xl p-8 sm:p-12 text-center bg-[#0a0c11]/80 hover:bg-[#0c0e15] transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1a1713] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                {language === 'hi' ? 'अपनी असली फोटो अपलोड करें' : 'Upload your photo / selfie'}
              </p>
              <p className="text-xs text-gray-400">
                {language === 'hi'
                  ? 'चेहरा साफ़ दिखना चाहिए। चेहरा बिल्कुल सेम रहेगा।'
                  : 'Ensure your face is clearly visible. Facial identity remains 100% authentic.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-gray-200 flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{language === 'hi' ? 'गैलरी से चुनें' : 'Choose from Gallery'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-gray-200 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{language === 'hi' ? 'कैमरा खोलें' : 'Take Photo'}</span>
              </button>
            </div>
          </div>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Instant Demo Portrait Test */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-center">
            <p className="text-xs text-gray-400">
              {language === 'hi'
                ? 'अभी तुरंत टेस्ट करने के लिए हमारे मॉडल की असली फोटो से ट्राय करें:'
                : 'Want to try instantly? Test with our verified authentic model photo:'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const sampleImg = dynamicPhotoTemplates[0]?.beforeImage || TEMPLATES[0].beforeImage;
                  setUploadedImage(sampleImg);
                  setMimeType('image/jpeg');
                  setFileName('aarav-portrait.jpg');
                  setStep('options');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gold-gradient/10 hover:bg-gold-gradient/20 border border-[#d4af37]/30 text-xs text-[#fceda7] font-medium"
              >
                {language === 'hi' ? 'आकषर्क मॉडल फोटो लोड करें (Aarav)' : 'Load Male Model (Aarav)'}
              </button>

              <button
                onClick={() => {
                  const sampleImg = dynamicPhotoTemplates[1]?.beforeImage || TEMPLATES[1].beforeImage;
                  setUploadedImage(sampleImg);
                  setMimeType('image/jpeg');
                  setFileName('aditi-portrait.jpg');
                  setStep('options');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gold-gradient/10 hover:bg-gold-gradient/20 border border-[#d4af37]/30 text-xs text-[#fceda7] font-medium"
              >
                {language === 'hi' ? 'आकषर्क मॉडल फोटो लोड करें (Aditi)' : 'Load Female Model (Aditi)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: EDITING OPTIONS */}
      {step === 'options' && uploadedImage && (
        <div className="space-y-6">
          {/* Uploaded photo thumbnail preview */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <img
                src={uploadedImage}
                alt="Uploaded source"
                className="w-14 h-14 rounded-xl object-cover border border-white/10"
              />
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'hi' ? 'फोटो तैयार है' : 'Photo Ready'}</span>
                </div>
                <div className="text-[11px] text-gray-400 truncate max-w-[180px] sm:max-w-xs">
                  {fileName || 'Portrait uploaded'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep('upload')}
              className="text-xs text-[#d4af37] hover:underline font-medium"
            >
              {language === 'hi' ? 'फोटो बदलें' : 'Change Photo'}
            </button>
          </div>

          {/* Option A (Template) vs Option B (Custom Prompt) Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <button
              onClick={() => setEditOption('template')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                editOption === 'template'
                  ? 'bg-gold-gradient text-[#07080a] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'विकल्प A: टेम्पलेट चुनें' : 'Option A: Pick Template'}</span>
            </button>
            <button
              onClick={() => setEditOption('custom')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                editOption === 'custom'
                  ? 'bg-gold-gradient text-[#07080a] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'विकल्प B: मनपसंद लिखें' : 'Option B: Custom Description'}</span>
            </button>
          </div>

          {/* OPTION A: CHOOSE TEMPLATE */}
          {editOption === 'template' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">
                  {language === 'hi' ? 'मनपसंद स्टाइल टेम्पलेट चुनें:' : 'Select your desired studio style:'}
                </span>
                <span className="text-[11px] text-[#fceda7] font-medium">
                  {selectedTemplate.name}
                </span>
              </div>

              {/* Template thumbnail cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                {dynamicPhotoTemplates.map((tmpl) => {
                  const isSelected = selectedTemplate.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border transition-all ${
                        isSelected
                          ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 shadow-lg scale-[1.02]'
                          : 'border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <img
                        src={tmpl.afterImage}
                        alt={tmpl.name}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                        <div className="text-[11px] font-bold text-white truncate">
                          {tmpl.name}
                        </div>
                        <div className="text-[9px] text-[#fceda7] uppercase font-semibold">
                          {tmpl.badge || tmpl.category}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold-gradient flex items-center justify-center text-[#07080a]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OPTION B: CUSTOM AI EDIT */}
          {editOption === 'custom' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {language === 'hi'
                    ? 'आप अपनी फोटो में क्या बदलाव या बैकग्राउंड चाहते हैं, यहाँ लिखें:'
                    : 'Describe what background, outfit, or environment you want:'}
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'उदा: पीछे का बैकग्राउंड हटाकर लग्जरी पेंटहाउस बालकनी कर दो और मुझे ब्लैक टक्सीडो पहना दो, 4K स्टूडियो लाइटिंग के साथ...'
                      : 'e.g. Replace background with a luxury skyline terrace at sunset, dressed in a sleek Italian suit with warm cinematic lighting...'
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-gray-400">
                  {language === 'hi' ? 'त्वरित सुझाव (क्लिक करें):' : 'Quick Suggestions (tap to use):'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomPrompt(sug)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[11px] text-gray-300 hover:text-white text-left transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Proceed to Preview */}
          <div className="pt-2">
            <button
              onClick={() => setStep('preview')}
              disabled={editOption === 'custom' && !customPrompt.trim()}
              className="w-full py-3.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-sm shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{language === 'hi' ? 'पूर्वावलोकन और शुरू करें' : 'Preview & Confirm'}</span>
              <ArrowRight className="w-4 h-4 text-[#07080a]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & CONFIRM */}
      {step === 'preview' && uploadedImage && (
        <div className="space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] space-y-4">
            <h3 className="font-cinzel text-lg font-bold text-white text-center">
              {language === 'hi' ? 'फोटो रूपांतरण पूर्वावलोकन' : 'Transformation Preview'}
            </h3>

            {/* Side-by-side comparison preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-center">
                <span className="text-[11px] text-gray-400 font-medium">
                  {language === 'hi' ? 'आपकी असली फोटो' : 'Your Original Photo'}
                </span>
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  <img
                    src={uploadedImage}
                    alt="Source"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <span className="text-[11px] text-[#fceda7] font-semibold">
                  {language === 'hi' ? 'चुना हुआ स्टाइल' : 'Target Aesthetic'}
                </span>
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-black/40 border border-[#d4af37]/30 relative">
                  {editOption === 'template' ? (
                    <img
                      src={selectedTemplate.afterImage}
                      alt={selectedTemplate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#1b1712] to-[#07080a]">
                      <Sparkles className="w-8 h-8 text-[#d4af37] mb-2" />
                      <p className="text-[10px] text-gray-300 line-clamp-4 font-medium">
                        "{customPrompt}"
                      </p>
                    </div>
                  )}
                  <div className="absolute bottom-2 inset-x-2 py-0.5 rounded bg-black/75 text-[9px] text-[#fceda7] font-semibold truncate px-1">
                    {editOption === 'template' ? selectedTemplate.name : 'Custom AI Prompt'}
                  </div>
                </div>
              </div>
            </div>

            {/* Facial Identity Guarantee Notice */}
            <div className="p-3 rounded-xl bg-[#14120f] border border-[#d4af37]/25 text-xs text-gray-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>
                {language === 'hi'
                  ? 'चेहरा १००% समान रहेगा: हमारी एआई तकनीक आपके मूल चेहरे की संरचना और त्वचा को सुरक्षित रखती है, केवल बैकग्राउंड व लाइटिंग को अपग्रेड करती है।'
                  : '100% Face Consistency: Your exact facial features and identity are preserved while backgrounds and lighting are upgraded.'}
              </span>
            </div>

            {isCreditsDepleted && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1309] via-[#24170c] to-[#120c06] border border-[#d4af37]/50 shadow-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white font-cinzel">
                      {language === 'hi'
                        ? 'Google AI प्रीपेमेंट क्रेडिट समाप्त ($0 Balance)'
                        : 'Google AI Prepayment Credits Depleted ($0 Balance)'}
                    </h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {language === 'hi'
                        ? 'Google Gemini इमेज मॉडल द्वारा आपके असली चेहरे को 100% सुरक्षित रखकर बैकग्राउंड व कपड़े बदलने के लिए Google AI Studio में एक्टिव बैलेंस चाहिए।'
                        : 'Google Gemini Image models require active prepayment credits on your AI Studio account to synthesize custom backgrounds and clothing while keeping your face identical.'}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleEnhanceLocally}
                    disabled={isEnhancingLocally}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#07080a]" />
                    <span>
                      {isEnhancingLocally
                        ? language === 'hi' ? 'संवर्धित किया जा रहा है...' : 'Enhancing...'
                        : language === 'hi' ? 'मेरी असली फोटो पर 4K लाइटिंग लगाएं' : 'Enhance My Photo with 4K Lighting'}
                    </span>
                  </button>

                  {onOpenPromoModal && (
                    <button
                      type="button"
                      onClick={onOpenPromoModal}
                      className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-[#d4af37]/40 text-[#fceda7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{language === 'hi' ? '🎟️ प्रोमो कोड लगाएं' : '🎟️ Promo Code'}</span>
                    </button>
                  )}

                  <a
                    href="https://ai.studio/projects"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{language === 'hi' ? 'AI Studio पर क्रेडिट जोड़ें' : 'Top-Up at ai.studio'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                  </a>
                </div>

                {/* Direct support helpline */}
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-gray-300">
                  <span>24/7 ऑफिशियल हेल्पडेस्क: <strong>ईमेल सपोर्ट</strong></span>
                  <button
                    type="button"
                    onClick={() => onRouteChange('support')}
                    className="text-[#fceda7] underline font-medium"
                  >
                    सपोर्ट से संपर्क करें →
                  </button>
                </div>
              </div>
            )}

            {!isCreditsDepleted && genError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{genError}</span>
              </div>
            )}
          </div>

          {/* Credits cost indicator */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#141720] border border-[#d4af37]/30 text-xs">
            <span className="text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Generation Cost: <strong className="text-[#fceda7]">50 Credits</strong></span>
            </span>
            <span className="text-gray-400">
              Balance: <strong className="text-white">{storageService.getCredits()} Credits</strong>
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('options')}
              className="py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-gray-300"
            >
              {language === 'hi' ? 'विकल्प बदलें' : 'Modify Options'}
            </button>
            <button
              onClick={handleStartGeneration}
              className="flex-1 py-3.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-sm shadow-xl shadow-[#d4af37]/25 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Sparkles className="w-4 h-4 text-[#07080a]" />
              <span>{language === 'hi' ? 'एडिटिंग शुरू करें' : 'Start Studio Generation'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATION IN PROGRESS (LIVE PERCENTAGE & WAIT TIME COUNTDOWN) */}
      {step === 'generating' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0a0c10] border border-[#d4af37]/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Radial / Percentage Badge */}
          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            {/* Spinning decorative aura */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#d4af37]/30 animate-spin" />
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#ffe894]/20 via-[#d4af37]/30 to-[#8c6708]/20 p-1 flex items-center justify-center shadow-[0_0_35px_rgba(212,175,55,0.3)]">
              <div className="w-full h-full bg-[#0a0c10] rounded-full flex flex-col items-center justify-center">
                <span className="font-cinzel text-3xl font-extrabold text-gold-gradient tracking-tight">
                  {progressPercent}%
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">
                  AI Process
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-md mx-auto">
            <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ffe894] via-[#d4af37] to-[#aa7c11] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Estimated Wait Time Counter */}
            <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-1 font-medium">
              <div className="flex items-center gap-1 text-[#fceda7]">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>
                  {language === 'hi' ? 'अनुमानित समय:' : 'Estimated wait:'}{' '}
                  <strong className="text-white">~{estimatedSeconds}s</strong>
                </span>
              </div>
              <span className="text-gray-400">
                {progressPercent < 100
                  ? language === 'hi'
                    ? 'कृपया इंतज़ार करें'
                    : 'In Progress...'
                  : language === 'hi'
                  ? 'पूर्ण!'
                  : 'Ready!'}
              </span>
            </div>
          </div>

          {/* Detailed step progress message */}
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="font-cinzel text-lg font-bold text-white">
              {language === 'hi' ? 'फोटो एडिटिंग प्रोसेस में है' : 'Editing in Progress'}
            </h3>
            <p className="text-xs sm:text-sm text-[#fceda7] font-semibold tracking-wide min-h-[40px] flex items-center justify-center">
              {progressStatusText}
            </p>
            <p className="text-[11px] text-gray-500">
              {language === 'hi'
                ? 'AI Club आपके चेहरे के फीचर्स सुरक्षित रखते हुए हाई-डेफिनिशन बैकग्राउंड व लाइटिंग रेंडर कर रहा है।'
                : 'AI Club is rendering high-fidelity backgrounds & studio highlights while keeping facial identity identical.'}
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: RESULT SCREEN (WITH BEFORE/AFTER SLIDER & TRANSPARENCY) */}
      {step === 'result' && resultImage && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 sm:p-6 rounded-3xl bg-[#0a0c10] border border-[#d4af37]/40 shadow-[0_0_40px_rgba(212,175,55,0.15)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white">
                  {language === 'hi' ? 'रूपांतरण परिणाम (सटीक चेहरा)' : 'Transformation Masterpiece'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {language === 'hi'
                    ? 'स्लाइडर को ड्रैग करके असली फोटो और नए बैकग्राउंड की तुलना करें'
                    : 'Drag slider below to compare your original photo vs AI studio enhancement'}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1b1712] border border-[#d4af37]/30 text-[10px] text-[#fceda7] font-semibold shrink-0">
                AI Club 4K
              </span>
            </div>

            {/* Interactive Before & After Slider */}
            {uploadedImage ? (
              <BeforeAfterSlider
                beforeImage={uploadedImage}
                afterImage={resultImage}
                personName={language === 'hi' ? 'चेहरा सुरक्षित (100% Identical)' : 'Authentic Face Preserved'}
                beforeLabel={language === 'hi' ? 'पहले (Original)' : 'Original'}
                afterLabel="After AI Club"
                aspectRatio="aspect-[4/5]"
              />
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl">
                <img
                  src={resultImage}
                  alt="Transformed AI Studio Portrait"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={handleDownload}
                className="py-3 px-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/20 active:scale-95 transition-transform"
              >
                <Download className="w-3.5 h-3.5 text-[#07080a]" />
                <span>{language === 'hi' ? 'डाउनलोड करें' : 'Download HD'}</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5 border border-white/[0.08]"
              >
                <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{language === 'hi' ? 'शेयर करें' : 'Share'}</span>
              </button>

              <button
                onClick={() => setStep('options')}
                className="py-3 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5 border border-white/[0.08]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                <span>{language === 'hi' ? 'फिर से एडिट करें' : 'Edit Again'}</span>
              </button>

              <button
                onClick={handleReset}
                className="py-3 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5 border border-white/[0.08]"
              >
                <span>{language === 'hi' ? 'नई फोटो बनाएं' : 'New Photo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* INSUFFICIENT CREDITS MODAL */}
      {isInsufficientCreditsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-sm bg-[#0d1017] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffe894] via-[#d4af37] to-[#8c6708] flex items-center justify-center mx-auto text-[#07080a] shadow-lg shadow-[#d4af37]/25">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-white">
                {language === 'hi' ? 'क्रेडिट्स अपर्याप्त हैं' : 'Insufficient Credits'}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {language === 'hi'
                  ? 'प्रत्येक 4K फोटो जनरेशन के लिए 50 क्रेडिट्स आवश्यक हैं। आपका वर्तमान बैलेंस कम है।'
                  : '50 Credits are required for a 4K studio transformation. Your balance is insufficient.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-gray-300 flex justify-between">
              <span>Current Balance:</span>
              <span className="font-bold text-[#fceda7]">{storageService.getCredits()} Credits</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsInsufficientCreditsModalOpen(false);
                  onRouteChange('pricing');
                }}
                className="w-full py-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg shadow-[#d4af37]/25 flex items-center justify-center gap-1.5"
              >
                <span>Get Credits / Upgrade Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onOpenPromoModal && (
                <button
                  onClick={() => {
                    setIsInsufficientCreditsModalOpen(false);
                    onOpenPromoModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-[#fceda7] transition-colors"
                >
                  Redeem Promo / VIP Code
                </button>
              )}

              <button
                onClick={() => setIsInsufficientCreditsModalOpen(false)}
                className="text-xs text-gray-400 hover:text-white pt-1 block mx-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
