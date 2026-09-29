import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, X, Sparkles, Crown, Gift } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../i18n';

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCredits: number) => void;
}

export const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus('loading');
    setFeedback('');

    try {
      const result = await storageService.redeemPromoCode(code);
      if (result.success) {
        setStatus('success');
        setFeedback(result.message);
        setTimeout(() => {
          onSuccess(result.newTotal);
          onClose();
          setCode('');
          setStatus('idle');
        }, 1200);
      } else {
        setStatus('error');
        setFeedback(result.message);
      }
    } catch {
      setStatus('error');
      setFeedback('Failed to redeem promo code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1c140a] via-[#100d08] to-[#0a0c10] border-2 border-[#d4af37]/60 p-6 shadow-[0_0_50px_rgba(212,175,55,0.25)] space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#aa8010] to-[#604405] flex items-center justify-center text-[#07080a] shadow-lg shadow-[#d4af37]/30">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
              {language === 'hi' ? 'सीक्रेट प्रोमो कोड' : 'Secret Promo Code'}
            </span>
            <h3 className="text-base font-bold text-white font-cinzel">
              {language === 'hi' ? 'एडमिन व वीआईपी एक्सेस' : 'Admin & VIP Access'}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {language === 'hi'
            ? 'यदि आपके पास कोई अधिकृत वीआईपी प्रोमो कोड या इनवाइट पासकी है, तो यहाँ दर्ज करें और विशेष स्टूडियो लाभ पाएं।'
            : 'Enter your authorized promo passkey or invite code to redeem exclusive studio access and credits.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={language === 'hi' ? 'यहाँ प्रोमो कोड दर्ज करें' : 'ENTER PROMO CODE'}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-[#d4af37]/40 text-sm font-mono tracking-widest text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                autoFocus
              />
              <Gift className="w-4 h-4 text-[#d4af37] absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{feedback}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-semibold">{feedback}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !code.trim()}
            className="w-full py-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg shadow-[#d4af37]/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#07080a]" />
            <span>
              {status === 'loading'
                ? language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Verifying Code...'
                : language === 'hi' ? 'प्रोमो कोड लागू करें' : 'Redeem Promo Code'}
            </span>
          </button>
        </form>

        <div className="text-[11px] text-center text-gray-500 pt-1">
          {language === 'hi'
            ? 'अधिकृत कोड 24/7 सुरक्षित रूप से मान्य हैं'
            : 'Authorized codes verified in real-time'}
        </div>
      </div>
    </div>
  );
};
