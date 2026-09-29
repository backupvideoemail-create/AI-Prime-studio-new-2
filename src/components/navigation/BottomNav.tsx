import React from 'react';
import { ScreenRoute } from '../../types';
import { useLanguage } from '../../i18n';
import { Home, Sparkles, Image as ImageIcon, Users, Menu } from 'lucide-react';

interface BottomNavProps {
  currentRoute: ScreenRoute;
  onRouteChange: (route: ScreenRoute) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onRouteChange }) => {
  const { t } = useLanguage();

  const isTabActive = (tab: 'home' | 'create' | 'templates' | 'characters' | 'more') => {
    if (tab === 'home') return currentRoute === 'home';
    if (tab === 'create') return currentRoute === 'create';
    if (tab === 'templates') return currentRoute === 'templates';
    if (tab === 'characters') {
      return (
        currentRoute === 'characters' ||
        currentRoute === 'character-detail' ||
        currentRoute === 'favorites' ||
        currentRoute === 'chats'
      );
    }
    if (tab === 'more') {
      return [
        'more',
        'profile',
        'followers',
        'following',
        'pricing',
        'how-it-works',
        'support',
        'faq',
        'privacy',
        'terms',
      ].includes(currentRoute);
    }
    return false;
  };

  const navItems = [
    { id: 'home' as const, route: 'home' as ScreenRoute, label: t.nav.home, icon: Home },
    { id: 'create' as const, route: 'create' as ScreenRoute, label: t.nav.create, icon: Sparkles, isCreateAction: true },
    { id: 'templates' as const, route: 'templates' as ScreenRoute, label: t.nav.templates, icon: ImageIcon },
    { id: 'characters' as const, route: 'characters' as ScreenRoute, label: t.nav.characters, icon: Users },
    { id: 'more' as const, route: 'more' as ScreenRoute, label: t.nav.more, icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#07080a]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16 bottom-safe">
        {navItems.map((item) => {
          const active = isTabActive(item.id);
          const Icon = item.icon;

          if (item.isCreateAction) {
            return (
              <button
                key={item.id}
                onClick={() => onRouteChange(item.route)}
                className="flex flex-col items-center justify-center -mt-4 group active:scale-95 transition-transform"
              >
                <div
                  className={`w-12 h-12 rounded-full p-[2px] transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-tr from-[#ffe894] via-[#d4af37] to-[#8c6708] shadow-[0_0_20px_rgba(212,175,55,0.45)] scale-105'
                      : 'bg-gradient-to-tr from-[#d4af37]/80 to-[#7a5c10] shadow-[0_0_12px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  <div className="w-full h-full bg-[#0a0c10] rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#fceda7]" />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 transition-colors ${
                    active ? 'text-[#fceda7]' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onRouteChange(item.route)}
              className={`flex-1 py-1 flex flex-col items-center justify-center transition-all duration-200 relative ${
                active ? 'text-[#fceda7]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {active && (
                <div className="absolute top-0 w-8 h-[2px] rounded-full bg-gold-gradient shadow-[0_0_8px_#d4af37]" />
              )}
              <div
                className={`p-1 rounded-xl transition-all ${
                  active ? 'bg-[#d4af37]/10' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${active ? 'font-semibold text-gold-gradient' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
