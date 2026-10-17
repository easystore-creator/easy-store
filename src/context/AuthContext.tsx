import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminUnlocked: boolean;
  adminLockRemainingSeconds: number;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: 'google' | 'facebook' | 'tiktok' | 'instagram') => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, phone?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  unlockAdminGate: (passphrase: string) => { success: boolean; error?: string };
  lockAdminGate: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  authModalTab: 'customer_login' | 'customer_register' | 'owner_login';
  openAuthModal: (tab?: 'customer_login' | 'customer_register' | 'owner_login') => void;
  showAdminGateModal: boolean;
  setShowAdminGateModal: (open: boolean) => void;
  // Registration and Login 5-Attempt Limit controls
  regAttemptsRemaining: number;
  isRegBlocked: boolean;
  recordFailedRegAttempt: () => number;
  resetRegAttempts: () => void;
  loginAttemptsRemaining: number;
  isLoginBlocked: boolean;
  recordFailedLoginAttempt: () => number;
}

const SESSION_KEYS = {
  CURRENT_USER_EMAIL: 'easystore_session_user_email_v5',
  ADMIN_SESSION_TOKEN: 'easystore_session_admin_auth_v5',
  FAILED_ADMIN_ATTEMPTS: 'easystore_admin_failed_attempts_v5',
  LOCKOUT_UNTIL: 'easystore_admin_lockout_until_v5',
  FAILED_REG_ATTEMPTS: 'easystore_failed_reg_attempts_v5',
  FAILED_LOGIN_ATTEMPTS: 'easystore_failed_login_attempts_v5',
};

const MAX_ATTEMPTS = 5;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminLockRemainingSeconds, setAdminLockRemainingSeconds] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'customer_login' | 'customer_register' | 'owner_login'>('customer_login');
  const [showAdminGateModal, setShowAdminGateModal] = useState<boolean>(false);

  // 5-Attempt limits state
  const [regFailedCount, setRegFailedCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(SESSION_KEYS.FAILED_REG_ATTEMPTS) || '0');
    } catch {
      return 0;
    }
  });

  const [loginFailedCount, setLoginFailedCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(SESSION_KEYS.FAILED_LOGIN_ATTEMPTS) || '0');
    } catch {
      return 0;
    }
  });

  const regAttemptsRemaining = Math.max(0, MAX_ATTEMPTS - regFailedCount);
  const isRegBlocked = regFailedCount >= MAX_ATTEMPTS;

  const loginAttemptsRemaining = Math.max(0, MAX_ATTEMPTS - loginFailedCount);
  const isLoginBlocked = loginFailedCount >= MAX_ATTEMPTS;

  const recordFailedRegAttempt = (): number => {
    const next = regFailedCount + 1;
    setRegFailedCount(next);
    try {
      localStorage.setItem(SESSION_KEYS.FAILED_REG_ATTEMPTS, next.toString());
    } catch {}
    return Math.max(0, MAX_ATTEMPTS - next);
  };

  const resetRegAttempts = () => {
    setRegFailedCount(0);
    try {
      localStorage.removeItem(SESSION_KEYS.FAILED_REG_ATTEMPTS);
    } catch {}
  };

  const recordFailedLoginAttempt = (): number => {
    const next = loginFailedCount + 1;
    setLoginFailedCount(next);
    try {
      localStorage.setItem(SESSION_KEYS.FAILED_LOGIN_ATTEMPTS, next.toString());
    } catch {}
    return Math.max(0, MAX_ATTEMPTS - next);
  };

  const openAuthModal = (tab: 'customer_login' | 'customer_register' | 'owner_login' = 'customer_login') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  // Restore session
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(SESSION_KEYS.CURRENT_USER_EMAIL);
      if (savedEmail) {
        const found = db.getUserByEmail(savedEmail);
        if (found) {
          setUser(found);
          if (found.role === 'admin') {
            setIsAdminUnlocked(true);
          }
        }
      }

      // Check admin session token
      const adminToken = sessionStorage.getItem(SESSION_KEYS.ADMIN_SESSION_TOKEN);
      if (adminToken === 'valid_admin_session') {
        setIsAdminUnlocked(true);
      }
    } catch (e) {
      console.error('Error restoring auth state', e);
    }
  }, []);

  // Lockout timer ticker
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = Number(localStorage.getItem(SESSION_KEYS.LOCKOUT_UNTIL) || '0');
      const now = Date.now();
      if (lockoutUntil > now) {
        setAdminLockRemainingSeconds(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setAdminLockRemainingSeconds(0);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Standard Login (Mandatory Registration required before login)
  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isLoginBlocked) {
      return {
        success: false,
        error: 'Security policy: Maximum 5 failed login attempts reached. Login is temporarily locked for your safety.'
      };
    }

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      return { success: false, error: 'Please enter your email or mobile phone number.' };
    }

    if (!password || !password.trim()) {
      return { success: false, error: 'Password is required. Please enter your account password.' };
    }

    // Step 1: Verify the account exists. If not registered, reject login!
    const existingUser = db.getUserByEmailOrPhone(cleanInput);
    if (!existingUser) {
      recordFailedLoginAttempt();
      const rem = Math.max(0, MAX_ATTEMPTS - (loginFailedCount + 1));
      return {
        success: false,
        error: `Account not found! You must register an account first before you can log in. (${rem} login attempt${rem === 1 ? '' : 's'} remaining)`
      };
    }

    // Step 2: Verify password
    const verifyRes = db.verifyUserPassword(cleanInput, password);
    if (!verifyRes.success) {
      recordFailedLoginAttempt();
      const rem = Math.max(0, MAX_ATTEMPTS - (loginFailedCount + 1));
      return { 
        success: false, 
        error: `${verifyRes.error} (${rem} login attempt${rem === 1 ? '' : 's'} remaining)` 
      };
    }
    
    const loggedUser = verifyRes.user!;
    setUser(loggedUser);
    localStorage.setItem(SESSION_KEYS.CURRENT_USER_EMAIL, loggedUser.email);
    setLoginFailedCount(0);
    try { localStorage.removeItem(SESSION_KEYS.FAILED_LOGIN_ATTEMPTS); } catch {}

    if (loggedUser.role === 'admin') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem(SESSION_KEYS.ADMIN_SESSION_TOKEN, 'valid_admin_session');
    }
    return { success: true };
  };

  // Direct Social Logins: Google, Facebook, TikTok, Instagram
  const loginWithSocial = async (provider: 'google' | 'facebook' | 'tiktok' | 'instagram'): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const providerNames: Record<string, string> = {
        google: 'Google User',
        facebook: 'Facebook User',
        tiktok: 'TikTok User',
        instagram: 'Instagram User',
      };
      const providerDomains: Record<string, string> = {
        google: 'gmail.com',
        facebook: 'fb.com',
        tiktok: 'tiktok.com',
        instagram: 'instagram.com',
      };

      const baseName = providerNames[provider] || 'Social User';
      const domain = providerDomains[provider] || 'social.com';
      const socialEmail = `${provider}.shopper@${domain}`;

      let socialUser = db.getUserByEmail(socialEmail);
      if (!socialUser) {
        socialUser = db.saveUser({
          name: baseName,
          email: socialEmail,
          phone: '+92 300 1234567',
          role: 'customer',
          provider,
        });
      }

      setUser(socialUser);
      localStorage.setItem(SESSION_KEYS.CURRENT_USER_EMAIL, socialUser.email);
      setLoginFailedCount(0);
      try { localStorage.removeItem(SESSION_KEYS.FAILED_LOGIN_ATTEMPTS); } catch {}

      return { success: true, user: socialUser };
    } catch (e) {
      return { success: false, error: 'Direct social login failed. Please try again.' };
    }
  };

  const register = async (
    name: string, 
    email: string, 
    phone?: string, 
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isRegBlocked) {
      return {
        success: false,
        error: 'Security policy: Maximum 5 account registration attempts exceeded. Please try again later.'
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) {
      recordFailedRegAttempt();
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      recordFailedRegAttempt();
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!phone || phone.trim().length < 8) {
      recordFailedRegAttempt();
      return { success: false, error: 'A valid mobile phone number is required.' };
    }
    if (!password || password.trim().length < 6) {
      recordFailedRegAttempt();
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check if user already exists
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      recordFailedRegAttempt();
      return { 
        success: false, 
        error: 'An account with this email address already exists. Please log in instead.' 
      };
    }

    const newUser = db.saveUser({
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim(),
      password: password?.trim(),
      role: 'customer',
      provider: 'local',
    });

    setUser(newUser);
    localStorage.setItem(SESSION_KEYS.CURRENT_USER_EMAIL, newUser.email);
    resetRegAttempts();
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAdminUnlocked(false);
    localStorage.removeItem(SESSION_KEYS.CURRENT_USER_EMAIL);
    sessionStorage.removeItem(SESSION_KEYS.ADMIN_SESSION_TOKEN);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = db.saveUser({
      ...user,
      ...data,
      name: data.name || user.name,
      email: user.email,
    });
    setUser(updated);
  };

  const unlockAdminGate = (passphrase: string): { success: boolean; error?: string } => {
    // Check lockout
    const lockoutUntil = Number(localStorage.getItem(SESSION_KEYS.LOCKOUT_UNTIL) || '0');
    if (lockoutUntil > Date.now()) {
      const wait = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Too many failed attempts. Security gateway locked. Please wait ${wait} seconds.`,
      };
    }

    const isValid = db.verifyAdminPassphrase(passphrase);
    if (isValid) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem(SESSION_KEYS.ADMIN_SESSION_TOKEN, 'valid_admin_session');
      localStorage.removeItem(SESSION_KEYS.FAILED_ADMIN_ATTEMPTS);
      setShowAdminGateModal(false);
      return { success: true };
    } else {
      const currentFails = Number(localStorage.getItem(SESSION_KEYS.FAILED_ADMIN_ATTEMPTS) || '0') + 1;
      localStorage.setItem(SESSION_KEYS.FAILED_ADMIN_ATTEMPTS, currentFails.toString());

      if (currentFails >= 5) {
        const lockoutPeriodMs = 60 * 1000;
        localStorage.setItem(SESSION_KEYS.LOCKOUT_UNTIL, (Date.now() + lockoutPeriodMs).toString());
        return {
          success: false,
          error: 'Security threshold exceeded. Admin access locked for 60 seconds.',
        };
      }

      return {
        success: false,
        error: `Invalid admin passphrase. ${5 - currentFails} attempt(s) remaining before security lockout.`,
      };
    }
  };

  const lockAdminGate = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem(SESSION_KEYS.ADMIN_SESSION_TOKEN);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin' || isAdminUnlocked,
        isAdminUnlocked,
        adminLockRemainingSeconds,
        login,
        loginWithSocial,
        register,
        logout,
        updateProfile,
        unlockAdminGate,
        lockAdminGate,
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        openAuthModal,
        showAdminGateModal,
        setShowAdminGateModal,
        regAttemptsRemaining,
        isRegBlocked,
        recordFailedRegAttempt,
        resetRegAttempts,
        loginAttemptsRemaining,
        isLoginBlocked,
        recordFailedLoginAttempt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
