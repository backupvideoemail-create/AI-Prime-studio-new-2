import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { FileText, ArrowLeft } from 'lucide-react';

interface TermsScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onRouteChange }) => {
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
          <FileText className="w-5 h-5" />
        </div>
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.more.terms}
        </h1>
        <p className="text-xs text-gray-400">Effective Date: October 2025</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0c0e14] border border-white/[0.08] text-xs sm:text-sm text-gray-300 space-y-4 leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">1. Acceptance of Terms</h2>
          <p>
            By accessing or using AI CLUB — AI Social & Entertainment, you agree to be legally bound by these Terms of Service. If you do not agree, please discontinue use immediately.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">2. Authorized Use of Uploaded Portraits</h2>
          <p>
            You represent and warrant that you own or possess all requisite rights, consents, and permissions to upload any portrait or likeness provided to the Platform. Uploading images of other individuals without explicit authorization is strictly prohibited.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">3. Fictional Character Disclaimer</h2>
          <p>
            All characters featured in the AI Characters gallery are fictional adult generative personalities. Any resemblance to real persons, living or deceased, is entirely coincidental.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">4. Studio Credits & Billing</h2>
          <p>
            Studio credits allow generation of photographic transformations. Credits are non-transferable and subject to our fair usage and safety constraints.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-white text-sm sm:text-base">5. Intellectual Property & Watermarks</h2>
          <p>
            Generations created on the Platform include the "Generated with AI — AI CLUB" provenance watermark to preserve transparency and ethical AI attribution.
          </p>
        </section>
      </div>
    </div>
  );
};
