import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  ShoppingBag, 
  MessageCircle,
  HelpCircle,
  Share2,
  Percent,
  CheckCircle2,
  LocateFixed,
  Radio,
  Map as MapIcon,
  Compass
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Product, CategoryType, Order, TownArea } from './types';
import { TOWN_AREAS } from './data/mockProducts';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerFeedbackModal } from './components/CustomerFeedbackModal';
import { LocationModal } from './components/LocationModal';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrdersView } from './components/OrdersView';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutGatewayModal } from './components/CheckoutGatewayModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { ContactSupportModal } from './components/ContactSupportModal';
function StorefrontApp() {
  const { 
    products, 
    categories,
    cart, 
    feedbacks,
    activeTown, 
    setActiveTown,
    setCustomLocation,
    activeView, 
    setActiveView, 
    selectedOrderForTracking, 
    setSelectedOrderForTracking,
    addToCart,
    storeSettings,
    coupons
  } = useStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Homepage GPS Live Location state
  const [isHomeLocatingGPS, setIsHomeLocatingGPS] = useState(false);
  const [homeGpsMsg, setHomeGpsMsg] = useState<string | null>(null);

  // Live Location Detection Handler for Homepage Map Section
  const handleHomeDetectLiveLocation = () => {
    setIsHomeLocatingGPS(true);
    setHomeGpsMsg('Connecting to satellite GPS and detecting local village in PIN 285201...');

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const latFormatted = lat.toFixed(4);
          const lonFormatted = lon.toFixed(4);

          const liveTown: TownArea = {
            id: `gps-home-${Date.now()}`,
            name: `Live Location (${latFormatted}°N, ${lonFormatted}°E), Konch (PIN 285201)`,
            cityName: 'Konch Block',
            areaName: `Live Doorstep GPS (${latFormatted}, ${lonFormatted})`,
            pincode: '285201',
            deliveryTimeMin: storeSettings?.deliveryTimeMin || 10,
            distanceKm: '0.4 km',
            isPincode285201: true,
            latitude: lat,
            longitude: lon
          };

          setActiveTown(liveTown);
          setIsHomeLocatingGPS(false);
          setHomeGpsMsg(`✓ Live Location Set: ${liveTown.name}`);
          setTimeout(() => setHomeGpsMsg(null), 4000);
        },
        (err) => {
          console.warn('GPS fallback:', err);
          const fallbackTown: TownArea = {
            id: `gps-hub-${Date.now()}`,
            name: 'Live Location, Konch Center Hub (PIN 285201)',
            cityName: 'Konch',
            areaName: 'Konch Hub',
            pincode: '285201',
            deliveryTimeMin: storeSettings?.deliveryTimeMin || 10,
            distanceKm: '0.6 km',
            isPincode285201: true
          };
          setActiveTown(fallbackTown);
          setIsHomeLocatingGPS(false);
          setHomeGpsMsg('✓ Live Location set to Konch Hub (PIN 285201)');
          setTimeout(() => setHomeGpsMsg(null), 4000);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsHomeLocatingGPS(false);
      setCustomLocation('Konch', 'Live Doorstep Area (PIN 285201)');
      setHomeGpsMsg('✓ Live Location set to Konch Area (PIN 285201)');
      setTimeout(() => setHomeGpsMsg(null), 3000);
    }
  };

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | undefined>(undefined);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportDefaultOrderId, setSupportDefaultOrderId] = useState<string | undefined>(undefined);

  const trendingKeywords = ['Atta', 'Amul Milk', 'Maggi', 'Dolo 650', 'Mustard Oil', 'Cold Drinks', 'Cables', 'Paneer'];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(product.hindiName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const dairyProduce = useMemo(() => products.filter(p => p.category === 'dairy'), [products]);

  // Cart summary
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleOpenFeedbackModal = (orderId?: string) => {
    setFeedbackOrderId(orderId);
    setIsFeedbackOpen(true);
  };

  const handleOpenSupportModal = (orderId?: string) => {
    setSupportDefaultOrderId(orderId);
    setIsSupportOpen(true);
  };

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `⚡ ApniCart se 10 minute me grocery, doodh, snacks aur medicines mangwayein! Free delivery in our town: ${typeof window !== 'undefined' ? window.location.origin : ''}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // If Admin View is active (via secret route)
  if (activeView === 'admin') {
    return <AdminPortal />;
  }

  // If Orders View is active
  if (activeView === 'orders') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] overflow-x-hidden">
        <Navbar
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenLocation={() => setIsLocationOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenFeedback={() => handleOpenFeedbackModal()}
          onOpenSupport={() => handleOpenSupportModal()}
        />
        <OrdersView
          onTrackOrder={(order) => setSelectedOrderForTracking(order)}
          onOpenFeedback={(orderId) => handleOpenFeedbackModal(orderId)}
          onOpenSupport={(orderId) => handleOpenSupportModal(orderId)}
        />
        <OrderTrackingModal
          order={selectedOrderForTracking}
          onClose={() => setSelectedOrderForTracking(null)}
          onOpenFeedback={(orderId) => handleOpenFeedbackModal(orderId)}
          onOpenSupport={(orderId) => handleOpenSupportModal(orderId)}
        />
        <CustomerFeedbackModal
          isOpen={isFeedbackOpen}
          orderId={feedbackOrderId}
          onClose={() => setIsFeedbackOpen(false)}
        />
        <ContactSupportModal
          isOpen={isSupportOpen}
          defaultOrderId={supportDefaultOrderId}
          onClose={() => setIsSupportOpen(false)}
        />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
        <NotificationModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <CustomerProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onOpenOrders={() => setIsProfileOpen(false)}
          onOpenAuth={() => {
            setIsProfileOpen(false);
            setIsAuthOpen(true);
          }}
        />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onProceedToPay={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          onOpenLocation={() => {
            setIsCartOpen(false);
            setIsLocationOpen(true);
          }}
        />
        <CheckoutGatewayModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={(order) => {
            setSelectedOrderForTracking(order);
          }}
          onOpenLocation={() => {
            setIsCheckoutOpen(false);
            setIsLocationOpen(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-amber-400 overflow-x-hidden">
      
      {/* 3-Zone Clean Header */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenFeedback={() => handleOpenFeedbackModal()}
        onOpenSupport={() => handleOpenSupportModal()}
      />

      {/* Main Storefront Area */}
      <main className="flex-1 pb-24">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-400/15 via-emerald-400/10 to-transparent pt-5 sm:pt-6 pb-6 sm:pb-8 border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0c831f]">
                <span className="flex h-2 w-2 rounded-full bg-[#0c831f] animate-ping" />
                <span>{storeSettings?.deliveryTimeMin || 10}-Minute Dark Store Delivery · Live in Your Town</span>
              </div>
              
              <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-4xl font-display text-balance">
                Groceries, Fresh Dairy, Snacks, Medicines & Electronics.
              </h1>
              
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                Superfast {storeSettings?.deliveryTimeMin || 10}-minute doorstep delivery for everyday essentials in {activeTown.name}.
              </p>

              {/* Search Bar with Instant Autocomplete */}
              <div className="mt-3.5 relative max-w-xl z-30">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    placeholder="Search 'Atta', 'Amul Milk', 'Dolo 650', 'Cables'..."
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-xs sm:text-sm shadow-xs transition-all focus:border-[#0c831f] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchFocused(false);
                      }}
                      className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                    <div className="mb-2 pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Trending Searches
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {trendingKeywords.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onMouseDown={() => {
                              setSearchQuery(kw);
                              setIsSearchFocused(false);
                            }}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#0c831f]"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Matching Products ({filteredProducts.slice(0, 5).length})</span>
                        <button
                          type="button"
                          onMouseDown={() => setIsSearchFocused(false)}
                          className="text-slate-500 hover:underline"
                        >
                          Close
                        </button>
                      </div>

                      <div className="space-y-1 max-h-52 overflow-y-auto">
                        {filteredProducts.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50"
                          >
                            <div 
                              onMouseDown={() => {
                                setSelectedProductForDetail(item);
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center gap-2.5 flex-1 cursor-pointer pr-2"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-9 w-9 rounded-lg object-contain bg-slate-50 p-0.5 border"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h5>
                                <span className="text-[10px] text-slate-500">{item.weight} · <strong className="text-slate-900 font-mono">₹{item.price}</strong></span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onMouseDown={() => {
                                addToCart(item);
                                setIsSearchFocused(false);
                              }}
                              className="rounded-lg bg-[#0c831f] px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-800 shadow-2xs shrink-0"
                            >
                              + ADD
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Delivery Info Strip */}
              <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-[#0c831f] shrink-0" />
                  Delivering to: <strong className="text-slate-900">{activeTown.name}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <strong>~{storeSettings?.deliveryTimeMin || 10} mins ETA</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  Razorpay & UPI
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* WhatsApp Viral Referral Banner */}
        <section className="bg-emerald-600 text-white py-2 px-3 sm:px-6">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                📢 <strong>Apne dosto aur rishtedaaro ko WhatsApp par share karein!</strong> ApniCart 10 minute delivery town me live hai.
              </span>
            </div>
            <button
              onClick={handleShareOnWhatsApp}
              className="flex items-center gap-1.5 rounded-xl bg-white text-emerald-950 px-3 py-1 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs shrink-0"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
              <span>Share on WhatsApp 📲</span>
            </button>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="sticky top-16 z-20 border-y border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#0c831f] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display">
                {selectedCategory === 'all' 
                  ? 'All Items for 10-Minute Delivery' 
                  : categories.find(c => c.id === selectedCategory)?.label || 'Category Items'}
              </h2>
              <p className="text-xs text-slate-500">
                {filteredProducts.length} items in local dark store
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 my-6 bg-white">
              <ShoppingBag className="mx-auto h-10 w-10 opacity-40 mb-2" />
              <p className="font-semibold text-xs">No products found matching your search.</p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProductForDetail(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Daily Dairy Spotlight */}
        {selectedCategory === 'all' && !searchQuery && (
          <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  Daily Dairy & Breakfast Essentials
                </h3>
                <p className="text-xs text-slate-500">
                  Fresh milk, paneer, and dahi delivered in 9 minutes
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory('dairy')}
                className="text-xs font-bold text-[#0c831f] hover:underline"
              >
                View Dairy →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-5">
              {dairyProduce.slice(0, 5).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setSelectedProductForDetail(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Customer Feedbacks */}
        <section className="bg-slate-100/70 py-10 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>Town Customer Reviews & Ratings</span>
                </div>
                <h3 className="mt-1 text-lg sm:text-xl font-bold text-slate-900 font-display">
                  Loved by Local Residents Across All Mohallas
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenFeedbackModal()}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-xs"
                >
                  <Star className="h-3.5 w-3.5 fill-slate-950" />
                  <span>Write Review</span>
                </button>

                <button
                  onClick={() => handleOpenSupportModal()}
                  className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-[#0c831f]" />
                  <span>Complaint / Help</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {feedbacks.slice(0, 4).map((fb) => (
                <div
                  key={fb.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {fb.customerName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {fb.townArea}
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    "{fb.comment}"
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ================= 10-MINUTE COVERAGE MAP & PIN 285201 VILLAGES SECTION ================= */}
        <section className="bg-white py-10 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0c831f]">
                  <MapIcon className="h-4 w-4" />
                  <span>PINCODE 285201 Konch & Surrounding Rural Network</span>
                </div>
                <h3 className="mt-1 text-lg sm:text-2xl font-black text-slate-900 font-display">
                  10-Minute Dark Store Delivery Map & Village Coverage
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Konch town aur aas-paas ke sabhi 30+ gaon (PIN 285201) me superfast doorstep delivery.
                </p>
              </div>

              {/* CURRENT LIVE LOCATION BUTTON (PROMINENT ON MAP SECTION) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleHomeDetectLiveLocation}
                  disabled={isHomeLocatingGPS}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#0c831f] hover:bg-emerald-800 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-md active:scale-98 transition-all"
                >
                  {isHomeLocatingGPS ? (
                    <Radio className="h-4 w-4 animate-pulse" />
                  ) : (
                    <LocateFixed className="h-4 w-4" />
                  )}
                  <span>📍 Use Current Live Location (GPS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLocationOpen(true)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 text-xs font-bold border border-slate-200"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Choose Another Village</span>
                </button>
              </div>
            </div>

            {homeGpsMsg && (
              <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-950 flex items-center justify-center gap-2 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-[#0c831f]" />
                <span>{homeGpsMsg}</span>
              </div>
            )}

            {/* Visual Radar & Village Grid */}
            <div className="rounded-3xl border border-slate-200 bg-slate-950 text-white p-5 sm:p-7 shadow-xl space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block">
                      Active Delivery Center
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white">
                      Konch Central Dark Store Hub · Serving Entire PIN 285201 Area
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span>Currently Delivering To:</span>
                  <span className="text-[#25D366] bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 rounded-xl">
                    ⚡ {activeTown.name} ({activeTown.deliveryTimeMin || 10} Mins)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2.5">
                  Select Your Nearby Village / Mohalla (Click to Set Live Location):
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                  {TOWN_AREAS.filter(v => v.isPincode285201).map(loc => {
                    const isSelected = activeTown.id === loc.id || activeTown.name.includes(loc.areaName || '');
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setActiveTown(loc);
                          setHomeGpsMsg(`✓ Location Set: ${loc.name}`);
                          setTimeout(() => setHomeGpsMsg(null), 3500);
                        }}
                        className={`p-2.5 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-[#0c831f] text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/50'
                            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-emerald-500 hover:bg-slate-800/90'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold truncate block">{loc.areaName || loc.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${isSelected ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-800 text-slate-400'}`}>
                            285201
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{loc.distanceKm || '1 km'}</span>
                          <span className="text-emerald-400 font-bold">⚡ {loc.deliveryTimeMin || 10}m</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>⚡ 10-Minute guaranteed delivery via local dark store fleet network</span>
                <span>📌 Pincode: <strong>285201 (Konch Tehsil & All Surrounding Villages)</strong></span>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Floating Sticky Mobile Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between rounded-2xl bg-[#0c831f] px-4 py-3 text-white shadow-xl active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-800 font-mono text-xs font-bold">
                {totalCartCount}
              </div>
              <div className="text-left">
                <span className="font-mono text-sm font-extrabold block">
                  ₹{cartSubtotal}
                </span>
                <span className="text-[10px] text-emerald-100">
                  ⚡ 10 mins to {activeTown.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold">
              <span>View Cart & Pay</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Floating WhatsApp Action Pill for Quick Sharing */}
      <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-30">
        <button
          onClick={handleShareOnWhatsApp}
          className="flex items-center gap-2 rounded-full bg-[#25D366] text-white px-3.5 py-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all"
          title="Share ApniCart on WhatsApp"
        >
          <MessageCircle className="h-5 w-5 fill-white text-[#25D366]" />
          <span className="text-xs font-bold hidden md:inline">Share on WhatsApp</span>
        </button>
      </div>

      {/* Blinkit-style Footer */}
      <Footer />

      {/* All Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToPay={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onOpenLocation={() => {
          setIsCartOpen(false);
          setIsLocationOpen(true);
        }}
      />

      <CheckoutGatewayModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          setSelectedOrderForTracking(order);
        }}
        onOpenLocation={() => {
          setIsCheckoutOpen(false);
          setIsLocationOpen(true);
        }}
      />

      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenOrders={() => {
          setIsProfileOpen(false);
          setActiveView('orders');
        }}
        onOpenAuth={() => {
          setIsProfileOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <OrderTrackingModal
        order={selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        onOpenFeedback={(orderId) => handleOpenFeedbackModal(orderId)}
        onOpenSupport={(orderId) => handleOpenSupportModal(orderId)}
      />

      <CustomerFeedbackModal
        isOpen={isFeedbackOpen}
        orderId={feedbackOrderId}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <ContactSupportModal
        isOpen={isSupportOpen}
        defaultOrderId={supportDefaultOrderId}
        onClose={() => setIsSupportOpen(false)}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-800">
          <div className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold font-display text-emerald-600 mb-2">ApniCart Store</h2>
            <p className="text-sm text-slate-600 mb-4">
              Website ko restore karne ke liye neeche diye button par click karein.
            </p>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('tb_products');
                  localStorage.removeItem('tb_cart');
                  localStorage.removeItem('tb_orders');
                } catch {}
                window.location.hash = '';
                window.location.reload();
              }}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
            >
              Reset & Reload Website
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <StorefrontApp />
      </StoreProvider>
    </ErrorBoundary>
  );
}

