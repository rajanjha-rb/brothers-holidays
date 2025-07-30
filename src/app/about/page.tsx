"use client";

import React, { Suspense } from "react";
import Footer from "../components/Footer";
import { FaGlobeAsia, FaUsers, FaHeart, FaStar } from "react-icons/fa";
import Navbar from "../components/Navbar";
import dynamic from "next/dynamic";


// Lazy load heavy components with better loading states
const Team = dynamic(() => import("../components/Team"), { 
  ssr: false,
  loading: () => (
    <div className="w-full py-16 px-4 border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-900">Meet Our Team</h2>
        <p className="text-gray-600">Loading team information...</p>
      </div>
      <div className="flex justify-center">
        <div className="animate-pulse bg-gray-200 rounded-2xl w-80 h-80"></div>
      </div>
    </div>
  )
});

const GoogleMapEmbed = dynamic(() => import("../components/GoogleMapEmbed"), { 
  ssr: false,
  loading: () => (
    <div className="w-full py-12 px-4 bg-gray-50 flex flex-col items-center justify-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-800">Our Office Location</h2>
      <div className="w-full max-w-2xl aspect-video rounded-2xl bg-gray-200 animate-pulse"></div>
    </div>
  )
});

const values = [
  { icon: <FaGlobeAsia className="text-2xl text-blue-600" />, title: "Global Reach", desc: "Local expertise, global reach." },
  { icon: <FaUsers className="text-2xl text-red-500" />, title: "Personal Touch", desc: "Tailored journeys for you." },
  { icon: <FaHeart className="text-2xl text-pink-500" />, title: "Passion", desc: "We love what we do." },
  { icon: <FaStar className="text-2xl text-yellow-400" />, title: "Excellence", desc: "Trusted by travelers." },
];

const testimonials = [
  {
    name: "Priya Sharma",
    text: "Brothers Holidays made our honeymoon unforgettable! Every detail was perfect.",
    country: "India",
  },
  {
    name: "John Smith",
    text: "The best travel agency in Nepal. Highly recommended for adventure seekers!",
    country: "UK",
  },
  {
    name: "Mina Tamang",
    text: "Professional, friendly, and always available. Our family trip was a dream come true.",
    country: "Nepal",
  },
];

// Optimized testimonials component with lazy loading
const TestimonialCard = React.memo(({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="bg-white rounded-2xl shadow p-4 sm:p-6 text-center flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300">
    <div className="text-sm sm:text-lg text-gray-700 mb-3 sm:mb-4 italic leading-relaxed">&ldquo;{testimonial.text}&rdquo;</div>
    <div className="font-bold text-blue-700 text-sm sm:text-base">{testimonial.name}</div>
    <div className="text-xs sm:text-sm text-gray-500">{testimonial.country}</div>
  </div>
));

TestimonialCard.displayName = 'TestimonialCard';

// Optimized values component
const ValueCard = React.memo(({ value }: { value: typeof values[0] }) => (
  <div className="flex flex-col items-center p-2 sm:p-4 hover:scale-105 transition-transform duration-300">
    <div className="text-xl sm:text-2xl mb-2 sm:mb-3">{value.icon}</div>
    <div className="font-bold text-sm sm:text-base mt-1 sm:mt-2 mb-1 text-gray-900 text-center">{value.title}</div>
    <div className="text-gray-500 text-xs sm:text-sm text-center leading-tight">{value.desc}</div>
  </div>
));

ValueCard.displayName = 'ValueCard';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">

      <Navbar />
      
      {/* Hero Section - Shows immediately */}
      <section className="w-full flex flex-col items-center justify-center text-center py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-b from-yellow-200 via-yellow-50 to-white">
        <FaGlobeAsia className="text-[#D72631] text-4xl sm:text-5xl mb-3 sm:mb-4" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-0 text-yellow-800 drop-shadow-lg px-2">About Brothers Holidays</h1>
      </section>

      <hr className="border-gray-200" />

      {/* Company Story & Mission - Shows immediately */}
      <section className="max-w-3xl mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-900">Our Story</h2>
        <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
          Brothers Holidays was founded with a passion for travel and a mission to make every journey extraordinary. With years of experience, our team brings you the best of Nepal and beyond, blending local expertise with global standards.
        </p>
        <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
          We believe that travel should be more than just visiting places—it should be about creating memories that last a lifetime. Our commitment to excellence and attention to detail ensures that every trip we plan becomes an unforgettable adventure.
        </p>
      </section>

      <hr className="border-gray-200" />

      {/* Values Section - Shows immediately */}
      <section className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-blue-900">Our Values</h2>
          <p className="text-gray-600 text-sm sm:text-base">The principles that guide everything we do</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {values.map((value, index) => (
            <ValueCard key={index} value={value} />
          ))}
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* Team Section - Lazy loaded */}
      <Suspense fallback={
        <div className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-blue-900">Meet Our Team</h2>
            <p className="text-gray-600 text-sm sm:text-base">Loading team information...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse bg-gray-200 rounded-2xl w-64 h-64 sm:w-80 sm:h-80"></div>
          </div>
        </div>
      }>
        <Team />
      </Suspense>

      <hr className="border-gray-200" />

      {/* Testimonials Section - Shows immediately */}
      <section className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-blue-900">What Our Clients Say</h2>
          <p className="text-gray-600 text-sm sm:text-base">Real experiences from real travelers</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* Contact & Map Section - Optimized for fast loading */}
      <GoogleMapEmbed 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.5335437197277!2d85.3137147740542!3d27.73168492442015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190005dd8d47%3A0x55fc46bb27a53495!2sBrothers%20Holidays%20Adventure!5e0!3m2!1sen!2snp!4v1752637872899!5m2!1sen!2snp&zoom=15&maptype=roadmap"
        title="Brothers Holidays Adventure Office Location"
      />

      <Footer />

      {/* Optimized for instant loading - no animations */}
      <style jsx global>{`
        /* Removed fade-in animations for instant page appearance */
      `}</style>
    </main>
  );
} 