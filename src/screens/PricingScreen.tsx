/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenRoute } from '../types';
import { useLanguage } from '../i18n';
import {
  SUBSCRIPTION_PLANS,
  CREDIT_PACKS,
  CREDITS_PER_GENERATION,
  PlanConfig,
  CreditPack,
} from '../config/plans';
import { storageService } from '../services/storageService';
import { subscriptionService } from '../services/subscriptionService';
import {
  getPaymentConfig,
  initializeCheckout,
  verifyPayment,
  loadRazorpayCheckoutScript,
  PaymentGatewayConfig,
} from '../services/paymentService';
import {
  Sparkles,
  Check,
  Crown,
  ShieldCheck,
  Zap,
  ArrowRight,
  Phone,
  MessageSquare,
  Lock,
  Flame,
  Star,
  CheckCircle2,
  Smartphone,
  CreditCard,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface PricingScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  credits: number;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({ onRouteChange, credits }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'plans' | 'topup'>('plans');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{
    type: 'plan' | 'pack';
    item: PlanConfig | CreditPack;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'autopay' | 'upi' | 'card'>('autopay');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [showTestCodeInput, setShowTestCodeInput] = useState<boolean>(false);
  const [testPasskey, setTestPasskey] = useState<string>('');
  const [testCodeStatus, setTestCodeStatus] = useState<string | null>(null);

  const userProfile = storageService.getUserProfile();

  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig | null>(null);

  useEffect(() => {
    getPaymentConfig().then((cfg) => {
      setPaymentConfig(cfg);
    });
  }, []);

  const handleOpenCheckout = (item: PlanConfig | CreditPack, type: 'plan' | 'pack') => {
    setGatewayError(null);
    setTestCodeStatus(null);
    setShowTestCodeInput(false);
    setCheckoutModal({ type, item });
  };

  const handleTestPasskeyActivate = async () => {
    if (!testPasskey.trim() || !checkoutModal) return;
    setIsProcessing(true);
    setTestCodeStatus('Verifying passkey on server...');

    try {
      const res = await fetch('/api/payment/test-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCode: testPasskey.trim(),
          planId: checkoutModal.item.id,
          userId: userProfile.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        storageService.addCredits(
          data.credits || 1000,
          `Developer Test Activation: ${data.tier}`,
          'subscription'
        );
        if (data.tier) {
          storageService.updateMembershipTier(data.tier as any);
        }
        setSuccessNotice(`⚡ ${data.message}`);
        setCheckoutModal(null);
      } else {
        setTestCodeStatus(`❌ ${data.message}`);
      }
    } catch {
      setTestCodeStatus('❌ Server communication error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!checkoutModal) return;
    setIsProcessing(true);
    setGatewayError(null);

    const { type, item } = checkoutModal;

    try {
      // 1. Call Backend to create authoritative order
      const orderData = await initializeCheckout({
        planId: item.id,
        type,
        userId: userProfile.id,
        customerEmail: userProfile.email || undefined,
        customerName: userProfile.name || undefined,
      });

      // If Razorpay credentials are not yet configured in .env on server
      if (!orderData.providerConfigured || !orderData.success) {
        setGatewayError(
          orderData.message ||
            'Razorpay credentials pending on server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to activate online payments.'
        );
        setShowTestCodeInput(true);
        setIsProcessing(false);
        return;
      }

      // 2. Ensure Razorpay Checkout SDK is ready
      const sdkReady = await loadRazorpayCheckoutScript();
      if (!sdkReady || !(window as any).Razorpay) {
        setGatewayError('Could not load Razorpay payment window. Please check your internet connection and retry.');
        setIsProcessing(false);
        return;
      }

      // 3. Open official Razorpay Checkout popup
      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Radha Rani AI Studio',
        description: `${item.name} (${type === 'plan' ? 'Subscription' : 'Top-Up Pack'})`,
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsProcessing(true);
          setGatewayError(null);

          try {
            // 4. Authoritative server verification (HMAC-SHA256)
            const verifyResult = await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: item.id,
              type,
              userId: userProfile.id,
            });

            if (verifyResult.verified) {
              if (type === 'plan') {
                subscriptionService.activatePlan(userProfile.id, item.id);
                if (verifyResult.planActivated) {
                  storageService.updateMembershipTier(verifyResult.planActivated as any);
                }
              }
              if (verifyResult.creditsGranted) {
                storageService.addCredits(
                  verifyResult.creditsGranted,
                  `Verified Razorpay: ${item.name} (Txn: ${response.razorpay_payment_id})`,
                  type === 'plan' ? 'subscription' : 'topup'
                );
              }

              const modeLabel = verifyResult.isTestMode ? 'Test Mode' : 'Live';
              setSuccessNotice(
                `🎉 Payment Verified (${modeLabel})! Added ${verifyResult.creditsGranted} credits to your account.`
              );
              setCheckoutModal(null);
            } else {
              setGatewayError(verifyResult.error || 'Payment signature verification failed on backend.');
            }
          } catch (err: any) {
            setGatewayError('Network error while verifying payment on server.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userProfile.name || 'Creative Member',
          email: userProfile.email || 'customer@aiprime.studio',
        },
        notes: {
          planId: item.id,
          userId: userProfile.id,
        },
        theme: {
          color: '#d4af37',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(rzpOptions);
      rzpInstance.on('payment.failed', function (resp: any) {
        setGatewayError(resp.error?.description || 'Payment was declined or cancelled.');
        setIsProcessing(false);
      });
      rzpInstance.open();
    } catch (err: any) {
      setGatewayError(
        'Could not initiate payment session. Check server logs or configure Razorpay credentials.'
      );
      setShowTestCodeInput(true);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1712] border border-[#d4af37]/30 text-xs font-semibold text-[#fceda7]">
          <Crown className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>AI Prime Studio VIP Memberships & Credits</span>
        </div>

        <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-wide">
          Flexible Plans for Every Creator
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Upgrade to unlock 4K Ultra HD Studio, private AI companion calls, neural face-swap, and weekly credits.
        </p>

        {/* Current Balance Banner */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#141720] border border-[#d4af37]/40 text-xs shadow-lg">
          <span className="text-gray-400">Your Current Balance:</span>
          <span className="font-cinzel font-bold text-[#fceda7] text-sm">
            {credits} Credits
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fceda7] text-[10px] font-bold uppercase">
            {userProfile.membershipTier} Tier
          </span>
        </div>
      </div>

      {/* Success notification banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm text-center flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* TABS: Subscription Plans vs Credit Top-Up */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-[#0c0e14] border border-white/[0.08] inline-flex">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'plans'
                ? 'bg-gold-gradient text-[#07080a] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⭐ Weekly Membership Plans
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'topup'
                ? 'bg-gold-gradient text-[#07080a] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚡ One-Time Credit Top-Up
          </button>
        </div>
      </div>

      {/* 1. SUBSCRIPTION PLANS GRID (Free, Plus, Pro, Ultra, Ultra Pro Max) */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = plan.popular;
            const isUltraProMax = plan.id === 'ultra_pro_max' || plan.id === 'ultra-pro-max';
            const isCurrent = userProfile.membershipTier.toLowerCase() === plan.name.toLowerCase() ||
                              userProfile.membershipTier.toLowerCase() === plan.id.toLowerCase();

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-5 transition-all flex flex-col justify-between ${
                  isUltraProMax
                    ? 'bg-gradient-to-b from-[#2a1e0b] via-[#14121b] to-[#0a0c10] border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.35)] ring-1 ring-[#fceda7]/40 xl:-translate-y-3'
                    : isPopular
                    ? 'bg-gradient-to-b from-[#1f1910] via-[#10121a] to-[#0a0c10] border-2 border-[#d4af37]/80 shadow-[0_0_25px_rgba(212,175,55,0.18)] xl:-translate-y-1'
                    : 'bg-[#0c0e14] border border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      isUltraProMax
                        ? 'bg-gradient-to-r from-[#ffe894] via-[#d4af37] to-[#aa7c11] text-[#07080a] shadow-lg shadow-[#d4af37]/40 font-extrabold'
                        : isPopular
                        ? 'bg-gold-gradient text-[#07080a] shadow-md shadow-[#d4af37]/30'
                        : 'bg-white/[0.1] text-gray-300 border border-white/10'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      <span>{plan.name}</span>
                      {isUltraProMax && <Crown className="w-4 h-4 text-[#fceda7]" />}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-cinzel text-2xl font-bold text-gold-gradient">
                        {plan.currency}{plan.priceMonthly}
                      </span>
                      <span className="text-[10px] text-gray-400">/{plan.periodText}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#fceda7] mt-1">
                      ⚡ {plan.creditsPerMonth.toLocaleString()} Credits Included
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/[0.06]" />

                  {/* Resolution Spec */}
                  <div className="text-[11px] flex items-center gap-1.5 text-[#fceda7]">
                    <span className="text-gray-400">Resolution:</span>
                    <span className="font-bold text-white">{plan.resolution}</span>
                  </div>

                  {/* Features List: Unlocked (with Check) at TOP, Locked (with Lock) at BOTTOM */}
                  <div className="space-y-2 pt-1">
                    {/* 1. Unlocked & Included Features */}
                    <ul className="space-y-2 text-[11px] text-gray-200">
                      {plan.features
                        .filter((feat) => !feat.startsWith('❌'))
                        .map((feat, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-tight">
                            <Check className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                    </ul>

                    {/* 2. Locked Features (shown at bottom of plan card) */}
                    {plan.features.some((feat) => feat.startsWith('❌')) && (
                      <div className="pt-2.5 border-t border-white/[0.08] space-y-1.5">
                        <ul className="space-y-1.5 text-[10px] text-gray-500">
                          {plan.features
                            .filter((feat) => feat.startsWith('❌'))
                            .map((feat, i) => (
                              <li key={i} className="flex items-start gap-1.5 leading-tight opacity-75">
                                <Lock className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                                <span>{feat.replace(/^❌\s*/, '')}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Action Button */}
                <div className="pt-5">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-white/[0.06] text-gray-400 font-bold text-xs cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : plan.priceMonthly === 0 ? (
                    <button
                      onClick={() => onRouteChange('create')}
                      className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs transition-colors"
                    >
                      Start Free
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(plan, 'plan')}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                        isUltraProMax
                          ? 'bg-gradient-to-r from-[#ffe894] via-[#d4af37] to-[#aa7c11] text-[#07080a] shadow-xl shadow-[#d4af37]/30 hover:scale-[1.02]'
                          : isPopular
                          ? 'bg-gold-gradient hover:bg-gold-gradient-hover text-[#07080a] shadow-lg shadow-[#d4af37]/20'
                          : 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                      }`}
                    >
                      <span>Upgrade to {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. ONE-TIME CREDIT TOP-UP PACKS */}
      {activeTab === 'topup' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="p-5 rounded-3xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#d4af37]/50 shadow-xl flex flex-col justify-between space-y-4 transition-all hover:scale-[1.02]"
            >
              <div className="space-y-2">
                {pack.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[10px] font-bold text-[#fceda7] uppercase">
                    {pack.badge}
                  </span>
                )}
                <h3 className="font-bold text-base text-white">{pack.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-cinzel text-2xl font-bold text-gold-gradient">
                    {pack.currency}{pack.price}
                  </span>
                  <span className="text-[10px] text-gray-400">one-time</span>
                </div>
                <div className="text-xs font-bold text-[#fceda7] flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/25 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{pack.currency}{pack.price} → {pack.credits} Credits</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {pack.description}
                </p>
              </div>

              <button
                onClick={() => handleOpenCheckout(pack, 'pack')}
                className="w-full py-2.5 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/15 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buy {pack.credits} Credits</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2 text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Razorpay 256-Bit SSL Encrypted & Verified Checkouts</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onRouteChange('support')}
            className="text-[#fceda7] hover:underline flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Need Help? Contact Support</span>
          </button>
        </div>
      </div>

      {/* RAZORPAY / CHECKOUT MODAL */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-sm bg-[#0d1017] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">
                Secure Studio Checkout
              </span>
              <h3 className="font-cinzel text-xl font-bold text-white">
                {checkoutModal.item.name}
              </h3>
              <p className="text-xs text-gray-400">
                Amount payable: <span className="text-[#fceda7] font-bold text-sm">₹{'priceMonthly' in checkoutModal.item ? checkoutModal.item.priceMonthly : checkoutModal.item.price}</span>
              </p>

              {paymentConfig?.mode === 'test' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Razorpay Test Mode Active (Safe Testing)</span>
                </div>
              )}
              {paymentConfig?.mode === 'live' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[10px] text-[#fceda7] font-semibold">
                  <Lock className="w-3 h-3 text-[#d4af37]" />
                  <span>Razorpay Live 256-Bit SSL Active</span>
                </div>
              )}
              {paymentConfig?.mode === 'unconfigured' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] text-amber-300 font-semibold">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Razorpay Keys Pending in .env</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Credits Credited:</span>
                <span className="font-bold text-[#fceda7]">
                  {'creditsPerMonth' in checkoutModal.item ? checkoutModal.item.creditsPerMonth : checkoutModal.item.credits} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span>Access Type:</span>
                <span className="font-semibold text-white">
                  {checkoutModal.type === 'plan' ? 'Weekly Plan' : 'Instant Top-Up'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="text-emerald-400 font-semibold">Instant (Zero Wait)</span>
              </div>
            </div>

            {/* Payment Methods Supported */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-gray-300">UPI (PhonePe/GPay), Cards & NetBanking</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                100% Secure
              </span>
            </div>

            {/* Gateway pending configuration notice (Only shows when keys missing) */}
            {gatewayError && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs text-left space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-[#fceda7]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Razorpay Setup Notice:</span>
                </div>
                <p className="text-[11px] text-gray-300">{gatewayError}</p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-gray-400 select-all space-y-1">
                  <p className="font-sans text-[9px] text-amber-300 font-semibold">Place these keys in your .env file:</p>
                  <p className="text-emerald-400">RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"</p>
                  <p className="text-emerald-400">RAZORPAY_KEY_SECRET="YOUR_KEY_SECRET"</p>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-lg shadow-[#d4af37]/25 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Connecting to Razorpay...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[#07080a]" />
                    <span>
                      Proceed to Pay ₹{'priceMonthly' in checkoutModal.item ? checkoutModal.item.priceMonthly : checkoutModal.item.price}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={() => setCheckoutModal(null)}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {/* Collapsible Owner Test Access (Hidden from regular flow) */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setShowTestCodeInput(!showTestCodeInput)}
                className="text-[10px] text-gray-500 hover:text-[#d4af37] transition-colors underline"
              >
                {showTestCodeInput ? 'Hide Owner Test' : '🛠️ Owner / Test Passkey'}
              </button>

              {showTestCodeInput && (
                <div className="mt-2 p-3 rounded-2xl bg-black/70 border border-white/10 text-left space-y-2 animate-fadeIn">
                  <span className="text-[10px] font-bold text-[#fceda7] uppercase tracking-wider block">
                    Developer / Owner Test Passkey:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="e.g. DEV_OWNER_VIP_2026"
                      value={testPasskey}
                      onChange={(e) => setTestPasskey(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                    />
                    <button
                      type="button"
                      onClick={handleTestPasskeyActivate}
                      disabled={isProcessing || !testPasskey.trim()}
                      className="px-3 py-1.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md disabled:opacity-50"
                    >
                      Activate
                    </button>
                  </div>
                  {testCodeStatus && (
                    <p className="text-[10px] text-gray-300 font-medium">{testCodeStatus}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
