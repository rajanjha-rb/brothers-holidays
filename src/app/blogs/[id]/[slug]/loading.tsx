import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="relative min-h-[60vh] bg-gray-100">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="relative z-20 flex items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto px-4">
          <div className="w-full">
            <Skeleton className="h-16 w-3/4 mx-auto mb-8" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-4 w-1/3 mx-auto" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </main>
    </div>
  );
} 