"use client";

import React from "react";

export default function ScrollButton() {
  const handleScroll = () => {
    // Scroll to the very beginning of the page to ensure nothing is skipped
    // Account for any fixed headers or navigation
    const navbar = document.querySelector('header');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    
    // Scroll to the very top of the page, accounting for navbar, plus a bit more
    window.scrollTo({
      top: navbarHeight + 100,
      behavior: 'smooth'
    });
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
      <button 
        onClick={handleScroll}
        className="flex flex-col items-center space-y-2 cursor-pointer group"
      >
        {/* Simple scroll indicator with wave */}
        <div className="relative">
          <div className="w-5 h-7 border border-white/70 rounded-full flex justify-center items-start pt-1 group-hover:border-white transition-all duration-300">
            <div className="w-0.5 h-2 bg-white/90 rounded-full animate-bounce"></div>
          </div>
          {/* More visible wave effect */}
          <div className="absolute inset-0 w-5 h-7 border border-white/60 rounded-full opacity-60 animate-ping transition-all duration-1200"></div>
          {/* Second wave for better visibility */}
          <div className="absolute inset-0 w-5 h-7 border border-white/40 rounded-full opacity-40 animate-ping transition-all duration-1800" style={{animationDelay: '0.6s'}}></div>
        </div>
        
        {/* Simple text */}
        <span className="text-white/80 text-xs font-medium group-hover:text-white transition-colors duration-300">
          Scroll
        </span>
      </button>
    </div>
  );
} 