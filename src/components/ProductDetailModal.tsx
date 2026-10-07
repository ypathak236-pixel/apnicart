import React, { useState } from 'react';
import { X, Star, Plus, Minus, ShoppingBag, Zap, ArrowRight, RefreshCw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Product } from '..../types';
import { useStore } from '../context/StoreContext';
import { getProductMinQuantity } from '../data/mockProducts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCart
}) => {
  const { cart, addToCart, updateCartQuantity, activeTown, storeSettings } = useStore();
  const [imageError, setImageError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const currentDisplayImage = productImages[activeImageIndex] || product.image;

  const cartItem = cart.find(i => i.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const minQty = getProductMinQuantity(product.price);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleOpenCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    onOpenCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image Column */}
          <div className="relative flex flex-col items-center justify-between bg-[#F8F9FA] p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-100">
            
            <div className="relative w-full aspect-square flex items-center justify-center">
              {!imageError ? (
                <img
                  src={currentDisplayImage}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  referrerPolicy="no-referrer"
                  className="max-h-52 w-full object-contain transition-all duration-200"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <ShoppingBag className="h-12 w-12 stroke-1 mb-2" />
                  <span className="text-xs font-semibold">{product.name}</span>
                </div>
              )}

              {discountPercent > 0 && (
                <div className="absolute top-0 left-0 rounded-md bg-[#0c831f] px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                  {discountPercent}% OFF
                </div>
              )}

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow-sm hover:bg-white text-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow-sm hover:bg-white text-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="mt-3 flex items-center gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-11 w-11 rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-white ${
                      activeImageIndex === idx 
                        ? 'border-[#0c831f] shadow-xs scale-105' 
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Photo ${idx + 1}`} 
                      className="h-full w-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Details Column */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                <span className="font-semibold text-slate-700 uppercase tracking-wider">
                  {product.category}
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5 font-bold text-amber-500">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {product.rating}
                </span>
                <span>({product.reviewsCount})</span>
              </div>

              <h2 className="mt-1.5 text-base font-bold text-slate-900 leading-snug font-display">
                {product.name}
              </h2>

              <div className="mt-2 text-xs font-medium text-slate-600">
                Net Quantity: <span className="font-bold text-slate-800">{product.weight}</span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                {product.description}
              </p>

              {/* Min Quantity & Return badges */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {minQty > 1 && (
                  <span className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    ⚡ Minimum {minQty} quantity required for ₹{product.price}
                  </span>
                )}
                {product.isReturnable ? (
                  <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Return & Refund Eligible
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Non-Returnable (Perishable/Fresh Stock)
                  </span>
                )}
              </div>

              {/* Stock status indicator */}
              <div className="mt-3 rounded-2xl bg-slate-50 p-2.5 text-xs border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Warehouse Stock:</span>
                  {isOutOfStock ? (
                    <span className="font-bold text-rose-600">Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="font-bold text-amber-600">
                      ⚡ Only {product.stock} units left!
                    </span>
                  ) : (
                    <span className="font-bold text-[#0c831f]">
                      ✓ In Stock ({product.stock} left)
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                  <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span>Delivers in ~{storeSettings?.deliveryTimeMin || 10} mins to {activeTown.name}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-4 border-t border-slate-100 pt-3 space-y-2.5">
              
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-black text-slate-900 tabular-nums">
                      ₹{product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {isOutOfStock ? (
                    <span className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400">
                      Sold Out
                    </span>
                  ) : currentQuantity === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-1 rounded-xl bg-[#0c831f] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{minQty > 1 ? `ADD (${minQty} Units)` : 'ADD ITEM'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center rounded-xl bg-[#0c831f] text-white shadow-xs">
                      <button
                        onClick={() => updateCartQuantity(product.id, -1)}
                        className="p-1.5 hover:bg-emerald-800 rounded-l-xl transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[24px] text-center font-mono text-xs font-bold px-1 tabular-nums">
                        {currentQuantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, 1)}
                        className="p-1.5 hover:bg-emerald-800 rounded-r-xl transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenCartClick}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-md active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-amber-400" />
                    <span>View Cart ({cart.reduce((s, i) => s + i.quantity, 0)} Items)</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span>Checkout & Pay</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              )}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

