import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Key, 
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerDetails: {
    name: string;
    phone: string;
    address: string;
    landmark?: string;
  };
  onPaymentSuccess: (orderId: string) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  customerDetails,
  onPaymentSuccess
}) => {
  const { cart, activeTown, razorpayConfig, updateRazorpayConfig, createOrder } = useStore();

  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'cod' | 'config'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Config editing state
  const [keyIdInput, setKeyIdInput] = useState(razorpayConfig.keyId);
  const [keySecretInput, setKeySecretInput] = useState(razorpayConfig.keySecret);
  const [showConfigSaved, setShowConfigSaved] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 199 ? 0 : 15;
  const handlingFee = 4;
  const discount = subtotal > 300 ? 30 : 0;
  const totalAmount = subtotal + deliveryFee + handlingFee - discount;

  // Handle Official Razorpay Checkout if window.Razorpay is available
  const handleLaunchOfficialRazorpay = () => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      try {
        const options = {
          key: razorpayConfig.keyId,
          amount: totalAmount * 100, // in paise
          currency: 'INR',
          name: 'TownBlink Quick Mart',
          description: `Town Order delivery to ${customerDetails.address || activeTown.name}`,
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
          handler: async function (response: any) {
            setIsProcessing(true);
            const created = await createOrder({
              customerName: customerDetails.name,
              phone: customerDetails.phone,
              address: customerDetails.address,
              landmark: customerDetails.landmark,
              paymentMethod: 'razorpay',
              paymentId: response.razorpay_payment_id || `pay_${Date.now()}`
            });
            setIsProcessing(false);
            onPaymentSuccess(created.id);
          },
          prefill: {
            name: customerDetails.name,
            contact: customerDetails.phone,
            email: 'customer@town.com',
          },
          theme: {
            color: '#059669', // Emerald accent
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.warn('Payment failed:', response.error);
          setIsProcessing(false);
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn('Official Razorpay SDK fallback to integrated checkout:', err);
      }
    }
  };

  // Process Simulated / Direct Payment
  const handleSimulatePayment = async (method: 'razorpay' | 'cod' | 'upi') => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1400));

    const generatedPayId = method === 'cod' 
      ? 'cod_pay_pending' 
      : `pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const created = await createOrder({
      customerName: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address,
      landmark: customerDetails.landmark,
      paymentMethod: method,
      paymentId: generatedPayId
    });

    setIsProcessing(false);
    onPaymentSuccess(created.id);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateRazorpayConfig(keyIdInput.trim(), keySecretInput.trim(), true);
    setShowConfigSaved(true);
    setTimeout(() => setShowConfigSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Razorpay Branded Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-black text-amber-400">
                ₹
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wide text-lg font-display">Razorpay</span>
                  <span className="rounded bg-emerald-500/30 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-200">
                    Trusted Gateway
                  </span>
                </div>
                <p className="text-xs text-blue-100/90">
                  TownBlink 10-Minute Delivery · {activeTown.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Amount Display */}
          <div className="mt-4 flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-xs">
            <span className="text-xs font-medium text-blue-100">Amount Payable</span>
            <span className="font-mono text-2xl font-bold tracking-tight text-white">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          <button
            onClick={() => setPaymentTab('upi')}
            className={`flex items-center gap-1.5 border-b-2 py-2 px-3 transition-colors ${
              paymentTab === 'upi'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>UPI / QR</span>
          </button>

          <button
            onClick={() => setPaymentTab('card')}
            className={`flex items-center gap-1.5 border-b-2 py-2 px-3 transition-colors ${
              paymentTab === 'card'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Cards</span>
          </button>

          <button
            onClick={() => setPaymentTab('cod')}
            className={`flex items-center gap-1.5 border-b-2 py-2 px-3 transition-colors ${
              paymentTab === 'cod'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Banknote className="h-4 w-4" />
            <span>Cash on Delivery</span>
          </button>

          <button
            onClick={() => setPaymentTab('config')}
            className={`ml-auto flex items-center gap-1 border-b-2 py-2 px-2 text-[11px] transition-colors ${
              paymentTab === 'config'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Configure your own Razorpay Key ID & Secret"
          >
            <Key className="h-3.5 w-3.5" />
            <span>API Keys</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {paymentTab === 'upi' && (
            <div className="space-y-4">
              {/* Instant UPI apps */}
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Fast UPI Payment
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm UPI'].map((app) => (
                    <button
                      key={app}
                      onClick={() => handleSimulatePayment('upi')}
                      disabled={isProcessing}
                      className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Smartphone className="h-5 w-5 text-indigo-600 mb-1" />
                      <span>{app}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI ID input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Or enter UPI VPA (e.g. mobile@okhdfcbank, name@ybl)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    onClick={() => handleSimulatePayment('upi')}
                    disabled={isProcessing}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Pay
                  </button>
                </div>
              </div>

              {/* QR Code preview */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div className="h-12 w-12 rounded-lg bg-white p-1 shadow-xs dark:bg-slate-900 flex items-center justify-center">
                  <QrCode className="h-10 w-10 text-slate-900 dark:text-white" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Scan dynamic QR from any UPI App
                  </p>
                  <p className="text-slate-500">Auto-verifies upon transfer</p>
                </div>
              </div>
            </div>
          )}

          {paymentTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 ···· ···· 8921"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSimulatePayment('razorpay')}
                disabled={isProcessing}
                className="w-full mt-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
              >
                Pay ₹{totalAmount} via Razorpay
              </button>
            </div>
          )}

          {paymentTab === 'cod' && (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Banknote className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Cash on Delivery (COD) Available
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Pay ₹{totalAmount} in cash or UPI to our delivery partner <strong className="text-slate-700 dark:text-slate-300">Raju Sharma</strong> when your order reaches in ~{activeTown.deliveryTimeMin} minutes.
                </p>
              </div>

              <button
                onClick={() => handleSimulatePayment('cod')}
                disabled={isProcessing}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
              >
                Confirm Cash on Delivery Order
              </button>
            </div>
          )}

          {paymentTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Enter your official Razorpay Dashboard Key & Secret to connect your own merchant account.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  value={keyIdInput}
                  onChange={(e) => setKeyIdInput(e.target.value)}
                  placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxx"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Razorpay Key Secret
                </label>
                <input
                  type="password"
                  value={keySecretInput}
                  onChange={(e) => setKeySecretInput(e.target.value)}
                  placeholder="Enter your razorpay secret code"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950"
                >
                  Save API Credentials
                </button>
                {showConfigSaved && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Keys updated!
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Quick Trigger Official SDK button */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs dark:border-slate-800">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              256-bit SSL Encrypted
            </span>
            <button
              onClick={handleLaunchOfficialRazorpay}
              disabled={isProcessing}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline dark:text-indigo-400"
            >
              Open Native Checkout popup ↗
            </button>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs dark:bg-slate-900/95">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">
              Processing Payment with Razorpay...
            </p>
            <p className="text-xs text-slate-500">
              Please do not close or refresh this window
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
