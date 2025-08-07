"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";

import { FaPlus } from "react-icons/fa";

interface Trip {
  $id: string;
  name: string;
  slug: string;
  featuredImage?: string;
  difficulty?: string;
  tags?: string[];
  $updatedAt: string;
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

export default function AllTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTrips, setDeletingTrips] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [navigatingTrip, setNavigatingTrip] = useState<string | null>(null);
  const router = useRouter();
  const { user, hydrated, isAdmin } = useAuthState();

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching trips from dashboard via API...');
      
      const response = await fetch('/api/trips/list');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        const mappedTrips: Trip[] = data.trips.map((doc: Record<string, unknown>) => ({
          $id: doc.$id,
          name: doc.name,
          slug: doc.slug,
          featuredImage: doc.featuredImage,
          difficulty: doc.difficulty,
          tags: doc.tags,
          $updatedAt: doc.$updatedAt,
        }));
        console.log('Mapped trips:', mappedTrips);
        setTrips(mappedTrips);
        
        // Initialize image loading state for trips with featured images
        const tripsWithImages = mappedTrips.filter(trip => trip.featuredImage);
        setImageLoading(new Set(tripsWithImages.map(trip => trip.$id)));
        
        // Prefetch trip routes for faster navigation
        mappedTrips.forEach(trip => {
          router.prefetch(`/trips/${trip.$id}/${trip.slug}`);
          router.prefetch(`/trips/${trip.$id}/edit`);
        });
        
        // Prefetch add new trip route
        router.prefetch('/dashboard/addnewtrip');
      } else {
        setError(data.error || "Failed to fetch trips");
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Admin authentication check
  useEffect(() => {
    if (hydrated && (!user || !isAdmin)) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/");
      return;
    }
  }, [hydrated, user, isAdmin, router]);

  // Show loading state while checking authentication
  if (!hydrated || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Delete logic with loading state
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    
    setDeletingTrips(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch('/api/trips/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Trip deleted successfully');
        fetchTrips(); // Refresh the list
      } else {
        console.error('❌ Failed to delete trip:', data.error);
        alert("Failed to delete trip");
      }
    } catch (error) {
      console.error('❌ Error deleting trip:', error);
      alert("Failed to delete trip");
    } finally {
      setDeletingTrips(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Navigation handlers with loading states
  const handleView = (tripId: string, slug: string) => {
    if (navigatingTrip !== tripId) {
      setNavigatingTrip(tripId);
      router.push(`/trips/${tripId}/${slug}`, { scroll: false });
    }
  };

  const handleEdit = (tripId: string) => {
    if (navigatingTrip !== tripId) {
      setNavigatingTrip(tripId);
      router.push(`/trips/${tripId}/edit`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
            <p className="mt-2 text-gray-600">Manage your travel packages and adventures</p>
          </div>
          <Button 
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            onClick={() => router.push('/dashboard/addnewtrip', { scroll: false })}
          >
            <FaPlus className="w-4 h-4" />
            Add New Trip
          </Button>
        </div>

        {/* Trip Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trips...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Trips</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trips Yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first travel package.</p>
            <Link href="/dashboard/addnewtrip">
              <Button className="bg-teal-600 hover:bg-teal-700">
                Create Your First Trip
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.$id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Trip Image */}
                {trip.featuredImage && (
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {imageLoading.has(trip.$id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <OptimizedImage 
                      src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/${trip.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${trip.$updatedAt}`}
                      alt={trip.name}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => {
                        setImageLoading(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(trip.$id);
                          return newSet;
                        });
                      }}
                      onError={() => {
                        console.error('❌ Trip image failed to load');
                        setImageLoading(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(trip.$id);
                          return newSet;
                        });
                      }}
                    />
                  </div>
                )}
                
                {/* Trip Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {trip.name}
                  </h3>

                  {/* Trip Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      {trip.difficulty && (
                        <Badge 
                          variant="outline" 
                          className={`font-medium ${getDifficultyColor(trip.difficulty)}`}
                        >
                          {trip.difficulty}
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    {trip.tags && trip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {trip.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs text-teal-600"
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
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-teal-600 border-teal-600 hover:bg-teal-50"
                        onClick={() => handleView(trip.$id, trip.slug)}
                        disabled={navigatingTrip === trip.$id || deletingTrips.has(trip.$id)}
                      >
                        {navigatingTrip === trip.$id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          "View"
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(trip.$id)}
                        disabled={navigatingTrip === trip.$id || deletingTrips.has(trip.$id)}
                      >
                        {navigatingTrip === trip.$id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          "Edit"
                        )}
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(trip.$id)}
                      disabled={deletingTrips.has(trip.$id)}
                    >
                      {deletingTrips.has(trip.$id) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 