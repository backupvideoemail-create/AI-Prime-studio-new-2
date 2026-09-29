import React from 'react';
import { ScreenRoute } from '../../types';
import { useLanguage } from '../../i18n';
import { storageService } from '../../services/storageService';
import { Sparkles, Globe, User, Crown, Bell } from 'lucide-react';

interface NavbarProps {
  currentRoute: ScreenRoute;
  onRouteChange: (route: ScreenRoute) => void;
  credits: number;
  unreadNotificationsCount?: number;
  onOpenPromoModal?: () => void;
  onOpenNotificationsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  credits,
  unreadNotificationsCount = 7,
  onOpenNotificationsModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const userProfile = storageService.getUserProfile();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07080a]/95 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand identity: AI Prime Studio - AI Friends (Golden Glowing Luxury Logo) */}
        <button
          onClick={() => onRouteChange('home')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#ffe894] via-[#d4af37] to-[#8c6708] p-[1.5px] shadow-lg shadow-[#d4af37]/40 relative overflow-hidden animate-logo-aura">
            {/* Shimmering beam sweeping across */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-logo-shimmer" />
            <div className="w-full h-full bg-[#0a0c10] rounded-[10px] flex items-center justify-center relative z-10">
              <Sparkles className="w-5 h-5 text-[#fceda7] animate-sparkle-pulse" />
            </div>
          </div>
          <div>
            <div className="font-cinzel text-sm sm:text-base md:text-lg font-extrabold tracking-wider text-gold-shine leading-none drop-shadow-[0_0_12px_rgba(212,175,55,0.65)]">
              AI Prime Studio
            </div>
            <div className="text-[9px] sm:text-[10px] tracking-wider text-[#d4af37] font-semibold mt-0.5 whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block shadow-[0_0_6px_#34d399]" />
              <span className="text-[#fceda7] tracking-wider text-[9px] font-bold">AI Friends</span>
            </div>
          </div>
        </button>

        {/* Desktop navigation links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full">
          <button
            onClick={() => onRouteChange('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === 'home'
                ? 'bg-gold-gradient text-[#07080a] font-semibold shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => onRouteChange('create')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === 'create'
                ? 'bg-gold-gradient text-[#07080a] font-semibold shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {t.nav.create}
          </button>
          <button
            onClick={() => onRouteChange('templates')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === 'templates'
                ? 'bg-gold-gradient text-[#07080a] font-semibold shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {t.nav.templates}
          </button>
          <button
            onClick={() => onRouteChange('characters')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === 'characters'
                ? 'bg-gold-gradient text-[#07080a] font-semibold shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            AI Girls
          </button>
          <button
            onClick={() => onRouteChange('pricing')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === 'pricing'
                ? 'bg-gold-gradient text-[#07080a] font-semibold shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {t.more.pricing}
          </button>
        </nav>

        {/* Right action group: Exact reference order [Notifications] [Plans] [Language] [Profile] */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotificationsModal || (() => onRouteChange('more'))}
            title="Notifications"
            className="relative p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-gray-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
              {unreadNotificationsCount || 7}
            </span>
          </button>

          {/* Plans Pill Button */}
          <button
            onClick={() => onRouteChange('pricing')}
            title={`View Plans (${credits} Credits)`}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1b150c] hover:bg-[#251e12] border border-[#d4af37] text-xs font-bold text-[#fceda7] shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all active:scale-95 group"
          >
            <Crown className="w-3.5 h-3.5 text-[#d4af37] group-hover:scale-110 transition-transform" />
            <span>PLANS</span>
          </button>

          {/* Language Selector */}
          <button
            onClick={toggleLanguage}
            title="Switch Language (हिन्दी / English)"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-gray-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {language === 'en' ? 'हिन्दी' : 'EN'}
            </span>
          </button>

          {/* User Profile Avatar - Visibly present directly beside Language control */}
          <button
            onClick={() => onRouteChange('profile')}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] transition-all active:scale-95 group shrink-0 ${
              currentRoute === 'profile'
                ? 'bg-gold-gradient shadow-[0_0_12px_rgba(212,175,55,0.5)] ring-2 ring-[#d4af37]'
                : 'bg-gradient-to-tr from-[#ffe894] via-[#d4af37] to-[#7a5c10] hover:scale-105'
            }`}
            title={language === 'hi' ? 'मेरी प्रोफ़ाइल (Profile)' : 'User Profile'}
            aria-label="User Profile"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#07080a]">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name || 'User Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#d4af37]/20 text-[#fceda7]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
