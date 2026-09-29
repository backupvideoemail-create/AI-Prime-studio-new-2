import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import {
  User,
  Users,
  Heart,
  MessageCircle,
  CreditCard,
  HelpCircle,
  Headphones,
  Globe,
  Shield,
  FileText,
  KeyRound,
  ChevronRight,
  Sparkles,
  Ticket,
  Phone,
} from 'lucide-react';

interface MoreScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  onOpenLanguageModal: () => void;
  onOpenInternalTestModal: () => void;
  onOpenPromoModal?: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  onRouteChange,
  onOpenLanguageModal,
  onOpenInternalTestModal,
  onOpenPromoModal,
}) => {
  const { t, language } = useLanguage();

  const sections = [
    {
      group: 'Account & Community',
      items: [
        { label: t.more.profile, icon: User, route: 'profile' as ScreenRoute },
        { label: t.more.followers, icon: Users, route: 'followers' as ScreenRoute },
        { label: t.more.following, icon: Users, route: 'following' as ScreenRoute },
        { label: t.more.favorites, icon: Heart, route: 'favorites' as ScreenRoute },
        { label: t.more.chats, icon: MessageCircle, route: 'chats' as ScreenRoute },
      ],
    },
    {
      group: 'Studio Plans & VIP Access',
      items: [
        { label: t.more.pricing, icon: CreditCard, route: 'pricing' as ScreenRoute },
        {
          label: language === 'hi' ? 'वीआईपी प्रोमो कोड (VIP Access)' : 'Redeem VIP Promo Code',
          icon: Ticket,
          customAction: onOpenPromoModal,
        },
        { label: t.more.howItWorks, icon: Sparkles, route: 'how-it-works' as ScreenRoute },
        { label: t.more.support, icon: Headphones, route: 'support' as ScreenRoute, badge: '24/7 Live' },
        { label: t.more.faq, icon: HelpCircle, route: 'faq' as ScreenRoute },
      ],
    },
    {
      group: 'Preferences & Legal',
      items: [
        {
          label: t.more.language,
          icon: Globe,
          customAction: onOpenLanguageModal,
          badge: language === 'en' ? 'English' : 'हिन्दी',
        },
        { label: t.more.privacy, icon: Shield, route: 'privacy' as ScreenRoute },
        { label: t.more.terms, icon: FileText, route: 'terms' as ScreenRoute },
      ],
    },
    {
      group: 'Studio Administration',
      items: [
        {
          label: t.more.internalTest,
          icon: KeyRound,
          customAction: onOpenInternalTestModal,
          badge: 'Owner / Dev',
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="text-center space-y-1">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.more.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Account preferences, studio guidelines, and direct owner support.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-2">
            <h2 className="text-[11px] font-bold tracking-wider text-gray-400 uppercase px-2">
              {sec.group}
            </h2>
            <div className="rounded-2xl bg-[#0c0e14] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
              {sec.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={iIdx}
                    onClick={() => {
                      if (item.customAction) {
                        item.customAction();
                      } else if (item.route) {
                        onRouteChange(item.route);
                      }
                    }}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-300 group-hover:text-[#fceda7] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-white group-hover:text-[#fceda7] transition-colors">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1b1712] border border-[#d4af37]/30 text-[#fceda7]">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Version footer */}
      <div className="text-center pt-4 text-gray-500 text-[11px]">
        {t.more.version} • Built with cinematic excellence
      </div>
    </div>
  );
};
