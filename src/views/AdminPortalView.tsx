import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LayoutGrid, 
  Tag, 
  Ticket, 
  BarChart2, 
  Megaphone, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Globe, 
  ExternalLink,
  Search,
  ChevronRight,
  Zap, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Headphones, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Key, 
  X, 
  MessageSquare, 
  ShieldCheck, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2, 
  Check,
  Upload,
  Camera,
  ArrowLeft,
  ArrowRight,
  Eye,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/db';
import { CATEGORIES } from '../data/seedData';
import { BannerSlide, Order, OrderStatus, Product, ProductCategory, StoreViewMode, User, Coupon, Complaint, PaymentGatewayConfig } from '../types';
import { getPaymentGateways, savePaymentGateways, resetPaymentGateways } from '../services/paymentConfig';
import { OwnerAvatar } from '../components/OwnerAvatar';
import { BrandLogo } from '../components/BrandLogo';

interface AdminPortalViewProps {
  onNavigate: (view: StoreViewMode) => void;
  onRefreshCatalog: () => void;
}

type AdminTab = 
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'complaints'
  | 'categories'
  | 'brands'
  | 'coupons'
  | 'reports'
  | 'marketing'
  | 'content_pages'
  | 'banner_management'
  | 'payment_methods'
  | 'settings';

export const PROMOTION_BANNER_PRESETS = [
  {
    name: 'Mega Tech & Mobiles Fest',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=85',
    title: 'Mega Tech Fest: Smartphones & Smart Living',
    subtitle: '100% Original PTA Approved Mobiles   Free Fast Cash on Delivery   7-Day Replacement Warranty',
    badge: 'SPECIAL PROMOTION 2026',
    discountBadge: 'UP TO 50% OFF',
    ctaText: 'Shop Smartphones',
    ctaCategory: 'mobiles-tablets',
    searchFilter: 'Mobile',
  },
  {
    name: 'Shoes & Footwear Mega Sale',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85',
    title: 'Footwear & Shoes Clearance: Sneakers & Formal Leather',
    subtitle: 'Nike, Adidas, Bata & Service   100% Genuine Quality Guaranteed Nationwide',
    badge: 'MEGA SHOE FEST',
    discountBadge: 'BUY 1 GET 1 30% OFF',
    ctaText: 'Explore Footwear',
    ctaCategory: 'fashion',
    searchFilter: 'Shoes',
  },
  {
    name: 'Smart Living & Electronics',
    url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1600&q=85',
    title: 'Smart Living & Electronics: Watches & GaN Fast Chargers',
    subtitle: 'T900 Ultra 2, Anker Power Banks, Baseus 65W GaN Adapters & Gadgets',
    badge: 'SMART WEARABLES',
    discountBadge: 'FLAT 40% OFF',
    ctaText: 'Shop Electronics',
    ctaCategory: 'electronics',
    searchFilter: 'Watch',
  },
  {
    name: 'Studio Sound & ANC Earbuds',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85',
    title: 'Studio Sound: Wireless ANC Earbuds & Soundbars',
    subtitle: 'Apple AirPods Pro, Sony WH-1000XM5, JBL Flip 6 & P9 Wireless Headphones',
    badge: 'AUDIO BEATS',
    discountBadge: 'SAVE UP TO 55%',
    ctaText: 'Discover Audio Gear',
    ctaCategory: 'audio-sound',
    searchFilter: 'Earbuds',
  },
  {
    name: 'Fashion & Eastern Apparel',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
    title: 'Fashion & Style: Men & Women Collection',
    subtitle: 'Stitched Wash & Wear Kurtas, 3-Piece Lawn, Luxury Watches & Wallets',
    badge: 'SEASON SPECIAL',
    discountBadge: 'UP TO 40% OFF',
    ctaText: 'Explore Fashion',
    ctaCategory: 'fashion',
    searchFilter: 'Kurta',
  },
  {
    name: 'Pakistan Nationwide Mega Grand Sale',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=85',
    title: 'Pakistan Nationwide Mega Grand Sale',
    subtitle: 'Over 50,000+ Verified Products   Fast Cash on Delivery to All 150+ Cities in Pakistan',
    badge: 'NATIONWIDE CELEBRATION',
    discountBadge: 'FREE DELIVERY OVER RS. 2,500',
    ctaText: 'Browse All Products',
    ctaCategory: 'all',
    searchFilter: '',
  },
];

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  onNavigate,
  onRefreshCatalog,
}) => {
  const { isAdminUnlocked, unlockAdminGate, lockAdminGate } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const [inlinePassphrase, setInlinePassphrase] = useState('');
  const [inlineAuthError, setInlineAuthError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceSlotInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('pending_payment');
  const [statusComment, setStatusComment] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('TCS Express Pakistan');

  const [customers, setCustomers] = useState<User[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [newPassphrase, setNewPassphrase] = useState('');

  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState<boolean>(false);
  const [bannerForm, setBannerForm] = useState<Partial<BannerSlide>>({
    title: '',
    subtitle: '',
    badge: 'NEW DEAL',
    discountBadge: 'SPECIAL OFFER',
    ctaText: 'Shop Now',
    ctaCategory: 'mobiles-tablets',
    searchFilter: '',
    imageUrl: '',
    active: true,
  });

  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>(() => getPaymentGateways());
  const [editingGateway, setEditingGateway] = useState<PaymentGatewayConfig | null>(null);
  const [isAddingGateway, setIsAddingGateway] = useState(false);
  const [gatewayForm, setGatewayForm] = useState<Partial<PaymentGatewayConfig>>({
    name: '',
    code: '',
    type: 'wallet',
    accountTitle: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    branchCode: '',
    instructions: '',
    enabled: true,
    badge: '',
  });

  const loadData = () => {
    try {
      setProducts(db.getProducts() || []);
      setOrders(db.getOrders() || []);
      setCustomers(db.getUsers() || []);
      setCoupons(db.getCoupons() || []);
      setComplaints(db.getComplaints() || []);
      setBanners(db.getBanners() || []);
      setPaymentGateways(getPaymentGateways());
    } catch (e) {
      console.error('Error loading admin data', e);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      loadData();
    }
  }, [isAdminUnlocked]);

  const handleToggleGateway = (id: string) => {
    const updated = paymentGateways.map((g) => g.id === id ? { ...g, enabled: !g.enabled } : g);
    setPaymentGateways(updated);
    savePaymentGateways(updated);
    showToast('Payment Method Updated', 'Gateway status updated.', 'success');
  };

  const handleDeleteGateway = (id: string) => {
    if (paymentGateways.length <= 1) {
      showToast('Action Denied', 'At least one payment method must remain active.', 'error');
      return;
    }
    const updated = paymentGateways.filter((g) => g.id !== id);
    setPaymentGateways(updated);
    savePaymentGateways(updated);
    showToast('Payment Method Removed', 'Method deleted from store checkout.', 'info');
  };

  const handleResetGateways = () => {
    const defaults = resetPaymentGateways();
    setPaymentGateways(defaults);
    showToast('Default Accounts Restored', 'Official Easy Store payment accounts restored.', 'success');
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayForm.name?.trim()) {
      showToast('Validation Error', 'Payment gateway name is required.', 'error');
      return;
    }

    if (editingGateway) {
      const updated = paymentGateways.map((g) =>
        g.id === editingGateway.id
          ? {
              ...g,
              name: gatewayForm.name!.trim(),
              type: gatewayForm.type || 'wallet',
              accountTitle: gatewayForm.accountTitle?.trim() || '',
              accountNumber: gatewayForm.accountNumber?.trim() || '',
              bankName: gatewayForm.bankName?.trim() || '',
              iban: gatewayForm.iban?.trim() || '',
              branchCode: gatewayForm.branchCode?.trim() || '',
              instructions: gatewayForm.instructions?.trim() || '',
              enabled: gatewayForm.enabled ?? true,
              badge: gatewayForm.badge?.trim() || '',
            }
          : g
      );
      setPaymentGateways(updated);
      savePaymentGateways(updated);
      showToast('Gateway Saved', `${gatewayForm.name} configuration updated.`, 'success');
    } else {
      const newGateway: PaymentGatewayConfig = {
        id: `pay_${Date.now()}`,
        name: gatewayForm.name!.trim(),
        code: gatewayForm.code?.trim().toLowerCase().replace(/\s+/g, '_') || `custom_${Date.now()}`,
        type: gatewayForm.type || 'wallet',
        accountTitle: gatewayForm.accountTitle?.trim() || 'Easy Store Pakistan',
        accountNumber: gatewayForm.accountNumber?.trim() || '',
        bankName: gatewayForm.bankName?.trim() || '',
        iban: gatewayForm.iban?.trim() || '',
        branchCode: gatewayForm.branchCode?.trim() || '',
        instructions: gatewayForm.instructions?.trim() || 'Please transfer amount and provide payment reference at checkout.',
        enabled: gatewayForm.enabled ?? true,
        badge: gatewayForm.badge?.trim() || '',
      };
      const updated = [...paymentGateways, newGateway];
      setPaymentGateways(updated);
      savePaymentGateways(updated);
      showToast('New Gateway Added', `${newGateway.name} is now available on checkout.`, 'success');
    }

    setEditingGateway(null);
    setIsAddingGateway(false);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.imageUrl) {
      showToast('Validation Error', 'Title and Image URL are required.', 'error');
      return;
    }

    if (editingBanner) {
      db.updateBanner(editingBanner.id, bannerForm);
      showToast('Banner Updated', `Updated "${bannerForm.title}"`, 'success');
    } else {
      const newBanner: BannerSlide = {
        id: `banner-${Date.now()}`,
        title: bannerForm.title || 'Special Promotion',
        subtitle: bannerForm.subtitle || '',
        badge: bannerForm.badge || 'PROMO',
        discountBadge: bannerForm.discountBadge || '',
        ctaText: bannerForm.ctaText || 'Shop Now',
        ctaCategory: bannerForm.ctaCategory || 'all',
        searchFilter: bannerForm.searchFilter || '',
        imageUrl: bannerForm.imageUrl || '',
        active: bannerForm.active ?? true,
        order: banners.length + 1,
      };
      db.saveBanner(newBanner);
      showToast('Banner Created', `Added "${newBanner.title}"`, 'success');
    }

    setEditingBanner(null);
    setIsAddingBanner(false);
    setBanners(db.getBanners());
    onRefreshCatalog();
  };

  const handleToggleBannerActive = (banner: BannerSlide) => {
    db.updateBanner(banner.id, { active: !banner.active });
    setBanners(db.getBanners());
    showToast('Banner Updated', `Banner is now ${!banner.active ? 'Active' : 'Inactive'}`, 'info');
  };

  const handleDeleteBanner = (id: string) => {
    if (banners.length <= 1) {
      showToast('Cannot Delete', 'At least 1 banner must remain.', 'error');
      return;
    }
    db.deleteBanner(id);
    setBanners(db.getBanners());
    showToast('Banner Removed', 'Slide deleted from carousel.', 'info');
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;
    const reordered = db.reorderBanners(newBanners.map(b => b.id));
    setBanners(reordered);
  };

  const handleResetBanners = () => {
    const list = db.resetDefaultBanners();
    setBanners(list);
    showToast('Banners Restored', 'Official banner slides restored.', 'success');
  };

  const stats = db.getStats() || {
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    complaintsCount: 0,
    pendingComplaintsCount: 0,
  };

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#f85606] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0f3460]">Store Owner / Admin Panel</h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Enter your master administrative passphrase to access management controls, payment gateways, products, and customer orders.
            </p>
          </div>

          {inlineAuthError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-semibold">
              {inlineAuthError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInlineAuthError('');
              const res = unlockAdminGate(inlinePassphrase);
              if (res.success) {
                setInlinePassphrase('');
                loadData();
                showToast('Welcome!', 'Admin portal unlocked.', 'success');
              } else {
                setInlineAuthError(res.error || 'Invalid passcode.');
              }
            }}
            className="space-y-3"
          >
            <input
              type="password"
              required
              value={inlinePassphrase}
              onChange={(e) => setInlinePassphrase(e.target.value)}
              placeholder="Enter passcode (default: abdullah123@)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#f85606] focus:bg-white"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              Verify &amp; Unlock Admin Panel
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Return to Public Store
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            Passcode: <code className="font-mono font-bold text-[#f85606]">abdullah123@</code>
          </p>
        </div>
      </div>
    );
  }

  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    if (orderStatusFilter === 'all') return true;
    return o.orderStatus === orderStatusFilter;
  });

  const filteredCustomers = (customers || []).filter((c) => {
    if (!c) return false;
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || ((c.phone || '').includes(q));
  });

  const totalSalesAmount = stats.totalRevenue || 0;
  const totalOrdersCount = orders.length;
  const totalCustomersCount = (customers || []).filter(c => c && c.role !== 'admin').length;
  const totalProductsCount = products.length;
  const netProfitAmount = stats.netProfit || 0;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim() || editingProduct.price === undefined) {
      showToast('Validation Error', 'Product title and price are required.', 'error');
      return;
    }

    const cleanImages = (editingProduct.images || [])
      .map(url => (url || '').trim())
      .filter(Boolean);

    db.saveProduct({
      id: editingProduct.id,
      name: editingProduct.name.trim(),
      category: (editingProduct.category as ProductCategory) || 'mobiles-tablets',
      subCategory: editingProduct.subCategory?.trim() || undefined,
      brand: editingProduct.brand?.trim() || 'Easy Store Verified',
      price: Math.max(0, Number(editingProduct.price) || 0),
      compareAtPrice: editingProduct.compareAtPrice ? Math.max(0, Number(editingProduct.compareAtPrice)) : undefined,
      cost: editingProduct.cost ? Number(editingProduct.cost) : undefined,
      stock: Math.max(0, Number(editingProduct.stock) || 0),
      sku: editingProduct.sku?.trim() || `PK-${Date.now().toString().slice(-6)}`,
      description: editingProduct.description?.trim() || 'Verified product from Easy Store Pakistan.',
      shortDescription: editingProduct.shortDescription?.trim() || '100% Genuine with official checking warranty in Pakistan.',
      images: cleanImages.length > 0 ? cleanImages : [
        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
      ],
      rating: editingProduct.rating || 4.8,
      reviewCount: editingProduct.reviewCount || 1,
      specs: editingProduct.specs && Object.keys(editingProduct.specs).length > 0 ? editingProduct.specs : {
        'Condition': 'Brand New Sealed',
        'Warranty': 'Official Brand Warranty in Pakistan',
      },
      featured: editingProduct.featured ?? false,
      bestSeller: editingProduct.bestSeller ?? false,
    });

    setIsProductModalOpen(false);
    setEditingProduct(null);
    loadData();
    onRefreshCatalog();
    showToast('Catalog Updated', `"${editingProduct.name}" saved successfully to store.`, 'success');
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from store catalog?`)) {
      db.deleteProduct(id);
      loadData();
      onRefreshCatalog();
      showToast('Deleted', `"${name}" removed from catalog.`, 'info');
    }
  };

  // Helper to compress image files from user system before storage
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.84));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleUploadImagesFromSystem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    setIsProcessingImage(true);
    try {
      const newImagesList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i]);
        if (compressed) {
          newImagesList.push(compressed);
        }
      }

      const existing = editingProduct.images ? [...editingProduct.images] : [];
      setEditingProduct({
        ...editingProduct,
        images: [...existing, ...newImagesList],
      });
      showToast('Images Added', `Successfully added ${newImagesList.length} photo(s) from your device.`, 'success');
    } catch {
      showToast('Upload Error', 'Could not process images from system.', 'error');
    } finally {
      setIsProcessingImage(false);
      if (fileUploadInputRef.current) fileUploadInputRef.current.value = '';
    }
  };

  const handleReplaceSingleImageFromSystem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null || !editingProduct) return;

    setIsProcessingImage(true);
    try {
      const compressed = await compressImageFile(file);
      if (compressed) {
        const current = editingProduct.images ? [...editingProduct.images] : [];
        current[replaceTargetIndex] = compressed;
        setEditingProduct({
          ...editingProduct,
          images: current,
        });
        showToast('Image Replaced', `Image #${replaceTargetIndex + 1} updated from your system.`, 'success');
      }
    } catch {
      showToast('Replace Error', 'Could not update image.', 'error');
    } finally {
      setIsProcessingImage(false);
      setReplaceTargetIndex(null);
      if (replaceSlotInputRef.current) replaceSlotInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!newProductImageUrl.trim() || !editingProduct) return;
    const current = editingProduct.images ? [...editingProduct.images] : [];
    current.push(newProductImageUrl.trim());
    setEditingProduct({
      ...editingProduct,
      images: current,
    });
    setNewProductImageUrl('');
    showToast('Image Added', 'New image URL added to gallery.', 'success');
  };

  const handleRemoveImageSlot = (index: number) => {
    if (!editingProduct) return;
    const current = editingProduct.images ? [...editingProduct.images] : [];
    if (current.length <= 1) {
      showToast('Cannot Remove', 'Every product must have at least 1 image.', 'error');
      return;
    }
    current.splice(index, 1);
    setEditingProduct({
      ...editingProduct,
      images: current,
    });
  };

  const handleSetPrimaryCoverImage = (index: number) => {
    if (!editingProduct || index === 0) return;
    const current = editingProduct.images ? [...editingProduct.images] : [];
    const [selected] = current.splice(index, 1);
    current.unshift(selected);
    setEditingProduct({
      ...editingProduct,
      images: current,
    });
    showToast('Cover Photo Set', 'This image is now the primary store cover photo.', 'success');
  };

  const handleMoveImageSlot = (index: number, direction: 'left' | 'right') => {
    if (!editingProduct) return;
    const current = editingProduct.images ? [...editingProduct.images] : [];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;
    setEditingProduct({
      ...editingProduct,
      images: current,
    });
  };

  const handleAddPresetAngle = (presetUrl: string, label: string) => {
    if (!editingProduct) return;
    const current = editingProduct.images ? [...editingProduct.images] : [];
    current.push(presetUrl);
    setEditingProduct({
      ...editingProduct,
      images: current,
    });
    showToast('Angle Added', `Added ${label} shot to product gallery.`, 'success');
  };

  const handleQuickStockAdjust = (id: string, delta: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const nextStock = Math.max(0, prod.stock + delta);
    db.updateProductStock(id, nextStock);
    loadData();
    onRefreshCatalog();
  };

  const handleOpenOrderInspect = (order: Order) => {
    setInspectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setStatusComment('');
    setTrackingNumber(order.trackingNumber || '');
    setCarrier(order.carrier || 'TCS Express Pakistan');
  };

  const handleUpdateOrderStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedOrder) return;
    const res = db.updateOrderStatus(
      inspectedOrder.id,
      newOrderStatus,
      statusComment.trim() || undefined,
      'Store Administrator'
    );
    if (trackingNumber.trim()) {
      db.updateOrderTracking(inspectedOrder.id, trackingNumber.trim(), carrier);
    }
    if (res.success && res.order) {
      setInspectedOrder(res.order);
      loadData();
      onRefreshCatalog();
      showToast('Order Updated', `Status updated to ${newOrderStatus.replace('_', ' ')}.`, 'success');
    } else {
      showToast('Error', res.error || 'Failed to update order.', 'error');
    }
  };

  const handleExportJson = () => {
    const jsonStr = db.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easystore-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup Generated', 'JSON database backup downloaded.', 'success');
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog, orders, and inventory to initial seed data?')) {
      db.resetToSampleData();
      loadData();
      onRefreshCatalog();
      showToast('Catalog Reset', 'Default store inventory restored.', 'info');
    }
  };

  const handleChangePassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassphrase.length < 6) {
      showToast('Error', 'Passphrase must be at least 6 characters long.', 'error');
      return;
    }
    const ok = db.updateAdminPassphrase(newPassphrase);
    if (ok) {
      setNewPassphrase('');
      showToast('Security Updated', 'Master admin passphrase changed successfully.', 'success');
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newCoupon: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      discountPercentage: newCouponDiscount,
      description: newCouponDesc.trim() || `${newCouponDiscount}% Off Storewide`,
      active: true,
      minOrder: 1000,
    };
    const updated = [...coupons, newCoupon];
    setCoupons(updated);
    localStorage.setItem('easystore_pk_coupons_v5', JSON.stringify(updated));
    setNewCouponCode('');
    setNewCouponDesc('');
    showToast('Coupon Created', `Code ${newCoupon.code} is now active!`, 'success');
  };

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payment_methods', label: 'Payment Gateways & Accounts', icon: CreditCard, badge: paymentGateways.filter(g => g.enabled).length },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.length > 0 ? orders.length : undefined },
    { id: 'customers', label: 'Customers', icon: Users, badge: customers.filter(c => c.role !== 'admin').length > 0 ? customers.filter(c => c.role !== 'admin').length : undefined },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare, badge: complaints.filter(c => c.status === 'pending').length > 0 ? complaints.filter(c => c.status === 'pending').length : undefined },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'brands', label: 'Brands', icon: Tag },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'reports', label: 'Reports & Profit', icon: BarChart2 },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'content_pages', label: 'Content Pages', icon: FileText },
    { id: 'banner_management', label: 'Banner Management', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col antialiased">
      {/* TOP NAVBAR */}
      <header className="bg-gradient-to-r from-[#f85606] via-[#ff6a00] to-[#e04c00] text-white relative z-20 shadow-sm border-b border-[#d9480f]">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-white hover:bg-black/10 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
            >
              <BrandLogo size="sm" light showTagline={false} />
            </button>
          </div>

          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search orders, products, customers..."
                className="w-full bg-white/15 border border-white/30 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-orange-100 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/25 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-orange-100 absolute left-3.5 top-2.5 sm:top-3" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button
              onClick={() => setActiveTab('payment_methods')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
              title="Manage Payment Gateways & Accounts"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Gateways</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Store Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 hover:bg-white/10 px-2 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <OwnerAvatar size="md" className="ring-2 ring-white/80 shadow-xs" />
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Muhammad Abdullah</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-300 inline" />
                  </p>
                  <p className="text-[10px] text-orange-100">Founder &amp; Super Admin</p>
                </div>
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 py-2 z-50 animate-in fade-in text-xs font-medium"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60 rounded-t-2xl">
                    <OwnerAvatar size="lg" className="ring-2 ring-[#f85606]" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Muhammad Abdullah</p>
                      <p className="text-[11px] text-slate-500 truncate">easystorekarachi@gmail.com</p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Verified Store Owner
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('catalog');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Visit Public Store
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('payment_methods');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Payment Gateways &amp; Accounts
                  </button>

                  <button
                    onClick={() => {
                      lockAdminGate();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100 font-semibold"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Admin Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`bg-[#0f172a] text-white w-64 shrink-0 flex flex-col justify-between transition-all duration-300 z-30 border-r border-slate-800 ${
            mobileSidebarOpen ? 'fixed inset-y-0 left-0 pt-16 z-50 shadow-2xl block' : 'hidden lg:flex'
          }`}
        >
          <div className="py-4 px-3 space-y-1 overflow-y-auto">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#f85606] text-white shadow-md shadow-orange-500/25 font-bold scale-[1.01]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-black/25 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => onNavigate('catalog')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer mt-2 pt-3 border-t border-slate-800"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#f85606]" />
                <span>Website View</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="p-3 border-t border-slate-800 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#f85606]/20 text-[#f85606] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white">Support Center</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">+92 346 7792177</p>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-medium">
              Easy Store Pakistan   Owner Abdullah
            </p>
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB: PAYMENT METHODS & GATEWAYS */}
          {activeTab === 'payment_methods' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460] flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#f85606]" />
                    Payment Gateways &amp; Accounts Configuration
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage and update payment methods, add new account credentials, change bank details, or toggle gateway options active on checkout.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleResetGateways}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Restore Defaults</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingGateway(null);
                      setGatewayForm({
                        name: '',
                        code: '',
                        type: 'wallet',
                        accountTitle: 'Muhammad Abdullah / Easy Store',
                        accountNumber: '0346-7792177',
                        bankName: '',
                        iban: '',
                        branchCode: '',
                        instructions: 'Please transfer amount and provide payment transaction reference at checkout.',
                        enabled: true,
                        badge: '0% Extra Fee',
                      });
                      setIsAddingGateway(true);
                    }}
                    className="px-4 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Payment Gateway</span>
                  </button>
                </div>
              </div>

              {/* Summary Banner */}
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f85606] text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0f3460] text-sm">
                      Active Payment Gateways: {paymentGateways.filter(g => g.enabled).length} Enabled
                    </h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Any payment method enabled, disabled, or updated here will instantly reflect on the customer checkout page in real-time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('checkout')}
                  className="px-4 py-2 bg-white hover:bg-orange-100 text-[#f85606] border border-orange-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs w-fit"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Checkout View</span>
                </button>
              </div>

              {/* Gateways Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentGateways.map((gw) => {
                  const isWallet = gw.type === 'wallet';
                  const isBank = gw.type === 'bank';
                  const isCard = gw.type === 'card';
                  const isCod = gw.type === 'cod';

                  return (
                    <div
                      key={gw.id}
                      className={`bg-white border rounded-3xl p-5 shadow-xs space-y-4 transition-all flex flex-col justify-between ${
                        gw.enabled ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f85606] border border-orange-100">
                              {isWallet && <Smartphone className="w-5 h-5 text-[#ec4899]" />}
                              {isBank && <Building2 className="w-5 h-5 text-[#f85606]" />}
                              {isCard && <CreditCard className="w-5 h-5 text-indigo-600" />}
                              {isCod && <Banknote className="w-5 h-5 text-emerald-600" />}
                              {!isWallet && !isBank && !isCard && !isCod && <CreditCard className="w-4 h-4 text-[#f85606]" />}
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-[#0f3460] leading-snug">{gw.name}</h4>
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                Code: {gw.code}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              gw.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {gw.enabled ? 'Active on Checkout' : 'Disabled'}
                          </span>
                        </div>

                        {/* Account Details Box */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                          {gw.accountTitle && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 font-medium">Account Title:</span>
                              <span className="font-bold text-slate-800">{gw.accountTitle}</span>
                            </div>
                          )}
                          {gw.accountNumber && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 font-medium">Account / Phone:</span>
                              <span className="font-mono font-bold text-[#f85606]">{gw.accountNumber}</span>
                            </div>
                          )}
                          {gw.bankName && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 font-medium">Bank Name:</span>
                              <span className="font-bold text-slate-800">{gw.bankName}</span>
                            </div>
                          )}
                          {gw.iban && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 font-medium">IBAN / Raast:</span>
                              <span className="font-mono text-[10px] text-slate-700">{gw.iban}</span>
                            </div>
                          )}
                          {gw.badge && (
                            <div className="pt-1">
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                {gw.badge}
                              </span>
                            </div>
                          )}
                        </div>

                        {gw.instructions && (
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {gw.instructions}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleToggleGateway(gw.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            gw.enabled
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {gw.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingGateway(gw);
                              setGatewayForm({ ...gw });
                              setIsAddingGateway(false);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGateway(gw.id)}
                            title="Delete Payment Gateway"
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add / Edit Gateway Modal */}
              {(isAddingGateway || editingGateway) && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-black text-[#0f3460]">
                          {editingGateway ? `Edit Gateway: ${editingGateway.name}` : 'Add New Payment Gateway / Account'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Specify account title, number, bank details, and customer checkout instructions.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingGateway(null);
                          setIsAddingGateway(false);
                        }}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveGateway} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Gateway Display Name *</label>
                          <input
                            type="text"
                            required
                            value={gatewayForm.name || ''}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, name: e.target.value })}
                            placeholder="e.g. EasyPaisa Mobile Wallet"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Gateway Type</label>
                          <select
                            value={gatewayForm.type || 'wallet'}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, type: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#f85606]"
                          >
                            <option value="wallet">Mobile Wallet (EasyPaisa / JazzCash / SadaPay)</option>
                            <option value="bank">Bank Transfer (Meezan / HBL / UBL)</option>
                            <option value="card">Card Processing Gateway</option>
                            <option value="cod">Cash on Delivery</option>
                            <option value="custom">Other Custom Gateway</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Title *</label>
                          <input
                            type="text"
                            required
                            value={gatewayForm.accountTitle || ''}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, accountTitle: e.target.value })}
                            placeholder="e.g. Muhammad Abdullah / Easy Store"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Account / Mobile Number *</label>
                          <input
                            type="text"
                            required
                            value={gatewayForm.accountNumber || ''}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, accountNumber: e.target.value })}
                            placeholder="e.g. 0346-7792177"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                      </div>

                      {(gatewayForm.type === 'bank' || gatewayForm.bankName) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={gatewayForm.bankName || ''}
                              onChange={(e) => setGatewayForm({ ...gatewayForm, bankName: e.target.value })}
                              placeholder="e.g. Meezan Bank Ltd"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">IBAN / Raast ID</label>
                            <input
                              type="text"
                              value={gatewayForm.iban || ''}
                              onChange={(e) => setGatewayForm({ ...gatewayForm, iban: e.target.value })}
                              placeholder="e.g. PK45MEZN0001020103445892"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#f85606]"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Instructions for Checkout Buyer</label>
                        <textarea
                          rows={2}
                          value={gatewayForm.instructions || ''}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, instructions: e.target.value })}
                          placeholder="e.g. Transfer amount to our account and enter transaction ID during checkout."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="gw_enabled"
                          checked={gatewayForm.enabled ?? true}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, enabled: e.target.checked })}
                          className="w-4 h-4 accent-[#f85606] cursor-pointer"
                        />
                        <label htmlFor="gw_enabled" className="text-xs font-bold text-slate-700 cursor-pointer">
                          Enabled &amp; visible to customers on Checkout Page
                        </label>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGateway(null);
                            setIsAddingGateway(false);
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20"
                        >
                          {editingGateway ? 'Save Gateway' : 'Add Gateway'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#f85606] flex items-center justify-center shadow-xs">
                    <LayoutDashboard className="w-5 h-5 stroke-[2.3]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f3460] tracking-tight">
                      Store Dashboard
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Welcome back, Muhammad Abdullah! Here is your live store overview.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="px-4 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    <span>Visit Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 5 TOP KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div 
                  onClick={() => setActiveTab('orders')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#f85606] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Orders</p>
                      <h3 className="text-2xl font-black text-[#0f3460] font-mono mt-0.5">
                        {totalOrdersCount}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {totalOrdersCount === 0 ? 'Ready for live orders' : `${totalOrdersCount} placed`}
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('reports')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#10b981] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <span className="text-lg font-black font-mono">Rs</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Sales</p>
                      <h3 className="text-xl font-black text-[#0f3460] font-mono mt-0.5">
                        Rs. {totalSalesAmount.toLocaleString()}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Gross sales revenue
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('payment_methods')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#ec4899] text-white flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Gateways</p>
                      <h3 className="text-2xl font-black text-[#0f3460] font-mono mt-0.5">
                        {paymentGateways.filter(g => g.enabled).length}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Active payment methods
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('customers')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#8b5cf6] text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Customers</p>
                      <h3 className="text-2xl font-black text-[#0f3460] font-mono mt-0.5">
                        {totalCustomersCount}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Registered buyers
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('products')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#f97316] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Products</p>
                      <h3 className="text-2xl font-black text-[#0f3460] font-mono mt-0.5">
                        {totalProductsCount}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Active catalog inventory
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK OPERATIONS ROW */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#f85606]" />
                    <h3 className="font-bold text-sm text-[#0f3460]">Quick Operations</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Click any tool to open</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <button
                    onClick={() => setActiveTab('payment_methods')}
                    className="p-3 bg-orange-50 hover:bg-orange-100 text-[#f85606] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-orange-200 shadow-2xs"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Gateways</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct({
                        category: 'mobiles-tablets',
                        stock: 20,
                        price: 4999,
                        images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    <Package className="w-5 h-5 text-emerald-600" />
                    <span>Add Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    <ShoppingCart className="w-5 h-5 text-indigo-600" />
                    <span>Manage Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    <LayoutGrid className="w-5 h-5 text-purple-600" />
                    <span>Categories</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('banner_management')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    <ImageIcon className="w-5 h-5 text-pink-600" />
                    <span>Banners</span>
                  </button>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    <Globe className="w-5 h-5 text-[#f85606]" />
                    <span>Public Store</span>
                  </button>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#f85606]" />
                    <h3 className="font-bold text-sm text-[#0f3460]">Recent Customer Orders</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#f85606] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Product(s)</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-bold text-slate-700 text-xs">No orders placed yet</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              When customers place orders via COD, EasyPaisa, or JazzCash, they will appear here live.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-orange-50/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#f85606]">
                              #{o.orderNumber}
                            </td>
                            <td className="py-2.5 px-3 text-slate-800 font-semibold whitespace-nowrap">
                              {o.customer?.fullName || 'Customer'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="truncate max-w-[150px] block text-slate-700">
                                {o.items?.[0]?.name || 'Item'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0f3460] whitespace-nowrap">
                              Rs. {(o.total || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 capitalize">
                              {o.paymentMethod || 'cod'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#f85606]">
                                {o.orderStatus?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleOpenOrderInspect(o)}
                                className="px-2.5 py-1 bg-[#f85606] hover:bg-[#e04c00] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Products &amp; Inventory</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage catalog items, pricing in Pakistani Rupees (Rs.), SKU codes and stock quantities.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      category: 'mobiles-tablets',
                      brand: 'Easy Store Verified',
                      subCategory: 'Smartphones & Tablets',
                      stock: 20,
                      price: 24999,
                      compareAtPrice: 29999,
                      sku: `PK-${Date.now().toString().slice(-6)}`,
                      shortDescription: '100% Genuine with official checking warranty in Pakistan.',
                      description: 'Brand new verified product with official brand warranty and nationwide Cash on Delivery across Pakistan.',
                      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'],
                      specs: {
                        'Condition': 'Brand New Sealed Box',
                        'Warranty': 'Official Brand Warranty',
                        'PTA Status': 'Official Approved',
                      },
                      featured: false,
                      bestSeller: false,
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New Product
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title or SKU..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#f85606]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-[#f85606] cursor-pointer"
                >
                  <option value="all">All Departments ({products.length})</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="py-3 px-4">Item &amp; SKU</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock Level</th>
                        <th className="py-3 px-4">Quick Adjust</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.slice(0, 50).map((p) => {
                        const isLow = p.stock > 0 && p.stock <= 5;
                        const isOut = p.stock === 0;

                        return (
                          <tr key={p.id} className="hover:bg-orange-50/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=100&q=80'}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 max-w-xs">
                                  <p className="font-bold text-[#0f3460] truncate">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="capitalize px-2.5 py-0.5 rounded-lg bg-orange-50 text-[#f85606] border border-orange-100 text-[11px] font-semibold">
                                {p.category?.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#0f3460]">
                              Rs. {(p.price || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                  isOut
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : isLow
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, -1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer border border-slate-200"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-mono font-bold text-slate-800">{p.stock}</span>
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, 1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer border border-slate-200"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct({
                                      ...p,
                                      images: p.images && p.images.length > 0 ? [...p.images] : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
                                      specs: p.specs && Object.keys(p.specs).length > 0 ? { ...p.specs } : {
                                        'Condition': 'Brand New Sealed Box',
                                        'Warranty': 'Official Brand Warranty in Pakistan',
                                      },
                                    });
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-[#f85606] border border-slate-200 cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Customer Orders</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Track shipments, verify payments, and dispatch courier tracking across Pakistan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Filter:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold cursor-pointer shadow-xs"
                  >
                    <option value="all">All Orders ({orders.length})</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="font-bold text-slate-700">No orders match filter.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr
                            key={o.id}
                            onClick={() => handleOpenOrderInspect(o)}
                            className="hover:bg-orange-50/40 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-[#f85606]">
                              #{o.orderNumber}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#0f3460]">{o.customer?.fullName || 'Customer'}</p>
                              <p className="text-[10px] text-slate-500">{o.customer?.phone}</p>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-600">
                              {o.customer?.city || 'Pakistan'}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {o.paymentMethod}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-[#f85606]">
                                {o.orderStatus?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#0f3460]">
                              Rs. {(o.total || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenOrderInspect(o);
                                }}
                                className="px-3 py-1 bg-orange-50 hover:bg-[#f85606] hover:text-white text-[#f85606] border border-orange-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Customer Directory</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    View registered users, delivery addresses, and customer profiles.
                  </p>
                </div>
                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer by name or email..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#0f3460]">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.email}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">{c.phone || '+92 300 0000000'}</td>
                        <td className="py-3 px-4">{c.address?.city || 'Pakistan'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {c.role === 'admin' ? 'Admin' : 'Shopper'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">
                    Customer Complaints &amp; Inquiries
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage customer dispute resolution, damaged item claims, return requests, and respond directly.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {complaints.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No Customer Complaints</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {complaints.map((c) => (
                      <div key={c.id} className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#0f3460]">{c.subject}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 capitalize">
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{c.message}</p>
                        <div className="text-[11px] text-slate-500 flex gap-4">
                          <span>By: {c.customerName} ({c.customerEmail})</span>
                          {c.orderNumber && <span>Order: #{c.orderNumber}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Store Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#0f3460]">{cat.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{cat.productCount} active products</p>
                    </div>
                    <button
                      onClick={() => {
                        setProductCategoryFilter(cat.id);
                        setActiveTab('products');
                      }}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-[#f85606] hover:text-white text-[#f85606] border border-orange-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      View Items
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Promotional Coupons</h2>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-bold text-sm text-[#0f3460] mb-3">Create New Promotional Code</h3>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="Coupon Code (e.g. FLASH25)"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    placeholder="Discount %"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    placeholder="Description label"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs py-2 cursor-pointer shadow-sm transition-all"
                  >
                    Activate Coupon
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.code} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                    <span className="font-mono font-black text-base text-[#f85606] px-2.5 py-1 bg-orange-50 rounded-lg border border-orange-200">
                      {c.code}
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-1">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Financial Reports</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Revenue</span>
                  <h3 className="text-2xl font-black text-[#0f3460] font-mono">
                    Rs. {totalSalesAmount.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Net Profit</span>
                  <h3 className="text-2xl font-black text-emerald-600 font-mono">
                    Rs. {netProfitAmount.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Orders</span>
                  <h3 className="text-2xl font-black text-[#0f3460] font-mono">
                    {totalOrdersCount}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BANNER MANAGEMENT */}
          {activeTab === 'banner_management' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460] flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-[#f85606]" />
                    Homepage Banner Carousel Management
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Customize the commercial banner slides rotated on the store homepage.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetBanners}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                  <button
                    onClick={() => {
                      setEditingBanner(null);
                      setBannerForm({
                        title: '',
                        subtitle: '',
                        badge: 'SPECIAL PROMO',
                        discountBadge: 'UP TO 30% OFF',
                        ctaText: 'Shop Now',
                        ctaCategory: 'mobiles-tablets',
                        searchFilter: '',
                        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1600&q=85',
                        active: true,
                      });
                      setIsAddingBanner(true);
                    }}
                    className="px-4 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Banner</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {banners.map((banner, index) => (
                  <div key={banner.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                    <div className="relative rounded-xl overflow-hidden h-40 bg-slate-900 border border-slate-200 group">
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-between p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f85606] text-white shadow-xs">
                            {banner.badge || 'PROMOTION'}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            banner.active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {banner.active ? 'Active on Carousel' : 'Inactive'}
                          </span>
                        </div>
                        {banner.discountBadge && (
                          <span className="self-start text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                            {banner.discountBadge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-[#0f3460] line-clamp-1">{banner.title}</h4>
                        <span className="text-[11px] text-slate-400 shrink-0 font-mono">#{banner.order || index + 1}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{banner.subtitle}</p>
                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 font-medium">Target:</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                          {banner.ctaCategory || 'all'}
                        </span>
                        <span className="text-slate-500 font-medium ml-2">Button:</span>
                        <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#f85606] font-semibold text-[10px]">
                          {banner.ctaText || 'Shop Now'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveBanner(index, 'up')}
                          disabled={index === 0}
                          title="Move Slide Up in Carousel Order"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveBanner(index, 'down')}
                          disabled={index === banners.length - 1}
                          title="Move Slide Down in Carousel Order"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingBanner(banner);
                            setBannerForm({ ...banner });
                            setIsAddingBanner(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f85606] hover:bg-[#e04c00] text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Banner</span>
                        </button>
                        <button
                          onClick={() => handleToggleBannerActive(banner)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            banner.active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {banner.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          title="Delete Banner"
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BANNER EDIT / ADD MODAL */}
              {isAddingBanner && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-6 py-4 bg-gradient-to-r from-[#f85606] to-[#e04c00] text-white flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-orange-200" />
                          <span>{editingBanner ? 'Edit Commercial Banner' : 'Create New Homepage Banner'}</span>
                        </h3>
                        <p className="text-xs text-orange-100 mt-0.5">
                          Configure banner image, headlines, discounts, and target links.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsAddingBanner(false);
                          setEditingBanner(null);
                        }}
                        className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveBanner} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Live Banner Preview
                        </label>
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-inner group">
                          {bannerForm.imageUrl ? (
                            <img
                              src={bannerForm.imageUrl}
                              alt={bannerForm.title || 'Banner Preview'}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              No image selected
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent p-4 flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#f85606] text-white tracking-wider">
                                {bannerForm.badge || 'PROMOTION'}
                              </span>
                              {bannerForm.discountBadge && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 tracking-wider">
                                  {bannerForm.discountBadge}
                                </span>
                              )}
                            </div>
                            <div className="max-w-md">
                              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                                {bannerForm.title || 'Enter Banner Title'}
                              </h3>
                              <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                                {bannerForm.subtitle || 'Enter short commercial subtitle here...'}
                              </p>
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm">
                                {bannerForm.ctaText || 'Shop Now'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Choose Banner Image *
                        </label>
                        <div className="text-[11px] font-semibold text-slate-500">Quick E-Commerce Presets (Click to apply):</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PROMOTION_BANNER_PRESETS.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                setBannerForm({
                                  ...bannerForm,
                                  imageUrl: preset.url,
                                  title: bannerForm.title || preset.title,
                                  subtitle: bannerForm.subtitle || preset.subtitle,
                                  badge: preset.badge,
                                  discountBadge: preset.discountBadge,
                                  ctaText: preset.ctaText,
                                  ctaCategory: preset.ctaCategory as any,
                                  searchFilter: preset.searchFilter,
                                });
                              }}
                              className={`p-1.5 rounded-xl border text-left cursor-pointer transition-all ${
                                bannerForm.imageUrl === preset.url
                                  ? 'border-[#f85606] bg-orange-50 ring-2 ring-orange-300'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="h-14 rounded-lg overflow-hidden bg-slate-100 mb-1">
                                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] font-bold text-slate-800 line-clamp-1">{preset.name}</p>
                            </button>
                          ))}
                        </div>

                        <div className="pt-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Custom Image URL</label>
                          <input
                            type="url"
                            value={bannerForm.imageUrl || ''}
                            onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Banner Headline / Title *</label>
                          <input
                            type="text"
                            required
                            value={bannerForm.title || ''}
                            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                            placeholder="e.g. Ramadan Mubarak Mega Electronics Sale"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Description</label>
                          <input
                            type="text"
                            value={bannerForm.subtitle || ''}
                            onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                            placeholder="e.g. 100% Original Products   Free Cash on Delivery all over Pakistan"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Top Promo Badge</label>
                          <input
                            type="text"
                            value={bannerForm.badge || ''}
                            onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                            placeholder="e.g. MEGA DEAL"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Discount Tag</label>
                          <input
                            type="text"
                            value={bannerForm.discountBadge || ''}
                            onChange={(e) => setBannerForm({ ...bannerForm, discountBadge: e.target.value })}
                            placeholder="e.g. UP TO 50% OFF"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={bannerForm.ctaText || ''}
                            onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                            placeholder="e.g. Shop Now"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#f85606]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Click Action / Target Category</label>
                          <select
                            value={bannerForm.ctaCategory || 'all'}
                            onChange={(e) => setBannerForm({ ...bannerForm, ctaCategory: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#f85606]"
                          >
                            <option value="all">All Products (Full Storefront)</option>
                            <option value="mobiles-tablets">Mobiles &amp; Tablets</option>
                            <option value="electronics">Electronics &amp; Smart Wearables</option>
                            <option value="fashion">Shoes, Footwear &amp; Fashion</option>
                            <option value="audio-sound">Audio &amp; Sound</option>
                            <option value="laptops">Laptops &amp; Computers</option>
                            <option value="appliances">Home &amp; Kitchen Appliances</option>
                            <option value="camera-accessories">Cameras &amp; Accessories</option>
                            <option value="gaming">Gaming &amp; Consoles</option>
                            <option value="automotive">Automotive &amp; Tools</option>
                            <option value="beauty-health">Beauty &amp; Personal Care</option>
                            <option value="sports-outdoor">Sports &amp; Fitness</option>
                            <option value="home-living">Home &amp; Living</option>
                            <option value="toys-games">Toys &amp; Games</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id="banner_active_checkbox"
                            checked={bannerForm.active ?? true}
                            onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                            className="w-4 h-4 accent-[#f85606] cursor-pointer"
                          />
                          <label htmlFor="banner_active_checkbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                            Active &amp; Visible in Carousel on Homepage
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingBanner(false);
                            setEditingBanner(null);
                          }}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#f85606] hover:bg-[#e04c00] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{editingBanner ? 'Save Changes' : 'Create &amp; Publish Banner'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: BRANDS */}
          {activeTab === 'brands' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460] flex items-center gap-2">
                    <Tag className="w-6 h-6 text-[#f85606]" />
                    Authorized Brand Partners &amp; Distributors
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Official imported and local brands represented in Easy Store Pakistan inventory with genuine warranty.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('products');
                  }}
                  className="px-4 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Manage Brand Products</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[
                  { name: 'Samsung Official', category: 'Smartphones, Tablets & Watches', origin: 'South Korea / PTA Approved', count: 28, badge: 'OFFICIAL PARTNER', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { name: 'Apple Official', category: 'iPhones, MacBooks, iPads & AirPods', origin: 'USA / Genuine Import', count: 24, badge: '100% GENUINE', color: 'bg-slate-100 text-slate-800 border-slate-300' },
                  { name: 'Xiaomi & Redmi', category: 'Smartphones, Bands & Accessories', origin: 'Official Global Importer', count: 18, badge: 'POPULAR SELLER', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { name: 'Infinix & Tecno', category: 'Affordable High-Spec Smartphones', origin: 'Pakistan Local Warranty', count: 16, badge: 'BUDGET CHAMPION', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { name: 'Dell Technologies', category: 'XPS, Latitude & Gaming Laptops', origin: 'Direct Tech Distribution', count: 14, badge: 'PRO COMPUTING', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
                  { name: 'HP & Lenovo', category: 'Pavilion, ThinkPads & Ideapads', origin: 'Official Business Warranty', count: 15, badge: 'ENTERPRISE', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                  { name: 'Sony Acoustics', category: 'WH-1000XM ANC & Soundbars', origin: 'High-Res Audio Distribution', count: 10, badge: 'PREMIUM AUDIO', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                  { name: 'Philips & Anex', category: 'Air Fryers, Juicers & Steamers', origin: 'Home & Kitchen Appliances', count: 19, badge: '2-YEAR WARRANTY', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { name: 'Nike Sports', category: 'Air Max, Cushion Joggers & Gym', origin: 'Athletic Footwear Imports', count: 12, badge: 'SPORTSWEAR', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                  { name: 'Logitech G & Razer', category: 'Mechanical Keyboards & Mice', origin: 'Gaming Peripherals Partner', count: 11, badge: 'ESPORTS GEAR', color: 'bg-teal-50 text-teal-700 border-teal-200' },
                  { name: 'Dawlance & Haier', category: 'Microwaves, Kettles & Coolers', origin: 'Pakistan Nationwide Service', count: 14, badge: 'LOCAL TRUST', color: 'bg-sky-50 text-sky-700 border-sky-200' },
                  { name: 'Casio & Curren', category: 'G-Shock, Leather & Steel Watches', origin: 'Horology Distribution', count: 13, badge: 'TIMEPIECES', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
                ].map((b) => (
                  <div key={b.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-orange-300 hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${b.color}`}>
                          {b.badge}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {b.count} Items
                        </span>
                      </div>
                      <h4 className="font-black text-base text-[#0f3460]">{b.name}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-1">{b.category}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{b.origin}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProductSearch(b.name.split(' ')[0]);
                        setActiveTab('products');
                      }}
                      className="w-full py-2 bg-slate-50 hover:bg-[#f85606] hover:text-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Filter In Catalog</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MARKETING */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460] flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-[#f85606]" />
                    Promotions, Flash Sales &amp; Broadcasts
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure customer SMS/WhatsApp dispatch notices, promotional campaigns, and store broadcast banners.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('banner_management')}
                  className="px-4 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Homepage Banners</span>
                </button>
              </div>

              {/* Active Campaigns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                    Live Event
                  </span>
                  <h3 className="text-lg font-black leading-snug">Mega Shopping Fest</h3>
                  <p className="text-xs text-white/90">
                    Up to 50% discount on Mobiles, Laptops &amp; Appliances with free Cash on Delivery nationwide.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold bg-white text-[#f85606] px-3 py-1 rounded-lg">
                      Active On Store
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                    Always On
                  </span>
                  <h3 className="text-lg font-black leading-snug">Free Delivery Over Rs. 2,500</h3>
                  <p className="text-xs text-white/90">
                    Cart value threshold automatically waives courier charges for Karachi, Lahore, Islamabad, &amp; 150+ cities.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold bg-white text-emerald-700 px-3 py-1 rounded-lg">
                      Free Shipping Active
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl p-5 text-white shadow-md space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                    Seasonal Campaign
                  </span>
                  <h3 className="text-lg font-black leading-snug">Ramadan &amp; Eid Mubarak Grand Sale</h3>
                  <p className="text-xs text-white/90">
                    Exclusive offers on Wash &amp; Wear Kurtas, Leather Shoes, Kitchen Blenders &amp; Air Fryers.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold bg-white text-purple-800 px-3 py-1 rounded-lg">
                      Configured &amp; Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Templates */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#0f3460] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Pakistan Customer Notification Templates (TCS / Leopards / WhatsApp)
                </h3>
                <p className="text-xs text-slate-500">
                  These official templates are used when dispatching orders or contacting customers via phone and WhatsApp.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">1. Order Confirmation Call Script</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">COD Verified</span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      &quot;Assalam-o-Alaikum, this is Muhammad Abdullah from Easy Store Pakistan. We have received your order #[OrderNumber] for [ProductTitle]. Your delivery address is [City] with Cash on Delivery. May we dispatch via TCS Express today?&quot;
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">2. TCS Express Tracking SMS</span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Dispatched</span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      &quot;Easy Store Alert: Your package has been handed over to TCS Express. Tracking ID: [TrackingNumber]. Expected delivery in 2-3 business days. Keep cash ready for delivery rider. Helpline: 0346-7792177.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTENT PAGES */}
          {activeTab === 'content_pages' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460] flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#f85606]" />
                    Store Content &amp; Customer Information Pages
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Official policies, checking warranty terms, and legal pages presented to Pakistani buyers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Cash on Delivery (COD) Rules & Terms',
                    desc: 'Nationwide Cash on Delivery to over 150+ cities across Punjab, Sindh, KPK, and Balochistan via TCS, Leopards & Trax Express.',
                    badge: 'CUSTOMER FAVOURITE',
                    updated: 'Always Active',
                  },
                  {
                    title: '7-Day Checking Warranty & Return Policy',
                    desc: 'All electrical gadgets, smartphones, laptops, and appliances come with a 7-day checking warranty for total peace of mind.',
                    badge: 'WARRANTY SHIELD',
                    updated: 'Updated October 2026',
                  },
                  {
                    title: 'About Easy Store Pakistan & Founder Abdullah',
                    desc: 'Founded by Muhammad Abdullah. Focused on authentic products, zero-markup prices, and trustworthy customer support.',
                    badge: 'OWNER VERIFIED',
                    updated: 'Store Profile',
                  },
                  {
                    title: 'Shipping Timelines & Courier Partnerships',
                    desc: 'Karachi same-day or next-day. Major cities (Lahore, Islamabad, Rawalpindi, Faisalabad) 2-3 days. Other regions 3-4 days.',
                    badge: 'LOGISTICS',
                    updated: 'TCS & Trax SLA',
                  },
                ].map((page) => (
                  <div key={page.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-50 text-[#f85606] border border-orange-200">
                          {page.badge}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {page.updated}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#0f3460]">{page.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{page.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Public on Footer</span>
                      </span>
                      <button
                        onClick={() => onNavigate('support')}
                        className="text-[#f85606] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Preview Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">System Settings</h2>
              
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#f85606]" />
                  Payment Gateways &amp; Accounts Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Manage your EasyPaisa, JazzCash, Meezan Bank, Card, and Cash on Delivery payment options in the dedicated Gateways tab.
                </p>
                <button
                  onClick={() => setActiveTab('payment_methods')}
                  className="px-4 py-2.5 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Open Payment Gateways Settings
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  Change Master Admin Passphrase
                </h3>
                <form onSubmit={handleChangePassphrase} className="flex gap-2 max-w-md">
                  <input
                    type="password"
                    value={newPassphrase}
                    onChange={(e) => setNewPassphrase(e.target.value)}
                    placeholder="Enter new strong passphrase..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Save Passphrase
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#0f3460]">Database Backup &amp; Recovery</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    Export Database (JSON Backup)
                  </button>
                  <button
                    onClick={handleResetCatalog}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Initial Store Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK FOR UNKNOWN TAB */}
          {!['dashboard', 'products', 'orders', 'customers', 'complaints', 'categories', 'brands', 'coupons', 'reports', 'marketing', 'content_pages', 'banner_management', 'payment_methods', 'settings'].includes(activeTab) && (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#f85606] flex items-center justify-center mx-auto">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Admin Section</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select any tab from the sidebar to manage products, categories, orders, or payment gateways.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-2.5 bg-[#f85606] text-white rounded-xl text-xs font-bold hover:bg-[#e04c00] cursor-pointer shadow-md"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ORDER INSPECT MODAL */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#0f3460]">Order #{inspectedOrder.orderNumber}</h3>
              <button onClick={() => setInspectedOrder(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p><strong>Customer:</strong> {inspectedOrder.customer?.fullName} ({inspectedOrder.customer?.phone})</p>
              <p><strong>Address:</strong> {inspectedOrder.customer?.addressLine1}, {inspectedOrder.customer?.city}</p>
              <p><strong>Total:</strong> Rs. {(inspectedOrder.total || 0).toLocaleString()} via {inspectedOrder.paymentMethod}</p>
            </div>
            <form onSubmit={handleUpdateOrderStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Carrier name"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking Number"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Save Status
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT EDIT & CREATE MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-5 sm:p-7 text-slate-800 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#f85606] flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#0f3460]">
                    {editingProduct.id ? 'Edit Product Details' : 'Add New Product to Catalog'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingProduct.id ? `SKU: ${editingProduct.sku || 'N/A'}` : 'Fill in complete product specification, pricing, and image'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>1. Basic Product Information</span>
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Samsung Galaxy S24 Ultra Titanium 5G (12GB/512GB)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#f85606] focus:bg-white font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department Category *
                    </label>
                    <select
                      value={editingProduct.category || 'mobiles-tablets'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#f85606] cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SubCategory / Series
                    </label>
                    <input
                      type="text"
                      value={editingProduct.subCategory || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                      placeholder="e.g. Flagship Smartphones"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Brand / Manufacturer
                    </label>
                    <input
                      type="text"
                      value={editingProduct.brand || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      placeholder="e.g. Samsung, Apple, Xiaomi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#f85606]"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    2. Pricing, Discount Offers &amp; Inventory
                  </h4>
                  {editingProduct.compareAtPrice && editingProduct.price && editingProduct.compareAtPrice > editingProduct.price ? (
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Offer: Save {Math.round(((editingProduct.compareAtPrice - editingProduct.price) / editingProduct.compareAtPrice) * 100)}%
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sale Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingProduct.price ?? ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 45000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#f85606] focus:outline-none focus:border-[#f85606]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Original / Strike Price (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.compareAtPrice ?? ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="e.g. 55000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none focus:border-[#f85606]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editingProduct.stock ?? ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      placeholder="e.g. 25"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#f85606]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      placeholder="e.g. PK-SAM-S24U"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 uppercase focus:outline-none focus:border-[#f85606]"
                    />
                  </div>
                </div>
              </div>

              {/* Images & Multi-Angle Gallery Manager */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#f85606]" />
                        3. Product Images & Close-Ups (4 to 5 Photos)
                      </h4>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        (editingProduct.images?.length || 0) >= 4 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {editingProduct.images?.length || 0} / 5 Images
                      </span>
                    </div>
                  </div>

                  {/* Hidden System File Inputs */}
                  <input
                    ref={fileUploadInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadImagesFromSystem}
                    className="hidden"
                  />
                  <input
                    ref={replaceSlotInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReplaceSingleImageFromSystem}
                    className="hidden"
                  />
                  {/* System Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileUploadInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isProcessingImage ? 'Processing...' : 'Upload from System'}</span>
                  </button>
                </div>

                {/* Add Image from URL and Presets Toolbar */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newProductImageUrl}
                      onChange={(e) => setNewProductImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Or paste external image URL: https://images.unsplash.com/..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#f85606]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add URL
                    </button>
                  </div>

                  {/* Quick Angle Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Add Angles:</span>
                    <button
                      type="button"
                      onClick={() => handleAddPresetAngle('https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', 'Macro Close-Up')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      + Macro Close-Up
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetAngle('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', 'Buttons & Controls')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-sky-600" />
                      + Controls / Ports
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetAngle('https://images.unsplash.com/photo-1587241321921-91a834d6d191?auto=format&fit=crop&w=800&q=80', 'In-Use Action')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-indigo-600" />
                      + In-Use / Lifestyle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetAngle('https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80', 'Retail Box Packaging')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      + Box & Accessories
                    </button>
                  </div>
                </div>

                {/* Grid of All Current Images */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Gallery Photos ({editingProduct.images?.length || 0})</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Drag/reorder to change cover image   Use camera icon to replace with new photo from system
                    </span>
                  </div>

                  {(!editingProduct.images || editingProduct.images.length === 0) ? (
                    <div 
                      onClick={() => fileUploadInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No images yet. Click to upload photos from your computer</p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, WebP (multiple files allowed)</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {editingProduct.images.map((imgUrl, idx) => (
                        <div 
                          key={idx}
                          className={`relative group bg-white rounded-2xl border-2 overflow-hidden shadow-2xs transition-all flex flex-col ${
                            idx === 0 
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Image Thumbnail Preview */}
                          <div className="aspect-square bg-slate-100 overflow-hidden relative">
                            <img
                              src={imgUrl}
                              alt={`Product shot ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            {/* Position Label Badge */}
                            <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs ${
                              idx === 0 
                                ? 'bg-emerald-600 text-white' 
                                : idx === 1
                                ? 'bg-sky-600 text-white'
                                : idx === 2
                                ? 'bg-indigo-600 text-white'
                                : idx === 3
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-700 text-white'
                            }`}>
                              {idx === 0 ? '  Cover Photo' : idx === 1 ? '#2 Close-Up' : idx === 2 ? '#3 Feature' : idx === 3 ? '#4 In-Use' : `#${idx + 1} Angle`}
                            </span>
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImageSlot(idx)}
                              title="Delete this image"
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Card Action Controls */}
                          <div className="p-2 bg-slate-50 border-t border-slate-100 flex flex-col gap-1.5 text-[11px]">
                            {/* Make Cover Button if not cover */}
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryCoverImage(idx)}
                                className="w-full py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>Set as Cover</span>
                              </button>
                            )}
                            <div className="flex items-center justify-between gap-1">
                              {/* Reorder Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveImageSlot(idx, 'left')}
                                  title="Move Left"
                                  className="p-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                  <ArrowLeft className="w-3 h-3 text-slate-600" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === (editingProduct.images?.length || 0) - 1}
                                  onClick={() => handleMoveImageSlot(idx, 'right')}
                                  title="Move Right"
                                  className="p-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                                </button>
                              </div>
                              {/* Replace from System Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setReplaceTargetIndex(idx);
                                  replaceSlotInputRef.current?.click();
                                }}
                                title="Change/Replace with image from system"
                                className="px-2 py-1 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-[#0284c7] rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Replace</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Descriptions & Specs */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  4. Descriptions
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={editingProduct.shortDescription || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    placeholder="e.g. 100% Genuine with official checking warranty in Pakistan."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Product Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Detailed description, box contents, condition, warranty information..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#f85606] leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-[#f85606] hover:bg-[#e04c00] text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct.id ? 'Save & Update Store' : 'Create & Publish Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
