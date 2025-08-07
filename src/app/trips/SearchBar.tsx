"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";

import { FaSearch, FaTimes, FaTag, FaChartLine } from "react-icons/fa";
import type { Trip } from './TripsClient';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  trips: Trip[];
}

interface Suggestion {
  type: 'name' | 'tag' | 'difficulty';
  value: string;
}

const getIconForType = (type: Suggestion['type']) => {
  switch (type) {
    case 'tag':
      return <FaTag />;
    case 'difficulty':
      return <FaChartLine />;
    default:
      return <FaSearch />;
  }
};

const handleKeyDown = (_e: React.KeyboardEvent) => {
  // ... existing key handling logic ...
};

export default function SearchBar({ searchTerm, onSearchChange, placeholder = "Search...", trips }: SearchBarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // Live search; no explicit searching state needed
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Generate suggestions based on input
  useEffect(() => {
    if (!localSearch.trim()) {
      setSuggestions([]);
      return;
    }

    const searchTerm = localSearch.toLowerCase();
    const newSuggestions: Suggestion[] = [];

    // Add matching trip names
    trips.forEach(trip => {
      if (trip.name.toLowerCase().includes(searchTerm)) {
        newSuggestions.push({ type: 'name', value: trip.name });
      }
    });

    // Add matching tags
    const uniqueTags = new Set<string>();
    trips.forEach(trip => {
      trip.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm) && !uniqueTags.has(tag)) {
          uniqueTags.add(tag);
          newSuggestions.push({ type: 'tag', value: tag });
        }
      });
    });

    // Add matching difficulties
    const uniqueDifficulties = new Set<string>();
    trips.forEach(trip => {
      if (trip.difficulty && 
          trip.difficulty.toLowerCase().includes(searchTerm) && 
          !uniqueDifficulties.has(trip.difficulty)) {
        uniqueDifficulties.add(trip.difficulty);
        newSuggestions.push({ type: 'difficulty', value: trip.difficulty });
      }
    });

    setSuggestions(newSuggestions.slice(0, 5)); // Limit to 5 suggestions
  }, [localSearch, trips]);

  // Live search: trigger immediately when typing with a small debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 200);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [localSearch, onSearchChange]);

  // Handle clicks outside of suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              handleKeyDown(e);
              if (e.key === 'Enter' && selectedIndex === -1) {
                // enter triggers immediate search through onSearchChange
                onSearchChange(localSearch);
                setShowSuggestions(false);
                setSelectedIndex(-1);
              }
            }}
            className="pl-10 pr-10 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={placeholder}
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setShowSuggestions(false);
                setSelectedIndex(-1);
                onSearchChange("");
              }}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>


      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              onClick={() => {
                setLocalSearch(suggestion.value);
                setShowSuggestions(false);
                setSelectedIndex(-1);
                onSearchChange(suggestion.value);
              }}
            >
              <span className={`text-gray-500 ${
                suggestion.type === 'tag' ? 'text-teal-600' :
                suggestion.type === 'difficulty' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {getIconForType(suggestion.type)}
              </span>
              <span className="flex-1">{suggestion.value}</span>
              <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 