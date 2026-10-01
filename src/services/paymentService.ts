/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modular Payment & Subscription Service Interface (Razorpay-ready)
 * Section 26, 27, 28, 29 of Master Final Build Instruction
 * Decoupled from AI generation execution. Strictly validated on server.
 */

export interface CheckoutSessionOptions {
  planId: string;
  type: 'plan' | 'pack';
  amount?: number;
  currency?: string;
  userId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

export interface CheckoutInitResult {
  success: boolean;
  orderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  checkoutUrl?: string;
  isTestMode?: boolean;
  providerConfigured: boolean;
  item?: {
    id: string;
    name: string;
    price: number;
    credits: number;
  };
  error?: string;
  message?: string;
}

export interface PaymentVerificationOptions {
  orderId: string;
  paymentId: string;
  signature?: string;
  planId?: string;
  type?: 'plan' | 'pack';
  userId: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  transactionId?: string;
  orderId?: string;
  planActivated?: string;
  creditsGranted?: number;
  newTotalCredits?: number;
  isTestMode?: boolean;
  status: 'captured' | 'pending' | 'failed' | 'test_activated' | 'pending_configuration';
  error?: string;
  message?: string;
}

export interface PaymentGatewayConfig {
  configured: boolean;
  keyId: string | null;
  mode: 'test' | 'live' | 'unconfigured';
  currency: string;
  message: string;
}

export interface TestActivationOptions {
  testCode: string;
  planId: string;
  userId: string;
}

/**
 * Loads Razorpay Checkout JavaScript SDK asynchronously
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout.js script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Checks server payment gateway configuration status
 */
export async function getPaymentConfig(): Promise<PaymentGatewayConfig> {
  try {
    const res = await fetch('/api/payment/config');
    if (!res.ok) throw new Error('Status ' + res.status);
    return await res.json();
  } catch {
    return {
      configured: false,
      keyId: null,
      mode: 'unconfigured',
      currency: 'INR',
      message: 'Could not fetch payment gateway config from backend.',
    };
  }
}

/**
 * Initializes a checkout order with the backend
 */
export async function initializeCheckout(
  options: CheckoutSessionOptions
): Promise<CheckoutInitResult> {
  try {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    const data = await res.json();
    return data;
  } catch {
    return {
      success: false,
      providerConfigured: false,
      error: 'Payment gateway configuration pending. Razorpay keys required on server.',
      message: 'Razorpay payment gateway adapter is ready. Live API credentials are not yet configured on the backend.',
    };
  }
}

/**
 * Verifies payment confirmation with the server
 * Backend is authoritative. Never trusts client assertion alone.
 */
export async function verifyPayment(
  options: PaymentVerificationOptions
): Promise<PaymentVerificationResult> {
  try {
    const res = await fetch('/api/payment/verify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    const data = await res.json();
    return data;
  } catch {
    return {
      verified: false,
      status: 'failed',
      error: 'Server verification could not be completed.',
    };
  }
}

/**
 * Internal Owner Test Mode Activation (Section 29)
 * Allows developer/owner to test paid plans and credits during development without live cards.
 * Server validates test code against INTERNAL_TEST_CODES.
 */
export async function activateOwnerTestAccess(
  options: TestActivationOptions
): Promise<{ success: boolean; credits?: number; tier?: string; message: string }> {
  try {
    const res = await fetch('/api/payment/test-activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    return await res.json();
  } catch {
    return {
      success: false,
      message: 'Internal test activation failed. Check server connectivity.',
    };
  }
}

/**
 * Validates promotional discount / bonus code on backend (Section 25)
 */
export async function validatePromoCode(code: string): Promise<{
  valid: boolean;
  discountPercent?: number;
  bonusCredits?: number;
  message: string;
}> {
  try {
    const res = await fetch('/api/promo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    return await res.json();
  } catch {
    return {
      valid: false,
      message: 'Could not connect to promo verification service.',
    };
  }
}
