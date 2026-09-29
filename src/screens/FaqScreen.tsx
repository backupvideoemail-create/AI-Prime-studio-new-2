import React, { useState } from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
}

export const FaqScreen: React.FC<FaqScreenProps> = ({ onRouteChange }) => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Will the AI change my facial identity or look like someone else?',
      a: 'No. Our primary architectural rule is authentic identity preservation. We preserve your facial contours, bone structure, eye shape, and natural expression while transforming lighting, attire, background textures, and photographic color grading.',
    },
    {
      q: 'What types of photos work best for the Photo Studio?',
      a: 'Clear, well-lit portrait headshots or selfies without extreme filters or face coverings. Avoid group photos or heavily blurred low-resolution files for the crispest studio output.',
    },
    {
      q: 'Are the AI Characters real people?',
      a: 'No. All characters featured in our AI Girls & Companions gallery are completely fictional, adult (20+ years of age) generative personalities crafted with distinct Indian cultural backgrounds, voices, and creative interests.',
    },
    {
      q: 'Can I converse in Hindi or Hinglish with the AI Characters?',
      a: 'Yes! Our character conversational engine fluently supports English, Hinglish, and Hindi, adjusting its warmth and phrasing to match natural conversational dialogue.',
    },
    {
      q: 'When will Video Face Swap be released?',
      a: 'Video Face Swap is currently under rigorous calibration and security compliance testing. It is scheduled to debut in an upcoming platform release.',
    },
    {
      q: 'How are my uploaded photos handled and stored?',
      a: 'We respect your creative privacy. Uploaded photos are processed securely in temporary server memory solely to generate your requested transformation and are not sold, leased, or utilized to train general public models.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="text-center space-y-1">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.more.faq}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Everything you need to know about the AI CLUB platform.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#0c0e14] border border-white/[0.08] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-white hover:text-[#fceda7]"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#d4af37] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-300 leading-relaxed border-t border-white/[0.04]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
