"use client";
import React from "react";
import Link from "next/link";
import { FaFacebookSquare, FaInstagram, FaWhatsappSquare } from "react-icons/fa";
import { SiViber } from "react-icons/si";

export interface NavLink {
  name: string;
  href: string;
  icon?: React.ReactNode;
  color?: string;
  dropdown?: boolean;
  special?: boolean;
}

interface NavLinksProps {
  navLinks: NavLink[];
  onLinkClick?: () => void;
  variant?: "desktop" | "mobile";
}

export default function NavLinks({ navLinks, onLinkClick, variant = "desktop" }: NavLinksProps) {
  if (variant === "desktop") {
    return (
      <ul className="hidden md:flex items-center justify-between gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-1.5 flex-nowrap w-full">
        <div className="flex items-center gap-4 md:gap-5 lg:gap-6 xl:gap-8 flex-nowrap">
          {navLinks.map(link => {
            const isMore = link.name === "More";
            return (
              <li key={link.name} className={`relative group${isMore ? " more-nav-item" : ""}`}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 font-semibold text-xs md:text-sm lg:text-base uppercase tracking-wide transition-all duration-300 rounded-xl relative group-hover:scale-105 ${
                    link.special
                      ? "border-2 bg-white/10 text-gold shadow-lg hover:shadow-xl"
                      : "text-white hover:bg-white/10"
                  }`}
                  style={
                    link.special
                      ? {
                          borderColor: "#FFD166",
                          color: "#FFD166",
                          background: "rgba(255,255,255,0.08)",
                          boxShadow: "0 4px 15px rgba(255,209,102,0.2)",
                        }
                      : { color: "#F8F9FA" }
                  }
                >
                  <span
                    style={{
                      color: link.color || '#0057B7',
                      fontSize: 22,
                      display: 'flex',
                      alignItems: 'center',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))',
                      marginRight: 8,
                    }}
                  >
                    {link.icon}
                  </span>
                  {link.name}
                  {link.dropdown && (
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="ml-1 transition-transform duration-300 group-hover:rotate-180"
                    >
                      <path
                        d="M7 8l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span
                    className="absolute left-2 right-2 bottom-1 h-0.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100"
                    style={{ background: "#FFD166" }}
                  />
                </Link>
              </li>
            );
          })}
        </div>
        {/* Social Media Icons - Desktop Only */}
        <div className="hidden md:flex items-center gap-3 ml-4">
          <a href="https://www.facebook.com/brothersholidaysadventure" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: '#1877F3', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaFacebookSquare color="#fff" size={22} />
            </div>
          </a>
          <a href="https://www.instagram.com/brothersholidaysadventure/" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: 'radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaInstagram color="#fff" size={22} />
            </div>
          </a>
          <a href="https://wa.me/9779763683242" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: '#25D366', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaWhatsappSquare color="#fff" size={22} />
            </div>
          </a>
          <a href="https://viber.com" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: '#7c529e', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SiViber color="#fff" size={22} />
            </div>
          </a>
        </div>
      </ul>
    );
  }
  // Mobile variant
  return (
    <div className="flex flex-col gap-2 w-full mb-6">
      {navLinks.filter(link => link.name !== "Social Media").map((link, index) => (
        <div
          key={link.name}
          className="w-full"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Link
            href={link.href}
            className={`flex items-center gap-4 w-full text-left font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 focus:outline-none group ${
              link.special
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "hover:bg-white/80 text-gray-800"
            }`}
            style={{
              minHeight: 56,
              minWidth: 44,
              outline: "none",
              animation: "slideInRight 0.5s ease-out forwards",
              opacity: 0,
              transform: "translateX(20px)",
            }}
            onClick={onLinkClick}
            tabIndex={0}
            aria-label={link.name}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="flex-1 font-bold">{link.name}</span>
            {link.dropdown && (
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 20 20"
                className="transition-transform duration-300 group-hover:rotate-90"
              >
                <path
                  d="M7 8l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
} 