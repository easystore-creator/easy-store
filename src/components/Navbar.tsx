import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Heart, 
  ShieldCheck, 
  Menu, 
  X, 
  Package, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ChevronDown, 
  PhoneCall, 
  Truck, 
  CheckCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCategory, Product, StoreViewMode } from '../types';
import { OwnerAvatar } from './OwnerAvatar';
import { BrandLogo } from './BrandLogo';

// Keep these category names exactly as provided in header_only_custom_categories_icon_only.html
export const STORE_HEADER_CATEGORIES = [
  "Gents Wallets",
  "Watches",
  "Glasses",
  "Smart Watches",
  "Bags",
  "Solar Lights",
  "Fitness & Gym",
  "Home & Kitchen",
  "Beauty & Cosmetics",
  "Mobile Accessories",
  "Miscellaneous",
  "Caps Collection",
  "ToolKit",
  "Body Massager",
  "Belts",
  "Binoculars",
  "Gaming Accessories",
  "Kids",
  "PSL Shirts",
  "WINTER SALE",
  "Catalog"
] as const;

// Quick links: Home + exactly two category names ("Gents Wallets", "Watches"), followed by spacious Other
export const STORE_HEADER_QUICK_CATEGORIES = STORE_HEADER_CATEGORIES.slice(0, 2);
export const STORE_HEADER_OTHER_NAMES = STORE_HEADER_CATEGORIES.filter(
  (name) => !STORE_HEADER_QUICK_CATEGORIES.includes(name)
);

export const categoryUrl = (name: string): string => {
  const known: Record<string, string> = {
    "Home": "/",
    "Gents Wallets": "/category/gents-wallets",
    "Watches": "/category/watches",
    "Glasses": "/category/glasses",
    "Smart Watches": "/category/smart-watches",
    "Bags": "/category/bags",
    "Solar Lights": "/category/solar-lights",
    "Fitness & Gym": "/category/fitness-gym",
    "Home & Kitchen": "/category/home-kitchen",
    "Beauty & Cosmetics": "/category/beauty-cosmetics",
    "Mobile Accessories": "/category/mobile-accessories",
    "Miscellaneous": "/category/miscellaneous",
    "Caps Collection": "/category/caps-collection",
    "ToolKit": "/category/toolkit",
    "Body Massager": "/category/body-massager",
    "Belts": "/category/belts",
    "Binoculars": "/category/binoculars",
    "Gaming Accessories": "/category/gaming-accessories",
    "Kids": "/category/kids",
    "PSL Shirts": "/category/psl-shirts",
    "WINTER SALE": "/category/winter-sale",
    "Catalog": "/catalog"
  };
  return known[name] || "/";
};

export const CATEGORY_NAME_TO_ID: Record<string, ProductCategory | 'all'> = {
  "Home": "all",
  "Gents Wallets": "wallets",
  "Watches": "watches",
  "Glasses": "glasses",
  "Smart Watches": "smart-watches",
  "Bags": "bags",
  "Solar Lights": "solar-lights",
  "Fitness & Gym": "fitness-gym",
  "Home & Kitchen": "home-kitchen",
  "Beauty & Cosmetics": "beauty-cosmetics",
  "Mobile Accessories": "mobile-accessories",
  "Miscellaneous": "miscellaneous",
  "Caps Collection": "caps-collection",
  "ToolKit": "toolkits",
  "Body Massager": "body-massagers",
  "Belts": "belts",
  "Binoculars": "binoculars",
  "Gaming Accessories": "gaming-accessories",
  "Kids": "kids-fashion",
  "PSL Shirts": "psl-shirts",
  "WINTER SALE": "winter-sale",
  "Catalog": "all"
};

interface NavbarProps {
  currentView: StoreViewMode;
  onNavigate: (view: StoreViewMode) => void;
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allProducts: Product[];
  onOpenProductDetail: (product: Product) => void;
  onOpenAppDownload?: (tab: 'google_play' | 'app_store' | 'direct_apk') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  allProducts,
  onOpenProductDetail,
  onOpenAppDownload,
}) => {
  const { itemCount, setIsCartOpen, wishlist } = useCart();
  const { user, isAuthenticated, isAdminUnlocked, logout, openAuthModal, setShowAdminGateModal } = useAuth();
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Design reference state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOtherDrawerOpen, setIsOtherDrawerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [otherCategorySearch, setOtherCategorySearch] = useState('');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closeOtherBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const otherSearchInputRef = useRef<HTMLInputElement>(null);

  const openSidebar = () => {
    setIsSidebarOpen(true);
    setIsOtherDrawerOpen(false);
    setCategorySearch('');
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 60);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    openBtnRef.current?.focus();
  };

  const openOtherDrawer = () => {
    setIsOtherDrawerOpen(true);
    setIsSidebarOpen(false);
    setOtherCategorySearch('');
    setTimeout(() => {
      closeOtherBtnRef.current?.focus();
    }, 60);
  };

  const closeOtherDrawer = () => {
    setIsOtherDrawerOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebar();
        closeOtherDrawer();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchSuggestions = searchQuery.trim().length > 1
    ? allProducts
        .filter((p) => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleAdminClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!isAdminUnlocked) {
      setShowAdminGateModal(true);
    } else {
      onNavigate('admin');
    }
  };

  const handleCategoryNav = (name: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const url = categoryUrl(name);
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', url);
    }
    closeSidebar();
    closeOtherDrawer();
    setMobileMenuOpen(false);
    onNavigate('catalog');
    const catId = CATEGORY_NAME_TO_ID[name] || 'all';
    onSelectCategory(catId);
    if (name === "Catalog" || name === "Home") {
      onSearchChange('');
    }
  };

  const filteredSidebarCategories = STORE_HEADER_CATEGORIES.filter((name) =>
    name.toLowerCase().includes(categorySearch.trim().toLowerCase())
  );

  const filteredOtherCategories = STORE_HEADER_CATEGORIES.filter((name) =>
    name.toLowerCase().includes(otherCategorySearch.trim().toLowerCase())
  );

  return (
    <header className="store-header sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-sm" id="storeHeader">
      {/* 1. Top Ribbon & Live Running Headline Ticker */}
      <div className="bg-[#0b3c68] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 font-medium border-b border-[#082d4f] overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Running Headline Ticker with Founder Avatar */}
          <div className="flex-1 overflow-hidden relative flex items-center gap-2 mr-2">
            <div className="shrink-0 flex items-center gap-1.5 bg-[#0284c7] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
              <OwnerAvatar size="sm" className="ring-1 ring-white/80" />
              <span className="hidden xs:inline">LIVE STORE</span>
              <span className="xs:hidden">LIVE</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="animate-marquee flex items-center gap-8 text-[11px] text-white/95 font-medium tracking-wide">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-300 font-bold">Easy Store Pakistan:</span>
                  <span>100% Original Products Guaranteed</span>
                </span>
                <span className="text-cyan-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-300 inline" />
                  <span>Free Fast Cash on Delivery on orders over Rs. 2,500</span>
                </span>
                <span className="text-cyan-300">|</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
                  <span>7-Day Checking Warranty Across Pakistan</span>
                </span>
                <span className="text-cyan-300">|</span>
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-300 inline" />
                  <span>WhatsApp Helpline: <strong className="text-white">+92 346 7792177</strong></span>
                </span>
                <span className="text-cyan-300">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-300 font-bold">Coupon Code:</span>
                  <span className="bg-white/20 px-1 rounded font-mono font-bold text-amber-200">EASYSTORE</span>
                  <span>for 10% Discount</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-4 text-white/95 shrink-0 text-[11px]">
            <button
              onClick={() => onOpenAppDownload?.('google_play')}
              className="hover:text-cyan-200 flex items-center gap-1.5 font-bold bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full text-[11px] cursor-pointer transition-all"
            >
              <span>Download App</span>
            </button>
            <span className="opacity-40 hidden sm:inline">|</span>
            <button
              onClick={() => onNavigate('tracking')}
              className="hover:underline hidden sm:flex items-center gap-1 cursor-pointer"
            >
              <span>Track Order</span>
            </button>
            <div className="hidden lg:flex items-center gap-1.5 font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Trusted Nationwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Brand & Search Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Logo with Link to Home */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('all');
                onSearchChange('');
                if (window.history && window.history.pushState) {
                  window.history.pushState(null, '', '/');
                }
              }}
              className="group cursor-pointer focus:outline-none"
            >
              <BrandLogo size="md" />
            </button>
          </div>

          {/* Center Search Bar with Blue Button */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl hidden md:block relative">
            <div className="flex items-center rounded-xl border-2 border-[#1769ff] bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#1769ff]/20 transition-all">
              <div className="pl-3.5 text-slate-400">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search for products, brands and more across Pakistan..."
                className="w-full py-2.5 px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('catalog');
                  setIsSearchFocused(false);
                }}
                className="bg-[#1769ff] hover:bg-[#0d4fca] text-white px-6 py-3 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 flex justify-between items-center">
                  <span>Product Suggestions ({searchSuggestions.length})</span>
                  <span className="text-[11px] text-slate-400">40,000+ Products Catalog</span>
                </div>
                {searchSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No products matching &quot;{searchQuery}&quot; found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onOpenProductDetail(item);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-3 hover:bg-sky-50/70 flex items-center gap-3 transition-colors group cursor-pointer"
                      >
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80';
                          }}
                          className="w-11 h-11 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#1769ff] truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.brand && <span className="font-semibold text-slate-600">{item.brand}</span>}
                            <span>•</span>
                            <span className="font-black text-[#1769ff]">Rs. {item.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons & Account: Login / Sign Up, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-[#1769ff] cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1769ff] text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block leading-none">
                    <span className="text-[10px] text-slate-400 block font-medium">Hello,</span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-800">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {user?.role === 'admin' ? 'Store Manager' : 'Verified Pakistan Customer'}
                      </span>
                    </div>

                    {(user?.role === 'admin' || isAdminUnlocked || user?.email === 'easystorekarachi@gmail.com') && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-orange-50 text-[#f85606] font-bold flex items-center gap-2 cursor-pointer border-b border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#f85606]" />
                        <span>Owner Admin &amp; Payment Panel</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onNavigate('order_history');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('tracking');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-slate-400" />
                      Track Order Status
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => openAuthModal('customer_login')}
                  className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-sky-50 text-slate-800 hover:text-[#1769ff] font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 shadow-2xs hover:border-[#1769ff]/40"
                  title="Customer Login"
                >
                  <LogIn className="w-4 h-4 text-[#1769ff]" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => openAuthModal('customer_register')}
                  className="px-3 sm:px-4 py-2 bg-[#1769ff] hover:bg-[#0d4fca] text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/25 cursor-pointer hover:scale-[1.02] active:scale-98"
                  title="Create New Account"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative flex flex-col items-center text-slate-700 hover:text-[#1769ff] cursor-pointer transition-colors p-1"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative">
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1769ff] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold mt-0.5">Wishlist</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex flex-col items-center text-slate-700 hover:text-[#1769ff] cursor-pointer transition-colors p-1"
              aria-label="View Shopping Cart"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative">
                <ShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1769ff] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <span className="text-[11px] font-semibold mt-0.5">Cart</span>
            </button>

            {/* Owner Quick Access Gate */}
            {user?.role === 'admin' && (
              <button
                onClick={handleAdminClick}
                title="Admin Portal (Owner Active) - Founder Abdullah"
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-[#1769ff] text-white border-[#1769ff] shadow-sm ring-2 ring-blue-300'
                    : 'bg-blue-50 text-[#1769ff] border-blue-300 hover:bg-blue-100'
                }`}
              >
                <OwnerAvatar size="sm" className="ring-1 ring-blue-400" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[10px] text-slate-400 font-medium">Owner</span>
                  <span className="text-[11px] font-bold text-slate-800">Abdullah</span>
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pt-2.5">
          <div className="flex items-center rounded-xl border-2 border-[#1769ff] overflow-hidden bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products in Pakistan..."
              className="w-full py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-[#1769ff] text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Sub-Header Navigation (Exact Reference: header_only_custom_categories_icon_only.html) */}
      <div className="store-header__nav-wrap">
        <nav className="store-header__nav" aria-label="Store categories">
          {/* First: Blue square hamburger menu button showing ONLY three horizontal lines */}
          <button
            className="store-header__all"
            id="storeHeaderOpen"
            ref={openBtnRef}
            type="button"
            aria-label="Open categories menu"
            title="Open categories menu"
            aria-expanded={isSidebarOpen}
            aria-controls="storeHeaderSidebar"
            onClick={openSidebar}
          >
            <span className="store-header__hamburger" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Quick links: Home + exactly two categories ("Gents Wallets", "Watches") */}
          <div className="store-header__quick-links" id="storeHeaderQuickLinks" aria-label="Quick categories">
            <a
              className={`store-header__link ${selectedCategory === 'all' && currentView === 'catalog' && !searchQuery ? 'is-active' : ''}`}
              href="/"
              data-store-category="Home"
              onClick={(e) => handleCategoryNav("Home", e)}
            >
              HOME
            </a>
            {STORE_HEADER_QUICK_CATEGORIES.map((name) => {
              const catId = CATEGORY_NAME_TO_ID[name];
              const isActive = selectedCategory === catId;
              return (
                <a
                  key={name}
                  className={`store-header__link ${isActive ? 'is-active' : ''}`}
                  href={categoryUrl(name)}
                  data-store-category={name}
                  onClick={(e) => handleCategoryNav(name, e)}
                >
                  {name.toUpperCase()}
                </a>
              );
            })}
          </div>

          {/* Next: Spacious Other button opening right-side category drawer on white background */}
          <div className="store-header__other">
            <button
              className={`store-header__other-button ${isOtherDrawerOpen ? 'is-active' : ''}`}
              id="storeHeaderOtherToggle"
              type="button"
              aria-expanded={isOtherDrawerOpen}
              aria-controls="storeHeaderOtherDrawer"
              onClick={openOtherDrawer}
              title="Explore all categories"
            >
              OTHER <span className="store-header__chevron" aria-hidden="true">▼</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay & Left Sidebar (Hamburger Menu) */}
      <div
        className={`store-header__overlay ${isSidebarOpen ? 'is-open' : ''}`}
        id="storeHeaderOverlay"
        aria-hidden={!isSidebarOpen}
        onClick={closeSidebar}
      />

      <aside
        className={`store-header__sidebar ${isSidebarOpen ? 'is-open' : ''}`}
        id="storeHeaderSidebar"
        aria-label="All categories"
        aria-hidden={!isSidebarOpen}
      >
        <div className="store-header__sidebar-head">
          <h2 className="store-header__sidebar-title">All Categories</h2>
          <button
            className="store-header__close"
            id="storeHeaderClose"
            ref={closeBtnRef}
            type="button"
            aria-label="Close categories"
            onClick={closeSidebar}
          >
            ×
          </button>
        </div>
        <input
          ref={searchInputRef}
          className="store-header__search"
          id="storeHeaderCategorySearch"
          type="search"
          placeholder="Search categories..."
          aria-label="Search categories"
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
        />
        <nav
          className="store-header__category-list"
          id="storeHeaderCategoryList"
          aria-label="All store categories"
        >
          {filteredSidebarCategories.map((name) => {
            const catId = CATEGORY_NAME_TO_ID[name];
            const isActive = selectedCategory === catId;
            return (
              <a
                key={name}
                href={categoryUrl(name)}
                data-category={name}
                className={isActive ? 'is-active' : ''}
                onClick={(e) => handleCategoryNav(name, e)}
              >
                {name}
              </a>
            );
          })}
          {filteredSidebarCategories.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No categories found matching &quot;{categorySearch}&quot;
            </div>
          )}
        </nav>
      </aside>

      {/* Overlay & Right-Side Category Drawer (Triggered by OTHER) */}
      <div
        className={`store-header__overlay ${isOtherDrawerOpen ? 'is-open' : ''}`}
        id="storeHeaderOtherOverlay"
        aria-hidden={!isOtherDrawerOpen}
        onClick={closeOtherDrawer}
      />

      <aside
        className={`store-header__sidebar store-header__sidebar--right ${isOtherDrawerOpen ? 'is-open' : ''}`}
        id="storeHeaderOtherDrawer"
        aria-label="All Categories (Other Drawer)"
        aria-hidden={!isOtherDrawerOpen}
      >
        <div className="store-header__sidebar-head">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="store-header__sidebar-title">All Categories</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1769ff]">
                21 Collections
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Explore all categories in Easy Store
            </p>
          </div>
          <button
            className="store-header__close"
            id="storeHeaderOtherClose"
            ref={closeOtherBtnRef}
            type="button"
            aria-label="Close categories menu"
            onClick={closeOtherDrawer}
          >
            ×
          </button>
        </div>
        <input
          ref={otherSearchInputRef}
          className="store-header__search"
          id="storeHeaderOtherSearch"
          type="search"
          placeholder="Filter all categories..."
          aria-label="Filter categories"
          value={otherCategorySearch}
          onChange={(e) => setOtherCategorySearch(e.target.value)}
        />
        <nav
          className="store-header__category-list"
          id="storeHeaderOtherCategoryList"
          aria-label="Explore all store categories"
        >
          {filteredOtherCategories.map((name) => {
            const catId = CATEGORY_NAME_TO_ID[name];
            const isActive = selectedCategory === catId;
            const isTopQuick = STORE_HEADER_QUICK_CATEGORIES.includes(name as any);
            return (
              <a
                key={name}
                href={categoryUrl(name)}
                data-category={name}
                className={`flex items-center justify-between ${isActive ? 'is-active' : ''}`}
                onClick={(e) => handleCategoryNav(name, e)}
              >
                <span className="font-semibold">{name}</span>
                {isTopQuick ? (
                  <span className="text-[9px] font-bold text-[#1769ff] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Quick Link
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">›</span>
                )}
              </a>
            );
          })}
          {filteredOtherCategories.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No categories found matching &quot;{otherCategorySearch}&quot;
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile Drawer Menu (When mobile hamburger toggled from top bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="font-bold text-xs text-slate-400 uppercase">Quick Navigation</div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {STORE_HEADER_CATEGORIES.slice(0, 10).map((name) => {
              const catId = CATEGORY_NAME_TO_ID[name];
              const isActive = selectedCategory === catId;
              return (
                <button
                  key={name}
                  onClick={(e) => handleCategoryNav(name, e)}
                  className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer truncate ${
                    isActive
                      ? 'border-[#1769ff] bg-blue-50 text-[#1769ff] font-bold'
                      : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-[#1769ff]'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                openSidebar();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 text-xs text-white bg-[#1769ff] rounded-xl font-bold cursor-pointer flex items-center justify-between"
            >
              <span>View All 21 Categories Sidebar</span>
              <span>→</span>
            </button>
            <button
              onClick={() => {
                onOpenAppDownload?.('google_play');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 text-xs text-[#1769ff] font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span>Download Mobile App (Android &amp; iOS)</span>
            </button>
            <button
              onClick={() => {
                onNavigate('tracking');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 text-xs text-slate-700 font-semibold cursor-pointer"
            >
              Track Order with ID
            </button>
            <button
              onClick={() => {
                onNavigate('support');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 text-xs text-emerald-600 font-bold cursor-pointer"
            >
              Customer Support &amp; WhatsApp
            </button>
            {(isAdminUnlocked || user?.role === 'admin') && (
              <button
                onClick={() => {
                  handleAdminClick();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 text-xs text-amber-600 font-bold cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal (Owner Mode)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
