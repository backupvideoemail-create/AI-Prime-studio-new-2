/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 18+ Age & VIP Intimate Content Verification Modal
 * Pre-call gate ensuring user confirms they are 18+ before 1-on-1 private audio/video calls
 */

import React from 'react';
import { ShieldAlert, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  characterName: string;
  callType: 'voice' | 'video';
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  characterName,
  callType,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-[#12080e] rounded-3xl border border-rose-500/50 p-5 sm:p-6 text-center space-y-4 shadow-2xl shadow-rose-950/50 animate-scaleUp relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30 border border-rose-400/40">
          <span className="font-extrabold text-2xl tracking-tighter">18+</span>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'hi' ? 'आयु सत्यापन एवं निजी कॉल नोटिस' : 'Age Verification & Intimate Call'}</span>
          </span>

          <h3 className="text-lg sm:text-xl font-bold text-white font-cinzel">
            {language === 'hi' ? `${characterName} के साथ 1-on-1 प्राइवेट कॉल` : `1-on-1 Private Call with ${characterName}`}
          </h3>

          <p className="text-xs text-rose-100/80 leading-relaxed">
            {language === 'hi'
              ? `यह ${callType === 'video' ? 'फेस-टू-फेस वीडियो कॉल' : 'लाइव 2-वे वॉयस कॉल'} केवल 18 वर्ष या उससे अधिक उम्र के वयस्कों के लिए है। इसमें निजी रोमांटिक व भावनात्मक बातचीत शामिल हो सकती है। क्या आप 18+ हैं?`
              : `This 1-on-1 ${callType === 'video' ? 'face-to-face video call' : 'live voice call'} is strictly intended for mature adults (18+). May contain intimate romantic & emotional companion conversation. Are you 18 years or older?`}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 text-[11px] text-gray-300 space-y-1 text-left">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>100% प्राइवेट व एंड-टू-एंड एन्क्रिप्टेड कॉल</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>सिनेमैटिक AI ऑडियो / वीडियो रेंडरिंग</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:brightness-110 active:scale-95 transition-all text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{language === 'hi' ? 'हाँ, मैं 18+ हूँ — कॉल शुरू करें' : 'Yes, I am 18+ — Proceed to Call'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold"
          >
            {language === 'hi' ? 'नहीं, वापस जाएँ (Cancel)' : 'Cancel & Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
};
