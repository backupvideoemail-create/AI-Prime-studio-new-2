import React, { useState } from 'react';
import { ScreenRoute, CharacterCategory, AICharacter } from '../types';
import { useLanguage } from '../i18n';
import { CHARACTERS } from '../data/characters';
import { storageService } from '../services/storageService';
import { AuthModal } from '../components/modals/AuthModal';
import {
  Heart,
  Star,
  ChevronDown,
  Filter,
  Flame,
  Sparkles,
  MessageCircleHeart,
  MessageSquare,
} from 'lucide-react';

interface CharactersScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  onSelectCharacter: (charId: string) => void;
  favorites: string[];
  following: string[];
  onToggleFavorite: (charId: string) => void;
  onToggleFollow: (charId: string) => void;
}

export const CharactersScreen: React.FC<CharactersScreenProps> = ({
  onRouteChange,
  onSelectCharacter,
  favorites,
  onToggleFavorite,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'explore' | 'favorites' | 'chats'>('explore');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [selectedSubFilter, setSelectedSubFilter] = useState<'hot' | 'all' | 'romance' | 'thrills' | 'friends'>('hot');
  const [showHotMenu, setShowHotMenu] = useState(false);
  const [hotSortOrder, setHotSortOrder] = useState<'trending' | 'popular' | 'new'>('trending');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCharId, setPendingCharId] = useState<string | null>(null);

  // Filter based on active tab, gender & subFilter
  let displayedCharacters = CHARACTERS;

  if (activeTab === 'favorites') {
    displayedCharacters = displayedCharacters.filter((char) => favorites.includes(char.id));
  }

  // Gender filter
  if (genderFilter !== 'all') {
    displayedCharacters = displayedCharacters.filter((char) => char.gender === genderFilter);
  }

  if (selectedSubFilter === 'romance') {
    displayedCharacters = displayedCharacters.filter(
      (c) => c.category === 'friendly' || c.tags.some((t) => t.toLowerCase().includes('romance') || t.toLowerCase().includes('heart'))
    );
  } else if (selectedSubFilter === 'thrills') {
    displayedCharacters = displayedCharacters.filter(
      (c) => c.category === 'playful' || c.category === 'adventure'
    );
  } else if (selectedSubFilter === 'friends') {
    displayedCharacters = displayedCharacters.filter(
      (c) => c.category === 'cheerful' || c.category === 'calm'
    );
  }

  // Sort if Hot / Popular
  if (selectedSubFilter === 'hot') {
    displayedCharacters = [...displayedCharacters].sort((a, b) => {
      if (hotSortOrder === 'popular') return b.likesCount - a.likesCount;
      if (hotSortOrder === 'new') return b.age - a.age;
      return b.viewsCount - a.viewsCount;
    });
  }

  // Requirement 7: Enforce signup before chat
  const handleOpenChat = (charId: string) => {
    const profile = storageService.getUserProfile();
    const isAuthed = profile.isLoggedIn || !!profile.email || !!profile.phone;
    if (!isAuthed) {
      setPendingCharId(charId);
      setIsAuthModalOpen(true);
      return;
    }
    onSelectCharacter(charId);
    onRouteChange('character-detail');
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Header Tabs: Explore | Favorites | MyChats (Exact screenshot style) */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-2 py-1">
        <div className="flex items-center gap-6 text-sm sm:text-base font-bold">
          <button
            onClick={() => setActiveTab('explore')}
            className={`relative py-2 transition-colors ${
              activeTab === 'explore'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>Explore</span>
            {activeTab === 'explore' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-pink-500 to-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`relative py-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {favorites.length}
              </span>
            )}
            {activeTab === 'favorites' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-pink-500 to-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            )}
          </button>

          <button
            onClick={() => onRouteChange('chats')}
            className="py-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span>MyChats</span>
          </button>
        </div>

        {/* Live Online Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Now</span>
        </div>
      </div>

      {/* Gender Segmented Control: All | Women | Men */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              genderFilter === 'all'
                ? 'bg-gold-gradient text-[#07080a] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Companions
          </button>
          <button
            onClick={() => setGenderFilter('female')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              genderFilter === 'female'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Women
          </button>
          <button
            onClick={() => setGenderFilter('male')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              genderFilter === 'male'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Men
          </button>
        </div>
      </div>

      {/* Sub-Filters Bar: Hot ⌄ | All | Romance | Thrills | Friendship (Matching screenshot) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1 px-1">
        <div className="flex items-center gap-2">
          {/* Hot Dropdown Chip */}
          <div className="relative">
            <button
              onClick={() => {
                setSelectedSubFilter('hot');
                setShowHotMenu(!showHotMenu);
              }}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedSubFilter === 'hot'
                  ? 'bg-white/10 text-white border-pink-500/50 shadow-sm'
                  : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Hot</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showHotMenu && (
              <div className="absolute left-0 mt-2 w-32 rounded-xl bg-[#11131a] border border-white/10 shadow-2xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    setHotSortOrder('trending');
                    setShowHotMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-white/5 ${
                    hotSortOrder === 'trending' ? 'text-pink-400 font-bold' : 'text-gray-300'
                  }`}
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => {
                    setHotSortOrder('popular');
                    setShowHotMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-white/5 ${
                    hotSortOrder === 'popular' ? 'text-pink-400 font-bold' : 'text-gray-300'
                  }`}
                >
                  ⭐ Top Rated
                </button>
                <button
                  onClick={() => {
                    setHotSortOrder('new');
                    setShowHotMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-white/5 ${
                    hotSortOrder === 'new' ? 'text-pink-400 font-bold' : 'text-gray-300'
                  }`}
                >
                  ✨ New Companions
                </button>
              </div>
            )}
          </div>

          {/* All */}
          <button
            onClick={() => setSelectedSubFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedSubFilter === 'all'
                ? 'bg-white/15 text-white border-white/20'
                : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:text-white'
            }`}
          >
            All
          </button>

          {/* Romance */}
          <button
            onClick={() => setSelectedSubFilter('romance')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedSubFilter === 'romance'
                ? 'bg-white/15 text-white border-white/20'
                : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Romance
          </button>

          {/* Thrills */}
          <button
            onClick={() => setSelectedSubFilter('thrills')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedSubFilter === 'thrills'
                ? 'bg-white/15 text-white border-white/20'
                : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Thrills
          </button>

          {/* Friends */}
          <button
            onClick={() => setSelectedSubFilter('friends')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedSubFilter === 'friends'
                ? 'bg-white/15 text-white border-white/20'
                : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Friends
          </button>
        </div>

        {/* Funnel Icon */}
        <button
          onClick={() => setSelectedSubFilter('all')}
          className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white shrink-0"
          title="Filter"
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Empty State */}
      {displayedCharacters.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <Heart className="w-10 h-10 mx-auto text-gray-600" />
          <p className="text-sm text-gray-400">
            {activeTab === 'favorites' ? t.characters.emptyFavorites : 'No companions found in this category.'}
          </p>
          {activeTab === 'favorites' && (
            <button
              onClick={() => setActiveTab('explore')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs"
            >
              Explore All Girls
            </button>
          )}
        </div>
      ) : (
        /* 2-Column Responsive Grid matching screenshot exactly */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedCharacters.map((character) => {
            const isFav = favorites.includes(character.id);

            return (
              <div
                key={character.id}
                onClick={() => handleOpenChat(character.id)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[9/14] bg-[#0c0e14] border border-white/[0.08] hover:border-pink-500/40 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 flex flex-col justify-between"
              >
                {/* Full-bleed Real Indian Model Portrait Image */}
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Top Overlay Row: View Count Badge & Online Dot */}
                <div className="relative z-10 p-2.5 sm:p-3 flex items-center justify-between">
                  {/* View Count Badge matching screenshot (e.g. 180.8K) */}
                  <div className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs font-semibold text-white/90 shadow-sm">
                    {character.viewsBadge || `${(character.viewsCount / 1000).toFixed(1)}K`}
                  </div>

                  {/* Online Indicator */}
                  {character.isOnline && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online</span>
                    </div>
                  )}
                </div>

                {/* Bottom Gradient Card Info Overlay */}
                <div className="relative z-10 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-12 space-y-2">
                  <div>
                    {/* Character Name and Age matching screenshot: "Neha Kapoor, 29" */}
                    <h3 className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight group-hover:text-pink-200 transition-colors">
                      {character.name}, {character.age}
                    </h3>

                    {/* Tagline matching screenshot: "craving your attention" */}
                    <p className="text-[11px] sm:text-xs text-rose-200/90 font-medium line-clamp-1 mt-0.5">
                      {character.tagline}
                    </p>
                  </div>

                  {/* Bottom Action Buttons: Star Favorite + Pinkish "Talk" Button */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {/* Star Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(character.id);
                      }}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                        isFav
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/10'
                      }`}
                      title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'fill-amber-400 text-amber-400' : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Mauve / Pink "Talk" Button matching screenshot */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenChat(character.id);
                      }}
                      className="flex-1 py-1.5 sm:py-2 px-3 rounded-full bg-gradient-to-r from-[#d946ef]/90 via-[#ec4899] to-[#f43f5e] hover:brightness-110 active:scale-95 transition-all text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/25"
                    >
                      <MessageCircleHeart className="w-3.5 h-3.5 text-white fill-white/80" />
                      <span>Talk</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requirement 7: Mandatory Sign Up Modal on character click */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCharId(null);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingCharId) {
            onSelectCharacter(pendingCharId);
            onRouteChange('character-detail');
            setPendingCharId(null);
          }
        }}
        title="AI CLUB — चैट करने के लिए साइन अप करें"
        description="किसी भी AI मॉडल से बात करने के लिए अपने मोबाइल नंबर या गूगल से 1-क्लिक साइन इन करें।"
      />
    </div>
  );
};
