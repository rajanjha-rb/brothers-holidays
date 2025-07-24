import React from "react";
import HeroAndSearchSection from "./HeroAndSearchSection";

export default function HomePage() {
  return (
    <main className="bg-[#F8F9FA]">
      <div className="relative">
        {/* Hero Section + SearchBox with ref (client) */}
        <HeroAndSearchSection />
      </div>
    </main>
  );
}
