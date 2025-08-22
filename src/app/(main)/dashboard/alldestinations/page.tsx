"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";

import { FaPlus } from "react-icons/fa";

interface Destination {
  $id: string;
  title: string;
  slug: string;
  metaDescription: string;
  featuredImage?: string;
  $updatedAt: string;
}



export default function AllDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDestinations, setDeletingDestinations] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [navigatingDestination, setNavigatingDestination] = useState<string | null>(null);
  const router = useRouter();
  const { user, hydrated, isAdmin } = useAuthState();

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching destinations from dashboard via API...');
      
      const response = await fetch('/api/destinations/list');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        const mappedDestinations: Destination[] = data.destinations.map((doc: Record<string, unknown>) => ({
          $id: doc.$id,
          title: doc.title,
          slug: doc.slug,
          metaDescription: doc.metaDescription,
          featuredImage: doc.featuredImage,
          $updatedAt: doc.$updatedAt,
        }));
        console.log('Mapped destinations:', mappedDestinations);
        setDestinations(mappedDestinations);
        
        // Initialize image loading state for destinations with featured images
        const destinationsWithImages = mappedDestinations.filter(destination => destination.featuredImage);
        setImageLoading(new Set(destinationsWithImages.map(destination => destination.$id)));
        
        // Prefetch destination routes for faster navigation
        mappedDestinations.forEach(destination => {
          router.prefetch(`/destinations/${destination.$id}/${destination.slug}`);
          router.prefetch(`/destinations/${destination.$id}/edit`);
        });
        
        // Prefetch add new destination route
        router.prefetch('/dashboard/addnewdestination');
      } else {
        setError(data.error || "Failed to fetch destinations");
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setError("Failed to fetch destinations");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

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
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Delete logic with loading state
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    
    setDeletingDestinations(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch('/api/destinations/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Destination deleted successfully');
        fetchDestinations(); // Refresh the list
      } else {
        console.error('❌ Failed to delete destination:', data.error);
        alert("Failed to delete destination");
      }
    } catch (error) {
      console.error('❌ Error deleting destination:', error);
      alert("Failed to delete destination");
    } finally {
      setDeletingDestinations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Navigation handlers with loading states
  const handleView = (destinationId: string, slug: string) => {
    if (navigatingDestination !== destinationId) {
      setNavigatingDestination(destinationId);
      router.push(`/destinations/${destinationId}/${slug}`, { scroll: false });
    }
  };

  const handleEdit = (destinationId: string) => {
    if (navigatingDestination !== destinationId) {
      setNavigatingDestination(destinationId);
      router.push(`/destinations/${destinationId}/edit`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Destination Management</h1>
            <p className="mt-2 text-gray-600">Manage your travel destinations and locations</p>
          </div>
          <Button 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => router.push('/dashboard/addnewdestination', { scroll: false })}
          >
            <FaPlus className="w-4 h-4" />
            Add New Destination
          </Button>
        </div>

        {/* Destination Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading destinations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Destinations</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Destinations Yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first destination.</p>
            <Link href="/dashboard/addnewdestination">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Create Your First Destination
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div key={destination.$id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Destination Image */}
                {destination.featuredImage && (
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {imageLoading.has(destination.$id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <OptimizedImage 
                      src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/${destination.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${destination.$updatedAt}`}
                      alt={destination.title}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => {
                        setImageLoading(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(destination.$id);
                          return newSet;
                        });
                      }}
                      onError={() => {
                        console.error('❌ Destination image failed to load');
                        setImageLoading(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(destination.$id);
                          return newSet;
                        });
                      }}
                    />
                  </div>
                )}
                
                {/* Destination Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {destination.title}
                  </h3>



                  {/* Meta Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {destination.metaDescription}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleView(destination.$id, destination.slug)}
                        disabled={navigatingDestination === destination.$id || deletingDestinations.has(destination.$id)}
                      >
                        {navigatingDestination === destination.$id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          "View"
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(destination.$id)}
                        disabled={navigatingDestination === destination.$id || deletingDestinations.has(destination.$id)}
                      >
                        {navigatingDestination === destination.$id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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
                      onClick={() => handleDelete(destination.$id)}
                      disabled={deletingDestinations.has(destination.$id)}
                    >
                      {deletingDestinations.has(destination.$id) ? (
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
