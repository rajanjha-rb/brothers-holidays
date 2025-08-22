"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FaPlus, FaTrash, FaImage, FaTimes, FaQuestion, FaPlusCircle, FaRoute, FaSearch, FaSpinner } from "react-icons/fa";
import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";
import RTE from "@/components/RTE";
import OptimizedImage from "@/components/OptimizedImage";

interface PackageFormData {
  name: string;
  overview: string;
  costInclude: string[];
  costExclude: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  featuredImage: string;
  featuredImageBucket: string;
  galleryImages: string[];
  faq: Array<{ question: string; answer: string }>;
  tags: Set<string>;
  duration: string;
  location: string;
  price: string;
}

interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  alt?: string;
  description?: string;
  tags?: string[];
  title?: string;
  caption?: string;
  fileUrl: string;
  metadataId?: string | null;
}

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;
  
  const { hydrated, isAdmin, adminChecked } = useAuthState();
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    overview: "",
    costInclude: [],
    costExclude: [],
    itinerary: [],
    featuredImage: "",
    featuredImageBucket: "featuredImage",
    galleryImages: [],
    faq: [],
    tags: new Set(),
    duration: "",
    location: "",
    price: ""
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newItineraryDay, setNewItineraryDay] = useState("");
  const [newItineraryTitle, setNewItineraryTitle] = useState("");
  const [newItineraryDescription, setNewItineraryDescription] = useState("");
  const [newCostInclude, setNewCostInclude] = useState("");
  const [newCostExclude, setNewCostExclude] = useState("");
  
  // Image selector modal states
  const [showFeaturedImageSelector, setShowFeaturedImageSelector] = useState(false);
  const [showGalleryImageSelector, setShowGalleryImageSelector] = useState(false);

  // Authentication check
  useEffect(() => {
    if (hydrated && adminChecked && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/");
    }
  }, [hydrated, adminChecked, isAdmin, router]);

  // Fetch media files function
  const fetchMediaFiles = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch('/api/media/list');
      const data = await response.json();
      
      if (data.success) {
        setMediaFiles(data.files || []);
      } else {
        console.error('Failed to fetch media files:', data.error);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Fetch package data
  const fetchPackageData = useCallback(async () => {
    try {
      setLoadingPackage(true);
      const response = await fetch(`/api/packages/${packageId}`);
      const data = await response.json();
      
      if (data.success) {
        const packageData = data.package;
        setFormData({
          name: packageData.name || "",
          overview: packageData.overview || "",
          costInclude: Array.isArray(packageData.costInclude) ? packageData.costInclude : [],
          costExclude: Array.isArray(packageData.costExclude) ? packageData.costExclude : [],
          itinerary: (() => {
            try {
              if (typeof packageData.itinerary === 'string') {
                return JSON.parse(packageData.itinerary);
              }
              return Array.isArray(packageData.itinerary) ? packageData.itinerary : [];
            } catch {
              return [];
            }
          })(),
          featuredImage: packageData.featuredImage || "",
          featuredImageBucket: packageData.featuredImageBucket || "featuredImage",
          galleryImages: Array.isArray(packageData.galleryImages) ? packageData.galleryImages : [],
          faq: (() => {
            try {
              if (typeof packageData.faq === 'string') {
                return JSON.parse(packageData.faq);
              }
              return Array.isArray(packageData.faq) ? packageData.faq : [];
            } catch {
              return [];
            }
          })(),
          tags: new Set(packageData.tags || []),
          duration: packageData.duration || "",
          location: packageData.location || "",
          price: packageData.price || ""
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
      setLoadingPackage(false);
    }
  }, [packageId, router]);

  useEffect(() => {
    if (packageId) {
      fetchPackageData();
      fetchMediaFiles();
    }
  }, [packageId, fetchPackageData]);

  // Filter media files based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMedia(mediaFiles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = mediaFiles.filter(file => {
      const searchableText = [
        file.name,
        file.alt || '',
        file.description || '',
        file.title || '',
        file.caption || '',
        ...(file.tags || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
    
    setFilteredMedia(filtered);
  }, [searchQuery, mediaFiles]);

  // Form handlers
  const handleInputChange = (field: keyof PackageFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOverviewChange = (value?: string) => {
    setFormData(prev => ({
      ...prev,
      overview: value || ""
    }));
  };

  const handleAddCostInclude = () => {
    if (newCostInclude.trim()) {
      setFormData(prev => ({
        ...prev,
        costInclude: [...prev.costInclude, newCostInclude.trim()]
      }));
      setNewCostInclude("");
    }
  };

  const handleAddCostExclude = () => {
    if (newCostExclude.trim()) {
      setFormData(prev => ({
        ...prev,
        costExclude: [...prev.costExclude, newCostExclude.trim()]
      }));
      setNewCostExclude("");
    }
  };

  const handleRemoveCostInclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      costInclude: prev.costInclude.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveCostExclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      costExclude: prev.costExclude.filter((_, i) => i !== index)
    }));
  };

  const handleGalleryImageSelect = (imageId: string) => {
    if (formData.galleryImages.includes(imageId)) {
      setFormData(prev => ({
        ...prev,
        galleryImages: prev.galleryImages.filter(id => id !== imageId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, imageId]
      }));
    }
  };

  const handleGalleryImageRemove = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter(id => id !== imageId)
    }));
  };

  const handleAddItineraryDay = () => {
    if (newItineraryDay.trim() && newItineraryTitle.trim() && newItineraryDescription.trim()) {
      const dayNumber = parseInt(newItineraryDay);
      if (isNaN(dayNumber) || dayNumber <= 0) {
        toast.error("Please enter a valid day number");
        return;
      }
      
      if (formData.itinerary.some(item => item.day === dayNumber)) {
        toast.error("Day already exists in itinerary");
        return;
      }

      setFormData(prev => ({
        ...prev,
        itinerary: [...prev.itinerary, {
          day: dayNumber,
          title: newItineraryTitle.trim(),
          description: newItineraryDescription.trim()
        }].sort((a, b) => a.day - b.day)
      }));
      
      setNewItineraryDay("");
      setNewItineraryTitle("");
      setNewItineraryDescription("");
      
      toast.success(`Day ${dayNumber} added to itinerary!`);
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handleRemoveItineraryDay = (dayNumber: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter(item => item.day !== dayNumber)
    }));
  };

  const handleUpdateItineraryDay = (dayNumber: number, field: 'title' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(item => 
        item.day === dayNumber ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.has(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: new Set([...prev.tags, newTag.trim()])
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: new Set([...prev.tags].filter(t => t !== tag))
    }));
  };

  const handleAddFaq = () => {
    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
      setFormData(prev => ({
        ...prev,
        faq: [...prev.faq, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }]
      }));
      setNewFaqQuestion("");
      setNewFaqAnswer("");
    }
  };

  const handleRemoveFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (!formData.featuredImage) {
      toast.error("Featured image is required");
      return;
    }

    if (formData.itinerary.length === 0) {
      toast.error("At least one itinerary day is required");
      return;
    }

    setLoading(true);
    
    const requestData = {
      name: formData.name.trim(),
      overview: formData.overview || "",
      costInclude: Array.isArray(formData.costInclude) ? formData.costInclude : [],
      costExclude: Array.isArray(formData.costExclude) ? formData.costExclude : [],
      itinerary: Array.isArray(formData.itinerary) ? formData.itinerary : [],
      featuredImage: formData.featuredImage,
      featuredImageBucket: formData.featuredImageBucket || "featuredImage",
      galleryImages: Array.isArray(formData.galleryImages) ? formData.galleryImages : [],
      faq: Array.isArray(formData.faq) ? formData.faq : [],
      tags: Array.from(formData.tags || []),
      duration: formData.duration || "",
      location: formData.location || "",
      price: formData.price || ""
    };

    try {
      const response = await fetch('/api/packages/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: packageId,
          ...requestData
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Package updated successfully!");
        router.push('/dashboard/allpackages');
      } else {
        toast.error(data.message || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package');
    } finally {
      setLoading(false);
    }
  };

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

  if (loadingPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading package...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
          <p className="text-gray-600 mt-2">Update the travel package details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter package name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 7 days, 2 weeks"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Paris, France"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., $999, €799"
                />
              </div>
            </CardContent>
          </Card>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Package Overview</CardTitle>
              <p className="text-sm text-gray-600">Detailed description of the package (supports rich text)</p>
            </CardHeader>
            <CardContent>
              <RTE
                value={formData.overview}
                onChange={handleOverviewChange}
                height={400}
              />
            </CardContent>
          </Card>

          {/* Cost Include */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cost Includes</CardTitle>
                                <p className="text-sm text-gray-600">What&apos;s included in the package price</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold mb-3 text-green-800">Add Included Item</h3>
                <div className="flex gap-3">
                  <Input
                    value={newCostInclude}
                    onChange={(e) => setNewCostInclude(e.target.value)}
                    placeholder="e.g., Hotel accommodation, Meals, Transportation..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCostInclude()}
                  />
                  <Button 
                    onClick={handleAddCostInclude}
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                    disabled={!newCostInclude.trim()}
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {formData.costInclude.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-green-700 font-medium">Included Items ({formData.costInclude.length}):</Label>
                  {formData.costInclude.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">✓</span>
                      </div>
                      <span className="flex-1 text-green-800">{item}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        onClick={() => handleRemoveCostInclude(index)}
                      >
                        <FaTrash className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <p>No included items added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Exclude */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cost Excludes</CardTitle>
                                <p className="text-sm text-gray-600">What&apos;s not included in the package price</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 border rounded-lg bg-red-50">
                <h3 className="font-semibold mb-3 text-red-800">Add Excluded Item</h3>
                <div className="flex gap-3">
                  <Input
                    value={newCostExclude}
                    onChange={(e) => setNewCostExclude(e.target.value)}
                    placeholder="e.g., International flights, Personal expenses, Tips..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCostExclude()}
                  />
                  <Button 
                    onClick={handleAddCostExclude}
                    className="bg-red-600 hover:bg-red-700 text-white px-6"
                    disabled={!newCostExclude.trim()}
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {formData.costExclude.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-red-700 font-medium">Excluded Items ({formData.costExclude.length}):</Label>
                  {formData.costExclude.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">✗</span>
                      </div>
                      <span className="flex-1 text-red-800">{item}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        onClick={() => handleRemoveCostExclude(index)}
                      >
                        <FaTrash className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-600 text-xl">✗</span>
                  </div>
                  <p>No excluded items added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itinerary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Day-wise Itinerary</CardTitle>
              <p className="text-sm text-gray-600">Add detailed day-by-day breakdown of the package</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold mb-3 text-blue-800">Add New Day</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="itinerary-day">Day Number *</Label>
                    <Input
                      id="itinerary-day"
                      type="number"
                      min="1"
                      value={newItineraryDay}
                      onChange={(e) => setNewItineraryDay(e.target.value)}
                      placeholder="e.g., 1"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itinerary-title">Day Title *</Label>
                    <Input
                      id="itinerary-title"
                      value={newItineraryTitle}
                      onChange={(e) => setNewItineraryTitle(e.target.value)}
                      placeholder="e.g., Arrival in Kathmandu"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddItineraryDay}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!newItineraryDay.trim() || !newItineraryTitle.trim() || !newItineraryDescription.trim()}
                    >
                      <FaPlus className="w-4 h-4 mr-2" />
                      Add Day
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="itinerary-description">Day Description *</Label>
                  <Textarea
                    id="itinerary-description"
                    value={newItineraryDescription}
                    onChange={(e) => setNewItineraryDescription(e.target.value)}
                    placeholder="Describe the activities and details for this day..."
                    rows={3}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {formData.itinerary.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-blue-700 font-medium">Current Itinerary ({formData.itinerary.length} days):</Label>
                  {formData.itinerary.map((day) => (
                    <div key={day.day} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <Input
                              value={day.title}
                              onChange={(e) => handleUpdateItineraryDay(day.day, 'title', e.target.value)}
                              className="font-medium text-lg border-0 p-0 h-auto focus-visible:ring-0 bg-transparent text-blue-900"
                              placeholder="Day title"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          onClick={() => handleRemoveItineraryDay(day.day)}
                        >
                          <FaTrash className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="ml-13">
                        <Textarea
                          value={day.description}
                          onChange={(e) => handleUpdateItineraryDay(day.day, 'description', e.target.value)}
                          className="border-0 p-0 h-auto focus-visible:ring-0 resize-none bg-transparent text-blue-800"
                          placeholder="Day description"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaRoute className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">No itinerary days added yet</p>
                  <p className="text-sm text-gray-400">Add your first day above to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Image Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Featured Image</CardTitle>
              <p className="text-sm text-gray-600">Select the main image for the package</p>
            </CardHeader>
            <CardContent>
              {formData.featuredImage && (
                <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 relative">
                      <OptimizedImage
                        src={mediaFiles.find(f => f.id === formData.featuredImage)?.fileUrl || ''}
                        alt="Selected featured image"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Selected Image</div>
                      <div className="text-xs text-gray-500">ID: {formData.featuredImage}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: "", featuredImageBucket: "" }))}
                    >
                      <FaTimes className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFeaturedImageSelector(true);
                  fetchMediaFiles();
                }}
                className="flex items-center gap-2"
              >
                <FaImage className="w-4 h-4" />
                Select Featured Image
              </Button>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Gallery Images</CardTitle>
              <p className="text-sm text-gray-600">Select multiple images for the package gallery</p>
            </CardHeader>
            <CardContent>
              {formData.galleryImages.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">Selected Gallery Images ({formData.galleryImages.length})</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, galleryImages: [] }))}
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {formData.galleryImages.map((imageId) => {
                      const file = mediaFiles.find(f => f.id === imageId);
                      return file ? (
                        <div key={imageId} className="relative group">
                          <div className="w-20 h-20 relative">
                            <OptimizedImage
                              src={file.fileUrl}
                              alt={file.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border border-red-500 hover:border-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleGalleryImageRemove(imageId)}
                          >
                            <FaTimes className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowGalleryImageSelector(true);
                  fetchMediaFiles();
                }}
                className="flex items-center gap-2"
              >
                <FaImage className="w-4 h-4" />
                Select Gallery Images
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tags</CardTitle>
              <p className="text-sm text-gray-600">Add relevant tags for the package</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} className="flex items-center gap-2">
                  <FaPlus className="w-4 h-4" />
                  Add Tag
                </Button>
              </div>
              {formData.tags.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from(formData.tags).map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-2">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
              <p className="text-sm text-gray-600">Add common questions and answers about the package</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                <div>
                  <Label htmlFor="faqQuestion">Question</Label>
                  <Input
                    id="faqQuestion"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="Enter a question"
                  />
                </div>
                <div>
                  <Label htmlFor="faqAnswer">Answer</Label>
                  <Textarea
                    id="faqAnswer"
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Enter the answer"
                    rows={3}
                  />
                </div>
                <Button type="button" onClick={handleAddFaq} className="flex items-center gap-2">
                  <FaPlusCircle className="w-4 h-4" />
                  Add FAQ
                </Button>
              </div>

              {formData.faq.length > 0 && (
                <div className="space-y-4">
                  <Label>Current FAQs ({formData.faq.length}):</Label>
                  {formData.faq.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <FaQuestion className="w-4 h-4 text-blue-600" />
                          {faq.question}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveFaq(index)}
                        >
                          <FaTrash className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/allpackages')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-3 text-lg"
            >
              {loading ? 'Updating Package...' : 'Update Package'}
            </Button>
          </div>
        </form>
      </div>

      {/* Featured Image Selector Modal */}
      {showFeaturedImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Select Featured Image</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeaturedImageSelector(false)}
              >
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-3">Select from Existing Images</h3>
              {loadingMedia ? (
                <div className="text-center py-8">
                  <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <div className="text-lg">Loading media files...</div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No images found</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredMedia.map((file) => (
                    <div
                      key={file.id}
                      className="relative group cursor-pointer border rounded-lg overflow-hidden hover:border-blue-500"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, featuredImage: file.id, featuredImageBucket: "featuredImage" }));
                        setShowFeaturedImageSelector(false);
                      }}
                    >
                      <OptimizedImage
                        src={file.fileUrl}
                        alt={file.alt || file.name}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2">
                        <div className="text-xs font-medium truncate" title={file.title || file.name}>
                          {file.title || file.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Images Selector Modal */}
      {showGalleryImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Select Gallery Images</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGalleryImageSelector(false)}
              >
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-3">Select from Existing Images</h3>
              {loadingMedia ? (
                <div className="text-center py-8">
                  <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <div className="text-lg">Loading media files...</div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No images found</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredMedia.map((file) => (
                    <div
                      key={file.id}
                      className={`relative group cursor-pointer border rounded-lg overflow-hidden hover:border-green-500 ${
                        formData.galleryImages.includes(file.id) ? 'ring-2 ring-green-500' : ''
                      }`}
                      onClick={() => handleGalleryImageSelect(file.id)}
                    >
                      <OptimizedImage
                        src={file.fileUrl}
                        alt={file.alt || file.name}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2">
                        <div className="text-xs font-medium truncate" title={file.title || file.name}>
                          {file.title || file.name}
                        </div>
                        {formData.galleryImages.includes(file.id) && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
