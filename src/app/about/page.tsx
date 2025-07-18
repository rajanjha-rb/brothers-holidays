import React from "react";
import Footer from "../components/Footer";
import { FaGlobeAsia, FaUsers, FaHeart, FaStar } from "react-icons/fa";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";

const Team = dynamic(() => import("../components/Team"));
import GoogleMapEmbed from "../components/GoogleMapEmbedClient";

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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center text-center py-16 px-4 border-b border-gray-100 bg-gradient-to-b from-yellow-200 via-yellow-50 to-white">
        <FaGlobeAsia className="text-[#D72631] text-5xl mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-0 text-yellow-800 drop-shadow-lg">About Brothers Holidays</h1>
      </section>

      {/* Company Story & Mission */}
      <section className="max-w-3xl mx-auto py-12 px-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Our Story</h2>
        <p className="text-gray-700 mb-6">
          Brothers Holidays was founded with a passion for travel and a mission to make every journey extraordinary. With years of experience, our team brings you the best of Nepal and beyond, blending local expertise with global standards.
        </p>
        <h3 className="text-xl font-semibold mb-2 text-red-600">Our Mission</h3>
        <p className="text-gray-700">
          To inspire and enable people to explore the world, creating memories that last a lifetime. We believe in responsible tourism, authentic experiences, and personalized service.
        </p>
      </section>

      {/* Core Values Section */}
      <section className="w-full py-8 px-4 border-b border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {values.map((val) => (
            <div key={val.title} className="flex flex-col items-center p-4">
              {val.icon}
              <div className="font-bold text-base mt-2 mb-1 text-gray-900">{val.title}</div>
              <div className="text-gray-500 text-sm">{val.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section - Tabbed/Slider UI */}
      <section className="w-full py-16 px-4 border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-900">Meet Our Team</h2>
          <p className="text-gray-600">Passionate, experienced, and dedicated to making your travel dreams come true.</p>
        </div>
        <Team />
      </section>

      {/* Testimonials Grid */}
      <section className="w-full py-12 px-4 border-b border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-red-600">What Our Travelers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl shadow p-6 text-center flex flex-col items-center border border-gray-100">
              <div className="text-lg text-gray-700 mb-4 italic">“{t.text}”</div>
              <div className="font-bold text-blue-700">{t.name}</div>
              <div className="text-sm text-gray-500">{t.country}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 px-4 flex flex-col items-center justify-center text-center bg-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900">Ready for your next adventure?</h2>
        <p className="text-gray-700 mb-6 max-w-xl mx-auto">Contact us today and let our experts help you plan the perfect trip. Your journey begins with Brothers Holidays!</p>
        <a
          href="tel:+9779741726064"
          className="inline-block px-8 py-3 rounded-lg font-bold text-lg shadow transition-transform hover:scale-105 bg-blue-700 text-white"
        >
          Call Us: +977 9741726064
        </a>
      </section>

      {/* Office Location - Google Maps */}
      <section className="w-full py-12 px-4 bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-800">Our Office Location</h2>
        <GoogleMapEmbed
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.5335437197277!2d85.3137147740542!3d27.73168492442015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190005dd8d47%3A0x55fc46bb27a53495!2sBrothers%20Holidays%20Adventure!5e0!3m2!1sen!2snp!4v1752637872899!5m2!1sen!2snp"
          title="Brothers Holidays Adventure Office Location"
        />
      </section>

      <Footer />
    </main>
  );
} 