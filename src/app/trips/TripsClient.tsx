"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import SearchBar from "./SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";


export interface Trip {
  $id: string;
  name: string;
  slug: string;
  tags: string[];
  featuredImage?: string;
  featuredImageBucket?: string;
  difficulty?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface TripsClientProps {
  initialTrips: Trip[];
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function TripsClient({ initialTrips }: TripsClientProps) {
  const [trips] = useState<Trip[]>(initialTrips);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(initialTrips);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Filter trips based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTrips(trips);
      return;
    }

    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    
    const filtered = trips.filter(trip => {
      const searchableText = [
        trip.name,
        ...(trip.tags || []),
        trip.difficulty
      ].filter(Boolean).join(' ').toLowerCase();

      return searchWords.every(word => searchableText.includes(word));
    });

    setFilteredTrips(filtered);
  }, [trips, searchTerm]);

  const handleImageLoad = (tripId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [tripId]: false }));
  };

  const handleImageError = (tripId: string) => {
    console.error(`❌ Trip image failed to load for trip: ${tripId}`);
    setImageLoadingStates(prev => ({ ...prev, [tripId]: false }));
  };

  // Initialize loading states for trips with images
  useEffect(() => {
    const loadingStates: Record<string, boolean> = {};
    trips.forEach(trip => {
      if (trip.featuredImage) {
        loadingStates[trip.$id] = true;
      }
    });
    setImageLoadingStates(loadingStates);
  }, [trips]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Trips
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100 max-w-3xl mx-auto">
              Embark on unforgettable adventures and explore the world with our curated travel experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search trips by name, tags, or difficulty..."
              trips={trips}
            />
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No trips found" : "No trips available"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm 
                ? "Try adjusting your search terms to find more trips."
                : "Check back soon for amazing travel adventures."
              }
            </p>
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm("")}
                className="mt-6 bg-teal-600 hover:bg-teal-700"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip) => (
              <Link
                key={trip.$id}
                href={`/trips/${trip.$id}/${trip.slug}`}
                className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Trip Image */}
                {trip.featuredImage && (
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {imageLoadingStates[trip.$id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <OptimizedImage
                      src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${trip.featuredImageBucket}/files/${trip.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${trip.$updatedAt}`}
                      alt={trip.name}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => handleImageLoad(trip.$id)}
                      onError={() => handleImageError(trip.$id)}
                    />
                    
                    {/* Difficulty Badge */}
                    {trip.difficulty && (
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant="outline" 
                          className={`font-medium ${getDifficultyColor(trip.difficulty)}`}
                        >
                          {trip.difficulty}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Trip Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {trip.name}
                  </h3>

                  {/* Tags */}
                  {trip.tags && trip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {trip.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs text-teal-600 border-teal-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {trip.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{trip.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 