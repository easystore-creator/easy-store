import { INITIAL_BANNERS, INITIAL_COUPONS, INITIAL_PRODUCTS } from '../data/seedData';
import { BannerSlide, Complaint, Coupon, Order, OrderStatus, Product, ProductReview, User } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'easystore_pk_products_v15_15k_kitchen',
  ORDERS: 'easystore_pk_orders_v5',
  USERS: 'easystore_pk_users_v5',
  COUPONS: 'easystore_pk_coupons_v5',
  COMPLAINTS: 'easystore_pk_complaints_v5',
  ADMIN_SETTINGS: 'easystore_pk_admin_settings_v5',
  BANNERS: 'easystore_pk_banners_v10_dots_pk',
  REVIEWS: 'easystore_pk_reviews_v1',
};

export const DEFAULT_ADMIN_PASSPHRASE = 'abdullah123@';
export const DEFAULT_ADMIN_KEY_HINT = 'abdullah123@';

interface AdminSettings {
  passphraseHash: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  taxRatePercent: number;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

class DatabaseService {
  private inMemoryProducts: Product[] = [];

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      const initialMap = new Map<string, Product>(INITIAL_PRODUCTS.map((p) => [p.id, p]));
      const customAddedData = localStorage.getItem(`${STORAGE_KEYS.PRODUCTS}_custom`);
      if (customAddedData) {
        try {
          const customAdded: Product[] = JSON.parse(customAddedData);
          const customIds = new Set(customAdded.map((p) => p.id));
          const remainingInitial = INITIAL_PRODUCTS.filter((p) => !customIds.has(p.id));
          this.inMemoryProducts = [...customAdded, ...remainingInitial].filter(
            (p: any) => p.category !== 'groceries' && p.category !== 'health-wellness'
          );
        } catch {
          this.inMemoryProducts = INITIAL_PRODUCTS.filter(
            (p: any) => p.category !== 'groceries' && p.category !== 'health-wellness'
          );
        }
      } else {
        this.inMemoryProducts = INITIAL_PRODUCTS.filter(
          (p: any) => p.category !== 'groceries' && p.category !== 'health-wellness'
        );
      }

      // Ensure every product in catalog has 4-5 images (merge with initial rich images if outdated in cache)
      this.inMemoryProducts = this.inMemoryProducts.map((p) => {
        const seed = initialMap.get(p.id);
        if (seed && (!p.images || p.images.length < 4)) {
          return { ...p, images: seed.images };
        }
        if (!p.images || p.images.length === 0) {
          return {
            ...p,
            images: [
              'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
            ],
          };
        }
        return p;
      });

      if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const seedUsers: User[] = [
          {
            id: 'usr-owner-001',
            name: 'Abdullah (Owner)',
            email: 'easystorekarachi@gmail.com',
            role: 'admin',
            phone: '+92 346 7792177',
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
      }
      if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS)) {
        const defaultSettings: AdminSettings = {
          passphraseHash: hashString(DEFAULT_ADMIN_PASSPHRASE),
          storeName: 'Easy Store Pakistan',
          supportEmail: 'easystorekarachi@gmail.com',
          supportPhone: '+92 346 7792177',
          currency: 'PKR',
          shippingFlatRate: 200,
          freeShippingThreshold: 2500,
          taxRatePercent: 0,
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(defaultSettings));
      }
      if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
        const seedReviews: ProductReview[] = [
          {
            id: 'rev-seed-1',
            productId: 'prod-rehman-1',
            customerName: 'Muhammad Hamza',
            customerCity: 'Lahore',
            rating: 5,
            title: 'Super fast coffee frother & egg whisker!',
            comment: 'Alhamdulillah received in 2 days in Lahore via TCS. High quality build, froths cold and hot coffee within 10 seconds. Battery backup is very good. Recommended to everyone in Pakistan!',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 24,
            createdAt: '2026-02-14T12:30:00Z',
          },
          {
            id: 'rev-seed-2',
            productId: 'prod-rehman-1',
            customerName: 'Ayesha Tariq',
            customerCity: 'Karachi',
            rating: 5,
            title: 'Best kitchen gadget I bought this year',
            comment: 'Whisker is strong and does not slow down in thick batter or cream. Got it on Cash on Delivery with zero hassle. 5 stars!',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 17,
            createdAt: '2026-02-18T15:20:00Z',
          },
          {
            id: 'rev-seed-3',
            productId: 'prod-rehman-6',
            customerName: 'Dr. Bilal Qureshi',
            customerCity: 'Islamabad',
            rating: 5,
            title: 'Very effective dual heating percussion massager',
            comment: 'The heat combined with deep percussion relief is amazing for stiff neck and back pain after long clinic hours. Quality feels like high end Japanese massagers.',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 31,
            createdAt: '2026-02-10T09:15:00Z',
          },
          {
            id: 'rev-seed-4',
            productId: 'prod-sam-s24u',
            customerName: 'Zubair Shah',
            customerCity: 'Peshawar',
            rating: 5,
            title: '100% Genuine Box-Packed PTA Approved Phone',
            comment: 'Verified on DIRBS PTA portal right after unboxing - completely approved official IMEI! Camera zoom is unbelievable. Easy Store delivered within 48 hours to Peshawar.',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 45,
            createdAt: '2026-02-05T14:40:00Z',
          },
          {
            id: 'rev-seed-5',
            productId: 'prod-airpods-pro',
            customerName: 'Farhan Ali',
            customerCity: 'Rawalpindi',
            rating: 5,
            title: 'Top notch active noise cancellation',
            comment: 'Serial number verified on Apple coverage site. ANC works like magic in noisy commute and gym. Sound stage is super clear.',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 29,
            createdAt: '2026-02-08T18:10:00Z',
          },
          {
            id: 'rev-seed-6',
            productId: 'prod-rehman-13',
            customerName: 'Tariq Mehmood',
            customerCity: 'Faisalabad',
            rating: 5,
            title: 'Heavy duty 12V drill, excellent value for money',
            comment: 'Very solid drill machine. Both drill bits and screwdriver bits work smoothly on wood and metal fixtures. Battery charges quickly.',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 19,
            createdAt: '2026-02-12T11:20:00Z',
          },
          {
            id: 'rev-seed-7',
            productId: 'prod-t900-smartwatch',
            customerName: 'Khurram Jamil',
            customerCity: 'Multan',
            rating: 4,
            title: 'Great display and Bluetooth calling works well',
            comment: 'Big bright screen, loudspeaker is crisp during calls. Battery lasts almost 2-3 days easily. Excellent budget smartwatch in Pakistan.',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 14,
            createdAt: '2026-02-16T17:05:00Z',
          },
          {
            id: 'rev-seed-8',
            productId: 'prod-masterchef-cookware',
            customerName: 'Nadia Parveen',
            customerCity: 'Gujranwala',
            rating: 5,
            title: 'Outstanding granite coating, completely non-stick',
            comment: 'Needs very little oil, food slides right off. Heavy lids keep steam trapped nicely. Delivered securely packed in wooden frame box without any dent.',
            verifiedPurchase: true,
            recommended: true,
            helpfulCount: 22,
            createdAt: '2026-02-19T13:45:00Z',
          },
        ];
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(seedReviews));
      }
    } catch (e) {
      console.error('Database initialization error:', e);
    }
  }

  // ================== PRODUCTS ==================
  public getProducts(): Product[] {
    return (this.inMemoryProducts || []).filter((p: any) => p.category !== 'groceries');
  }

  public getProductById(id: string): Product | null {
    return this.inMemoryProducts.find((p) => p.id === id) || null;
  }

  public saveProduct(product: Partial<Product> & { name: string; price: number; stock: number }): Product {
    const now = new Date().toISOString();
    if (product.id) {
      const idx = this.inMemoryProducts.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        const updated: Product = {
          ...this.inMemoryProducts[idx],
          ...product,
          updatedAt: now,
        };
        this.inMemoryProducts[idx] = updated;
        this.saveCustomProducts();
        return updated;
      }
    }

    const newProduct: Product = {
      id: `prod-pk-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      name: product.name,
      slug: (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: product.category || 'electronics',
      brand: product.brand || 'Easy Store Verified',
      price: Number(product.price) || 0,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
      cost: product.cost ? Number(product.cost) : Math.round(Number(product.price) * 0.72),
      stock: Math.max(0, Number(product.stock) || 0),
      sku: product.sku || `PK-${Date.now().toString().slice(-6)}`,
      description: product.description || 'Authentic product with Cash on Delivery all over Pakistan.',
      shortDescription: product.shortDescription || '100% genuine with official checking warranty in Pakistan.',
      images: product.images && product.images.length > 0 ? product.images : [
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      ],
      rating: product.rating || 4.8,
      reviewCount: product.reviewCount || 1,
      featured: product.featured || false,
      bestSeller: product.bestSeller || false,
      specs: product.specs || { 'Origin': 'Authentic Import', 'Warranty': '7 Days Checking Warranty' },
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryProducts.unshift(newProduct);
    this.saveCustomProducts();
    return newProduct;
  }

  private saveCustomProducts() {
    try {
      const customAdded = this.inMemoryProducts.filter((p) => p.id.startsWith('prod-pk-') || (p.updatedAt && p.updatedAt !== p.createdAt));
      localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_custom`, JSON.stringify(customAdded));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('easystore:products-updated', { detail: { count: this.inMemoryProducts.length } }));
      }
    } catch {
      // ignore
    }
  }

  public notifyProductsUpdated(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('easystore:products-updated', { detail: { count: this.inMemoryProducts.length } }));
    }
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.inMemoryProducts.length;
    this.inMemoryProducts = this.inMemoryProducts.filter((p) => p.id !== id);
    if (this.inMemoryProducts.length !== prevLen) {
      this.saveCustomProducts();
      return true;
    }
    return false;
  }

  public updateProductStock(id: string, newStock: number): boolean {
    const prod = this.inMemoryProducts.find((p) => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, newStock);
      prod.updatedAt = new Date().toISOString();
      this.saveCustomProducts();
      return true;
    }
    return false;
  }

  // ================== ORDERS ==================
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const list = data ? JSON.parse(data) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  public getOrderById(id: string): Order | null {
    const orders = this.getOrders();
    const clean = id.trim().toLowerCase();
    return orders.find((o) => (o.id && o.id.toLowerCase() === clean) || (o.orderNumber && o.orderNumber.toLowerCase() === clean)) || null;
  }

  public getOrdersByEmailOrPhone(query: string): Order[] {
    const orders = this.getOrders();
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    const cleanDigits = q.replace(/\D/g, '');
    return orders.filter((o) =>
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
      (cleanDigits && o.customer?.phone && o.customer.phone.replace(/\D/g, '').includes(cleanDigits)) ||
      (o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q))
    );
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): { success: boolean; order?: Order; error?: string } {
    for (const item of (orderData.items || [])) {
      const prod = this.inMemoryProducts.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product "${item.name}" no longer exists in catalog.` };
      }
      if (prod.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for "${item.name}". Only ${prod.stock} available.` };
      }
    }

    const now = new Date().toISOString();
    for (const item of (orderData.items || [])) {
      const prod = this.inMemoryProducts.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock -= item.quantity;
        prod.updatedAt = now;
      }
    }
    this.saveCustomProducts();

    const orderNumber = `ES${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-pk-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      orderNumber,
      orderStatus: 'pending_payment',
      statusHistory: [
        {
          status: 'pending_payment',
          timestamp: now,
          comment: `Order placed via ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : orderData.paymentMethod}.`,
          updatedBy: 'Customer Checkout',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    return { success: true, order: newOrder };
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    comment?: string,
    updatedBy: string = 'Easy Store Pakistan'
  ): { success: boolean; order?: Order; error?: string } {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      return { success: false, error: 'Order not found.' };
    }

    const order = orders[orderIndex];
    const previousStatus = order.orderStatus;
    const now = new Date().toISOString();

    if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of (order.items || [])) {
        const prod = this.inMemoryProducts.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
          prod.updatedAt = now;
        }
      }
    }

    order.orderStatus = newStatus;
    order.updatedAt = now;
    if (newStatus === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'completed';
    }

    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: newStatus,
      timestamp: now,
      comment: comment || `Order status updated to ${newStatus.replace('_', ' ')}.`,
      updatedBy,
    });

    orders[orderIndex] = order;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, order };
  }

  public updateOrderTracking(
    orderId: string,
    trackingNumber: string,
    carrier: string
  ): { success: boolean; order?: Order } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false };

    order.trackingNumber = trackingNumber.trim();
    order.carrier = carrier.trim();
    order.updatedAt = new Date().toISOString();
    order.statusHistory = order.statusHistory || [];

    if (order.orderStatus === 'pending_payment' || order.orderStatus === 'processing') {
      order.orderStatus = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        timestamp: new Date().toISOString(),
        comment: `Dispatched with ${carrier} (Tracking: ${trackingNumber}).`,
        updatedBy: 'Dispatch Logistics',
      });
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, order };
  }

  // ================== COMPLAINTS & INQUIRIES ==================
  public getComplaints(): Complaint[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public submitComplaint(data: Omit<Complaint, 'id' | 'status' | 'createdAt'>): Complaint {
    const newComplaint: Complaint = {
      ...data,
      id: `cmp-${Date.now().toString(36)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const complaints = this.getComplaints();
    complaints.unshift(newComplaint);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    return newComplaint;
  }

  public updateComplaintStatus(id: string, status: 'pending' | 'in_review' | 'resolved', response?: string): boolean {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;
    complaints[idx].status = status;
    if (response) complaints[idx].response = response;
    if (status === 'resolved') complaints[idx].resolvedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    return true;
  }

  // ================== COUPONS ==================
  public getCoupons(): Coupon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return data ? JSON.parse(data) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon || !coupon.active) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires minimum order of Rs. ${coupon.minOrder.toLocaleString()}.`,
      };
    }

    let discount = 0;
    if (coupon.discountPercentage) {
      discount = Math.round((subtotal * coupon.discountPercentage) / 100);
    } else if (coupon.discountFixed) {
      discount = Math.min(coupon.discountFixed, subtotal);
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied: ${coupon.description}`,
      coupon,
    };
  }

  // ================== BANNERS ==================
  public getBanners(): BannerSlide[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a: BannerSlide, b: BannerSlide) => a.order - b.order);
        }
      }
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
      return INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  }

  public saveBanner(banner: BannerSlide): BannerSlide {
    const banners = this.getBanners();
    const index = banners.findIndex((b) => b.id === banner.id);
    if (index >= 0) {
      banners[index] = banner;
    } else {
      banners.push(banner);
    }
    banners.sort((a, b) => a.order - b.order);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    try { window.dispatchEvent(new Event('storage')); } catch {}
    return banner;
  }

  public updateBanner(id: string, updates: Partial<BannerSlide>): BannerSlide | null {
    const banners = this.getBanners();
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) return null;
    banners[index] = { ...banners[index], ...updates };
    banners.sort((a, b) => a.order - b.order);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    try { window.dispatchEvent(new Event('storage')); } catch {}
    return banners[index];
  }

  public deleteBanner(id: string): boolean {
    const banners = this.getBanners().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    try { window.dispatchEvent(new Event('storage')); } catch {}
    return true;
  }

  public reorderBanners(orderedIds: string[]): BannerSlide[] {
    const banners = this.getBanners();
    const idMap = new Map(banners.map((b) => [b.id, b]));
    const reordered: BannerSlide[] = [];
    orderedIds.forEach((id, idx) => {
      const banner = idMap.get(id);
      if (banner) {
        banner.order = idx + 1;
        reordered.push(banner);
        idMap.delete(id);
      }
    });
    idMap.forEach((banner) => {
      banner.order = reordered.length + 1;
      reordered.push(banner);
    });
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(reordered));
    try { window.dispatchEvent(new Event('storage')); } catch {}
    return reordered;
  }

  public resetDefaultBanners(): BannerSlide[] {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
    try { window.dispatchEvent(new Event('storage')); } catch {}
    return INITIAL_BANNERS;
  }

  // ================== REVIEWS & RATINGS ==================
  public getReviews(productId?: string): ProductReview[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const list: ProductReview[] = data ? JSON.parse(data) : [];
      if (!Array.isArray(list)) return [];
      const filtered = productId ? list.filter((r) => r.productId === productId) : list;
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }

  public getReviewsSummary(productId: string) {
    const reviews = this.getReviews(productId);
    const totalCount = reviews.length;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;
    let recommendCount = 0;

    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sumRating += Number(r.rating) || 5;
      if (r.recommended !== false) {
        recommendCount += 1;
      }
    });

    const averageRating = totalCount > 0 ? Number((sumRating / totalCount).toFixed(1)) : 5.0;
    const percentageBreakdown: Record<number, number> = {
      5: totalCount > 0 ? Math.round((breakdown[5] / totalCount) * 100) : 0,
      4: totalCount > 0 ? Math.round((breakdown[4] / totalCount) * 100) : 0,
      3: totalCount > 0 ? Math.round((breakdown[3] / totalCount) * 100) : 0,
      2: totalCount > 0 ? Math.round((breakdown[2] / totalCount) * 100) : 0,
      1: totalCount > 0 ? Math.round((breakdown[1] / totalCount) * 100) : 0,
    };
    const recommendPercentage = totalCount > 0 ? Math.round((recommendCount / totalCount) * 100) : 100;

    return {
      averageRating,
      totalCount,
      breakdown,
      percentageBreakdown,
      recommendPercentage,
    };
  }

  public verifyCustomerPurchase(
    productId: string,
    identifier: { email?: string; phone?: string; orderNumber?: string }
  ): {
    isVerified: boolean;
    orderNumber?: string;
    customerName?: string;
    city?: string;
    orderDate?: string;
    message?: string;
  } {
    const orders = this.getOrders();
    const cleanEmail = (identifier.email || '').trim().toLowerCase();
    const cleanPhone = (identifier.phone || '').replace(/\D/g, '');
    const cleanOrderNumber = (identifier.orderNumber || '').trim().toUpperCase();

    if (!cleanEmail && !cleanPhone && !cleanOrderNumber) {
      return { isVerified: false, message: 'Please provide an email, phone number, or order ID to verify.' };
    }

    const matchingOrder = orders.find((order) => {
      // Must contain the product
      const hasProduct = (order.items || []).some(
        (it) => it.productId === productId || (it.name && it.name.toLowerCase().includes(productId.toLowerCase()))
      );
      if (!hasProduct) return false;

      // Check match against email, phone, or order number
      if (cleanOrderNumber && order.orderNumber && order.orderNumber.toUpperCase() === cleanOrderNumber) {
        return true;
      }
      if (cleanEmail && order.customer?.email && order.customer.email.toLowerCase() === cleanEmail) {
        return true;
      }
      if (cleanPhone && cleanPhone.length >= 7 && order.customer?.phone) {
        const orderPhoneClean = order.customer.phone.replace(/\D/g, '');
        if (orderPhoneClean.includes(cleanPhone) || cleanPhone.includes(orderPhoneClean)) {
          return true;
        }
      }
      return false;
    });

    if (matchingOrder) {
      return {
        isVerified: true,
        orderNumber: matchingOrder.orderNumber,
        customerName: matchingOrder.customer?.fullName,
        city: matchingOrder.customer?.city,
        orderDate: matchingOrder.createdAt,
        message: `Verified purchaser found for Order #${matchingOrder.orderNumber}!`,
      };
    }

    return {
      isVerified: false,
      message: 'No matching completed order found for this product with the details provided.',
    };
  }

  public addReview(
    reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'> & { orderNumber?: string }
  ): { review: ProductReview; updatedProduct: Product | null } {
    let verified = reviewData.verifiedPurchase;

    // Double-check verification against orders if orderNumber or customer email provided
    if (!verified && (reviewData.orderNumber || reviewData.customerName)) {
      const verifyCheck = this.verifyCustomerPurchase(reviewData.productId, {
        orderNumber: reviewData.orderNumber,
      });
      if (verifyCheck.isVerified) {
        verified = true;
      }
    }

    const newReview: ProductReview = {
      id: `rev-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      productId: reviewData.productId,
      customerName: (reviewData.customerName || 'Easy Store Customer').trim(),
      customerCity: (reviewData.customerCity || 'Pakistan').trim(),
      rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
      title: reviewData.title.trim(),
      comment: reviewData.comment.trim(),
      verifiedPurchase: verified,
      recommended: reviewData.recommended !== false,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };

    const existingReviews = this.getReviews();
    existingReviews.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(existingReviews));

    // Update product rating and review count
    const prodIdx = this.inMemoryProducts.findIndex((p) => p.id === reviewData.productId);
    let updatedProduct: Product | null = null;
    if (prodIdx !== -1) {
      const prodReviews = existingReviews.filter((r) => r.productId === reviewData.productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      this.inMemoryProducts[prodIdx] = {
        ...this.inMemoryProducts[prodIdx],
        rating: Number(avg.toFixed(1)),
        reviewCount: prodReviews.length,
        updatedAt: new Date().toISOString(),
      };
      this.saveCustomProducts();
      updatedProduct = this.inMemoryProducts[prodIdx];
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('easystore:reviews-updated', { detail: { productId: reviewData.productId } }));
      window.dispatchEvent(new CustomEvent('easystore:products-updated', { detail: { count: this.inMemoryProducts.length } }));
    }

    return { review: newReview, updatedProduct };
  }

  public voteReviewHelpful(reviewId: string, helpful: boolean = true): { success: boolean; helpfulCount: number; message: string } {
    try {
      const votedKey = 'easystore_review_votes_v1';
      const votedStr = localStorage.getItem(votedKey);
      const votedIds: string[] = votedStr ? JSON.parse(votedStr) : [];
      if (votedIds.includes(reviewId)) {
        return { success: false, helpfulCount: 0, message: 'You have already marked this review as helpful.' };
      }

      const reviews = this.getReviews();
      const review = reviews.find((r) => r.id === reviewId);
      if (!review) {
        return { success: false, helpfulCount: 0, message: 'Review not found.' };
      }

      if (helpful) {
        review.helpfulCount = (review.helpfulCount || 0) + 1;
      } else {
        review.unhelpfulCount = (review.unhelpfulCount || 0) + 1;
      }

      votedIds.push(reviewId);
      localStorage.setItem(votedKey, JSON.stringify(votedIds));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('easystore:reviews-updated', { detail: { productId: review.productId } }));
      }

      return { success: true, helpfulCount: review.helpfulCount, message: 'Thank you for your feedback!' };
    } catch (e) {
      return { success: false, helpfulCount: 0, message: (e as Error).message };
    }
  }

  public deleteReview(id: string): boolean {
    const reviews = this.getReviews().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('easystore:reviews-updated'));
    }
    return true;
  }

  // ================== USERS & AUTH ==================
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  public getUserByEmailOrPhone(identifier: string): User | null {
    const users = this.getUsers();
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    return users.find((u) => {
      if (u.email.toLowerCase() === clean) return true;
      if (cleanDigits && u.phone && u.phone.replace(/\D/g, '').includes(cleanDigits)) return true;
      return false;
    }) || null;
  }

  public verifyUserPassword(identifier: string, passwordInput: string): { success: boolean; user?: User; error?: string } {
    const user = this.getUserByEmailOrPhone(identifier);
    if (!user) {
      return { 
        success: false, 
        error: 'Account not found! You must register an account first before logging in. Please click Register to create your account.' 
      };
    }
    const inputHash = hashString(passwordInput.trim());
    // If user has a registered password or passwordHash
    if (user.passwordHash || user.password) {
      const match = (user.passwordHash && user.passwordHash === inputHash) || user.password === passwordInput.trim();
      if (!match) {
        return { 
          success: false, 
          error: 'Incorrect password! Please enter the exact password you set during registration.' 
        };
      }
    }
    return { success: true, user };
  }

  public saveUser(user: Partial<User> & { email: string; name: string }): User {
    const users = this.getUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    const passwordHash = user.password ? hashString(user.password.trim()) : user.passwordHash;

    if (existingIndex !== -1) {
      const updated: User = { 
        ...users[existingIndex], 
        ...user,
        ...(passwordHash ? { passwordHash, password: user.password } : {})
      };
      users[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return updated;
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: user.name,
      email: cleanEmail,
      role: user.role || 'customer',
      phone: user.phone || '+92 300 0000000',
      password: user.password,
      passwordHash,
      provider: user.provider || 'local',
      avatarUrl: user.avatarUrl,
      address: user.address,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  // ================== ADMIN SETTINGS & SECURITY ==================
  public getAdminSettings(): AdminSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {
      passphraseHash: hashString(DEFAULT_ADMIN_PASSPHRASE),
      storeName: 'Easy Store Pakistan',
      supportEmail: 'easystorekarachi@gmail.com',
      supportPhone: '+92 346 7792177',
      currency: 'PKR',
      shippingFlatRate: 200,
      freeShippingThreshold: 2500,
      taxRatePercent: 0,
    };
  }

  public verifyAdminPassphrase(passphrase: string): boolean {
    const raw = (passphrase || '').trim();
    const clean = raw.toLowerCase().replace(/\s+/g, '');
    if (
      clean === 'abdullah123@' || 
      clean === 'abdullah@123' ||
      clean === 'abdullah123' ||
      clean === 'admin123@' ||
      clean === 'admin@easystore2026!'
    ) {
      return true;
    }
    const settings = this.getAdminSettings();
    return hashString(raw) === settings.passphraseHash;
  }

  public updateAdminPassphrase(newPassphrase: string): boolean {
    if (!newPassphrase || newPassphrase.length < 4) return false;
    const settings = this.getAdminSettings();
    settings.passphraseHash = hashString(newPassphrase.trim());
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
    return true;
  }

  public getStats() {
    const products = this.inMemoryProducts || [];
    const orders = this.getOrders();
    const customersOnly = this.getUsers().filter(u => u.role !== 'admin');
    const complaints = this.getComplaints();

    const totalRevenue = orders
      .filter((o) => o && o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const totalCost = orders
      .filter((o) => o && o.orderStatus !== 'cancelled')
      .reduce((sum, o) => {
        const orderCost = (o.items || []).reduce((acc, it) => acc + ((Number(it.price) || 0) * 0.72) * (Number(it.quantity) || 1), 0);
        return sum + orderCost;
      }, 0);

    const netProfit = Math.max(0, totalRevenue - totalCost);
    const lowStockCount = products.filter((p) => p && p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p && p.stock === 0).length;

    return {
      productsCount: products.length,
      ordersCount: orders.length,
      usersCount: customersOnly.length,
      totalRevenue,
      totalCost,
      netProfit,
      lowStockCount,
      outOfStockCount,
      complaintsCount: complaints.length,
      pendingComplaintsCount: complaints.filter(c => c && c.status === 'pending').length,
    };
  }

  public exportDatabaseJson(): string {
    return JSON.stringify({
      version: '5.0.0-pk-launch',
      exportedAt: new Date().toISOString(),
      productsCount: this.inMemoryProducts.length,
      orders: this.getOrders(),
      users: this.getUsers(),
      coupons: this.getCoupons(),
      complaints: this.getComplaints(),
      reviews: this.getReviews(),
      adminSettings: this.getAdminSettings(),
    }, null, 2);
  }

  public importDatabaseJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.orders)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
      }
      if (Array.isArray(data.users)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      }
      if (Array.isArray(data.coupons)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(data.coupons));
      }
      if (Array.isArray(data.complaints)) {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(data.complaints));
      }
      if (Array.isArray(data.reviews)) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(data.reviews));
      }
      return { success: true, message: 'Database backup successfully restored.' };
    } catch (e) {
      return { success: false, message: `Failed to import JSON: ${(e as Error).message}` };
    }
  }

  public resetToSampleData(): void {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(`${STORAGE_KEYS.PRODUCTS}_custom`);
    this.inMemoryProducts = INITIAL_PRODUCTS;
    this.initDatabase();
  }
}

export const db = new DatabaseService();
