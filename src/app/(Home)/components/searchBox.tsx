"use client";

import React, { useState } from "react";
import {
  MapPinIcon,
  MoonIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export default function SearchBox() {
  const [destination, setDestination] = useState("");
  const [nights, setNights] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!destination || !nights || !budget) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    // Simulate async search
    setTimeout(() => {
      setLoading(false);
      setSuccess("Search complete! (Demo)");
    }, 1200);
  };

  return (
    // Outer container with golden background and horizontal padding
    <div className="w-full px-0 md:px-4 flex justify-start md:justify-center font-sans relative mt-4 md:mt-0 -top-2 z-10 mb-6 md:mb-16 overflow-x-hidden">
      {/* Inner container - white semi-transparent background, rounded, centered */}
      <div
        className="w-full md:max-w-5xl px-2 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 flex flex-col gap-2 border border-yellow-300 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-lg hover:shadow-2xl relative"
        style={{ boxShadow: "0 8px 32px 0 rgba(39, 55, 85, 0.12)" }}
      >
        {/* Packages Heading */}
        <div className="flex justify-center mb-4 mt-2">
          <div
            className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 md:px-7 md:py-3 bg-white/40 rounded-2xl shadow-lg font-extrabold text-base sm:text-xl md:text-3xl border border-yellow-300 relative"
            style={{ boxShadow: "0 2px 16px 0 #ffd16655" }}
          >
            <span className="text-[#D72631]">
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="7"
                  y="7"
                  width="10"
                  height="10"
                  rx="2"
                  stroke="#D72631"
                  strokeWidth="2"
                />
                <path
                  d="M9 7V5a3 3 0 0 1 6 0v2"
                  stroke="#D72631"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <span className="text-[#D72631]">Packages</span>
          </div>
        </div>
        {/* Fields Row */}
        <form
          className="flex flex-col md:flex-row flex-wrap items-stretch md:items-end justify-center gap-4 w-full max-w-4xl px-2 py-2 mx-auto"
          onSubmit={handleSubmit}
          aria-live="polite"
        >
          {/* Fields and Button Row */}
          <div className="flex flex-col md:flex-row flex-wrap w-full gap-4 overflow-x-auto">
            {/* Destination */}
            <div className="flex-1 min-w-[120px] min-w-0 flex items-center">
              <div className="flex items-center w-full bg-white/30 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 border border-gray-200 focus-within:border-yellow-400 shadow-md transition-all duration-200 backdrop-blur-md">
                <span
                  className="flex items-center text-pink-700 font-bold flex-shrink-0 mr-2 h-6 w-6 justify-center transition-colors duration-200"
                  aria-hidden="true"
                >
                  <MapPinIcon
                    className="h-6 w-6 text-pink-700"
                    aria-label="Destination"
                  />
                </span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-transparent outline-none border-none text-base md:text-lg text-gray-800 font-semibold flex-1 min-w-0 max-w-full placeholder:text-gray-400 placeholder:font-medium placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base lg:placeholder:text-lg xl:placeholder:text-xl text-left focus:text-gray-800 focus:ring-2 focus:ring-yellow-300 transition-colors duration-200 min-h-[32px] px-0"
                  placeholder="Destination"
                  aria-label="Destination"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            {/* Number of Nights */}
            <div className="flex-1 min-w-[120px] min-w-0 flex items-center">
              <div className="flex items-center w-full bg-white/30 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 border border-gray-200 focus-within:border-yellow-400 shadow-md transition-all duration-200 backdrop-blur-md">
                <span
                  className="flex items-center text-blue-700 font-bold flex-shrink-0 mr-2 h-6 w-6 justify-center transition-colors duration-200"
                  aria-hidden="true"
                >
                  <MoonIcon
                    className="h-6 w-6 text-blue-700"
                    aria-label="Number of Nights"
                  />
                </span>
                <input
                  type="number"
                  min={1}
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="bg-transparent outline-none border-none text-base md:text-lg text-gray-800 font-semibold flex-1 min-w-0 max-w-full placeholder:text-gray-400 placeholder:font-medium placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base lg:placeholder:text-lg xl:placeholder:text-xl text-left focus:text-gray-800 focus:ring-2 focus:ring-yellow-300 transition-colors duration-200 min-h-[32px] px-0"
                  placeholder="Days"
                  aria-label="Number of Nights"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            {/* Budget Per Person */}
            <div className="flex-1 min-w-[120px] min-w-0 flex items-center">
              <div className="flex items-center w-full bg-white/30 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 border border-gray-200 focus-within:border-yellow-400 shadow-md transition-all duration-200 backdrop-blur-md">
                <span
                  className="flex items-center text-green-700 font-bold flex-shrink-0 mr-2 h-6 w-6 justify-center transition-colors duration-200"
                  aria-hidden="true"
                >
                  <CurrencyDollarIcon
                    className="h-6 w-6 text-green-700"
                    aria-label="Budget Per Person"
                  />
                </span>
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-transparent outline-none border-none text-base md:text-lg text-gray-800 font-semibold flex-1 min-w-0 max-w-full placeholder:text-gray-400 placeholder:font-medium placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base lg:placeholder:text-lg xl:placeholder:text-xl text-left focus:text-gray-800 focus:ring-2 focus:ring-yellow-300 transition-colors duration-200 min-h-[32px] px-0"
                  placeholder="Budget"
                  aria-label="Budget Per Person"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            {/* Search Button (inline on md+, below on mobile) */}
            <div className="flex md:ml-2 mt-3 md:mt-0 min-w-[60px] items-center justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ minHeight: 48 }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    <span className="text-sm md:text-base">Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    <span className="text-sm md:text-base">Search</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
        {/* Feedback/Error/Success messages - reserve space to prevent layout shift */}
        <div
          className="w-full flex justify-center mt-2 min-h-[32px] md:min-h-[24px] transition-all duration-300"
          aria-live="polite"
        >
          {error ? (
            <span
              className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1 rounded focus:outline-blue-600"
              tabIndex={0}
            >
              {error}
            </span>
          ) : success ? (
            <span
              className="text-green-700 text-sm font-semibold bg-green-50 px-3 py-1 rounded focus:outline-blue-600"
              tabIndex={0}
            >
              {success}
            </span>
          ) : (
            <span className="opacity-0 select-none">placeholder</span>
          )}
        </div>
      </div>
    </div>
  );
}
