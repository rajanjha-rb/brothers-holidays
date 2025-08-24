import React from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";
import { FaCalendar, FaTags, FaRoute, FaMapMarkerAlt, FaDollarSign, FaImage, FaQuestion, FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

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
  bestMonths: string[]; // New field for best months to visit
  $createdAt: string;
  $updatedAt: string;
}

interface PageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

// This function runs at build time to generate static paths for all packages
export async function generateStaticParams() {
  try {
    const response = await databases.listDocuments(db, packageCollection, []);
    const packagesData = response.documents as unknown as Package[];
    
    return packagesData.map((pkg) => ({
      id: pkg.$id,
      slug: pkg.name.toLowerCase().replace(/\s+/g, '-'),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Force revalidation on every request to ensure fresh data
export const revalidate = 0;

// Fetch package data on the server side
async function getPackage(packageId: string): Promise<Package | null> {
  try {
    const doc = await databases.getDocument(db, packageCollection, packageId);
    
    // Parse JSON strings back to arrays for frontend consumption
    const packageData = doc as unknown as Package;
    
    // Parse itinerary from JSON string to array
    if (typeof packageData.itinerary === 'string') {
      try {
        packageData.itinerary = JSON.parse(packageData.itinerary);
      } catch (parseError) {
        console.error('Error parsing itinerary JSON:', parseError);
        packageData.itinerary = [];
      }
    }
    
    // Parse FAQ from JSON string to array
    if (typeof packageData.faq === 'string') {
      try {
        packageData.faq = JSON.parse(packageData.faq);
      } catch (parseError) {
        console.error('Error parsing FAQ JSON:', parseError);
        packageData.faq = [];
      }
    }
    
    // Ensure arrays are properly initialized
    if (!Array.isArray(packageData.itinerary)) {
      packageData.itinerary = [];
    }
    if (!Array.isArray(packageData.faq)) {
      packageData.faq = [];
    }
    if (!Array.isArray(packageData.costInclude)) {
      packageData.costInclude = [];
    }
    if (!Array.isArray(packageData.costExclude)) {
      packageData.costExclude = [];
    }
    if (!Array.isArray(packageData.galleryImages)) {
      packageData.galleryImages = [];
    }
    if (!Array.isArray(packageData.tags)) {
      packageData.tags = [];
    }
    
    return packageData;
  } catch (error) {
    console.error('Error fetching package:', error);
    return null;
  }
}

export default async function PackageViewPage({ params }: PageProps) {
  const { id: packageId } = await params;
  
  console.log('PackageViewPage: Attempting to fetch package with ID:', packageId);
  
  // Fetch package data with error handling
  let packageData: Package | null = null;
  try {
    packageData = await getPackage(packageId);
    console.log('PackageViewPage: Package data fetched successfully:', {
      id: packageData?.$id,
      name: packageData?.name,
      hasItinerary: Array.isArray(packageData?.itinerary),
      itineraryLength: packageData?.itinerary?.length,
      hasFaq: Array.isArray(packageData?.faq),
      faqLength: packageData?.faq?.length
    });
  } catch (error) {
    console.error('PackageViewPage: Error fetching package:', error);
  }

  if (!packageData) {
    console.log('PackageViewPage: Package not found, showing error page');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h1>
          <p className="text-gray-600 mb-6">The travel package you&apos;re looking for doesn&apos;t exist or cannot be accessed.</p>
          <Button 
            onClick={() => window.location.href = '/packages'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  console.log('PackageViewPage: Rendering package page for:', packageData.name);

  return (
    <div className="min-h-screen bg-white">
      {/* Show navbar for all users */}
      <Navbar />

      {/* Hero Section with Featured Image Background */}
      {packageData.featuredImage && (
        <div className="relative min-h-[70vh]">
          
          {/* Background Image Container */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <OptimizedImage 
              src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${packageData.featuredImageBucket}/files/${packageData.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${packageData.$updatedAt}`}
              alt={packageData.name}
              width={1920}
              height={1080}
              className="object-cover w-full h-full"
              sizes="100vw"
              priority
              style={{
                objectPosition: 'center'
              }}
            />
          </div>
          
          {/* Enhanced Dark overlay with gradient */}
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.6) 100%)'
            }}
          ></div>
          
          {/* Content overlay with premium styling */}
          <div className="relative z-20 flex items-center justify-center min-h-[70vh] text-center text-white max-w-5xl mx-auto px-4">
            <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                {packageData.name}
              </h1>
              
              {/* Enhanced Meta information with premium badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
                {packageData.location && (
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <div className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center">
                      <FaMapMarkerAlt className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">{packageData.location}</span>
                  </div>
                )}
                


                {(packageData.days || packageData.nights) && (
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <div className="w-8 h-8 bg-purple-500/80 rounded-full flex items-center justify-center">
                      <FaCalendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">
                      {packageData.days && packageData.nights ? `${packageData.days}d/${packageData.nights}n` : packageData.days ? `${packageData.days}d` : `${packageData.nights}n`}
                    </span>
                  </div>
                )}

                {packageData.destinationId && (
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <div className="w-8 h-8 bg-indigo-500/80 rounded-full flex items-center justify-center">
                      <FaMapMarkerAlt className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Dest: {packageData.destinationId}</span>
                  </div>
                )}
                
                {packageData.price && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/90 to-green-600/90 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-400/30 shadow-lg">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FaDollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">{packageData.price}</span>
                  </div>
                )}
                
                {packageData.tags && packageData.tags.length > 0 && (
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <div className="w-8 h-8 bg-purple-500/80 rounded-full flex items-center justify-center">
                      <FaTags className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {packageData.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-white/30 text-white border-white/50 backdrop-blur-sm">
                          {tag}
                        </Badge>
                      ))}
                      {packageData.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-white/30 text-white border-white/50 backdrop-blur-sm">
                          +{packageData.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Best Months to Visit */}
                {packageData.bestMonths && packageData.bestMonths.length > 0 && (
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <div className="w-8 h-8 bg-indigo-500/80 rounded-full flex items-center justify-center">
                      <FaCalendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-medium text-white">Best:</span>
                      {packageData.bestMonths.slice(0, 4).map((month, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/30 text-white text-xs font-medium rounded-full border border-white/50"
                        >
                          {month}
                        </span>
                      ))}
                      {packageData.bestMonths.length > 4 && (
                        <span className="px-2 py-1 bg-white/30 text-white text-xs font-medium rounded-full border border-white/50">
                          +{packageData.bestMonths.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Package Header (when no featured image) */}
          {!packageData.featuredImage && (
            <div className="text-center mb-16 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-3xl p-12 border border-pink-200/50">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                {packageData.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-lg text-gray-600">
                {packageData.location && (
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-pink-200 shadow-sm">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <FaMapMarkerAlt className="w-3 h-3 text-red-500" />
                    </div>
                    <span className="font-semibold">{packageData.location}</span>
                  </div>
                )}
                

                
                {packageData.price && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full px-4 py-2 border border-emerald-200 shadow-sm">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <FaDollarSign className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-green-700 font-bold text-lg">{packageData.price}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Back to Packages Button */}
          <div className="mb-12">
            <Link href="/packages">
              <Button variant="outline" className="flex items-center gap-3 bg-white/80 backdrop-blur-sm hover:bg-white border-pink-200 hover:border-pink-300 text-pink-700 hover:text-pink-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3">
                <FaArrowLeft className="w-4 h-4" />
                Back to Packages
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Package Overview */}
              {packageData.overview && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FaImage className="w-5 h-5 text-white" />
                    </div>
                    Package Overview
                  </h2>
                  <div 
                    className="prose max-w-none prose-lg"
                    dangerouslySetInnerHTML={{ __html: packageData.overview }}
                  />
                </div>
              )}

              {/* Enhanced Itinerary */}
              {packageData.itinerary && packageData.itinerary.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-8 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <FaRoute className="w-6 h-6 text-white" />
                    </div>
                    Day-wise Itinerary
                  </h2>
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
                </div>
              )}

              {/* Enhanced Gallery Images */}
              {packageData.galleryImages && packageData.galleryImages.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FaImage className="w-6 h-6 text-green-600" />
                    Gallery Images ({packageData.galleryImages.length})
                  </h2>
                  
                  {/* Debug Information - Remove this in production */}
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                    <div>Featured Image Bucket: {packageData.featuredImageBucket || 'Not set'}</div>
                    <div>Gallery Images Count: {packageData.galleryImages.length}</div>
                    <div>First Gallery Image ID: {packageData.galleryImages[0] || 'None'}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {packageData.galleryImages.map((imageId, index) => {
                      // Try to determine the correct bucket for gallery images
                      // First try the featured image bucket, then fallback to media bucket
                      const imageBucket = packageData.featuredImageBucket || 'media';
                      const imageSrc = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${imageBucket}/files/${imageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                      
                      return (
                        <div key={index} className="relative group">
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                            <OptimizedImage
                              src={imageSrc}
                              alt={`Gallery image ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-3">
                            <span className="text-white text-sm font-semibold">View Image {index + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enhanced FAQ */}
              {packageData.faq && packageData.faq.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 p-8 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaQuestion className="w-6 h-6 text-white" />
                    </div>
                    Frequently Asked Questions ({packageData.faq.length})
                  </h2>
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
                </div>
              )}
            </div>

            {/* Enhanced Sidebar - Right Column */}
            <div className="space-y-8">
              {/* Enhanced Package Info Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                    <FaImage className="w-4 h-4 text-white" />
                  </div>
                  Package Information
                </h3>
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

                  {/* Best Months to Visit */}
                  {packageData.bestMonths && packageData.bestMonths.length > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <FaCalendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Best Months to Visit</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {packageData.bestMonths.map((month, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
                            >
                              {month}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200/50">
                    <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                      <FaCalendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Created</p>
                      <p className="font-bold text-gray-900">
                        {new Date(packageData.$createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Tags */}
              {packageData.tags && packageData.tags.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FaTags className="w-5 h-5 text-white" />
                    </div>
                    Tags ({packageData.tags.length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {packageData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 px-3 py-2 text-sm font-semibold hover:from-blue-200 hover:to-purple-200 transition-all duration-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Cost Include */}
              {packageData.costInclude && packageData.costInclude.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FaCheck className="w-5 h-5 text-white" />
                    </div>
                    What&apos;s Included ({packageData.costInclude.length})
                  </h3>
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
                </div>
              )}

              {/* Enhanced Cost Exclude */}
              {packageData.costExclude && packageData.costExclude.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaTimes className="w-5 h-5 text-white" />
                    </div>
                    What&apos;s Not Included ({packageData.costExclude.length})
                  </h3>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
