/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Subscription Management Service
 * Handles Trial lifecycle (2 days / 48 hours), AutoPay authorization,
 * status checks, 1-click cancellations, and renewal to Ultra Pro Max.
 */

import { storageService } from './storageService';

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  status: 'active_trial' | 'active_subscription' | 'past_due' | 'cancelled' | 'expired';
  trialStart?: string;
  trialEnd?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  renewalPrice: number;
  renewalCurrency: string;
  mandateAuthorized: boolean;
  mandateId?: string;
  autoRenew: boolean;
  cancelledAt?: string;
}

const SUBSCRIPTION_STORAGE_KEY = 'aiclub_user_subscription';

export const subscriptionService = {
  /**
   * Retrieves active subscription record from local store
   */
  getSubscription(): SubscriptionRecord | null {
    try {
      const data = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Starts a 2-Day Trial upon verified ₹2 authorization
   */
  activateTrial(userId: string, mandateId?: string): SubscriptionRecord {
    const now = new Date();
    const twoDaysLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const record: SubscriptionRecord = {
      id: `sub_${Date.now()}`,
      userId,
      planId: 'trial',
      status: 'active_trial',
      trialStart: now.toISOString(),
      trialEnd: twoDaysLater.toISOString(),
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: twoDaysLater.toISOString(),
      renewalPrice: 999,
      renewalCurrency: '₹',
      mandateAuthorized: true,
      mandateId: mandateId || `mandate_${Date.now()}`,
      autoRenew: true,
    };

    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(record));
    storageService.updateMembershipTier('₹2 Intro Trial');
    storageService.addCredits(150, '₹2 Intro Trial (2 Days VIP Trial)', 'trial');

    return record;
  },

  /**
   * Activates Pro Plan (₹199) with background weekly AutoPay mandate
   */
  activateProPlan(userId: string, mandateId?: string): SubscriptionRecord {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const record: SubscriptionRecord = {
      id: `sub_${Date.now()}`,
      userId,
      planId: 'pro',
      status: 'active_subscription',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: oneWeekLater.toISOString(),
      renewalPrice: 999,
      renewalCurrency: '₹',
      mandateAuthorized: true,
      mandateId: mandateId || `mandate_${Date.now()}`,
      autoRenew: true,
    };

    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(record));
    storageService.updateMembershipTier('PRO');
    storageService.addCredits(1000, 'Pro Plan Weekly Subscription (1,000 Credits)', 'subscription');

    return record;
  },

  /**
   * Activates any weekly recurring plan with AutoPay authorization
   */
  activatePlan(userId: string, planId: string, mandateId?: string): SubscriptionRecord {
    if (planId === 'trial') return this.activateTrial(userId, mandateId);
    if (planId === 'pro') return this.activateProPlan(userId, mandateId);

    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const planConfigMap: Record<string, { tier: any; credits: number; renewal: number }> = {
      plus: { tier: 'PLUS', credits: 400, renewal: 99 },
      ultra_pro: { tier: 'ULTRA PRO', credits: 1500, renewal: 299 },
      ultra_pro_max: { tier: 'ULTRA PRO MAX', credits: 5000, renewal: 999 },
    };

    const config = planConfigMap[planId] || { tier: 'PLUS', credits: 400, renewal: 99 };

    const record: SubscriptionRecord = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: 'active_subscription',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: oneWeekLater.toISOString(),
      renewalPrice: config.renewal,
      renewalCurrency: '₹',
      mandateAuthorized: true,
      mandateId: mandateId || `mandate_${Date.now()}`,
      autoRenew: true,
    };

    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(record));
    storageService.updateMembershipTier(config.tier);
    storageService.addCredits(config.credits, `${config.tier} Weekly Subscription (${config.credits.toLocaleString()} Credits)`, 'subscription');

    return record;
  },

  /**
   * 1-Click Cancel before trial ends or during active subscription
   */
  cancelSubscription(): { success: boolean; message: string } {
    const current = this.getSubscription();
    if (!current) {
      return { success: false, message: 'No active subscription found to cancel.' };
    }

    current.autoRenew = false;
    current.status = 'cancelled';
    current.cancelledAt = new Date().toISOString();

    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(current));
    return {
      success: true,
      message: 'Subscription cancelled successfully. You will not be charged again.',
    };
  },

  /**
   * Checks subscription expiry & handles renewal into Ultra Pro Max
   */
  checkAndProcessLifecycle(): {
    status: SubscriptionRecord['status'] | 'none';
    daysLeft?: number;
    hoursLeft?: number;
    isRenewed?: boolean;
  } {
    const sub = this.getSubscription();
    if (!sub) return { status: 'none' };

    const now = new Date().getTime();
    const periodEnd = new Date(sub.currentPeriodEnd).getTime();
    const msRemaining = periodEnd - now;

    if (msRemaining <= 0) {
      if (sub.status === 'active_trial' && sub.autoRenew && sub.mandateAuthorized) {
        // Trial period completed: renew into Ultra Pro Max
        sub.status = 'active_subscription';
        sub.planId = 'ultra_pro_max';
        const newPeriodEnd = new Date(now + 7 * 24 * 60 * 60 * 1000);
        sub.currentPeriodStart = new Date(now).toISOString();
        sub.currentPeriodEnd = newPeriodEnd.toISOString();

        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(sub));
        storageService.updateMembershipTier('ULTRA PRO MAX');
        storageService.addCredits(5000, 'Ultra Pro Max Weekly Renewal (AutoPay)', 'subscription');

        return {
          status: 'active_subscription',
          isRenewed: true,
          daysLeft: 7,
          hoursLeft: 168,
        };
      } else {
        sub.status = 'expired';
        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(sub));
        return { status: 'expired' };
      }
    }

    const hoursLeft = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));
    const daysLeft = Math.max(0, Math.floor(hoursLeft / 24));

    return {
      status: sub.status,
      daysLeft,
      hoursLeft,
    };
  },
};
