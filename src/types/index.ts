export type ProductCategory =
  | 'electronics'
  | 'solar-torch'
  | 'watches'
  | 'wallets'
  | 'mobile-accessories'
  | 'home-kitchen'
  | 'body-massagers'
  | 'toolkits'
  | 'belts'
  | 'binoculars'
  | 'kids-fashion'
  | 'gaming-accessories'
  | 'psl-shirts'
  | 'miscellaneous'
  // Backward-compatible category keys
  | 'mobiles-tablets'
  | 'laptops'
  | 'audio-sound'
  | 'kitchen-catering'
  | 'appliances'
  | 'toys-games'
  | 'fashion'
  | 'home-living'
  | 'beauty-health'
  | 'sports-outdoor'
  | 'automotive'
  | 'gaming'
  | 'camera-accessories'
  | 'books-stationery'
  | 'luggage-bags'
  | 'watches-jewelry'
  | 'health-wellness'
  | 'glasses'
  | 'caps-collection'
  | 'smart-watches'
  | 'bags'
  | 'solar-lights'
  | 'fitness-gym'
  | 'beauty-cosmetics'
  | 'winter-sale';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subCategory?: string;
  brand?: string;
  price: number; // In Pakistani Rupees (PKR / Rs.)
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  sku: string;
  description: string;
  shortDescription: string;
  images: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  specs: Record<string, string>;
  videoUrl?: string; // 10-second product ad preview video
  videoDuration?: number; // 10
  videoAdTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: ProductCategory | 'all';
  name: string;
  subtitle?: string;
  description: string;
  iconName: string;
  image?: string;
  productCount: number;
  subCategories?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export type PaymentMethod =
  | 'cod'
  | 'jazzcash_easypaisa'
  | 'easypaisa'
  | 'jazzcash'
  | 'bank_transfer'
  | 'stripe'
  | string;

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  code: string;
  type: 'wallet' | 'bank' | 'cod' | 'card' | 'custom';
  accountTitle?: string;
  accountNumber?: string;
  bankName?: string;
  iban?: string;
  branchCode?: string;
  instructions?: string;
  enabled: boolean;
  badge?: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  comment?: string;
  updatedBy: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ES123456
  customer: ShippingAddress;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingFee: number;
  estimatedTax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'verification_required';
  paymentReference?: string;
  mobileWalletNumber?: string;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  trackingNumber?: string;
  carrier?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderNumber?: string;
  category: 'delivery_delay' | 'damaged_item' | 'wrong_product' | 'refund_request' | 'general_inquiry';
  subject: string;
  message: string;
  status: 'pending' | 'in_review' | 'resolved';
  createdAt: string;
  response?: string;
  resolvedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerCity?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  recommended?: boolean;
  helpfulCount: number;
  unhelpfulCount?: number;
  createdAt: string;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  password?: string;
  passwordHash?: string;
  provider?: 'local' | 'google' | 'facebook' | 'tiktok' | 'instagram';
  avatarUrl?: string;
  address?: Partial<ShippingAddress>;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage?: number;
  discountFixed?: number;
  minOrder?: number;
  description: string;
  active: boolean;
}

export interface IntegrationStatus {
  backendConfigured: boolean;
  backendUrl: string | null;
  stripeConfigured: boolean;
  stripeKey: string | null;
  geminiConfigured: boolean;
  databaseType: 'client_indexed_db' | 'remote_rest_api';
  persistedRecords: {
    productsCount: number;
    ordersCount: number;
    usersCount: number;
  };
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaCategory?: ProductCategory | 'all';
  searchFilter?: string;
  imageUrl: string;
  discountBadge?: string;
  active: boolean;
  order: number;
}

export type StoreViewMode =
  | 'catalog'
  | 'checkout'
  | 'order_confirmation'
  | 'order_history'
  | 'tracking'
  | 'support'
  | 'wishlist'
  | 'admin';
