/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import {
  Mail,
  Headphones,
  HelpCircle,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Eye,
  Copy,
  Check,
} from 'lucide-react';

interface SupportScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({ onRouteChange }) => {
  const { language } = useLanguage();

  const officialEmail = 'backupvideoemail@gmail.com';
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    officialEmail
  )}&su=${encodeURIComponent('AI Prime Studio - Customer Support & Billing Inquiry')}&body=${encodeURIComponent(
    'Hi Support Team,\n\nI am reaching out regarding AI Prime Studio (AI Friends):\n- My Account / User ID:\n- Query / Transaction Details:\n'
  )}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(officialEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: language === 'hi' ? 'क्रेडिट्स कैसे काम करते हैं?' : 'How do credits work in AI Prime Studio?',
      a:
        language === 'hi'
          ? 'सफलतापूर्वक साइनअप करने पर 50 फ्री वेलकम क्रेडिट्स मिलते हैं जिससे आप 1 मास्टर 4K फोटो जनरेट कर सकते हैं।'
          : 'Upon successful sign-up, you receive 50 free welcome credits allowing 1 master 4K portrait generation.',
    },
    {
      q:
        language === 'hi'
          ? 'क्या फोटो और वीडियो जनरेशन में मेरा असली चेहरा 100% वैसा ही रहेगा?'
          : 'Does the AI preserve my exact facial identity in Photos & Videos?',
      a:
        language === 'hi'
          ? 'हाँ, AI Prime Studio में एडवांस्ड फेशियल कीप-अलाइव और न्यूरल फेस-स्वैप तकनीक का उपयोग किया जाता है जिससे आपका चेहरा और नैन-नक्श 100% समान रहते हैं।'
          : 'Yes, AI Prime Studio employs proprietary identity-locking and neural face-swap algorithms ensuring your authentic facial geometry is 100% preserved.',
    },
    {
      q:
        language === 'hi'
          ? 'पेमेंट करने के बाद क्रेडिट्स कितनी देर में आते हैं?'
          : 'How quickly are credits credited after payment?',
      a:
        language === 'hi'
          ? 'क्रेडिट्स तुरंत (रियल-टाइम में) आपके अकाउंट में जुड़ जाते हैं। किसी भी सहायता के लिए आप सीधे हमारी सपोर्ट ईमेल पर संपर्क कर सकते हैं।'
          : 'Credits are instantly credited to your balance upon payment confirmation. For any billing questions, reach us directly via our official support email.',
    },
    {
      q:
        language === 'hi'
          ? 'एआई फ्रेंड्स के साथ लाइव कॉल कैसे काम करती है?'
          : 'How do live voice and video calls work with AI Friends?',
      a:
        language === 'hi'
          ? '1-on-1 प्राइवेट ऑडियो और वीडियो कॉल 18+ वयस्क यूजर्स के लिए उपलब्ध है। कॉल शुरू करने से पहले 18+ सत्यापन होता है, जिसके बाद आप सीधे अपने पसंदीदा AI मॉडल से जुड़ सकते हैं।'
          : '1-on-1 private audio and video calls are available for verified 18+ adult users with seamless real-time responses and companion interactions.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1712] border border-[#d4af37]/40 text-xs font-semibold text-[#fceda7] shadow-lg shadow-[#d4af37]/10">
          <Headphones className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>{language === 'hi' ? '24/7 ऑफिशियल हेल्पडेस्क' : '24/7 Official Helpdesk'}</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide">
          {language === 'hi' ? 'कस्टमर सपोर्ट व हेल्प' : 'Customer Support & Help'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
          {language === 'hi'
            ? 'पेमेंट, क्रेडिट्स या जनरेशन से जुड़े किसी भी सवाल के लिए हमारे आधिकारिक ईमेल सपोर्ट चैनल पर संपर्क करें।'
            : 'For billing verification, subscription inquiries, or assistance, contact our dedicated support team.'}
        </p>
      </div>

      {/* Official Business Email Support Card (WhatsApp & Phone completely removed) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#181115] via-[#120d11] to-[#07080a] border border-[#d4af37]/40 shadow-2xl shadow-black/50 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f5d77f] via-[#d4af37] to-[#8c6708] text-[#07080a] flex items-center justify-center font-bold shadow-lg shadow-[#d4af37]/25">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
              {language === 'hi' ? 'ऑफिशियल बिज़नेस सपोर्ट' : 'Verified Business Support'}
            </span>
            <h3 className="text-lg font-bold text-white">
              {language === 'hi' ? 'ईमेल हेल्पडेस्क सपोर्ट' : 'Official Email Helpdesk'}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {language === 'hi'
            ? 'हमारे कस्टमर सपोर्ट से संपर्क करने के लिए नीचे दिए गए बटन पर टैप करें। इनवॉइस, पेमेंट एक्टिवेशन और अकाउंट संबंधी सहायता 24 घंटे उपलब्ध है।'
            : 'Click below to reveal our verified support email address and launch a direct support inquiry.'}
        </p>

        {/* Revealed Email Box or Reveal Button */}
        {!isEmailRevealed ? (
          <button
            onClick={() => setIsEmailRevealed(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient hover:brightness-110 text-[#07080a] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'hi' ? 'सपोर्ट ईमेल आईडी देखें' : 'Click to View Support Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#d4af37]/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="text-xs sm:text-sm font-mono font-bold text-[#fceda7] truncate select-all">
                  {officialEmail}
                </span>
              </div>
              <button
                onClick={handleCopyEmail}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs flex items-center gap-1 shrink-0 transition-colors"
                title="Copy Email"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
              >
                <Mail className="w-4 h-4" />
                <span>{language === 'hi' ? 'जीमेल में खोलें (Gmail)' : 'Open in Gmail'}</span>
              </a>

              <a
                href={`mailto:${officialEmail}?subject=AI%20Prime%20Studio%20Support`}
                className="py-3 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span>{language === 'hi' ? 'अन्य ईमेल ऐप से भेजें' : 'Send via Mail App'}</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Verified Direct Customer Resolution Team</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Avg reply &lt; 30 mins</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0c0e14] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <HelpCircle className="w-4 h-4 text-[#d4af37]" />
          <h2 className="font-cinzel text-base font-bold text-white">
            {language === 'hi' ? 'अक्सर पूछे जाने वाले सवाल (FAQs)' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-[#fceda7] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#d4af37] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-gray-300 leading-relaxed border-t border-white/[0.04] pt-2.5 bg-black/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
