"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FaPlus, FaSearch, FaImage, FaRoute, FaQuestion, FaMapMarkerAlt, FaCalendar } from "react-icons/fa";
import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface Package {
  $id: string;
  name: string;
  slug: string;
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

export default function AllPackagesPage() {
  const router = useRouter();
  const { user, hydrated, isAdmin } = useAuthState();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPackages, setDeletingPackages] = useState<Set<string>>(new Set());
  const [navigatingPackage, setNavigatingPackage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);

  // Helper function to safely parse data and handle type mismatches
  const normalizePackageData = (pkg: Record<string, unknown>): Package => {
    return {
      $id: pkg.$id as string,
      name: pkg.name as string || "",
      slug: pkg.slug as string || "",
      overview: pkg.overview as string || "",
      costInclude: Array.isArray(pkg.costInclude) ? pkg.costInclude as string[] : [],
      costExclude: Array.isArray(pkg.costExclude) ? pkg.costExclude as string[] : [],
      itinerary: (() => {
        try {
          if (typeof pkg.itinerary === 'string') {
            return JSON.parse(pkg.itinerary);
          }
          return Array.isArray(pkg.itinerary) ? pkg.itinerary as Array<{ day: number; title: string; description: string }> : [];
        } catch {
          return [];
        }
      })(),
      featuredImage: pkg.featuredImage as string || "",
      featuredImageBucket: pkg.featuredImageBucket as string || "",
      galleryImages: Array.isArray(pkg.galleryImages) ? pkg.galleryImages as string[] : [],
      faq: (() => {
        try {
          if (typeof pkg.faq === 'string') {
            return JSON.parse(pkg.faq);
          }
          return Array.isArray(pkg.faq) ? pkg.faq as Array<{ question: string; answer: string }> : [];
        } catch {
          return [];
        }
      })(),
      tags: Array.isArray(pkg.tags) ? pkg.tags as string[] : [],
      days: pkg.days as number | null || null,
      nights: pkg.nights as number | null || null,
      location: pkg.location as string || "",
      destinationId: pkg.destinationId as string || "",
      price: pkg.price as string || "",
      $createdAt: pkg.$createdAt as string || "",
      $updatedAt: pkg.$updatedAt as string || ""
    };
  };

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      const response = await fetch('/api/packages/list');
      const data = await response.json();
      
      if (data.success) {
        const normalizedPackages = (data.packages || []).map(normalizePackageData);
        setPackages(normalizedPackages);
        setFilteredPackages(normalizedPackages);
        
        // Prefetch package routes for faster navigation
        normalizedPackages.forEach((pkg: Package) => {
          router.prefetch(`/dashboard/packages/view/${pkg.$id}`);
          router.prefetch(`/dashboard/packages/edit/${pkg.$id}`);
        });
        
        // Prefetch add new package route
        router.prefetch('/dashboard/addnewpackage');
      } else {
        console.error('Failed to fetch packages:', data.message);
        setPackages([]);
        setFilteredPackages([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
      setFilteredPackages([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const forceReinitDatabase = async () => {
    if (!confirm('This will force reinitialize the database. This action cannot be undone. Continue?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/init-db', { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Database reinitialized successfully!');
        // Refresh packages
        fetchPackages();
      } else {
        toast.error(data.message || 'Failed to reinitialize database');
      }
    } catch (error) {
      console.error('Error reinitializing database:', error);
      toast.error('Failed to reinitialize database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Filter packages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPackages(packages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = packages.filter(pkg => {
      const searchableText = [
        pkg.name,
        pkg.location,
        pkg.price,
        pkg.overview,
        ...pkg.tags
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
    
    setFilteredPackages(filtered);
  }, [searchQuery, packages]);

  // Delete package with loading state
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) {
      return;
    }

    setDeletingPackages(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch('/api/packages/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Package deleted successfully!');
        fetchPackages(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    } finally {
      setDeletingPackages(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Navigation handlers with loading states
  const handleView = (packageId: string) => {
    if (navigatingPackage !== packageId) {
      setNavigatingPackage(packageId);
      router.push(`/dashboard/packages/view/${packageId}`, { scroll: false });
    }
  };

  const handleEdit = (packageId: string) => {
    if (navigatingPackage !== packageId) {
      setNavigatingPackage(packageId);
      router.push(`/dashboard/packages/edit/${packageId}`, { scroll: false });
    }
  };

  // Show loading state while checking authentication
  if (!hydrated || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
              <p className="text-gray-600 mt-2">Manage your travel packages and content</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/dashboard/addnewpackage')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FaPlus className="mr-2" />
                Add New Package
              </Button>
              
              <Button
                onClick={forceReinitDatabase}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                disabled={loading}
              >
                {loading ? 'Reinitializing...' : 'Force Reinit DB'}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search packages by name, location, duration, price, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Total Packages: {packages.length}</span>
            {searchQuery && <span>Filtered: {filteredPackages.length}</span>}
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading packages...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredPackages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {searchQuery ? (
                <>
                  <p className="text-gray-500 text-lg mb-4">No packages found matching &quot;{searchQuery}&quot;</p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="mx-auto"
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg mb-4">No packages found</p>
                  <Button
                    onClick={() => router.push('/dashboard/addnewpackage')}
                    className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create Your First Package
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <div key={pkg.$id} className="group">
                <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 rounded-3xl overflow-hidden group-hover:border-pink-200 package-card flex flex-col relative">
                  {/* Premium Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                  
                  {/* Package Image */}
                  <div className="h-56 bg-gray-200 overflow-hidden relative">
                    {pkg.featuredImage ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${pkg.featuredImageBucket}/files/${pkg.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${pkg.$updatedAt}`}
                        alt={pkg.name}
                        width={400}
                        height={224}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
                        <div className="text-center text-gray-400">
                          <FaImage className="w-16 h-16 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                    
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
                  
                  {/* Package Content */}
                  <div className="p-6 flex-1 flex flex-col relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors duration-500 leading-tight tracking-tight">
                      {pkg.name}
                    </h3>
                    
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

                      {(pkg.days || pkg.nights) && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaCalendar className="w-3 h-3 text-purple-500" />
                          </div>
                          <span className="font-medium">
                            {pkg.days && pkg.nights ? `${pkg.days}d/${pkg.nights}n` : pkg.days ? `${pkg.days}d` : `${pkg.nights}n`}
                          </span>
                        </div>
                      )}
                      {pkg.destinationId && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaMapMarkerAlt className="w-3 h-3 text-indigo-500" />
                          </div>
                          <span className="font-medium">Dest: {pkg.destinationId}</span>
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
                        <FaQuestion className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                        <span className="font-semibold text-purple-700">{pkg.faq.length} FAQs</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-xl px-4 py-2"
                          onClick={() => handleView(pkg.$id)}
                          disabled={navigatingPackage === pkg.$id || deletingPackages.has(pkg.$id)}
                        >
                          {navigatingPackage === pkg.$id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </div>
                          ) : (
                            "View"
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-xl px-4 py-2 border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => handleEdit(pkg.$id)}
                          disabled={navigatingPackage === pkg.$id || deletingPackages.has(pkg.$id)}
                        >
                          {navigatingPackage === pkg.$id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
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
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-xl px-4 py-2"
                        onClick={() => handleDelete(pkg.$id)}
                        disabled={deletingPackages.has(pkg.$id)}
                      >
                        {deletingPackages.has(pkg.$id) ? (
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
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
