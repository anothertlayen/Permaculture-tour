import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Cloud,
  UserPlus,
  Sparkles,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStoredGuestProfile } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  defaultRole?: string;
  onSuccess?: () => void;
  onNavigateToLocalGuide?: () => void;
  isLocalModeEnabled?: boolean;
}

const deriveNameFromEmail = (mail: string): string => {
  if (!mail || !mail.includes('@')) return '';
  const prefix = mail.split('@')[0];
  const words = prefix.split(/[._\-+0-9]+/).filter(Boolean);
  if (words.length === 0) return 'Kiwi Traveler';
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
  onNavigateToLocalGuide,
  isLocalModeEnabled = false,
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suggestRegister, setSuggestRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const switchToRegisterWithFilledDetails = () => {
    setError(null);
    setSuggestRegister(false);
    setMode('register');
    if (!name.trim()) {
      const derived = deriveNameFromEmail(email) || getStoredGuestProfile().name || 'Kiwi Traveler';
      setName(derived);
    }
  };

  const handleQuickRegister = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      switchToRegisterWithFilledDetails();
      setError('Password should be at least 6 characters. Please choose a password to complete registration.');
      return;
    }

    const resolvedName = name.trim() || deriveNameFromEmail(email) || getStoredGuestProfile().name || 'Kiwi Traveler';
    setName(resolvedName);
    setError(null);
    setSuggestRegister(false);
    setIsLoading(true);

    try {
      await signUpWithEmail(email.trim(), password, resolvedName);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered. Please sign in with your password.'
          : err.code === 'auth/weak-password' || err.message?.includes('weak-password')
          ? 'Password should be at least 6 characters.'
          : err.message || 'Registration error. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuggestRegister(false);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'register' && (!password || password.length < 6)) {
      setError('Password should be at least 6 characters.');
      return;
    }

    if (mode === 'login' && !password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        const resolvedName = name.trim() || deriveNameFromEmail(email) || getStoredGuestProfile().name || 'Kiwi Traveler';
        await signUpWithEmail(email.trim(), password, resolvedName);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('No account found for this email, or password was incorrect.');
        setSuggestRegister(true);
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please switch to Sign In.');
      } else if (err.code === 'auth/weak-password' || err.message?.includes('weak-password')) {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSuggestRegister(false);
    setIsLoading(true);
    try {
      // Seamless 1-click registration or login with Google
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in cancelled or failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FBF8F3] rounded-2xl shadow-2xl border border-[#E7E0D3] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-[#F2EDE2] border-b border-[#E0D8C8] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shadow-xs">
              <Cloud className="w-5 h-5 text-[#A8D59D]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#1C2C19]">
                {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Cloud Account'}
              </h3>
              <p className="text-xs text-[#5C6D57]">
                Cloud sync across devices for bookings & roadtrips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6F7E6B] hover:text-[#1C2C19] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Local-Only Mode Option (Hidden by default behind footer settings toggle) */}
          {isLocalModeEnabled && (
            <div className="p-3.5 rounded-2xl bg-linear-to-r from-[#FAF5EC] to-[#F2EDE2] border border-[#DDD3BF] space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center shrink-0 mt-0.5">
                  <HardDrive className="w-4 h-4 text-[#C86446]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-[#1C2C19]">Prefer Not to Register?</p>
                    <span className="text-[10px] bg-white px-1.5 py-0.2 rounded font-semibold text-[#2D5A27] border border-[#D5CCBA]">
                      Device Private
                    </span>
                  </div>
                  <p className="text-[11px] text-[#556651] mt-0.5 leading-snug">
                    You can use the entire app in Local Mode on this device. Plan routes, book tour passes, and log seed swaps with zero account or tracking.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-1.5 px-3 bg-white hover:bg-[#F8F4EC] text-[#1C2C19] border border-[#D5CCBA] text-xs font-bold rounded-lg transition text-center cursor-pointer shadow-2xs"
                >
                  Continue in Local Mode
                </button>
                {onNavigateToLocalGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToLocalGuide();
                    }}
                    className="py-1.5 px-2.5 text-xs font-semibold text-[#2D5A27] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>How it works</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#FDF0EC] border border-[#F2C0B5] text-[#A63821] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Register Suggestion Banner */}
          {suggestRegister && (
            <div className="p-3.5 bg-[#EEF6EC] border border-[#BBDCB4] rounded-xl text-xs flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-[#2D5A27] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1C2C19]">New to Kiwi Permaculture?</p>
                  <p className="text-[11px] text-[#4A5D46] leading-relaxed">
                    No account yet? You can immediately register now using the email and password you just entered.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickRegister}
                disabled={isLoading}
                className="w-full py-2 px-3 bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Now with Entered Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Google Sign In & Register */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white border border-[#D5CCBA] hover:bg-[#F6F2EA] text-[#2C3C29] text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 transition shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <div className="flex items-center gap-1.5">
                <span>Continue with Google</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#E8F0E6] text-[#2D5A27] font-bold rounded">
                  1-Click Register / Login
                </span>
              </div>
            </button>
            <p className="text-[11px] text-center text-[#73826F]">
              Seamlessly logs you in or creates a new account automatically
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E3DCCF]"></div>
            <span className="text-[11px] font-semibold text-[#8B9886] uppercase tracking-wider">or with email</span>
            <div className="flex-1 h-px bg-[#E3DCCF]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#3C4C38]">Alias</label>
                    {email && (
                      <span className="text-[10px] text-[#2D5A27] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Auto-filled
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#82927F] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jess Blomfield"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5CCBA] bg-white text-[#1C2C19] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#3C4C38] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#82927F] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (suggestRegister) setSuggestRegister(false);
                  }}
                  placeholder="you@domain.co.nz"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5CCBA] bg-white text-[#1C2C19] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="auth-password-input" className="block text-xs font-semibold text-[#3C4C38]">
                  Password {mode === 'register' && <span className="font-normal text-[#7E8D7B]">(min. 6 characters)</span>}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#82927F] absolute left-3 top-2.5" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={mode === 'register' ? 6 : 1}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (suggestRegister) setSuggestRegister(false);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5CCBA] bg-white text-[#1C2C19] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>

            {/* If in login mode and details filled, allow one-click register with these details */}
            {mode === 'login' && email.length > 3 && (
              <button
                type="button"
                onClick={handleQuickRegister}
                disabled={isLoading}
                className="w-full py-2 px-3 bg-[#E8F0E6] hover:bg-[#DAE8D8] text-[#2D5A27] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#C6DFC2]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Not registered yet? Register now with these details</span>
              </button>
            )}
          </form>

          {/* Toggle login / register */}
          <div className="pt-2 text-center border-t border-[#EAE3D6]">
            {mode === 'login' ? (
              <p className="text-xs text-[#5C6D57]">
                Don't have a cloud account yet?{' '}
                <button
                  type="button"
                  onClick={switchToRegisterWithFilledDetails}
                  className="font-bold text-[#2D5A27] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Register now</span>
                  {email && <span className="text-[10px] text-[#486343] font-normal">(keeps your entered info)</span>}
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#5C6D57]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuggestRegister(false);
                    setMode('login');
                  }}
                  className="font-bold text-[#2D5A27] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
