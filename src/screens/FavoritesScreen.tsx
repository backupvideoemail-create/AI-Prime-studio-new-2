import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { CHARACTERS } from '../data/characters';
import { Heart, ArrowLeft, MessageCircle } from 'lucide-react';

interface FavoritesScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  favorites: string[];
  onSelectCharacter: (charId: string) => void;
  onToggleFavorite: (charId: string) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onRouteChange,
  favorites,
  onSelectCharacter,
  onToggleFavorite,
}) => {
  const { t } = useLanguage();
  const favCharacters = CHARACTERS.filter((c) => favorites.includes(c.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onRouteChange('characters')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back} to AI Girls</span>
        </button>
        <span className="text-xs text-[#fceda7] font-semibold">
          {favCharacters.length} Favorites
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.more.favorites}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Saved companion profiles for quick conversation.
        </p>
      </div>

      {favCharacters.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <Heart className="w-10 h-10 mx-auto text-gray-600" />
          <p className="text-sm text-gray-400">{t.characters.emptyFavorites}</p>
          <button
            onClick={() => onRouteChange('characters')}
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs"
          >
            Explore AI Girls
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favCharacters.map((char) => (
            <div
              key={char.id}
              className="p-4 rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#d4af37]/40 flex flex-col justify-between space-y-3"
            >
              <div
                onClick={() => {
                  onSelectCharacter(char.id);
                  onRouteChange('character-detail');
                }}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={char.avatar}
                  alt={char.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(char.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/75 flex items-center justify-center text-red-500"
                >
                  <Heart className="w-4 h-4 fill-red-500" />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{char.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-1">{char.tagline}</p>
              </div>

              <button
                onClick={() => {
                  onSelectCharacter(char.id);
                  onRouteChange('character-detail');
                }}
                className="w-full py-2 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#07080a]" />
                <span>Talk</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
