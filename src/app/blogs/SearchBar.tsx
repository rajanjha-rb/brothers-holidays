"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FaSearch, FaTimes, FaTags, FaLightbulb } from "react-icons/fa";
import { databases } from "@/models/client/config";
import { db, blogCollection } from "@/models/name";

interface Blog {
  $id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  tags: string[];
  featuredImage?: string;
  featuredImageBucket?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface SearchSuggestion {
  value: string;
  type: 'title' | 'tag' | 'content';
  blogId?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  currentQuery: string;
}

export default function SearchBar({ onSearch, onClear, currentQuery }: SearchBarProps) {
  const [query, setQuery] = useState(currentQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all tags for suggestions
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await databases.listDocuments(db, blogCollection);
        const blogs = response.documents as unknown as Blog[];
        
        const allTagsSet = new Set<string>();
        const tagCount: { [key: string]: number } = {};
        
        blogs.forEach(blog => {
          if (blog.tags) {
            blog.tags.forEach(tag => {
              allTagsSet.add(tag);
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
          }
        });
        
        setAllTags(Array.from(allTagsSet));
        
        // Get popular tags (tags used in more than 1 blog)
        const popular = Object.entries(tagCount)
          .filter(([_, count]) => count > 1)
          .sort(([_, a], [__, b]) => b - a)
          .slice(0, 8)
          .map(([tag]) => tag);
        
        setPopularTags(popular);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  // Generate suggestions based on query
  const generateSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await databases.listDocuments(db, blogCollection);
      const blogs = response.documents as unknown as Blog[];

      const suggestions: SearchSuggestion[] = [];
      const queryLower = searchQuery.toLowerCase();

      // Search in titles, tags, and content (first 100 chars)
      blogs.forEach(blog => {
        // Title suggestions
        if (blog.title.toLowerCase().includes(queryLower)) {
          suggestions.push({
            value: blog.title,
            type: 'title',
            blogId: blog.$id
          });
        }

        // Tag suggestions
        if (blog.tags) {
          blog.tags.forEach(tag => {
            if (tag.toLowerCase().includes(queryLower)) {
              suggestions.push({
                value: tag,
                type: 'tag'
              });
            }
          });
        }

        // Content suggestions (first 100 chars)
        const contentPreview = blog.content.toLowerCase().substring(0, 100);
        if (contentPreview.includes(queryLower)) {
          const matchIndex = contentPreview.indexOf(queryLower);
          const start = Math.max(0, matchIndex - 20);
          const end = Math.min(blog.content.length, matchIndex + queryLower.length + 20);
          const snippet = blog.content.substring(start, end);
          
          suggestions.push({
            value: `...${snippet}...`,
            type: 'content'
          });
        }
      });

      const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
        index === self.findIndex(s => s.value === suggestion.value)
      ).slice(0, 8);

      setSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateSuggestions(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, allTags, generateSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    onClear();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    onSearch(suggestion.value);
    setShowSuggestions(false);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4" ref={searchRef} style={{ position: 'relative', zIndex: 9999 }}>
      {/* Enhanced Search Container */}
      <div className="relative">
        {/* Search Input with Gradient Border */}
        <div className="relative group">
                     <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 group-hover:shadow-xl transition-all duration-300">
            <div className="flex items-center p-2">
              {/* Search Icon */}
              <div className="flex-shrink-0 ml-3">
                                 <FaSearch className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
              </div>
              
              {/* Input Field */}
              <Input
                type="text"
                placeholder="Search blogs by title, tags, or content..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                className="flex-1 border-0 bg-transparent text-gray-700 placeholder-gray-400 text-lg font-medium focus:ring-0 focus:outline-none px-3 py-4"
              />
              
              {/* Clear Button */}
              {query && (
                <Button
                  onClick={handleClearSearch}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 mr-2 h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <FaTimes className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </Button>
              )}
              
              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={!query.trim()}
                                 className="flex-shrink-0 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-md transform hover:scale-102 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSearch className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div 
            className="search-suggestions absolute top-full left-0 right-0 mt-2" 
            style={{ 
              position: 'absolute',
              zIndex: 9999999
            }}
          >
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                                     <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-500">Searching...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                                             className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {suggestion.type === 'title' && (
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                          )}
                          {suggestion.type === 'tag' && (
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <FaTags className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {suggestion.type === 'content' && (
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">C</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                                                     <div className="text-gray-700 font-medium truncate group-hover:text-pink-600 transition-colors duration-200">
                            {suggestion.value}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {suggestion.type} match
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Popular Tags Section */}
      {popularTags.length > 0 && (
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaLightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-700 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Popular Tags
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {popularTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="group relative overflow-hidden"
              >
                                 <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-sm"></div>
                                 <Badge
                   variant="secondary"
                   className="relative bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-300 hover:text-pink-600 font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 cursor-pointer tag-badge"
                 >
                  <FaTags className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 