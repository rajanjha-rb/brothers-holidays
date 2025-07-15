"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 select-none group"
      style={{ minHeight: 48 }}
    >
      <div className="relative">
        <Image
          src="/travelLogo.svg"
          alt="Brothers Holidays Logo"
          width={40}
          height={40}
          className="h-10 w-auto md:h-12 transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
          priority
        />
        {/* Premium glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-gold-400 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300" />
      </div>
      <div className="flex flex-col">
        <span
          className="text-lg sm:text-xl md:text-lg font-bold tracking-tight"
          style={{
            color: "#171717",
            fontFamily: "Poppins, Arial, sans-serif",
            letterSpacing: "-0.02em",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Brothers Holidays
        </span>
        <span className="hidden sm:block text-xs text-gray-500 font-medium">
          Luxury Travel Experts
        </span>
      </div>
    </Link>
  );
} 