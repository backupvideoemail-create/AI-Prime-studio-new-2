import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import { LanguageCode } from '../../types';
import { Sparkles, Check } from 'lucide-react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, setHasChosenLanguage } = useLanguage();
  const [selected, setSelected] = useState<LanguageCode>(language);

  if (!isOpen) return null;

  const handleContinue = () => {
    setLanguage(selected);
    setHasChosenLanguage(true);
    try {
      localStorage.setItem('jrr_ai_studio_language', selected);
      localStorage.setItem('jrr_ai_studio_lang_selected', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0c0e14] border border-[#d4af37]/40 shadow-[0_0_50px_-10px_rgba(212,175,55,0.25)] p-6 text-center overflow-hidden">
        {/* Decorative corner ambient glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand emblem */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#f5d77f] via-[#d4af37] to-[#8c6708] p-[1.5px] shadow-lg shadow-[#d4af37]/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0a0c10] rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-[#fceda7]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-cinzel text-xl font-bold tracking-wider text-gold-gradient mb-1">
          AI CLUB
        </h2>
        <p className="text-xs tracking-widest text-[#9ca3af] font-semibold mb-6">
          AI Social & Entertainment
        </p>

        {/* Prompt */}
        <p className="text-sm font-medium text-gray-300 mb-4">
          Choose your language <br />
          <span className="text-xs text-gray-400">अपनी भाषा चुनें</span>
        </p>

        {/* Language selector buttons */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={() => setSelected('en')}
            className={`w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-between border transition-all ${
              selected === 'en'
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#fceda7] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                : 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🇬🇧</span>
              <div className="text-left">
                <div className="font-semibold">English</div>
                <div className="text-[10px] text-gray-400">Global Edition</div>
              </div>
            </div>
            {selected === 'en' && <Check className="w-4 h-4 text-[#d4af37]" />}
          </button>

          <button
            onClick={() => setSelected('hi')}
            className={`w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-between border transition-all ${
              selected === 'hi'
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#fceda7] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                : 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🇮🇳</span>
              <div className="text-left">
                <div className="font-semibold font-hindi">हिन्दी</div>
                <div className="text-[10px] text-gray-400">भारतीय संस्करण</div>
              </div>
            </div>
            {selected === 'hi' && <Check className="w-4 h-4 text-[#d4af37]" />}
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-sm shadow-lg shadow-[#d4af37]/25 active:scale-98 transition-transform"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
