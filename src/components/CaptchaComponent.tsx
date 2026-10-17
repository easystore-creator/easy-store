import React, { useEffect, useRef } from 'react';
import { RotateCcw, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';

interface CaptchaComponentProps {
  captchaCode: string;
  userInput: string;
  onUserInputChange: (value: string) => void;
  onRefreshCaptcha: () => void;
  error?: string;
  isCompact?: boolean;
}

export const generateRandomCaptcha = (length = 5): string => {
  // Clear, non-ambiguous uppercase characters and numbers
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const CaptchaComponent: React.FC<CaptchaComponentProps> = ({
  captchaCode,
  userInput,
  onUserInputChange,
  onRefreshCaptcha,
  error,
  isCompact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#f1f5f9');
    bgGradient.addColorStop(0.5, '#e2e8f0');
    bgGradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative noise lines
    const lineColors = ['#94a3b8', '#cbd5e1', '#60a5fa', '#f97316', '#34d399'];
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = lineColors[i % lineColors.length];
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = lineColors[Math.floor(Math.random() * lineColors.length)];
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with distinct colors & slight rotation
    const charColors = ['#1e3a8a', '#0369a1', '#b91c1c', '#047857', '#6d28d9', '#c2410c'];
    const charSpacing = width / (captchaCode.length + 1);

    ctx.textBaseline = 'middle';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      const x = (i + 1) * charSpacing - 8 + (Math.random() * 4 - 2);
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 24 - 12) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = charColors[i % charColors.length];
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, [captchaCode]);

  const handleSpeakCaptcha = () => {
    try {
      if ('speechSynthesis' in window) {
        const textToSpeak = captchaCode.split('').join(' ');
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.85;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Audio not supported or blocked
    }
  };

  return (
    <div className={`rounded-2xl bg-slate-50 border ${error ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'} p-3 space-y-2.5`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1769ff]" />
          <span>Security Captcha Code *</span>
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Anti-Bot Verification</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Captcha Canvas Image */}
        <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 shrink-0 select-none">
          <canvas
            ref={canvasRef}
            width={isCompact ? 140 : 160}
            height={isCompact ? 42 : 46}
            className="block cursor-pointer"
            onClick={onRefreshCaptcha}
            title="Click to reload new code"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefreshCaptcha}
            title="Reload Security Code"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-[#1769ff] transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSpeakCaptcha}
            title="Listen to Captcha Code"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-emerald-600 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div>
        <input
          type="text"
          value={userInput}
          maxLength={6}
          autoComplete="off"
          spellCheck="false"
          onChange={(e) => onUserInputChange(e.target.value.toUpperCase())}
          placeholder="Enter security code (e.g. 7X9B4)"
          className={`w-full bg-white border ${
            error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#1769ff]'
          } rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-slate-800 placeholder-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none shadow-2xs transition-all uppercase`}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
