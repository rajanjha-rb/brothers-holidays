"use client";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import Logo from "./navbar/Logo";
import NavLinks from "./navbar/NavLinks";
import AuthButtons from "./navbar/AuthButtons";
import MobileDrawer from "./navbar/MobileDrawer";
import MobileActionBar from "./navbar/MobileActionBar";
import { FaHome, FaSuitcaseRolling, FaRegNewspaper, FaImages, FaEllipsisH, FaPhoneAlt, FaUser } from "react-icons/fa";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const PALETTE = {
  blue: "#0057B7",
  red: "#D72631",
  gold: "#FFD166",
  white: "#F8F9FA",
  darkBlue: "#003D82",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, hydrated, loading } = useAuthStore();
  const router = useRouter();

  // Don't render auth buttons until hydration is complete and not loading
  const showAuthButtons = hydrated && !loading;

  // Create navLinks with conditional dashboard link
  const navLinks = [
    { name: "Home", href: "/", icon: <FaHome />, color: "#fff" },
    { name: "Holidays", href: "/", dropdown: true, icon: <FaSuitcaseRolling />, color: "#FFD166" },
    { name: "Blogs", href: "/", icon: <FaRegNewspaper />, color: "#D72631" },
    { name: "Gallery", href: "/", icon: <FaImages />, color: "#fff" },
    ...(user ? [{ name: "Dashboard", href: "/dashboard", icon: <FaUser />, color: "#fff" }] : []),
    { name: "More", href: "/", dropdown: true, icon: <FaEllipsisH />, color: "#888" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
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
  }, [open]);

  // Keyboard accessibility: close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}>
      {/* Top Bar */}
      <div
        className="bg-white border-b-2 relative overflow-hidden"
        style={{
          borderColor: PALETTE.gold,
          background: scrolled ? "rgba(255,255,255,0.95)" : "white",
          backdropFilter: scrolled ? "blur(10px)" : "none",
        }}
      >
        <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${PALETTE.blue} 0%, ${PALETTE.gold} 100%)` }} />
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 md:px-8 py-3 sm:py-4 relative">
          <Logo />
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+9779807872340"
              className="flex items-center gap-3 font-bold text-base transition-all duration-300 group hover:scale-105"
              style={{ color: PALETTE.red }}
            >
              <div className="relative">
                <span
                  className="p-3 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.red} 0%, ${PALETTE.darkBlue} 100%)`,
                    color: PALETTE.white,
                  }}
                >
                  <FaPhoneAlt size={16} />
                </span>
                <div className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-20" />
              </div>
              <span className="inline">+977 9741726064</span>
            </a>
            <div className="flex items-center gap-3 ml-4">
              {showAuthButtons && user && (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard") }>
                  <Avatar>
                    <AvatarFallback className="bg-[#22223b] text-white font-bold">{(user.name || user.email || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-black">{user.name || user.email || "User"}</span>
                </div>
              )}
              {showAuthButtons && !user && <AuthButtons user={user} variant="desktop" loading={loading} />}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-12 h-12 group relative"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            style={{ touchAction: "manipulation" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <span className={`block w-7 h-0.5 rounded-full transition-all duration-300 ${open ? "rotate-45 translate-y-1.5" : ""}`} style={{ background: PALETTE.red }}></span>
            <span className={`block w-7 h-0.5 rounded-full transition-all duration-300 my-1 ${open ? "opacity-0" : ""}`} style={{ background: PALETTE.red }}></span>
            <span className={`block w-7 h-0.5 rounded-full transition-all duration-300 ${open ? "-rotate-45 -translate-y-1.5" : ""}`} style={{ background: PALETTE.red }}></span>
          </button>
        </div>
      </div>

      {/* Mobile Action Bar */}
      {!open && <MobileActionBar />}

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
      <MobileDrawer open={open} setOpen={setOpen} navLinks={navLinks} user={user} hydrated={showAuthButtons} loading={loading} />

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