"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FaCalendar, FaArrowRight, FaSearch, FaRoute, FaMapMarkerAlt, FaDollarSign, FaImage } from "react-icons/fa";
import SearchBar from "./SearchBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./packages.css";
import { Button } from "@/components/ui/button";

interface Package {
  $id: string;
  name: string;
  overview: string;
  costInclude: string[];
  costExclude: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  featuredImage: string;
  featuredImageBucket: string;
  galleryImages: string[];
  faq: Array<{ question: string; answer: string }>;
  tags: string[];
  days: number | null;
  nights: number | null;
  location: string;
  destinationId: string;
  price: string;
  $createdAt: string;
  $updatedAt: string;
}

interface PackagesClientProps {
  initialPackages: Package[];
}

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter packages based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return initialPackages;
    
    const query = searchQuery.toLowerCase();
    return initialPackages.filter(pkg => {
      const searchableText = [
        pkg.name,
        pkg.overview,
        pkg.location,
        pkg.price,
        ...pkg.tags,
        ...pkg.costInclude,
        ...pkg.costExclude
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
  }, [initialPackages, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Preload critical resources on component mount
  useEffect(() => {
    // Preload the package detail page component
    const preloadPackageDetail = () => {
      // Prefetch the package detail page route
      const links = initialPackages.map(pkg => 
        `/packages/${pkg.$id}/${pkg.name.toLowerCase().replace(/\s+/g, '-')}`
      );
      
      // Prefetch first few package pages with higher priority
      links.slice(0, 5).forEach(link => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'prefetch';
        linkElement.href = link;
        linkElement.as = 'document';
        document.head.appendChild(linkElement);
      });
    };

    // Preload images for better perceived performance
    const preloadImages = () => {
      initialPackages.slice(0, 8).forEach(pkg => {
        if (pkg.featuredImage) {
          const img = new window.Image();
          img.src = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${pkg.featuredImageBucket}/files/${pkg.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${pkg.$updatedAt}`;
        }
      });
    };

    // Execute preloading immediately for better performance
    preloadPackageDetail();
    preloadImages();
  }, [initialPackages]);

  // Package link component for consistent navigation
  const PackageLink = ({ package: pkg, children }: { package: Package; children: React.ReactNode }) => (
    <Link 
      href={`/packages/${pkg.$id}/${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}
      className="block transition-transform duration-200 hover:scale-[1.02]"
    >
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Travel Packages
            </h1>
            <p className="text-xl md:text-2xl text-pink-100 max-w-3xl mx-auto leading-relaxed">
              Discover amazing travel experiences curated just for you
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mb-12 search-container" style={{ position: 'relative', zIndex: 9999 }}>
            <SearchBar 
              onSearch={handleSearch} 
              onClear={handleClearSearch} 
              currentQuery={searchQuery} 
            />
          </div>

          {/* Enhanced Stats - Hidden when searching */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto stats-container ${searchQuery ? 'hidden' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 stats-card">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg mb-3 mx-auto">
                <FaRoute className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{initialPackages.length}</h3>
              <p className="text-pink-100 text-sm">Total Packages</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 stats-card">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mb-3 mx-auto">
                <FaMapMarkerAlt className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {new Set(initialPackages.map(pkg => pkg.location).filter(Boolean)).size}
              </h3>
              <p className="text-pink-100 text-sm">Destinations</p>
            </div>
            

            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 stats-card">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mb-3 mx-auto">
                <FaDollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {initialPackages.filter(pkg => pkg.price).length}
              </h3>
              <p className="text-pink-100 text-sm">Priced Packages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Results Info */}
      {searchQuery && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FaSearch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Search Results
                  </h2>
                  <p className="text-gray-600">
                    Found {filteredResults.length} package{filteredResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearSearch}
                className="text-pink-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50">
        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No packages match your search for "${searchQuery}"`
                : "No packages available at the moment"
              }
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="bg-gradient-to-r from-pink-400 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                View All Packages
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((pkg, _index) => (
              <div
                key={pkg.$id}
                className="group"
              >
                <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden">
                  {/* Package Image */}
                  {pkg.featuredImage ? (
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <PackageLink package={pkg}>
                        <OptimizedImage
                          src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${pkg.featuredImageBucket}/files/${pkg.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${pkg.$updatedAt}`}
                          alt={pkg.name}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
                        />
                      </PackageLink>
                      
                      {/* Price Badge */}
                      {pkg.price && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white text-gray-900 font-semibold px-3 py-1 shadow-md border border-gray-200">
                            {pkg.price}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <div className="text-center text-gray-400">
                        <FaImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No Image</p>
                      </div>
                      {pkg.price && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white text-gray-900 font-semibold px-3 py-1 shadow-md border border-gray-200">
                            {pkg.price}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <CardContent className="p-5 flex-1 flex flex-col">
                    {/* Title */}
                    <PackageLink package={pkg}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                        {pkg.name}
                      </h3>
                    </PackageLink>

                    {/* Essential Info */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      {pkg.location && (
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{pkg.location}</span>
                        </div>
                      )}

                      {(pkg.days || pkg.nights) && (
                        <div className="flex items-center gap-2">
                          <FaCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>
                            {pkg.days && pkg.nights ? `${pkg.days} days, ${pkg.nights} nights` : pkg.days ? `${pkg.days} days` : `${pkg.nights} nights`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overview */}
                    {pkg.overview && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {pkg.overview}
                      </p>
                    )}



                    {/* View Details Button */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <PackageLink package={pkg}>
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Details
                          <FaArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </PackageLink>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
