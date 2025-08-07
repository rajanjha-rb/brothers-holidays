"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaFacebookSquare, FaInstagram, FaWhatsappSquare } from "react-icons/fa";
import { SiViber } from "react-icons/si";
import { FaInfoCircle, FaPhoneAlt, FaNewspaper, FaUmbrellaBeach, FaMapMarkedAlt, FaHiking, FaMountain, FaCamera, FaSwimmer } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

// NavLink type definition
export interface NavLink {
  name: string;
  href: string;
  icon?: React.ReactNode;
  color?: string;
  dropdown?: boolean;
  special?: boolean;
}

// Enhanced holiday mega menu data
const holidayMegaMenuData = {
  trips: [
    { name: "Adventure Tours", href: "/trips?category=adventure", icon: <FaHiking /> },
    { name: "Cultural Heritage", href: "/trips?category=cultural", icon: <FaCamera /> },
    { name: "Mountain Expeditions", href: "/trips?category=mountain", icon: <FaMountain /> },
    { name: "Wildlife Safari", href: "/trips?category=wildlife", icon: <FaCamera /> },
  ],
  destinations: [
    { name: "Kathmandu Valley", href: "/destinations/kathmandu", icon: <FaMapMarkedAlt /> },
    { name: "Everest Region", href: "/destinations/everest", icon: <FaMountain /> },
    { name: "Annapurna Circuit", href: "/destinations/annapurna", icon: <FaHiking /> },
    { name: "Chitwan National Park", href: "/destinations/chitwan", icon: <FaCamera /> },
  ],
  activities: [
    { name: "Trekking", href: "/activities/trekking", icon: <FaHiking /> },
    { name: "Mountain Climbing", href: "/activities/climbing", icon: <FaMountain /> },
    { name: "Photography Tours", href: "/activities/photography", icon: <FaCamera /> },
    { name: "River Rafting", href: "/activities/rafting", icon: <FaSwimmer /> },
  ]
};

// Export dropdownOptions and MoreModal for use in MobileDrawer
export const dropdownOptions: {
  label: string;
  href: string;
  icon: () => React.ReactNode;
  color: string;
}[] = [
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

export function MoreModal({ setShowMore, onLinkClick }: { setShowMore: (v: boolean) => void; onLinkClick: () => void }) {
  const router = useRouter();
  
  const handleModalNavigation = (href: string) => {
    setShowMore(false);
    if (onLinkClick) onLinkClick();
    
    try {
      router.push(href);
    } catch {
      window.location.href = href;
    }
  };

  // Add trips to the modal for the Holidays section
  const holidaysLink = (
    <div key="trips">
      <Link
        href="/trips"
        className="flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] focus:bg-[#FFF7E0] font-semibold text-base px-6 py-4 focus:outline-none"
        style={{ color: '#14B8A6', minHeight: 48 }}
        onClick={(e) => {
          e.preventDefault();
          handleModalNavigation("/trips");
        }}
        role="menuitem"
        tabIndex={0}
      >
        <span style={{ color: '#14B8A6', fontSize: 22, display: 'flex', alignItems: 'center' }}>
          <FaUmbrellaBeach />
        </span>
        <span className="text-gray-900 font-medium">Trips</span>
      </Link>
      <div className="h-px bg-[#FFD166] my-1 mx-3 opacity-20"></div>
    </div>
  );

  const dropdownLinks = [holidaysLink, ...dropdownOptions.map((opt, idx) => (
    <div key={opt.label}>
      <Link
        href={opt.href}
        className="flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] focus:bg-[#FFF7E0] font-semibold text-base px-6 py-4 focus:outline-none"
        style={{ color: opt.color, minHeight: 48 }}
        onClick={(e) => {
          e.preventDefault();
          handleModalNavigation(opt.href);
        }}
        role="menuitem"
        tabIndex={0}
      >
        <span style={{ color: opt.color, fontSize: 22, display: 'flex', alignItems: 'center' }}>{opt.icon()}</span>
        <span className="text-gray-900 font-medium">{opt.label}</span>
      </Link>
      {idx < dropdownOptions.length - 1 && (
        <div className="h-px bg-[#FFD166] my-1 mx-3 opacity-20"></div>
      )}
    </div>
  ))];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30" style={{ touchAction: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'auto' }}>
      <div
        className="w-full max-w-[420px] mx-auto bg-white border border-[#FFD166] rounded-2xl shadow-2xl p-0 relative flex flex-col"
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

// Beautiful Mega Menu Component for Holidays
function HolidayMegaMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleNavigation = (href: string) => {
    onClose();
    router.push(href);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      ref={menuRef}
      className="fixed top-[150px] left-1/2 transform -translate-x-1/2 w-[1000px] max-w-[95vw] bg-white rounded-xl shadow-2xl border-2 border-[#FFD166] p-6 z-50"
      style={{ 
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(255,209,102,0.2)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)'
      }}
    >
      
      {/* Header - More Compact */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-[#0057B7] mb-2">Explore Nepal with Us</h3>
        <p className="text-gray-600 text-sm">Discover amazing destinations, thrilling activities, and unforgettable experiences</p>
      </div>
      
      {/* Grid Layout - Compact */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Trips Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#14B8A6] to-[#0d9488] flex items-center justify-center">
              <FaUmbrellaBeach className="text-white text-sm" />
            </div>
            <h4 className="font-bold text-[#0057B7] text-lg">Trips</h4>
          </div>
          {holidayMegaMenuData.trips.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FFF7E0] hover:to-[#FEF3CD] hover:shadow-sm group"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.href);
              }}
            >
              <span className="text-[#14B8A6] group-hover:text-[#0d9488] transition-colors duration-300 text-base">
                {item.icon}
              </span>
              <span className="text-gray-700 font-medium group-hover:text-[#0057B7] transition-colors duration-300 text-sm">
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Destinations Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#D72631] to-[#b91c1c] flex items-center justify-center">
              <FaMapMarkedAlt className="text-white text-sm" />
            </div>
            <h4 className="font-bold text-[#0057B7] text-lg">Destinations</h4>
          </div>
          {holidayMegaMenuData.destinations.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FFF7E0] hover:to-[#FEF3CD] hover:shadow-sm group"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.href);
              }}
            >
              <span className="text-[#D72631] group-hover:text-[#b91c1c] transition-colors duration-300 text-base">
                {item.icon}
              </span>
              <span className="text-gray-700 font-medium group-hover:text-[#0057B7] transition-colors duration-300 text-sm">
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Activities Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FFD166] to-[#f59e0b] flex items-center justify-center">
              <FaHiking className="text-white text-sm" />
            </div>
            <h4 className="font-bold text-[#0057B7] text-lg">Activities</h4>
          </div>
          {holidayMegaMenuData.activities.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FFF7E0] hover:to-[#FEF3CD] hover:shadow-sm group"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.href);
              }}
            >
              <span className="text-[#FFD166] group-hover:text-[#f59e0b] transition-colors duration-300 text-base">
                {item.icon}
              </span>
              <span className="text-gray-700 font-medium group-hover:text-[#0057B7] transition-colors duration-300 text-sm">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer CTA - More Compact */}
      <div className="mt-4 pt-4 border-t border-[#FFD166]/30 text-center">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0057B7] to-[#003D82] text-white font-semibold text-sm rounded-lg hover:from-[#003D82] hover:to-[#0057B7] transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/trips");
          }}
        >
          <FaUmbrellaBeach className="text-sm" />
          <span>View All Trips</span>
        </Link>
      </div>
    </div>
  );
}

// Beautiful More Dropdown Component
function MoreDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleNavigation = (href: string) => {
    onClose();
    router.push(href);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      ref={menuRef}
      className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-[#FFD166] p-4 z-50"
      style={{ 
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(255,209,102,0.2)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)'
      }}
    >
      
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-[#FFD166]/30">
        <h3 className="text-lg font-bold text-[#0057B7]">More Options</h3>
        <p className="text-gray-600 text-xs">Explore more content and information</p>
      </div>
      
      {/* Links */}
      <div className="space-y-2">
        {/* Blogs */}
        <Link
          href="/blogs"
          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FFF0F0] hover:to-[#FFE5E5] hover:shadow-md group"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/blogs");
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#D72631] to-[#b91c1c] flex items-center justify-center">
            <FaNewspaper className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <span className="block text-gray-800 font-semibold group-hover:text-[#D72631] transition-colors duration-300">
              Blogs
            </span>
            <span className="block text-gray-500 text-xs">Travel stories & tips</span>
          </div>
        </Link>

        {/* About */}
        <Link
          href="/about"
          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#F0F7FF] hover:to-[#E5F1FF] hover:shadow-md group"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/about");
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#0057B7] to-[#003D82] flex items-center justify-center">
            <FaInfoCircle className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <span className="block text-gray-800 font-semibold group-hover:text-[#0057B7] transition-colors duration-300">
              About Us
            </span>
            <span className="block text-gray-500 text-xs">Our story & mission</span>
          </div>
        </Link>

        {/* Contact */}
        <Link
          href="/contact"
          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FFFBF0] hover:to-[#FFF7E5] hover:shadow-md group"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/contact");
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FFD166] to-[#f59e0b] flex items-center justify-center">
            <FaPhoneAlt className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <span className="block text-gray-800 font-semibold group-hover:text-[#FFD166] transition-colors duration-300">
              Contact
            </span>
            <span className="block text-gray-500 text-xs">Get in touch with us</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function NavLinks({ navLinks, onLinkClick, variant = "desktop", setShowMore }: { navLinks: NavLink[]; onLinkClick?: () => void; variant?: "desktop" | "mobile"; setShowMore?: (v: boolean) => void }) {
  const router = useRouter();
  const [holidaysOpen, setHolidaysOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const holidaysTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const moreTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Prefetch critical routes for instant navigation
  React.useEffect(() => {
    const criticalRoutes = ['/about', '/contact', '/login', '/register', '/dashboard', '/trips', '/blogs'];
    
    criticalRoutes.forEach(route => {
      router.prefetch(route);
    });
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      criticalRoutes.forEach(route => {
        router.prefetch(route);
        setTimeout(() => router.prefetch(route), 100);
        setTimeout(() => router.prefetch(route), 500);
      });
    }
    
    if (!isMobile) {
      const prefetchOnHover = (href: string) => {
        router.prefetch(href);
      };
      
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          const href = link.getAttribute('href');
          if (href && criticalRoutes.includes(href)) {
            prefetchOnHover(href);
          }
        });
      });
    }
  }, [router]);

  const handleNavigation = (href: string) => {
    if (onLinkClick) onLinkClick();
    router.push(href);
  };

  const handleMobileNavigation = (href: string) => {
    if (onLinkClick) onLinkClick();
    
    try {
      router.push(href);
    } catch {
      window.location.href = href;
    }
  };

  // Holidays dropdown handlers
  const handleHolidaysMouseEnter = () => {
    if (holidaysTimeoutRef.current) {
      clearTimeout(holidaysTimeoutRef.current);
    }
    setHolidaysOpen(true);
  };

  const handleHolidaysMouseLeave = () => {
    holidaysTimeoutRef.current = setTimeout(() => {
      setHolidaysOpen(false);
    }, 150);
  };

  const handleHolidaysClick = () => {
    setHolidaysOpen(!holidaysOpen);
  };

  // More dropdown handlers
  const handleMoreMouseEnter = () => {
    if (moreTimeoutRef.current) {
      clearTimeout(moreTimeoutRef.current);
    }
    setMoreOpen(true);
  };

  const handleMoreMouseLeave = () => {
    moreTimeoutRef.current = setTimeout(() => {
      setMoreOpen(false);
    }, 150);
  };

  const handleMoreClick = () => {
    setMoreOpen(!moreOpen);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (holidaysTimeoutRef.current) {
        clearTimeout(holidaysTimeoutRef.current);
      }
      if (moreTimeoutRef.current) {
        clearTimeout(moreTimeoutRef.current);
      }
    };
  }, []);

  if (variant === "desktop") {
    return (
      <ul className="hidden md:flex items-center justify-between gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-1.5 flex-nowrap w-full">
        <div className="flex items-center gap-4 md:gap-5 lg:gap-6 xl:gap-8 flex-nowrap">
          {navLinks.filter(link => link.name !== "More" && link.name !== "Holidays").map(link => (
            <li key={link.name} className={`relative group`}>
              <Link
                href={link.href}
                className={`flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 font-semibold text-xs md:text-sm lg:text-base uppercase tracking-wide transition-all duration-200 rounded-xl relative group-hover:scale-105 ${
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
                onClick={(e) => {
                  if (link.href !== "/" && link.href !== "#") {
                    e.preventDefault();
                    handleNavigation(link.href);
                  }
                }}
              >
                <span
                  style={{
                    color: link.color || (link.name === "Home" ? "#FFD166" : "#0057B7"),
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))',
                    marginRight: 8,
                    minWidth: 22,
                    minHeight: 22,
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
          
          {/* Holidays Mega Menu */}
          {navLinks.find(link => link.name === "Holidays") && (
            <li 
              key="Holidays" 
              className="relative group holidays-nav-item"
              onMouseEnter={handleHolidaysMouseEnter}
              onMouseLeave={handleHolidaysMouseLeave}
            >
              <button 
                className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 font-semibold text-xs md:text-sm lg:text-base uppercase tracking-wide transition-all duration-300 rounded-xl text-white hover:bg-white/10"
                onClick={handleHolidaysClick}
              >
                    <span style={{ color: '#FFD166', fontSize: 22, display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))', marginRight: 8 }}>
                      {navLinks.find(link => link.name === "Holidays")?.icon}
                    </span>
                    Holidays
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 20 20"
                  className={`ml-1 transition-transform duration-300 ${holidaysOpen ? "rotate-180" : ""}`}
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
              <HolidayMegaMenu isOpen={holidaysOpen} onClose={() => setHolidaysOpen(false)} />
            </li>
          )}
          
          {/* More Dropdown */}
          {navLinks.find(link => link.name === "More") && (
            <li 
              key="More" 
              className="relative group more-nav-item"
              onMouseEnter={handleMoreMouseEnter}
              onMouseLeave={handleMoreMouseLeave}
            >
              <button 
                className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 font-semibold text-xs md:text-sm lg:text-base uppercase tracking-wide transition-all duration-300 rounded-xl text-white hover:bg-white/10"
                onClick={handleMoreClick}
              >
                    <span style={{ color: '#888', fontSize: 22, display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))', marginRight: 8 }}>
                      {navLinks.find(link => link.name === "More")?.icon}
                    </span>
                    More
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 20 20"
                  className={`ml-1 transition-transform duration-300 ${moreOpen ? "rotate-180" : ""}`}
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
              <MoreDropdown isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
            </li>
                    )}
        </div>
        
        {/* Social Media Icons */}
        <div className="hidden md:flex items-center gap-2 ml-4">
          <a href="https://www.facebook.com/brothersholidaysadventure" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: '#1877F3', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaFacebookSquare color="#fff" size={18} />
            </div>
          </a>
          <a href="https://www.instagram.com/brothersholidaysadventure/" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: 'radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaInstagram color="#fff" size={18} />
            </div>
          </a>
          <a href="https://wa.me/9779763683242" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: '#25D366', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaWhatsappSquare color="#fff" size={18} />
            </div>
          </a>
          <a href="https://viber.com" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110">
            <div style={{ background: '#7c529e', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SiViber color="#fff" size={18} />
            </div>
          </a>
        </div>
      </ul>
    );
  }
  
  // Mobile variant
  return (
    <div className="flex flex-col gap-2 w-full mb-6">
      {navLinks.filter(link => link.name !== "Social Media" && link.name !== "More" && link.name !== "Holidays" && link.name !== "Trips").map((link) => (
        <div
          key={link.name}
          className="w-full"
        >
          <Link
            href={link.href}
            className={`flex items-center gap-4 w-full text-left font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-105 focus:outline-none group ${
              link.special
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "hover:bg-white/80 text-gray-800"
            }`}
            style={{
              minHeight: 56,
              minWidth: 44,
              outline: "none",
            }}
            onClick={(e) => {
              e.preventDefault();
              handleMobileNavigation(link.href);
            }}
            tabIndex={0}
            aria-label={link.name}
          >
            <span 
              className="text-xl"
              style={{ 
                color: link.name === "Home" ? "#FFD166" : (link.color || "#333"),
                minWidth: 24,
                minHeight: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {link.icon}
            </span>
            <span className="flex-1 font-bold">{link.name}</span>
          </Link>
        </div>
      ))}
      
      {/* Holidays Dropdown for Mobile */}
      {navLinks.find(link => link.name === "Holidays") && (
        <div className="relative w-full">
          <button
            className="flex items-center gap-4 w-full text-left font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-200 focus:outline-none group bg-transparent text-gray-800"
            style={{ minHeight: 56, minWidth: 44, outline: "none" }}
            onClick={() => (setShowMore ? setShowMore(true) : undefined)}
            tabIndex={0}
            aria-label="Holidays"
          >
            <span className="text-xl">{navLinks.find(link => link.name === "Holidays")?.icon}</span>
            <span className="flex-1 font-bold">Holidays</span>
            <span className="ml-2 flex items-center">
              <FaChevronDown size={18} color="#FFD166" />
            </span>
          </button>
        </div>
      )}
      
      {/* More Dropdown for Mobile */}
      {navLinks.find(link => link.name === "More") && (
        <div className="relative w-full">
          <button
            className="flex items-center gap-4 w-full text-left font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-200 focus:outline-none group bg-transparent text-gray-800"
            style={{ minHeight: 56, minWidth: 44, outline: "none" }}
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