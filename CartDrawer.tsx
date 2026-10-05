import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  ArrowRight, 
  ShoppingBag, 
  Truck,
  CheckCircle2,
  Tag,
  AlertCircle,
  Percent
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getProductMinQuantity } from '../data/mockProducts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPay: () => void;
  onOpenLocation: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToPay,
  onOpenLocation
}) => {
  const { 
    cart, 
    activeTown, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    storeSettings,
    coupons,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const originalSubtotal = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
  const discountSavings = originalSubtotal - subtotal;
  
  const freeThreshold = storeSettings?.freeDeliveryThreshold ?? 199;
  const baseDeliveryFee = storeSettings?.deliveryFee ?? 15;
  const deliveryFee = subtotal >= freeThreshold ? 0 : baseDeliveryFee;
  const handlingFee = storeSettings?.handlingFee ?? 4;
  
  // Calculate discount from applied coupon or default store discount
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

  const finalTotal = Math.max(0, subtotal + deliveryFee + handlingFee - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput.trim());
    if (res.success) {
      setCouponMsg({ text: res.message, isError: false });
      setCouponCodeInput('');
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
    setTimeout(() => setCouponMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-full sm:max-w-md">
        <div className="w-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-x-hidden">
          
          {/* Drawer Header - Guaranteed responsive fit without clipping */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 bg-white shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0c831f] shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-1.5 truncate">
                  <span>My Cart</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                    {totalItemsCount}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  ⚡ 10-Min Delivery in {activeTown.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-1 py-1"
                >
                  Clear Cart
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Cart Content or Empty State */}
          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-[#0c831f] mb-3">
                <ShoppingBag className="h-10 w-10 stroke-1" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Your cart is empty!
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                Add fresh fruits, milk, snacks, or medicines for lightning-fast 10-minute doorstep delivery in {activeTown.name}.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-xl bg-[#0c831f] px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-md active:scale-95 transition-all"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              
              {/* Delivery Destination Strip */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/80 px-4 py-2.5 text-xs text-emerald-950 shrink-0">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <MapPin className="h-3.5 w-3.5 text-[#0c831f] shrink-0" />
                  <span className="truncate">Delivering to: <strong>{activeTown.name}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={onOpenLocation}
                  className="font-bold text-[#0c831f] underline shrink-0 hover:text-emerald-800 text-[11px]"
                >
                  Change
                </button>
              </div>

              {/* Free Delivery Threshold Progress Banner */}
              <div className="p-3 border-b border-slate-100 shrink-0">
                <div className={`rounded-xl border p-2.5 text-xs ${
                  deliveryFee === 0 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                }`}>
                  {deliveryFee === 0 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#0c831f] shrink-0" />
                      <div>
                        <span className="font-bold text-[#0c831f] block text-xs">
                          🎉 FREE Delivery Unlocked!
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          Order is above ₹{freeThreshold} (Saved ₹{baseDeliveryFee})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-amber-950 text-xs flex items-center gap-1 truncate">
                          <Truck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>Add ₹{freeThreshold - subtotal} more for FREE Delivery!</span>
                        </span>
                        <span className="text-[10px] font-bold bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded shrink-0">
                          Free on ₹{freeThreshold}+
                        </span>
                      </div>
                      <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-[#0c831f] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List - Fixed mobile responsive width with no right cut-off */}
              <div className="flex-1 divide-y divide-slate-100 px-3 sm:px-4 py-1">
                {cart.map((item) => {
                  const minQty = getProductMinQuantity(item.product.price);
                  return (
                    <div key={item.product.id} className="py-3 flex items-center gap-2.5 sm:gap-3">
                      
                      {/* Product Thumbnail */}
                      <div className="relative h-16 w-16 shrink-0 rounded-xl bg-slate-50 p-1 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {item.product.name}
                        </h4>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.product.weight}
                          </span>
                          {minQty > 1 && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                              Min {minQty} pcs
                            </span>
                          )}
                        </div>

                        {/* Stepper Buttons & Price */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-xl bg-[#0c831f] text-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="p-1 sm:p-1.5 hover:bg-emerald-800 rounded-l-xl transition-colors active:scale-90"
                              title="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[22px] text-center font-mono text-xs font-bold px-1 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="p-1 sm:p-1.5 hover:bg-emerald-800 rounded-r-xl transition-colors active:scale-90"
                              title="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Item Subtotal Price */}
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-black text-slate-900 block tabular-nums">
                              ₹{item.product.price * item.quantity}
                            </span>
                            {item.product.originalPrice > item.product.price && (
                              <span className="font-mono text-[10px] text-slate-400 line-through tabular-nums">
                                ₹{item.product.originalPrice * item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Direct Remove from Cart Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                        title="Remove from Cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  );
                })}
              </div>

              {/* Coupons & Promo Codes Section */}
              <div className="border-t border-slate-200 bg-emerald-50/40 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[#0c831f]" />
                    <span>Apply Town Coupon</span>
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-100/80 p-2.5 border border-emerald-300 text-xs">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-[#0c831f]" />
                      <div>
                        <span className="font-bold text-emerald-900 block font-mono">
                          {appliedCoupon.code} Applied!
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          {appliedCoupon.description}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#0c831f]">
                      -₹{couponDiscount}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g. WELCOME50)"
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold uppercase focus:border-[#0c831f] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#0c831f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMsg && (
                  <p className={`text-[11px] font-bold ${couponMsg.isError ? 'text-rose-600' : 'text-[#0c831f]'}`}>
                    {couponMsg.text}
                  </p>
                )}

                {/* Available Coupons Pills */}
                {!appliedCoupon && coupons.filter(c => c.isActive).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {coupons.filter(c => c.isActive).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          const res = applyCoupon(c.code);
                          if (!res.success) {
                            setCouponMsg({ text: res.message, isError: true });
                            setTimeout(() => setCouponMsg(null), 3500);
                          }
                        }}
                        className="rounded-lg bg-white border border-emerald-300 px-2 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
                      >
                        🏷️ {c.code} ({c.discountType === 'flat' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bill Details Breakdown Card - 100% visible, no cut-off numbers */}
              <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block text-xs">
                  Bill Summary
                </span>

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
                  <div>
                    <span>Delivery Fee (10-min rider)</span>
                    <span className="block text-[10px] text-[#0c831f] font-semibold">
                      (Free above ₹{freeThreshold})
                    </span>
                  </div>
                  {deliveryFee === 0 ? (
                    <div className="text-right">
                      <span className="text-[#0c831f] font-extrabold block">FREE</span>
                      <span className="text-[10px] text-slate-400 line-through">₹{baseDeliveryFee}</span>
                    </div>
                  ) : (
                    <span className="font-mono font-bold tabular-nums">₹{deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Handling & Packaging Fee</span>
                  <span className="font-mono tabular-nums">₹{handlingFee}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#0c831f] font-bold">
                    <span>Coupon / Promo Discount</span>
                    <span className="font-mono tabular-nums">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Grand Total</span>
                  <span className="font-mono text-base text-[#0c831f] tabular-nums">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              {/* Bottom Sticky PAY NOW CTA */}
              <div className="border-t border-slate-200 bg-white p-3.5 sm:p-4 shadow-lg flex items-center justify-between gap-3 shrink-0">
                <div className="shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">To Pay</span>
                  <span className="font-mono text-lg font-black text-slate-900 tabular-nums">
                    ₹{finalTotal}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToPay();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#0c831f] hover:bg-emerald-800 text-white font-bold text-xs py-3 px-3 sm:px-5 shadow-md active:scale-98 transition-all"
                >
                  <span>Pay Now (Proceed to Payment)</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
