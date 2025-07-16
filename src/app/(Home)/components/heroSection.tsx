"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Head from "next/head";

// Slide data outside the component for clarity and reusability
const SLIDES = [
  {
    img: "/1.avif",
    blurDataURL: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA",
    headline: "Explore the Hidden Gems of Nepal",
    subheadline: "From Himalayan peaks to ancient temples — discover all.",
    alt: "Beautiful Nepal landscape with mountains and temples",
  },
  {
    img: "/2.avif",
    blurDataURL: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA",
    headline: "Journey Through Culture and Nature",
    subheadline: "Nepal offers unforgettable experiences at every turn.",
    alt: "Nepal cultural and natural scenery",
  },
  {
    img: "/3.avif",
    blurDataURL: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA",
    headline: "Timeless Nepal Awaits Your Next Escape",
    subheadline: "Nepal welcomes every soul seeking adventure and peace",
    alt: "Serene Nepal destination for adventure and peace",
  },
];

interface HeroSectionProps {
  searchBoxRef?: React.RefObject<HTMLDivElement | null>;
}

export default function HeroSection({ searchBoxRef }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [verticalDots, setVerticalDots] = useState(false);
  const [extraPadding, setExtraPadding] = useState(0);

  const dotsRef = useRef<HTMLDivElement>(null);

  // Preload next image for smooth transitions
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % SLIDES.length;
    const img = new window.Image();
    img.src = SLIDES[nextIdx].img;
  }, [currentIndex]);

  // Auto-advance slides
  useEffect(() => {
    if (!isImageLoaded) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
      setIsImageLoaded(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isImageLoaded, currentIndex]);

  // Responsive dot orientation logic
  useEffect(() => {
    function adjustPadding() {
      if (!dotsRef.current || !searchBoxRef?.current) return;
      const dotsRect = dotsRef.current.getBoundingClientRect();
      const searchRect = searchBoxRef.current.getBoundingClientRect();
      const gap = searchRect.top - dotsRect.bottom;
      const minGap = 24;
      setVerticalDots(gap < minGap);
      setExtraPadding(gap < minGap ? minGap - gap : 0);
    }
    adjustPadding();
    window.addEventListener("resize", adjustPadding);
    return () => window.removeEventListener("resize", adjustPadding);
  }, [searchBoxRef, currentIndex]);

  // Handler for manual slide change
  const handleDotClick = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setIsImageLoaded(false);
  }, []);

  // Ensure text and image appear together
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const slide = SLIDES[currentIndex];

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preload" as="image" href={SLIDES[0].img} />
      </Head>
      <section
        className="relative w-full bg-[#F8F9FA] overflow-hidden"
        aria-label="Hero section with slideshow"
      >
        {/* Image with overlay */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] max-h-[90vh] bg-[#e0e7ef]">
          <Image
            src={slide.img}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={currentIndex === 0}
            quality={75}
            className={`object-cover transition-opacity duration-700 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
            style={{ objectPosition: "center" }}
            onLoadingComplete={handleImageLoad}
            placeholder="blur"
            blurDataURL={slide.blurDataURL}
          />
          <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />
        </div>
        {/* Show text and dots only when image is loaded */}
        {isImageLoaded && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-start pt-8 sm:pt-16 md:pt-24 px-4 py-12 sm:py-16 md:py-20 pb-24 sm:pb-32 md:pb-40"
            style={extraPadding ? { paddingBottom: `calc(6rem + ${extraPadding}px)` } : {}}
          >
            <div className="text-center w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 flex flex-col items-center">
              <h1
                className="text-base md:text-2xl lg:text-3xl font-extrabold text-blue-700 bg-white/95 border-2 border-yellow-300 rounded-lg shadow-lg px-4 py-3 mx-auto sm:max-w-[90%] md:max-w-[85%] headline-xs"
                tabIndex={0}
              >
                {slide.headline}
              </h1>
              <p
                className="hide-below-450 text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-gray-700 bg-yellow-100 rounded-lg shadow px-4 py-2 mx-auto sm:max-w-[85%] md:max-w-[80%]"
                tabIndex={0}
              >
                {slide.subheadline}
              </p>
              {/* Horizontal dots */}
              {!verticalDots && (
                <div
                  ref={dotsRef}
                  className="mt-10 sm:mt-12 md:mt-16 flex items-center gap-3 sm:gap-4 z-30"
                  role="tablist"
                  aria-label="Slide indicators"
                >
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDotClick(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      aria-selected={currentIndex === idx}
                      role="tab"
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
            {/* Vertical dots */}
            {verticalDots && (
              <div
                ref={dotsRef}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-2 z-50 bg-white/60 backdrop-blur-md border border-yellow-200 rounded-full px-1.5 py-2 shadow-xl"
                role="tablist"
                aria-label="Slide indicators vertical"
              >
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-selected={currentIndex === idx}
                    role="tab"
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
        )}
      </section>
    </>
  );
}
