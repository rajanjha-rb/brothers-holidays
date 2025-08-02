import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FaSearch, FaNewspaper, FaTags, FaCalendar } from "react-icons/fa";

export default function BlogsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Navbar Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="relative z-10 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Title Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-16 w-96 mx-auto mb-4" />
              <Skeleton className="h-6 w-2/3 mx-auto" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="mb-12">
              <div className="w-full max-w-4xl mx-auto px-4">
                <div className="relative">
                  <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center p-2">
                      <FaSearch className="w-5 h-5 text-gray-400 ml-3" />
                      <Skeleton className="flex-1 h-12 mx-3" />
                      <Skeleton className="w-24 h-12 mr-2 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg mb-3 mx-auto">
                  <FaNewspaper className="w-5 h-5 text-white" />
                </div>
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mb-3 mx-auto">
                  <FaTags className="w-5 h-5 text-white" />
                </div>
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg mb-3 mx-auto">
                  <FaCalendar className="w-5 h-5 text-white" />
                </div>
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blogs Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
              {/* Image Skeleton */}
              <Skeleton className="h-40 w-full" />
              
              {/* Content Skeleton */}
              <div className="p-4">
                {/* Tags Skeleton */}
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                
                {/* Title Skeleton */}
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                
                {/* Description Skeleton */}
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-3" />
                
                {/* Meta Skeleton */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <FaCalendar className="w-3 h-3 text-pink-500" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center gap-1">
                    <FaTags className="w-3 h-3 text-purple-500" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                
                {/* Button Skeleton */}
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div>
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div>
              <Skeleton className="h-6 w-28 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 