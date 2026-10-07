import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  MapPin, 
  Banknote, 
  CheckCircle2, 
  Clock, 
  Lock, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

interface CheckoutGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onOpenLocation: () => void;
}

export const CheckoutGatewayModal: React.FC<CheckoutGatewayModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenLocation
}) => {
  const { 
    cart, 
    user, 
    activeTown, 
    createOrder,
    clearCart,
    razorpayConfig,
    storeSettings,
    appliedCoupon
  } = useStore();

  const [step, setStep] = useState<'address_form' | 'payment_select' | 'order_placed'>('address_form');

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [flatNo, setFlatNo] = useState(user?.addresses?.[0]?.flat || '');
  const [areaColony, setAreaColony] = useState(user?.addresses?.[0]?.area || activeTown.name);
  const [landmark, setLandmark] = useState(user?.addresses?.[0]?.landmark || '');
  const [formError, setFormError] = useState('');

  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const originalSubtotal = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
  const discountSavings = originalSubtotal - subtotal;
  
  const freeThreshold = storeSettings?.freeDeliveryThreshold ?? 199;
  const baseDeliveryFee = storeSettings?.deliveryFee ?? 15;
  const deliveryFee = subtotal >= freeThreshold ? 0 : baseDeliveryFee;
  const handlingFee = storeSettings?.handlingFee ?? 4;
  
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'flat') {
      couponDiscount = appliedCoupon.discountValue;
    } else {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
  } else {
    const minPromoOrder = storeSettings?.promoMinOrder ?? 300;
    const basePromoDiscount = storeSettings?.promoDiscount ?? 30;
    couponDiscount = subtotal >= minPromoOrder ? basePromoDiscount : 0;
  }

  const finalPayable = Math.max(0, subtotal + deliveryFee + handlingFee - couponDiscount);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Please enter customer full name.');
      setTimeout(() => setFormError(''), 3000);
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      setTimeout(() => setFormError(''), 3000);
      return;
    }
    if (!flatNo.trim()) {
      setFormError('Please enter your house/flat/street address.');
      setTimeout(() => setFormError(''), 3000);
      return;
    }

    setFormError('');
    setStep('payment_select');
  };

  const finalizeOrder = async (method: 'razorpay' | 'cod', paymentId: string) => {
    setIsProcessing(true);
    try {
      const fullAddress = `${flatNo.trim()}, ${areaColony.trim()}`;
      const newOrder = await createOrder({
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        address: fullAddress,
        landmark: landmark.trim(),
        paymentMethod: method,
        paymentId
      });

      setConfirmedOrder(newOrder);
      setIsProcessing(false);
      setShowRazorpayModal(false);
      setStep('order_placed');
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      setIsProcessing(false);
      setShowRazorpayModal(false);
    }
  };

  const handleLaunchRazorpayGateway = async () => {
  setIsProcessing(true);

  if (
    typeof window === 'undefined' ||
    !(window as any).Razorpay ||
    !razorpayConfig.keyId
  ) {
    setIsProcessing(false);
    setShowRazorpayModal(true);
    return;
  }

  try {
    // 1. Create Razorpay Order on Vercel server
    const orderResponse = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: finalPayable,
        receipt: `apnicart_${Date.now()}`,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok || !orderData.orderId) {
      throw new Error(
        orderData?.error || 'Unable to create Razorpay order'
      );
    }

    // 2. Open Razorpay Checkout with server-created Order ID
    const options = {
      key: orderData.keyId || razorpayConfig.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      order_id: orderData.orderId,

      name: 'ApniCart 10-Min Delivery',
      description: `Delivery to ${areaColony}`,

      prefill: {
        name: customerName,
        contact: customerPhone,
        email: 'customer@apnicart.in',
      },

      theme: {
        color: '#0c831f',
      },

      handler: async function (response: any) {
        try {
          // 3. Verify payment signature on Vercel server
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyData.success) {
            throw new Error(
              verifyData?.error || 'Payment verification failed'
            );
          }

          // 4. Only create the order after successful verification
          await finalizeOrder(
            'razorpay',
            response.razorpay_payment_id
          );
        } catch (error) {
          console.error('Payment verification error:', error);
          alert('Payment verification failed. Please contact support.');
          setIsProcessing(false);
        }
      },

      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', function (resp: any) {
      console.warn('Razorpay payment failed:', resp.error);
      setIsProcessing(false);
    });

    rzp.open();
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    setIsProcessing(false);
    alert(
      error instanceof Error
        ? error.message
        : 'Unable to start Razorpay payment.'
    );
  }
};

  const handlePlaceOrder = async () => {
    if (selectedMethod === 'razorpay') {
      handleLaunchRazorpayGateway();
      return;
    }

    if (selectedMethod === 'cod') {
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 600));
      await finalizeOrder('cod', 'cod_cash_on_delivery');
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl my-auto">
        
        {/* ================= STEP 1: DELIVERY ADDRESS ================= */}
        {step === 'address_form' && (
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-[#0c831f] shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-base">
                    Delivery Address
                  </h3>
                  <p className="text-xs text-slate-500">
                    {totalItemsCount} items · ⚡ 10-Min to {activeTown.name}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6 space-y-4">
              
              <form onSubmit={handleProceedToPayment} id="checkout-address-form" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter Doorstep Location
                  </h4>
                  <button
                    type="button"
                    onClick={onOpenLocation}
                    className="text-xs font-bold text-[#0c831f] hover:underline flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>Town: {activeTown.name}</span>
                  </button>
                </div>

                {formError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Pathak"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400 font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full rounded-xl border border-slate-300 pl-11 pr-3 py-2 text-xs font-mono focus:border-[#0c831f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      House / Flat / Shop No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      placeholder="e.g. House 42, Ward 5"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mohalla / Gali / Village *
                    </label>
                    <input
                      type="text"
                      required
                      value={areaColony}
                      onChange={(e) => setAreaColony(e.target.value)}
                      placeholder="e.g. Civil Lines, Main Chowk"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Shiv Mandir or Water Tank"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                  />
                </div>
              </form>

              {/* Bill Summary */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Items MRP Total</span>
                  <span className="font-mono tabular-nums">₹{originalSubtotal}</span>
                </div>

                {discountSavings > 0 && (
                  <div className="flex justify-between text-[#0c831f] font-semibold">
                    <span>Product Savings</span>
                    <span className="font-mono tabular-nums">-₹{discountSavings}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-[#0c831f] font-bold">FREE</span>
                  ) : (
                    <span className="font-mono tabular-nums font-bold">₹{deliveryFee}</span>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#0c831f] font-bold">
                    <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                    <span className="font-mono tabular-nums">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Amount</span>
                  <span className="font-mono text-base text-[#0c831f] tabular-nums">
                    ₹{finalPayable}
                  </span>
                </div>
              </div>

            </div>

            <div className="border-t border-slate-100 p-3.5 sm:p-4 bg-white flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">To Pay</span>
                <span className="font-mono text-lg font-black text-slate-900 tabular-nums">
                  ₹{finalPayable}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-address-form"
                className="flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-md active:scale-98 transition-all"
              >
                <span>Select Payment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PAYMENT METHOD & CANCELLATION RULES ================= */}
        {step === 'payment_select' && (
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('address_form')}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Payment & Cancellation Rules
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pay: <strong className="font-mono text-slate-900 tabular-nums">₹{finalPayable}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              
              {/* Option 1: Official Razorpay Online Gateway */}
              <div
                onClick={() => setSelectedMethod('razorpay')}
                className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                  selectedMethod === 'razorpay'
                    ? 'border-[#0c831f] bg-emerald-50/40 shadow-xs ring-1 ring-[#0c831f]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-200 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">
                          Online Payment (Razorpay Official)
                        </h4>
                        {razorpayConfig.isLiveActive ? (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-[#0c831f] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0c831f] animate-ping" />
                            <span>Linked & Active</span>
                          </span>
                        ) : (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                            Setup Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        UPI (GPay, PhonePe, Paytm), Netbanking, Wallets & Cards
                      </p>
                      {razorpayConfig.keyId && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Key: {razorpayConfig.keyId.slice(0, 12)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'razorpay'}
                    onChange={() => setSelectedMethod('razorpay')}
                    className="h-4 w-4 text-[#0c831f]"
                  />
                </div>

                {selectedMethod === 'razorpay' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/70 bg-white rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Lock className="h-3.5 w-3.5 text-[#0c831f]" />
                      <span>Direct 256-bit bank encrypted payment via Razorpay.</span>
                    </div>

                    {/* Online Cancellation Policy Note */}
                    <div className="rounded-lg bg-blue-50 p-2 text-[10px] text-blue-900 border border-blue-200 space-y-1">
                      <span className="font-bold block flex items-center gap-1">
                        <Info className="h-3 w-3 text-blue-700" />
                        Online Payment Cancellation Policy:
                      </span>
                      <p>
                        • 100% full refund if cancelled before order is out for delivery.
                      </p>
                      <p>
                        • If cancelled after rider departs ("Out for Delivery"), ₹24 will be deducted for rider mobilization and the remaining ₹{Math.max(0, finalPayable - 24)} will be refunded instantly.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Cash on Delivery (COD) */}
              <div
                onClick={() => setSelectedMethod('cod')}
                className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                  selectedMethod === 'cod'
                    ? 'border-[#0c831f] bg-emerald-50/50 shadow-xs ring-1 ring-[#0c831f]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Cash on Delivery (COD)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Pay cash or UPI to 10-minute rider at your doorstep
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'cod'}
                    onChange={() => setSelectedMethod('cod')}
                    className="h-4 w-4 text-[#0c831f]"
                  />
                </div>

                {selectedMethod === 'cod' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/70 bg-white rounded-xl p-3">
                    {/* COD Cancellation Policy Note */}
                    <div className="rounded-lg bg-amber-50 p-2 text-[10px] text-amber-900 border border-amber-200">
                      <span className="font-bold block flex items-center gap-1 mb-1">
                        <Info className="h-3 w-3 text-amber-700" />
                        Cash on Delivery Cancellation Rule:
                      </span>
                      <p>
                        • Aap COD order ko sirf tab tak cancel kar sakte hain jab tak samaan pack nahi hua hai.
                      </p>
                      <p>
                        • Jaise hi dukan par samaan pack ho jayega, customer ke phone se Cancel button hat jayega aur order deliver hoga.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="border-t border-slate-100 p-3.5 sm:p-4 bg-white flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total to Pay</span>
                <span className="font-mono text-lg font-black text-slate-900 tabular-nums">
                  ₹{finalPayable}
                </span>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePlaceOrder}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50 ${
                  selectedMethod === 'razorpay' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#0c831f] hover:bg-emerald-800'
                }`}
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : selectedMethod === 'razorpay' ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay with Razorpay (₹{finalPayable})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Confirm COD Order (₹{finalPayable})</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 3: ORDER SUCCESS ================= */}
        {step === 'order_placed' && confirmedOrder && (
          <div className="p-6 sm:p-8 text-center">
            
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#0c831f] mb-3 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#0c831f]">
              Order Placed Successfully!
            </span>

            <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 font-display">
              Thank you, {confirmedOrder.customerName}!
            </h3>

            <p className="mt-1 text-xs text-slate-600">
              Order <strong className="font-mono text-slate-900">#{confirmedOrder.orderNumber}</strong> has been received by our town store.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px] text-right">
                  {confirmedOrder.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-mono font-bold text-[#0c831f]">
                  ₹{confirmedOrder.total} ({confirmedOrder.paymentMethod.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Speed:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  ~{storeSettings?.deliveryTimeMin || 10} Minutes Doorstep Delivery
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onOrderSuccess(confirmedOrder);
                onClose();
              }}
              className="mt-5 w-full rounded-xl bg-[#0c831f] py-3 text-xs font-bold text-white hover:bg-emerald-800 shadow-md active:scale-98 transition-all"
            >
              Track Live Order on Map →
            </button>

          </div>
        )}

      </div>

      {/* RAZORPAY GATEWAY CHECKOUT MODAL FALLBACK */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm animate-in fade-in-50 duration-150">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="bg-[#0b2265] text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white text-xs">
                    R
                  </div>
                  <div>
                    <h3 className="font-bold text-xs tracking-wide">Razorpay Gateway</h3>
                    <p className="text-[10px] text-blue-200">ApniCart 10-Minute Dark Store</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="rounded-full p-1 text-blue-200 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between bg-white/10 p-2.5 rounded-xl">
                <span className="text-[10px] text-blue-200 font-bold uppercase">To Pay</span>
                <span className="text-lg font-mono font-black text-white tabular-nums">
                  ₹{finalPayable}.00
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3 text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Authorized Razorpay Checkout
              </h4>
              <p className="text-[11px] text-slate-500">
                Click below to complete authorization of ₹{finalPayable}.
              </p>

              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true);
                  await new Promise(r => setTimeout(r, 1000));
                  const genId = `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
                  await finalizeOrder('razorpay', genId);
                }}
                className="w-full rounded-xl bg-[#0c831f] hover:bg-emerald-800 text-white font-bold py-2.5 text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>PAY ₹{finalPayable} NOW</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
