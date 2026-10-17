import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Search, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  ShoppingBag, 
  Grid, 
  X,
  Award,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Zap,
  Shirt,
  Camera,
  Wrench,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Product, ProductCategory, StoreViewMode } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BannerSlider } from '../components/BannerSlider';
import { FlashSaleSection } from '../components/FlashSaleSection';
import { CATEGORIES } from '../data/seedData';

interface StoreViewProps {
  products: Product[];
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onNavigate: (view: StoreViewMode) => void;
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

export const StoreView: React.FC<StoreViewProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenProductDetail,
  onNavigate,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(100);
  const [priceRange, setPriceRange] = useState<number>(500000);
  const [activePriceBracket, setActivePriceBracket] = useState<'all' | 'under5k' | '5k_to_25k' | '25k_to_100k' | '100k_to_500k'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState<boolean>(false);
  const itemsPerPage = 24;

  const handlePriceBracketChange = (bracket: 'all' | 'under5k' | '5k_to_25k' | '25k_to_100k' | '100k_to_500k') => {
    setActivePriceBracket(bracket);
    setCurrentPage(1);
    if (bracket === 'all') {
      setMinPrice(100);
      setPriceRange(500000);
    } else if (bracket === 'under5k') {
      setMinPrice(100);
      setPriceRange(5000);
    } else if (bracket === '5k_to_25k') {
      setMinPrice(5000);
      setPriceRange(25000);
    } else if (bracket === '25k_to_100k') {
      setMinPrice(25000);
      setPriceRange(100000);
    } else if (bracket === '100k_to_500k') {
      setMinPrice(100000);
      setPriceRange(500000);
    }
  };

  const activeCategoryInfo = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return CATEGORIES.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const activeSubCategories = useMemo(() => {
    if (!activeCategoryInfo?.subCategories) return [];
    return activeCategoryInfo.subCategories;
  }, [activeCategoryInfo]);

  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (selectedCategory === 'all' || p.category === selectedCategory) {
        if (p.brand) brandSet.add(p.brand);
      }
    });
    return Array.from(brandSet).slice(0, 15);
  }, [products, selectedCategory]);

  const showcaseCategories = useMemo(() => {
    const list = [
      {
        id: 'wallets' as ProductCategory,
        name: 'Gents Wallets',
        subtitle: 'Executive Genuine Leather & RFID Bi-Fold Wallets',
        icon: Award,
        color: 'from-amber-700 to-amber-900',
        badge: 'GENUINE LEATHER',
        products: products.filter(p => p.category === 'wallets' || p.name.toLowerCase().includes('wallet')),
      },
      {
        id: 'watches' as ProductCategory,
        name: 'Watches',
        subtitle: 'Luxury Chronographs, Quartz & Analog Wristwatches',
        icon: Zap,
        color: 'from-slate-800 to-slate-900',
        badge: 'LUXURY TIME',
        products: products.filter(p => p.category === 'watches' || p.category === 'watches-jewelry'),
      },
      {
        id: 'smart-watches' as ProductCategory,
        name: 'Smart Watches',
        subtitle: 'Bluetooth Calling Smartwatches, Fitness Bands & Ultra Clones',
        icon: Smartphone,
        color: 'from-blue-600 to-indigo-700',
        badge: 'SMART WEARABLE',
        products: products.filter(p => p.category === 'smart-watches' || p.name.toLowerCase().includes('smart watch')),
      },
      {
        id: 'home-kitchen' as ProductCategory,
        name: 'Home & Kitchen',
        subtitle: 'Coffee Beaters, Non-Stick Cookware Sets & Modern Kitchen Essentials',
        icon: Zap,
        color: 'from-orange-600 to-amber-700',
        badge: 'KITCHEN BEST',
        products: products.filter(p => p.category === 'home-kitchen' || p.category === 'appliances' || p.name.toLowerCase().includes('beater')),
      },
      {
        id: 'mobile-accessories' as ProductCategory,
        name: 'Mobile Accessories',
        subtitle: 'Wireless Bluetooth Earbuds, Fast Type-C Cables & Magnetic Mounts',
        icon: Headphones,
        color: 'from-purple-600 to-violet-800',
        badge: 'TOP GADGETS',
        products: products.filter(p => p.category === 'mobile-accessories' || p.category === 'electronics'),
      },
      {
        id: 'toolkits' as ProductCategory,
        name: 'ToolKit',
        subtitle: 'Heavy Duty Socket Wrench Sets, Cordless Drills & Hardware Tools',
        icon: Wrench,
        color: 'from-red-600 to-amber-700',
        badge: 'PRO HARDWARE',
        products: products.filter(p => p.category === 'toolkits' || p.category === 'automotive'),
      },
      {
        id: 'body-massagers' as ProductCategory,
        name: 'Body Massager',
        subtitle: 'Heated Therapy Pads, Neck & Shoulder Relaxers & 3D Rollers',
        icon: Award,
        color: 'from-emerald-600 to-teal-700',
        badge: 'HEALTH & RELAX',
        products: products.filter(p => p.category === 'body-massagers' || p.name.toLowerCase().includes('massager')),
      },
      {
        id: 'solar-lights' as ProductCategory,
        name: 'Solar Lights',
        subtitle: 'Outdoor Security Solar Floodlights & High Power Rechargeable Torches',
        icon: Zap,
        color: 'from-cyan-600 to-blue-700',
        badge: 'SOLAR POWER',
        products: products.filter(p => p.category === 'solar-lights' || p.category === 'solar-torch'),
      },
    ];
    return list.filter(item => item.products.length > 0);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const hasSearch = q.length > 0;
    const hasSubCat = selectedSubCategory !== 'all';
    const subLower = hasSubCat ? selectedSubCategory.toLowerCase() : '';
    const hasBrand = selectedBrand !== 'all';
    const maxResults = hasSearch ? 5000 : 12000;
    const matches: Product[] = [];

    const matchesCategory = (product: Product, targetCat: ProductCategory | 'all') => {
      if (targetCat === 'all') return true;
      if (product.category === targetCat) return true;
      if (targetCat === 'wallets' && (product.category === 'wallets' || product.name.toLowerCase().includes('wallet'))) return true;
      if (targetCat === 'watches' && (product.category === 'watches' || product.category === 'watches-jewelry' || product.name.toLowerCase().includes('watch'))) return true;
      if (targetCat === 'smart-watches' && (product.category === 'watches' || product.category === 'smart-watches' || product.name.toLowerCase().includes('smart watch') || product.name.toLowerCase().includes('smartwatch'))) return true;
      if (targetCat === 'glasses' && (product.category === 'glasses' || product.name.toLowerCase().includes('glass') || product.name.toLowerCase().includes('sunglass'))) return true;
      if (targetCat === 'bags' && (product.category === 'luggage-bags' || product.category === 'bags' || product.name.toLowerCase().includes('bag') || product.name.toLowerCase().includes('backpack'))) return true;
      if (targetCat === 'solar-lights' && (product.category === 'solar-torch' || product.category === 'solar-lights' || product.name.toLowerCase().includes('solar') || product.name.toLowerCase().includes('light'))) return true;
      if (targetCat === 'fitness-gym' && (product.category === 'sports-outdoor' || product.category === 'fitness-gym' || product.name.toLowerCase().includes('gym') || product.name.toLowerCase().includes('fitness') || product.name.toLowerCase().includes('exercise'))) return true;
      if (targetCat === 'home-kitchen' && (product.category === 'home-kitchen' || product.category === 'kitchen-catering' || product.category === 'appliances' || product.category === 'home-living' || product.name.toLowerCase().includes('kitchen') || product.name.toLowerCase().includes('beater'))) return true;
      if (targetCat === 'beauty-cosmetics' && (product.category === 'beauty-health' || product.category === 'beauty-cosmetics' || product.name.toLowerCase().includes('wax') || product.name.toLowerCase().includes('beauty') || product.name.toLowerCase().includes('skin'))) return true;
      if (targetCat === 'mobile-accessories' && (product.category === 'mobile-accessories' || product.category === 'electronics' || product.name.toLowerCase().includes('cable') || product.name.toLowerCase().includes('earbuds') || product.name.toLowerCase().includes('charger') || product.name.toLowerCase().includes('holder'))) return true;
      if (targetCat === 'miscellaneous' && (product.category === 'miscellaneous' || product.name.toLowerCase().includes('gadget') || product.name.toLowerCase().includes('shaver') || product.name.toLowerCase().includes('pore'))) return true;
      if (targetCat === 'caps-collection' && (product.category === 'caps-collection' || product.category === 'fashion' || product.name.toLowerCase().includes('cap') || product.name.toLowerCase().includes('hat'))) return true;
      if (targetCat === 'toolkits' && (product.category === 'toolkits' || product.category === 'automotive' || product.name.toLowerCase().includes('tool') || product.name.toLowerCase().includes('drill') || product.name.toLowerCase().includes('socket'))) return true;
      if (targetCat === 'body-massagers' && (product.category === 'body-massagers' || product.name.toLowerCase().includes('massager'))) return true;
      if (targetCat === 'belts' && (product.category === 'belts' || product.name.toLowerCase().includes('belt'))) return true;
      if (targetCat === 'binoculars' && (product.category === 'binoculars' || product.name.toLowerCase().includes('binocular') || product.name.toLowerCase().includes('telescope') || product.name.toLowerCase().includes('scope'))) return true;
      if (targetCat === 'gaming-accessories' && (product.category === 'gaming-accessories' || product.category === 'gaming' || product.name.toLowerCase().includes('gaming') || product.name.toLowerCase().includes('keyboard') || product.name.toLowerCase().includes('controller'))) return true;
      if (targetCat === 'kids-fashion' && (product.category === 'kids-fashion' || product.category === 'toys-games' || product.name.toLowerCase().includes('kid') || product.name.toLowerCase().includes('baby'))) return true;
      if (targetCat === 'psl-shirts' && (product.category === 'psl-shirts' || product.name.toLowerCase().includes('psl') || product.name.toLowerCase().includes('jersey') || product.name.toLowerCase().includes('shirt'))) return true;
      if (targetCat === 'winter-sale' && Boolean((product.compareAtPrice && product.compareAtPrice > product.price) || product.bestSeller)) return true;
      return false;
    };

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (selectedCategory !== 'all' && !matchesCategory(p, selectedCategory)) continue;

      if (hasSubCat) {
        const matchBrand = p.brand ? p.brand.toLowerCase().includes(subLower) : false;
        const matchName = p.name.toLowerCase().includes(subLower);
        const matchDesc = p.description.toLowerCase().includes(subLower);
        const matchSubCat = p.subCategory ? p.subCategory.toLowerCase().includes(subLower) : false;
        if (!matchBrand && !matchName && !matchDesc && !matchSubCat) continue;
      }

      if (hasBrand && p.brand !== selectedBrand) continue;

      if (hasSearch) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
        if (!matchName && !matchDesc && !matchSku && !matchBrand) continue;
      }

      if (p.price < minPrice || p.price > priceRange) continue;

      matches.push(p);
      if (matches.length >= maxResults) break;
    }

    return matches.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (a.bestSeller && !b.bestSeller) return -1;
      if (!a.bestSeller && b.bestSeller) return 1;
      return a.price - b.price;
    });
  }, [products, selectedCategory, selectedSubCategory, selectedBrand, searchQuery, minPrice, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 850, behavior: 'smooth' });
  };

  const resetFilters = () => {
    onSelectCategory('all');
    setSelectedBrand('all');
    setSelectedSubCategory('all');
    setMinPrice(100);
    setPriceRange(500000);
    setActivePriceBracket('all');
    setSortBy('price_asc');
    onSearchChange('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* 1. Advertisement Banner Carousel */}
      <BannerSlider
        onSelectCategory={onSelectCategory}
        onSearchChange={onSearchChange}
        onNavigate={onNavigate}
      />

      {/* Trade Assurance & Trust Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3.5 px-4 sm:px-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-tight">Official Mall Guarantee</h4>
              <p className="text-[10px] text-slate-400 font-semibold">100% Authentic Products</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-tight">Trade Assurance</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Safe Order &amp; Inspection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f85606] flex items-center justify-center shrink-0 border border-orange-100">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-tight">Fast Cash on Delivery</h4>
              <p className="text-[10px] text-slate-400 font-semibold">To 150+ Cities in Pakistan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-tight">7-Day Easy Returns</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Hassle-free Check &amp; Replace</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Flash Sale Section */}
      <FlashSaleSection
        products={products}
        onOpenDetail={onOpenProductDetail}
      />

      {/* 4. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#f85606]" />
                Shop by Category
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-[#f85606] border border-orange-200">
                50,000+ Products
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Authentic and verified products across all departments with nationwide Cash on Delivery.
            </p>
          </div>
          <button
            onClick={() => setShowAllCategoriesModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-[#f85606] border border-orange-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>All 21 Categories</span>
          </button>
        </div>

        {/* All 21 Categories matching header names exactly with zero extras */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id + '-' + cat.name}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setSelectedSubCategory('all');
                  setSelectedBrand('all');
                  setCurrentPage(1);
                }}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between group transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-orange-50 border-[#f85606] shadow-md ring-2 ring-[#f85606]'
                    : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f85606]"></span>
                )}
                <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden mb-2 group-hover:scale-105 transition-transform flex items-center justify-center border border-slate-100">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-[#f85606]" />
                  )}
                </div>
                <div className="w-full">
                  <span className="text-[11px] font-black text-slate-800 block truncate leading-tight group-hover:text-[#f85606]">
                    {cat.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 truncate">
                    {cat.subtitle || 'Shop Now'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Subcategory & Brand Filter */}
      {selectedCategory !== 'all' && activeCategoryInfo && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white border border-orange-200 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-[#f85606] font-black text-xs uppercase">
                  {activeCategoryInfo.name}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  Browse by Subcategory &amp; Brand Model:
                </span>
              </div>
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setSelectedSubCategory('all');
                  setSelectedBrand('all');
                }}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Department Filter</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pt-3 scrollbar-none">
              <button
                onClick={() => setSelectedSubCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedSubCategory === 'all'
                    ? 'bg-[#f85606] text-white border-[#f85606] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All {activeCategoryInfo.name}
              </button>
              {activeSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                    selectedSubCategory === sub
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <span>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. CATEGORY-WISE PRODUCT DEPARTMENT SHOWCASES */}
      {selectedCategory === 'all' && !searchQuery.trim() && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#f85606]" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Department Showcases &amp; Products
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-[#f85606] border border-orange-200">
                  Category Direct
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Each category is neatly organized with its dedicated department banner and complete products catalog.
              </p>
            </div>
          </div>

          {showcaseCategories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                    <cat.icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg sm:text-xl text-[#0f3460] tracking-tight">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-50 text-[#f85606] border border-orange-200">
                        {cat.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        ({cat.products.length} Products)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setSelectedSubCategory('all');
                    setSelectedBrand('all');
                    setCurrentPage(1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-orange-50 hover:bg-[#f85606] text-[#f85606] hover:text-white border border-orange-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 w-fit shadow-2xs group"
                >
                  <span>View All {cat.name.split(',')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5">
                {cat.products.slice(0, 10).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={onOpenProductDetail}
                    onQuickView={onOpenProductDetail}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 6. Main Product Catalog & Filter Explorer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedCategory === 'all' 
                  ? 'All Store Products (Catalog Explorer)'
                  : `${activeCategoryInfo?.name || selectedCategory} (${filteredProducts.length} Items)`}
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-[#f85606] border border-orange-200">
                50,000+ Verified Stock
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Premium tested products starting at competitive prices ({filteredProducts.length.toLocaleString()} items available)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-[#f85606] cursor-pointer shadow-xs"
            >
              <option value="price_asc">Price: Low to High (Rs. 100 - Rs. 5,000+)</option>
              <option value="price_desc">Price: High to Low (Rs. 500,000 - Rs. 100)</option>
              <option value="featured">Featured / Best Sellers</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Stock</option>
            </select>
          </div>
        </div>

        {/* Price Bracket Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-5 text-xs scrollbar-none">
          <span className="text-slate-500 font-bold shrink-0 text-[11px] pr-1">Filter by Price:</span>
          <button
            onClick={() => handlePriceBracketChange('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === 'all'
                ? 'bg-[#f85606] text-white border-[#f85606] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => handlePriceBracketChange('under5k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === 'under5k'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Rs. 100 - Rs. 5,000 (Budget Super Deals)
          </button>
          <button
            onClick={() => handlePriceBracketChange('5k_to_25k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === '5k_to_25k'
                ? 'bg-[#f85606] text-white border-[#f85606] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Rs. 5,000 - Rs. 25,000 (Mid-Range Deals)
          </button>
          <button
            onClick={() => handlePriceBracketChange('25k_to_100k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === '25k_to_100k'
                ? 'bg-[#f85606] text-white border-[#f85606] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Rs. 25,000 - Rs. 100,000 (Flagships &amp; Laptops)
          </button>
          <button
            onClick={() => handlePriceBracketChange('100k_to_500k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === '100k_to_500k'
                ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
            }`}
          >
            Rs. 100,000 - Rs. 500,000 (Luxury Flagships)
          </button>
        </div>

        {/* Catalog Grid + Left Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#f85606]" />
                  Filters
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#f85606] hover:underline font-bold cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-700">Price Range (PKR):</span>
                  <span className="font-black text-[#f85606]">
                    Rs. {minPrice.toLocaleString()} - Rs. {priceRange.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="500000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#f85606] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>Rs. 100 (Lowest)</span>
                  <span>Rs. 500,000 (Luxury)</span>
                </div>
              </div>

              {availableBrands.length > 0 && (
                <div>
                  <span className="font-bold text-xs text-slate-700 block mb-2">
                    Filter by Brand:
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
                    <button
                      onClick={() => {
                        setSelectedBrand('all');
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        selectedBrand === 'all'
                          ? 'bg-orange-50 text-[#f85606] font-bold'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>All Brands</span>
                      {selectedBrand === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {availableBrands.map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setSelectedBrand(b);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          selectedBrand === b
                            ? 'bg-orange-50 text-[#f85606] font-bold'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{b}</span>
                        {selectedBrand === b && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Checking Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-[#f85606]">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>Fast Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>7-Day Return &amp; Exchange</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={onOpenProductDetail}
                    onQuickView={onOpenProductDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-black text-lg text-slate-900">No Products Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not find any products matching your current filters. Try resetting the price range or search query.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#f85606] text-white rounded-xl text-xs font-bold hover:bg-[#e04c00] cursor-pointer shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#f85606] text-white hover:bg-[#e04c00] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-md"
                  >
                    Next Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* More Categories Modal */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Grid className="w-5 h-5 text-[#f85606]" />
                  All Product Departments
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select any category to explore products
                </p>
              </div>
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id + '-' + cat.name}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setSelectedSubCategory('all');
                    setSelectedBrand('all');
                    setShowAllCategoriesModal(false);
                    setCurrentPage(1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer group ${
                    selectedCategory === cat.id
                      ? 'bg-orange-50 border-[#f85606] ring-2 ring-[#f85606]'
                      : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-[#f85606] m-auto" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 group-hover:text-[#f85606] leading-tight">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
                      {cat.subtitle || cat.description}
                    </p>
                    <span className="text-[10px] font-bold text-[#f85606] mt-1.5 block">
                      {cat.productCount.toLocaleString()}+ items &rarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Departments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
