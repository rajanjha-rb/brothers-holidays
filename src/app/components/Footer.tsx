"use client";

import React, { useState, useCallback, useMemo } from "react";
import { FaFacebookSquare, FaInstagram, FaWhatsappSquare, FaHeadset, FaThumbsUp } from "react-icons/fa";
import { SiViber } from "react-icons/si";


const PALETTE = {
  blue: "#0057B7",
  red: "#D72631",
  gold: "#FFD166",
  white: "#F8F9FA",
  gray: "#495057",
};

// Memoized social links
const socialLinks = [
  { 
    name: "Facebook", 
    href: "https://www.facebook.com/brothersholidaysadventure", 
    icon: <FaFacebookSquare className="text-white text-xl" />,
    bgColor: '#1877F3'
  },
  { 
    name: "Instagram", 
    href: "https://www.instagram.com/brothersholidaysadventure/", 
    icon: <FaInstagram className="text-white text-xl" />,
    bgColor: 'radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'
  },
  { 
    name: "WhatsApp", 
    href: "https://wa.me/9779763683242", 
    icon: <FaWhatsappSquare className="text-white text-xl" />,
    bgColor: '#25D366'
  },
  { 
    name: "Viber", 
    href: "https://viber.com", 
    icon: <SiViber className="text-white text-xl" />,
    bgColor: '#7c529e'
  },
];

// Memoized social link component
const SocialLink = React.memo(({ link }: { link: typeof socialLinks[0] }) => (
  <a
    href={link.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110"
    style={{ background: link.bgColor }}
    aria-label={link.name}
  >
    {link.icon}
  </a>
));

SocialLink.displayName = 'SocialLink';

// Memoized chat component
const ChatWidget = React.memo(({ showChat, setShowChat, messages }: {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  messages: string[];
}) => (
  <div className="fixed bottom-4 right-4 z-50">
    <button
      onClick={() => setShowChat(!showChat)}
      className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      aria-label="Chat with us"
    >
      <FaHeadset className="text-xl" />
    </button>
    
    {showChat && (
      <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Chat with us</h3>
          <button
            onClick={() => setShowChat(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close chat"
          >
            ×
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded text-sm">
              {msg}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
));

ChatWidget.displayName = 'ChatWidget';

export default function Footer() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  
  // Memoized navigation links
  const navLinks1 = useMemo(() => [{ name: "Holidays", href: "#" }], []);
  const navLinks2 = useMemo(() => [
    { name: "About Us", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Contact", href: "#" },
  ], []);

  // Handle chat messages
  const handleChatToggle = useCallback((show: boolean) => {
    setShowChat(show);
    if (show) {
      setMessages([]);
      // Add messages with delays
      const messageList = [
        "Hi there! 👋 Welcome to Brothers Holidays!",
        "I'm here to help you plan your perfect holiday. What can I assist you with today?",
        "We offer amazing packages to Nepal, India, and worldwide destinations! 🌍",
        "Feel free to ask about our packages, pricing, or any travel questions!"
      ];
      
      messageList.forEach((msg, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, msg]);
        }, 500 * (index + 1));
      });
    }
  }, []);

  return (
    <footer style={{ background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)', color: PALETTE.gray }} className="w-full border-t border-gray-200 pt-0 pb-8 px-2 sm:px-4 md:px-8 mt-16 text-base sm:text-sm py-10 px-4 overflow-x-hidden font-sans">
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
            Your trusted partner for unforgettable travel experiences. We specialize in creating personalized journeys that connect you with the world&apos;s most amazing destinations.
          </p>
          <div className="flex items-center gap-2 mx-auto md:mx-0">
            <FaThumbsUp className="text-green-500" />
            <span className="text-sm font-medium">Trusted by 10,000+ travelers</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="w-full flex flex-col gap-3 items-center md:items-start text-center md:text-left py-6 md:py-0">
          <h3 className="font-bold text-lg" style={{ color: PALETTE.blue }}>Quick Links</h3>
          <div className="flex flex-col gap-2">
            {navLinks1.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm hover:text-blue-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div className="w-full flex flex-col gap-3 items-center md:items-start text-center md:text-left py-6 md:py-0">
          <h3 className="font-bold text-lg" style={{ color: PALETTE.blue }}>Company</h3>
          <div className="flex flex-col gap-2">
            {navLinks2.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm hover:text-blue-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Contact & Social */}
        <div className="w-full flex flex-col gap-3 items-center md:items-start text-center md:text-left py-6 md:py-0">
          <h3 className="font-bold text-lg" style={{ color: PALETTE.blue }}>Connect With Us</h3>
          <div className="flex flex-col gap-2">
            <p className="text-sm">+977 9741726064</p>
            <p className="text-sm">info@brothersholidays.com</p>
            <div className="flex gap-3 mt-2">
              {socialLinks.map((link) => (
                <SocialLink key={link.name} link={link} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">
          © 2024 Brothers Holidays. All rights reserved.
        </p>
      </div>

      {/* Chat Widget */}
      <ChatWidget 
        showChat={showChat} 
        setShowChat={handleChatToggle} 
        messages={messages} 
      />
    </footer>
  );
}
