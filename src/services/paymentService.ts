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
  amount: number;
  currency: string;
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
  error?: string;
  message?: string;
}

export interface PaymentVerificationOptions {
  orderId: string;
  paymentId: string;
  signature?: string;
  planId?: string;
  userId: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  transactionId?: string;
  planActivated?: string;
  creditsGranted?: number;
  status: 'captured' | 'pending' | 'failed' | 'test_activated';
  error?: string;
}

export interface TestActivationOptions {
  testCode: string;
  planId: string;
  userId: string;
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
      error: 'Payment gateway configuration pending. Live Razorpay keys required on server.',
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
