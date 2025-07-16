"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Head from "next/head";

const slides = [
  {
    img: "/1.avif",
    blurDataURL: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA", // sample, replace with real blur
    headline: "Explore the Hidden Gems of Nepal",
    subheadline: "From Himalayan peaks to ancient temples — discover all.",
    alt: "Beautiful Nepal landscape with mountains and temples",
  },
  {
    img: "/2.avif",
    blurDataURL: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA", // sample, replace with real blur
    headline: "Journey Through Culture and Nature",
    subheadline: "Nepal offers unforgettable experiences at every turn.",
    alt: "Nepal cultural and natural scenery",
  },
  {
    img: "/3.avif",
    blurDataURL: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA", // sample, replace with real blur
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
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);
  const [firstImageReady, setFirstImageReady] = useState(false);
  const [extraPadding, setExtraPadding] = useState(0);
  const [verticalDots, setVerticalDots] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const lastSwitchRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      // setShowHeroText(window.innerWidth > 500); // This line is removed
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload the next image after the current one is loaded
  useEffect(() => {
    if (!imageLoaded) return;
    const nextIdx = (currentIndex + 1) % slides.length;
    setNextImageLoaded(false);
    const img = new window.Image();
    img.src = slides[nextIdx].img;
    img.onload = () => setNextImageLoaded(true);
  }, [imageLoaded, currentIndex]);

  // Start the timer only after the next image is loaded
  useEffect(() => {
    if (!imageLoaded || !nextImageLoaded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPendingIndex((currentIndex + 1) % slides.length);
      setImageLoaded(false);
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [imageLoaded, nextImageLoaded, currentIndex]);

  // When pendingIndex changes, update currentIndex only after image loads
  useEffect(() => {
    if (pendingIndex !== null && imageLoaded) {
      setCurrentIndex(pendingIndex);
      setPendingIndex(null);
    }
  }, [pendingIndex, imageLoaded]);

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
        if (
          !verticalDots &&
          gap < minGap &&
          now - lastSwitchRef.current > 200
        ) {
          setVerticalDots(true);
          lastSwitchRef.current = now;
        } else if (
          verticalDots &&
          gap >= minGap &&
          now - lastSwitchRef.current > 200
        ) {
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

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="preload" as="image" href="/1.webp" />
      </Head>
      <section className="relative w-full bg-[#F8F9FA] overflow-hidden">
        {/* Image with responsive height */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] max-h-[90vh]" style={{ background: "#e0e7ef" }}>
          <Image
            src={slides[pendingIndex !== null ? pendingIndex : currentIndex].img}
            alt={slides[pendingIndex !== null ? pendingIndex : currentIndex].alt}
            fill
            sizes="100vw"
            priority={currentIndex === 0}
            quality={75}
            className="object-cover"
            style={{ objectPosition: "center" }}
            onLoadingComplete={() => {
              setImageLoaded(true);
              if (currentIndex === 0 && !firstImageReady) setFirstImageReady(true);
            }}
            placeholder="blur"
            blurDataURL={slides[pendingIndex !== null ? pendingIndex : currentIndex].blurDataURL}
          />
          {/* Minimal darkness overlay for better text readability */}
          <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />
        </div>
        {firstImageReady && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-start pt-8 sm:pt-16 md:pt-24 px-4 py-12 sm:py-16 md:py-20 pb-24 sm:pb-32 md:pb-40"
            style={
              extraPadding
                ? { paddingBottom: `calc(6rem + ${extraPadding}px)` }
                : {}
            }
          >
            <div className="text-center w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 flex flex-col items-center">
              <h1 className="text-base md:text-2xl lg:text-3xl font-extrabold text-blue-700 bg-white/95 border-2 border-yellow-300 rounded-lg shadow-lg px-4 py-3 mx-auto sm:max-w-[90%] md:max-w-[85%] headline-xs">
                {
                  slides[pendingIndex !== null ? pendingIndex : currentIndex]
                    .headline
                }
              </h1>
              <p className="hide-below-450 text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-gray-700 bg-yellow-100 rounded-lg shadow px-4 py-2 mx-auto sm:max-w-[85%] md:max-w-[80%]">
                {
                  slides[pendingIndex !== null ? pendingIndex : currentIndex]
                    .subheadline
                }
              </p>
              {/* Slide indicators just below the text (horizontal) */}
              {!verticalDots && (
                <div
                  ref={dotsRef}
                  className="mt-10 sm:mt-12 md:mt-16 flex items-center gap-3 sm:gap-4 z-30"
                >
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
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
              <div
                ref={dotsRef}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-2 z-50 bg-white/60 backdrop-blur-md border border-yellow-200 rounded-full px-1.5 py-2 shadow-xl"
              >
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
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
        )}
      </section>
    </>
  );
}
