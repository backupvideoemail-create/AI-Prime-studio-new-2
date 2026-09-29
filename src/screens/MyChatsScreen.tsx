import React from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { CHARACTERS } from '../data/characters';
import { storageService } from '../services/storageService';
import { MessageCircle, ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';

interface MyChatsScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  onSelectCharacter: (charId: string) => void;
}

export const MyChatsScreen: React.FC<MyChatsScreenProps> = ({
  onRouteChange,
  onSelectCharacter,
}) => {
  const { t } = useLanguage();
  const recentChats = storageService.getAllRecentChats();

  const handleOpenChat = (charId: string) => {
    onSelectCharacter(charId);
    onRouteChange('character-detail');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onRouteChange('characters')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back} to AI Girls</span>
        </button>
        <span className="text-xs text-[#fceda7] font-semibold">
          {recentChats.length} Conversations
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
          {t.characters.chatsTab}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Your conversation history with AI companions.
        </p>
      </div>

      {recentChats.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <MessageCircle className="w-10 h-10 mx-auto text-gray-600" />
          <p className="text-sm text-gray-400">{t.characters.emptyChats}</p>
          <button
            onClick={() => onRouteChange('characters')}
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs"
          >
            Start a Conversation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentChats.map((chat) => {
            const char = CHARACTERS.find((c) => c.id === chat.characterId) || CHARACTERS[0];
            return (
              <div
                key={chat.characterId}
                onClick={() => handleOpenChat(chat.characterId)}
                className="p-3.5 rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#d4af37]/40 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-[#10131a]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-[#d4af37]/30 shrink-0">
                    <img
                      src={char.avatar}
                      alt={char.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{char.name}</h3>
                      <span className="text-[10px] text-[#d4af37] font-semibold uppercase">
                        {char.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                      {chat.lastMessage || char.tagline}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
