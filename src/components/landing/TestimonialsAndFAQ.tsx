'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const FAQS = [
  {
    q: 'How does TailorApp help me avoid customer measurement mistakes?',
    a: 'Paper measurement books easily get lost, torn, or misplaced by apprentices. TailorApp saves every single customer measurement on your phone with the exact date. When a customer returns for a new Kaftan or Babban Riga months later, you can see their exact previous sizes instantly.',
  },
  {
    q: 'Can I add custom measurement names for traditional clothes?',
    a: 'Yes! You can create custom measurement templates for Kaftan, Babban Riga, Senator wear, Agbada, Abayas, and Gowns. You can type names in Hausa or English (Tsawon Riga, Hannu, Kirji, Wando) in Inches or Centimeters.',
  },
  {
    q: 'Can I use TailorApp directly on my phone in my shop?',
    a: 'Yes! TailorApp is designed specifically for phones. Open the website on your phone (Chrome or Safari) and tap "Add to Home Screen". It opens in full screen just like a regular mobile app without taking up much phone storage.',
  },
  {
    q: 'Are my customer phone numbers and measurements private?',
    a: 'Yes, 100% private. Your account is secured with modern database protection. No other tailor or competitor can ever see your customers, phone numbers, or measurements.',
  },
  {
    q: 'Where is your office located and how can I contact support?',
    a: 'Our physical hub is located at No.1 & 2 Ayumsa Plaza, Sabo Bakin Zuwo Road, Kano State, Nigeria. You can call our support line on +234 706 111 0002 or email support@tailorapp.com.',
  },
];

const MASTER_TESTIMONIALS = [
  {
    quote:
      'In our workshop at Bn Isma\'eel Clothing, accuracy is our priority. TailorApp stops lost customer measurements and allows our cutters to check size history in seconds.',
    author: 'Auwal Isma\'il',
    role: 'CEO, Bn Isma\'eel Clothing',
    tag: 'Bn Isma\'eel Clothing',
  },
  {
    quote:
      'Managing hundreds of clients used to require stacks of paper books. With TailorApp, my apprentices and I find accurate Kaftan and Babban Riga measurements without stress.',
    author: 'Isma\'il Zubair',
    role: 'CEO, Kankara Couture and More',
    tag: 'Kankara Couture',
  },
  {
    quote:
      'Yamani Clothing relies on neat finishing. Being able to check saved measurements when clients order from another city ensures their outfits fit properly every time.',
    author: 'Huzaifa Tukur',
    role: 'CEO, Yamani Clothing',
    tag: 'Yamani Clothing',
  },
  {
    quote:
      'Saving custom sleeve lengths and female gown sizes directly on the phone while measuring customers saves so much time in the shop.',
    author: 'Haroon Aminu Isah',
    role: 'Lead Tailor, KF Modeling and Stitches',
    tag: 'KF Modeling & Stitches',
  },
  {
    quote:
      'A great digital tool for modern tailors. Simple to use, fast on mobile, and keeps all client records neat and well-arranged.',
    author: 'M.A Clothing',
    role: 'Fashion & Tailoring House',
    tag: 'M.A Clothing',
  },
];

export function TestimonialsAndFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Automatic sliding timer that never stops
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MASTER_TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % MASTER_TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + MASTER_TESTIMONIALS.length) % MASTER_TESTIMONIALS.length);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 relative overflow-hidden bg-[#040e1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Continuous Automatic Sliding Carousel Section */}
        <div className="mb-24 sm:mb-28">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#81c784]">
              Trusted in the Tailoring Community
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Loved by Experienced Master Tailors
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              See what top master tailors and fashion houses have to say about using TailorApp.
            </p>
          </div>

          {/* Active Sliding Carousel Container */}
          <div className="max-w-4xl mx-auto relative px-2 sm:px-12">
            {/* Carousel Navigation Buttons */}
            <button
              onClick={prevSlide}
              aria-label="Previous testimonial"
              className="absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#071A34] border border-[#2e7d32]/40 text-white hover:text-[#81c784] hover:bg-[#0B2545] flex items-center justify-center shadow-xl transition-all cursor-pointer hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next testimonial"
              className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#071A34] border border-[#2e7d32]/40 text-white hover:text-[#81c784] hover:bg-[#0B2545] flex items-center justify-center shadow-xl transition-all cursor-pointer hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel Slide Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[#071A34] border border-[#2e7d32]/40 p-6 sm:p-10 shadow-2xl shadow-[#040e1e] min-h-[260px] flex flex-col justify-between">
              <Quote className="w-12 h-12 text-[#2e7d32]/15 absolute top-6 right-6 pointer-events-none" />

              {/* Slide Content with Transition Key */}
              <div key={currentIndex} className="animate-fade-in-up space-y-4">
                {/* 5 Stars */}
                <div className="flex gap-1 text-[#81c784]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[#81c784]" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-slate-100 text-sm sm:text-lg leading-relaxed italic font-normal">
                  &ldquo;{MASTER_TESTIMONIALS[currentIndex].quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-6 mt-4 border-t border-[#0B2545] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-black text-white text-base sm:text-lg">
                    {MASTER_TESTIMONIALS[currentIndex].author}
                  </div>
                  <div className="text-xs sm:text-sm text-[#81c784] font-medium">
                    {MASTER_TESTIMONIALS[currentIndex].role}
                  </div>
                </div>

                <div className="self-start sm:self-center px-3 py-1 rounded-full bg-[#040e1e] text-[#81c784] text-xs font-bold border border-[#2e7d32]/35">
                  {MASTER_TESTIMONIALS[currentIndex].tag}
                </div>
              </div>
            </div>

            {/* Slide Pagination Dots (Timer driven) */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {MASTER_TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-8 bg-[#2e7d32]'
                      : 'w-2 bg-[#0B2545] hover:bg-[#2e7d32]/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Continuous Running Marquee Banner below */}
          <div className="mt-12 overflow-hidden py-4 border-y border-[#0B2545] bg-[#071A34]/50">
            <div className="animate-marquee gap-8 items-center text-xs font-bold uppercase tracking-wider text-slate-300">
              {[...MASTER_TESTIMONIALS, ...MASTER_TESTIMONIALS].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 whitespace-nowrap px-4 py-1 rounded-xl bg-[#040e1e] border border-[#0B2545]">
                  <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
                  <span className="text-white font-bold">{item.author}</span>
                  <span className="text-[#81c784]">({item.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#81c784]">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#0B2545] bg-[#071A34] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:text-[#81c784] transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-white text-sm sm:text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#81c784] flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#0B2545]/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
