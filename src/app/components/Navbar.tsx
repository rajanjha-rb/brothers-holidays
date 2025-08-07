"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuthState, useAuthStore, debugAuthState } from "@/store/auth";
import Logo from "./navbar/Logo";
import NavLinks, { NavLink } from "./navbar/NavLinks";
import MobileDrawer from "./navbar/MobileDrawer";
import MobileActionBar from "./navbar/MobileActionBar";
import { FaHome, FaEllipsisH, FaPhoneAlt, FaUser, FaSignOutAlt, FaEnvelope, FaCalendarAlt, FaUmbrellaBeach, FaNewspaper } from "react-icons/fa";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PALETTE = {
  blue: "#0057B7",
  red: "#D72631",
  gold: "#FFD166",
  white: "#F8F9FA",
  darkBlue: "#003D82",
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, hydrated, loading, isAdmin } = useAuthState();
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      // Logout failed silently
    }
  };

  // Debug function for development
  const handleDebugAuth = () => {
    debugAuthState();
  };

  
          // User authentication status checked
  
  // Ensure component is mounted before showing auth state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize navLinks to prevent unnecessary re-renders
  const navLinks = useMemo(() => {
    const baseLinks: NavLink[] = [
      {
        name: "Home",
        href: "/",
        icon: <FaHome />,
        color: "#0057B7",
      },
      {
        name: "Blogs",
        href: "/blogs",
        icon: <FaNewspaper />,
        color: "#D72631",
      },
      {
        name: "Holidays",
        href: "#",
        icon: <FaUmbrellaBeach />,
        color: "#FFD166",
        dropdown: true,
      },
      {
        name: "More",
        href: "#",
        icon: <FaEllipsisH />,
        color: "#888",
        dropdown: true,
      },
    ];

    // Only add dashboard link if user is admin and component is mounted
    // Use cached auth status for better performance
    if (mounted && hydrated && user && isAdmin) {
      baseLinks.splice(4, 0, { name: "Dashboard", href: "/dashboard", icon: <FaUser />, color: "#fff" });
    }

    return baseLinks;
  }, [mounted, hydrated, user, isAdmin]);

  // Handle scroll effect with throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open (NOT dropdown menus)
  useEffect(() => {
    // Only prevent scrolling on mobile devices when mobile menu is open
    const isMobile = window.innerWidth < 768; // md breakpoint
    
    if (mobileMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileMenuOpen]);

  // Keyboard accessibility: close on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className={`w-full sticky top-0 z-40 transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}>
      {/* Top Bar */}
      <div
        className="bg-white border-b-2 relative overflow-hidden"
        style={{
          borderColor: "#e5e7eb",
          background: scrolled ? "rgba(255,255,255,0.95)" : "white",
          backdropFilter: scrolled ? "blur(10px)" : "none",
        }}
      >
        <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)` }} />
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 md:px-8 py-3 sm:py-4 relative">
          <Logo />
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {/* Contact Info */}
            <div className="flex items-center gap-4">
              {/* Phone Number */}
              <a
                href="tel:+9779807872340"
                className="group relative flex items-center gap-2 font-semibold text-xs md:text-sm uppercase tracking-wide contact-hover"
                style={{ color: PALETTE.red }}
              >
                <div className="relative elegant-animation">
                  <span
                    className="p-2.5 rounded-lg flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:scale-110 gentle-glow"
                    style={{
                      background: `linear-gradient(135deg, ${PALETTE.red} 0%, ${PALETTE.darkBlue} 100%)`,
                      color: PALETTE.white,
                    }}
                  >
                    <FaPhoneAlt size={14} className="contact-icon transition-transform duration-300 group-hover:rotate-12" />
                  </span>
                  {/* Elegant pulse animation */}
                  <div className="elegant-pulse"></div>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" />
                </div>
                <span className="hidden lg:inline transition-all duration-300 group-hover:translate-x-1">+977 9741726064</span>
                <span className="lg:hidden transition-all duration-300 group-hover:translate-x-1">Call</span>
              </a>
              
              {/* Email Address */}
              <a
                href="mailto:brothersholidays@gmail.com"
                className="group relative flex items-center gap-2 font-semibold text-xs md:text-sm uppercase tracking-wide contact-hover"
                style={{ color: PALETTE.blue }}
              >
                <div className="relative email-elegant">
                  <span
                    className="p-2.5 rounded-lg flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:scale-110 email-gentle-glow"
                    style={{
                      background: `linear-gradient(135deg, ${PALETTE.blue} 0%, ${PALETTE.darkBlue} 100%)`,
                      color: PALETTE.white,
                    }}
                  >
                    <FaEnvelope size={14} className="contact-icon transition-transform duration-300 group-hover:rotate-12" />
                  </span>
                  {/* Elegant email pulse animation */}
                  <div className="email-elegant-pulse"></div>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" />
                </div>
                <span className="hidden xl:inline transition-all duration-300 group-hover:translate-x-1">brothersholidays@gmail.com</span>
                <span className="hidden lg:inline xl:hidden transition-all duration-300 group-hover:translate-x-1">brothersholidays@</span>
                <span className="lg:hidden transition-all duration-300 group-hover:translate-x-1">Email</span>
              </a>
            </div>
            {/* Book Now Button - Hide for logged-in admin users */}
            {!(mounted && hydrated && !loading && user && isAdmin) && (
              <div className="flex items-center ml-4">
                <Link
                  href="/booking"
                  className="group relative flex items-center gap-2 px-4 py-2.5 font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-full overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                    boxShadow: "0 4px 20px rgba(255,107,53,0.25), 0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    router.push("/booking");
                  }}
                >
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {/* Icon with glow effect */}
                  <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm">
                    <FaCalendarAlt className="text-white text-sm" />
                  </span>
                  
                  {/* Text */}
                  <span className="relative z-10 text-white font-semibold">Book Now</span>
                  
                  {/* Arrow indicator */}
                  <span className="relative z-10 text-white text-xs opacity-80 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            )}
            {/* Debug button for development */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleDebugAuth}
                className="px-2 py-1 text-xs bg-yellow-500 text-black rounded"
                title="Debug Auth State"
              >
                Debug
              </button>
            )}
            
            {/* User Avatar for logged-in users */}
            {mounted && hydrated && !loading && user && (
              <div className="flex items-center gap-3 ml-4">
                {isAdmin ? (
                  // Admin users - direct navigation to dashboard
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                    router.push("/dashboard");
                  }}>
                    <Avatar>
                      <AvatarFallback className="bg-[#22223b] text-white font-bold">{(user.name || user.email || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-black">{user.name || user.email || "User"}</span>
                  </div>
                ) : (
                  // Non-admin users - dropdown with logout option
                  <DropdownMenu modal={typeof window !== 'undefined' && window.innerWidth >= 768 ? false : true}>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <Avatar>
                          <AvatarFallback className="bg-[#22223b] text-white font-bold">{(user.name || user.email || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-black">{user.name || user.email || "User"}</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        variant="destructive"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-12 h-12 group relative"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
            style={{ touchAction: "manipulation" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <span className={`block w-7 h-0.5 rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} style={{ background: PALETTE.red }}></span>
            <span className={`block w-7 h-0.5 rounded-full transition-all duration-300 my-1 ${mobileMenuOpen ? "opacity-0" : ""}`} style={{ background: PALETTE.red }}></span>
            <span className={`block w-7 h-0.5 rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} style={{ background: PALETTE.red }}></span>
          </button>
        </div>
      </div>

      {/* Mobile Action Bar */}
      {!mobileMenuOpen && <MobileActionBar />}

      {/* Bottom Navigation */}
      <nav className="w-full shadow-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PALETTE.blue} 0%, ${PALETTE.darkBlue} 100%)` }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-red-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 relative flex-nowrap">
          <NavLinks navLinks={navLinks} variant="desktop" />
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileMenuOpen} setOpen={setMobileMenuOpen} navLinks={navLinks} user={user} hydrated={mounted && hydrated && !loading} loading={loading} />

      {/* Custom CSS */}
      <style jsx global>{`
        @media (max-width: 970px) {
          .more-nav-item {
            display: none !important;
          }
        }
        .mobile-menu-open {
          overflow: hidden;
        }
        .mobile-menu-open button[aria-label="Chatbot"] {
          display: none !important;
        }
        .mobile-menu-open button[aria-label="Back to Top"] {
          display: none !important;
        }
        .mobile-menu-open .md\\:hidden {
          display: none !important;
        }
        .mobile-menu-open div[class*="md:hidden"] {
          display: none !important;
        }
        .mobile-menu-open div.md\\:hidden {
          display: none !important;
        }
        .mobile-menu-open .mobile-action-bar {
          display: none !important;
        }
      `}</style>
    </header>
  );
}