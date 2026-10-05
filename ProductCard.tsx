import React, { useState } from 'react';
import { Plus, Minus, Star, ShoppingBag, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getProductMinQuantity } from '../data/mockProducts';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { cart, addToCart, updateCartQuantity, storeSettings } = useStore();
  const [imageError, setImageError] = useState(false);

  const cartItem = cart.find(item => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const photoCount = product.images && product.images.length > 0 ? product.images.length : 1;
  const minQty = getProductMinQuantity(product.price);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
      
      {/* Product Image Container */}
      <div 
        onClick={() => onQuickView?.(product)}
        className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-slate-100/70 flex items-center justify-center"
      >
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3">
            <ShoppingBag className="h-10 w-10 text-slate-300 mb-2 stroke-1" />
            <span className="text-xs font-semibold text-slate-600 line-clamp-2">
              {product.name}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-[#0c831f] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Multi-Photo Indicator Badge */}
        {photoCount > 1 && (
          <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
            <span>📷 {photoCount} photos</span>
          </div>
        )}

        {/* Delivery Time Tag */}
        <div className="absolute bottom-2 left-2 bg-white/95 text-[10px] font-bold text-slate-800 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
          <span>{storeSettings?.deliveryTimeMin || 10} MINS</span>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          {/* Pack size, rating, and min qty notice */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700">{product.weight}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-400" />
              {product.rating}
            </span>
            <span className="text-[11px] text-slate-400">({product.reviewsCount})</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onQuickView?.(product)}
            className="mt-1 text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-emerald-700"
          >
            {product.name}
          </h3>

          {/* Minimum Quantity / Return Tags */}
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            {minQty > 1 && (
              <span className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                Min. {minQty} units required
              </span>
            )}
            {product.isReturnable ? (
              <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-0.5">
                <RefreshCw className="h-2.5 w-2.5" /> Returnable
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">
                Non-returnable
              </span>
            )}
          </div>
        </div>

        {/* Price, Stock and Actions Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-100">
          {/* Stock remaining indicator */}
          <div className="mb-1.5 text-[11px]">
            {isOutOfStock ? (
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <AlertCircle className="h-3 w-3" /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Only {product.stock} left!
              </span>
            ) : (
              <span className="text-slate-400">
                {product.stock} in stock
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1.5">
            {/* Price */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                  ₹{product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Add / Stepper Button */}
            <div>
              {isOutOfStock ? (
                <button
                  disabled
                  className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                >
                  Sold Out
                </button>
              ) : currentQuantity === 0 ? (
                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-1 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{minQty > 1 ? `ADD (${minQty})` : 'ADD'}</span>
                </button>
              ) : (
                <div className="flex items-center rounded-xl bg-[#0c831f] text-white shadow-sm">
                  <button
                    onClick={() => updateCartQuantity(product.id, -1)}
                    aria-label="Decrease quantity"
                    className="p-1.5 hover:bg-emerald-800 rounded-l-xl transition-colors active:scale-90"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[22px] text-center font-mono tabular-nums text-xs font-bold px-1">
                    {currentQuantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(product.id, 1)}
                    aria-label="Increase quantity"
                    className="p-1.5 hover:bg-emerald-800 rounded-r-xl transition-colors active:scale-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
