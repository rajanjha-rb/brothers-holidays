"use client";

import React, { useState, useCallback } from "react";
import { 
  FaMapMarkerAlt, 
  FaMoon, 
  FaDollarSign, 
  FaSearch 
} from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function SearchBox() {
  const [formData, setFormData] = useState({
    destination: "",
    nights: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleInputChange = useCallback((field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (message) setMessage(null);
  }, [message]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!formData.destination || !formData.nights || !formData.budget) {
      setMessage({ type: 'error', text: "All fields are required." });
      return;
    }
    
    setLoading(true);
    // Simulate async search
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: 'success', text: "Search complete! (Demo)" });
    }, 1200);
  }, [formData]);

  return (
    <div className="w-full px-0 md:px-4 flex justify-start md:justify-center font-sans relative mt-4 md:mt-0 -top-2 z-10 mb-6 md:mb-16 overflow-x-hidden">
      <div className="w-full md:max-w-5xl px-2 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 flex flex-col gap-2 border border-yellow-300 shadow-2xl rounded-3xl bg-white/60 backdrop-blur-lg hover:shadow-2xl relative">
        {/* Packages Heading */}
        <div className="flex justify-center mb-4 mt-2">
          <div className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 md:px-7 md:py-3 bg-white/40 rounded-2xl shadow-lg font-extrabold text-base sm:text-xl md:text-3xl border border-yellow-300 relative">
            <span className="text-[#D72631]">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="7" y="7" width="10" height="10" rx="2" stroke="#D72631" strokeWidth="2" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="#D72631" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-[#D72631]">Packages</span>
          </div>
        </div>

        {/* Form */}
        <form className="flex flex-col md:flex-row flex-wrap items-stretch md:items-end justify-center gap-4 w-full max-w-4xl px-2 py-2 mx-auto" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row flex-wrap w-full gap-4 overflow-x-auto">
            {/* Destination */}
            <div className="flex-1 min-w-[120px] min-w-0 flex items-center">
              <div className="flex items-center w-full bg-white/30 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 border border-gray-200 focus-within:border-yellow-400 shadow-md transition-all duration-200 backdrop-blur-md">
                <FaMapMarkerAlt className="h-6 w-6 text-pink-700 flex-shrink-0 mr-2" aria-hidden="true" />
                <input
                  type="text"
                  value={formData.destination}
                  onChange={handleInputChange('destination')}
                  placeholder="Where to?"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 font-medium"
                  aria-label="Destination"
                />
              </div>
            </div>

            {/* Nights */}
            <div className="flex-1 min-w-[120px] min-w-0 flex items-center">
              <div className="flex items-center w-full bg-white/30 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 border border-gray-200 focus-within:border-yellow-400 shadow-md transition-all duration-200 backdrop-blur-md">
                <FaMoon className="h-6 w-6 text-blue-700 flex-shrink-0 mr-2" aria-hidden="true" />
                <input
                  type="number"
                  value={formData.nights}
                  onChange={handleInputChange('nights')}
                  placeholder="How many nights?"
                  min="1"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 font-medium"
                  aria-label="Number of nights"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="flex-1 min-w-[120px] min-w-0 flex items-center">
              <div className="flex items-center w-full bg-white/30 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 border border-gray-200 focus-within:border-yellow-400 shadow-md transition-all duration-200 backdrop-blur-md">
                <FaDollarSign className="h-6 w-6 text-green-700 flex-shrink-0 mr-2" aria-hidden="true" />
                <input
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange('budget')}
                  placeholder="Budget?"
                  min="1"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 font-medium"
                  aria-label="Budget"
                />
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSearch className="h-5 w-5" />
              <span className="hidden sm:inline">{loading ? "Searching..." : "Search"}</span>
            </Button>
          </div>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-4 text-center p-3 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
