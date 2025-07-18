"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const slides = [
  {
    img: "/1.webp",
    headline: "Explore the Hidden Gems of Nepal",
    subheadline: "From Himalayan peaks to ancient temples — discover all.",
    alt: "Beautiful Nepal landscape with mountains and temples",
  },
  {
    img: "/2.webp",
    headline: "Journey Through Culture and Nature",
    subheadline: "Nepal offers unforgettable experiences at every turn.",
    alt: "Nepal cultural and natural scenery",
  },
  {
    img: "/3.webp",
    headline: "Timeless Nepal Awaits Your Next Escape",
    subheadline: "Nepal welcomes every soul seeking adventure and peace",
    alt: "Serene Nepal destination for adventure and peace",
  },
];

interface HeroSectionProps {
  searchBoxRef?: React.RefObject<HTMLDivElement | null>;
}

export default function HeroSection({ searchBoxRef }: HeroSectionProps) {
  const pathname = usePathname();
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null); // new state
  const [extraPadding, setExtraPadding] = useState(0);
  const [verticalDots, setVerticalDots] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const lastSwitchRef = useRef(Date.now());
  // Track loading state for each slide
  const [imageLoadedArr, setImageLoadedArr] = useState(() => slides.map((_, i) => i === 0 ? false : false));

  // Helper: is current image loaded?
  const isCurrentImageLoaded = imageLoadedArr[currentIndex];

  // Slide change handler
  const requestSlideChange = (idx: number) => {
    if (idx === currentIndex) return;
    setPendingIndex(idx);
    // If image is already loaded, update immediately
    if (imageLoadedArr[idx]) {
      setCurrentIndex(idx);
      setPendingIndex(null);
    }
  };

  // Auto-advance logic and pendingIndex update (combined and guarded)
  useEffect(() => {
    if (!imageLoadedArr[0] || pathname !== "/" || !isVisible) return;
    let interval: NodeJS.Timeout | null = null;
    // Auto-advance
    interval = setInterval(() => {
      const nextIdx = (currentIndex + 1) % slides.length;
      if (nextIdx !== currentIndex) {
        if (imageLoadedArr[nextIdx]) {
          if (currentIndex !== nextIdx) setCurrentIndex(nextIdx);
        } else {
          if (pendingIndex !== nextIdx) setPendingIndex(nextIdx);
        }
      }
    }, 4000);
    // Pending index update (guarded)
    if (pendingIndex !== null && imageLoadedArr[pendingIndex]) {
      if (currentIndex !== pendingIndex) setCurrentIndex(pendingIndex);
      setPendingIndex(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [imageLoadedArr, currentIndex, pendingIndex, pathname, isVisible]);

  // When pendingIndex is set, if image is not loaded, set it to false (to trigger loading state)
  useEffect(() => {
    if (pendingIndex !== null && !imageLoadedArr[pendingIndex]) {
      setImageLoadedArr((prev) => {
        if (prev[pendingIndex] === false) return prev; // guard
        const arr = [...prev];
        arr[pendingIndex] = false;
        return arr;
      });
    }
  }, [pendingIndex, imageLoadedArr]);

  // Helper to measure gap only when horizontal dots are rendered
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    function adjustPadding() {
      if (!dotsRef.current || !searchBoxRef?.current) return;
      const dotsRect = dotsRef.current.getBoundingClientRect();
      const searchRect = searchBoxRef.current.getBoundingClientRect();
      const gap = searchRect.top - dotsRect.bottom;
      const minGap = 24;
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const now = Date.now();
        // Only switch if lockout period has passed
        if (!verticalDots && gap < minGap && now - lastSwitchRef.current > 200) {
          setVerticalDots(true);
          lastSwitchRef.current = now;
        } else if (verticalDots && gap >= minGap && now - lastSwitchRef.current > 200) {
          setVerticalDots(false);
          lastSwitchRef.current = now;
        }
        setExtraPadding(gap < minGap ? minGap - gap : 0);
      }, 80);
    }
    // Only measure when horizontal dots are rendered
    if (!verticalDots) {
      adjustPadding();
    }
    window.addEventListener("resize", adjustPadding);
    return () => {
      clearTimeout(debounceTimeout);
      window.removeEventListener("resize", adjustPadding);
    };
  }, [searchBoxRef, currentIndex, verticalDots]);

  // Intersection Observer to track visibility
  useEffect(() => {
    const node = heroRef.current;
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  // The image to show is always the currentIndex
  return (
    <section ref={heroRef} className="relative w-full bg-[#F8F9FA] overflow-hidden">
      {/* Image with responsive height */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] max-h-[90vh]">
        <Image
          src={slides[currentIndex].img}
          alt={slides[currentIndex].alt}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 60vw"
          priority={currentIndex === 0}
          quality={90}
          className="object-cover"
          style={{ objectPosition: "center" }}
          onLoadingComplete={() => {
            setImageLoadedArr((prev) => {
              if (prev[currentIndex]) return prev;
              const arr = [...prev];
              arr[currentIndex] = true;
              return arr;
            });
            // If pendingIndex is this image, update currentIndex
            if (pendingIndex === currentIndex) {
              setCurrentIndex(currentIndex);
              setPendingIndex(null);
            }
          }}
        />
        {/* Preload pending image invisibly if needed */}
        {pendingIndex !== null && !imageLoadedArr[pendingIndex] && (
          <Image
            src={slides[pendingIndex].img}
            alt={slides[pendingIndex].alt}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 60vw"
            priority={false}
            quality={90}
            className="object-cover invisible pointer-events-none"
            style={{ objectPosition: "center" }}
            onLoadingComplete={() => {
              setImageLoadedArr((prev) => {
                if (prev[pendingIndex]) return prev;
                const arr = [...prev];
                arr[pendingIndex] = true;
                return arr;
              });
            }}
          />
        )}
        {/* Minimal darkness overlay for better text readability */}
        <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />
        {/* Loading spinner overlay for first slide only */}
        {currentIndex === 0 && !isCurrentImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-white/40 pointer-events-none">
            <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></span>
          </div>
        )}
      </div>
      {/* Overlay text content */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-start pt-8 sm:pt-16 md:pt-24 px-4 py-12 sm:py-16 md:py-20 pb-24 sm:pb-32 md:pb-40 transition-opacity duration-300 ${isCurrentImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={extraPadding ? { paddingBottom: `calc(6rem + ${extraPadding}px)` } : {}}
      >
        <div className="text-center w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 flex flex-col items-center">
          <h1 className="text-base md:text-2xl lg:text-3xl font-extrabold text-blue-700 bg-white/95 border-2 border-yellow-300 rounded-lg shadow-lg px-4 py-3 mx-auto sm:max-w-[90%] md:max-w-[85%] headline-xs">
            {slides[currentIndex].headline}
          </h1>
          <p className="hide-below-450 text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-gray-700 bg-yellow-100 rounded-lg shadow px-4 py-2 mx-auto sm:max-w-[85%] md:max-w-[80%]">
            {slides[currentIndex].subheadline}
          </p>
          {/* Slide indicators just below the text (horizontal) */}
          {!verticalDots && (
            <div ref={dotsRef} className="mt-10 sm:mt-12 md:mt-16 flex items-center gap-3 sm:gap-4 z-30">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => requestSlideChange(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 sm:h-2 transition-all duration-300 ${
                    currentIndex === idx
                      ? "w-6 sm:w-8 bg-yellow-400"
                      : "w-2 sm:w-2.5 bg-white/60 hover:bg-white/80"
                  } rounded-full`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Vertical slide indicators at right center */}
        {verticalDots && (
          <div ref={dotsRef} className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-2 z-50 bg-white/60 backdrop-blur-md border border-yellow-200 rounded-full px-1.5 py-2 shadow-xl">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => requestSlideChange(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full hover:scale-110 focus:scale-110 outline-none ${
                  currentIndex === idx
                    ? "w-3.5 h-7 sm:w-4 sm:h-8 bg-yellow-400 border-2 border-yellow-400 shadow shadow-yellow-200"
                    : "w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-300 hover:bg-yellow-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
