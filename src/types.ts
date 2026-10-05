export type CategoryType = 
  | 'all'
  | 'grocery'
  | 'dairy'
  | 'snacks'
  | 'medicine'
  | 'electronics'
  | 'personal_care'
  | string;

export interface CategoryInfo {
  id: string;
  label: string;
  iconName?: string;
  tagline?: string;
  badgeColor?: string;
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: CategoryType;
  price: number;
  originalPrice: number;
  weight: string;
  image: string;
  images?: string[];
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewsCount: number;
  description: string;
  accentBg?: string;
  isPopular?: boolean;
  isReturnable?: boolean;
  minQuantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 
  | 'received'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'near_doorstep'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  discount: number;
  appliedCouponCode?: string;
  couponDiscount?: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  townArea: string;
  pincode?: string;
  landmark?: string;
  status: OrderStatus;
  paymentMethod: 'razorpay' | 'cod' | 'upi' | string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
  paymentId?: string;
  deliveryAgentName: string;
  deliveryAgentPhone: string;
  estimatedMinutes: number;
  createdAt: number;
  updatedAt: number;
  cancellationDetails?: {
    cancelledAt: number;
    reason: string;
    refundAmount: number;
    cancellationFeeDeducted: number;
  };
  returnRequest?: {
    requestedAt: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    itemsSummary: string;
    refundAmount: number;
    adminNotes?: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  validUntil: string;
  description: string;
  isActive: boolean;
}

export interface CustomerComplaint {
  id: string;
  ticketNumber: string;
  orderId?: string;
  customerName: string;
  phone: string;
  email?: string;
  issueType: 'wrong_item' | 'missing_item' | 'quality_issue' | 'delayed_delivery' | 'payment_refund' | 'other';
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: number;
  adminResponse?: string;
}

export interface CustomerFeedback {
  id: string;
  orderId?: string;
  customerName: string;
  townArea: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface TownArea {
  id: string;
  name: string;
  cityName?: string;
  areaName?: string;
  pincode?: string;
  deliveryTimeMin: number;
  distanceKm?: string;
  isPincode285201?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  flat: string;
  area: string;
  pincode?: string;
  landmark?: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  addresses?: Address[];
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  isTestMode: boolean;
  merchantUpiId?: string;
  isLiveActive: boolean; // Indicates if live key is configured and active
  lastLinkedAt?: number;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'stock' | 'promo' | 'system';
  read: boolean;
}

export interface StoreSettings {
  deliveryTimeMin: number;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  handlingFee: number;
  promoDiscount: number;
  promoMinOrder: number;
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
  storeAddress: string;
  operatingHours: string;
  primaryPincode: string;
}

export interface AdminCredentials {
  passwordHash: string;
  securityQuestion: string;
  securityAnswer: string;
  recoveryEmail: string;
  failedAttempts: number;
  lockoutUntil: number;
  sessionToken?: string;
}
