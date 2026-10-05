import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  ShieldCheck, 
  LogOut, 
  Edit3, 
  Check, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenAuth
}) => {
  const { user, orders, activeTown, logout, loginWithPhone } = useStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Local Town Customer');
  const [editPhone, setEditPhone] = useState(user?.phone || '9876543210');
  const [editEmail, setEditEmail] = useState(user?.email || 'customer@apnicart.com');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithPhone(editPhone, editName);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const userOrders = orders.filter(o => !user?.phone || o.phone === user.phone);
  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#0c831f]">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-display text-base">
                Customer Profile
              </h3>
              <p className="text-xs text-slate-500">
                ApniCart Member Account Details
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

        {/* If user is not logged in */}
        {!user ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <UserIcon className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-base font-display">
              You are not signed in
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Sign in with your mobile OTP to manage your orders, delivery addresses and customer perks.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="mt-5 rounded-xl bg-[#0c831f] px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-md"
            >
              Sign In with Mobile OTP
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            
            {/* User Avatar & Badge */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-[#0c831f] font-semibold">
                    <Sparkles className="h-3 w-3" />
                    <span>ApniCart Verified Customer</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#0c831f]" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {/* Saved Notification */}
            {isSaved && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-center text-xs font-bold text-[#0c831f] flex items-center justify-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            {/* Profile Info Details or Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono focus:border-[#0c831f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0c831f] py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-md"
                >
                  Save Profile Changes
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Phone Number</span>
                    <span className="font-mono font-bold text-slate-900">{user.phone || '+91 98765 43210'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                    <span className="font-medium text-slate-900">{user.email || 'customer@apnicart.com'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                  <MapPin className="h-4 w-4 text-[#0c831f]" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Primary Town Address</span>
                    <span className="font-medium text-slate-900">
                      {user.addresses?.[0]?.flat ? `${user.addresses[0].flat}, ` : ''}{activeTown.name}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="pt-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center flex items-center justify-between px-5">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">My Activity</span>
                  <span className="text-xs font-bold text-slate-700">Total Orders Placed</span>
                </div>
                <span className="font-mono text-2xl font-black text-slate-900">
                  {orders.length}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-[#0c831f]" />
                  <span>My Orders & Live Tracking</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out from Device</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
