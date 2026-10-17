import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  Trash2, 
  ShoppingBag, 
  Zap, 
  Star, 
  Truck, 
  ShieldCheck, 
  Play, 
  Plus, 
  CheckCircle2, 
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
  allProducts: Product[];
  onOpenDetail: (product: Product) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  onBuyNow,
  allProducts,
  onOpenDetail,
}) => {
  const { addToCart } = useCart();
  const { compareList, removeFromCompare, clearCompare, addToCompare, openVideoModal } = useCompare();
  const [searchForSlot, setSearchForSlot] = useState<string>('');

  if (!isOpen) return null;

  // Collect all unique specification keys across all products being compared
  const allSpecKeys = Array.from(
    new Set(
      compareList.flatMap((p) => (p.specs ? Object.keys(p.specs) : []))
    )
  );

  // Suggested products to add if less than 3
  const suggestedProducts = allProducts
    .filter((p) => !compareList.some((cp) => cp.id === p.id))
    .filter((p) => {
      if (!searchForSlot.trim()) {
        return compareList.length > 0 ? p.category === compareList[0].category : true;
      }
      return (
        p.name.toLowerCase().includes(searchForSlot.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchForSlot.toLowerCase())
      );
    })
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-800 my-6 max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#f85606] via-[#ff6a00] to-[#e04c00] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black">
                  Side-by-Side Product Comparison
                </h2>
                <span className="bg-white text-[#f85606] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                  {compareList.length} of 3 Products
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">
                Compare price, model specifications, and features side by side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Table / Grid Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {compareList.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#f85606] flex items-center justify-center mx-auto shadow-sm">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800">No Products Selected to Compare</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Browse our catalog and click the &quot;Compare&quot; button on any product card to view side-by-side specifications, prices, and 10-second video ads.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#f85606] hover:bg-[#e04c00] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20"
              >
                Browse Store Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {compareList.map((product) => {
                  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
                    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={product.id}
                      className="relative bg-white border-2 border-orange-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between group hover:border-[#f85606] transition-all"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        {/* Image & Video Button */}
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-3 group">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* 10s Video Ad Button */}
                          <button
                            onClick={() => openVideoModal(product)}
                            className="absolute bottom-2.5 left-2.5 right-2.5 py-1.5 px-3 rounded-xl bg-slate-950/80 hover:bg-[#f85606] text-white text-[11px] font-black flex items-center justify-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-md"
                          >
                            <Play className="w-3 h-3 fill-current text-amber-400" />
                            <span>Watch 10s Ad Clip</span>
                          </button>

                          {discountPercent > 0 && (
                            <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>

                        {/* Title & Brand */}
                        <div className="space-y-1 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {product.brand || product.category.replace('-', ' ')}
                          </span>
                          <h4 
                            onClick={() => onOpenDetail(product)}
                            className="font-black text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-[#f85606] cursor-pointer transition-colors"
                          >
                            {product.name}
                          </h4>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-base sm:text-lg font-black text-[#f85606]">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs text-slate-400 line-through">
                              Rs. {product.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                          <div className="flex items-center text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-bold text-slate-800 ml-1">{product.rating}</span>
                          </div>
                          <span className="text-slate-400"> </span>
                          <span className="text-slate-400 text-[11px]">({product.reviewCount} reviews)</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="w-full py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#f85606] border border-orange-200 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onBuyNow(product, 1);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-[#f85606] hover:bg-[#e04c00] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-orange-500/20"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty Slot Placeholder if fewer than 3 */}
                {compareList.length < 3 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#f85606] flex items-center justify-center shadow-2xs">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Add Another Product</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Compare up to 3 products ({compareList.length}/3 selected)
                      </p>
                    </div>

                    {/* Search / Select input */}
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        value={searchForSlot}
                        onChange={(e) => setSearchForSlot(e.target.value)}
                        placeholder="Search product to add..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#f85606]"
                      />
                      {/* Suggestions list */}
                      <div className="max-h-36 overflow-y-auto space-y-1.5 text-left">
                        {suggestedProducts.map((sp) => (
                          <div
                            key={sp.id}
                            onClick={() => {
                              addToCompare(sp);
                              setSearchForSlot('');
                            }}
                            className="p-1.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 flex items-center justify-between gap-2 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={sp.images[0]} alt={sp.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                              <p className="text-[11px] font-bold text-slate-800 truncate">{sp.name}</p>
                            </div>
                            <span className="text-[10px] font-black text-[#f85606] shrink-0">
                              Rs. {sp.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Specs Matrix Table */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <span>Full Specifications &amp; Feature Comparison</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Verified Product Details
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Category & Department */}
                  <div className="grid grid-cols-12 p-3.5 hover:bg-slate-50/50">
                    <div className="col-span-3 font-bold text-slate-500 flex items-center">
                      Department
                    </div>
                    {compareList.map((p) => (
                      <div key={p.id} className="col-span-3 font-semibold text-slate-800 capitalize">
                        {p.category.replace('-', ' ')}
                      </div>
                    ))}
                  </div>

                  {/* Stock Status */}
                  <div className="grid grid-cols-12 p-3.5 hover:bg-slate-50/50">
                    <div className="col-span-3 font-bold text-slate-500 flex items-center">
                      Availability
                    </div>
                    {compareList.map((p) => (
                      <div key={p.id} className="col-span-3 font-bold">
                        {p.stock > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>In Stock ({p.stock} units)</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Delivery & COD */}
                  <div className="grid grid-cols-12 p-3.5 hover:bg-slate-50/50">
                    <div className="col-span-3 font-bold text-slate-500 flex items-center">
                      Cash on Delivery
                    </div>
                    {compareList.map((p) => (
                      <div key={p.id} className="col-span-3 text-slate-700 font-semibold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#f85606]" />
                        <span>Available in Pakistan (2-4 days)</span>
                      </div>
                    ))}
                  </div>

                  {/* 10s Video Clip Row */}
                  <div className="grid grid-cols-12 p-3.5 bg-orange-50/30">
                    <div className="col-span-3 font-bold text-[#f85606] flex items-center">
                      10s Video Ad
                    </div>
                    {compareList.map((p) => (
                      <div key={p.id} className="col-span-3">
                        <button
                          onClick={() => openVideoModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f85606] text-white text-[11px] font-black cursor-pointer shadow-2xs hover:bg-[#e04c00]"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play 10s Clip</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Technical Specs */}
                  {allSpecKeys.map((specKey) => (
                    <div key={specKey} className="grid grid-cols-12 p-3.5 hover:bg-slate-50/50">
                      <div className="col-span-3 font-bold text-slate-500 flex items-center">
                        {specKey}
                      </div>
                      {compareList.map((p) => (
                        <div key={p.id} className="col-span-3 font-medium text-slate-800">
                          {p.specs?.[specKey] || '-'}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Warranty & Return */}
                  <div className="grid grid-cols-12 p-3.5 hover:bg-slate-50/50">
                    <div className="col-span-3 font-bold text-slate-500 flex items-center">
                      Warranty
                    </div>
                    {compareList.map((p) => (
                      <div key={p.id} className="col-span-3 text-slate-700 font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>7 Days Check &amp; Replace Warranty</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
