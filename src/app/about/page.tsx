"use client";

import React, { Suspense } from "react";
import Footer from "../components/Footer";
import { FaGlobeAsia, FaUsers, FaHeart, FaStar } from "react-icons/fa";
import Navbar from "../components/Navbar";
import dynamic from "next/dynamic";
import PerformanceMonitor from "../components/PerformanceMonitor";

// Lazy load heavy components with better loading states
const Team = dynamic(() => import("../components/TeamClient"), { 
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

const GoogleMapEmbed = dynamic(() => import("../components/GoogleMapEmbedClient"), { 
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
  <div className="bg-white rounded-2xl shadow p-6 text-center flex flex-col items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300">
    <div className="text-lg text-gray-700 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</div>
    <div className="font-bold text-blue-700">{testimonial.name}</div>
    <div className="text-sm text-gray-500">{testimonial.country}</div>
  </div>
));

TestimonialCard.displayName = 'TestimonialCard';

// Optimized values component
const ValueCard = React.memo(({ value }: { value: typeof values[0] }) => (
  <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform duration-300">
    {value.icon}
    <div className="font-bold text-base mt-2 mb-1 text-gray-900">{value.title}</div>
    <div className="text-gray-500 text-sm">{value.desc}</div>
  </div>
));

ValueCard.displayName = 'ValueCard';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      <PerformanceMonitor pageName="About Page" />
      <Navbar />
      
      {/* Hero Section - Shows immediately */}
      <section className="w-full flex flex-col items-center justify-center text-center py-16 px-4 border-b border-gray-100 bg-gradient-to-b from-yellow-200 via-yellow-50 to-white animate-fadein">
        <FaGlobeAsia className="text-[#D72631] text-5xl mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-0 text-yellow-800 drop-shadow-lg">About Brothers Holidays</h1>
      </section>

      {/* Company Story & Mission - Shows immediately */}
      <section className="max-w-3xl mx-auto py-12 px-4 border-b border-gray-100 animate-fadein">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Our Story</h2>
        <p className="text-gray-700 mb-6">
          Brothers Holidays was founded with a passion for travel and a mission to make every journey extraordinary. With years of experience, our team brings you the best of Nepal and beyond, blending local expertise with global standards.
        </p>
        <p className="text-gray-700 mb-6">
          We believe that travel should be more than just visiting places—it should be about creating memories that last a lifetime. Our commitment to excellence and attention to detail ensures that every trip we plan becomes an unforgettable adventure.
        </p>
      </section>

      {/* Values Section - Shows immediately */}
      <section className="w-full py-16 px-4 border-b border-gray-100 bg-gray-50 animate-fadein">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900">Our Values</h2>
          <p className="text-gray-600">The principles that guide everything we do</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <ValueCard key={index} value={value} />
          ))}
        </div>
      </section>

      {/* Team Section - Lazy loaded */}
      <Suspense fallback={
        <div className="w-full py-16 px-4 border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-900">Meet Our Team</h2>
            <p className="text-gray-600">Loading team information...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse bg-gray-200 rounded-2xl w-80 h-80"></div>
          </div>
        </div>
      }>
        <Team />
      </Suspense>

      {/* Testimonials Section - Shows immediately */}
      <section className="w-full py-16 px-4 border-b border-gray-100 bg-white animate-fadein">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900">What Our Clients Say</h2>
          <p className="text-gray-600">Real experiences from real travelers</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </section>

      {/* Contact & Map Section - Lazy loaded */}
      <Suspense fallback={
        <div className="w-full py-12 px-4 bg-gray-50 flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-800">Our Office Location</h2>
          <div className="w-full max-w-2xl aspect-video rounded-2xl bg-gray-200 animate-pulse"></div>
        </div>
      }>
        <GoogleMapEmbed 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.5335437197277!2d85.3137147740542!3d27.73168492442015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190005dd8d47%3A0x55fc46bb27a53495!2sBrothers%20Holidays%20Adventure!5e0!3m2!1sen!2snp!4v1752637872899!5m2!1sen!2snp"
          title="Brothers Holidays Adventure Office Location"
        />
      </Suspense>

      <Footer />

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </main>
  );
} 