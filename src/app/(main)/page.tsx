"use client";
import React, { useRef } from "react";
import HeroSection from "../(Home)/components/heroSection";
import SearchBox from "../(Home)/components/searchBox";
import Image from "next/image";

export default function HomePage() {
  const searchBoxRef = useRef<HTMLDivElement>(null);
  return (
    <main className="bg-[#F8F9FA]">
      <div className="relative">
        {/* Hero Section */}
        <HeroSection searchBoxRef={searchBoxRef} />

        {/* Overlapping SearchBox */}
        <div ref={searchBoxRef} className="w-full max-w-5xl mx-auto px-2 sm:px-4 -mt-12 sm:-mt-16 md:-mt-20 z-30 relative no-overlap-below-450">
          <SearchBox />
        </div>
      </div>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-blue-800 mb-8">Featured Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col hover:scale-105 transition-transform duration-300 border border-yellow-200">
              <div className="relative h-56 w-full">
                <Image src={`/${i}.webp`} alt={`Destination ${i}`} className="object-cover w-full h-full" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={i === 1} />
                <span className="absolute top-4 left-4 bg-yellow-400 text-blue-900 font-bold px-3 py-1 rounded-full text-xs shadow">Premium</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <h3 className="text-xl font-bold text-blue-700 mb-2">Luxury Escape {i}</h3>
                <p className="text-gray-600 mb-4 flex-1">Experience the ultimate in comfort and adventure with our exclusive package to Destination {i}. Enjoy 5-star stays, private tours, and gourmet dining.</p>
                <button className="mt-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-xl shadow transition-all">Explore</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-br from-yellow-50 to-blue-50 py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center text-blue-800 mb-10">Why Choose Brothers Holidays?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow border border-yellow-100">
              <svg className="w-12 h-12 mb-3 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>
              <h4 className="font-bold text-blue-700 mb-1">Curated Luxury</h4>
              <p className="text-gray-600 text-sm">Handpicked 5-star hotels, private tours, and exclusive experiences.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow border border-yellow-100">
              <svg className="w-12 h-12 mb-3 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <h4 className="font-bold text-blue-700 mb-1">24/7 Support</h4>
              <p className="text-gray-600 text-sm">Personal travel concierge available anytime, anywhere.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow border border-yellow-100">
              <svg className="w-12 h-12 mb-3 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="7" rx="2"/><path d="M16 11V7a4 4 0 0 0-8 0v4"/></svg>
              <h4 className="font-bold text-blue-700 mb-1">Secure & Trusted</h4>
              <p className="text-gray-600 text-sm">ATOL & ABTA protected, with 1000+ happy travelers every year.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow border border-yellow-100">
              <svg className="w-12 h-12 mb-3 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 12.79 3H21z"/></svg>
              <h4 className="font-bold text-blue-700 mb-1">Global Reach</h4>
              <p className="text-gray-600 text-sm">Luxury holidays to Nepal, India, and worldwide dream destinations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-blue-800 mb-10">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            name: "Priya S.",
            text: "Absolutely unforgettable! Every detail was perfect. The private tours and luxury hotels made us feel like royalty.",
            img: null
          }, {
            name: "James T.",
            text: "The best travel experience of my life. 24/7 support and curated experiences made all the difference!",
            img: null
          }, {
            name: "Aarav K.",
            text: "Highly recommend Brothers Holidays for anyone seeking a premium, stress-free holiday.",
            img: null
          }].map((t, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-yellow-100">
              <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-2xl font-bold text-blue-700 mb-4">
                {t.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="text-gray-700 text-lg mb-3 text-center">&quot;{t.text}&quot;</p>
              <span className="text-blue-800 font-semibold">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl md:text-4xl font-extrabold text-blue-900 mb-4">Ready for Your Next Luxury Escape?</h2>
        <p className="text-lg md:text-2xl text-blue-800 mb-8 max-w-2xl">Contact our travel experts today and let us craft your dream holiday, tailored just for you.</p>
        <a href="#" className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-4 rounded-2xl shadow-lg text-lg md:text-xl transition-all">Start Your Journey</a>
      </section>
    </main>
  );
} 