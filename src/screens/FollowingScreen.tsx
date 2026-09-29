import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { CHARACTERS } from '../data/characters';
import { ArrowLeft, UserCheck, MessageCircle } from 'lucide-react';

interface FollowingScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  following: string[];
  onSelectCharacter: (charId: string) => void;
  onToggleFollow: (charId: string) => void;
}

export const FollowingScreen: React.FC<FollowingScreenProps> = ({
  onRouteChange,
  following,
  onSelectCharacter,
  onToggleFollow,
}) => {
  const { t } = useLanguage();
  const followingChars = CHARACTERS.filter((c) => following.includes(c.id));

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
        <span className="text-xs text-[#fceda7] font-semibold">
          {followingChars.length} Following
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.more.following}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          AI companions and creators you currently follow.
        </p>
      </div>

      {followingChars.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <p className="text-sm text-gray-400">You are not following any AI companions yet.</p>
          <button
            onClick={() => onRouteChange('characters')}
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs"
          >
            Explore AI Girls
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {followingChars.map((char) => (
            <div
              key={char.id}
              className="p-3.5 rounded-2xl bg-[#0c0e14] border border-white/[0.08] flex items-center justify-between"
            >
              <div
                onClick={() => {
                  onSelectCharacter(char.id);
                  onRouteChange('character-detail');
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-[#d4af37]/30 shrink-0">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{char.name}</div>
                  <div className="text-[11px] text-gray-400">{char.city} • Adult AI</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectCharacter(char.id);
                    onRouteChange('character-detail');
                  }}
                  className="p-2 rounded-xl bg-gold-gradient text-[#07080a] text-xs font-bold"
                >
                  <MessageCircle className="w-4 h-4 text-[#07080a]" />
                </button>
                <button
                  onClick={() => onToggleFollow(char.id)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-gray-300 hover:text-white"
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
