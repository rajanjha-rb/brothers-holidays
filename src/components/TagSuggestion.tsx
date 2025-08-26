"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaPlus, FaTimes, FaSearch, FaSpinner } from "react-icons/fa";

interface Tag {
  $id: string;
  name: string;
  slug: string;
  description: string;
  usageCount: number;
  category: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdBy: string;
  $createdAt: string;
  $updatedAt: string;
}

interface TagSuggestionProps {
  selectedTags: Set<string>;
  onTagsChange: (tags: Set<string>) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagSuggestion({ 
  selectedTags, 
  onTagsChange, 
  placeholder = "Add tags...",
  maxTags = 10 
}: TagSuggestionProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/package-tags/list?activeOnly=true');
        const data = await response.json();
        
        if (data.success) {
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.has(tag.name)
  );

  // Add tag from suggestions
  const addTagFromSuggestion = (tagName: string) => {
    if (selectedTags.size >= maxTags) return;
    
    const newTags = new Set(selectedTags);
    newTags.add(tagName);
    onTagsChange(newTags);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Add new custom tag
  const addCustomTag = () => {
    if (!newTag.trim() || selectedTags.size >= maxTags) return;
    
    const newTags = new Set(selectedTags);
    newTags.add(newTag.trim());
    onTagsChange(newTags);
    setNewTag("");
  };

  // Remove tag
  const removeTag = (tagName: string) => {
    const newTags = new Set(selectedTags);
    newTags.delete(tagName);
    onTagsChange(newTags);
  };

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Tags Display */}
      {selectedTags.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(selectedTags).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="flex items-center gap-2 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600 transition-colors"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Input and Suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button 
            type="button"
            onClick={addCustomTag}
            disabled={!newTag.trim() || selectedTags.size >= maxTags}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FaPlus className="w-4 h-4" />
          </Button>
        </div>

        {/* Tag Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {/* Search within suggestions */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tags..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Suggestions List */}
            <div className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <FaSpinner className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Loading tags...</span>
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {searchQuery ? 'No tags found' : 'No available tags'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.$id}
                      type="button"
                      onClick={() => addTagFromSuggestion(tag.name)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium">{tag.name}</span>
                        {tag.category !== 'general' && (
                          <Badge variant="outline" className="text-xs">
                            {tag.category}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {tag.usageCount} uses
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500">
        {selectedTags.size < maxTags ? (
          <span>You can add up to {maxTags - selectedTags.size} more tags</span>
        ) : (
          <span className="text-orange-600">Maximum {maxTags} tags reached</span>
        )}
      </div>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}

