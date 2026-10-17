import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Tag, 
  Flame,
  ShoppingBag
} from 'lucide-react';
import { db } from '../services/db';
import { INITIAL_BANNERS } from '../data/seedData';
import { BannerSlide, ProductCategory, StoreViewMode } from '../types';

interface BannerSliderProps {
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  onSearchChange: (q: string) => void;
  onNavigate?: (view: StoreViewMode) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  onSelectCategory,
  onSearchChange,
}) => {
  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    const list = db.getBanners();
    return list && list.length > 0 ? list : INITIAL_BANNERS;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Sync if banners change in Admin
  useEffect(() => {
    const loadBanners = () => {
      const list = db.getBanners();
      if (list && list.length > 0) {
        setBanners(list);
      }
    };
    window.addEventListener('storage', loadBanners);
    return () => window.removeEventListener('storage', loadBanners);
  }, []);

  // Auto-play timer (slides every 4.5 seconds, pauses when mouse hovers)
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const activeBanner = banners[currentIndex] || banners[0];

  const handleCtaClick = () => {
    if (activeBanner.ctaCategory && activeBanner.ctaCategory !== 'all') {
      onSelectCategory(activeBanner.ctaCategory);
    } else if (activeBanner.searchFilter) {
      onSearchChange(activeBanner.searchFilter);
    } else {
      onSelectCategory('all');
    }
    window.scrollTo({ top: 580, behavior: 'smooth' });
  };

  if (!activeBanner) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      {/* 1. Main Banner Ad Container */}
      <div 
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-slate-950 border border-slate-200/80 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Banner Ad Image with Smooth Transition */}
        <div className="relative w-full h-[340px] sm:h-[400px] md:h-[440px] lg:h-[480px]">
          <img
            key={activeBanner.id}
            src={activeBanner.imageUrl}
            alt={activeBanner.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const fallbacks: Record<string, string> = {
                'mobiles-tablets': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=85',
                'fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
                'home-living': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
                'sports-outdoor': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=85',
                'toys-games': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1600&q=85',
                'gaming': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1600&q=85',
                'books-stationery': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1600&q=85',
                'kitchen-catering': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
                'luggage-bags': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=85',
                'watches-jewelry': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=85',
              };
              const fb = (activeBanner.ctaCategory && fallbacks[activeBanner.ctaCategory]) || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=85';
              (e.target as HTMLImageElement).src = fb;
            }}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform scale-100 group-hover:scale-105"
            loading="eager"
          />

          {/* High-Contrast Gradient Overlays for Maximum Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent sm:w-3/4 md:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />

          {/* Content Layout */}
          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 md:p-12 z-10">
            {/* Top Row: Badges & Slide Number Indicator */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-[#f85606] text-white shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>{activeBanner.badge || 'MEGA DEAL'}</span>
                </span>
                
                {activeBanner.discountBadge && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                    <Tag className="w-3.5 h-3.5 fill-current" />
                    <span>{activeBanner.discountBadge}</span>
                  </span>
                )}
              </div>

              {/* Slide Counter (e.g. AD 01 / 05) */}
              <div className="bg-black/60 backdrop-blur-md text-white/90 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-white/20">
                <span className="text-amber-300">AD {(currentIndex + 1).toString().padStart(2, '0')}</span>
                <span className="opacity-40 mx-1">/</span>
                <span>{banners.length.toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Middle: Headline, Description & Call To Action */}
            <div className="max-w-xl space-y-3 sm:space-y-4 my-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {activeBanner.title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-200 font-medium leading-relaxed max-w-lg drop-shadow-sm">
                {activeBanner.subtitle}
              </p>

              {/* Action Button */}
              <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCtaClick}
                  className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#f85606] hover:bg-[#e04c00] text-white font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 h-5" />
                  <span>{activeBanner.ctaText || 'Shop Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="hidden xs:flex items-center gap-2 text-[11px] text-white/80 font-medium bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Bottom: Interactive Pagination Dots */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 self-center sm:self-auto">
                {banners.map((b, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={b.id || idx}
                      onClick={() => setCurrentIndex(idx)}
                      title={`Ad ${idx + 1}: ${b.title}`}
                      className={`group/dot relative flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'w-7 sm:w-8 h-3 sm:h-3.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/50'
                          : 'w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-white/40 hover:bg-white/80 hover:scale-125'
                      }`}
                    >
                      {isActive && (
                        <span className="text-[9px] font-black font-mono text-slate-950 leading-none">
                          {idx + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-4 text-[11px] text-white/80 font-medium bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Nationwide Shipping</span>
                </span>
                <span className="opacity-40"> </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                  <span>7-Day Checking</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Slide Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous Banner Ad"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110 opacity-70 group-hover:opacity-100 z-20 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Next Slide Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next Banner Ad"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110 opacity-70 group-hover:opacity-100 z-20 shadow-lg"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 2. Top Confidence Strip under Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-3">
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f85606] flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-black text-slate-800 block truncate">Fast Cash on Delivery</span>
            <span className="text-[10px] text-slate-500 block truncate">All 150+ Pakistan Cities</span>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-black text-slate-800 block truncate">100% Genuine Items</span>
            <span className="text-[10px] text-slate-500 block truncate">Direct Distributor Sourced</span>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-black text-slate-800 block truncate">7-Day Checking</span>
            <span className="text-[10px] text-slate-500 block truncate">Hassle-free replacement</span>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-black text-slate-800 block truncate">Coupon &lsquo;EASYSTORE&rsquo;</span>
            <span className="text-[10px] text-slate-500 block truncate">Flat 10% Extra Discount</span>
          </div>
        </div>
      </div>
    </div>
  );
};
