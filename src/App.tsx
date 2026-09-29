/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenRoute, LanguageCode } from './types';
import { LanguageContext, getInitialLanguage, translations } from './i18n';
import { storageService } from './services/storageService';
import { Navbar } from './components/navigation/Navbar';
import { BottomNav } from './components/navigation/BottomNav';
import { LanguageModal } from './components/modals/LanguageModal';
import { InternalTestModal } from './components/modals/InternalTestModal';
import { PromoCodeModal } from './components/modals/PromoCodeModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { AppNotification } from './services/storageService';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { CreateScreen } from './screens/CreateScreen';
import { TemplatesScreen } from './screens/TemplatesScreen';
import { CharactersScreen } from './screens/CharactersScreen';
import { CharacterDetailScreen } from './screens/CharacterDetailScreen';
import { MyChatsScreen } from './screens/MyChatsScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { FollowersScreen } from './screens/FollowersScreen';
import { FollowingScreen } from './screens/FollowingScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PricingScreen } from './screens/PricingScreen';
import { HowItWorksScreen } from './screens/HowItWorksScreen';
import { SupportScreen } from './screens/SupportScreen';
import { FaqScreen } from './screens/FaqScreen';
import { MoreScreen } from './screens/MoreScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { TermsScreen } from './screens/TermsScreen';

export default function App() {
  const initialLang = getInitialLanguage();
  const [language, setLanguage] = useState<LanguageCode>(initialLang.lang);
  const [hasChosenLanguage, setHasChosenLanguage] = useState<boolean>(initialLang.hasChosen);
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(!initialLang.hasChosen);
  const [isInternalTestModalOpen, setIsInternalTestModalOpen] = useState<boolean>(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);

  // Application routing state
  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>('home');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('riya');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // App persistence state
  const [credits, setCredits] = useState<number>(() => storageService.getUserProfile().creditsRemaining);
  const [favorites, setFavorites] = useState<string[]>(() => storageService.getFavorites());
  const [following, setFollowing] = useState<string[]>(() => storageService.getFollowing());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => storageService.getNotifications());
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);

  // Sync credits & notifications periodically / on storage changes
  useEffect(() => {
    const syncData = () => {
      setCredits(storageService.getCredits());
      setNotifications(storageService.getNotifications());
      setFavorites(storageService.getFavorites());
      setFollowing(storageService.getFollowing());
    };
    window.addEventListener('storage', syncData);
    const interval = setInterval(syncData, 1500);
    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, []);

  // Listen to browser popstate for URL updates
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const validRoutes: ScreenRoute[] = [
        'home',
        'create',
        'templates',
        'characters',
        'character-detail',
        'profile',
        'followers',
        'following',
        'favorites',
        'chats',
        'pricing',
        'how-it-works',
        'support',
        'faq',
        'more',
        'privacy',
        'terms',
      ];
      if (path && validRoutes.includes(path as ScreenRoute)) {
        setCurrentRoute(path as ScreenRoute);
      } else if (!path) {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleRouteChange = (route: ScreenRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetUrl = route === 'home' ? '/' : `/${route}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  };

  const handleToggleFavorite = (charId: string) => {
    const updated = storageService.toggleFavorite(charId);
    setFavorites(updated);
  };

  const handleToggleFollow = (charId: string) => {
    const updated = storageService.toggleFollow(charId);
    setFollowing(updated);
  };

  const handleInternalTestAccessGranted = () => {
    setCredits((prev) => prev + 100);
    const user = storageService.getUserProfile();
    user.creditsRemaining += 100;
    user.membershipTier = 'Pro Studio';
    storageService.saveUserProfile(user);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        hasChosenLanguage,
        setHasChosenLanguage,
      }}
    >
      <div className="min-h-screen bg-[#07080a] text-gray-100 flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#fceda7]">
        {/* Top Navbar (hidden on full-screen WhatsApp chat) */}
        {currentRoute !== 'character-detail' && (
          <Navbar
            currentRoute={currentRoute}
            onRouteChange={handleRouteChange}
            credits={credits}
            unreadNotificationsCount={notifications.filter((n) => !n.read).length}
            onOpenPromoModal={() => setIsPromoModalOpen(true)}
            onOpenNotificationsModal={() => setIsNotificationsModalOpen(true)}
          />
        )}

        {/* Main Content Viewport */}
        <main
          className={
            currentRoute === 'character-detail'
              ? 'flex-1 w-full h-screen p-0 m-0 overflow-hidden flex flex-col'
              : 'flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12'
          }
        >
          {currentRoute === 'home' && (
            <HomeScreen
              onRouteChange={handleRouteChange}
              onSelectCharacter={setSelectedCharacterId}
              onSelectTemplate={setSelectedTemplateId}
            />
          )}

          {currentRoute === 'create' && (
            <CreateScreen
              onRouteChange={handleRouteChange}
              preselectedTemplateId={selectedTemplateId}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
            />
          )}

          {currentRoute === 'templates' && (
            <TemplatesScreen
              onRouteChange={handleRouteChange}
              onSelectTemplate={(id) => {
                setSelectedTemplateId(id);
                handleRouteChange('create');
              }}
            />
          )}

          {currentRoute === 'characters' && (
            <CharactersScreen
              onRouteChange={handleRouteChange}
              onSelectCharacter={setSelectedCharacterId}
              favorites={favorites}
              following={following}
              onToggleFavorite={handleToggleFavorite}
              onToggleFollow={handleToggleFollow}
            />
          )}

          {currentRoute === 'character-detail' && (
            <CharacterDetailScreen
              characterId={selectedCharacterId}
              onRouteChange={handleRouteChange}
              favorites={favorites}
              following={following}
              onToggleFavorite={handleToggleFavorite}
              onToggleFollow={handleToggleFollow}
            />
          )}

          {currentRoute === 'chats' && (
            <MyChatsScreen
              onRouteChange={handleRouteChange}
              onSelectCharacter={setSelectedCharacterId}
            />
          )}

          {currentRoute === 'favorites' && (
            <FavoritesScreen
              onRouteChange={handleRouteChange}
              favorites={favorites}
              onSelectCharacter={setSelectedCharacterId}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentRoute === 'followers' && (
            <FollowersScreen onRouteChange={handleRouteChange} />
          )}

          {currentRoute === 'following' && (
            <FollowingScreen
              onRouteChange={handleRouteChange}
              following={following}
              onSelectCharacter={setSelectedCharacterId}
              onToggleFollow={handleToggleFollow}
            />
          )}

          {currentRoute === 'profile' && (
            <ProfileScreen
              onRouteChange={handleRouteChange}
              credits={credits}
              favoritesCount={favorites.length}
              followingCount={following.length}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
            />
          )}

          {currentRoute === 'pricing' && (
            <PricingScreen
              onRouteChange={handleRouteChange}
              credits={credits}
            />
          )}

          {currentRoute === 'how-it-works' && (
            <HowItWorksScreen onRouteChange={handleRouteChange} />
          )}

          {currentRoute === 'support' && (
            <SupportScreen onRouteChange={handleRouteChange} />
          )}

          {currentRoute === 'faq' && (
            <FaqScreen onRouteChange={handleRouteChange} />
          )}

          {currentRoute === 'more' && (
            <MoreScreen
              onRouteChange={handleRouteChange}
              onOpenLanguageModal={() => setIsLangModalOpen(true)}
              onOpenInternalTestModal={() => setIsInternalTestModalOpen(true)}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
            />
          )}

          {currentRoute === 'privacy' && (
            <PrivacyScreen onRouteChange={handleRouteChange} />
          )}

          {currentRoute === 'terms' && (
            <TermsScreen onRouteChange={handleRouteChange} />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (hidden on full-screen WhatsApp chat) */}
        {currentRoute !== 'character-detail' && (
          <BottomNav
            currentRoute={currentRoute}
            onRouteChange={handleRouteChange}
          />
        )}

        {/* First-time Language Modal */}
        <LanguageModal
          isOpen={isLangModalOpen}
          onClose={() => setIsLangModalOpen(false)}
        />

        {/* Internal Developer Testing Modal */}
        <InternalTestModal
          isOpen={isInternalTestModalOpen}
          onClose={() => setIsInternalTestModalOpen(false)}
          onAccessGranted={handleInternalTestAccessGranted}
        />

        {/* Secret Admin & VIP Promo Code Modal */}
        <PromoCodeModal
          isOpen={isPromoModalOpen}
          onClose={() => setIsPromoModalOpen(false)}
          onSuccess={(newTotal) => setCredits(newTotal)}
        />

        {/* Real-time Notifications Center Modal */}
        <NotificationsModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
          onRouteChange={handleRouteChange}
          notifications={notifications}
          onNotificationsChange={(updated) => setNotifications(updated)}
        />
      </div>
    </LanguageContext.Provider>
  );
}
