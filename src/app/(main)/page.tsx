import React from "react";
import HeroAndSearchSection from "./HeroAndSearchSection";

export default function HomePage() {
  return (
    <main className="bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="relative">
        {/* Hero Section + SearchBox with ref (client) */}
        <HeroAndSearchSection />
      </div>
    </main>
  );
}
