import React from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Zap, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setActiveView } = useStore();

  const usefulCol1 = [
    'Blog',
    'Privacy',
    'Terms',
    'FAQs',
    'Security',
    'Contact'
  ];

  const usefulCol2 = [
    'Partner',
    'Franchise',
    'Seller',
    'Warehouse',
    'Deliver',
    'Resources'
  ];

  const usefulCol3 = [
    'Recipes',
    'Bistro',
    'District',
    'ApniCart Ambulance',
    'Community Care'
  ];

  const catCol1 = [
    'Bath & Body',
    'Beauty & Cosmetics',
    'Health & Pharma',
    'Atta, Rice & Dal',
    'Bakery & Biscuits',
    'Kitchenware & Appliances',
    'Drinks & Juices',
    'Sauces & Spreads',
    'Home & Lifestyle',
    'Stationery & Games',
    'Festive Gifts'
  ];

  const catCol2 = [
    'Hair Care',
    'Feminine Hygiene',
    'Sexual Wellness',
    'Oil, Ghee & Masala',
    'Dry Fruits & Cereals',
    'Chips & Namkeen',
    'Tea, Coffee & Milk Drinks',
    'Paan Corner',
    'Cleaners & Repellents',
    'Print Store'
  ];

  const catCol3 = [
    'Skin & Face',
    'Baby Care',
    'Vegetables & Fruits',
    'Dairy, Bread & Eggs',
    'Meat & Fish',
    'Sweets & Chocolates',
    'Instant Food',
    'Ice Creams & More',
    'Electronics',
    'E-Gift Cards'
  ];

  return (
    <footer className="w-full border-t border-slate-200 bg-white pt-12 pb-8 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Useful Links & Categories */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 pb-12 border-b border-slate-100">
          
          {/* Left Column: Useful Links */}
          <div className="lg:col-span-4">
            <h4 className="text-base font-bold text-slate-900 mb-6 font-display">
              Useful Links
            </h4>

            <div className="grid grid-cols-3 gap-4 text-xs leading-relaxed">
              <ul className="space-y-2.5">
                {usefulCol1.map((item, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setActiveView('store')}
                      className="hover:text-emerald-700 transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>

              <ul className="space-y-2.5">
                {usefulCol2.map((item, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setActiveView('store')}
                      className="hover:text-emerald-700 transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>

              <ul className="space-y-2.5">
                {usefulCol3.map((item, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setActiveView('store')}
                      className="hover:text-emerald-700 transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Categories */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <h4 className="text-base font-bold text-slate-900 font-display">
                Categories
              </h4>
              <button 
                onClick={() => setActiveView('store')}
                className="text-xs font-semibold text-[#0c831f] hover:underline"
              >
                see all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed">
              <ul className="space-y-2.5">
                {catCol1.map((item, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setActiveView('store')}
                      className="hover:text-emerald-700 transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>

              <ul className="space-y-2.5">
                {catCol2.map((item, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setActiveView('store')}
                      className="hover:text-emerald-700 transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>

              <ul className="space-y-2.5">
                {catCol3.map((item, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setActiveView('store')}
                      className="hover:text-emerald-700 transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Copyright text */}
          <div className="text-xs text-slate-500 text-center md:text-left">
            <span>© ApniCart Commerce Private Limited, 2016-2026</span>
          </div>

          {/* Web Platform Badge */}
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-2 text-xs text-slate-700 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-[#0c831f] animate-ping" />
            <span className="font-semibold">Web Delivery Platform</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-bold">10-Minute Dark Store Active</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            {/* Facebook */}
            <a
              href="#facebook"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="#twitter"
              aria-label="Twitter / X"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#instagram"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#linkedin"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            {/* Threads */}
            <a
              href="#threads"
              aria-label="Threads"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.64 0 11.97 5.253 12.167 11.89h-2.438c-.2-5.32-4.524-9.528-9.729-9.528-5.393 0-9.778 4.385-9.778 9.778 0 5.394 4.385 9.778 9.778 9.778 3.518 0 6.6-1.859 8.247-4.708l2.128 1.199C20.518 21.684 16.634 24 12.186 24zm4.496-10.02c-.22-.055-.444-.093-.674-.112-1.02-.082-2.12-.036-3.21.137-1.79.284-3.084 1.259-3.084 2.825 0 1.583 1.233 2.653 3.01 2.653 2.167 0 3.754-1.574 3.948-3.921v-1.582zm-4.733 4.093c-1.06 0-1.637-.624-1.637-1.42 0-1.027.91-1.666 2.166-1.865.736-.117 1.472-.16 2.19-.126-.145 1.954-1.286 3.411-2.719 3.411zm6.945-4.103c-.027-.323-.07-.638-.13-.943-.728-3.714-3.418-5.632-7.078-5.632-4.184 0-7.394 2.628-7.94 6.702l2.392.32c.389-2.91 2.585-4.66 5.548-4.66 2.673 0 4.542 1.34 5.034 3.743.14.686.16 1.4.06 2.13-.578 4.22-3.11 6.892-6.708 6.892-2.88 0-4.992-1.689-4.992-3.993 0-2.39 1.93-3.993 4.607-4.417 1.385-.22 2.805-.183 4.14-.02v-.868c0-1.85-1.272-2.92-3.328-2.92-1.614 0-2.94.757-3.284 1.977l-2.29-.68c.57-2.025 2.697-3.297 5.574-3.297 3.38 0 5.71 1.764 5.71 4.88v6.71c0 .77.106 1.52.316 2.23l-2.318.665c-.244-.827-.367-1.7-.367-2.59v-.337z" />
              </svg>
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};

