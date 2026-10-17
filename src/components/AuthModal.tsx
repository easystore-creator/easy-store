import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  LogOut, 
  ShieldCheck,
  Lock,
  Phone,
  User as UserIcon,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_ADMIN_KEY_HINT } from '../services/db';
import { CaptchaComponent, generateRandomCaptcha } from './CaptchaComponent';
import { SocialAuthButtons } from './SocialAuthButtons';

interface AuthModalProps {
  onNavigateAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onNavigateAdmin }) => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    user, 
    isAuthenticated, 
    login, 
    loginWithSocial,
    register, 
    logout, 
    updateProfile,
    unlockAdminGate,
    authModalTab,
    regAttemptsRemaining,
    isRegBlocked,
    recordFailedRegAttempt,
    isLoginBlocked,
  } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'customer_login' | 'customer_register' | 'owner_login'>(authModalTab || 'customer_login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginCaptchaCode, setLoginCaptchaCode] = useState(generateRandomCaptcha());
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');
  const [loginCaptchaError, setLoginCaptchaError] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regCaptchaCode, setRegCaptchaCode] = useState(generateRandomCaptcha());
  const [regCaptchaInput, setRegCaptchaInput] = useState('');
  const [regCaptchaError, setRegCaptchaError] = useState('');

  // Store Owner Login
  const [ownerPassword, setOwnerPassword] = useState('');

  // Global error & submission
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address editing for profile
  const [addressLine1, setAddressLine1] = useState(user?.address?.addressLine1 || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [province, setProvince] = useState(user?.address?.province || 'Sindh');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');

  useEffect(() => {
    if (authModalTab) {
      setMode(authModalTab);
      setError('');
    }
  }, [authModalTab]);

  useEffect(() => {
    if (showAuthModal) {
      setRegCaptchaCode(generateRandomCaptcha());
      setRegCaptchaInput('');
      setRegCaptchaError('');
      setLoginCaptchaCode(generateRandomCaptcha());
      setLoginCaptchaInput('');
      setLoginCaptchaError('');
      setError('');
    }
  }, [showAuthModal, mode]);

  if (!showAuthModal) return null;

  // Customer Login with Password & Captcha (Requires Prior Registration)
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginBlocked) {
      setError('Security policy: Maximum 5 failed login attempts reached. Login is temporarily locked for your safety.');
      return;
    }

    if (!loginIdentifier.trim()) {
      setError('Please enter your email or mobile phone number.');
      return;
    }

    if (!loginPassword.trim()) {
      setError('Please enter your account password.');
      return;
    }

    // Verify Captcha Code
    if (loginCaptchaInput.trim().toUpperCase() !== loginCaptchaCode.toUpperCase()) {
      setLoginCaptchaError('Invalid Captcha code! Please enter the code shown in the image.');
      setLoginCaptchaCode(generateRandomCaptcha());
      setLoginCaptchaInput('');
      return;
    }

    setError('');
    setLoginCaptchaError('');
    setIsSubmitting(true);
    const res = await login(loginIdentifier.trim(), loginPassword.trim());
    setIsSubmitting(false);

    if (res.success) {
      showToast('Welcome Back!', 'Signed in successfully to Easy Store', 'success');
      setShowAuthModal(false);
      setLoginIdentifier('');
      setLoginPassword('');
    } else {
      setError(res.error || 'Login failed. Please verify your credentials.');
      setLoginCaptchaCode(generateRandomCaptcha());
      setLoginCaptchaInput('');
    }
  };

  // Direct Social Login: Google, Facebook, TikTok, Instagram
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'tiktok' | 'instagram') => {
    setIsSubmitting(true);
    setError('');
    const res = await loginWithSocial(provider);
    setIsSubmitting(false);

    if (res.success) {
      const titles: Record<string, string> = {
        google: 'Google',
        facebook: 'Facebook',
        tiktok: 'TikTok',
        instagram: 'Instagram',
      };
      showToast(`${titles[provider]} Sign In`, `Successfully signed in with ${titles[provider]}!`, 'success');
      setShowAuthModal(false);
    } else {
      setError(res.error || 'Direct social login failed. Please try again.');
    }
  };

  // Customer Registration (Sign Up) with 5-Attempt Limit, Password Matching, and Captcha
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check if user already exhausted 5 attempts
    if (isRegBlocked || regAttemptsRemaining <= 0) {
      setError('Security policy: Maximum 5 registration attempts exceeded. Please try again later.');
      return;
    }

    // 2. Validate required fields
    if (!name.trim()) {
      recordFailedRegAttempt();
      setError('Full name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      recordFailedRegAttempt();
      setError('A valid email address is required.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      recordFailedRegAttempt();
      setError('A valid mobile phone number is required.');
      return;
    }

    // 3. Validate password length
    if (!password || password.length < 6) {
      recordFailedRegAttempt();
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 4. Strict Password Matching Check
    if (password !== confirmPassword) {
      recordFailedRegAttempt();
      setError('Passwords do not match! Both password and confirm password fields must be identical.');
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

    setError('');
    setRegCaptchaError('');
    setIsSubmitting(true);
    const res = await register(name, email, phone, password);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Account Created!', `Welcome to Easy Store, ${name}!`, 'success');
      setShowAuthModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setRegCaptchaInput('');
    } else {
      setError(res.error || 'Account creation failed. Please try again.');
      setRegCaptchaCode(generateRandomCaptcha());
      setRegCaptchaInput('');
    }
  };

  // Store Owner Login
  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPassword.trim()) {
      setError('Please enter the owner passkey.');
      return;
    }

    const res = unlockAdminGate(ownerPassword.trim());
    if (res.success) {
      showToast('Owner Portal Unlocked', 'Welcome Founder Abdullah! Full access granted.', 'success');
      setShowAuthModal(false);
      if (onNavigateAdmin) onNavigateAdmin();
    } else {
      setError(res.error || 'Invalid owner credentials.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      address: {
        addressLine1,
        city,
        province,
        postalCode,
      },
    });
    showToast('Profile Updated', 'Default shipping details saved successfully.', 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={() => setShowAuthModal(false)}
    >
      <div 
        className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated && user ? (
          /* Logged In View */
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0284c7] to-sky-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{user.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {user.role === 'admin' ? 'Store Manager' : 'Verified Customer'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                {user.phone && <p className="text-[11px] text-slate-400">{user.phone}</p>}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <h4 className="font-bold text-xs text-slate-700">Default Shipping Address</h4>
              <input
                type="text"
                placeholder="Street Address, House #"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
                <input
                  type="text"
                  placeholder="Province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Save Shipping Defaults
              </button>
            </form>

            <button
              onClick={() => {
                logout();
                setShowAuthModal(false);
              }}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 mb-4 text-xs font-bold">
              <button
                onClick={() => { setMode('customer_login'); setError(''); }}
                className={`flex-1 py-2.5 border-b-2 text-center transition-colors cursor-pointer ${
                  mode === 'customer_login'
                    ? 'border-[#0284c7] text-[#0284c7] bg-sky-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Customer Login
              </button>
              <button
                onClick={() => { setMode('customer_register'); setError(''); }}
                className={`flex-1 py-2.5 border-b-2 text-center transition-colors cursor-pointer relative ${
                  mode === 'customer_register'
                    ? 'border-[#0284c7] text-[#0284c7] bg-sky-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Create Account</span>
                {regAttemptsRemaining < 5 && (
                  <span className="ml-1 text-[10px] text-amber-600 font-normal">
                    ({regAttemptsRemaining}/5)
                  </span>
                )}
              </button>
              <button
                onClick={() => { setMode('owner_login'); setError(''); }}
                className={`flex-1 py-2.5 border-b-2 text-center transition-colors cursor-pointer ${
                  mode === 'owner_login'
                    ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Store Owner
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-3 font-medium flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* TAB 1: CUSTOMER LOGIN */}
            {mode === 'customer_login' && (
              <div className="space-y-3.5">
                {isLoginBlocked ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-2 text-center">
                    <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
                    <p className="font-bold text-sm">Login Temporarily Locked</p>
                    <p className="text-[11px]">
                      Due to 5 consecutive failed login attempts, access is locked for security. Please try again later.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Direct 1-Click Social Sign In (Google, Facebook, TikTok, Instagram) */}
                    <SocialAuthButtons 
                      onSocialLogin={handleSocialLogin} 
                      isLoading={isSubmitting} 
                    />

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 my-1">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span>Or sign in with registered account</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <form onSubmit={handleCustomerLogin} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email or Mobile Phone Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="e.g. user@gmail.com or 03001234567"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Captcha Verification */}
                      <CaptchaComponent
                        captchaCode={loginCaptchaCode}
                        userInput={loginCaptchaInput}
                        onUserInputChange={setLoginCaptchaInput}
                        onRefreshCaptcha={() => setLoginCaptchaCode(generateRandomCaptcha())}
                        error={loginCaptchaError}
                      />

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                    </form>

                    <p className="text-[11px] text-center text-slate-500 mt-2">
                      Don&apos;t have an account yet?{' '}
                      <button onClick={() => setMode('customer_register')} className="text-[#0284c7] font-bold hover:underline cursor-pointer">
                        Register here first
                      </button>
                    </p>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: CUSTOMER SIGN UP */}
            {mode === 'customer_register' && (
              <div className="space-y-3">
                {/* 5 Attempt Alert Banner */}
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                    <span className="font-semibold">Security Rule: Max 5 registration attempts allowed</span>
                  </div>
                  <span className={`font-black px-2 py-0.5 rounded-md text-[10px] ${
                    regAttemptsRemaining <= 2 
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' 
                      : 'bg-white text-[#0284c7] border border-sky-300'
                  }`}>
                    Attempts left: {regAttemptsRemaining}/5
                  </span>
                </div>

                {isRegBlocked ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-2 text-center">
                    <AlertTriangle className="w-7 h-7 text-rose-600 mx-auto" />
                    <p className="font-bold text-sm">Registration Attempts Limit Exceeded</p>
                    <p className="text-[11px]">
                      You have attempted registration 5 times. Further account creation is temporarily disabled for security.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Muhammad Ali"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                        />
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0300-1234567"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Confirm Password *
                        </label>
                        {confirmPassword && (
                          <span className={`text-[10px] font-bold ${password === confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className={`w-full bg-slate-50 border rounded-xl py-2 pl-9 pr-9 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                            confirmPassword && password !== confirmPassword 
                              ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-100' 
                              : confirmPassword && password === confirmPassword
                              ? 'border-emerald-400 focus:border-emerald-500 ring-1 ring-emerald-100'
                              : 'border-slate-200 focus:border-[#0284c7]'
                          }`}
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Captcha Verification */}
                    <CaptchaComponent
                      captchaCode={regCaptchaCode}
                      userInput={regCaptchaInput}
                      onUserInputChange={setRegCaptchaInput}
                      onRefreshCaptcha={() => setRegCaptchaCode(generateRandomCaptcha())}
                      error={regCaptchaError}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || isRegBlocked}
                      className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </button>
                  </form>
                )}

                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Already have an account?{' '}
                  <button onClick={() => setMode('customer_login')} className="text-[#0284c7] font-bold hover:underline cursor-pointer">
                    Sign in here
                  </button>
                </p>
              </div>
            )}

            {/* TAB 3: OWNER LOGIN */}
            {mode === 'owner_login' && (
              <form onSubmit={handleOwnerLogin} className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Founder &amp; Owner Admin Security Access Portal</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Passkey (Abdullah) *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Enter owner passkey"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Hint: {DEFAULT_ADMIN_KEY_HINT}</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin Panel</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
