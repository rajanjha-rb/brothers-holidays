"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FaCalendar, FaTags, FaArrowRight, FaSearch, FaRoute, FaMapMarkerAlt, FaClock, FaDollarSign, FaImage } from "react-icons/fa";
import SearchBar from "./SearchBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./packages.css";

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
  duration: string;
  location: string;
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
        pkg.duration,
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
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-3 mx-auto">
                <FaTags className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {new Set(initialPackages.flatMap(pkg => pkg.tags || [])).size}
              </h3>
              <p className="text-pink-100 text-sm">Unique Tags</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredResults.map((pkg, _index) => (
              <div
                key={pkg.$id}
                className="group"
              >
                <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 rounded-3xl overflow-hidden group-hover:border-pink-200 package-card flex flex-col relative">
                  {/* Premium Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                  
                  {/* Enhanced Featured Image */}
                  {pkg.featuredImage ? (
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent z-10"></div>
                      <OptimizedImage
                        src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${pkg.featuredImageBucket}/files/${pkg.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${pkg.$updatedAt}`}
                        alt={pkg.name}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                      {/* Enhanced Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                      
                      {/* Premium Price Badge */}
                      {pkg.price && (
                        <div className="absolute top-4 right-4 z-30">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold px-4 py-2 shadow-2xl border-0 text-sm transform group-hover:scale-110 transition-all duration-300">
                            {pkg.price}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Premium Location Badge */}
                      {pkg.location && (
                        <div className="absolute bottom-4 left-4 z-30">
                          <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 font-semibold px-3 py-2 shadow-lg border-0 text-xs">
                            <FaMapMarkerAlt className="w-3 h-3 text-red-500 mr-1" />
                            {pkg.location}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="text-center text-gray-400">
                        <FaImage className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No Image</p>
                      </div>
                      {pkg.price && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold px-4 py-2 shadow-2xl border-0 text-sm">
                            {pkg.price}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <CardContent className="p-6 flex-1 flex flex-col relative z-10">
                    {/* Enhanced Tags with Premium Styling */}
                    {pkg.tags && pkg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {pkg.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 text-pink-700 border border-pink-200 hover:from-pink-200 hover:to-blue-200 transition-all duration-300 text-xs font-semibold px-2 py-1 tag-badge shadow-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {pkg.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 shadow-sm"
                          >
                            +{pkg.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Enhanced Title with Premium Typography */}
                    <PackageLink package={pkg}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors duration-500 leading-tight tracking-tight">
                        {pkg.name}
                      </h3>
                    </PackageLink>

                    {/* Enhanced Location & Duration with Premium Icons */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {pkg.location && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <FaMapMarkerAlt className="w-3 h-3 text-red-500" />
                          </div>
                          <span className="font-medium">{pkg.location}</span>
                        </div>
                      )}
                      {pkg.duration && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaClock className="w-3 h-3 text-blue-500" />
                          </div>
                          <span className="font-medium">{pkg.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Package Stats with Premium Design */}
                    <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 mb-5">
                      <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2">
                        <FaRoute className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <span className="font-semibold text-blue-700">{pkg.itinerary.length} days</span>
                      </div>
                      <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2">
                        <FaImage className="w-4 h-4 text-green-500 mx-auto mb-1" />
                        <span className="font-semibold text-green-700">{pkg.galleryImages.length} images</span>
                      </div>
                      <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2">
                        <FaTags className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                        <span className="font-semibold text-purple-700">{pkg.tags?.length || 0} tags</span>
                      </div>
                    </div>

                    {/* Enhanced Description with Premium Typography */}
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed text-sm font-medium">
                      {pkg.overview ? pkg.overview.replace(/<[^>]*>/g, '').substring(0, 140) + '...' : 'No description available'}
                    </p>

                    {/* Enhanced Meta Information with Premium Styling */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-pink-100 rounded-full px-3 py-1">
                        <FaCalendar className="w-3 h-3 text-pink-500" />
                        <span className="font-semibold text-pink-700">
                          {new Date(pkg.$createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full px-3 py-1">
                        <FaRoute className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold text-blue-700">{pkg.itinerary?.length || 0} days</span>
                      </div>
                    </div>

                    {/* Enhanced View Details Button - Premium Design */}
                    <div className="mt-auto">
                      <PackageLink package={pkg}>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-xl group-hover:from-pink-100 group-hover:via-purple-100 group-hover:to-blue-100 transition-all duration-500 border border-pink-200/50 group-hover:border-pink-300/70">
                          <span className="font-bold text-pink-700 group-hover:text-blue-700 transition-colors duration-300 text-sm">
                            View Details
                          </span>
                          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FaArrowRight className="w-3 h-3 text-white group-hover:translate-x-0.5 transition-transform duration-300" />
                          </div>
                        </div>
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
