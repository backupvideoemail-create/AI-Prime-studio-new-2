/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AvatarSelectModal Component
 * Modal to let users upload or update their profile picture (DP)
 * Opens when user taps their avatar on Profile Screen.
 */

import React, { useRef } from 'react';
import { X, Camera, Image as ImageIcon, Trash2, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onSelectPhoto: (file: File) => void;
  onRemovePhoto: () => void;
}

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectPhoto,
  onRemovePhoto,
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectPhoto(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xs rounded-3xl bg-[#0e1118] border border-[#d4af37]/30 p-5 shadow-2xl space-y-4 animate-scaleUp text-center">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#fceda7] flex items-center justify-center mx-auto">
          <Camera className="w-6 h-6 text-[#d4af37]" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white font-cinzel">
            {language === 'hi' ? 'प्रोफ़ाइल फोटो (DP)' : 'Profile Picture'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {language === 'hi'
              ? 'गैलरी या कैमरे से अपनी नई DP लगाएं'
              : 'Set or update your profile display picture'}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="space-y-2 pt-2">
          {/* Choose from gallery / camera */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{language === 'hi' ? 'गैलरी से फोटो चुनें' : 'Choose from Gallery'}</span>
          </button>

          {/* Remove current photo if set */}
          {currentAvatar && (
            <button
              onClick={() => {
                onRemovePhoto();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'फोटो हटाएं (Remove DP)' : 'Remove Photo'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-gray-400 hover:text-white"
          >
            {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
