import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  light?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  light = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 sm:w-11 sm:h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  }[size];

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl',
  }[size];

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Visual Icon Badge */}
      <div
        className={`${iconDimensions} bg-gradient-to-tr from-[#f85606] via-[#ff681a] to-[#d9480f] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 relative overflow-hidden shrink-0 border border-white/20`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none opacity-80" />
        <svg
          viewBox="0 0 40 40"
          className="w-3/5 h-3/5 drop-shadow-md fill-none stroke-current"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 13.5H31L28.5 33H11.5L9 13.5Z" fill="rgba(255,255,255,0.22)" />
          <path d="M14.5 13.5V10C14.5 6.96 16.96 4.5 20 4.5C23.04 4.5 25.5 6.96 25.5 10V13.5" />
          <path d="M16 19.5H24" strokeWidth="2.6" stroke="#fed7aa" />
          <path d="M16 23.5H22" strokeWidth="2.6" stroke="#ffffff" />
          <path d="M16 27.5H24" strokeWidth="2.6" stroke="#fed7aa" />
        </svg>
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-300 rounded-full shadow-xs shadow-amber-300 animate-pulse" />
      </div>

      <div className="leading-tight text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight ${titleSizes} ${light ? 'text-white' : 'text-slate-900'}`}>
            Easy <span className="text-[#f85606]">Store</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-[#f85606] font-black text-[9px] uppercase tracking-wider hidden sm:inline-block border border-orange-200">
            PK
          </span>
        </div>
        {showTagline && (
          <span
            className={`block font-semibold tracking-tight mt-0.5 ${taglineSizes} ${
              light ? 'text-orange-200' : 'text-slate-500'
            }`}
          >
            Pakistan&apos;s #1 Online Store
          </span>
        )}
      </div>
    </div>
  );
};
