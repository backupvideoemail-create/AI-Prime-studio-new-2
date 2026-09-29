import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { Users, ArrowLeft } from 'lucide-react';

interface FollowersScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
}

export const FollowersScreen: React.FC<FollowersScreenProps> = ({ onRouteChange }) => {
  const { t } = useLanguage();

  const mockFollowers = [
    { name: 'Rohit Verma', username: '@rohit_v', role: 'Portrait Creator', mutual: true },
    { name: 'Pooja Sharma', username: '@pooja_art', role: 'Fashion Stylist', mutual: false },
    { name: 'Vikram Mehta', username: '@vikram_m', role: 'Creative Director', mutual: true },
    { name: 'Aarushi Singhania', username: '@aarushi_s', role: 'Digital Artist', mutual: false },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onRouteChange('profile')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back} to Profile</span>
        </button>
        <span className="text-xs text-[#fceda7] font-semibold">12 Followers</span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.more.followers}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Members and creators connected with your studio profile.
        </p>
      </div>

      <div className="space-y-3">
        {mockFollowers.map((f, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-[#0c0e14] border border-white/[0.08] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-gradient/20 border border-[#d4af37]/40 flex items-center justify-center font-bold text-sm text-[#fceda7]">
                {f.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-sm text-white">{f.name}</div>
                <div className="text-[11px] text-gray-400">{f.username} • {f.role}</div>
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-gray-300">
              {f.mutual ? 'Mutual' : 'Follow Back'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
