"use client";
import React, { useState } from "react";
import { FaFacebookSquare, FaInstagram, FaWhatsappSquare } from "react-icons/fa";
import { SiViber } from "react-icons/si";

const PALETTE = {
  blue: "#0057B7",
  red: "#D72631",
  gold: "#FFD166",
  darkBlue: "#003D82",
  lightGold: "#FFE5A3",
  white: "#F8F9FA",
};

export default function MobileActionBar() {
  const [showSocial, setShowSocial] = useState(false);
  return (
    <>
      <div
        className="md:hidden w-full relative overflow-hidden mobile-action-bar"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.blue} 0%, ${PALETTE.darkBlue} 100%)`,
        }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-20 h-20 bg-gold-400 rounded-full blur-xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-red-400 rounded-full blur-xl" />
        </div>
        <div className="flex justify-center items-center gap-3 px-4 py-3 relative">
          {/* Social Media Button */}
          <button
            type="button"
            onClick={() => setShowSocial(true)}
            className="flex items-center gap-2 flex-1 justify-center py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${PALETTE.red} 0%, ${PALETTE.darkBlue} 100%)`,
              color: PALETTE.white,
              maxWidth: "160px",
              boxShadow: "0 4px 15px rgba(215,38,49,0.3)",
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block"
            >
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="font-bold">Social Media</span>
          </button>
          {/* Call Now Button */}
          <a
            href="tel:+9779807872340"
            className="flex items-center gap-2 flex-1 justify-center py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.lightGold} 100%)`,
              color: PALETTE.blue,
              maxWidth: "160px",
              boxShadow: "0 4px 15px rgba(255,209,102,0.3)",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 22 16.92z"
                stroke={PALETTE.blue}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-bold">Call Now</span>
          </a>
        </div>
      </div>
      {/* Social Media Modal */}
      {showSocial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-xs mx-auto flex flex-col items-center relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowSocial(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="mb-4 text-lg font-bold text-gray-800">Follow us</div>
            <div className="flex gap-6 mb-2">
              <a href="https://www.facebook.com/brothersholidaysadventure" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition-transform duration-200 hover:scale-110">
                <div style={{ background: '#1877F3', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaFacebookSquare color="#fff" size={28} />
                </div>
              </a>
              <a href="https://www.instagram.com/brothersholidaysadventure/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-transform duration-200 hover:scale-110">
                <div style={{ background: 'radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaInstagram color="#fff" size={28} />
                </div>
              </a>
              <a href="https://wa.me/9779763683242" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="transition-transform duration-200 hover:scale-110">
                <div style={{ background: '#25D366', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaWhatsappSquare color="#fff" size={28} />
                </div>
              </a>
              <a href="https://viber.com" target="_blank" rel="noopener noreferrer" aria-label="Viber" className="transition-transform duration-200 hover:scale-110">
                <div style={{ background: '#7c529e', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SiViber color="#fff" size={28} />
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 