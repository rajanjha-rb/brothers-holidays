"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt, FaClock, FaTag, FaDollarSign, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

interface Activity {
  $id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  location: string;
  price: string;
  tags: string[];
  $createdAt: string;
  $updatedAt: string;
}

interface ActivitiesClientProps {
  activities: Activity[];
}

export default function ActivitiesClient({ activities }: ActivitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Get unique categories and locations for filtering
  const categories = useMemo(() => {
    const cats = activities
      .map(activity => activity.category)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return cats.sort();
  }, [activities]);

  const locations = useMemo(() => {
    const locs = activities
      .map(activity => activity.location)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return locs.sort();
  }, [activities]);

  // Filter activities based on search and filters
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = !searchQuery || 
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !selectedCategory || activity.category === selectedCategory;
      const matchesLocation = !selectedLocation || activity.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [activities, searchQuery, selectedCategory, selectedLocation]);

  // Preload activity detail pages for faster navigation
  useEffect(() => {
    filteredActivities.forEach(activity => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/activities/${activity.$id}/${activity.name.toLowerCase().replace(/\s+/g, '-')}`;
      document.head.appendChild(link);
    });
  }, [filteredActivities]);

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏔️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities available</h3>
        <p className="text-gray-600">Check back later for exciting activities and experiences.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Filter Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedCategory || selectedLocation) && (
          <div className="mt-4">
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedLocation("");
              }}
              variant="outline"
              size="sm"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredActivities.length} of {activities.length} activities
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.$id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {activity.name}
        </CardTitle>
        
        {/* Activity badges */}
        <div className="flex flex-wrap gap-2">
          {activity.category && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <FaMapMarkerAlt className="w-3 h-3" />
              {activity.category}
            </Badge>
          )}
          {activity.duration && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <FaClock className="w-3 h-3" />
              {activity.duration}
            </Badge>
          )}
          {activity.location && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <FaMapMarkerAlt className="w-3 h-3" />
              {activity.location}
            </Badge>
          )}
          {activity.price && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <FaDollarSign className="w-3 h-3" />
              {activity.price}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        {activity.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {activity.description}
          </p>
        )}

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {activity.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                <FaTag className="w-2 h-2" />
                {tag}
              </Badge>
            ))}
            {activity.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{activity.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-auto">
          <Link href={`/activities/${activity.$id}/${activity.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <Button className="w-full group-hover:bg-indigo-600 transition-colors">
              View Details
              <FaArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
