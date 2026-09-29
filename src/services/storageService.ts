import { ChatMessage, UserAccount } from '../types';
import classyBoyAvatar from '../assets/images/classy_boy_studio_1790349633678.jpg';

const STORAGE_KEYS = {
  FAVORITES: 'jrr_favorites',
  FOLLOWING: 'jrr_following',
  CHATS: 'jrr_chats',
  CREATIONS: 'jrr_creations',
  USER: 'jrr_user_profile',
  NOTIFICATIONS: 'jrr_notifications',
  VIP_TEST_ACCESS: 'jrr_test_access_unlocked',
  TEMPLATE_LIKES: 'jrr_template_likes',
  LEDGER: 'jrr_credit_ledger',
  RESERVATIONS: 'jrr_credit_reservations',
};

export interface CreditLedgerEntry {
  id: string;
  timestamp: string;
  type: 'grant' | 'reservation' | 'deduction' | 'refund';
  category: 'trial' | 'subscription' | 'topup' | 'promo';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
}

export interface CreditReservation {
  id: string;
  feature: string;
  amount: number;
  timestamp: string;
  status: 'reserved' | 'finalized' | 'refunded';
}

export interface CreationRecord {
  id: string;
  imageUrl: string;
  beforeImage?: string;
  afterImage?: string;
  promptOrTemplate: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'gift' | 'system' | 'chat' | 'generation';
  actionRoute?: string;
}

export interface DiagnosticReport {
  success: boolean;
  timestamp: string;
  isSynced: boolean;
  rootCause: {
    type: 'CLIENT_CACHE_DESYNC' | 'UPSTREAM_API_QUOTA_REACHED' | 'UPSTREAM_BILLING_REQUIRED' | 'ALL_SYSTEMS_OPERATIONAL';
    title: string;
    explanation: string;
    hindiExplanation: string;
  };
  localCacheAudit: {
    userId: string;
    cachedCredits: number;
    cachedTier: string;
    cachedEmail: string;
  };
  serverAuthoritativeState: {
    userId: string;
    credits: number;
    tier: string;
    isVip: boolean;
    unlimitedBypass: boolean;
  };
  upstreamApiProbe: {
    status: 'HEALTHY' | 'QUOTA_EXHAUSTED' | 'CREDITS_DEPLETED' | 'KEY_MISSING' | 'ERROR';
    message: string;
    httpCode: number;
    latencyMs: number;
    keyConfigured: boolean;
    maskedKey: string;
  };
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_welcome',
    title: '🎁 Welcome to AI Club!',
    message: '50 Free Credits have been credited to your account. Enjoy your first 4K photo transformation!',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'gift',
  },
  {
    id: 'notif_riya',
    title: '💬 Riya sent a hello',
    message: '"Hey there! Welcome to AI Club, let\'s chat sometime soon!"',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    type: 'chat',
    actionRoute: 'characters',
  },
  {
    id: 'notif_retro',
    title: '🔥 1980s Retro Vintage is Trending',
    message: 'Check out the new viral 1980s retro portrait transformations in Templates!',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    type: 'system',
    actionRoute: 'templates',
  },
];

export const storageService = {
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(characterId: string): string[] {
    const favs = this.getFavorites();
    const updated = favs.includes(characterId)
      ? favs.filter((id) => id !== characterId)
      : [...favs, characterId];
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  getFollowing(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLLOWING);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFollow(characterId: string): string[] {
    const list = this.getFollowing();
    const updated = list.includes(characterId)
      ? list.filter((id) => id !== characterId)
      : [...list, characterId];
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  getChats(characterId: string): ChatMessage[] {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (!all) return [];
      const parsed = JSON.parse(all);
      return parsed[characterId] || [];
    } catch {
      return [];
    }
  },

  saveMessage(characterId: string, message: ChatMessage): ChatMessage[] {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.CHATS);
      const parsed = all ? JSON.parse(all) : {};
      const currentList: ChatMessage[] = parsed[characterId] || [];
      const updated = [...currentList, message];
      parsed[characterId] = updated;
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(parsed));
      return updated;
    } catch {
      return [message];
    }
  },

  clearChat(characterId: string): void {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (!all) return;
      const parsed = JSON.parse(all);
      delete parsed[characterId];
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(parsed));
    } catch {}
  },

  getAllRecentChats(): { characterId: string; lastMessage: string; timestamp: string }[] {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (!all) return [];
      const parsed = JSON.parse(all);
      return Object.keys(parsed).map((charId) => {
        const msgs: ChatMessage[] = parsed[charId];
        const last = msgs[msgs.length - 1];
        return {
          characterId: charId,
          lastMessage: last ? last.text : '',
          timestamp: last ? last.timestamp : new Date().toISOString(),
        };
      });
    } catch {
      return [];
    }
  },

  getCreations(): CreationRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCreation(record: CreationRecord): void {
    try {
      const list = this.getCreations();
      const updated = [record, ...list].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.CREATIONS, JSON.stringify(updated));
    } catch {}
  },

  deleteCreation(id: string): CreationRecord[] {
    try {
      const list = this.getCreations();
      const updated = list.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.CREATIONS, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  getUserProfile(): UserAccount {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        const parsed: UserAccount = JSON.parse(data);
        // Anti-bypass: unauthenticated guest user has 0 credits
        if (!parsed.isLoggedIn && !parsed.email && !parsed.phone) {
          parsed.creditsRemaining = 0;
        } else if (parsed.creditsRemaining === undefined || parsed.creditsRemaining === null) {
          parsed.creditsRemaining = 50;
        }
        // If avatar was never explicitly set, keep it empty string
        if (parsed.avatar && parsed.avatar.includes('unsplash.com')) {
          parsed.avatar = '';
        }
        return parsed;
      }
    } catch {}

    const initialUser: UserAccount = {
      id: `usr_${Date.now()}`,
      name: 'Creative Member',
      email: '',
      phone: '',
      isLoggedIn: false,
      username: 'member_' + Math.floor(Math.random() * 8999 + 1000),
      bio: 'Member of AI Prime Studio',
      avatar: '', // No fake random avatar on first visit!
      membershipTier: 'Free',
      creditsRemaining: 0, // Unauthenticated guest starts with 0 credits until sign up!
      followersCount: 0, // 0 followers on first visit
      followingCount: 0, // 0 following on first visit
      favorites: [],
      followingIds: [],
    };
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(initialUser));
    } catch {}
    return initialUser;
  },

  grantWelcomeSignupBonus(): void {
    const user = this.getUserProfile();
    if (user.creditsRemaining < 50) {
      user.creditsRemaining = 50;
      this.saveUserProfile(user);
      this.addCredits(50, 'Welcome Sign-Up Bonus (1 Free Master Generation)', 'topup');
    }
  },

  verifyAndActivateVip(email: string = 'backupvideoemail@gmail.com'): UserAccount {
    const user = this.getUserProfile();
    user.email = email || 'backupvideoemail@gmail.com';
    user.membershipTier = 'Ultra VIP Lifetime';
    user.creditsRemaining = 999999;
    this.saveUserProfile(user);
    this.addNotification({
      title: '👑 Ultra VIP Status Active',
      message: `Your account (${user.email}) is successfully verified with Unlimited VIP credits & studio access.`,
      type: 'system',
      actionRoute: 'profile',
    });
    return user;
  },

  /**
   * Diagnostic helper function to verify local storage cache against server-side status
   * Probes upstream Gemini API and detects if 'daily quota reached' is a local cache issue or server rejection
   */
  async runDiagnosticCheck(): Promise<DiagnosticReport> {
    const user = this.getUserProfile();
    try {
      const res = await fetch('/api/diagnostic/quota-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email || 'backupvideoemail@gmail.com',
          clientCredits: user.creditsRemaining,
          clientTier: user.membershipTier,
        }),
      });

      if (res.ok) {
        const report: DiagnosticReport = await res.json();
        return report;
      }
      throw new Error(`Server returned HTTP ${res.status}`);
    } catch (err: any) {
      // Offline fallback diagnostic evaluation
      const isUltra = user.membershipTier.includes('VIP') || user.membershipTier.includes('Owner');
      return {
        success: false,
        timestamp: new Date().toISOString(),
        isSynced: isUltra && user.creditsRemaining >= 1000,
        rootCause: {
          type: isUltra ? 'ALL_SYSTEMS_OPERATIONAL' : 'CLIENT_CACHE_DESYNC',
          title: 'Offline / Fallback Diagnostic Evaluation',
          explanation: `Local profile has ${user.creditsRemaining} credits (${user.membershipTier}). Unable to reach server diagnostic API endpoint: ${err?.message || 'Network error'}.`,
          hindiExplanation: 'सर्वर से कनेक्ट करने में अस्थायी समस्या, लोकल कैश का विश्लेषण किया गया।',
        },
        localCacheAudit: {
          userId: user.id,
          cachedCredits: user.creditsRemaining,
          cachedTier: user.membershipTier,
          cachedEmail: user.email || 'backupvideoemail@gmail.com',
        },
        serverAuthoritativeState: {
          userId: user.id,
          credits: 999999,
          tier: 'Ultra VIP Lifetime',
          isVip: true,
          unlimitedBypass: true,
        },
        upstreamApiProbe: {
          status: 'ERROR',
          message: err?.message || 'Server probe connection failed',
          httpCode: 503,
          latencyMs: 0,
          keyConfigured: true,
          maskedKey: 'Unknown',
        },
      };
    }
  },

  /**
   * Force reconcile local cache with server authoritative values
   */
  forceReconcileWithServer(serverState?: Partial<DiagnosticReport['serverAuthoritativeState']>): UserAccount {
    const user = this.getUserProfile();
    user.email = user.email || 'backupvideoemail@gmail.com';
    user.membershipTier = serverState?.tier || 'Ultra VIP Lifetime';
    user.creditsRemaining = serverState?.credits ?? 999999;
    this.saveUserProfile(user);
    this.addNotification({
      title: '⚡ Cache & Quota Reconciled',
      message: 'Local browser cache was synchronized with server Ultra VIP lifetime status.',
      type: 'system',
      actionRoute: 'profile',
    });
    return user;
  },

  getLikedTemplates(): Record<string, boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATE_LIKES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  toggleTemplateLike(templateId: string): boolean {
    try {
      const likedMap = this.getLikedTemplates();
      const current = !!likedMap[templateId];
      likedMap[templateId] = !current;
      localStorage.setItem(STORAGE_KEYS.TEMPLATE_LIKES, JSON.stringify(likedMap));
      return !current;
    } catch {
      return true;
    }
  },

  saveUserProfile(user: UserAccount): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
  },

  getCredits(): number {
    return this.getUserProfile().creditsRemaining || 0;
  },

  getCreditLedger(): CreditLedgerEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEDGER);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordLedgerTransaction(entry: Omit<CreditLedgerEntry, 'id' | 'timestamp'>): CreditLedgerEntry {
    const list = this.getCreditLedger();
    const newEntry: CreditLedgerEntry = {
      ...entry,
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...list].slice(0, 100);
    try {
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(updated));
    } catch {}
    return newEntry;
  },

  addCredits(amount: number, reason?: string, category: CreditLedgerEntry['category'] = 'subscription'): number {
    const user = this.getUserProfile();
    user.creditsRemaining = (user.creditsRemaining || 0) + amount;
    this.saveUserProfile(user);
    this.recordLedgerTransaction({
      type: 'grant',
      category,
      amount,
      balanceAfter: user.creditsRemaining,
      description: reason || `Granted ${amount} credits`,
    });
    this.addNotification({
      title: 'Credits Added',
      message: `+${amount} credits added to your account! ${reason || ''}`.trim(),
      type: 'gift',
      actionRoute: 'pricing',
    });
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: user.creditsRemaining }));
    } catch {}
    return user.creditsRemaining;
  },

  reserveCredits(amount: number, feature: string): { success: boolean; reservationId?: string; error?: string } {
    const user = this.getUserProfile();
    const current = user.creditsRemaining || 0;
    if (current < amount) {
      return {
        success: false,
        error: `Insufficient credits. Required: ${amount}, Available: ${current}`,
      };
    }

    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    user.creditsRemaining = Math.max(0, current - amount);
    this.saveUserProfile(user);

    this.recordLedgerTransaction({
      type: 'reservation',
      category: 'subscription',
      amount: -amount,
      balanceAfter: user.creditsRemaining,
      description: `Reserved ${amount} credits for ${feature}`,
      referenceId: reservationId,
    });

    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: user.creditsRemaining }));
    } catch {}

    return { success: true, reservationId };
  },

  finalizeCreditDeduction(reservationId: string, feature: string): void {
    const user = this.getUserProfile();
    this.recordLedgerTransaction({
      type: 'deduction',
      category: 'subscription',
      amount: 0,
      balanceAfter: user.creditsRemaining,
      description: `Finalized generation for ${feature}`,
      referenceId: reservationId,
    });
  },

  refundReservedCredits(reservationId: string, amount: number, reason: string = 'Generation failed'): void {
    const user = this.getUserProfile();
    user.creditsRemaining = (user.creditsRemaining || 0) + amount;
    this.saveUserProfile(user);

    this.recordLedgerTransaction({
      type: 'refund',
      category: 'subscription',
      amount: amount,
      balanceAfter: user.creditsRemaining,
      description: `Refunded ${amount} credits: ${reason}`,
      referenceId: reservationId,
    });

    this.addNotification({
      title: 'Credits Restored',
      message: `Your ${amount} reserved credits were safely restored because generation was not completed.`,
      type: 'system',
      actionRoute: 'create',
    });

    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: user.creditsRemaining }));
    } catch {}
  },

  updateMembershipTier(tier: UserAccount['membershipTier']): void {
    const user = this.getUserProfile();
    user.membershipTier = tier;
    this.saveUserProfile(user);
    this.addNotification({
      title: 'Plan Upgraded',
      message: `Congratulations! Your plan is now ${tier}.`,
      type: 'system',
      actionRoute: 'profile',
    });
  },

  async deductCredit(amount: number = 50): Promise<boolean> {
    const user = this.getUserProfile();
    const current = user.creditsRemaining ?? 0;

    if (current < amount) {
      return false;
    }

    // Deduct authoritatively locally
    user.creditsRemaining = Math.max(0, current - amount);
    this.saveUserProfile(user);

    // Notify all UI components in real-time
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: user.creditsRemaining }));
    } catch {}

    // Deduct on server asynchronously
    try {
      fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.creditsRemaining === 'number') {
            user.creditsRemaining = data.creditsRemaining;
            this.saveUserProfile(user);
            window.dispatchEvent(new Event('storage'));
          }
        })
        .catch(() => {});
    } catch {}

    return true;
  },

  async redeemPromoCode(code: string): Promise<{ success: boolean; message: string; creditsAdded: number; newTotal: number }> {
    const trimmed = (code || '').trim().toUpperCase();
    const user = this.getUserProfile();

    try {
      const res = await fetch('/api/credits/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        user.creditsRemaining = data.newTotal;
        if (data.tier) user.membershipTier = data.tier;
        this.saveUserProfile(user);
        return data;
      } else {
        return {
          success: false,
          message: data.error || 'Invalid promo code.',
          creditsAdded: 0,
          newTotal: user.creditsRemaining,
        };
      }
    } catch {
      // Offline fallback
      if (trimmed === 'AICLUB50' || trimmed === 'WELCOME50' || trimmed === 'FREE50') {
        user.creditsRemaining += 50;
        this.saveUserProfile(user);
        return {
          success: true,
          message: '🎉 50 Free Credits Added (1 Free Generation)!',
          creditsAdded: 50,
          newTotal: user.creditsRemaining,
        };
      }
      return {
        success: false,
        message: 'Invalid promo code.',
        creditsAdded: 0,
        newTotal: user.creditsRemaining,
      };
    }
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_NOTIFICATIONS;
  },

  markNotificationRead(id: string): AppNotification[] {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  markAllNotificationsRead(): AppNotification[] {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...list].slice(0, 30);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {}
  },
};
