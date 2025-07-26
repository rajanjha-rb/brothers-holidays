"use client";
import React, { useRef, useEffect } from "react";
import NavLinks, { NavLink, MoreModal } from "./NavLinks";
import AuthButtons from "./AuthButtons";
import type { User } from "./AuthButtons";
import { useState } from "react";

interface MobileDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  navLinks: NavLink[];
  user: User | null;
  hydrated?: boolean;
  loading?: boolean;
}

const PALETTE = {
  blue: "#0057B7",
  gold: "#FFD166",
};

export default function MobileDrawer({ open, setOpen, navLinks, user, hydrated = false, loading = false }: MobileDrawerProps) {
  const [showMore, setShowMore] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Focus trap for accessibility
  useEffect(() => {
    if (!open || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
    const handleTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    drawer.addEventListener("keydown", handleTrap);
    return () => drawer.removeEventListener("keydown", handleTrap);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex" aria-modal="true" role="dialog">
      {/* Overlay */}
      <button
        className="fixed inset-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-200 focus:outline-none"
        aria-label="Close menu overlay"
        tabIndex={0}
        style={{
          outline: "none",
          minWidth: 0,
          border: "none",
          cursor: "pointer",
          zIndex: 40,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={() => setOpen(false)}
      />
      {/* Drawer */}
      <nav
        ref={drawerRef}
        className="md:hidden h-full w-4/5 max-w-sm flex flex-col transition-all duration-300 pointer-events-auto focus:outline-none shadow-2xl relative"
        style={{
          borderTopRightRadius: "2rem",
          borderBottomRightRadius: "2rem",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)",
          backdropFilter: "blur(20px)",
          border: `2px solid ${PALETTE.blue}`,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          outline: "none",
          zIndex: 50,
          position: "relative",
          minHeight: "100vh",
        }}
        aria-label="Mobile menu"
        tabIndex={-1}
      >
        {/* Premium background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-gold-400 rounded-full blur-3xl" />
        </div>
        {/* Close Button */}
        <div className="flex-shrink-0 pt-6 pb-4 px-6 relative">
          <button
            className="absolute top-6 right-6 text-2xl focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            tabIndex={0}
            style={{
              zIndex: 60,
              minWidth: 48,
              minHeight: 48,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 mobile-drawer-content" style={{ minHeight: 0 }}>
          <NavLinks 
            navLinks={navLinks} 
            onLinkClick={() => {
              // Close drawer immediately with no delay
              setOpen(false);
              // Remove body overflow restrictions immediately
              document.body.style.overflow = "";
              document.body.classList.remove("mobile-menu-open");
              // Force immediate cleanup
              setTimeout(() => {
                document.body.style.overflow = "";
                document.body.classList.remove("mobile-menu-open");
              }, 0);
            }} 
            variant="mobile" 
            setShowMore={setShowMore} 
          />
        </div>
        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-6 pb-6 space-y-4" style={{ pointerEvents: 'auto', zIndex: 60 }}>
          {hydrated && (
            <div className="flex flex-col items-center w-full">
              <AuthButtons user={user} setOpen={setOpen} variant="mobile" loading={loading} />
            </div>
          )}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 font-medium">Need Help?</p>
              <a
                href="tel:+9779807872340"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  document.body.style.overflow = "";
                  document.body.classList.remove("mobile-menu-open");
                  // For phone links, use direct href
                  window.open("tel:+9779807872340", "_self");
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 22 16.92z"
                    stroke={PALETTE.blue}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Call +977 9741726064
              </a>
            </div>
          </div>
        </div>
      </nav>
      {/* Render More modal at the end so it overlays all drawer content */}
      {showMore && (
        <MoreModal navLinks={navLinks} setShowMore={setShowMore} onLinkClick={() => setOpen(false)} />
      )}
    </div>
  );
} 