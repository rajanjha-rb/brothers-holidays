"use client";

import React, { useState, useEffect } from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";

import { FaCalendar, FaRoute, FaMapMarkerAlt, FaDollarSign, FaImage, FaQuestion, FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
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
  bestMonths: string[];
  $createdAt: string;
  $updatedAt: string;
}

interface Destination {
  $id: string;
  title: string;
  slug: string;
  metaDescription: string;
  featuredImage: string;
  tags: string[];
  $createdAt: string;
  $updatedAt: string;
}

export default function PackageViewPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const [packageId, setPackageId] = useState<string>('');
  
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setPackageId(resolvedParams.id);
    };
    getParams();
  }, [params]);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFloatingBooking, setShowFloatingBooking] = useState(false);
  const [destinationData, setDestinationData] = useState<Destination | null>(null);
  const [similarPackages, setSimilarPackages] = useState<Package[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  // Fetch similar packages based on tags
  const fetchSimilarPackages = async (currentPackage: Package) => {
    try {
      setLoadingSimilar(true);
      const response = await fetch('/api/packages/list');
      const data = await response.json();
      
      if (data.success && data.packages) {
        // Filter out the current package and find packages with similar tags
        const allPackages = data.packages.filter((pkg: Package) => pkg.$id !== currentPackage.$id);
        
        if (currentPackage.tags && currentPackage.tags.length > 0) {
          // Find packages with matching tags
          const packagesWithSimilarTags = allPackages.filter((pkg: Package) => {
            if (!pkg.tags || pkg.tags.length === 0) return false;
            
            // Check if any tags match
            const hasMatchingTags = pkg.tags.some(tag => 
              currentPackage.tags.includes(tag)
            );
            
            return hasMatchingTags;
          });
          
          // Sort by number of matching tags (most similar first)
          const sortedPackages = packagesWithSimilarTags.sort((a: Package, b: Package) => {
            const aMatches = a.tags.filter(tag => currentPackage.tags.includes(tag)).length;
            const bMatches = b.tags.filter(tag => currentPackage.tags.includes(tag)).length;
            return bMatches - aMatches;
          });
          
          // Take top 4 most similar packages
          setSimilarPackages(sortedPackages.slice(0, 4));
        } else {
          // If no tags, show random packages
          const shuffled = allPackages.sort(() => 0.5 - Math.random());
          setSimilarPackages(shuffled.slice(0, 4));
        }
      }
    } catch (error) {
      console.error('Error fetching similar packages:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Fetch package data
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/packages/${packageId}`);
        const data = await response.json();
        
        if (data.success) {
          setPackageData(data.package);
          
          // Fetch destination data if destinationId exists
          if (data.package.destinationId && data.package.destinationId.trim() !== "") {
            try {
              const destResponse = await fetch(`/api/destinations/${data.package.destinationId}`);
              const destData = await destResponse.json();
              if (destData.success && destData.destination && destData.destination.title) {
                setDestinationData(destData.destination);
              } else {
                console.log('Destination API response:', destData);
                console.log('No valid destination data found');
              }
            } catch (error) {
              console.error('Error fetching destination:', error);
            }
          } else {
            console.log('No destinationId found in package data');
          }
        } else {
          console.error('Failed to fetch package:', data.message);
        }
        
        // Fetch similar packages after getting the current package
        if (data.success && data.package) {
          fetchSimilarPackages(data.package);
        }
      } catch (error) {
        console.error('Error fetching package:', error);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  // Scroll detection for floating booking popup
  useEffect(() => {
    const handleScroll = () => {
      const callToActionSection = document.getElementById('call-to-action-section');
      if (callToActionSection) {
        const rect = callToActionSection.getBoundingClientRect();
        // Show floating booking when call-to-action section is out of view
        setShowFloatingBooking(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading package...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
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

                {/* Only show destination if we have meaningful data */}
                {packageData.destinationId && 
                 packageData.destinationId.trim() !== "" && 
                 packageData.destinationId !== "undefined" && (
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <div className="w-8 h-8 bg-indigo-500/80 rounded-full flex items-center justify-center">
                      <FaMapMarkerAlt className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">
                      {destinationData && destinationData.title && destinationData.title.trim() !== "" 
                        ? destinationData.title 
                        : `Destination: ${packageData.destinationId}`}
                    </span>
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
                


                {/* Best Months to Visit */}
                {packageData.bestMonths && packageData.bestMonths.length > 0 && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-500/90 to-purple-600/90 backdrop-blur-sm rounded-full px-5 py-3 border border-white/40 shadow-lg">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FaCalendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">Best Time:</span>
                      <div className="flex gap-2">
                        {packageData.bestMonths.slice(0, 6).map((month, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-white/25 text-white text-sm font-medium rounded-full border border-white/40 hover:bg-white/35 transition-all duration-200 backdrop-blur-sm"
                          >
                            {month}
                          </span>
                        ))}
                        {packageData.bestMonths.length > 6 && (
                          <span className="px-3 py-1.5 bg-white/20 text-white/80 text-sm font-medium rounded-full border border-white/30">
                            +{packageData.bestMonths.length - 6}
                          </span>
                        )}
                      </div>
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
        <div className="max-w-7xl mx-auto px-6 py-12">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Package Overview */}
              {packageData.overview && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-6 hover:shadow-2xl transition-all duration-500">
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

              {/* Call to Action Section */}
              <div id="call-to-action-section" className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-2xl border border-emerald-400/50 p-6 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h2>
                <p className="text-emerald-100 text-lg mb-6 max-w-2xl mx-auto">
                  Experience this incredible travel package with our professional service and support.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button 
                    className="bg-white text-emerald-600 hover:bg-emerald-50 border-0 px-8 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      window.location.href = '/contact';
                    }}
                  >
                    🚀 Book This Package
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      window.location.href = '/contact?customize=true';
                    }}
                  >
                    ✨ Customize Package
                  </Button>
                </div>
                <div className="mt-6 flex justify-center gap-6 text-sm text-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    Professional Service
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    Full Support
                  </div>
                </div>
              </div>

              {/* Enhanced Itinerary */}
              {packageData.itinerary && packageData.itinerary.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <FaRoute className="w-6 h-6 text-white" />
                    </div>
                    Day-wise Itinerary
                  </h2>
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={day.day} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        {/* Collapsible Header */}
                        <div 
                          className="flex items-center justify-between p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                          onClick={() => {
                            const content = document.getElementById(`itinerary-${index}`);
                            const icon = document.getElementById(`icon-${index}`);
                            if (content && icon) {
                              content.classList.toggle('hidden');
                              icon.classList.toggle('rotate-180');
                            }
                          }}
                        >
                          <h4 className="font-bold text-lg text-blue-900">Day {day.day}: {day.title}</h4>
                          <svg 
                            id={`icon-${index}`}
                            className="w-5 h-5 text-blue-600 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {/* Collapsible Content */}
                        <div id={`itinerary-${index}`} className="p-4">
                          {/* Information Panels */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Accommodation</p>
                                <p className="font-semibold text-gray-900">Teahouse</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Time Taken</p>
                                <p className="font-semibold text-gray-900">8-9 hours</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Max Altitude</p>
                                <p className="font-semibold text-gray-900">2,800 m</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-gray-700 leading-relaxed">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Gallery Images */}
              {packageData.galleryImages && packageData.galleryImages.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FaImage className="w-6 h-6 text-white" />
                    </div>
                    Gallery
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {packageData.galleryImages.map((imageId, index) => {
                      // Use the featured image bucket for gallery images
                      const imageBucket = packageData.featuredImageBucket || 'featuredImage';
                      const imageSrc = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${imageBucket}/files/${imageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                      
                      return (
                        <div key={index} className="relative group cursor-pointer">
                          <div 
                            className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-green-300"
                            onClick={() => setSelectedImage(imageId)}
                            title="Click to view full size"
                          >
                            <OptimizedImage
                              src={imageSrc}
                              alt="Gallery image"
                              width={300}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Hover Overlay with Click Indicator */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                                <FaImage className="w-6 h-6 text-green-600" />
                              </div>
                            </div>
                            
                            {/* Click to View Text */}
                            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded text-center">
                                Click to view
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enhanced Cost Include */}
              {packageData.costInclude && packageData.costInclude.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FaCheck className="w-6 h-6 text-white" />
                    </div>
                    What&apos;s Included
                  </h2>
                  <div className="space-y-6">
                    {packageData.costInclude.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FaCheck className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 mb-3">{item}</h4>
                          <p className="text-gray-700 leading-relaxed">
                            This service is included in your package to ensure a complete and enjoyable experience.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Cost Exclude */}
              {packageData.costExclude && packageData.costExclude.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaTimes className="w-6 h-6 text-white" />
                    </div>
                    What&apos;s Not Included
                  </h2>
                  <div className="space-y-6">
                    {packageData.costExclude.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FaTimes className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 mb-3">{item}</h4>
                          <p className="text-gray-700 leading-relaxed">
                            This service is not included in your package and may require additional arrangements or costs.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Testimonials Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <FaImage className="w-6 h-6 text-white" />
                  </div>
                  Client Testimonials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                        S
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Sarah M.</h4>
                        <p className="text-sm text-gray-600">Adventure Traveler</p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">&ldquo;Absolutely incredible experience! The itinerary was perfectly planned and every detail was taken care of. Highly recommend!&rdquo;</p>
                    <div className="flex text-yellow-400 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                        M
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Michael R.</h4>
                        <p className="text-sm text-gray-600">Cultural Explorer</p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">&ldquo;Professional service from start to finish. The guides were knowledgeable and the accommodations exceeded expectations.&rdquo;</p>
                    <div className="flex text-yellow-400 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                        E
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Emma L.</h4>
                        <p className="text-sm text-gray-600">Solo Traveler</p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">&ldquo;As a solo traveler, I felt completely safe and supported throughout the entire journey. Amazing memories created!&rdquo;</p>
                    <div className="flex text-yellow-400 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced FAQ */}
              {packageData.faq && packageData.faq.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 p-6 hover:shadow-2xl transition-all duration-500">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaQuestion className="w-6 h-6 text-white" />
                    </div>
                    Frequently Asked Questions ({packageData.faq.length})
                  </h2>
                  <div className="space-y-4">
                    {packageData.faq.map((faq, index) => (
                      <div key={index} className="border border-purple-200/50 rounded-xl overflow-hidden">
                        {/* Clickable Question Header */}
                        <div 
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                          onClick={() => {
                            const answer = document.getElementById(`faq-answer-${index}`);
                            const icon = document.getElementById(`faq-icon-${index}`);
                            if (answer && icon) {
                              answer.classList.toggle('hidden');
                              icon.classList.toggle('rotate-180');
                            }
                          }}
                        >
                          <h4 className="font-bold text-lg text-purple-900 flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <FaQuestion className="w-4 h-4 text-white" />
                            </div>
                            {faq.question}
                          </h4>
                          <svg 
                            id={`faq-icon-${index}`}
                            className="w-5 h-5 text-purple-600 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {/* Collapsible Answer */}
                        <div id={`faq-answer-${index}`} className="hidden p-4 bg-white">
                          <p className="text-purple-800 text-lg leading-relaxed">{faq.answer}</p>
                        </div>
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
                
                {/* Package Information Header */}
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl text-center border border-gray-200/50">
                  <h4 className="text-gray-800 text-xl font-bold mb-3">Package Details</h4>
                  <p className="text-gray-600 mb-4 text-sm">Complete information about this travel package</p>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span className="text-sm">All details listed below</span>
                  </div>
                </div>
                
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
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50 hover:shadow-lg transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <FaCalendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Best Months to Visit</p>
                        <div className="flex flex-wrap gap-2">
                          {packageData.bestMonths.map((month, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-sm font-medium rounded-full border border-purple-200 hover:from-purple-200 hover:to-indigo-200 transition-all duration-200 shadow-sm"
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




            </div>
          </div>

        </div>
      </main>

      {/* Floating Sidebar Booking Popup */}
      {showFloatingBooking && (
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-200/50 p-6 max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Ready to Book?</h3>
            <div className="space-y-3">
              <Button 
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  window.location.href = '/contact';
                }}
              >
                🚀 Book This Package
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-transparent text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  window.location.href = '/contact?customize=true';
                }}
              >
                ✨ Customize Package
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[95vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <Button
                onClick={() => setSelectedImage(null)}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-100 border-gray-300"
              >
                ✕ Close
              </Button>
            </div>
            
            {/* Image Container */}
            <div className="p-4">
              <OptimizedImage
                src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${packageData.featuredImageBucket || 'featuredImage'}/files/${selectedImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                alt="Full size image"
                width={1200}
                height={800}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            </div>
            
            {/* Click Outside to Close Hint */}
            <div className="text-center pb-4 text-sm text-gray-500">
              Click outside the image to close
            </div>
          </div>
        </div>
      )}

      {/* Packages You May Like Section */}
      {similarPackages.length > 0 && (
        <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Packages You May Like
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover more amazing travel experiences with similar themes and destinations
              </p>
            </div>
            
            {loadingSimilar ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Finding similar packages...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarPackages.map((pkg) => (
                  <div
                    key={pkg.$id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                  >
                    {/* Package Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <Link href={`/packages/${pkg.$id}/${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {pkg.featuredImage ? (
                          <OptimizedImage
                            src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${pkg.featuredImageBucket}/files/${pkg.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${pkg.$updatedAt}`}
                            alt={pkg.name}
                            width={400}
                            height={192}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                            <FaImage className="w-12 h-12 text-blue-400 opacity-50" />
                          </div>
                        )}
                      </Link>
                      
                      {/* Price Badge */}
                      {pkg.price && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-white text-gray-900 font-semibold px-3 py-1 rounded-full text-sm shadow-md border border-gray-200">
                            {pkg.price}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Package Content */}
                    <div className="p-5">
                      <Link href={`/packages/${pkg.$id}/${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                          {pkg.name}
                        </h3>
                      </Link>
                      
                      {/* Package Info */}
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
                      
                      {/* Overview Preview */}
                      {pkg.overview && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {pkg.overview}
                        </p>
                      )}
                      
                      {/* View Details Button */}
                      <Link href={`/packages/${pkg.$id}/${pkg.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700 transition-all duration-200"
                        >
                          View Details
                          <FaArrowLeft className="w-3 h-3 ml-2 rotate-180" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* View All Packages Button */}
            <div className="text-center mt-12">
              <Link href="/packages">
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View All Packages
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
