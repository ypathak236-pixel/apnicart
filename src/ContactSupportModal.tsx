import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  FileQuestion,
  Send,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerComplaint } from '../types';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId
}) => {
  const { user, orders, storeSettings, submitComplaint } = useStore();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [orderId, setOrderId] = useState(defaultOrderId || (orders[0]?.orderNumber ?? ''));
  const [issueType, setIssueType] = useState<CustomerComplaint['issueType']>('wrong_item');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<CustomerComplaint | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !message.trim()) {
      setErrorMsg('Please fill in your name, phone number, and issue details.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const ticket = submitComplaint({
      customerName: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim() || undefined,
      orderId: orderId.trim() || undefined,
      issueType,
      message: message.trim()
    });

    setSubmittedTicket(ticket);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-4 bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0c831f] text-white shrink-0 shadow-xs">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-display text-base">
                Contact Us & Customer Support
              </h3>
              <p className="text-xs text-slate-500">
                10-Minute Dark Store Town Helpdesk
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmittedTicket(null);
              onClose();
            }}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Quick Direct Contact Action Cards (Dynamic from Admin Portal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={`tel:${storeSettings.supportPhone}`}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0c831f] shadow-2xs group-hover:scale-105 transition-transform">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Helpline Number</span>
                <span className="text-xs font-mono font-bold text-slate-900 truncate block">
                  {storeSettings.supportPhone}
                </span>
              </div>
            </a>

            <a
              href={`https://wa.me/${storeSettings.supportWhatsapp}?text=Hello%20ApniCart%20Support%2C%20I%20need%20help%20with%20my%20order.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-colors group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">WhatsApp Support</span>
                <span className="text-xs font-bold text-emerald-950 truncate block">
                  Chat with Dark Store
                </span>
              </div>
            </a>
          </div>

          {/* Store Address & Hours Info Card */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#0c831f] shrink-0 mt-0.5" />
              <span><strong>Dark Store:</strong> {storeSettings.storeAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span><strong>Support Email:</strong> {storeSettings.supportEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span><strong>Store Hours:</strong> {storeSettings.operatingHours}</span>
            </div>
          </div>

          {/* Complaint Submission Form / Ticket Confirmation */}
          {submittedTicket ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#0c831f]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-display">
                Grievance Registered: #{submittedTicket.ticketNumber}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aapki complaint store manager ko forward ho gayi hai. Hamara customer care rider aapse +91 {submittedTicket.phone} par turant sampark karega.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                className="mt-3 rounded-xl bg-[#0c831f] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileQuestion className="h-3.5 w-3.5 text-[#0c831f]" />
                  <span>Register an Issue or Complaint</span>
                </h4>
                <span className="text-[10px] text-slate-400">Response within 15 mins</span>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Problem Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What issue are you facing? *
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-[#0c831f] focus:outline-none"
                >
                  <option value="wrong_item">❌ Wrong product delivered (Mangaya kuch aur tha, nikla kuch aur)</option>
                  <option value="missing_item">📦 Product missing from delivery bag</option>
                  <option value="quality_issue">⚠️ Damaged / Quality / Expiry issue</option>
                  <option value="delayed_delivery">⏳ Delivery delayed past 15 minutes</option>
                  <option value="payment_refund">💳 Payment deducted but order issue / Refund</option>
                  <option value="other">💬 Other inquiry or feedback</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono focus:border-[#0c831f] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. TB-9021"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:border-[#0c831f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#0c831f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe what went wrong *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Batayein kya dikkat hui (e.g. doodh ka packet phata hua nikla, ya rider ne galat item diya)..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-[#0c831f] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0c831f] hover:bg-emerald-800 text-white font-bold py-3 text-xs shadow-md active:scale-98 transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Submit Complaint to Store Manager</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
