import React from 'react';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export const CompareFloatingBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, openCompareModal } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95vw] max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-white shadow-2xl flex items-center justify-between gap-3">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#f85606] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
            <Scale className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div className="flex items-center gap-2">
            {compareList.map((product) => (
              <div key={product.id} className="relative group shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-[#f85606] bg-white"
                />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] shadow-xs cursor-pointer"
                  title="Remove"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {/* Empty slots placeholders */}
            {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-xl border border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-[11px] font-bold"
              >
                +{idx + compareList.length + 1}
              </div>
            ))}
          </div>
          <div className="hidden sm:block text-left pl-1">
            <p className="text-xs font-black text-white">Compare Products</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {compareList.length} of 3 selected
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={openCompareModal}
            className="px-4 py-2 bg-[#f85606] hover:bg-[#e04c00] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/25 transition-all active:scale-95"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
