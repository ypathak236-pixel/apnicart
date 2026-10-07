import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Info
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '..../types';

interface OrdersViewProps {
  onTrackOrder: (order: Order) => void;
  onOpenFeedback: (orderId: string) => void;
  onOpenSupport?: (orderId?: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ 
  onTrackOrder, 
  onOpenFeedback,
  onOpenSupport
}) => {
  const { orders, setActiveView, cancelOrder, requestReturnRefund } = useStore();
  const [activeActionMsg, setActiveActionMsg] = useState<{ id: string; text: string } | null>(null);

  const handleCancelClick = (order: Order) => {
    const isOut = order.status === 'out_for_delivery' || order.status === 'near_doorstep';
    const confirmPrompt = isOut && order.paymentMethod !== 'cod'
      ? `Rider is already on the way! If you cancel now, ₹24 rider mobilization fee will be deducted and ₹${Math.max(0, order.total - 24)} will be refunded. Do you want to cancel?`
      : `Are you sure you want to cancel Order #${order.orderNumber}?`;

    if (window.confirm(confirmPrompt)) {
      const res = cancelOrder(order.id, 'Cancelled by customer from My Orders');
      setActiveActionMsg({ id: order.id, text: res.message });
      setTimeout(() => setActiveActionMsg(null), 5000);
    }
  };

  const handleReturnClick = (order: Order) => {
    const reason = window.prompt('Please enter the reason for return/refund:');
    if (reason && reason.trim()) {
      const res = requestReturnRefund(order.id, reason.trim());
      setActiveActionMsg({ id: order.id, text: res.message });
      setTimeout(() => setActiveActionMsg(null), 5000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Store</span>
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display">
              My Orders & Live Tracking
            </h2>
            <p className="text-xs text-slate-500">
              Track 10-minute doorstep deliveries in real-time
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {orders.length} Total Orders
        </span>
      </div>

      {/* Orders List */}
      <div className="mt-5 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-10 sm:p-12 text-center text-slate-500 bg-white">
            <ShoppingBag className="mx-auto h-12 w-12 stroke-1 opacity-50 mb-2" />
            <h3 className="font-semibold text-slate-800">
              No orders placed yet
            </h3>
            <p className="text-xs mt-1">
              Start shopping from our catalog for 10-minute lightning delivery.
            </p>
            <button
              onClick={() => setActiveView('store')}
              className="mt-4 rounded-xl bg-[#0c831f] px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
            >
              Browse Products
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isCOD = order.paymentMethod === 'cod';

            // Cancellation rules
            const canCancelCOD = isCOD && (order.status === 'received' || order.status === 'confirmed');
            const canCancelOnline = !isCOD && !isDelivered && !isCancelled;
            const canCancel = isCOD ? canCancelCOD : canCancelOnline;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs"
              >
                <div className="border-b border-slate-100 bg-slate-50/80 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="font-mono text-sm font-extrabold text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      {order.date} · {order.townArea}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      isDelivered 
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : order.status === 'out_for_delivery'
                            ? 'bg-purple-100 text-purple-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {/* Status Action Banner if triggered */}
                  {activeActionMsg && activeActionMsg.id === order.id && (
                    <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-900">
                      {activeActionMsg.text}
                    </div>
                  )}

                  {/* Return Request or Cancellation note */}
                  {order.returnRequest && (
                    <div className="mb-3 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                      <strong>Return Request Status:</strong> {order.returnRequest.status.toUpperCase()} ({order.returnRequest.reason})
                    </div>
                  )}

                  {isCancelled && order.cancellationDetails && (
                    <div className="mb-3 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-900">
                      <strong>Cancellation Note:</strong> {order.cancellationDetails.reason} 
                      {order.cancellationDetails.cancellationFeeDeducted > 0 && ` (₹${order.cancellationDetails.cancellationFeeDeducted} fee deducted, ₹${order.cancellationDetails.refundAmount} refunded)`}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1">
                        Delivery Destination
                      </h4>
                      <p className="text-xs text-slate-900 font-semibold">
                        {order.customerName} (📞 {order.phone})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.address}
                      </p>
                      {order.landmark && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Landmark: {order.landmark}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1">
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-1 text-xs text-slate-600">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate pr-2">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="font-mono tabular-nums shrink-0 font-bold">
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Payment details */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Total: </span>
                        <span className="font-mono text-base font-bold text-slate-900">
                          ₹{order.total}
                        </span>
                      </div>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 uppercase font-semibold">
                        {order.paymentMethod}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isCancelled && (
                        <button
                          onClick={() => onTrackOrder(order)}
                          className="flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 active:scale-95 transition-all shadow-xs"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Track Rider</span>
                        </button>
                      )}

                      {/* Cancel Order Button adhering to rules */}
                      {canCancel && (
                        <button
                          onClick={() => handleCancelClick(order)}
                          className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Return / Refund button */}
                      {isDelivered && !order.returnRequest && (
                        <button
                          onClick={() => handleReturnClick(order)}
                          className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-[#0c831f]" />
                          <span>Return / Refund</span>
                        </button>
                      )}

                      {/* Review Button */}
                      {isDelivered && (
                        <button
                          onClick={() => onOpenFeedback(order.id)}
                          className="flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>Rate Order</span>
                        </button>
                      )}

                      {/* Help Button */}
                      <button
                        onClick={() => onOpenSupport?.(order.orderNumber)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        title="Help / Complaint regarding this order"
                      >
                        Help
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

