"use client";
import React from "react";
import Link from "next/link";
import { FaFacebookSquare, FaInstagram, FaWhatsappSquare } from "react-icons/fa";
import { SiViber } from "react-icons/si";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FaInfoCircle, FaPhoneAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import type { NavLink as NavLinkType } from './NavLinks';
// Export dropdownOptions and MoreModal for use in MobileDrawer
export const dropdownOptions: {
  label: string;
  href: string;
  icon: (navLinks: NavLinkType[]) => React.ReactNode;
  color: string;
}[] = [
  {
    label: 'Blogs',
    href: '/',
    icon: (navLinks: NavLinkType[]) => navLinks.find((link: NavLinkType) => link.name === "Blogs")?.icon,
    color: '#D72631',
  },
  {
    label: 'About',
    href: '/about',
    icon: () => <FaInfoCircle />,
    color: '#0057B7',
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: () => <FaPhoneAlt />,
    color: '#FFD166',
  },
];

export function MoreModal({ navLinks, setShowMore, onLinkClick }: { navLinks: NavLinkType[]; setShowMore: (v: boolean) => void; onLinkClick: () => void }) {
  const dropdownLinks = dropdownOptions.map((opt, idx) => (
    <div key={opt.label}>
      <Link
        href={opt.href}
        className="flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] focus:bg-[#FFF7E0] font-semibold text-base px-6 py-4 focus:outline-none"
        style={{ color: opt.color, minHeight: 48 }}
        onClick={() => {
          setShowMore(false);
          if (onLinkClick) onLinkClick();
        }}
        role="menuitem"
        tabIndex={0}
      >
        <span style={{ color: opt.color, fontSize: 22, display: 'flex', alignItems: 'center' }}>{opt.icon(navLinks)}</span>
        <span className="text-gray-900 font-medium">{opt.label}</span>
      </Link>
      {idx < dropdownOptions.length - 1 && (
        <div className="h-px bg-[#FFD166] my-1 mx-3 opacity-20"></div>
      )}
    </div>
  ));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 animate-fadeInMobile" style={{ touchAction: 'none' }}>
      <div
        className="w-full max-w-[420px] mx-auto bg-white border border-[#FFD166] rounded-2xl shadow-2xl p-0 animate-slideUpMobile relative flex flex-col"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: '80vh' }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <button
          className="w-full flex items-center justify-center py-4 border-b border-[#FFD166] bg-white rounded-t-2xl"
          onClick={() => setShowMore(false)}
          aria-label="Close more options"
          tabIndex={0}
        >
          <FaChevronDown size={28} color="#D72631" />
        </button>
        <div className="flex flex-col gap-1 py-2 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 64px)' }}>
          {dropdownLinks}
        </div>
      </div>
    </div>
  );
}

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
  setShowMore?: (v: boolean) => void;
}

export default function NavLinks({ navLinks, onLinkClick, variant = "desktop", setShowMore }: NavLinksProps) {
  if (variant === "desktop") {
    return (
      <ul className="hidden md:flex items-center justify-between gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-1.5 flex-nowrap w-full">
        <div className="flex items-center gap-4 md:gap-5 lg:gap-6 xl:gap-8 flex-nowrap">
          {navLinks.filter(link => link.name !== "More" && link.name !== "Blogs").map(link => (
            <li key={link.name} className={`relative group`}>
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
                <span
                  className="absolute left-2 right-2 bottom-1 h-0.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100"
                  style={{ background: "#FFD166" }}
                />
              </Link>
            </li>
          ))}
          {/* More Dropdown */}
          {navLinks.find(link => link.name === "More") && (
            <li key="More" className="relative group more-nav-item">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 font-semibold text-xs md:text-sm lg:text-base uppercase tracking-wide transition-all duration-300 rounded-xl text-white hover:bg-white/10">
                    <span style={{ color: '#888', fontSize: 22, display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))', marginRight: 8 }}>
                      {navLinks.find(link => link.name === "More")?.icon}
                    </span>
                    More
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
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end"
                   className="bg-white border-2 border-[#FFD166] rounded-xl shadow-xl p-2 min-w-[180px]"
                   style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                 >
                  <DropdownMenuItem asChild className="rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] hover:text-[#D72631] font-semibold text-base px-3 py-2">
                    <Link href="/" className="flex items-center gap-2">
                      <span style={{ color: '#D72631', fontSize: 20, display: 'flex', alignItems: 'center' }}>
                        {navLinks.find(link => link.name === "Blogs")?.icon}
                      </span>
                      Blogs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] hover:text-[#0057B7] font-semibold text-base px-3 py-2">
                    <Link href="/about" className="flex items-center gap-2">
                      <span style={{ color: '#0057B7', fontSize: 20, display: 'flex', alignItems: 'center' }}>
                        <FaInfoCircle />
                      </span>
                      About
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] hover:text-[#FFD166] font-semibold text-base px-3 py-2">
                    <Link href="/contact" className="flex items-center gap-2">
                      <span style={{ color: '#FFD166', fontSize: 20, display: 'flex', alignItems: 'center' }}>
                        <FaPhoneAlt />
                      </span>
                      Contact
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )}
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
      {navLinks.filter(link => link.name !== "Social Media" && link.name !== "More").map((link, index) => (
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
          </Link>
        </div>
      ))}
      {/* More Dropdown for Mobile */}
      {navLinks.find(link => link.name === "More") && (
        <div className="relative w-full">
          <button
            className="flex items-center gap-4 w-full text-left font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-300 focus:outline-none group bg-transparent text-gray-800"
            style={{ minHeight: 56, minWidth: 44, outline: "none", animation: "slideInRight 0.5s ease-out forwards", opacity: 0, transform: "translateX(20px)" }}
            onClick={() => (setShowMore ? setShowMore(true) : undefined)}
            tabIndex={0}
            aria-label="More"
          >
            <span className="text-xl">{navLinks.find(link => link.name === "More")?.icon}</span>
            <span className="flex-1 font-bold">More</span>
            <span className="ml-2 flex items-center">
              <FaChevronDown size={18} color="#D72631" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
} 