import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onRouteChange }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onRouteChange('more')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back} to More</span>
        </button>
      </div>

      <div className="text-center space-y-1">
        <div className="w-10 h-10 mx-auto rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
          <Shield className="w-5 h-5" />
        </div>
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.more.privacy}
        </h1>
        <p className="text-xs text-gray-400">Effective Date: October 2025</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0c0e14] border border-white/[0.08] text-xs sm:text-sm text-gray-300 space-y-4 leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">1. Photographic Data Protection</h2>
          <p>
            AI CLUB ("we", "our", or "the Platform") treats user portraits with strict confidentiality. Uploaded photos are transmitted securely and temporarily processed in memory solely to execute your requested AI transformation. We do not sell, rent, or distribute your private photos to third parties.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">2. Facial Geometry & Identity</h2>
          <p>
            Our AI Photo Studio maps facial landmark geometry strictly for the duration of the styling pipeline to preserve your authentic appearance. We do not construct persistent biometric identification databases.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">3. Conversational AI Privacy</h2>
          <p>
            Dialogues with fictional AI character companions are stored locally on your device storage unless you choose to clear your conversation history.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">4. Responsible AI & Safety</h2>
          <p>
            Content generation is governed by safety filters. Generating defamatory, illicit, or unauthorized third-party imagery is strictly forbidden under our safety policies.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">5. Contact Information</h2>
          <p>
            For privacy inquiries or deletion requests, please contact privacy@aiclub.ai.
          </p>
        </section>
      </div>
    </div>
  );
};
