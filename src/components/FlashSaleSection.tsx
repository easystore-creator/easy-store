import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  ShoppingBag, 
  Eye, 
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface FlashSaleSectionProps {
  products: Product[];
  onOpenDetail: (product: Product) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  onOpenDetail,
}) => {
  const { addToCart } = useCart();

  // Countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 38,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 6, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pick top discounted products
  const flashProducts = React.useMemo(() => {
    return products
      .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
      .slice(0, 6);
  }, [products]);

  if (flashProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-gradient-to-r from-rose-50 via-amber-50/60 to-white border border-rose-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Flash Sale 
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white animate-bounce">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Limited Time Price Cuts   Extra Vouchers Applied!
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Ending in:</span>
            </span>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-white">
              <span className="bg-slate-900 px-2 py-1 rounded-md">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-slate-800 font-bold">:</span>
              <span className="bg-slate-900 px-2 py-1 rounded-md">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-slate-800 font-bold">:</span>
              <span className="bg-rose-600 px-2 py-1 rounded-md">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Flash Sale Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-5">
          {flashProducts.map((product, idx) => {
            const discount = product.compareAtPrice
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : 25;
            const soldPercent = 75 + ((idx * 7) % 23);

            return (
              <div
                key={product.id}
                className="group bg-white border border-slate-200/90 hover:border-rose-300 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer relative overflow-hidden"
                onClick={() => onOpenDetail(product)}
              >
                {/* Top Badges */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-2">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-1 left-1 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    -{discount}%
                  </span>
                  <span className="absolute top-1 right-1 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                    Choice
                  </span>

                  {/* Center Quick View Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-slate-950/20 backdrop-blur-[1px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(product);
                      }}
                      className="pointer-events-auto px-2.5 py-1 rounded-lg bg-white/95 hover:bg-white text-slate-900 font-bold text-[10px] shadow-md flex items-center gap-1 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Quick preview details"
                    >
                      <Eye className="w-3 h-3 text-rose-600" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block truncate">
                    {product.brand || product.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors">
                    {product.name}
                  </h4>

                  {/* Price */}
                  <div className="pt-1">
                    <div className="text-sm font-black text-rose-600 leading-none">
                      Rs. {product.price.toLocaleString()}
                    </div>
                    {product.compareAtPrice && (
                      <div className="text-[10px] text-slate-400 line-through mt-0.5">
                        Rs. {product.compareAtPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Progress bar sold % */}
                  <div className="pt-1.5 space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                      <span className="text-rose-600">{soldPercent}% Claimed</span>
                      <span className="text-slate-400">COD Available</span>
                    </div>
                  </div>
                </div>

                {/* Instant Actions: Quick View & Grab Deal */}
                <div className="pt-2 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(product);
                    }}
                    className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border border-slate-200"
                    title="Quick preview details"
                  >
                    <Eye className="w-3 h-3 text-rose-600" />
                    <span>Quick</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-[10px] font-black flex items-center justify-center gap-1 shadow-xs shadow-rose-600/20 cursor-pointer transition-all"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Grab</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
