"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  
  const handleModalNavigation = (href: string) => {
    // For mobile modal, use the most aggressive optimization
    setShowMore(false);
    if (onLinkClick) onLinkClick();
    
    // Use a more direct approach for mobile devices
    // This ensures maximum speed on mobile
    try {
      // Try Next.js router first for client-side navigation
      router.push(href);
    } catch {
      // Fallback to direct navigation if router fails
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
          {navLinks.find(link => link.name === "Trips")?.icon}
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
        <span style={{ color: opt.color, fontSize: 22, display: 'flex', alignItems: 'center' }}>{opt.icon(navLinks)}</span>
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
  const router = useRouter();
  
  // Prefetch critical routes for instant navigation
  React.useEffect(() => {
    const criticalRoutes = ['/about', '/contact', '/login', '/register', '/dashboard'];
    
    // Aggressive prefetching for all critical routes
    criticalRoutes.forEach(route => {
      router.prefetch(route);
    });
    
    // Mobile-specific optimizations
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, prefetch routes more aggressively
      criticalRoutes.forEach(route => {
        // Prefetch multiple times to ensure it's cached
        router.prefetch(route);
        setTimeout(() => router.prefetch(route), 100);
        setTimeout(() => router.prefetch(route), 500);
      });
    }
    
    // Also prefetch on hover for even faster navigation (desktop)
    if (!isMobile) {
      const prefetchOnHover = (href: string) => {
        router.prefetch(href);
      };
      
      // Add hover listeners for critical links
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
    // Use Next.js router for instant client-side navigation
    router.push(href);
  };

  const handleMobileNavigation = (href: string) => {
    // For mobile, use the most aggressive optimization
    // Close drawer immediately and navigate instantly
    if (onLinkClick) onLinkClick();
    
    // Use a more direct approach for mobile devices
    // This ensures maximum speed on mobile
    try {
      // Try Next.js router first for client-side navigation
      router.push(href);
    } catch {
      // Fallback to direct navigation if router fails
      window.location.href = href;
    }
  };

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
          {/* Holidays Dropdown */}
          {navLinks.find(link => link.name === "Holidays") && (
            <li key="Holidays" className="relative group holidays-nav-item">
              <DropdownMenu modal={typeof window !== 'undefined' && window.innerWidth >= 768 ? false : true}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 font-semibold text-xs md:text-sm lg:text-base uppercase tracking-wide transition-all duration-300 rounded-xl text-white hover:bg-white/10">
                    <span style={{ color: '#FFD166', fontSize: 22, display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))', marginRight: 8 }}>
                      {navLinks.find(link => link.name === "Holidays")?.icon}
                    </span>
                    Holidays
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
                  <DropdownMenuItem asChild className="rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] hover:text-[#14B8A6] font-semibold text-base px-3 py-2">
                    <Link href="/trips" className="flex items-center gap-2" onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/trips");
                    }}>
                      <span style={{ color: '#14B8A6', fontSize: 20, display: 'flex', alignItems: 'center' }}>
                        {navLinks.find(link => link.name === "Trips")?.icon}
                      </span>
                      Trips
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )}
          {/* More Dropdown */}
          {navLinks.find(link => link.name === "More") && (
            <li key="More" className="relative group more-nav-item">
              <DropdownMenu modal={typeof window !== 'undefined' && window.innerWidth >= 768 ? false : true}>
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
                    <Link href="/blogs" className="flex items-center gap-2" onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/blogs");
                    }}>
                      <span style={{ color: '#D72631', fontSize: 20, display: 'flex', alignItems: 'center' }}>
                        {navLinks.find(link => link.name === "Blogs")?.icon}
                      </span>
                      Blogs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] hover:text-[#0057B7] font-semibold text-base px-3 py-2">
                    <Link href="/about" className="flex items-center gap-2" onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/about");
                    }}>
                      <span style={{ color: '#0057B7', fontSize: 20, display: 'flex', alignItems: 'center' }}>
                        <FaInfoCircle />
                      </span>
                      About
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg transition-all duration-200 hover:bg-[#FFF7E0] hover:text-[#FFD166] font-semibold text-base px-3 py-2">
                    <Link href="/contact" className="flex items-center gap-2" onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/contact");
                    }}>
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
            <span className="text-xl">{link.icon}</span>
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