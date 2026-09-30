'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Shield, Scissors } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-sm py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-200">
          {/* Brand & About */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs text-[#1b5e20]">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  TailorApp
                </span>
                <span className="text-xs text-[#1b5e20] font-bold -mt-0.5">
                  Digital Measurement System
                </span>
              </div>
            </div>
            <p className="text-slate-600 max-w-sm text-xs sm:text-sm leading-relaxed font-normal">
              A reliable digital measurement management system designed specifically for tailors, fashion designers, and clothiers.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#1b5e20] font-bold">
              <Scissors className="w-3.5 h-3.5" />
              <span>Built for Nigerian Tailoring Workshops</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Contact & Location
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1b5e20] flex-shrink-0 mt-0.5" />
                <span>No.1&2 Ayumsa Plaza, Sabo Bakin Zuwo Road, Kano State, Nigeria.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1b5e20] flex-shrink-0" />
                <a href="tel:+2347061110002" className="hover:text-[#1b5e20] font-semibold text-slate-900 transition-colors">
                  +234 706 111 0002
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1b5e20] flex-shrink-0" />
                <a href="mailto:support@tailorapp.com" className="hover:text-[#1b5e20] font-semibold text-slate-900 transition-colors">
                  support@tailorapp.com
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Portals */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#features" className="hover:text-[#1b5e20] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-[#1b5e20] transition-colors">
                  Studio Demo
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#1b5e20] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#1b5e20] transition-colors font-medium">
                  Tailor Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#1b5e20] transition-colors font-medium">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} TailorApp. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            <span>Built with precision for Nigerian Tailors</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
