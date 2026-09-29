import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { Camera, Layers, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface HowItWorksScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ onRouteChange }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
          {t.more.howItWorks}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Discover how our proprietary photographic AI pipeline transforms your digital presence.
        </p>
      </div>

      {/* Step Breakdown */}
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 font-cinzel font-bold text-lg">
            01
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="font-bold text-base text-white">Upload Your Portrait or Headshot</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Upload any clear photo from your camera or photo gallery. We accept JPG, PNG, and WEBP formats up to 12MB. For optimal results, ensure your face is well-lit and unobstructed.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 font-cinzel font-bold text-lg">
            02
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="font-bold text-base text-white">Select a Signature Studio Style or Custom Text</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Choose from 12+ pre-calibrated cinematic templates (such as Executive Skyscraper Suite, Royal Golden Hour, or Midnight Noir) or describe exactly what you want in plain words (e.g. "change background to a 5-star hotel lobby in tailored suit").
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 font-cinzel font-bold text-lg">
            03
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="font-bold text-base text-white">Photorealistic Facial Identity Preservation</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Our AI architecture separates the subject's unique facial features and facial structure from background lighting and attire. Your authentic expression is preserved with magazine-grade depth of field and rim lighting.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 font-cinzel font-bold text-lg">
            04
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="font-bold text-base text-white">Engage with AI Companions</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Explore our diverse roster of fictional adult Indian AI characters. Converse naturally in English or Hinglish, discuss creative ideas, get styling tips, or enjoy heartfelt conversations anytime.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1b1712] to-[#0a0c10] border border-[#d4af37]/30 text-center space-y-3">
        <h3 className="font-cinzel text-lg font-bold text-white">
          Experience Studio-Quality Creations Now
        </h3>
        <button
          onClick={() => onRouteChange('create')}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg shadow-[#d4af37]/20"
        >
          Open AI Photo Studio →
        </button>
      </div>
    </div>
  );
};
