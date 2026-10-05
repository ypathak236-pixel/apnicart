import React from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Bell, 
  User as UserIcon, 
  ChevronDown,
  Sparkles,
  Share2,
  HelpCircle,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenLocation: () => void;
  onOpenNotifications: () => void;
  onOpenFeedback: () => void;
  onOpenSupport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenAuth,
  onOpenProfile,
  onOpenLocation,
  onOpenNotifications,
  onOpenFeedback,
  onOpenSupport
}) => {
  const { 
    cart, 
    user, 
    activeTown, 
    activeView, 
    setActiveView, 
    unreadNotificationCount,
    orders,
    storeSettings,
    refreshStore
  } = useStore();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // WhatsApp Share handler
  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `⚡ ApniCart se 10 minute me grocery, doodh, paneer aur medicines ghar par mangwayein! Free delivery available in our town: ${typeof window !== 'undefined' ? window.location.origin : ''}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Wordmark (ApniCart) & Town Location Selector */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button 
            onClick={() => setActiveView('store')}
            className="flex items-center gap-1 text-left group"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-500 font-display">
              Apni<span className="text-[#0c831f]">Cart</span>
            </span>
          </button>

          {/* Location Selector Pill */}
          <button
            onClick={onOpenLocation}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100/90 border border-slate-200/60 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-[#0c831f] shrink-0" />
            <span className="max-w-[130px] lg:max-w-[170px] truncate">{activeTown.name}</span>
            <span className="text-[11px] font-bold text-[#0c831f] shrink-0">
              ⚡ {storeSettings?.deliveryTimeMin || 10}m
            </span>
            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
          </button>
        </div>

        {/* Zone 2: Navigation Links (Completely Customer-Facing, NO ADMIN LINK) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => setActiveView('store')}
            className={`hover:text-[#0c831f] transition-colors ${
              activeView === 'store' ? 'text-[#0c831f] font-bold' : ''
            }`}
          >
            Store Catalog
          </button>

          <button
            onClick={() => setActiveView('orders')}
            className={`relative hover:text-[#0c831f] transition-colors ${
              activeView === 'orders' ? 'text-[#0c831f] font-bold' : ''
            }`}
          >
            Orders & Tracking
            {orders.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-800">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={onOpenFeedback}
            className="hover:text-[#0c831f] transition-colors"
          >
            Customer Reviews
          </button>

          <button
            onClick={onOpenSupport}
            className="flex items-center gap-1 hover:text-[#0c831f] transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            <span>Contact & Complaints</span>
          </button>
        </nav>

        {/* Zone 3: Actions (WhatsApp Share Button, Notifications, User, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Prominent WhatsApp Share Button */}
          <button
            onClick={handleShareOnWhatsApp}
            title="Share ApniCart on WhatsApp with friends & family"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-2xs active:scale-95"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0 fill-emerald-100" />
            <span className="hidden sm:inline">Share on WhatsApp</span>
            <span className="sm:hidden">Share</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            aria-label="Push notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-4 sm:h-5 w-4 sm:w-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Live Sync Button */}
          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshStore();
              setTimeout(() => setIsRefreshing(false), 600);
            }}
            title="Instant Live Sync with Admin Portal changes"
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Fast sync store"
          >
            <RefreshCw className={`h-4 sm:h-5 w-4 sm:w-5 text-[#0c831f] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* User profile / Login */}
          <button
            onClick={() => user ? (onOpenProfile ? onOpenProfile() : onOpenAuth()) : onOpenAuth()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-4 sm:h-5 w-4 sm:w-5 rounded-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="h-4 w-4 text-slate-500" />
            )}
            <span className="hidden sm:inline max-w-[80px] truncate">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Primary Cart CTA */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-3 sm:px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-all active:scale-95 whitespace-nowrap"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] sm:text-[10px] font-black text-slate-950">
                  {totalCartCount}
                </span>
              )}
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] sm:text-[11px] font-medium opacity-90 hidden sm:inline">
                {totalCartCount > 0 ? `${totalCartCount} items` : 'My Cart'}
              </span>
              <span className="font-mono tabular-nums text-xs font-bold">
                ₹{cartSubtotal}
              </span>
            </div>
          </button>
        </div>

      </div>

      {/* Mobile Sub-strip (Town name + Support shortcut) */}
      <div className="flex sm:hidden items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
        <button 
          onClick={onOpenLocation} 
          className="flex items-center gap-1.5 truncate text-left max-w-[65%]"
        >
          <MapPin className="h-3 w-3 text-[#0c831f] shrink-0" />
          <span className="truncate">{activeTown.name}</span>
          <span className="font-bold text-[#0c831f] shrink-0">⚡ {storeSettings?.deliveryTimeMin || 10}m</span>
        </button>

        <button 
          onClick={onOpenSupport}
          className="font-bold text-emerald-800 flex items-center gap-0.5 text-[11px] bg-white border border-emerald-200 px-2 py-0.5 rounded-lg"
        >
          <HelpCircle className="h-3 w-3 text-[#0c831f]" />
          <span>Help</span>
        </button>
      </div>
    </header>
  );
};
