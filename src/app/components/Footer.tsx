"use client";

import React, { useState, useEffect } from "react";
import { FaFacebookSquare, FaInstagram, FaWhatsappSquare, FaHeadset, FaThumbsUp } from "react-icons/fa";
import { SiViber } from "react-icons/si";

const PALETTE = {
  blue: "#0057B7",         // Nav backgrounds, accents
  red: "#D72631",          // Buttons, highlights
  gold: "#FFD166",         // Accents
  white: "#F8F9FA",        // Backgrounds, cards
  gray: "#495057",         // Text, contrast
};

const navLinks1 = [
  { name: "Holidays", href: "#" },
];
const navLinks2 = [
  { name: "About Us", href: "#" },
  { name: "Blog", href: "#" },
  { name: "Careers", href: "#" },
  { name: "FAQs", href: "#" },
  { name: "Contact", href: "#" },
];

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/brothersholidaysadventure", icon: (
    <span style={{ background: '#1877F3', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FaFacebookSquare color="#fff" size={22} />
    </span>
  ) },
  { name: "Instagram", href: "https://www.instagram.com/brothersholidaysadventure/", icon: (
    <span style={{ background: 'radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FaInstagram color="#fff" size={22} />
    </span>
  ) },
  { name: "WhatsApp", href: "https://wa.me/9779763683242", icon: (
    <span style={{ background: '#25D366', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FaWhatsappSquare color="#fff" size={22} />
    </span>
  ) },
  { name: "Viber", href: "https://viber.com", icon: (
    <span style={{ background: '#7c529e', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SiViber color="#fff" size={22} />
    </span>
  ) },
];

export default function Footer() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  
  useEffect(() => {
    const handleScroll = () => {
      // setShowTop(window.scrollY > 200); // Removed unused variable
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add automated messages when chat opens
  useEffect(() => {
    if (showChat) {
      setMessages([]);
      // First message
      setTimeout(() => {
        setMessages(prev => [...prev, "Hi there! 👋 Welcome to Brothers Holidays!"]);
      }, 500);
      
      // Second message
      setTimeout(() => {
        setMessages(prev => [...prev, "I'm here to help you plan your perfect holiday. What can I assist you with today?"]);
      }, 1500);
      
      // Third message
      setTimeout(() => {
        setMessages(prev => [...prev, "We offer amazing packages to Nepal, India, and worldwide destinations! 🌍"]);
      }, 2500);
      
      // Fourth message
      setTimeout(() => {
        setMessages(prev => [...prev, "Feel free to ask about our packages, pricing, or any travel questions!"]);
      }, 3500);
    }
  }, [showChat]);

  // Removed unused variable: scrollToTop
  return (
    <footer style={{ background: PALETTE.white, color: PALETTE.gray }} className="w-full border-t border-[#FFD166] pt-0 pb-8 px-2 sm:px-4 md:px-8 mt-16 text-base sm:text-sm py-10 px-4 overflow-x-hidden font-sans">
      {/* Gold Divider */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${PALETTE.gold} 0%, ${PALETTE.blue} 100%)` }} className="w-full mb-10" />
      <div className="max-w-screen-md md:max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-4 gap-0 md:gap-8 items-start pb-8">
        {/* Brand & Trust */}
        <div className="w-full flex flex-col gap-3 items-center md:items-start text-center md:text-left py-6 md:py-0">
          <div className="flex items-center gap-2 mx-auto md:mx-0">
            <span className="text-2xl md:text-3xl font-bold italic font-sans" style={{ color: PALETTE.blue }}>Brothers</span>
            <span className="text-2xl md:text-3xl font-bold italic font-sans" style={{ color: PALETTE.red }}>Holidays</span>
          </div>
          <p className="text-sm mx-auto md:mx-0" style={{ color: PALETTE.gray, maxWidth: 260 }}>
            Luxury escapes, tailored journeys, and unforgettable experiences 4crafted for you by the UK&apos;s most trusted travel experts.
          </p>
        </div>
        <hr className="block md:hidden border-t border-gray-200 my-2 w-full mx-auto" />
        {/* Newsletter */}
        <div className="w-full flex flex-col gap-2 items-center md:items-start text-center md:text-left py-6 md:py-0">
          <span className="uppercase text-xs font-bold tracking-widest mb-1" style={{ color: PALETTE.gold }}>Newsletter</span>
          <p className="text-xs mb-1 mx-auto md:mx-0" style={{ color: PALETTE.gray, maxWidth: 260 }}>Get exclusive deals & travel inspiration. No spam, ever.</p>
          <form className="flex flex-col sm:flex-row w-full gap-2 justify-center md:justify-start" onSubmit={e => e.preventDefault()} style={{ maxWidth: 320 }}>
            <span className="flex items-center px-3 bg-white/80 rounded border border-[#FFD166] w-full">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="mr-2"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" stroke="#0057B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <input
                type="email"
                required
                placeholder="Your email"
                className="bg-transparent outline-none text-[#495057] placeholder-[#495057]/60 py-2 min-w-[80px] w-full focus:outline-blue-600 focus:ring-2 focus:ring-yellow-400"
                style={{ minWidth: 0 }}
                aria-label="Email address"
              />
            </span>
            <button type="submit" className="px-5 py-3 rounded font-bold text-white whitespace-nowrap focus:outline-blue-600 focus:ring-2 focus:ring-yellow-400 active:scale-95 text-base sm:text-sm" style={{ background: PALETTE.red }}>
              Subscribe
            </button>
          </form>
        </div>
        <hr className="block md:hidden border-t border-gray-200 my-2 w-full mx-auto" />
        {/* Navigation */}
        <div className="w-full flex flex-col gap-2 items-center md:items-start text-center md:text-left py-6 md:py-0">
          <div className="bg-white/80 rounded-xl shadow md:shadow-none w-full px-2 py-4 md:bg-transparent md:rounded-none md:shadow-none">
            {/* Explore Links */}
            <span className="uppercase text-xs font-bold tracking-widest mt-4 mb-2 block md:mt-0 md:mb-1 text-gray-700" style={{ color: PALETTE.gold }} id="footer-explore">Explore</span>
            <ul className="flex flex-col gap-3 md:gap-1 w-full">
              {navLinks1.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="hover:underline font-medium focus:outline-blue-600 focus:ring-2 focus:ring-yellow-400 py-3 block rounded-lg transition-all duration-200" style={{ color: PALETTE.blue }}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <hr className="block md:hidden border-t border-gray-200 my-4 w-full mx-auto" />
            {/* Company Links */}
            <ul className="flex flex-col gap-3 md:gap-1 w-full">
              {navLinks2.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="hover:underline font-medium focus:outline-blue-600 focus:ring-2 focus:ring-yellow-400 py-3 block rounded-lg transition-all duration-200" style={{ color: PALETTE.blue }}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="block md:hidden border-t-2 border-gray-300 my-4 w-full mx-auto" />
        {/* Contact & Social */}
        <div className="w-full flex flex-col gap-2 items-center md:items-start text-center md:text-left py-6 md:py-0">
          <div className="bg-white/80 rounded-xl shadow md:shadow-none w-full px-2 py-4 md:bg-transparent md:rounded-none md:shadow-none">
            <span className="uppercase text-xs font-bold tracking-widest mt-4 mb-2 block md:mt-0 md:mb-1 text-gray-700" style={{ color: PALETTE.gold }}>Contact</span>
            <a href="tel:+9779741726064" className="font-semibold text-base focus:outline-blue-600 focus:ring-2 focus:ring-yellow-400 py-3 block rounded-lg transition-all duration-200" style={{ color: PALETTE.red }}>+977 9741726064</a>
            <a href="mailto:info@brothersholidays.com" className="font-medium text-sm focus:outline-blue-600 focus:ring-2 focus:ring-yellow-400 py-3 block rounded-lg transition-all duration-200" style={{ color: PALETTE.gray }}>info@brothersholidays.com</a>
            <div className="flex gap-6 mt-2 justify-center md:justify-start py-2">
              {socialLinks.map(link => (
                <a key={link.name} href={link.href} aria-label={link.name}
                  className="transition-transform focus:outline-blue-600 focus:ring-2 focus:ring-yellow-400"
                  style={{ color: PALETTE.blue, fontSize: 30 }}>
                  {link.icon}
                </a>
              ))}
            </div>
            {/* Nepali flag/cultural icon */}
            <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
              <span className="text-xs">Made with</span>
              <span style={{ fontSize: 18 }}>🇳🇵</span>
              <span className="text-xs">in Nepal</span>
            </div>
            <div className="mt-4 text-xs" style={{ color: PALETTE.gray }}>
              <span className="block font-bold mb-1">Visit Us</span>
              Samakhusi, Kathmandu
            </div>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="mt-10 text-center text-xs" style={{ color: PALETTE.gray }}>
        &copy; {new Date().getFullYear()} Brothers Holidays. All rights reserved.
      </div>
      {/* Floating Chatbot Button (bottom-right) */}
      <button
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center text-2xl"
        style={{ background: PALETTE.blue, fontFamily: 'Poppins, Arial, sans-serif', minWidth: 56, minHeight: 56 }}
        aria-label="Customer Care"
        onClick={() => setShowChat(!showChat)} // Toggle chat popup
      >
        <FaHeadset size={28} />
      </button>
      {/* Demo Chat Popup */}
      {showChat && (
        <div className="fixed bottom-24 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-200 w-80 max-w-xs flex flex-col" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-blue-600 rounded-t-xl">
            <span className="text-white font-semibold text-base flex items-center gap-2"><FaHeadset /> Customer Care</span>
            <button onClick={() => setShowChat(false)} aria-label="Close chat" className="text-white text-xl font-bold hover:text-yellow-300">&times;</button>
          </div>
          <div className="p-4 flex-1 text-sm text-gray-700" style={{ minHeight: 120 }}>
            {messages.map((message, index) => (
              <p key={index} className="mb-2">{message}</p>
            ))}
            <div className="mt-4 text-xs text-gray-400">(This is a demo chat popup.)</div>
            {/* WhatsApp Contact Button */}
            <div className="mt-4 flex items-center gap-2">
              <a 
                href="https://wa.me/9779763683242" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <FaWhatsappSquare size={16} />
                <FaThumbsUp size={14} />
                <span>Contact via WhatsApp</span>
              </a>
            </div>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <input type="text" className="w-full px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" placeholder="Type your message..." disabled />
          </div>
        </div>
      )}
    </footer>
  );
}
