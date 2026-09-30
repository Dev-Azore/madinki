'use client';

import {
  History,
  Layers,
  Users,
  Smartphone,
  ShieldCheck,
  Search,
  Scissors,
} from 'lucide-react';

const FEATURES = [
  {
    icon: History,
    title: 'Never Lose Old Measurements',
    description:
      'Every fitting is saved permanently with the exact date. When a customer returns after months or years, their complete size history is right there.',
    tag: 'Fitting History',
  },
  {
    icon: Layers,
    title: 'Custom Clothes Templates',
    description:
      'Create custom measurement forms for Kaftans, Babban Riga, Senator suits, Shirts, and Wedding Gowns with custom labels in Hausa or English.',
    tag: 'Any Style',
  },
  {
    icon: Users,
    title: 'Customer Directory & Notes',
    description:
      'Keep all your customer names, phone numbers, fit preferences, and delivery notes in one organized, easy-to-use list.',
    tag: 'Zero Paper Books',
  },
  {
    icon: Smartphone,
    title: 'Mobile App for Your Phone',
    description:
      'Add TailorApp straight to your Android or iPhone home screen. Use it right on your workshop cutting table without heavy downloads.',
    tag: 'Mobile Friendly',
  },
  {
    icon: ShieldCheck,
    title: 'Private & Secure Account',
    description:
      'Your customer measurements belong solely to you. Modern security ensures no other tailor can ever see your records.',
    tag: '100% Private',
  },
  {
    icon: Search,
    title: 'Instant Customer Search',
    description:
      'Find any customer by name or phone number in less than a second when they walk into your shop or call your line.',
    tag: 'Fast Search',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#1b5e20] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Scissors className="w-3.5 h-3.5 text-[#1b5e20]" />
            Built for Modern Tailors
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Everything You Need to Run an Organized Tailoring Shop
          </h2>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            Say goodbye to stained paper notebooks, missing measuring slips, and customer size arguments. TailorApp brings order to your workshop.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-md shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1b5e20] group-hover:scale-105 group-hover:bg-emerald-100 transition-transform">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#1b5e20] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center text-xs text-slate-500 group-hover:text-[#1b5e20] font-bold transition-colors">
                  <span>Fast and easy to use &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
