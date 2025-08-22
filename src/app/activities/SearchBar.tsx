"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

interface Activity {
  $id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
}

interface SearchBarProps {
  activities?: Activity[];
}

export default function SearchBar({ activities = [] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Activity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Generate search suggestions
  const generateSuggestions = (searchQuery: string): Activity[] => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results: Activity[] = [];

    // Search in activity names
    const nameMatches = activities.filter(activity =>
      activity.name.toLowerCase().includes(query)
    );
    results.push(...nameMatches);

    // Search in descriptions
    const descMatches = activities.filter(activity =>
      activity.description.toLowerCase().includes(query) &&
      !results.find(r => r.$id === activity.$id)
    );
    results.push(...descMatches);

    // Search in categories
    const catMatches = activities.filter(activity =>
      activity.category.toLowerCase().includes(query) &&
      !results.find(r => r.$id === activity.$id)
    );
    results.push(...catMatches);

    // Search in tags
    const tagMatches = activities.filter(activity =>
      activity.tags.some(tag => tag.toLowerCase().includes(query)) &&
      !results.find(r => r.$id === activity.$id)
    );
    results.push(...tagMatches);

    // Remove duplicates and limit results
    const uniqueResults = results.filter((activity, index, self) =>
      index === self.findIndex(r => r.$id === activity.$id)
    );

    return uniqueResults.slice(0, 8);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (activity: Activity) => {
    setQuery(activity.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to activities page with search query
      window.location.href = `/activities?search=${encodeURIComponent(query.trim())}`;
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-8" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          
          <input
            type="text"
            placeholder="Search for activities, categories, or locations..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setShowSuggestions(true)}
            className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {suggestions.map((activity, index) => (
              <Link
                key={activity.$id}
                href={`/activities/${activity.$id}/${activity.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setShowSuggestions(false)}
              >
                <div
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{activity.name}</div>
                  {activity.category && (
                    <div className="text-sm text-gray-600">{activity.category}</div>
                  )}
                  {activity.description && (
                    <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {activity.description}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && query.trim() && suggestions.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🔍</div>
              <p>No activities found for &quot;{query}&quot;</p>
              <p className="text-sm mt-1">Try different keywords or browse all activities</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
