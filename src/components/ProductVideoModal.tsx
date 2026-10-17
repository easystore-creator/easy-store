import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Star,
  Sparkles 
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductVideoModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

const CATEGORY_SAMPLE_VIDEOS: Record<string, string> = {
  'mobiles-tablets': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'laptops': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  'electronics': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'audio-sound': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'camera-accessories': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'fashion': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'gaming': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'sports-outdoor': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'appliances': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
  'home-living': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
};

const DEFAULT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export const ProductVideoModal: React.FC<ProductVideoModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [videoProgress, setVideoProgress] = useState(0);

  const videoSource = product?.videoUrl || 
    (product?.category ? CATEGORY_SAMPLE_VIDEOS[product.category] : null) || 
    DEFAULT_VIDEO;

  useEffect(() => {
    if (!product) return;
    setCountdown(10);
    setVideoProgress(0);
    setIsPlaying(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
        setIsPlaying(false);
      });
    }

    const interval = setInterval(() => {
      if (video && !video.paused) {
        const cur = video.currentTime % 10;
        const remaining = Math.max(0, 10 - Math.floor(cur));
        setCountdown(remaining === 0 ? 10 : remaining);
        setVideoProgress((cur / 10) * 100);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [product]);

  if (!product) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
    setCountdown(10);
    setVideoProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white my-8">
        {/* Top Header Bar */}
        <div className="p-4 px-6 bg-gradient-to-r from-[#f85606] to-[#ff6a00] flex items-center justify-between text-white z-20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xs shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black truncate max-w-md">
                  10s Product Ad Clip   {product.name}
                </h3>
                <span className="bg-white text-[#f85606] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Verified Video
                </span>
              </div>
              <p className="text-[11px] text-white/90 font-medium">
                Watch verified 10-second product demo &amp; feature commercial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 10-Second Progress Indicator Strip */}
        <div className="relative w-full h-1.5 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-[#f85606] transition-all duration-200"
            style={{ width: `${videoProgress}%` }}
          />
        </div>

        {/* Video Canvas & Player Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={videoSource}
            playsInline
            loop
            muted={isMuted}
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />

          {/* 10-Second Countdown Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-black font-mono text-amber-300">
              Ad Clip: 00:0{countdown}
            </span>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
              HD 1080p
            </span>
          </div>

          {/* Floating Product Quick Pill on top right */}
          <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 pr-3 rounded-2xl border border-white/20">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-8 h-8 rounded-xl object-cover border border-white/20"
            />
            <div className="text-left text-xs leading-tight">
              <p className="font-bold text-white text-[11px] truncate max-w-[130px]">{product.name}</p>
              <p className="text-[#f85606] font-black text-xs">Rs. {product.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Central Play/Pause Overlay Button */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#f85606]/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs cursor-pointer hover:scale-110 transition-all z-20"
              aria-label="Play Video"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          )}

          {/* Video Control Bar at bottom of video */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={handleRestart}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span className="hidden sm:inline">{isMuted ? 'Muted (Tap to hear)' : 'Sound On'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Truck className="w-3.5 h-3.5 text-[#f85606]" />
              <span className="hidden sm:inline">Cash on Delivery Available</span>
            </div>
          </div>
        </div>

        {/* Bottom Product Details & Purchasing Card */}
        <div className="p-5 sm:p-6 bg-slate-900 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-500/20 text-[#f85606] border border-orange-500/30">
                  {product.category.replace('-', ' ')}
                </span>
                <span className="text-slate-400 text-xs font-mono">SKU: {product.sku}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                <div className="flex items-center">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span className="ml-1 text-white">{product.rating}</span>
                </div>
                <span className="text-slate-500"> </span>
                <span className="text-slate-400 font-medium">({product.reviewCount} customer reviews)</span>
                <span className="text-slate-500"> </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Trade Assurance
                </span>
              </div>
            </div>

            {/* Price block */}
            <div className="sm:text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-black text-[#f85606]">
                Rs. {product.price.toLocaleString()}
              </div>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="flex items-center sm:justify-end gap-2 text-xs text-slate-400 font-bold">
                  <span className="line-through">Rs. {product.compareAtPrice.toLocaleString()}</span>
                  <span className="text-rose-400">
                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Specifications preview */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
              {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                <span key={k} className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium">
                  <span className="text-slate-400 font-bold">{k}:</span> {v}
                </span>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                addToCart(product, 1);
                onClose();
              }}
              className="py-3 px-4 rounded-xl border border-orange-500/50 bg-orange-500/15 hover:bg-orange-500/25 text-[#f85606] font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onBuyNow(product, 1);
              }}
              className="py-3 px-4 rounded-xl bg-[#f85606] hover:bg-[#e04c00] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now (Cash on Delivery)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
