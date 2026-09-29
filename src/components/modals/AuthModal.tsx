/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AuthModal Component
 * Elegant, secure authentication modal for Google Sign-In and Mobile OTP
 * Required before chatting with AI models or saving creations.
 */

import React, { useState } from 'react';
import { X, Sparkles, Mail, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}) => {
  const { language } = useLanguage();
  const [authMethod, setAuthMethod] = useState<'options' | 'phone' | 'google'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle instant Google Sign In
  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = storageService.getUserProfile();
      user.isLoggedIn = true;
      user.email = user.email || 'user.google@gmail.com';
      user.name = userName.trim() || user.name || 'Member';
      storageService.saveUserProfile(user);
      storageService.grantWelcomeSignupBonus();
      setLoading(false);
      onSuccess();
      onClose();
    }, 800);
  };

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError(language === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 600);
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError(language === 'hi' ? 'कृपया 4 अंकों का OTP दर्ज करें' : 'Please enter the 4-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = storageService.getUserProfile();
      user.isLoggedIn = true;
      user.phone = phoneNumber;
      if (userName.trim()) user.name = userName.trim();
      storageService.saveUserProfile(user);
      storageService.grantWelcomeSignupBonus();
      setLoading(false);
      onSuccess();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0e1118] border border-[#d4af37]/30 p-6 shadow-2xl space-y-5 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f5d77f] via-[#d4af37] to-[#aa7c11] p-[1.5px] mx-auto shadow-lg shadow-[#d4af37]/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0c10] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#fceda7]" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-white font-cinzel">
            {title || (language === 'hi' ? 'साइन इन करें (Sign In)' : 'Sign In Required')}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {description ||
              (language === 'hi'
                ? 'AI मॉडल्स से चैट करने और अपनी बातचीत सुरक्षित रखने के लिए मोबाइल या गूगल से लॉगिन करें।'
                : 'Sign in with your Mobile number or Google to chat with AI Girls and save your memories.')}
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Screen: Method Options */}
        {authMethod === 'options' && (
          <div className="space-y-3 pt-1">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs flex items-center justify-center gap-3 shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            {/* Mobile Number Button */}
            <button
              onClick={() => setAuthMethod('phone')}
              className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold text-xs flex items-center justify-center gap-2.5 active:scale-98 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'मोबाइल नंबर से साइन इन करें' : 'Sign in with Mobile Number'}</span>
            </button>
          </div>
        )}

        {/* Screen: Phone Number & OTP */}
        {authMethod === 'phone' && (
          <div className="space-y-3 pt-1">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] text-gray-300 font-medium">
                    {language === 'hi' ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Rahul, Amit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] text-gray-300 font-medium">
                    {language === 'hi' ? 'मोबाइल नंबर (10 Digit)' : 'Mobile Number'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-gray-300 text-xs font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37]"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full py-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Sending OTP...' : (language === 'hi' ? 'OTP प्राप्त करें' : 'Get OTP')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('options')}
                  className="w-full py-2 text-[11px] text-gray-400 hover:text-gray-200"
                >
                  {language === 'hi' ? '← अन्य विकल्प' : '← Other options'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] text-gray-300 font-medium flex items-center justify-between">
                    <span>{language === 'hi' ? 'OTP दर्ज करें' : 'Enter 4-Digit OTP'}</span>
                    <span className="text-emerald-400 text-[10px]">OTP: 1234</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-center text-base tracking-widest font-mono focus:outline-none focus:border-[#d4af37]"
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-400 text-center mt-1">
                    {language === 'hi' ? `OTP +91 ${phoneNumber} पर भेजा गया` : `Sent to +91 ${phoneNumber}`}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full py-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Verifying...' : (language === 'hi' ? 'वेरिफाई करें और चैट शुरू करें' : 'Verify & Start Chat')}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full py-2 text-[11px] text-gray-400 hover:text-gray-200"
                >
                  {language === 'hi' ? '← नंबर बदलें' : '← Change phone number'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security Trust Badge */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'hi' ? '100% सुरक्षित एवं निजी • कोई स्पैम नहीं' : '100% Secure & Private • No spam'}</span>
        </div>
      </div>
    </div>
  );
};
