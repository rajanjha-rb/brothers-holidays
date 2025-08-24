"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";
import OptimizedImage from "@/components/OptimizedImage";
import { 
  FaEdit, 
  FaTrash, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaDollarSign, 
  FaArrowLeft, 
  FaImage, 
  FaRoute, 
  FaQuestion, 
  FaTags, 
  FaCheck, 
  FaTimes,
  FaCalendar
} from "react-icons/fa";

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

export default function ViewPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;
  
  const { hydrated, isAdmin, adminChecked } = useAuthState();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (hydrated && adminChecked && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/");
    }
  }, [hydrated, adminChecked, isAdmin, router]);

  // Fetch package data
  const fetchPackageData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/packages/${packageId}`);
      const data = await response.json();
      
      if (data.success) {
        const pkg = data.package;
        setPackageData({
          $id: pkg.$id,
          name: pkg.name || "",
          overview: pkg.overview || "",
          costInclude: Array.isArray(pkg.costInclude) ? pkg.costInclude : [],
          costExclude: Array.isArray(pkg.costExclude) ? pkg.costExclude : [],
          itinerary: (() => {
            try {
              if (typeof pkg.itinerary === 'string') {
                return JSON.parse(pkg.itinerary);
              }
              return Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
            } catch {
              return [];
            }
          })(),
          featuredImage: pkg.featuredImage || "",
          featuredImageBucket: pkg.featuredImageBucket || "",
          galleryImages: Array.isArray(pkg.galleryImages) ? pkg.galleryImages : [],
          faq: (() => {
            try {
              if (typeof pkg.faq === 'string') {
                return JSON.parse(pkg.faq);
              }
              return Array.isArray(pkg.faq) ? pkg.faq : [];
            } catch {
              return [];
            }
          })(),
          tags: Array.isArray(pkg.tags) ? pkg.tags : [],
          days: pkg.days || null,
          nights: pkg.nights || null,
          location: pkg.location || "",
          destinationId: pkg.destinationId || "",
          price: pkg.price || "",
          $createdAt: pkg.$createdAt || "",
          $updatedAt: pkg.$updatedAt || ""
        });
      } else {
        toast.error('Failed to fetch package data');
        router.push('/dashboard/allpackages');
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
      toast.error('Failed to fetch package data');
      router.push('/dashboard/allpackages');
    } finally {
      setLoading(false);
    }
  }, [packageId, router]);

  useEffect(() => {
    if (packageId) {
      fetchPackageData();
    }
  }, [packageId, fetchPackageData]);

  // Delete package
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/packages/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: packageId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Package deleted successfully!');
        router.push('/dashboard/allpackages');
      } else {
        toast.error(data.message || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Show loading state while checking authentication
  if (!hydrated || !adminChecked || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading package...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Package not found</p>
          <Button onClick={() => router.push('/dashboard/allpackages')} className="mt-4">
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/dashboard/allpackages')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Packages
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{packageData.name}</h1>
                <p className="text-gray-600 mt-2">Package Details & Information</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/dashboard/packages/edit/${packageData.$id}`)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FaEdit className="w-4 h-4" />
                Edit Package
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                disabled={deleting}
              >
                {deleting ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaTrash className="w-4 h-4" />
                )}
                {deleting ? 'Deleting...' : 'Delete Package'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Featured Image */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-200/50">
                <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FaImage className="w-5 h-5 text-white" />
                  </div>
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {packageData.featuredImage ? (
                  <div 
                    className="relative w-full h-96 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-500"
                    onClick={() => setSelectedImage(packageData.featuredImage)}
                  >
                    <OptimizedImage
                      src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${packageData.featuredImageBucket}/files/${packageData.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${packageData.$updatedAt}`}
                      alt={packageData.name}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-lg">Click to view full size</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
                    <div className="text-center text-gray-500">
                      <FaImage className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg">No featured image</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Package Overview */}
            {packageData.overview && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200/50">
                  <CardTitle className="text-2xl text-gray-900">Package Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div 
                    className="prose max-w-none prose-lg"
                    dangerouslySetInnerHTML={{ __html: packageData.overview }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Enhanced Itinerary */}
            {packageData.itinerary && packageData.itinerary.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200/50">
                  <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <FaRoute className="w-6 h-6 text-white" />
                    </div>
                    Day-wise Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {packageData.itinerary.map((day) => (
                      <div key={day.day} className="border border-blue-200/50 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start gap-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-xl text-blue-900 mb-3">{day.title}</h4>
                            <p className="text-blue-800 text-lg leading-relaxed">{day.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Gallery Images */}
            {packageData.galleryImages && packageData.galleryImages.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200/50">
                  <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FaImage className="w-6 h-6 text-white" />
                    </div>
                    Gallery Images ({packageData.galleryImages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {packageData.galleryImages.map((imageId, index) => {
                      // Try to determine the correct bucket for gallery images
                      // First try the featured image bucket, then fallback to media bucket
                      const imageBucket = packageData.featuredImageBucket || 'media';
                      const imageSrc = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${imageBucket}/files/${imageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                      
                      return (
                        <div key={index} className="relative group">
                          <div 
                            className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                            onClick={() => setSelectedImage(imageId)}
                          >
                            <OptimizedImage
                              src={imageSrc}
                              alt={`Gallery image ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-3">
                            <span className="text-white text-sm font-semibold">View Image {index + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced FAQ */}
            {packageData.faq && packageData.faq.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200/50">
                  <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaQuestion className="w-6 h-6 text-white" />
                    </div>
                    Frequently Asked Questions ({packageData.faq.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {packageData.faq.map((faq, index) => (
                      <div key={index} className="border border-purple-200/50 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover:shadow-lg">
                        <h4 className="font-bold text-xl text-purple-900 mb-3 flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <FaQuestion className="w-4 h-4 text-white" />
                          </div>
                          {faq.question}
                        </h4>
                        <p className="text-purple-800 text-lg leading-relaxed ml-11">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Enhanced Package Info Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200/50">
                <CardTitle className="text-xl text-gray-900">Package Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {packageData.location && (
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200/50">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                        <FaMapMarkerAlt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Location</p>
                        <p className="font-bold text-gray-900">{packageData.location}</p>
                      </div>
                    </div>
                  )}



                  {(packageData.days || packageData.nights) && (
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <FaCalendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Trip Details</p>
                        <div className="flex gap-4">
                          {packageData.days && (
                            <div>
                              <p className="text-xs text-gray-500">Days</p>
                              <p className="font-bold text-gray-900">{packageData.days}</p>
                            </div>
                          )}
                          {packageData.nights && (
                            <div>
                              <p className="text-xs text-gray-500">Nights</p>
                              <p className="font-bold text-gray-900">{packageData.nights}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {packageData.destinationId && (
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200/50">
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                        <FaMapMarkerAlt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Destination</p>
                        <p className="font-bold text-gray-900">{packageData.destinationId}</p>
                      </div>
                    </div>
                  )}

                  {packageData.price && (
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <FaDollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Price</p>
                        <p className="font-bold text-2xl text-emerald-700">{packageData.price}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200/50">
                    <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                      <FaCalendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Created</p>
                      <p className="font-bold text-gray-900">{formatDate(packageData.$createdAt)}</p>
                    </div>
                  </div>

                  {packageData.$updatedAt !== packageData.$createdAt && (
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200/50">
                      <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                        <FaCalendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Last Updated</p>
                        <p className="font-bold text-gray-900">{formatDate(packageData.$updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Tags */}
            {packageData.tags && packageData.tags.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-gray-900">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FaTags className="w-5 h-5 text-white" />
                    </div>
                    Tags ({packageData.tags.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {packageData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 px-3 py-2 text-sm font-semibold hover:from-blue-200 hover:to-purple-200 transition-all duration-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Cost Include */}
            {packageData.costInclude && packageData.costInclude.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-gray-900">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FaCheck className="w-5 h-5 text-white" />
                    </div>
                    What&apos;s Included ({packageData.costInclude.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {packageData.costInclude.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Cost Exclude */}
            {packageData.costExclude && packageData.costExclude.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-gray-900">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaTimes className="w-5 h-5 text-white" />
                    </div>
                    What&apos;s Not Included ({packageData.costExclude.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {packageData.costExclude.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200/50">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaTimes className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-red-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <OptimizedImage
              src={selectedImage === packageData.featuredImage 
                ? `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${packageData.featuredImageBucket}/files/${selectedImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${packageData.$updatedAt}`
                : `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/media/files/${selectedImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
              }
              alt="Full size image"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              onClick={() => setSelectedImage(null)}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
