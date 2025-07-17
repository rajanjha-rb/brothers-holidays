"use client";
import React, { useRef } from "react";
import HeroSection from "../(Home)/components/heroSection";
import SearchBox from "../(Home)/components/searchBox";

export default function SearchBoxWithRef() {
  const searchBoxRef = useRef<HTMLDivElement>(null);
  return (
    <>
      {/* Hero Section */}
      <HeroSection searchBoxRef={searchBoxRef} />
      {/* Overlapping SearchBox */}
      <div ref={searchBoxRef} className="w-full max-w-5xl mx-auto px-2 sm:px-4 -mt-12 sm:-mt-16 md:-mt-20 z-30 relative no-overlap-below-450">
        <SearchBox />
      </div>
    </>
  );
} 