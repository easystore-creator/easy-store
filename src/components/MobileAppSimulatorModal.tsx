import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../services/db';
import { Product, ProductCategory } from '../types';
import { STORE_HEADER_CATEGORIES, STORE_HEADER_QUICK_CATEGORIES, CATEGORY_NAME_TO_ID } from './Navbar';
import { CaptchaComponent, generateRandomCaptcha } from './CaptchaComponent';
import { SocialAuthButtons } from './SocialAuthButtons';

interface MobileAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const MobileAppSimulatorModal: React.FC<MobileAppSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { 
    login, 
    loginWithSocial,
    register, 
    regAttemptsRemaining, 
    isRegBlocked, 
    recordFailedRegAttempt,
    isLoginBlocked,
  } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [phase, setPhase] = useState<'splash' | 'auth' | 'app'>('splash');
  const [splashProgress, setSplashProgress] = useState(0);
  const [splashStatus, setSplashStatus] = useState('Initializing Easy Store Core...');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginCaptchaCode, setLoginCaptchaCode] = useState(generateRandomCaptcha());
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');
  const [loginCaptchaError, setLoginCaptchaError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regCaptchaCode, setRegCaptchaCode] = useState(generateRandomCaptcha());
  const [regCaptchaInput, setRegCaptchaInput] = useState('');
  const [regCaptchaError, setRegCaptchaError] = useState('');

  // Common auth state
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // App phase state
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'search' | 'cart' | 'profile'>('home');
  const [mobileSearch, setMobileSearch] = useState('');
  const [sampleProducts, setSampleProducts] = useState<Product[]>([]);
  
  // Category navigation state inside Mobile App
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<ProductCategory | 'all'>('all');
  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState(false);
  const [isAppOtherDrawerOpen, setIsAppOtherDrawerOpen] = useState(false);
  const [appCategorySearch, setAppCategorySearch] = useState('');
  const [appOtherSearch, setAppOtherSearch] = useState('');

  const matchesCategory = (product: Product, targetCat: ProductCategory | 'all') => {
    if (targetCat === 'all') return true;
    if (product.category === targetCat) return true;
    if (targetCat === 'wallets' && (product.category === 'wallets' || product.name.toLowerCase().includes('wallet'))) return true;
    if (targetCat === 'watches' && (product.category === 'watches' || product.category === 'watches-jewelry' || product.category === 'smart-watches')) return true;
    if (targetCat === 'smart-watches' && (product.category === 'watches' || product.category === 'smart-watches' || product.name.toLowerCase().includes('smart watch') || product.name.toLowerCase().includes('smartwatch'))) return true;
    if (targetCat === 'glasses' && (product.category === 'glasses' || product.name.toLowerCase().includes('glasses') || product.name.toLowerCase().includes('sunglasses'))) return true;
    if (targetCat === 'bags' && (product.category === 'luggage-bags' || product.category === 'bags' || product.name.toLowerCase().includes('bag') || product.name.toLowerCase().includes('backpack'))) return true;
    if (targetCat === 'solar-lights' && (product.category === 'solar-torch' || product.category === 'solar-lights' || product.name.toLowerCase().includes('solar'))) return true;
    if (targetCat === 'fitness-gym' && (product.category === 'sports-outdoor' || product.category === 'fitness-gym' || product.category === 'body-massagers')) return true;
    if (targetCat === 'home-kitchen' && (product.category === 'home-kitchen' || product.category === 'kitchen-catering' || product.category === 'appliances' || product.category === 'home-living')) return true;
    if (targetCat === 'beauty-cosmetics' && (product.category === 'beauty-health' || product.category === 'beauty-cosmetics')) return true;
    if (targetCat === 'caps-collection' && (product.category === 'caps-collection' || product.category === 'fashion' || product.name.toLowerCase().includes('cap'))) return true;
    if (targetCat === 'toolkits' && (product.category === 'toolkits' || product.category === 'automotive')) return true;
    if (targetCat === 'body-massagers' && (product.category === 'body-massagers' || product.name.toLowerCase().includes('massager'))) return true;
    if (targetCat === 'kids-fashion' && (product.category === 'kids-fashion' || product.category === 'toys-games')) return true;
    if (targetCat === 'winter-sale' && Boolean(product.compareAtPrice && product.compareAtPrice > product.price)) return true;
    return false;
  };

  useEffect(() => {
    if (isOpen) {
      setPhase('splash');
      setSplashProgress(0);
      setSplashStatus('Connecting to Easy Store Cloud...');
      const products = db.getProducts();
      setSampleProducts(products);

      // Reset captchas
      setLoginCaptchaCode(generateRandomCaptcha());
      setLoginCaptchaInput('');
      setLoginCaptchaError('');
      setRegCaptchaCode(generateRandomCaptcha());
      setRegCaptchaInput('');
      setRegCaptchaError('');
      setAuthError('');

      const p1 = setTimeout(() => {
        setSplashProgress(35);
        setSplashStatus('Loading verified catalog products...');
      }, 700);
      const p2 = setTimeout(() => {
        setSplashProgress(75);
        setSplashStatus('Configuring nationwide Cash on Delivery & TCS courier...');
      }, 1500);
      const p3 = setTimeout(() => {
        setSplashProgress(100);
        setSplashStatus('Ready! Welcome to Easy Store Pakistan');
      }, 2200);
      const p4 = setTimeout(() => {
        setPhase('auth');
      }, 2800);

      return () => {
        clearTimeout(p1);
        clearTimeout(p2);
        clearTimeout(p3);
        clearTimeout(p4);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSkipSplash = () => {
    setPhase('auth');
  };

  // Mobile App Login (Strictly requires prior account registration)
  const handleMobileLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginBlocked) {
      setAuthError('Security policy: Maximum 5 failed attempts reached. Login is temporarily locked.');
      return;
    }

    if (!loginPhoneOrEmail.trim()) {
      setAuthError('Please enter your email or mobile phone number.');
      return;
    }

    if (!loginPassword.trim()) {
      setAuthError('Please enter your account password.');
      return;
    }

    // Verify Captcha Code
    if (loginCaptchaInput.trim().toUpperCase() !== loginCaptchaCode.toUpperCase()) {
      setLoginCaptchaError('Invalid Captcha code! Please enter the code shown in the image.');
      setLoginCaptchaCode(generateRandomCaptcha());
      setLoginCaptchaInput('');
      return;
    }

    setAuthError('');
    setLoginCaptchaError('');
    setIsAuthSubmitting(true);
    const res = await login(loginPhoneOrEmail.trim(), loginPassword.trim());
    setIsAuthSubmitting(false);

    if (res.success) {
      setPhase('app');
    } else {
      setAuthError(res.error || 'Login failed. Please verify your credentials or register first.');
      setLoginCaptchaCode(generateRandomCaptcha());
      setLoginCaptchaInput('');
    }
  };

  // Direct Social Login inside Mobile App (Google, Facebook, TikTok, Instagram)
  const handleMobileSocialLogin = async (provider: 'google' | 'facebook' | 'tiktok' | 'instagram') => {
    setIsAuthSubmitting(true);
    setAuthError('');
    const res = await loginWithSocial(provider);
    setIsAuthSubmitting(false);

    if (res.success) {
      setPhase('app');
    } else {
      setAuthError(res.error || 'Social sign-in failed. Please try again.');
    }
  };

  // Mobile App Registration (with 5-Attempt Limit, Password Matching, and Captcha)
  const handleMobileRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check 5 Attempts limit
    if (isRegBlocked || regAttemptsRemaining <= 0) {
      setAuthError('Security policy: Maximum 5 registration attempts exceeded. Please try again later.');
      return;
    }

    // 2. Validate fields
    if (!regName.trim()) {
      recordFailedRegAttempt();
      setAuthError('Full name is required.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      recordFailedRegAttempt();
      setAuthError('A valid email address is required.');
      return;
    }

    if (!regPhone.trim() || regPhone.trim().length < 8) {
      recordFailedRegAttempt();
      setAuthError('A valid mobile phone number is required.');
      return;
    }

    // 3. Password length
    if (!regPassword || regPassword.length < 6) {
      recordFailedRegAttempt();
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    // 4. Strict Password Matching Check
    if (regPassword !== regConfirmPassword) {
      recordFailedRegAttempt();
      setAuthError('Passwords do not match! Both password and confirm password fields must be identical.');
      return;
    }

    // 5. Captcha Code Verification
    if (regCaptchaInput.trim().toUpperCase() !== regCaptchaCode.toUpperCase()) {
      recordFailedRegAttempt();
      setRegCaptchaError('Invalid Captcha code! Please look at the image and enter the code again.');
      setRegCaptchaCode(generateRandomCaptcha());
      setRegCaptchaInput('');
      return;
    }

    setAuthError('');
    setRegCaptchaError('');
    setIsAuthSubmitting(true);
    const res = await register(regName, regEmail, regPhone, regPassword);
    setIsAuthSubmitting(false);

    if (res.success) {
      setPhase('app');
    } else {
      setAuthError(res.error || 'Registration failed. Please try again.');
      setRegCaptchaCode(generateRandomCaptcha());
      setRegCaptchaInput('');
    }
  };

  const handleContinueAsGuest = () => {
    setPhase('app');
  };

  const handleRestartDemo = () => {
    setPhase('splash');
    setSplashProgress(0);
    setSplashStatus('Connecting to Easy Store Cloud...');
    setTimeout(() => {
      setSplashProgress(45);
      setSplashStatus('Loading verified catalog products...');
    }, 700);
    setTimeout(() => {
      setSplashProgress(100);
      setSplashStatus('Ready! Welcome to Easy Store Pakistan');
    }, 1800);
    setTimeout(() => {
      setPhase('auth');
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative max-w-sm w-full mx-auto flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-2 px-1 text-white text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-tight">Easy Store Mobile App v5.2</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartDemo}
              title="Restart Splash Video Animation"
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              aria-label="Close Mobile View"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full h-[680px] bg-slate-900 rounded-[48px] p-3 shadow-2xl ring-1 ring-white/20 border-4 border-slate-700 relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-40 flex items-center justify-center gap-2 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            <div className="w-8 h-1 bg-slate-800 rounded-full" />
          </div>

          <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col relative text-slate-800 select-none">
            <div className="h-9 bg-slate-950 text-white text-[11px] font-semibold px-6 flex items-center justify-between pt-1 shrink-0 z-30">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span> </span>
                <span>100%</span>
              </div>
            </div>

            {/* PHASE 1: SPLASH SCREEN */}
            {phase === 'splash' && (
              <div className="flex-1 bg-gradient-to-b from-[#07162c] via-[#0b284e] to-[#040e1d] text-white flex flex-col items-center justify-between p-6 py-12 relative overflow-hidden animate-in fade-in duration-300">
                <div className="absolute top-1/4 -left-12 w-48 h-48 bg-[#0284c7]/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-12 w-48 h-48 bg-[#f85606]/20 rounded-full blur-3xl animate-pulse" />
                
                <div className="z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-sky-200">
                  <Sparkles className="w-3 h-3 text-[#f85606]" />
                  <span>Official Mobile App</span>
                </div>

                <div className="z-10 flex flex-col items-center text-center space-y-4 my-auto">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#0284c7] to-[#f85606] rounded-3xl opacity-75 blur-xl animate-pulse" />
                    
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0f3460] p-1 shadow-2xl flex items-center justify-center border-2 border-white/40 transform hover:scale-105 transition-transform duration-500 animate-bounce">
                      <div className="w-full h-full rounded-[22px] bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <ShoppingBag className="w-10 h-10 text-orange-400 drop-shadow-md animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-200 mt-1">EASY</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md flex items-center justify-center gap-1">
                      <span>EASY</span>
                      <span className="text-[#f85606]">STORE</span>
                    </h1>
                    <p className="text-[11px] font-semibold text-sky-100 tracking-wide">
                      Pakistan&apos;s #1 Trusted Shopping App
                    </p>
                    <p className="text-[10px] text-slate-300">
                      Har Cheez Asaan, Har Ghar Tak
                    </p>
                  </div>
                </div>

                <div className="z-10 w-full space-y-3">
                  <div className="space-y-1.5 text-center">
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0284c7] via-amber-400 to-[#f85606] rounded-full transition-all duration-300"
                        style={{ width: `${splashProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium truncate">
                      {splashStatus}
                    </p>
                  </div>

                  <button
                    onClick={handleSkipSplash}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Skip to Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* PHASE 2: MOBILE AUTH SCREEN */}
            {phase === 'auth' && (
              <div className="flex-1 bg-slate-50 flex flex-col justify-between p-4 overflow-y-auto animate-in slide-in-from-bottom duration-300">
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-center">
                    <BrandLogo size="sm" />
                  </div>

                  <div className="text-center space-y-0.5">
                    <h2 className="text-base font-black text-slate-900">
                      {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Sign in for nationwide Cash on Delivery &amp; order tracking
                    </p>
                  </div>

                  <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        authMode === 'login' ? 'bg-white text-[#0284c7] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError(''); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer relative ${
                        authMode === 'register' ? 'bg-white text-[#0284c7] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <span>Register</span>
                      {regAttemptsRemaining < 5 && (
                        <span className="ml-1 text-[9px] text-amber-600 font-bold">
                          ({regAttemptsRemaining}/5)
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Auth Error Banner */}
                  {authError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-start gap-1.5 animate-in fade-in">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{authError}</span>
                    </div>
                  )}

                  {/* 5-Attempt Warning Banner on Register */}
                  {authMode === 'register' && (
                    <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-center justify-between text-[10px]">
                      <span className="font-semibold">Security Rule: Max 5 registration attempts</span>
                      <span className={`font-black px-1.5 py-0.5 rounded text-[9px] ${
                        regAttemptsRemaining <= 2 ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-white text-[#0284c7] border border-sky-200'
                      }`}>
                        Left: {regAttemptsRemaining}/5
                      </span>
                    </div>
                  )}

                  {/* LOGIN FORM */}
                  {authMode === 'login' && (
                    <div className="space-y-3 pt-0.5">
                      {/* Direct 1-Click Social Sign In */}
                      <SocialAuthButtons 
                        onSocialLogin={handleMobileSocialLogin}
                        isLoading={isAuthSubmitting}
                        isCompact={true}
                      />

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 my-0.5">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span>Or enter registered account</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      <form onSubmit={handleMobileLoginSubmit} className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Email or Mobile Phone Number *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={loginPhoneOrEmail}
                              onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                              placeholder="e.g. 0300-1234567 or user@gmail.com"
                              className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] shadow-2xs"
                            />
                            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-8 pr-8 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] shadow-2xs"
                            />
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                            >
                              {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Captcha Code Component */}
                        <CaptchaComponent
                          captchaCode={loginCaptchaCode}
                          userInput={loginCaptchaInput}
                          onUserInputChange={setLoginCaptchaInput}
                          onRefreshCaptcha={() => setLoginCaptchaCode(generateRandomCaptcha())}
                          error={loginCaptchaError}
                          isCompact={true}
                        />

                        <button
                          type="submit"
                          disabled={isAuthSubmitting || isLoginBlocked}
                          className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20 mt-1 disabled:opacity-50"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign In to Mobile App</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* REGISTER FORM */}
                  {authMode === 'register' && (
                    <form onSubmit={handleMobileRegisterSubmit} className="space-y-2 pt-0.5">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Muhammad Ali"
                            className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-7 pr-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] shadow-2xs"
                          />
                          <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Email Address *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="user@gmail.com"
                            className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-7 pr-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] shadow-2xs"
                          />
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Mobile Phone Number *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-7 pr-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] shadow-2xs"
                          />
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-7 pr-7 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] shadow-2xs"
                          />
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                          >
                            {showRegPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] font-bold text-slate-700">
                            Confirm Password *
                          </label>
                          {regConfirmPassword && (
                            <span className={`text-[9px] font-bold ${regPassword === regConfirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {regPassword === regConfirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className={`w-full bg-white border rounded-xl py-1.5 pl-7 pr-7 text-xs text-slate-800 focus:outline-none shadow-2xs ${
                              regConfirmPassword && regPassword !== regConfirmPassword
                                ? 'border-rose-400 ring-1 ring-rose-200'
                                : regConfirmPassword && regPassword === regConfirmPassword
                                ? 'border-emerald-400 ring-1 ring-emerald-200'
                                : 'border-slate-200 focus:border-[#0284c7]'
                            }`}
                          />
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Captcha Code Component */}
                      <CaptchaComponent
                        captchaCode={regCaptchaCode}
                        userInput={regCaptchaInput}
                        onUserInputChange={setRegCaptchaInput}
                        onRefreshCaptcha={() => setRegCaptchaCode(generateRandomCaptcha())}
                        error={regCaptchaError}
                        isCompact={true}
                      />

                      <button
                        type="submit"
                        disabled={isAuthSubmitting || isRegBlocked}
                        className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20 mt-1 disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Free Account</span>
                      </button>
                    </form>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200 mt-2 text-center shrink-0">
                  <button
                    onClick={handleContinueAsGuest}
                    className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>Continue as Guest Shopper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-700 font-semibold bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Cash on Delivery active nationwide</span>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 3: MAIN APP INTERFACE */}
            {phase === 'app' && (
              <div className="flex-1 bg-slate-50 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 relative">
                {/* Mobile App Top Header with Official Store Brand Logo */}
                <div className="bg-white px-3 sm:px-4 py-2 border-b border-slate-200 shadow-2xs shrink-0 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Official Brand Logo Icon */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#f85606] via-[#ff681a] to-[#d9480f] flex items-center justify-center text-white shadow-sm shadow-orange-500/25 relative overflow-hidden shrink-0 border border-white/20">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none opacity-80" />
                      <svg
                        viewBox="0 0 40 40"
                        className="w-4 h-4 drop-shadow-sm fill-none stroke-current"
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
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        Easy <span className="text-[#f85606]">Store</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Deliver to Pakistan 🇵🇰</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveBottomTab('cart')}
                      className="relative p-1.5 text-slate-700 hover:text-[#0284c7] cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {itemCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#f85606] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white border-b border-slate-100 shrink-0">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                    <input
                      type="text"
                      value={mobileSearch}
                      onChange={(e) => setMobileSearch(e.target.value)}
                      placeholder="Search mobiles, laptops, kitchen..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                </div>

                {/* Header Navigation under Search Bar: Blue hamburger icon, Home, Exactly 2 categories, Spacious Other */}
                <div className="bg-white border-b border-slate-200 px-2 py-1.5 shrink-0 relative z-20">
                  <div className="flex items-center gap-1.5 overflow-x-hidden">
                    {/* Blue square hamburger menu button showing ONLY three horizontal lines */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAppSidebarOpen(true);
                        setIsAppOtherDrawerOpen(false);
                        setAppCategorySearch('');
                      }}
                      className="w-7 h-7 rounded-md bg-[#1769ff] hover:bg-[#0d4fca] text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-xs"
                      title="All Categories"
                      aria-label="Open categories menu"
                    >
                      <span className="w-3.5 flex flex-col gap-[3px]">
                        <span className="block h-[2px] w-full bg-white rounded-full"></span>
                        <span className="block h-[2px] w-full bg-white rounded-full"></span>
                        <span className="block h-[2px] w-full bg-white rounded-full"></span>
                      </span>
                    </button>

                    {/* Quick links: Home + Exactly TWO categories ("Gents Wallets", "Watches") */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMobileCategory('all');
                          setMobileSearch('');
                          setIsAppOtherDrawerOpen(false);
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded transition-colors whitespace-nowrap cursor-pointer ${
                          selectedMobileCategory === 'all' && !mobileSearch
                            ? 'text-[#1769ff] bg-[#f1f6ff]'
                            : 'text-[#202b3c] hover:text-[#0d4fca] hover:bg-[#f1f6ff]'
                        }`}
                      >
                        HOME
                      </button>
                      {STORE_HEADER_QUICK_CATEGORIES.map((name) => {
                        const catId = CATEGORY_NAME_TO_ID[name];
                        const isActive = selectedMobileCategory === catId;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setSelectedMobileCategory(catId);
                              setIsAppOtherDrawerOpen(false);
                            }}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors whitespace-nowrap cursor-pointer ${
                              isActive
                                ? 'text-[#1769ff] bg-[#f1f6ff]'
                                : 'text-[#202b3c] hover:text-[#0d4fca] hover:bg-[#f1f6ff]'
                            }`}
                          >
                            {name.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Other button with generous spacing, opening right-side category drawer on white background */}
                    <div className="ml-auto pl-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAppOtherDrawerOpen(true);
                          setIsAppSidebarOpen(false);
                          setAppOtherSearch('');
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                          isAppOtherDrawerOpen
                            ? 'text-[#1769ff] bg-[#f1f6ff]'
                            : 'text-[#202b3c] hover:text-[#0d4fca] hover:bg-[#f1f6ff]'
                        }`}
                      >
                        OTHER <span className="text-[8px]">▼</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Left Sidebar Drawer inside Mobile App (Triggered by blue hamburger button) */}
                {isAppSidebarOpen && (
                  <div className="absolute inset-0 z-40 flex">
                    <div 
                      className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
                      onClick={() => setIsAppSidebarOpen(false)}
                    />
                    <div className="relative w-64 max-w-[85%] bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
                      <div className="p-3 bg-[#1769ff] text-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4" />
                          <span className="font-bold text-xs uppercase tracking-wider">All 21 Categories</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAppSidebarOpen(false)}
                          className="p-1 rounded-md hover:bg-white/20 text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                          <input
                            type="text"
                            value={appCategorySearch}
                            onChange={(e) => setAppCategorySearch(e.target.value)}
                            placeholder="Filter categories..."
                            className="w-full pl-8 pr-2 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1769ff]"
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                        {STORE_HEADER_CATEGORIES.filter((cat) =>
                          cat.toLowerCase().includes(appCategorySearch.toLowerCase())
                        ).map((catName) => {
                          const catId = CATEGORY_NAME_TO_ID[catName];
                          const isCurrent = selectedMobileCategory === catId;
                          return (
                            <button
                              key={catName}
                              type="button"
                              onClick={() => {
                                setSelectedMobileCategory(catId);
                                setIsAppSidebarOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                isCurrent
                                  ? 'bg-[#1769ff] text-white'
                                  : 'text-slate-700 hover:bg-[#f1f6ff] hover:text-[#1769ff]'
                              }`}
                            >
                              <span>{catName}</span>
                              <span className="text-[10px] opacity-70">›</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right-Side Page/Drawer inside Mobile App (Triggered by OTHER button on pure white background) */}
                {isAppOtherDrawerOpen && (
                  <div className="absolute inset-0 z-40 flex justify-end">
                    <div 
                      className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
                      onClick={() => setIsAppOtherDrawerOpen(false)}
                    />
                    <div className="relative w-64 max-w-[85%] bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200 border-l border-slate-200">
                      {/* Drawer Header on White Background */}
                      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                              All Categories
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1769ff]">
                              21
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Easy Store Pakistan</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAppOtherDrawerOpen(false)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                          aria-label="Close categories"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Search Bar in Right Drawer */}
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                          <input
                            type="text"
                            value={appOtherSearch}
                            onChange={(e) => setAppOtherSearch(e.target.value)}
                            placeholder="Search all categories..."
                            className="w-full pl-8 pr-2 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1769ff]"
                          />
                        </div>
                      </div>

                      {/* Categories List in Right Drawer */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
                        {STORE_HEADER_CATEGORIES.filter((cat) =>
                          cat.toLowerCase().includes(appOtherSearch.toLowerCase())
                        ).map((catName) => {
                          const catId = CATEGORY_NAME_TO_ID[catName];
                          const isCurrent = selectedMobileCategory === catId;
                          const isQuick = STORE_HEADER_QUICK_CATEGORIES.includes(catName as any);
                          return (
                            <button
                              key={catName}
                              type="button"
                              onClick={() => {
                                setSelectedMobileCategory(catId);
                                setIsAppOtherDrawerOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                                isCurrent
                                  ? 'bg-[#1769ff] text-white shadow-xs'
                                  : 'text-slate-700 hover:bg-[#f1f6ff] hover:text-[#1769ff]'
                              }`}
                            >
                              <span>{catName}</span>
                              {isQuick ? (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  isCurrent ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#1769ff]'
                                }`}>
                                  Quick
                                </span>
                              ) : (
                                <span className={`text-[10px] ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>›</span>
                              )}
                            </button>
                          );
                        })}
                        {STORE_HEADER_CATEGORIES.filter((cat) =>
                          cat.toLowerCase().includes(appOtherSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No categories found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile App Products Catalog Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {selectedMobileCategory !== 'all' && (
                    <div className="flex items-center justify-between bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100">
                      <span className="text-[10px] font-bold text-[#1769ff] uppercase">
                        Filtered: {STORE_HEADER_CATEGORIES.find(c => CATEGORY_NAME_TO_ID[c] === selectedMobileCategory) || selectedMobileCategory}
                      </span>
                      <button
                        onClick={() => setSelectedMobileCategory('all')}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                      >
                        Reset Filter ✕
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {sampleProducts
                      .filter((p) => {
                        const matchesText = mobileSearch
                          ? p.name.toLowerCase().includes(mobileSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(mobileSearch.toLowerCase())
                          : true;
                        const matchesCat = matchesCategory(p, selectedMobileCategory);
                        return matchesText && matchesCat;
                      })
                      .slice(0, 10)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs flex flex-col justify-between"
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => onSelectProduct && onSelectProduct(product)}
                          >
                            <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-1.5 relative">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                              {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <span className="absolute top-1 left-1 bg-[#f85606] text-white text-[8px] font-bold px-1 rounded">
                                  SALE
                                </span>
                              )}
                            </div>
                            <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                              {product.name}
                            </h4>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-black text-[#0284c7]">
                              Rs. {product.price.toLocaleString()}
                            </span>
                            <button
                              onClick={() => addToCart(product, 1)}
                              className="w-6 h-6 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                              title="Add to cart"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="bg-white border-t border-slate-200 px-4 py-2 shrink-0 flex items-center justify-around text-slate-400 text-[10px] font-bold">
                  <button
                    onClick={() => { setActiveBottomTab('home'); setSelectedMobileCategory('all'); }}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                      activeBottomTab === 'home' ? 'text-[#0284c7]' : 'hover:text-slate-600'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Store</span>
                  </button>
                  <button
                    onClick={() => setActiveBottomTab('search')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                      activeBottomTab === 'search' ? 'text-[#0284c7]' : 'hover:text-slate-600'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => setActiveBottomTab('cart')}
                    className={`flex flex-col items-center gap-0.5 relative cursor-pointer ${
                      activeBottomTab === 'cart' ? 'text-[#0284c7]' : 'hover:text-slate-600'
                    }`}
                  >
                    <div className="relative">
                      <ShoppingBag className="w-4 h-4" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#f85606] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </div>
                    <span>Cart</span>
                  </button>
                  <button
                    onClick={() => setPhase('auth')}
                    className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-slate-600"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
