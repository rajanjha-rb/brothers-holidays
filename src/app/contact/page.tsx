import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaRegEnvelope } from "react-icons/fa";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex flex-col justify-between">
      <Navbar />
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center bg-gradient-to-tr from-pink-100 to-purple-100 border-b border-pink-200 py-14" style={{ minHeight: 220 }}>
        <FaRegEnvelope className="text-[#D72631] text-5xl mb-4" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#232946] mb-2 text-center">Contact Us</h1>
      </section>

      {/* Main Content: Contact Info & Form */}
      <section className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 py-12 px-4 md:px-8">
        {/* Left: Contact Info */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 text-[#232946]">Let&apos;s talk with us</h2>
          <p className="text-gray-600 mb-8">We&apos;re here to help and answer any question you might have.</p>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <span className="mt-1"><FaMapMarkerAlt className="text-[#D72631] text-xl" /></span>
              <div>
                <span className="font-semibold text-[#232946]">Samakhusi, Kathmandu</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="mt-1"><FaPhoneAlt className="text-[#D72631] text-xl" /></span>
              <div>
                <a href="tel:+9779741726064" className="text-black font-semibold hover:underline">+977 9741726064</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="mt-1"><FaEnvelope className="text-[#FFD166] text-xl" /></span>
              <div>
                <a href="mailto:info@brothersholidays.com" className="text-black font-semibold hover:underline">info@brothersholidays.com</a>
              </div>
            </li>
          </ul>
        </div>
        {/* Right: Contact Form */}
        <div className="flex-1 flex justify-center items-center">
          <form className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-300 p-8 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" name="firstName" placeholder="First Name*" className="flex-1 px-4 py-2 rounded border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none text-base w-full" required />
              <input type="text" name="lastName" placeholder="Last Name*" className="flex-1 px-4 py-2 rounded border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none text-base w-full" required />
            </div>
            <input type="email" name="email" placeholder="Email*" className="w-full px-4 py-2 rounded border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none text-base" required />
            <input type="tel" name="phone" placeholder="Phone Number*" className="w-full px-4 py-2 rounded border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none text-base" required />
            <textarea name="message" placeholder="Your message..." rows={4} className="w-full px-4 py-2 rounded border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none text-base resize-none" required />
            <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:from-pink-600 hover:to-purple-700 hover:scale-105 transition text-lg">Send Message</button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
} 