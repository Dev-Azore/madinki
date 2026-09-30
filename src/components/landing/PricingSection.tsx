'use client';

import { Check, ArrowRight, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-24 relative overflow-hidden border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#1b5e20] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Scissors className="w-3.5 h-3.5" />
            Clear & Simple Pricing
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Start Free Today. No Hidden Fees.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            All core measurement features are completely free to help every tailor succeed. An optional premium ad-free plan will be available later.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Plan */}
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#1b5e20] shadow-xl flex flex-col justify-between relative">
            {/* Badge */}
            <div className="absolute -top-3.5 left-6 sm:left-8 px-3.5 py-1 rounded-full bg-[#1b5e20] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
              Free Plan • Available Now
            </div>

            <div className="space-y-5 sm:space-y-6 pt-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Starter Tailor</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Full access for independent tailors and fashion designers.
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono">₦0</span>
                <span className="text-slate-500 text-xs sm:text-sm font-medium">/ month (Free Forever)</span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                {[
                  'Unlimited Customers & Profiles',
                  'Unlimited Clothes Measurement Templates',
                  'Permanent Fitting History with Dates',
                  'Fast Search by Name & Phone',
                  'Installable Mobile App for Phone',
                  'Ad-supported Free Access',
                  'Cloud Backup of All Records',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#1b5e20] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-100">
              <Link href="/register" className="w-full block">
                <Button size="lg" className="w-full bg-[#1b5e20] hover:bg-[#144818] text-white font-bold shadow-xs">
                  <span>Create Free Account</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium Plan (Coming Soon) */}
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-slate-50/80 border border-slate-200 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity">
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">Master Studio</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    For large tailoring workshops and busy boutiques.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-slate-200 shadow-xs">
                  Coming Soon
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-400 font-mono">₦5,000</span>
                <span className="text-slate-400 text-xs sm:text-sm font-medium">/ year</span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs sm:text-sm text-slate-500">
                {[
                  'Everything in Starter Tailor',
                  '100% Ad-Free Experience',
                  'Share Measurements via WhatsApp & SMS',
                  'Export Measurements to PDF / Print Slips',
                  'Priority Support for Your Workshop',
                  'Add Your Tailor Brand Logo to Receipts',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-200">
              <Button size="lg" disabled className="w-full text-slate-400 bg-slate-100 border border-slate-200">
                Available Soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
