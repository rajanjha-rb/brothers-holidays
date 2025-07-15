"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaArrowUp } from "react-icons/fa";

const PALETTE = {
  blue: "#0057B7",
  red: "#D72631",
  gold: "#FFD166",
};

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top on page load and navigation
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Scroll to top immediately on navigation
    scrollToTop();

    // Show scroll to top button when scrolled down
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]); // Re-run when pathname changes

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Manual scroll to top button */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-20 right-4 z-50 p-3 rounded-full shadow-lg flex items-center justify-center text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95 transition-all duration-200 hover:scale-110"
          aria-label="Scroll to Top"
          style={{ 
            minWidth: 48, 
            minHeight: 48,
            background: PALETTE.gold,
            boxShadow: "0 4px 15px rgba(0, 87, 183, 0.3)",
          }}
        >
          <FaArrowUp size={20} color="white" />
        </button>
      )}
    </>
  );
} 