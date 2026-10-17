import React from 'react';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, Scale, Play, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOpenDetail,
  onQuickView,
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { isInCompare, toggleCompare, openVideoModal } = useCompare();

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const soldCount = React.useMemo(() => {
    const seed = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 150 + (seed % 1400);
  }, [product.id]);

  const mallBadge = React.useMemo(() => {
    if (product.featured) {
      return { label: 'Mall', bg: 'bg-[#f85606]', text: 'text-white' };
    }
    if (product.bestSeller) {
      return { label: 'Choice', bg: 'bg-amber-500', text: 'text-slate-950 font-black' };
    }
    return { label: 'Verified', bg: 'bg-[#f85606]', text: 'text-white' };
  }, [product.featured, product.bestSeller]);

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      onOpenDetail(product);
    }
  };

  return (
    <div className="perspective-1000">
      <div className="card-3d group bg-white border border-slate-200 hover:border-[#f85606] rounded-2xl overflow-hidden flex flex-col justify-between h-full shadow-2xs hover:shadow-xl transition-all duration-300">
        <div>
          {/* Product Image Container */}
          <div 
            className="relative aspect-square w-full overflow-hidden bg-slate-50 cursor-pointer" 
            onClick={() => onOpenDetail(product)}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80';
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            />

            {/* Top-Left Mall / Choice Badge */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              <span className={`${mallBadge.bg} ${mallBadge.text} text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider`}>
                {mallBadge.label}
              </span>
              {product.price > 2500 && (
                <span className="bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                  <Truck className="w-2.5 h-2.5" />
                  <span>Free COD</span>
                </span>
              )}
            </div>

            {/* Top-Right Discount Badge */}
            {discountPercent > 0 && (
              <span className="absolute top-2 right-2 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs z-10">
                -{discountPercent}%
              </span>
            )}

            {/* Center Hover Quick View Button (Desktop Overlay) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 bg-slate-950/25 backdrop-blur-[1.5px]">
              <button
                type="button"
                onClick={handleQuickView}
                className="pointer-events-auto px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-bold text-xs shadow-xl border border-slate-200/90 flex items-center gap-1.5 transition-all transform translate-y-2 group-hover:translate-y-0 hover:scale-105 active:scale-95 cursor-pointer"
                title="Quick preview product details"
              >
                <Eye className="w-3.5 h-3.5 text-[#f85606]" />
                <span>Quick View</span>
              </button>
            </div>

            {/* Bottom-Left 10s Video Ad Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openVideoModal(product);
              }}
              className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-slate-950/80 hover:bg-[#f85606] text-white text-[10px] font-black flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer shadow-xs z-10"
              title="Watch 10-second product video ad"
            >
              <Play className="w-2.5 h-2.5 fill-current text-amber-400" />
              <span>10s Ad</span>
            </button>

            {/* Bottom-Right Controls: Compare & Wishlist */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompare(product);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                  inCompare
                    ? 'bg-[#f85606] text-white ring-2 ring-orange-300'
                    : 'bg-white/90 text-slate-700 hover:text-[#f85606] hover:bg-white'
                }`}
                title={inCompare ? 'Remove from Comparison' : 'Add to Compare (Side-by-Side)'}
                aria-label="Compare"
              >
                <Scale className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                  inWishlist
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-bold text-slate-500 truncate max-w-[110px] uppercase">
                {product.brand || product.category.replace('-', ' ')}
              </span>
              <span className="text-emerald-700 font-bold text-[9px] flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Trade Assurance</span>
              </span>
            </div>

            {/* Title */}
            <h3
              onClick={() => onOpenDetail(product)}
              className="font-bold text-slate-800 text-[11px] sm:text-xs line-clamp-2 hover:text-[#f85606] cursor-pointer transition-colors leading-snug mb-1.5 min-h-[2.1rem]"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Rating & Sold Count */}
            <div className="flex items-center gap-1.5 text-amber-500 mb-2">
              <div className="flex items-center">
                <Star className="w-3 h-3 fill-current text-amber-400" />
                <span className="text-[11px] font-black text-slate-800 ml-1">
                  {product.rating}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                · {soldCount.toLocaleString()} sold
              </span>
            </div>

            {/* Prices */}
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-black text-[#f85606]">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[10px] text-slate-400 line-through">
                  Rs. {product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Micro Delivery & Warranty Info */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-slate-600">
                <Truck className="w-3 h-3 text-[#f85606]" />
                <span>Standard Delivery</span>
              </span>
              <span className="text-emerald-600 font-bold">In Stock</span>
            </div>
          </div>
        </div>

        {/* Card Action Buttons: Quick View & Add to Cart */}
        <div className="p-3 pt-0 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleQuickView}
            className="py-2 px-2 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200 shadow-2xs hover:border-slate-300"
            title="Quick view product details without leaving this page"
          >
            <Eye className="w-3.5 h-3.5 text-[#f85606]" />
            <span>Quick View</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            disabled={isOutOfStock}
            className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#f85606] hover:bg-[#e04c00] active:scale-98 text-white shadow-orange-500/20'
            }`}
            title={isOutOfStock ? 'Sold out' : 'Add to cart'}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
