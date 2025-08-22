"use client";

import React, { useState, useCallback } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  currentQuery: string;
}

export default function SearchBar({ onSearch, onClear, currentQuery }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(currentQuery);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localQuery);
  }, [localQuery, onSearch]);

  const handleClear = useCallback(() => {
    setLocalQuery("");
    onClear();
  }, [onClear]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
    if (e.target.value === "") {
      onClear();
    }
  }, [onClear]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            placeholder="Search packages by name, location, duration, price, tags..."
            className="w-full pl-12 pr-12 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-lg"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 hover:border-white/50"
        >
          Search
        </button>
      </form>
    </div>
  );
}
