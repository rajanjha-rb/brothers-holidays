import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FaCalendar, FaTags } from "react-icons/fa";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-white">
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
      <div className="relative min-h-[60vh] bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-[60vh] text-center text-white max-w-4xl mx-auto px-4">
          <div className="w-full">
            {/* Title Skeleton */}
            <Skeleton className="h-16 w-3/4 mx-auto mb-8 bg-white/20" />
            
            {/* Meta information Skeleton */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
              <div className="flex items-center gap-2">
                <FaCalendar className="w-4 h-4 text-gray-300" />
                <Skeleton className="h-4 w-32 bg-white/20" />
              </div>
              <div className="flex items-center gap-2">
                <FaTags className="w-4 h-4 text-gray-300" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 bg-white/20 rounded-full" />
                  <Skeleton className="h-6 w-20 bg-white/20 rounded-full" />
                  <Skeleton className="h-6 w-14 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {/* Paragraph skeletons */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          
          {/* Spacing */}
          <div className="h-8"></div>
          
          {/* More paragraphs */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          
          {/* Spacing */}
          <div className="h-8"></div>
          
          {/* Even more paragraphs */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
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