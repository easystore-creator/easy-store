import { PaymentGatewayConfig } from '../types';

const PAYMENT_STORAGE_KEY = 'easystore_payment_gateways_v2';

export const DEFAULT_PAYMENT_GATEWAYS: PaymentGatewayConfig[] = [
  {
    id: 'pay_cod',
    name: 'Cash on Delivery (COD)',
    code: 'cod',
    type: 'cod',
    accountTitle: 'Doorstep Cash Collection',
    accountNumber: 'N/A',
    instructions: 'Pay in cash when you receive your order at your doorstep anywhere in Pakistan. No advance payment required.',
    enabled: true,
    badge: 'Most Popular Across Pakistan',
  },
  {
    id: 'pay_easypaisa',
    name: 'EasyPaisa Mobile Wallet',
    code: 'easypaisa',
    type: 'wallet',
    accountTitle: 'Muhammad Abdullah / Easy Store',
    accountNumber: '0346-7792177',
    instructions: 'Transfer the total amount to EasyPaisa Account: 0346-7792177 (Title: Easy Store / Abdullah). Enter your Transaction ID / Sender number during checkout.',
    enabled: true,
    badge: 'Instant 0% Fee',
  },
  {
    id: 'pay_jazzcash',
    name: 'JazzCash Mobile Account',
    code: 'jazzcash',
    type: 'wallet',
    accountTitle: 'Muhammad Abdullah / Easy Store',
    accountNumber: '0346-7792177',
    instructions: 'Transfer the total amount to JazzCash Account: 0346-7792177 (Title: Easy Store / Abdullah). Enter your Transaction ID / Sender number during checkout.',
    enabled: true,
    badge: 'Instant 0% Fee',
  },
  {
    id: 'pay_bank_transfer',
    name: 'Direct Bank Transfer / Raast',
    code: 'bank_transfer',
    type: 'bank',
    bankName: 'Meezan Bank Ltd (Islamic Banking)',
    accountTitle: 'Easy Store Official / Muhammad Abdullah',
    accountNumber: '0102-0103445892',
    iban: 'PK45MEZN0001020103445892',
    branchCode: '0102 (Karachi Main)',
    instructions: 'Transfer total amount to our official Meezan Bank / Raast account and enter your bank reference/transaction number below.',
    enabled: true,
    badge: 'All Pakistani Banks & Raast',
  },
  {
    id: 'pay_stripe',
    name: 'Online Debit / Credit Card',
    code: 'stripe',
    type: 'card',
    accountTitle: 'Easy Store Verified Merchant Gateway',
    accountNumber: 'Encrypted Tokenization',
    instructions: 'Pay securely using any Pakistani or International Visa, MasterCard, PayPak, or UnionPay debit/credit card.',
    enabled: true,
    badge: '3D Secure 256-Bit SSL',
  },
];

export function getPaymentGateways(): PaymentGatewayConfig[] {
  try {
    const stored = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load payment gateways from localStorage:', e);
  }
  return DEFAULT_PAYMENT_GATEWAYS;
}

export function savePaymentGateways(gateways: PaymentGatewayConfig[]): void {
  try {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(gateways));
    window.dispatchEvent(new Event('easystore_payment_gateways_updated'));
  } catch (e) {
    console.error('Failed to save payment gateways to localStorage:', e);
  }
}

export function resetPaymentGateways(): PaymentGatewayConfig[] {
  try {
    localStorage.removeItem(PAYMENT_STORAGE_KEY);
    window.dispatchEvent(new Event('easystore_payment_gateways_updated'));
  } catch (e) {
    console.error('Failed to reset payment gateways:', e);
  }
  return DEFAULT_PAYMENT_GATEWAYS;
}
