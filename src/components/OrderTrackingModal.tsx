import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Truck, 
  Package, 
  Star, 
  Sparkles,
  ShoppingBag,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Info
} from 'lucide-react';
import { Order } from '..../types';
import { useStore } from '../context/StoreContext';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenFeedback: (orderId: string) => void;
  onOpenSupport?: (orderId?: string) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onOpenFeedback,
  onOpenSupport
}) => {
  const { cancelOrder, requestReturnRefund } = useStore();
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);

  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged or wrong item delivered');
  const [returnFeedback, setReturnFeedback] = useState<string | null>(null);

  if (!order) return null;

  const steps = [
    { key: 'received', title: 'Order Placed', desc: 'Received at town dark store', time: '0m' },
    { key: 'confirmed', title: 'Order Accepted', desc: 'Confirmed by store manager', time: '1m' },
    { key: 'packed', title: 'Items Packed', desc: 'Safely packed in sealed bag', time: '3m' },
    { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'Rider is on bike with your items', time: '6m' },
    { key: 'near_doorstep', title: 'Near Doorstep', desc: 'Rider reached your location gate', time: '8m' },
    { key: 'delivered', title: 'Delivered', desc: 'Handed over at doorstep', time: '10m' },
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'received': return 0;
      case 'confirmed': return 1;
      case 'packed': return 2;
      case 'out_for_delivery': return 3;
      case 'near_doorstep': return 4;
      case 'delivered': return 5;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  // Cancellation availability rules:
  // COD: Allowed ONLY if 'received' or 'confirmed'
  // Online: Allowed if not delivered (received, confirmed, packed, out_for_delivery, near_doorstep)
  const isCOD = order.paymentMethod === 'cod';
  const canCancelCOD = isCOD && (order.status === 'received' || order.status === 'confirmed');
  const canCancelOnline = !isCOD && !isDelivered && !isCancelled;
  const canCancel = isCOD ? canCancelCOD : canCancelOnline;

  const isOutForDelivery = order.status === 'out_for_delivery' || order.status === 'near_doorstep';

  const handleConfirmCancel = () => {
    const res = cancelOrder(order.id, cancelReason);
    setCancelFeedback(res.message);
    setShowCancelPrompt(false);
  };

  const handleConfirmReturn = () => {
    const res = requestReturnRefund(order.id, returnReason);
    setReturnFeedback(res.message);
    setShowReturnPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl my-auto">
        
        {/* Header */}
        <div className={`px-4 sm:px-6 py-4 text-white ${isCancelled ? 'bg-slate-800' : 'bg-[#0c831f]'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              <div>
                <h3 className="font-extrabold text-base tracking-wide font-display">
                  {isCancelled ? 'Order Cancelled' : 'Live Order Tracking'}
                </h3>
                <p className="text-xs opacity-90">
                  Order #{order.orderNumber} · {order.townArea}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isCancelled && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2 text-xs backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-300" />
                <span>
                  {isDelivered ? 'Order Delivered!' : `Estimated in ~${order.estimatedMinutes} Minutes`}
                </span>
              </div>
              <span className="font-bold text-amber-300">
                ⚡ 10 Min Dark Store Rush
              </span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Cancellation Alert / Refund Status */}
          {isCancelled && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900 space-y-1">
              <span className="font-bold block flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="h-4 w-4" /> This order has been cancelled
              </span>
              {order.cancellationDetails && (
                <>
                  <p>Reason: {order.cancellationDetails.reason}</p>
                  {order.cancellationDetails.cancellationFeeDeducted > 0 && (
                    <p className="font-bold text-slate-800">
                      ₹{order.cancellationDetails.cancellationFeeDeducted} rider dispatch fee was deducted. Refund of ₹{order.cancellationDetails.refundAmount} initiated.
                    </p>
                  )}
                  {order.cancellationDetails.cancellationFeeDeducted === 0 && order.cancellationDetails.refundAmount > 0 && (
                    <p className="font-bold text-emerald-800">
                      100% Full Refund of ₹{order.cancellationDetails.refundAmount} initiated to original payment source.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {cancelFeedback && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-900">
              {cancelFeedback}
            </div>
          )}

          {returnFeedback && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-900">
              {returnFeedback}
            </div>
          )}

          {/* Timeline steps */}
          {!isCancelled && (
            <div className="relative border-l-2 border-emerald-500/30 ml-3.5 space-y-5 py-1">
              {steps.map((s, idx) => {
                const isPast = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={s.key} className="relative pl-5">
                    <div
                      className={`absolute -left-[16px] top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                        isPast || isCurrent
                          ? 'border-[#0c831f] bg-[#0c831f] text-white shadow-xs'
                          : 'border-slate-300 bg-white text-slate-400'
                      }`}
                    >
                      {isPast || isDelivered ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${
                        isCurrent 
                          ? 'text-[#0c831f]' 
                          : isPast 
                            ? 'text-slate-900' 
                            : 'text-slate-400'
                      }`}>
                        {s.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery Partner Contact Card */}
          {!isCancelled && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-[#0c831f] font-bold text-xs">
                    RS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {order.deliveryAgentName} (Town Delivery Rider)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      ⭐ 4.9 Verified Rider
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${order.deliveryAgentPhone}`}
                  className="flex items-center gap-1 rounded-xl bg-[#0c831f] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
                >
                  <Phone className="h-3 w-3" />
                  <span>Call Rider</span>
                </a>
              </div>

              <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <MapPin className="h-3.5 w-3.5 text-[#0c831f] shrink-0 mt-0.5" />
                <span className="truncate">Delivering to: <strong>{order.address}</strong></span>
              </div>
            </div>
          )}

          {/* Ordered items */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-1.5">
              Ordered Items ({order.items.length})
            </h4>
            <div className="max-h-28 overflow-y-auto space-y-1 text-xs text-slate-600 pr-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="truncate pr-2">{item.quantity}x {item.product.name}</span>
                  <span className="font-mono font-bold shrink-0">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CANCELLATION ACTIONS ACCORDING TO RULES */}
          {!isCancelled && !isDelivered && (
            <div className="pt-2 border-t border-slate-100">
              {canCancel ? (
                <div>
                  {!showCancelPrompt ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        {isCOD 
                          ? 'Cancellation allowed before packing' 
                          : isOutForDelivery 
                            ? 'Rider is on bike (₹24 fee applies)' 
                            : '100% free cancellation allowed'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCancelPrompt(true)}
                        className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        Cancel Order
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3.5 space-y-2.5 text-xs">
                      <span className="font-bold text-rose-900 block">
                        Confirm Cancellation for Order #{order.orderNumber}?
                      </span>

                      {isOutForDelivery && !isCOD && (
                        <p className="text-[11px] text-rose-800 bg-rose-100 p-2 rounded-lg">
                          ⚠️ Order is already "Out for Delivery". As per policy, ₹24 rider mobilization fee will be deducted and ₹{Math.max(0, order.total - 24)} will be refunded.
                        </p>
                      )}

                      <select
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full rounded-xl border border-rose-300 bg-white p-2 text-xs"
                      >
                        <option value="Placed order by mistake">Placed order by mistake</option>
                        <option value="Delivery time is too long">Delivery time is too long</option>
                        <option value="Want to change delivery address">Want to change delivery address</option>
                        <option value="Need to change items in cart">Need to change items in cart</option>
                        <option value="Other reason">Other reason</option>
                      </select>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCancelPrompt(false)}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-300"
                        >
                          Keep Order
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmCancel}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-2xs"
                        >
                          Confirm & Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : isCOD && (
                <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    Samaan pack ho chuka hai. Policy ke hisaab se packed hone ke baad Cash on Delivery order cancel nahi kiya ja sakta.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* RETURN / REFUND REQUEST FOR DELIVERED ORDERS */}
          {isDelivered && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {order.returnRequest ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 space-y-0.5">
                  <span className="font-bold block">
                    Return Request: {order.returnRequest.status.toUpperCase()}
                  </span>
                  <p className="text-[11px]">Reason: {order.returnRequest.reason}</p>
                  <p className="text-[11px] text-slate-600">Refund Amount: ₹{order.returnRequest.refundAmount}</p>
                </div>
              ) : !showReturnPrompt ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Need to return an eligible item?</span>
                  <button
                    type="button"
                    onClick={() => setShowReturnPrompt(true)}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-[#0c831f]" />
                    <span>Request Return / Refund</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Select reason for return/refund:
                  </span>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                  >
                    <option value="Damaged or wrong item delivered">Damaged or wrong item delivered</option>
                    <option value="Quality issue or packaging opened">Quality issue or packaging opened</option>
                    <option value="Expired product">Expired product</option>
                    <option value="Other return reason">Other return reason</option>
                  </select>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReturnPrompt(false)}
                      className="px-2.5 py-1 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReturn}
                      className="rounded-lg bg-[#0c831f] text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-800"
                    >
                      Submit Return Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs (Contact Helpdesk & Review) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onOpenSupport?.(order.orderNumber);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#0c831f]" />
              <span>Need Help or Complaint Regarding this Order?</span>
            </button>

            {isDelivered && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFeedback(order.id);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-98 transition-all shadow-xs"
              >
                <Star className="h-4 w-4 fill-slate-950" />
                <span>Leave Rating & Customer Feedback</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 py-1"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

