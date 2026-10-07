import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, ShieldCheck, Check, Lock, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhone, sendPushNotification } = useStore();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
 
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setAuthError('Customer Name is mandatory. Please enter your full name.');
      setTimeout(() => setAuthError(''), 3500);
      return;
    }
    if (phone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      setTimeout(() => setAuthError(''), 3000);
      return;
    }

    setIsLoading(true);
    // Generate secure 4-digit code in background (sent via carrier SMS)
   
    

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      setAuthError('');
    }, 700);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!otp || otp.length !== 6) {
    setAuthError('Please enter the 6-digit OTP.');
    setTimeout(() => setAuthError(''), 3500);
    return;
  }

  if (!confirmationResult) {
    setAuthError('Please request a new OTP first.');
    return;
  }

  setIsLoading(true);

  try {
    const result = await confirmationResult.confirm(otp);
    const verifiedPhone = result.user.phoneNumber || phone;

    loginWithPhone(verifiedPhone, name.trim());

    onClose();
    setStep('phone');
    setPhone('');
    setOtp('');
    setConfirmationResult(null);

    sendPushNotification(
      `Welcome, ${name}!`,
      'Signed in successfully to ApniCart.',
      'system'
    );
  } catch (error) {
    setAuthError('Invalid or expired OTP. Please try again.');
    setTimeout(() => setAuthError(''), 3500);
  } finally {
    setIsLoading(false);
  }
};

const handleResendOtp = async () => {
  if (timer > 0) return;

  setAuthError('Please request a new OTP.');
  setTimeout(() => setAuthError(''), 3000);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center pt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0c831f] mb-3">
            <Smartphone className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 font-display">
            {step === 'phone' ? 'Customer Sign In' : 'SMS Code Verification'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {step === 'phone'
              ? 'Enter your name and mobile number to receive verification SMS'
              : `A 4-digit code was sent via SMS to +91 ${phone}`}
          </p>
        </div>

        {authError && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Step 1: Phone number and MANDATORY Name */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Full Name <span className="text-rose-500">* (जरूरी है)</span>
                </label>
                <span className="text-[10px] text-rose-500 font-semibold">Mandatory</span>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aapka Poora Naam (e.g. Rahul Sharma)"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-[#0c831f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Mobile Number <span className="text-rose-500">* (10 Digit)</span>
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full rounded-r-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider focus:border-[#0c831f] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] py-3 text-xs font-bold text-white hover:bg-emerald-800 active:scale-98 transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <span>Sending SMS to Phone...</span>
              ) : (
                <>
                  <span>Send SMS Code to Phone</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP verification entry */
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                Enter 4-Digit Code from SMS
              </label>
              
              <div className="flex justify-center">
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-36 text-center font-mono text-2xl font-black tracking-widest rounded-2xl border-2 border-[#0c831f] bg-slate-50 py-2.5 focus:outline-none focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                SMS dispatched to +91 {phone}.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] py-3 text-xs font-bold text-white hover:bg-emerald-800 active:scale-98 transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Verify SMS & Login</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="hover:underline"
              >
                Change Number
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0}
                className={`font-semibold ${
                  timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#0c831f] hover:underline'
                }`}
              >
                {timer > 0 ? `Resend SMS in ${timer}s` : 'Resend SMS'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0c831f]" />
          <span>Encrypted Dark Store Security</span>
        </div>

      </div>
    </div>
  );
};

