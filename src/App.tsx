import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { CompareProvider, useCompare } from './context/CompareContext';
import { db } from './services/db';
import { Order, Product, ProductCategory, StoreViewMode } from './types';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ProductVideoModal } from './components/ProductVideoModal';
import { AuthModal } from './components/AuthModal';
import { AdminGateModal } from './components/AdminGateModal';
import { CustomerSupportAgent } from './components/CustomerSupportAgent';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { AppDownloadModal } from './components/AppDownloadModal';
import { MobileAppSimulatorModal } from './components/MobileAppSimulatorModal';
import { Interactive3DShowcase } from './components/Interactive3DShowcase';

// Views
import { StoreView } from './views/StoreView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { OrderHistoryView } from './views/OrderHistoryView';
import { TrackingView } from './views/TrackingView';
import { SupportView } from './views/SupportView';
import { WishlistView } from './views/WishlistView';
import { AdminPortalView } from './views/AdminPortalView';

// Icons
import { Smartphone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { addToCart } = useCart();
  const { setShowAdminGateModal } = useAuth();
  const { 
    isCompareModalOpen, 
    closeCompareModal, 
    activeVideoProduct, 
    closeVideoModal 
  } = useCompare();

  // Navigation and catalog state
  const [currentView, setCurrentView] = useState<StoreViewMode>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Modals state
  const [appDownloadModalOpen, setAppDownloadModalOpen] = useState(false);
  const [appDownloadInitialTab, setAppDownloadInitialTab] = useState<'google_play' | 'app_store' | 'direct_apk'>('google_play');
  const [mobileSimulatorOpen, setMobileSimulatorOpen] = useState(false);

  // Sync products periodically or on refresh
  const refreshCatalog = () => {
    setProducts(db.getProducts());
  };

  useEffect(() => {
    // Initial fetch to ensure up-to-date catalog
    refreshCatalog();

    // Check URL route on load and on browser history back/forward navigation
    const handleUrlRoute = () => {
      const pathname = window.location.pathname;
      if (pathname === '/' || pathname === '/catalog') {
        setCurrentView('catalog');
        setSelectedCategory('all');
      } else if (pathname.startsWith('/category/')) {
        const slug = pathname.replace('/category/', '');
        const slugMap: Record<string, ProductCategory> = {
          'gents-wallets': 'wallets',
          'watches': 'watches',
          'glasses': 'glasses',
          'smart-watches': 'smart-watches',
          'bags': 'bags',
          'solar-lights': 'solar-lights',
          'fitness-gym': 'fitness-gym',
          'home-kitchen': 'home-kitchen',
          'beauty-cosmetics': 'beauty-cosmetics',
          'mobile-accessories': 'mobile-accessories',
          'miscellaneous': 'miscellaneous',
          'caps-collection': 'caps-collection',
          'toolkit': 'toolkits',
          'body-massager': 'body-massagers',
          'belts': 'belts',
          'binoculars': 'binoculars',
          'gaming-accessories': 'gaming-accessories',
          'kids': 'kids-fashion',
          'psl-shirts': 'psl-shirts',
          'winter-sale': 'winter-sale',
        };
        const mappedCat = slugMap[slug];
        if (mappedCat) {
          setCurrentView('catalog');
          setSelectedCategory(mappedCat);
        }
      } else if (pathname === '/checkout') {
        setCurrentView('checkout');
      } else if (pathname === '/tracking') {
        setCurrentView('tracking');
      } else if (pathname === '/support') {
        setCurrentView('support');
      } else if (pathname === '/wishlist') {
        setCurrentView('wishlist');
      } else if (pathname === '/orders') {
        setCurrentView('order_history');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  const handleNavigate = (view: StoreViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: ProductCategory | 'all') => {
    setSelectedCategory(cat);
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('order_confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    addToCart(product, quantity);
    setSelectedDetailProduct(null);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    if (selectedDetailProduct?.id === updatedProduct.id) {
      setSelectedDetailProduct(updatedProduct);
    }
  };

  const handleOpenAppDownload = (tab: 'google_play' | 'app_store' | 'direct_apk' = 'google_play') => {
    setAppDownloadInitialTab(tab);
    setAppDownloadModalOpen(true);
  };

  const isStoreCatalog = currentView === 'catalog';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#0284c7]/20 selection:text-[#0284c7]">
      {/* Global Navigation Header (Always open across entire application and dashboard) */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        allProducts={products}
        onOpenProductDetail={(product) => setSelectedDetailProduct(product)}
        onOpenAppDownload={handleOpenAppDownload}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'catalog' && (
          <>
            <StoreView
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenProductDetail={(product) => setSelectedDetailProduct(product)}
              onNavigate={handleNavigate}
            />
            {/* 3D Interactive Interactive Product Showcase */}
            <Interactive3DShowcase
              onSelectCategory={handleSelectCategory}
              onNavigate={handleNavigate}
            />
          </>
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'order_confirmation' && (
          <OrderConfirmationView
            order={confirmedOrder}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'order_history' && (
          <OrderHistoryView
            onNavigate={handleNavigate}
            onSelectOrderForTracking={() => handleNavigate('tracking')}
          />
        )}

        {currentView === 'tracking' && (
          <TrackingView
            onNavigate={handleNavigate}
            onSelectOrderForDetails={(order) => {
              setConfirmedOrder(order);
              handleNavigate('order_confirmation');
            }}
          />
        )}

        {currentView === 'support' && (
          <SupportView onNavigate={handleNavigate} />
        )}

        {currentView === 'wishlist' && (
          <WishlistView
            products={products}
            onNavigate={handleNavigate}
            onOpenDetail={(product) => setSelectedDetailProduct(product)}
          />
        )}

        {currentView === 'admin' && (
          <AdminPortalView
            onNavigate={handleNavigate}
            onRefreshCatalog={refreshCatalog}
          />
        )}
      </main>

      {/* Footer (hidden when inside admin view) */}
      {currentView !== 'admin' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenAdminGate={() => setShowAdminGateModal(true)}
          onOpenAppDownload={handleOpenAppDownload}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onBuyNow={handleBuyNow}
        onProductUpdated={handleProductUpdated}
        allProducts={products}
        onSelectProduct={(p) => setSelectedDetailProduct(p)}
      />

      {/* Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isCompareModalOpen}
        onClose={closeCompareModal}
        onBuyNow={handleBuyNow}
        allProducts={products}
        onOpenDetail={(product) => setSelectedDetailProduct(product)}
      />

      {/* 10-Second High-Conversion Video Ad Modal */}
      <ProductVideoModal
        product={activeVideoProduct}
        onClose={closeVideoModal}
        onBuyNow={handleBuyNow}
      />

      {/* Authentication Modal */}
      <AuthModal onNavigateAdmin={() => setCurrentView('admin')} />

      {/* Protected Admin Access Security Gate Modal */}
      <AdminGateModal onUnlockSuccess={() => setCurrentView('admin')} />

      {/* AI Customer Support Agent Live Floating Widget */}
      {currentView !== 'admin' && (
        <CustomerSupportAgent
          onNavigateToCatalog={() => handleNavigate('catalog')}
          onNavigateToTracking={() => handleNavigate('tracking')}
        />
      )}

      {/* Floating Compare Drawer Bar */}
      <CompareFloatingBar />

      {/* Mobile App Download Modal */}
      <AppDownloadModal
        isOpen={appDownloadModalOpen}
        initialTab={appDownloadInitialTab}
        onClose={() => setAppDownloadModalOpen(false)}
      />

      {/* Interactive Mobile App Simulator */}
      <MobileAppSimulatorModal
        isOpen={mobileSimulatorOpen}
        onClose={() => setMobileSimulatorOpen(false)}
        onSelectProduct={(p) => setSelectedDetailProduct(p)}
      />

      {/* Floating Mobile App Simulator Launch Trigger (Bottom Left) */}
      {currentView !== 'admin' && (
        <aside
          aria-label="Mobile App Simulator launcher"
          className="fixed bottom-6 left-6 z-30 hidden sm:flex items-center"
        >
          <button
            onClick={() => setMobileSimulatorOpen(true)}
            className="group flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer text-xs font-semibold"
            title="Preview Mobile App Simulator"
          >
            <div className="w-6 h-6 rounded-full bg-[#0284c7] flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition-transform">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">Open Mobile App</span>
          </button>
        </aside>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <CompareProvider>
            <AppContent />
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
