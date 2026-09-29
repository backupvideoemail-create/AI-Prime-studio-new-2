import React, { useState, useEffect, useRef } from 'react';
import { ScreenRoute } from '../types';
import {
  Camera,
  Users,
  MessageCircle,
  Crown,
  Phone,
  Film,
  Wand2,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// Exact generated & curated high-resolution visual assets matching master reference image
import classyBoyImg from '../assets/images/classy_boy_studio_1790349633678.jpg';
import heroGlamourWomanImg from '../assets/images/hero_glamour_woman_1790349658022.jpg';
import glamourGirlImg from '../assets/images/glamour_girl_chat_1790349675295.jpg';
import goldenPalaceImg from '../assets/images/golden_palace_night_1790349693531.jpg';
import cyberWarriorImg from '../assets/images/vikram_cyber_after_1790252198290.jpg';
import neonSupercarImg from '../assets/images/neon_supercar_night_1790349710444.jpg';

// Alternate slide images for carousel rotation
import slideManImg from '../assets/images/aarav_royal_after_1790227528118.jpg';
import slideOldMoneyImg from '../assets/images/meera_oldmoney_after_1790252340767.jpg';
import aaravBefore from '../assets/images/aarav_before_1790227490151.jpg';

interface HomeScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  onSelectCharacter: (charId: string) => void;
  onSelectTemplate: (templateId: string) => void;
}

interface HeroSlideData {
  id: number;
  titlePart1: string;
  titlePart2: string;
  titlePart3: string;
  subtitle: string;
  image: string;
  primaryCtaText: string;
  primaryCtaRoute: ScreenRoute;
  secondaryCtaText: string;
  secondaryCtaRoute: ScreenRoute;
}

const HERO_SLIDES: HeroSlideData[] = [
  {
    id: 1,
    titlePart1: 'Create',
    titlePart2: 'Without',
    titlePart3: 'Limits ✦',
    subtitle: 'AI Photo Studio | AI Girls Chat\nTemplates | Premium Tools',
    image: heroGlamourWomanImg,
    primaryCtaText: 'Create With AI',
    primaryCtaRoute: 'create',
    secondaryCtaText: 'Explore AI Girls',
    secondaryCtaRoute: 'characters',
  },
  {
    id: 2,
    titlePart1: 'Classy',
    titlePart2: 'Men Style',
    titlePart3: 'Studio ✦',
    subtitle: 'High-Fashion & Luxury Business Looks\nCinematic 4K Preservation',
    image: classyBoyImg,
    primaryCtaText: 'Create With AI',
    primaryCtaRoute: 'create',
    secondaryCtaText: 'Explore AI Girls',
    secondaryCtaRoute: 'characters',
  },
  {
    id: 3,
    titlePart1: 'AI Girls',
    titlePart2: 'Companions',
    titlePart3: 'Chat ✦',
    subtitle: 'Realistic Conversations • Voice & Video\nAlways Online For You',
    image: glamourGirlImg,
    primaryCtaText: 'Start Chatting',
    primaryCtaRoute: 'characters',
    secondaryCtaText: 'Explore AI Girls',
    secondaryCtaRoute: 'characters',
  },
  {
    id: 4,
    titlePart1: 'Royal',
    titlePart2: 'Heritage',
    titlePart3: 'Portraits ✦',
    subtitle: 'Traditional & Modern Grand Transformations\nStudio Lighting Guaranteed',
    image: slideManImg,
    primaryCtaText: 'Create With AI',
    primaryCtaRoute: 'create',
    secondaryCtaText: 'Explore AI Girls',
    secondaryCtaRoute: 'characters',
  },
  {
    id: 5,
    titlePart1: 'Connect',
    titlePart2: 'Create',
    titlePart3: 'Inspire ✦',
    subtitle: 'AI Photo Studio • AI Girls Chat\nNext-Gen AI Social Entertainment',
    image: slideOldMoneyImg,
    primaryCtaText: 'Create With AI',
    primaryCtaRoute: 'create',
    secondaryCtaText: 'Explore AI Girls',
    secondaryCtaRoute: 'characters',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onRouteChange,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // 5-second auto rotation
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    const threshold = 40;
    if (diff > threshold) {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (diff < -threshold) {
      setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
    touchStartXRef.current = null;
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 sm:pb-8 animate-fadeIn max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4">
      {/* ========================================================
          1. HERO CAROUSEL: "Create Without Limits ✦"
          Exact match to master visual reference with glowing blue border,
          cursive script, vibrant party bokeh, and dual CTA buttons.
          ======================================================== */}
      <section
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#090b10] border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.35)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative min-h-[350px] sm:min-h-[390px] md:min-h-[430px] flex items-center">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background image: Right-aligned so subject and party lights shine brilliantly */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.titlePart1}
                    className="w-full h-full object-cover object-right-top transition-transform duration-1000 scale-[1.02]"
                  />
                  {/* Subtle dark gradient overlay on left to guarantee text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06080c] via-[#06080c]/80 via-40% to-transparent w-[85%] sm:w-[70%]" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06080c] to-transparent" />
                </div>

                {/* Right side floating cursive neon script: "Create Imagine Chat Connect ♡" */}
                <div className="absolute top-10 right-4 sm:right-8 z-10 pointer-events-none select-none text-right">
                  <div className="font-script text-[#f472b6] text-sm sm:text-base md:text-lg leading-tight drop-shadow-[0_0_12px_rgba(244,114,182,0.9)] -rotate-6">
                    <div>Create</div>
                    <div className="pr-1">Imagine</div>
                    <div className="pr-2">Chat</div>
                    <div className="pr-1">Connect ♡</div>
                  </div>
                </div>

                {/* Left Text & Controls Zone (25–35% area, concise, no clutter) */}
                <div className="relative z-10 p-5 sm:p-7 md:p-8 max-w-[280px] sm:max-w-sm flex flex-col justify-center h-full space-y-2.5">
                  <div>
                    <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                      <span className="text-white block">{slide.titlePart1}</span>
                      <span className="block bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                        {slide.titlePart2}
                      </span>
                      <span className="block bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                        {slide.titlePart3}
                      </span>
                    </h1>

                    <p className="text-[11px] sm:text-xs text-gray-300 whitespace-pre-line leading-relaxed mt-1.5 font-medium">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Dual CTA buttons: Glowing gradient pill & Glass button */}
                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      onClick={() => onRouteChange(slide.primaryCtaRoute)}
                      className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#ffe066] via-[#f78ca0] to-[#38bdf8] hover:brightness-110 text-[#07080a] font-extrabold text-xs sm:text-sm shadow-lg shadow-[#f78ca0]/30 flex items-center justify-center gap-1.5 transition-transform active:scale-95 group cursor-pointer"
                    >
                      {slide.id === 3 ? (
                        <MessageCircle className="w-3.5 h-3.5 text-[#07080a]" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-[#07080a]" />
                      )}
                      <span>{slide.primaryCtaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#07080a] group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => onRouteChange(slide.secondaryCtaRoute)}
                      className="w-full py-2 px-4 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/30 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      <Users className="w-3.5 h-3.5 text-gray-200" />
                      <span>{slide.secondaryCtaText}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Bar (Dots with active elongated glowing cyan pill + 5s auto pause toggle) */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'w-6 h-1.5 bg-gradient-to-r from-cyan-300 to-blue-500 shadow-[0_0_10px_#38bdf8]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume auto rotation' : 'Pause auto rotation'}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 hover:border-white/40 text-[10px] text-gray-200 hover:text-white transition-colors cursor-pointer"
          >
            <span>5s auto</span>
            {isPaused ? <Play className="w-2.5 h-2.5 text-cyan-300" /> : <Pause className="w-2.5 h-2.5 text-gray-300" />}
          </button>
        </div>
      </section>

      {/* ========================================================
          2. TWO PRIMARY FEATURE CARDS (AI PHOTO STUDIO + AI GIRLS CHAT)
          CARD #1: AI Photo Studio with CLASSY RICH INDIAN BOY & transparent blending
          CARD #2: AI Girls Chat with GLAMOROUS INDIAN GIRL & transparent blending
          Exact match to user requirement and master reference image.
          ======================================================== */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* PRIMARY CARD #1: AI Photo Studio (Rich Classy Boy in luxury blazer with 4K Studio Quality badge) */}
        <div
          onClick={() => onRouteChange('create')}
          className="group relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#061625] via-[#040f1a] to-[#02070e] border-2 border-cyan-400 hover:border-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.35)] p-3 sm:p-4 min-h-[175px] sm:min-h-[195px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          {/* Background: Classy Boy seamlessly blended on the right with transparent gradient vignette */}
          <div className="absolute top-0 right-0 bottom-0 w-[62%] sm:w-[60%] overflow-hidden pointer-events-none">
            <img
              src={classyBoyImg}
              alt="Classy Rich Indian Boy - AI Photo Studio"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            {/* Seamless gradient transparency blending into left dark cyan zone */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#061625] via-[#061625]/85 via-25% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02070e] via-transparent to-transparent" />
          </div>

          {/* Left Foreground Content */}
          <div className="space-y-1.5 relative z-10 max-w-[65%]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(6,182,212,0.6)] shrink-0">
              <Camera className="w-4 h-4 text-white" />
            </div>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white font-cinzel leading-tight">
                AI Photo Studio
              </h2>
              <p className="text-[9px] sm:text-[10px] text-cyan-200 mt-0.5 leading-tight">
                Transform your photos into cinematic art
              </p>
            </div>

            {/* 4K Studio Quality Golden Laurel Badge */}
            <div className="inline-flex items-center gap-1 text-[#fceda7] text-[9px] sm:text-[10px] font-bold tracking-tight">
              <span>🌿</span>
              <span>4K Studio Quality</span>
              <span>🌿</span>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="relative z-10 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRouteChange('create');
              }}
              className="py-1 px-2.5 sm:px-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400 text-cyan-100 font-bold text-[10px] sm:text-xs shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center gap-1 transition-all active:scale-95"
            >
              <span>Create Now</span>
              <ArrowRight className="w-3 h-3 text-cyan-300" />
            </button>
          </div>
        </div>

        {/* PRIMARY CARD #2: AI Girls Chat (Glamorous Indian Girl with Online status) */}
        <div
          onClick={() => onRouteChange('characters')}
          className="group relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#22071c] via-[#140413] to-[#07010b] border-2 border-pink-500 hover:border-pink-400 shadow-[0_0_24px_rgba(236,72,153,0.35)] p-3 sm:p-4 min-h-[175px] sm:min-h-[195px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          {/* Background: Glamorous Girl seamlessly blended on the right with transparent gradient vignette */}
          <div className="absolute top-0 right-0 bottom-0 w-[62%] sm:w-[60%] overflow-hidden pointer-events-none">
            <img
              src={glamourGirlImg}
              alt="Glamorous Indian Companion - AI Girls Chat"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            {/* Seamless gradient transparency blending into left dark magenta zone */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#22071c] via-[#22071c]/85 via-25% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07010b] via-transparent to-transparent" />
          </div>

          {/* Left Foreground Content */}
          <div className="space-y-1.5 relative z-10 max-w-[65%]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(236,72,153,0.6)] shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white font-cinzel leading-tight">
                AI Girls Chat
              </h2>
              <p className="text-[9px] sm:text-[10px] text-pink-200 mt-0.5 leading-tight">
                Chat, Call & more with AI Girls
              </p>
            </div>

            {/* Online Now Indicator */}
            <div className="inline-flex items-center gap-1.5 text-emerald-300 text-[9px] sm:text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span>Online Now</span>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="relative z-10 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRouteChange('characters');
              }}
              className="py-1 px-2.5 sm:px-3 rounded-full bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400 text-pink-100 font-bold text-[10px] sm:text-xs shadow-[0_0_10px_rgba(236,72,153,0.4)] flex items-center gap-1 transition-all active:scale-95"
            >
              <span>Start Chatting</span>
              <ArrowRight className="w-3 h-3 text-pink-300" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          SPOTLIGHT: 4K AI VIDEO STUDIO & NEURAL FACE-SWAP (PHOTO TO VIDEO)
          High-Visibility Front Placement with 3-Box Transformation
          ======================================================== */}
      <section
        onClick={() => {
          sessionStorage.setItem('target_studio_tab', 'video');
          onRouteChange('create');
        }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1c1109] via-[#140c07] to-[#080503] border-2 border-[#d4af37] shadow-[0_0_28px_rgba(212,175,55,0.35)] p-3.5 sm:p-5 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] space-y-3"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient text-[#07080a] flex items-center justify-center font-bold shadow-lg shadow-[#d4af37]/30">
              <Film className="w-5 h-5 text-[#07080a]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-white leading-tight">
                  AI Video Studio & Face-Swap
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                  🔥 Viral 4K
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#fceda7] font-medium mt-0.5">
                Photo-to-Video Face Swap • Image to Cinematic 4K Movie Trailer
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              sessionStorage.setItem('target_studio_tab', 'video');
              onRouteChange('create');
            }}
            className="self-start sm:self-center py-1.5 px-3 rounded-full bg-gold-gradient hover:brightness-110 text-[#07080a] font-bold text-[11px] sm:text-xs shadow-md shadow-[#d4af37]/20 flex items-center gap-1.5"
          >
            <span>Try Face-Swap Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#07080a]" />
          </button>
        </div>

        {/* 3-Box Transformation Visual Preview */}
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-black/60 border border-white/10">
            <img src={aaravBefore} alt="Local Indian Photo" className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-center">
              <span className="text-[9px] font-bold text-cyan-300 block leading-tight">१. आपकी फ़ोटो</span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-black/60 border border-white/10">
            <img src={slideManImg} alt="Target Bollywood Video" className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-center">
              <span className="text-[9px] font-bold text-amber-300 block leading-tight">२. टारगेट वीडियो</span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-black/60 border-2 border-[#d4af37] shadow-md shadow-[#d4af37]/30 group">
            <img src={slideOldMoneyImg} alt="Final Swapped Video" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-gold-gradient text-[#07080a] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/85 p-1 text-center">
              <span className="text-[9px] font-bold text-[#fceda7] block leading-tight">३. लाइव 4K वीडियो!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECONDARY FEATURES (2x2 Grid with image backgrounds)
          Top-Left: Templates (Illuminated Heritage Palace)
          Top-Right: Premium Tools (Cyber Warrior)
          Bottom-Left: Voice & Video Call (Audio Waveform + Glamour Girl)
          Bottom-Right: Video Generation (Neon Supercar + Play icon)
          ======================================================== */}
      <section className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {/* Secondary 1: Templates (Golden illuminated Jaipur palace) */}
        <div
          onClick={() => onRouteChange('templates')}
          className="group relative rounded-2xl bg-[#0e0717] border border-purple-500/70 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-none">Templates</h3>
              <p className="text-[9px] text-purple-200 mt-0.5">Trending styles</p>
            </div>
          </div>

          <div className="mt-2 relative h-14 rounded-lg overflow-hidden border border-purple-500/30">
            <img
              src={goldenPalaceImg}
              alt="Templates - Golden Palace"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>

        {/* Secondary 2: Premium Tools (Cyber Warrior) */}
        <div
          onClick={() => onRouteChange('pricing')}
          className="group relative rounded-2xl bg-[#061411] border border-teal-500/70 hover:border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.25)] p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-7 h-7 rounded-lg bg-teal-600/30 border border-teal-400/50 flex items-center justify-center text-teal-300 shrink-0">
              <Crown className="w-3.5 h-3.5 text-[#fceda7]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-none">Premium Tools</h3>
              <p className="text-[9px] text-teal-200 mt-0.5">Pro & Ultra Features</p>
            </div>
          </div>

          <div className="mt-2 relative h-14 rounded-lg overflow-hidden border border-teal-500/30">
            <img
              src={cyberWarriorImg}
              alt="Premium Tools - Cyber Warrior"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>

        {/* Secondary 3: Voice & Video Call (Audio Waveform + Indian Woman) */}
        <div
          onClick={() => onRouteChange('characters')}
          className="group relative rounded-2xl bg-[#171006] border border-amber-500/70 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-7 h-7 rounded-lg bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-none">Voice & Video Call</h3>
              <p className="text-[9px] text-amber-200 mt-0.5">Realistic AI calls</p>
            </div>
          </div>

          <div className="mt-2 relative h-14 rounded-lg overflow-hidden border border-amber-500/30 bg-black/40 flex items-center justify-between px-2">
            {/* Audio Waveform Graphic */}
            <div className="flex items-center gap-0.5 h-6">
              {[40, 75, 55, 90, 60, 85, 45, 100, 70, 80, 50, 65].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#d4af37] rounded-full"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d4af37]/60 shadow-sm shrink-0">
              <img
                src={glamourGirlImg}
                alt="Voice Companion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Secondary 4: Video Generation (Neon Supercar + Play Circle) */}
        <div
          onClick={() => onRouteChange('create')}
          className="group relative rounded-2xl bg-[#06101f] border border-blue-500/70 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)] p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300 shrink-0">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-none">Video Generation</h3>
              <p className="text-[9px] text-blue-200 mt-0.5">Cinematic AI videos</p>
            </div>
          </div>

          <div className="mt-2 relative h-14 rounded-lg overflow-hidden border border-blue-500/30">
            <img
              src={neonSupercarImg}
              alt="Video Generation - Neon Supercar"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm border border-white/50 flex items-center justify-center">
                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. PRO & ULTRA PRO MAX PREMIUM BANNERS
          Exact reproduction of horizontal banners with circular avatars & gold chevrons.
          ======================================================== */}
      <section className="space-y-2">
        {/* PRO BANNER: Voice & Video Call */}
        <div
          onClick={() => onRouteChange('pricing')}
          className="group relative rounded-2xl bg-gradient-to-r from-[#1c150b] via-[#100e16] to-[#0a0c12] border border-[#d4af37] hover:border-[#ffe894] p-3 flex items-center justify-between gap-3 cursor-pointer shadow-lg shadow-[#d4af37]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/60 flex items-center justify-center text-[#fceda7] shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.4)]">
              <Phone className="w-5 h-5 text-[#d4af37]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.2 rounded-full bg-[#d4af37] text-[#07080a] text-[9px] font-extrabold uppercase tracking-wider">
                  PRO
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Voice & Video Call
                </h3>
              </div>
              <p className="text-[10px] text-gray-300 mt-0.5 leading-snug">
                Unlock with Pro Plan • Speak naturally in Hindi & Hinglish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#d4af37] shadow-sm">
              <img
                src={glamourGirlImg}
                alt="AI Companion Voice"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#fceda7] group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-4 h-4 text-[#d4af37]" />
            </div>
          </div>
        </div>

        {/* ULTRA PRO MAX BANNER: AI Video Generation */}
        <div
          onClick={() => onRouteChange('pricing')}
          className="group relative rounded-2xl bg-gradient-to-r from-[#200c28] via-[#100d1c] to-[#080d1a] border border-violet-500 hover:border-violet-400 p-3 flex items-center justify-between gap-3 cursor-pointer shadow-lg shadow-violet-900/35 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600/25 border border-violet-500/60 flex items-center justify-center text-violet-300 shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.4)]">
              <Crown className="w-5 h-5 text-[#fceda7]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.2 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-black text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                  ULTRA PRO MAX
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  AI Video Generation
                </h3>
              </div>
              <p className="text-[10px] text-gray-300 mt-0.5 leading-snug">
                Next-Gen cinematic videos from your imagination
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-violet-500/60 relative shadow-sm">
              <img
                src={cyberWarriorImg}
                alt="AI Video Generator"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/50 flex items-center justify-center text-violet-300 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-4 h-4 text-violet-400" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
