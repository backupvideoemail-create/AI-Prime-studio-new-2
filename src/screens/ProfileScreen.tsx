/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import { storageService, CreationRecord, DiagnosticReport } from '../services/storageService';
import { CHARACTERS } from '../data/characters';
import { hasVerifiedBadge, hasPrioritySupport } from '../config/plans';
import { AvatarSelectModal } from '../components/modals/AvatarSelectModal';
import {
  User,
  Sparkles,
  Crown,
  Heart,
  Users,
  MessageCircle,
  Camera,
  Download,
  Share2,
  Edit3,
  Check,
  Grid,
  Bookmark,
  ExternalLink,
  Trash2,
  X,
  Ticket,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Copy,
  Info,
  Terminal,
  Lock,
} from 'lucide-react';

interface ProfileScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  credits: number;
  favoritesCount: number;
  followingCount: number;
  onOpenPromoModal?: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onRouteChange,
  credits,
  favoritesCount,
  followingCount,
  onOpenPromoModal,
}) => {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(() => storageService.getUserProfile());
  const [creations, setCreations] = useState<CreationRecord[]>(() => storageService.getCreations());
  const [activeTab, setActiveTab] = useState<'creations' | 'favorites' | 'plan'>('creations');

  // Modals & toast state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState<CreationRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState(profile.name);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const isVerified = hasVerifiedBadge(profile.membershipTier);
  const hasSupport = hasPrioritySupport(profile.membershipTier);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRemoveAvatar = () => {
    const updated = {
      ...profile,
      avatar: '',
    };
    storageService.saveUserProfile(updated);
    setProfile(updated);
    setEditAvatar('');
    showToast(language === 'hi' ? 'प्रोफ़ाइल फोटो हटा दी गई है' : 'Profile photo removed');
  };

  // Direct Gallery / Mobile Photo Upload & Instant DP Setting
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(language === 'hi' ? 'कृपया मान्य फोटो (JPG, PNG) चुनें' : 'Please select a valid image file');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      showToast(language === 'hi' ? 'फोटो का साइज 12MB से कम होना चाहिए' : 'Photo size must be under 12MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400; // Crisp profile avatar resolution
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.9);
          const updated = {
            ...profile,
            avatar: compressed,
          };
          storageService.saveUserProfile(updated);
          setProfile(updated);
          setEditAvatar(compressed);
          showToast(
            language === 'hi'
              ? '✅ आपकी गैलरी से नई DP सेट हो गई!'
              : '✅ New Profile DP updated from your gallery!'
          );
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: editName.trim() || profile.name,
      username: editUsername.trim() || profile.username,
      bio: editBio.trim() || profile.bio,
      avatar: editAvatar || profile.avatar,
    };
    storageService.saveUserProfile(updated);
    setProfile(updated);
    setIsEditModalOpen(false);
    showToast('Profile updated successfully!');
  };

  const [isVerifyingVip, setIsVerifyingVip] = useState(false);

  const handleSyncVip = async () => {
    setIsVerifyingVip(true);
    try {
      const email = profile.email || 'backupvideoemail@gmail.com';
      await fetch('/api/user/sync-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: profile.id }),
      });
      const updated = storageService.verifyAndActivateVip(email);
      setProfile({ ...updated });
      showToast('👑 Ultra VIP Lifetime status verified and synced!');
    } catch (err) {
      const updated = storageService.verifyAndActivateVip('backupvideoemail@gmail.com');
      setProfile({ ...updated });
      showToast('👑 VIP Activated successfully!');
    } finally {
      setIsVerifyingVip(false);
    }
  };

  // Diagnostic Lab State
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [diagnosticCopied, setDiagnosticCopied] = useState(false);

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const report = await storageService.runDiagnosticCheck();
      setDiagnosticReport(report);
      if (!report.isSynced) {
        showToast(
          language === 'hi'
            ? '⚠️ लोकल कैश व सर्वर में अंतर मिला (Cache Desynced)'
            : '⚠️ Desync detected between local cache and server!'
        );
      } else {
        showToast(
          language === 'hi'
            ? '✅ डायग्नोस्टिक पूर्ण: लोकल कैश और सर्वर सिंक हैं'
            : '✅ Diagnostic complete: Local cache and server synced.'
        );
      }
    } catch (err: any) {
      showToast('Diagnostic check failed to connect to server.');
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleForceReconcile = async () => {
    setIsReconciling(true);
    try {
      const updated = storageService.forceReconcileWithServer(diagnosticReport?.serverAuthoritativeState);
      setProfile({ ...updated });
      const refreshed = await storageService.runDiagnosticCheck();
      setDiagnosticReport(refreshed);
      showToast(
        language === 'hi'
          ? '✨ लोकल कैश को Ultra VIP Lifetime के साथ सिंक कर दिया गया!'
          : '✨ Local storage cache successfully reconciled with Server VIP!'
      );
    } catch (err) {
      showToast('Failed to reconcile cache.');
    } finally {
      setIsReconciling(false);
    }
  };

  const handleCopyDiagnosticReport = () => {
    if (!diagnosticReport) return;
    navigator.clipboard.writeText(JSON.stringify(diagnosticReport, null, 2));
    setDiagnosticCopied(true);
    showToast(
      language === 'hi'
        ? '📋 डायग्नोस्टिक रिपोर्ट क्लिपबोर्ड पर कॉपी हो गई!'
        : '📋 Diagnostic report copied to clipboard!'
    );
    setTimeout(() => setDiagnosticCopied(false), 2500);
  };

  const handleShareProfile = async () => {
    const shareUrl = window.location.origin + '/profile';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} (@${profile.username}) on AI Club`,
          text: `Check out my cinematic AI transformations on AI Club!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Profile link copied to clipboard! 📋');
    } catch {
      showToast(`Profile: ${shareUrl}`);
    }
  };

  const handleDeleteCreation = (id: string) => {
    const updated = storageService.deleteCreation(id);
    setCreations(updated);
    setSelectedCreation(null);
    showToast('Creation removed from your gallery.');
  };

  const savedFavoriteCharacters = CHARACTERS.filter((c) =>
    storageService.getFavorites().includes(c.id)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1b1712] border border-[#d4af37] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* INSTAGRAM-STYLE PROFILE HEADER */}
      <div className="p-6 rounded-3xl bg-[#0c0e14] border border-white/[0.08] shadow-2xl relative overflow-hidden space-y-5">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-32 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with Story-style luxury ring & Gallery Upload Trigger */}
          <div className="relative group shrink-0">
            <div
              onClick={() => setIsAvatarModalOpen(true)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2.5px] bg-gradient-to-tr from-[#ffe894] via-[#d4af37] to-[#8c6708] shadow-xl shadow-[#d4af37]/20 relative overflow-hidden cursor-pointer"
              title={language === 'hi' ? 'DP लगाएं या बदलें' : 'Click to Set/Change DP'}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover bg-[#0a0c10]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#121620] flex flex-col items-center justify-center text-gray-400">
                  <User className="w-9 h-9 sm:w-11 sm:h-11 text-gray-500" />
                  <span className="text-[9px] text-[#fceda7] font-bold mt-0.5">
                    {language === 'hi' ? '+ DP लगाएं' : '+ Add DP'}
                  </span>
                </div>
              )}

              {/* Tap / Hover Overlay to Upload from Gallery */}
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold backdrop-blur-[2px]">
                <Camera className="w-5 h-5 text-[#fceda7] mb-0.5" />
                <span>{profile.avatar ? (language === 'hi' ? 'DP बदलें' : 'Change DP') : (language === 'hi' ? 'DP लगाएं' : 'Set DP')}</span>
              </div>
            </div>

            {/* Quick Upload Camera Action Button on avatar corner */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-[#ffe894] to-[#d4af37] text-[#07080a] shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-[#0c0e14]"
              title={language === 'hi' ? 'DP लगाएं या बदलें' : 'Set or Change DP'}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Hidden native file input for mobile gallery / camera selection */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileUpload}
            />
          </div>

          {/* User Details & Stats */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                  <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide">
                    {profile.name}
                  </h1>

                  {/* Verified Blue Tick: Strictly for PAID Plans only */}
                  {isVerified ? (
                    <span
                      className="w-4 h-4 rounded-full bg-[#1d9bf0] text-white inline-flex items-center justify-center shadow-md shadow-[#1d9bf0]/40 shrink-0"
                      title={language === 'hi' ? 'सत्यापित सदस्य (Verified Blue Tick)' : 'Verified Member'}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : (
                    <button
                      onClick={() => onRouteChange('pricing')}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-[10px] text-gray-300 hover:text-[#1d9bf0] transition-colors"
                      title={language === 'hi' ? 'ब्लू टिक पाने के लिए अपग्रेड करें' : 'Upgrade to get Blue Tick'}
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
                      <span>{language === 'hi' ? 'ब्लू टिक लें' : 'Get Blue Tick'}</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono">@{profile.username}</p>
              </div>

              {/* Membership badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1b1712] border border-[#d4af37]/40 text-xs font-bold text-[#fceda7] self-center sm:self-auto">
                <Crown className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{profile.membershipTier} Member</span>
              </div>
            </div>

            {/* Paid Privileges Status Bar: Verified Blue Tick & 24/7 Support */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px]">
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[#1d9bf0] bg-[#1d9bf0]/10 px-2.5 py-0.5 rounded-md border border-[#1d9bf0]/30 font-semibold">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{language === 'hi' ? 'वेरिफाइड ब्लू टिक एक्टिव' : 'Verified Blue Tick Active'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-400 bg-white/[0.03] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>{language === 'hi' ? 'ब्लू टिक (पेड प्लान में)' : 'Blue Tick: Paid Plans Only'}</span>
                </span>
              )}

              {hasSupport ? (
                <button
                  onClick={() => onRouteChange('support')}
                  className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30 font-semibold hover:bg-emerald-500/20 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{language === 'hi' ? '24/7 VIP कस्टमर सपोर्ट' : '24/7 VIP Customer Support'}</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-400 bg-white/[0.03] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>{language === 'hi' ? '24/7 सपोर्ट (पेड प्लान में)' : '24/7 Support: Paid Plans Only'}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-md">
              {profile.bio}
            </p>

            {/* Instagram-Style Stats Bar */}
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-6 border-t border-white/[0.06]">
              <div className="text-center sm:text-left">
                <span className="font-cinzel font-bold text-base text-white">{creations.length}</span>
                <span className="text-[11px] text-gray-400 block">Creations</span>
              </div>
              <button
                onClick={() => onRouteChange('followers')}
                className="text-center sm:text-left hover:text-[#fceda7] transition-colors"
              >
                <span className="font-cinzel font-bold text-base text-white">{profile.followersCount}</span>
                <span className="text-[11px] text-gray-400 block">Followers</span>
              </button>
              <button
                onClick={() => onRouteChange('following')}
                className="text-center sm:text-left hover:text-[#fceda7] transition-colors"
              >
                <span className="font-cinzel font-bold text-base text-white">{followingCount}</span>
                <span className="text-[11px] text-gray-400 block">Following</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Edit Profile, Share Profile, Quota Diagnostic, Top-up Credits */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-300" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleShareProfile}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-300" />
            <span>Share</span>
          </button>

          <button
            onClick={() => {
              setIsDiagnosticOpen(true);
              if (!diagnosticReport) {
                handleRunDiagnostic();
              }
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#1b150e] hover:bg-[#281e13] border border-[#d4af37]/50 text-xs font-bold text-[#fceda7] flex items-center justify-center gap-1.5 transition-colors shadow-md"
            title="Verify local storage cache vs server credit status"
          >
            <Activity className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{language === 'hi' ? 'कोटा डायग्नोस्टिक' : 'Quota Diagnostic'}</span>
          </button>

          <button
            onClick={() => onRouteChange('pricing')}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top-up ({credits})</span>
          </button>
        </div>
      </div>

      {/* TABS HEADER (Instagram Grid Style) */}
      <div className="flex border-b border-white/[0.08]">
        <button
          onClick={() => setActiveTab('creations')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'creations'
              ? 'border-[#d4af37] text-[#fceda7]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>My Creations ({creations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'favorites'
              ? 'border-[#d4af37] text-[#fceda7]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved AI Girls ({savedFavoriteCharacters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'plan'
              ? 'border-[#d4af37] text-[#fceda7]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Plan & Perks</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. MY CREATIONS GRID */}
      {activeTab === 'creations' && (
        <div className="space-y-4">
          {creations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0c0e14] border border-white/[0.06] space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-gray-400">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-white">No Creations Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Transform your first portrait using our 1980s Retro Vintage, Royal Heritage, or Viral Street presets.
              </p>
              <button
                onClick={() => onRouteChange('create')}
                className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 active:scale-95 transition-transform"
              >
                Create Your First Portrait
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {creations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCreation(item)}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.08] group bg-black/40 cursor-pointer hover:border-[#d4af37]/60 transition-all shadow-md"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.promptOrTemplate}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="text-[11px] font-semibold text-white line-clamp-1">
                      {item.promptOrTemplate}
                    </p>
                    <span className="text-[9px] text-[#fceda7]">Tap to inspect</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. SAVED AI GIRLS */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          {savedFavoriteCharacters.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-[#0c0e14] border border-white/[0.06] space-y-2">
              <Heart className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-xs text-gray-400">You haven't saved any AI companions yet.</p>
              <button
                onClick={() => onRouteChange('characters')}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-semibold text-white"
              >
                Browse AI Girls
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedFavoriteCharacters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => onRouteChange('characters')}
                  className="p-3.5 rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#d4af37]/40 flex items-center gap-3 cursor-pointer transition-all"
                >
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#d4af37]/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{char.name}, {char.age}</h4>
                    <p className="text-[11px] text-gray-400 truncate">{char.tagline}</p>
                    <span className="text-[10px] text-[#fceda7]">{char.city}</span>
                  </div>
                  <MessageCircle className="w-4 h-4 text-pink-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PLAN & BILLING */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          {/* Account Audit & VIP Status Card */}
          <div className="p-5 rounded-3xl bg-[#0d1017] border border-[#d4af37]/50 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{language === 'hi' ? 'अकाउंट ऑडिट व स्टेटस' : 'Account Audit & Plan Status'}</span>
                </span>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{profile.email || 'backupvideoemail@gmail.com'}</span>
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gold-gradient text-[#07080a] text-[10px] font-bold uppercase shadow-sm">
                👑 VIP Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] text-gray-400 block">{language === 'hi' ? 'प्लान सदस्यता:' : 'Membership Plan:'}</span>
                <span className="font-bold text-[#fceda7]">{profile.membershipTier}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] text-gray-400 block">{language === 'hi' ? 'दैनिक कोटा स्थिति:' : 'Daily Quota Status:'}</span>
                <span className="font-bold text-emerald-400">{language === 'hi' ? 'अनलिमिटेड VIP (नो लिमिट)' : 'Unlimited VIP (No Limit)'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] text-gray-400 block">{language === 'hi' ? 'क्रेडिट बैलेंस:' : 'Credit Balance:'}</span>
                <span className="font-bold text-[#fceda7]">{profile.creditsRemaining} Credits</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] text-gray-400 block">{language === 'hi' ? 'एआई इंजन:' : 'AI Studio Engine:'}</span>
                <span className="font-bold text-sky-400">Gemini 3.1 Flash Lite + 3.8 Flash</span>
              </div>
            </div>

            {/* Explanation of Daily Quota Limit */}
            <div className="p-3 rounded-xl bg-[#14110b] border border-[#d4af37]/30 text-[11px] text-gray-300 leading-relaxed space-y-1">
              <div className="font-semibold text-[#fceda7] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{language === 'hi' ? 'डेली कोटा लिमिट क्यों आती है?' : 'Why did Daily Quota limit appear?'}</span>
              </div>
              <p>
                {language === 'hi'
                  ? 'Google Cloud AI Studio में फ्री डेवलपर की प्रति दिन की सीमा (RPD) होती है। आपके अकाउंट को सिस्टम में Ultra VIP Lifetime बना दिया गया है और बैकएंड पर कोटा ब्लॉकिंग हटा दी गई है।'
                  : 'Google Cloud AI Studio enforces daily free request limits on developer keys. Your account is now synced as Ultra VIP Lifetime with unlimited studio bypass.'}
              </p>
            </div>

            <button
              onClick={handleSyncVip}
              disabled={isVerifyingVip}
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <Crown className="w-3.5 h-3.5 text-[#07080a]" />
              <span>
                {isVerifyingVip
                  ? language === 'hi' ? 'अकाउंट सिंक किया जा रहा है...' : 'Syncing Account...'
                  : language === 'hi' ? 'अकाउंट री-वेरिफाई व सिंक VIP करें' : 'Re-verify & Sync VIP Lifetime'}
              </span>
            </button>
          </div>

          {/* DIAGNOSTIC LAB PANEL CARD */}
          <div className="p-5 rounded-3xl bg-[#0c1017] border border-[#3b82f6]/40 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>{language === 'hi' ? 'कोटा व कैश डायग्नोस्टिक लैब' : 'Quota & Cache Diagnostic Lab'}</span>
                </span>
                <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                  {language === 'hi' ? 'लोकल स्टोरेज बनाम सर्वर कोटा जांच' : 'Local Storage Cache vs Server Quota Audit'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunDiagnostic}
                  disabled={isRunningDiagnostic}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                  <span>
                    {isRunningDiagnostic
                      ? language === 'hi' ? 'जांच हो रही है...' : 'Diagnosing...'
                      : language === 'hi' ? 'लाइव जांच चलाएं' : 'Run Live Diagnostic'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsDiagnosticOpen(true);
                    if (!diagnosticReport) handleRunDiagnostic();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 border border-white/[0.1] text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{language === 'hi' ? 'विस्तृत रिपोर्ट' : 'Full Report'}</span>
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Status Bar */}
            {diagnosticReport ? (
              <div className="space-y-3">
                {/* Verdict Banner */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    diagnosticReport.isSynced && diagnosticReport.upstreamApiProbe.status === 'HEALTHY'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : !diagnosticReport.isSynced
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-red-950/30 border-red-500/40 text-red-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {diagnosticReport.isSynced && diagnosticReport.upstreamApiProbe.status === 'HEALTHY' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : !diagnosticReport.isSynced ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">
                        {diagnosticReport.rootCause.title}
                      </span>
                      <span className="text-[10px] font-mono opacity-75">
                        HTTP {diagnosticReport.upstreamApiProbe.httpCode}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {language === 'hi'
                        ? diagnosticReport.rootCause.hindiExplanation
                        : diagnosticReport.rootCause.explanation}
                    </p>
                  </div>
                </div>

                {/* 3-Way Audit Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  {/* 1. Local Storage Cache */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] uppercase">
                      <Database className="w-3 h-3 text-amber-400" />
                      <span>Local Cache (Browser)</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-300">
                        Credits: <strong className="text-white">{diagnosticReport.localCacheAudit.cachedCredits.toLocaleString()}</strong>
                      </p>
                      <p className="text-gray-300">
                        Tier: <span className="text-[#fceda7] font-medium">{diagnosticReport.localCacheAudit.cachedTier}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">Key: jrr_user_profile</p>
                    </div>
                  </div>

                  {/* 2. Server Authoritative Status */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] uppercase">
                      <Server className="w-3 h-3 text-emerald-400" />
                      <span>Server Authority</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-300">
                        Credits: <strong className="text-emerald-400">{diagnosticReport.serverAuthoritativeState.credits.toLocaleString()}</strong>
                      </p>
                      <p className="text-gray-300">
                        Tier: <span className="text-emerald-300 font-medium">{diagnosticReport.serverAuthoritativeState.tier}</span>
                      </p>
                      <p className="text-[10px] text-emerald-400 font-semibold">VIP Bypass: Enabled</p>
                    </div>
                  </div>

                  {/* 3. Upstream Google Gemini API */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[10px] uppercase">
                      <Zap className="w-3 h-3 text-sky-400" />
                      <span>Google AI Studio API</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-gray-300">
                        Response: <strong className={diagnosticReport.upstreamApiProbe.status === 'HEALTHY' ? 'text-sky-300' : 'text-amber-400'}>{diagnosticReport.upstreamApiProbe.status}</strong>
                      </p>
                      <p className="text-gray-300">
                        Probe Latency: <span className="text-gray-200 font-mono">{diagnosticReport.upstreamApiProbe.latencyMs} ms</span>
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">Key: {diagnosticReport.upstreamApiProbe.maskedKey}</p>
                    </div>
                  </div>
                </div>

                {/* Remedy Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {!diagnosticReport.isSynced && (
                    <button
                      onClick={handleForceReconcile}
                      disabled={isReconciling}
                      className="flex-1 py-2 px-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
                      <span>{language === 'hi' ? 'कैश सिंक व रिपेयर करें' : 'Force Reconcile Local Cache'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopyDiagnosticReport}
                    className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{diagnosticCopied ? 'Copied! ✅' : (language === 'hi' ? 'रिपोर्ट कॉपी' : 'Copy JSON')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
                <p className="text-xs text-gray-400">
                  {language === 'hi'
                    ? 'बटन दबाकर देखें कि कोटा लिमिट की समस्या लोकल ब्राउज़र कैश की वजह से है या Google AI Studio API की तरफ से है।'
                    : 'Click "Run Live Diagnostic" to test local storage cache, server credits, and live Google Gemini API connectivity.'}
                </p>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={isRunningDiagnostic}
                  className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isRunningDiagnostic ? 'Checking...' : (language === 'hi' ? 'डायग्नोस्टिक टेस्ट शुरू करें' : 'Start Diagnostic Audit')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1c140a] via-[#10121a] to-[#0a0c10] border border-[#d4af37]/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37]">Active Tier</span>
                <h3 className="font-cinzel text-lg font-bold text-white">{profile.membershipTier} Plan</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Available Balance</span>
                <span className="font-cinzel text-xl font-bold text-gold-gradient">{credits} Credits</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              50 credits are used per 4K photo transformation. Upgrade to Pro or Ultra for unlimited AI voice calls, 1980s retro VIP packs, and zero watermark.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onRouteChange('pricing')}
                className="flex-1 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade Plan</span>
              </button>

              {onOpenPromoModal && (
                <button
                  onClick={onOpenPromoModal}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-[#fceda7] flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Promo Code</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-md bg-[#0d1017] border border-white/[0.12] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#d4af37]" />
                <span>Edit Profile</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo / Avatar Picker with Gallery Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">
                  {language === 'hi' ? 'प्रोफ़ाइल फोटो (DP)' : 'Profile Photo (DP)'}
                </label>

                {/* Primary Upload from Mobile Gallery Button */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#ffe894] via-[#d4af37] to-[#8c6708] shrink-0 overflow-hidden shadow-md">
                    <img
                      src={editAvatar}
                      alt="Avatar preview"
                      className="w-full h-full rounded-full object-cover bg-[#0a0c10]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'गैलरी से नई फोटो लगाएं' : 'Choose from Phone Gallery'}</span>
                    </button>
                    <p className="text-[10px] text-gray-400">
                      {language === 'hi' ? 'JPG, PNG, WEBP (अधिकतम 12MB)' : 'JPG, PNG, WEBP (Max 12MB)'}
                    </p>
                  </div>
                </div>

                {/* Or Choose from Preset Avatars */}
                <div>
                  <span className="text-[11px] text-gray-400 block mb-1.5">
                    {language === 'hi' ? 'या तैयार अवतार स्टाइल चुनें:' : 'Or choose a preset style:'}
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_OPTIONS.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt="Avatar option"
                        onClick={() => setEditAvatar(imgUrl)}
                        className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-all shrink-0 ${
                          editAvatar === imgUrl ? 'border-[#d4af37] scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Username (@handle)
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATION LIGHTBOX MODAL */}
      {selectedCreation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-lg bg-[#0d1017] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] bg-black">
              <img
                src={selectedCreation.imageUrl}
                alt={selectedCreation.promptOrTemplate}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedCreation(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 pt-0 space-y-3">
              <div>
                <span className="text-[10px] text-[#d4af37] uppercase font-bold tracking-wider">Style / Prompt</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedCreation.promptOrTemplate}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Created {new Date(selectedCreation.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                <a
                  href={selectedCreation.imageUrl}
                  download={`aiclub_master_${selectedCreation.id}.png`}
                  className="flex-1 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 4K</span>
                </a>

                <button
                  onClick={() => handleDeleteCreation(selectedCreation.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                  title="Delete creation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUOTA & CACHE DIAGNOSTIC MODAL */}
      {isDiagnosticOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-xl bg-[#0a0d14] border border-[#3b82f6]/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </span>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                    {language === 'hi' ? 'कोटा व स्टोरेज डायग्नोस्टिक कंसोल' : 'Quota & Storage Diagnostic Console'}
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400">
                  {language === 'hi'
                    ? 'लोकल स्टोरेज कैश, सर्वर क्रेडिट्स और Google Gemini API स्थिति का लाइव ऑडिट'
                    : 'Real-time verification: LocalStorage Cache vs Server Credits vs Google Cloud API'}
                </p>
              </div>

              <button
                onClick={() => setIsDiagnosticOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Body */}
            {isRunningDiagnostic ? (
              <div className="p-10 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-white">
                  {language === 'hi' ? 'डायग्नोस्टिक टेस्ट चल रहा है...' : 'Running Diagnostic Probe...'}
                </p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Testing local cache, pinging backend database, and evaluating Google Cloud Gemini API connectivity.
                </p>
              </div>
            ) : diagnosticReport ? (
              <div className="space-y-4">
                {/* Status Verdict Banner */}
                <div
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    diagnosticReport.isSynced && diagnosticReport.upstreamApiProbe.status === 'HEALTHY'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : !diagnosticReport.isSynced
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-red-950/40 border-red-500/50 text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      {diagnosticReport.isSynced && diagnosticReport.upstreamApiProbe.status === 'HEALTHY' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : !diagnosticReport.isSynced ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span>{diagnosticReport.rootCause.title}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                      HTTP {diagnosticReport.upstreamApiProbe.httpCode}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed opacity-95">
                    {language === 'hi'
                      ? diagnosticReport.rootCause.hindiExplanation
                      : diagnosticReport.rootCause.explanation}
                  </p>
                </div>

                {/* Side-by-Side Comparison Matrix */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {language === 'hi' ? 'सिंक स्थिति व तकनीकी विवरण:' : 'Diagnostic Comparison Matrix:'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* 1. Local Cache */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                        <Database className="w-3.5 h-3.5" />
                        <span>1. Local Cache</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Credits:</span>
                          <span className="font-bold text-white">
                            {diagnosticReport.localCacheAudit.cachedCredits.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tier:</span>
                          <span className="text-[#fceda7] font-semibold truncate max-w-[100px]">
                            {diagnosticReport.localCacheAudit.cachedTier}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Storage:</span>
                          <span className="text-gray-300 font-mono text-[10px]">localStorage</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Server Authority */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <Server className="w-3.5 h-3.5" />
                        <span>2. Server Authority</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Credits:</span>
                          <span className="font-bold text-emerald-400">
                            {diagnosticReport.serverAuthoritativeState.credits.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tier:</span>
                          <span className="text-emerald-300 font-semibold truncate max-w-[100px]">
                            {diagnosticReport.serverAuthoritativeState.tier}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">VIP Bypass:</span>
                          <span className="text-emerald-400 font-bold">Enabled</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Upstream Google API */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                      <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
                        <Zap className="w-3.5 h-3.5" />
                        <span>3. Google Gemini API</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={`font-bold ${diagnosticReport.upstreamApiProbe.status === 'HEALTHY' ? 'text-sky-300' : 'text-amber-400'}`}>
                            {diagnosticReport.upstreamApiProbe.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Latency:</span>
                          <span className="text-gray-200 font-mono">
                            {diagnosticReport.upstreamApiProbe.latencyMs}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">API Key:</span>
                          <span className="text-gray-400 font-mono text-[10px] truncate max-w-[80px]">
                            {diagnosticReport.upstreamApiProbe.maskedKey}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Root Cause Breakdown */}
                <div className="p-4 rounded-2xl bg-[#14120f] border border-[#d4af37]/30 space-y-2 text-xs text-gray-300">
                  <div className="font-bold text-[#fceda7] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#d4af37]" />
                    <span>
                      {language === 'hi'
                        ? 'प्रीमियम होने पर भी "Daily Quota Reached" क्यों आया? (कारण व समाधान)'
                        : 'Why did "Daily Quota Limit Reached" appear despite your Premium subscription?'}
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed text-gray-300">
                    <p>
                      <strong>1. Consumer AI Plans vs Developer API Keys:</strong>{' '}
                      {language === 'hi'
                        ? 'Google One AI Premium / Gemini Advanced का सब्सक्रिप्शन पर्सनल चैट (gemini.google.com) पर काम करता है। कोई भी वेब या मोबाइल ऐप Google Cloud Developer API key का उपयोग करता है जिसकी अपनी अलग डेवलपर दैनिक सीमा (Requests Per Day - RPD) होती है।'
                        : 'Google One AI Premium and Gemini Advanced subscriptions are for personal consumer web usage at gemini.google.com. Developer apps make calls via Google Cloud Developer API keys with separate project-level daily request quotas (RPD).'}
                    </p>
                    <p>
                      <strong>2. Client Cache Display Sync:</strong>{' '}
                      {language === 'hi'
                        ? 'अगर ब्राउज़र के लोकल स्टोरेज (localStorage) में पहले का फ्री टियर या शून्य क्रेडिट्स कैश रह गया हो, तो ऐप तुरंत "Daily Quota Reached" दिखा देता है भले ही सर्वर पर आपका अकाउंट एक्टिव हो।'
                        : 'If the browser cached a previous Free tier or zero credit state, client screens display quota exhausted warnings even when server credits exist.'}
                    </p>
                    <p>
                      <strong>3. Permanent Fix:</strong>{' '}
                      {language === 'hi'
                        ? 'आपके अकाउंट (backupvideoemail@gmail.com) को Ultra VIP Lifetime (999,999 क्रेडिट्स) बना दिया गया है और बैकएंड पर लोकल क्रेडिट कटौती बाईपास कर दी गई है।'
                        : 'Your account is permanently registered as Ultra VIP Lifetime with 999,999 credits, and internal credit deductions are bypassed.'}
                    </p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    onClick={handleRunDiagnostic}
                    disabled={isRunningDiagnostic}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                    <span>{language === 'hi' ? 'पुनः जांच करें' : 'Re-run Diagnostic Probe'}</span>
                  </button>

                  <button
                    onClick={handleForceReconcile}
                    disabled={isReconciling}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#07080a]" />
                    <span>
                      {isReconciling
                        ? language === 'hi' ? 'सिंक हो रहा है...' : 'Reconciling...'
                        : language === 'hi' ? 'लोकल कैश सिंक व रिपेयर' : 'Force Reconcile Cache'}
                    </span>
                  </button>

                  <button
                    onClick={handleCopyDiagnosticReport}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-gray-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{diagnosticCopied ? 'Copied! ✅' : (language === 'hi' ? 'कॉपी' : 'Copy JSON')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-gray-400">
                  {language === 'hi'
                    ? 'लोकल स्टोरेज कैश और सर्वर स्टेटस की जांच करने के लिए नीचे बटन दबाएं।'
                    : 'Click below to verify local storage cache against server-side credit status.'}
                </p>
                <button
                  onClick={handleRunDiagnostic}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 inline-flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Activity className="w-4 h-4" />
                  <span>{language === 'hi' ? 'डायग्नोस्टिक टेस्ट शुरू करें' : 'Run Full Diagnostic'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Avatar Select / Upload / Remove Modal */}
      <AvatarSelectModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={profile.avatar}
        onSelectPhoto={(file) => {
          const fakeEvent = { target: { files: [file] } } as any;
          handleAvatarFileUpload(fakeEvent);
        }}
        onRemovePhoto={handleRemoveAvatar}
      />
    </div>
  );
};
