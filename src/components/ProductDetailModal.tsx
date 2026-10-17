import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Filter,
  Check,
  Search,
  ArrowRight,
  Info,
  Layers,
  Zap,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { Product, ProductCategory, ProductReview } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/db';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onProductUpdated?: (updatedProduct: Product) => void;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
}

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Gujranwala',
  'Sialkot',
  'Hyderabad',
  'Bahawalpur',
  'Abbottabad',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Poor - Not satisfied',
  2: 'Fair - Below expectations',
  3: 'Average - Met basic expectations',
  4: 'Good - Very satisfied',
  5: 'Excellent - Highly recommended!',
};

// Complementary categories map for intelligent pairing
const COMPLEMENTARY_CATEGORIES: Record<string, ProductCategory[]> = {
  'electronics': ['mobile-accessories', 'gaming-accessories', 'watches'],
  'solar-torch': ['toolkits', 'miscellaneous', 'electronics'],
  'watches': ['wallets', 'belts', 'electronics'],
  'wallets': ['belts', 'watches', 'kids-fashion'],
  'mobile-accessories': ['electronics', 'gaming-accessories', 'watches'],
  'home-kitchen': ['body-massagers', 'miscellaneous', 'electronics'],
  'body-massagers': ['home-kitchen', 'miscellaneous', 'electronics'],
  'toolkits': ['solar-torch', 'electronics', 'miscellaneous'],
  'belts': ['wallets', 'watches', 'kids-fashion'],
  'binoculars': ['solar-torch', 'toolkits', 'miscellaneous'],
  'kids-fashion': ['psl-shirts', 'belts', 'wallets'],
  'gaming-accessories': ['electronics', 'mobile-accessories'],
  'psl-shirts': ['kids-fashion', 'watches', 'wallets'],
  'miscellaneous': ['home-kitchen', 'body-massagers', 'solar-torch'],
  // Backward compatibility
  'kitchen-catering': ['appliances', 'home-living', 'kitchen-catering'],
  'appliances': ['kitchen-catering', 'home-living', 'electronics'],
  'mobiles-tablets': ['audio-sound', 'electronics', 'watches-jewelry'],
  'laptops': ['electronics', 'audio-sound', 'gaming'],
  'audio-sound': ['mobiles-tablets', 'electronics', 'gaming'],
  'fashion': ['watches-jewelry', 'luggage-bags', 'beauty-health'],
  'beauty-health': ['appliances', 'fashion', 'health-wellness'],
  'gaming': ['electronics', 'audio-sound', 'laptops'],
  'watches-jewelry': ['fashion', 'mobiles-tablets'],
  'sports-outdoor': ['fashion', 'health-wellness', 'watches-jewelry'],
  'automotive': ['electronics', 'appliances'],
  'camera-accessories': ['electronics', 'laptops'],
  'toys-games': ['gaming', 'books-stationery'],
  'home-living': ['kitchen-catering', 'appliances'],
  'luggage-bags': ['fashion', 'sports-outdoor'],
  'books-stationery': ['toys-games', 'laptops'],
  'health-wellness': ['beauty-health', 'sports-outdoor'],
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product: initialProduct,
  onClose,
  onBuyNow,
  onProductUpdated,
  allProducts,
  onSelectProduct,
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentProduct, setCurrentProduct] = useState<Product | null>(initialProduct);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');

  // Review submission form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formRecommended, setFormRecommended] = useState<boolean>(true);
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [isVerifyingOrder, setIsVerifyingOrder] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    checked: boolean;
    isVerified: boolean;
    orderNumber?: string;
    customerName?: string;
    city?: string;
    message?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedReviews, setVotedReviews] = useState<string[]>(() => {
    try {
      const v = localStorage.getItem('easystore_review_votes_v1');
      return v ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  });

  // Frequently Bought Together Selection
  const frequentlyBoughtItems = useMemo(() => {
    if (!currentProduct) return [];
    const catalog = (allProducts && allProducts.length > 0) ? allProducts : db.getProducts();

    // Exclude current product and out of stock items
    const candidates = catalog.filter((p) => p.id !== currentProduct.id && p.stock > 0);

    // 1. Same category items
    const sameCategory = candidates.filter((p) => p.category === currentProduct.category);

    // 2. Complementary category items
    const compCats = COMPLEMENTARY_CATEGORIES[currentProduct.category] || [];
    const compCategoryItems = candidates.filter(
      (p) => p.category !== currentProduct.category && compCats.includes(p.category)
    );

    // 3. Other top-rated items as fallback
    const otherItems = candidates.filter(
      (p) => p.category !== currentProduct.category && !compCats.includes(p.category)
    );

    const sorter = (a: Product, b: Product) => {
      if (a.bestSeller && !b.bestSeller) return -1;
      if (!a.bestSeller && b.bestSeller) return 1;
      return (b.rating || 0) - (a.rating || 0);
    };

    sameCategory.sort(sorter);
    compCategoryItems.sort(sorter);
    otherItems.sort(sorter);

    const ordered = [...sameCategory, ...compCategoryItems, ...otherItems];
    return ordered.slice(0, 2);
  }, [currentProduct, allProducts]);

  // Selected bundle items for Frequently Bought Together
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);

  // High-Resolution Close-Up & Gallery Inspector State
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const IMAGE_ANGLE_LABELS = [
    'Front / Overview',
    'Macro Close-Up',
    'Features & Controls',
    'In-Use / Angle',
    'Box & Packaging',
    'Extra Detail',
  ];

  const handlePrevImage = () => {
    if (!currentProduct?.images?.length) return;
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : currentProduct.images.length - 1));
  };

  const handleNextImage = () => {
    if (!currentProduct?.images?.length) return;
    setSelectedImageIndex((prev) => (prev < currentProduct.images.length - 1 ? prev + 1 : 0));
  };

  // Sync internal product state if prop changes
  useEffect(() => {
    setCurrentProduct(initialProduct);
    setSelectedImageIndex(0);
    setQuantity(1);
    setShowReviewForm(false);
    setVerificationResult(null);
  }, [initialProduct]);

  // Re-initialize bundle selection when product or complementary items change
  useEffect(() => {
    if (currentProduct) {
      const ids = [currentProduct.id, ...frequentlyBoughtItems.map((p) => p.id)];
      setSelectedBundleIds(ids);
    }
  }, [currentProduct?.id, frequentlyBoughtItems]);

  // Load reviews whenever product changes or reviews are updated
  const loadReviews = () => {
    if (!currentProduct) return;
    const prodReviews = db.getReviews(currentProduct.id);
    setReviews(prodReviews);
  };

  useEffect(() => {
    loadReviews();

    const handleReviewsUpdated = (e: any) => {
      if (!currentProduct) return;
      if (!e.detail || !e.detail.productId || e.detail.productId === currentProduct.id) {
        loadReviews();
        // Also refresh product if rating updated
        const fresh = db.getProductById(currentProduct.id);
        if (fresh) {
          setCurrentProduct(fresh);
          if (onProductUpdated) onProductUpdated(fresh);
        }
      }
    };

    window.addEventListener('easystore:reviews-updated', handleReviewsUpdated);
    return () => {
      window.removeEventListener('easystore:reviews-updated', handleReviewsUpdated);
    };
  }, [currentProduct?.id]);

  // Check if current user is already verified for this product
  useEffect(() => {
    if (user && currentProduct) {
      if (!formName) setFormName(user.name || '');
      if (user.address?.city && !formCity) setFormCity(user.address.city);

      // Auto check purchase verification
      const verifyCheck = db.verifyCustomerPurchase(currentProduct.id, {
        email: user.email,
        phone: user.phone,
      });

      if (verifyCheck.isVerified) {
        setVerificationResult({
          checked: true,
          isVerified: true,
          orderNumber: verifyCheck.orderNumber,
          customerName: verifyCheck.customerName,
          city: verifyCheck.city,
          message: `Verified purchaser found (Order #${verifyCheck.orderNumber})`,
        });
        if (verifyCheck.orderNumber) setFormOrderNumber(verifyCheck.orderNumber);
        if (verifyCheck.city && !formCity) setFormCity(verifyCheck.city);
      }
    }
  }, [user, currentProduct?.id]);

  if (!currentProduct) return null;

  const inWishlist = isInWishlist(currentProduct.id);
  const isOutOfStock = currentProduct.stock <= 0;
  const maxAvailable = currentProduct.stock;
  const discountPercent = currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price
    ? Math.round(((currentProduct.compareAtPrice - currentProduct.price) / currentProduct.compareAtPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxAvailable) return maxAvailable;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addToCart(currentProduct, quantity);
    if (ok) onClose();
  };

  const handleDirectBuy = () => {
    if (isOutOfStock) return;
    onBuyNow(currentProduct, quantity);
    onClose();
  };

  // Review Summary Calculation
  const reviewSummary = useMemo(() => {
    return db.getReviewsSummary(currentProduct.id);
  }, [reviews, currentProduct.id]);

  // Filtered & Sorted Reviews
  const displayedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating
    if (selectedRatingFilter !== 'all') {
      result = result.filter((r) => Math.round(r.rating) === selectedRatingFilter);
    }

    // Filter verified only
    if (verifiedOnlyFilter) {
      result = result.filter((r) => r.verifiedPurchase);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'helpful') {
      result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }

    return result;
  }, [reviews, selectedRatingFilter, verifiedOnlyFilter, sortBy]);

  // Bundle calculations for Frequently Bought Together
  const bundleProducts = useMemo(() => {
    if (!currentProduct) return [];
    return [currentProduct, ...frequentlyBoughtItems];
  }, [currentProduct, frequentlyBoughtItems]);

  const activeBundleProducts = useMemo(() => {
    return bundleProducts.filter((p) => selectedBundleIds.includes(p.id));
  }, [bundleProducts, selectedBundleIds]);

  const bundleTotalPrice = useMemo(() => {
    return activeBundleProducts.reduce((sum, p) => sum + p.price, 0);
  }, [activeBundleProducts]);

  const bundleOriginalPrice = useMemo(() => {
    return activeBundleProducts.reduce(
      (sum, p) => sum + (p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice : p.price),
      0
    );
  }, [activeBundleProducts]);

  const bundleSavings = Math.max(0, bundleOriginalPrice - bundleTotalPrice);

  const handleToggleBundleItem = (id: string) => {
    setSelectedBundleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectProduct = (prod: Product) => {
    if (onSelectProduct) {
      onSelectProduct(prod);
    } else {
      setCurrentProduct(prod);
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  };

  const handleAddBundleToCart = () => {
    if (activeBundleProducts.length === 0) {
      showToast('No items selected', 'Please select at least one item from the bundle.', 'info');
      return;
    }
    let addedCount = 0;
    activeBundleProducts.forEach((prod) => {
      const ok = addToCart(prod, 1);
      if (ok) addedCount++;
    });
    showToast(
      'Bundle Added to Cart!',
      `Added ${addedCount} ${addedCount === 1 ? 'item' : 'items'} to your cart. Total: Rs. ${bundleTotalPrice.toLocaleString()}`,
      'success'
    );
    onClose();
  };

  const handleBuyBundleNow = () => {
    if (activeBundleProducts.length === 0) {
      showToast('No items selected', 'Please select at least one item from the bundle.', 'info');
      return;
    }
    activeBundleProducts.forEach((prod) => {
      addToCart(prod, 1);
    });
    onBuyNow(activeBundleProducts[0], 1);
    onClose();
  };

  // Handle Verify Order Action in form
  const handleVerifyOrder = () => {
    if (!formOrderNumber.trim()) {
      showToast('Order Number Required', 'Please enter your order number or phone/email to verify your purchase.', 'info');
      return;
    }

    setIsVerifyingOrder(true);
    setTimeout(() => {
      const check = db.verifyCustomerPurchase(currentProduct.id, {
        orderNumber: formOrderNumber.trim(),
        email: formOrderNumber.includes('@') ? formOrderNumber.trim() : undefined,
        phone: !formOrderNumber.includes('@') ? formOrderNumber.trim() : undefined,
      });

      setVerificationResult({
        checked: true,
        isVerified: check.isVerified,
        orderNumber: check.orderNumber,
        customerName: check.customerName,
        city: check.city,
        message: check.message,
      });

      if (check.isVerified) {
        if (check.customerName && !formName) setFormName(check.customerName);
        if (check.city && !formCity) setFormCity(check.city);
        showToast('Purchase Verified!', `Order #${check.orderNumber} successfully confirmed. Your review will display the Verified Buyer badge.`, 'success');
      } else {
        showToast('Order Not Found', 'No completed purchase for this product was found matching that info. You can still submit feedback as a shopper.', 'info');
      }
      setIsVerifyingOrder(false);
    }, 350);
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Name Required', 'Please enter your name.', 'error');
      return;
    }
    if (!formTitle.trim()) {
      showToast('Headline Required', 'Please enter a short headline for your review.', 'error');
      return;
    }
    if (!formComment.trim() || formComment.trim().length < 10) {
      showToast('Comment Too Short', 'Please share at least 10 characters of detailed feedback.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const isVerified = verificationResult?.isVerified || false;
      const { review, updatedProduct } = db.addReview({
        productId: currentProduct.id,
        customerName: formName.trim(),
        customerCity: formCity.trim() || 'Pakistan',
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
        verifiedPurchase: isVerified,
        recommended: formRecommended,
        orderNumber: verificationResult?.orderNumber || formOrderNumber.trim() || undefined,
      });

      if (updatedProduct) {
        setCurrentProduct(updatedProduct);
        if (onProductUpdated) onProductUpdated(updatedProduct);
      }

      loadReviews();
      showToast(
        isVerified ? 'Verified Review Published!' : 'Review Submitted!',
        'Thank you for leaving your feedback! It helps shoppers across Pakistan.',
        'success'
      );

      // Reset form
      setShowReviewForm(false);
      setFormTitle('');
      setFormComment('');
      setFormRating(5);
    } catch (err: any) {
      showToast('Submission Failed', err?.message || 'Could not save review. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Voting Review Helpful
  const handleVoteHelpful = (reviewId: string) => {
    if (votedReviews.includes(reviewId)) {
      showToast('Already Voted', 'You have already marked this review as helpful.', 'info');
      return;
    }

    const res = db.voteReviewHelpful(reviewId, true);
    if (res.success) {
      setVotedReviews((prev) => [...prev, reviewId]);
      loadReviews();
      showToast('Feedback Received', 'Thank you for letting us know this review was helpful!', 'success');
    } else {
      showToast('Notice', res.message, 'info');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl text-slate-800 flex flex-col max-h-[92vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Mode Tabs */}
        <div className="p-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-[#0284c7] uppercase">
              {currentProduct.category.replace('-', ' ')}
            </span>
            <span className="text-xs text-slate-400 font-mono">SKU: {currentProduct.sku}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Product Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Ratings & Reviews</span>
                <span className="px-1.5 py-0.2 bg-sky-100 text-[#0284c7] rounded-full text-[10px] font-bold">
                  {reviewSummary.totalCount}
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto">
          {activeTab === 'details' ? (
            /* ================= TAB 1: PRODUCT DETAILS ================= */
            <>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images Section with Multi-Angle Gallery & Close-Up Inspector */}
                <div className="flex flex-col gap-3">
                  {/* Main Image Container */}
                  <div className="aspect-square bg-slate-900/5 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative group">
                    <img
                      src={currentProduct.images[selectedImageIndex] || currentProduct.images[0]}
                      alt={currentProduct.name}
                      onClick={() => setIsZoomModalOpen(true)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/easystore_detail_${currentProduct.id}/600/600`;
                      }}
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                      title="Click to open Fullscreen Close-Up Inspector"
                    />

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <span className="absolute top-3 left-3 bg-[#ef4444] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md z-10 pointer-events-none">
                        -{discountPercent}% OFF
                      </span>
                    )}

                    {/* Inspect Close-Up Button */}
                    <button
                      type="button"
                      onClick={() => setIsZoomModalOpen(true)}
                      className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all z-10"
                      title="Inspect fine details, buttons, and close-up views"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Close-Up View</span>
                    </button>

                    {/* Previous / Next Arrow Controls */}
                    {currentProduct.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevImage();
                          }}
                          aria-label="Previous angle"
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center cursor-pointer transition-all opacity-80 group-hover:opacity-100 z-10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          aria-label="Next angle"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center cursor-pointer transition-all opacity-80 group-hover:opacity-100 z-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Angle / Perspective Indicator Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {IMAGE_ANGLE_LABELS[selectedImageIndex] || `Photo ${selectedImageIndex + 1}`}
                      </span>
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {selectedImageIndex + 1} / {currentProduct.images.length}
                      </span>
                    </div>
                  </div>

                  {/* Additional gallery thumbnails with angle descriptors */}
                  {currentProduct.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                      {currentProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex flex-col items-center gap-1 rounded-xl p-0.5 border-2 transition-all shrink-0 cursor-pointer ${
                            selectedImageIndex === idx
                              ? 'border-[#0284c7] bg-sky-50/50 shadow-xs'
                              : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-13 h-13 rounded-lg overflow-hidden bg-slate-100">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className={`text-[9px] font-bold px-1 line-clamp-1 max-w-[56px] text-center ${
                            selectedImageIndex === idx ? 'text-[#0284c7]' : 'text-slate-500'
                          }`}>
                            {idx === 0 ? 'Cover' : idx === 1 ? 'Close-up' : idx === 2 ? 'Features' : idx === 3 ? 'In-Use' : 'Box'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Pakistan Delivery Assurances */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center gap-1">
                      <Truck className="w-4 h-4 text-[#0284c7]" />
                      <span className="font-bold text-slate-800 text-[11px]">Cash on Delivery</span>
                      <span className="text-[10px] text-slate-500">All Pakistan</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800 text-[11px]">100% Original</span>
                      <span className="text-[10px] text-slate-500">Verified Brand</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center gap-1">
                      <RotateCcw className="w-4 h-4 text-[#0284c7]" />
                      <span className="font-bold text-slate-800 text-[11px]">7 Days Return</span>
                      <span className="text-[10px] text-slate-500">Checking Warranty</span>
                    </div>
                  </div>
                </div>

                {/* Details & Action Column */}
                <div className="flex flex-col justify-between">
                  <div>
                    {/* Brand & Wishlist */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                        Brand: {currentProduct.brand || 'Easy Store Verified'}
                      </span>
                      <button
                        onClick={() => toggleWishlist(currentProduct.id)}
                        className={`p-2 rounded-full border transition-colors cursor-pointer ${
                          inWishlist
                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                            : 'border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-2">
                      {currentProduct.name}
                    </h1>

                    {/* Interactive Star Rating Indicator (Clicking jumps to Reviews tab) */}
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className="flex items-center gap-1.5 group cursor-pointer hover:opacity-80 transition-opacity"
                        title="View all customer reviews and ratings"
                      >
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(currentProduct.rating)
                                  ? 'fill-current'
                                  : 'text-slate-200 fill-current'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-800 underline decoration-slate-300 group-hover:decoration-[#0284c7]">
                          {currentProduct.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-sky-600 font-medium">
                          ({reviewSummary.totalCount} {reviewSummary.totalCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </button>

                      <span className="text-slate-300"> </span>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('reviews');
                          setShowReviewForm(true);
                        }}
                        className="text-xs font-semibold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Write a Review
                      </button>
                    </div>

                    {/* Price in Rs. */}
                    <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5">
                      <span className="text-2xl sm:text-3xl font-black text-[#dc2626]">
                        Rs. {currentProduct.price.toLocaleString()}
                      </span>
                      {currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price && (
                        <>
                          <span className="text-sm text-slate-400 line-through">
                            Rs. {currentProduct.compareAtPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Save Rs. {(currentProduct.compareAtPrice - currentProduct.price).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stock Status in Pakistan */}
                    <div className="mb-4 text-xs">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Currently Out of Stock
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          In Stock in Pakistan Warehouse ({currentProduct.stock} units ready to ship)
                        </span>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {currentProduct.description}
                    </p>

                    {/* Technical Specifications */}
                    {currentProduct.specs && Object.keys(currentProduct.specs).length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Key Specifications
                        </h4>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs divide-y divide-slate-100">
                          {Object.entries(currentProduct.specs).map(([key, val]) => (
                            <div key={key} className="grid grid-cols-2 py-1.5">
                              <span className="text-slate-500 font-medium">{key}</span>
                              <span className="text-slate-800 font-bold text-right">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Controls */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    {!isOutOfStock && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Quantity:</span>
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-bold text-xs text-slate-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= maxAvailable}
                            className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dual CTAs: "Add to Cart" & "Buy Now" */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="py-3 px-4 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button
                        onClick={handleDirectBuy}
                        disabled={isOutOfStock}
                        className="py-3 px-4 rounded-xl font-bold text-xs bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= FREQUENTLY BOUGHT TOGETHER SECTION ================= */}
              {frequentlyBoughtItems.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50/80 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284c7] flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> Popular Pairing
                        </span>
                        <span className="text-slate-300"> </span>
                        <span className="text-xs text-slate-500">
                          Complementary items in {currentProduct.category.replace('-', ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-0.5">
                        Frequently Bought Together
                      </h3>
                    </div>
                    {bundleSavings > 0 && (
                      <div className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Save Rs. {bundleSavings.toLocaleString()} with this bundle</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Visual Product Cards Row */}
                    <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-3">
                      {bundleProducts.map((item, index) => {
                        const isSelected = selectedBundleIds.includes(item.id);
                        const isPrimary = item.id === currentProduct.id;
                        return (
                          <React.Fragment key={item.id}>
                            {index > 0 && (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-black text-sm flex items-center justify-center shrink-0 my-1 sm:my-0 shadow-2xs">
                                +
                              </div>
                            )}
                            <div
                              className={`w-full sm:w-1/2 p-3 rounded-2xl bg-white border transition-all text-left flex sm:flex-col gap-3 sm:gap-2 items-center sm:items-stretch group ${
                                isSelected
                                  ? 'border-sky-300 shadow-sm ring-1 ring-sky-200'
                                  : 'border-slate-200 opacity-60 hover:opacity-90'
                              }`}
                            >
                              {/* Top Bar with Checkbox */}
                              <div className="flex items-center justify-between w-full">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleBundleItem(item.id)}
                                    className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] cursor-pointer"
                                  />
                                  <span className="text-[11px] font-bold text-slate-700">
                                    {isPrimary ? 'This Item' : 'Add to Bundle'}
                                  </span>
                                </label>
                                {item.bestSeller && (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                                    Popular
                                  </span>
                                )}
                              </div>

                              {/* Thumbnail Image */}
                              <div
                                onClick={() => handleSelectProduct(item)}
                                className="w-20 h-20 sm:w-full sm:aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center cursor-pointer relative shrink-0"
                                title={`Inspect ${item.name}`}
                              >
                                <img
                                  src={item.images[0]}
                                  alt={item.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/easystore_bundle_${item.id}/400/400`;
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Text Details */}
                              <div className="flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleSelectProduct(item)}
                                  className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-[#0284c7] transition-colors text-left cursor-pointer"
                                  title={item.name}
                                >
                                  {item.name}
                                </button>
                                <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-1">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="font-bold text-slate-700">{item.rating.toFixed(1)}</span>
                                  <span className="text-slate-400">({item.reviewCount})</span>
                                </div>
                                <div className="flex items-baseline gap-1.5 mt-1.5">
                                  <span className="text-xs sm:text-sm font-black text-[#dc2626]">
                                    Rs. {item.price.toLocaleString()}
                                  </span>
                                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                      Rs. {item.compareAtPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Bundle Summary Card & CTAs */}
                    <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Bundle Total</span>
                          <span className="font-bold text-slate-700">
                            {activeBundleProducts.length} {activeBundleProducts.length === 1 ? 'item' : 'items'} selected
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#dc2626]">
                            Rs. {bundleTotalPrice.toLocaleString()}
                          </span>
                          {bundleSavings > 0 && (
                            <span className="text-xs text-slate-400 line-through">
                              Rs. {bundleOriginalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {bundleSavings > 0 && (
                          <p className="text-xs font-bold text-emerald-700 mt-1">
                            Save Rs. {bundleSavings.toLocaleString()} on this combination!
                          </p>
                        )}
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Cash on Delivery Available</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>7 Days Checking Warranty</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3">
                        <button
                          type="button"
                          onClick={handleAddBundleToCart}
                          disabled={activeBundleProducts.length === 0}
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add Bundle to Cart ({activeBundleProducts.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleBuyBundleNow}
                          disabled={activeBundleProducts.length === 0}
                          className="w-full py-2 px-4 rounded-xl font-bold text-xs bg-[#f97316] hover:bg-[#ea580c] text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Buy Bundle Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ================= TAB 2: RATINGS & REVIEWS ================= */
            <div className="p-6 space-y-6">
              {/* Top Rating Breakdown Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Overall Score */}
                <div className="md:col-span-4 text-center md:text-left md:border-r md:border-slate-200 md:pr-6">
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      {reviewSummary.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start text-amber-400 my-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(reviewSummary.averageRating)
                            ? 'fill-current'
                            : 'text-slate-200 fill-current'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Based on {reviewSummary.totalCount} {reviewSummary.totalCount === 1 ? 'customer review' : 'customer reviews'}
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{reviewSummary.recommendPercentage}% of buyers recommend this</span>
                  </div>
                </div>

                {/* Rating Distribution Progress Bars */}
                <div className="md:col-span-5 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewSummary.breakdown[star] || 0;
                    const pct = reviewSummary.percentageBreakdown[star] || 0;
                    const isSelected = selectedRatingFilter === star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatingFilter(isSelected ? 'all' : star)}
                        className={`w-full flex items-center gap-2 text-xs text-left group transition-all py-0.5 px-1.5 rounded-lg cursor-pointer ${
                          isSelected ? 'bg-sky-50 font-bold text-[#0284c7]' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="w-10 flex items-center gap-1 shrink-0 font-medium text-slate-700">
                          {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelected ? 'bg-[#0284c7]' : 'bg-amber-400 group-hover:bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-slate-400 text-[11px] shrink-0 font-mono">
                          {count} ({pct}%)
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Action CTA */}
                <div className="md:col-span-3 text-center flex flex-col items-center justify-center gap-2.5 md:border-l md:border-slate-200 md:pl-6">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Verified Buyer Reviews</h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Feedback from customers who received this order in Pakistan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </button>
                </div>
              </div>

              {/* Collapsible Review Submission Form */}
              {showReviewForm && (
                <div className="p-6 rounded-2xl bg-white border-2 border-sky-200 shadow-lg space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-50 text-[#0284c7]">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Share Your Customer Feedback</h3>
                        <p className="text-[11px] text-slate-500">
                          Reviewing: <span className="font-semibold text-slate-700">{currentProduct.name}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {/* Interactive Star Rating Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Overall Rating <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= (hoverRating || formRating);
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFormRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                                aria-label={`${star} Stars`}
                              >
                                <Star
                                  className={`w-7 h-7 ${
                                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs font-bold text-slate-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          {RATING_DESCRIPTIONS[hoverRating || formRating]}
                        </span>
                      </div>
                    </div>

                    {/* Verified Customer Purchase Lookup */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Order Verification for "Verified Buyer" Badge</span>
                        </div>
                        {verificationResult?.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Optional</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Enter the Order Number (e.g. <span className="font-mono font-bold text-slate-700">ES...</span>) or the email/phone used when ordering. Once verified, your review will showcase the green Verified Buyer badge.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formOrderNumber}
                          onChange={(e) => setFormOrderNumber(e.target.value)}
                          placeholder="Order # or Email or Phone (e.g. 03001234567)"
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOrder}
                          disabled={isVerifyingOrder || !formOrderNumber.trim()}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          {isVerifyingOrder ? (
                            <span>Checking...</span>
                          ) : (
                            <>
                              <Search className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </>
                          )}
                        </button>
                      </div>
                      {verificationResult?.checked && (
                        <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                          verificationResult.isVerified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {verificationResult.isVerified ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 text-[11px] leading-tight">
                            {verificationResult.message}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Name & City Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Your Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Abdullah Khan"
                          required
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          City / Region in Pakistan
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            list="pk-cities-list"
                            value={formCity}
                            onChange={(e) => setFormCity(e.target.value)}
                            placeholder="e.g. Lahore, Karachi, Islamabad"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                          />
                          <datalist id="pk-cities-list">
                            {PAKISTAN_CITIES.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    {/* Headline */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Review Headline / Summary <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Fantastic build quality & received in 2 days via TCS!"
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                      />
                    </div>

                    {/* Detailed Review Comment */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Detailed Feedback & Experience <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Share details about the packaging, quality, usability, and speed of delivery in Pakistan..."
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-400">
                        Minimum 10 characters ({formComment.length} characters entered)
                      </span>
                    </div>

                    {/* Recommendation Toggle */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs font-bold text-slate-700">
                        Do you recommend this product to other shoppers?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormRecommended(true)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            formRecommended
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormRecommended(false)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            !formRecommended
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          No
                        </button>
                      </div>
                    </div>

                    {/* Form Submission CTAs */}
                    <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>Publishing...</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Submit Verified Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Filters & Sorting Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Rating & Verified filter chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedRatingFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRatingFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({reviewSummary.totalCount})
                  </button>
                  {[5, 4, 3, 2, 1].map((st) => {
                    const c = reviewSummary.breakdown[st] || 0;
                    if (c === 0 && selectedRatingFilter !== st) return null;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedRatingFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          selectedRatingFilter === st
                            ? 'bg-[#0284c7] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{st}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>({c})</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                      verifiedOnlyFilter
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Only</span>
                  </button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0284c7] cursor-pointer"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {displayedReviews.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No reviews found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      {selectedRatingFilter !== 'all' || verifiedOnlyFilter
                        ? 'Try adjusting your filters to see more customer feedback.'
                        : 'Be the first customer in Pakistan to share a review for this product!'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Write the First Review
                    </button>
                  </div>
                ) : (
                  displayedReviews.map((rev) => {
                    const isVoted = votedReviews.includes(rev.id);
                    return (
                      <div
                        key={rev.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs space-y-2.5"
                      >
                        {/* Top review header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {/* Avatar initials */}
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0284c7] font-bold text-xs flex items-center justify-center shrink-0">
                              {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {rev.customerName}
                                </span>
                                {rev.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    Verified Buyer
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {rev.customerCity || 'Pakistan'}   {formatDate(rev.createdAt)}
                              </div>
                            </div>
                          </div>

                          {/* Star Rating display */}
                          <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((st) => (
                                <Star
                                  key={st}
                                  className={`w-3.5 h-3.5 ${
                                    st <= rev.rating ? 'fill-current' : 'text-slate-200 fill-current'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{rev.rating}.0</span>
                          </div>
                        </div>

                        {/* Title & Comment */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 mb-1">
                            {rev.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Recommendation badge & Helpful voting */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                          {rev.recommended !== false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <ThumbsUp className="w-3 h-3" /> Recommends this product
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Neutral review
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleVoteHelpful(rev.id)}
                            disabled={isVoted}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                              isVoted
                                ? 'bg-sky-50 text-[#0284c7] font-bold cursor-default'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${isVoted ? 'fill-current' : ''}`} />
                            <span>Helpful ({rev.helpfulCount || 0})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= HIGH-RESOLUTION CLOSE-UP INSPECTOR LIGHTBOX ================= */}
      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsZoomModalOpen(false);
              setZoomLevel(1);
            }
          }}
        >
          {/* Top Inspector Bar */}
          <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between text-white bg-black/40 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-sm font-bold truncate max-w-[280px] sm:max-w-md">
                {currentProduct.name}
              </span>
              <span className="text-xs text-sky-400 font-semibold bg-sky-950/80 border border-sky-800/80 px-2 py-0.5 rounded-full inline-block w-fit">
                {IMAGE_ANGLE_LABELS[selectedImageIndex] || `Angle ${selectedImageIndex + 1}`} ({selectedImageIndex + 1}/{currentProduct.images.length})
              </span>
            </div>

            {/* Zoom Controls & Close Button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-white/10 border border-white/15 rounded-xl p-1 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))))}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold px-2 text-[11px] text-white/90">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(3, Number((prev + 0.5).toFixed(1))))}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="px-2 py-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 ml-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsZoomModalOpen(false);
                  setZoomLevel(1);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer ml-2"
                aria-label="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
            {/* Prev / Next Navigators */}
            {currentProduct.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 shadow-xl flex items-center justify-center transition-all cursor-pointer z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 shadow-xl flex items-center justify-center transition-all cursor-pointer z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="max-w-5xl max-h-[75vh] flex items-center justify-center">
              <img
                src={currentProduct.images[selectedImageIndex] || currentProduct.images[0]}
                alt={currentProduct.name}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.25s ease-out',
                }}
                onClick={() => {
                  setZoomLevel((prev) => (prev >= 2.5 ? 1 : prev + 0.75));
                }}
                className={`max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl cursor-pointer select-none ${
                  zoomLevel > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
              />
            </div>
          </div>

          {/* Bottom Thumbnails Navigation Strip */}
          <div className="p-3 bg-black/60 border-t border-white/10 shrink-0 flex items-center justify-center gap-3 overflow-x-auto">
            {currentProduct.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setZoomLevel(1);
                }}
                className={`flex flex-col items-center gap-1 rounded-xl p-1 border-2 transition-all cursor-pointer shrink-0 ${
                  selectedImageIndex === idx
                    ? 'border-sky-400 bg-sky-950/40 shadow-md'
                    : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/40'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-white/80 font-bold max-w-[50px] truncate">
                  {idx === 0 ? 'Cover' : idx === 1 ? 'Close-up' : idx === 2 ? 'Features' : idx === 3 ? 'In-Use' : 'Box'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
