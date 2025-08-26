"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaPlus, FaTrash, FaImage, FaTimes, FaQuestion, FaPlusCircle, FaRoute, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";
import RTE from "@/components/RTE";
import OptimizedImage from "@/components/OptimizedImage";
import slugify from "@/app/utils/slugify";

interface PackageFormData {
  name: string;
  metaDescription: string; // SEO meta description
  overview: string;
  costInclude: string[];
  costExclude: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  featuredImage: string;
  featuredImageBucket: string;
  galleryImages: string[];
  faq: Array<{ question: string; answer: string }>;
  tags: Set<string>;
  days: number | null;
  nights: number | null;
  location: string;
  destinationId: string;
  price: string;
  bestMonths: string[]; // New field for best months to visit
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

export default function AddNewPackagePage() {
  const router = useRouter();
  const { hydrated, isAdmin, adminChecked } = useAuthState();
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    metaDescription: "",
    overview: "",
    costInclude: [],
    costExclude: [],
    itinerary: [],
    featuredImage: "",
    featuredImageBucket: "featuredImage", // Set default bucket
    galleryImages: [],
    faq: [],
    tags: new Set(),
    days: null,
    nights: null,
    location: "",
    destinationId: "",
    price: "",
    bestMonths: []
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [loadingDatabase, setLoadingDatabase] = useState(true);
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
  
  // New image upload form state
  const [newImageForm, setNewImageForm] = useState({
    file: null as File | null,
    alt: '',
    description: '',
    tags: '',
    title: '',
    caption: ''
  });
  const [uploadingNewImage, setUploadingNewImage] = useState(false);

  // Authentication check
  useEffect(() => {
    if (hydrated && adminChecked && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/");
    }
  }, [hydrated, adminChecked, isAdmin, router]);

  // Fetch destinations function
  const fetchDestinations = async () => {
    try {
      setLoadingDestinations(true);
      const response = await fetch('/api/destinations/list');
      const data = await response.json();
      
      if (data.success) {
        console.log('Destinations received:', data.destinations);
        setDestinations(data.destinations || []);
      } else {
        console.error('Failed to fetch destinations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoadingDestinations(false);
    }
  };

  // Fetch destinations on component mount
  useEffect(() => {
    fetchDestinations();
  }, []);

  // Fetch media files function
  const fetchMediaFiles = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch('/api/media/list');
      const data = await response.json();
      
      if (data.success) {
        console.log('Media files received:', data.files);
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

  // Fetch media files on component mount
  useEffect(() => {
    fetchMediaFiles();
  }, []);

  // Initialize database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoadingDatabase(true);
        const response = await fetch('/api/init-db', { method: 'GET' });
        if (!response.ok) {
          console.error('Failed to initialize database');
          toast.error('Database initialization failed. Please refresh the page.');
        } else {
          console.log('Database initialized successfully');
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        toast.error('Database initialization failed. Please refresh the page.');
      } finally {
        setLoadingDatabase(false);
      }
    };

    initializeDatabase();
  }, []);

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

  const handleInputChange = (field: keyof PackageFormData, value: string | number | null) => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImageForm(prev => ({ ...prev, file }));
      // Auto-generate alt text from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setNewImageForm(prev => ({ ...prev, alt: fileName }));
    }
  };

  const uploadNewImage = async (type: 'featured' | 'gallery') => {
    if (!newImageForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!newImageForm.alt.trim()) {
      toast.error('Alt text is required');
      return;
    }

    setUploadingNewImage(true);
    const formData = new FormData();
    formData.append('file', newImageForm.file);
    formData.append('alt', newImageForm.alt);
    formData.append('description', newImageForm.description);
    formData.append('tags', newImageForm.tags);
    formData.append('title', newImageForm.title);
    formData.append('caption', newImageForm.caption);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Image uploaded successfully');
        
        if (type === 'featured') {
          // Select the newly uploaded image as featured image
          setFormData(prev => ({
            ...prev,
            featuredImage: data.file.id,
            featuredImageBucket: "featuredImage"
          }));
          setShowFeaturedImageSelector(false);
        } else if (type === 'gallery') {
          // Add the newly uploaded image to gallery
          setFormData(prev => ({
            ...prev,
            galleryImages: [...prev.galleryImages, data.file.id]
          }));
        }
        
        // Refresh media files
        await fetchMediaFiles();
        // Reset form
        setNewImageForm({
          file: null,
          alt: '',
          description: '',
          tags: '',
          title: '',
          caption: ''
        });
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingNewImage(false);
    }
  };

  const handleAddItineraryDay = () => {
    console.log('Adding itinerary day:', {
      day: newItineraryDay,
      title: newItineraryTitle,
      description: newItineraryDescription,
      dayTrimmed: newItineraryDay.trim(),
      titleTrimmed: newItineraryTitle.trim(),
      descTrimmed: newItineraryDescription.trim()
    });

    if (newItineraryDay.trim() && newItineraryTitle.trim() && newItineraryDescription.trim()) {
      const dayNumber = parseInt(newItineraryDay);
      if (isNaN(dayNumber) || dayNumber <= 0) {
        toast.error("Please enter a valid day number");
        return;
      }
      
      // Check if day already exists
      if (formData.itinerary.some(item => item.day === dayNumber)) {
        toast.error("Day already exists in itinerary");
        return;
      }

      console.log('Adding day:', dayNumber, 'to itinerary');

      setFormData(prev => ({
        ...prev,
        itinerary: [...prev.itinerary, {
          day: dayNumber,
          title: newItineraryTitle.trim(),
          description: newItineraryDescription.trim()
        }].sort((a, b) => a.day - b.day) // Sort by day number
      }));
      
      // Reset form
      setNewItineraryDay("");
      setNewItineraryTitle("");
      setNewItineraryDescription("");
      
      toast.success(`Day ${dayNumber} added to itinerary!`);
    } else {
      console.log('Validation failed - missing fields');
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
    
    // Enhanced validation
    const validationErrors = [];
    
    if (!formData.name.trim()) {
      validationErrors.push("Package name is required");
    }

    if (!formData.metaDescription.trim()) {
      validationErrors.push("Meta description is required for SEO");
    } else if (formData.metaDescription.length > 160) {
      validationErrors.push("Meta description must be 160 characters or less for optimal SEO");
    }

    if (!formData.featuredImage) {
      validationErrors.push("Featured image is required");
    } else if (formData.featuredImage === "test" || formData.featuredImage.length < 10) {
      validationErrors.push("Please select a valid featured image from the media library");
    }

    if (formData.itinerary.length === 0) {
      validationErrors.push("At least one itinerary day is required");
    }

    if (!formData.destinationId || formData.destinationId.trim() === "") {
      validationErrors.push("Destination selection is required");
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    
    // Ensure all data is properly serialized for the API
    const requestData = {
      name: formData.name.trim(),
      slug: slugify(formData.name.trim()),
      metaDescription: formData.metaDescription.trim() || "",
      overview: formData.overview || "",
      costInclude: Array.isArray(formData.costInclude) ? formData.costInclude : [],
      costExclude: Array.isArray(formData.costExclude) ? formData.costExclude : [],
      itinerary: Array.isArray(formData.itinerary) ? formData.itinerary : [],
      featuredImage: formData.featuredImage,
      featuredImageBucket: formData.featuredImageBucket || "featuredImage",
      galleryImages: Array.isArray(formData.galleryImages) ? formData.galleryImages : [],
      faq: Array.isArray(formData.faq) ? formData.faq : [],
      tags: Array.from(formData.tags || []),
      days: formData.days,
      nights: formData.nights,
      location: formData.location || "",
      destinationId: formData.destinationId || "",
      price: formData.price || "",
      bestMonths: formData.bestMonths || []
    };

    console.log('Submitting package data:', requestData);
    console.log('Form validation passed. Proceeding with submission...');
    
    try {
      // First, ensure database is initialized
      console.log('Initializing database...');
      const initResponse = await fetch('/api/init-db', { method: 'GET' });
      if (!initResponse.ok) {
        throw new Error('Failed to initialize database');
      }
      console.log('Database initialized successfully');

      console.log('Creating package...');
      const response = await fetch('/api/packages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Package creation response:', data);

      if (data.success) {
        toast.success("Package created successfully!");
        router.push('/dashboard/allpackages');
      } else {
        console.error('Package creation failed:', data);
        if (data.message && (data.message.includes('schema') || data.message.includes('attribute'))) {
          toast.error('Database schema error. Please use "Force Reinit DB" button to fix.');
        } else {
          toast.error(data.message || 'Failed to create package. Please check the console for details.');
        }
      }
    } catch (error) {
      console.error('Error creating package:', error);
      if (error instanceof Error) {
        toast.error(`Failed to create package: ${error.message}`);
      } else {
        toast.error('Failed to create package. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!hydrated || !adminChecked || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking permissions...</p>
          <p className="text-sm text-gray-500 mt-2">Verifying admin access</p>
        </div>
      </div>
    );
  }

  // Show loading state while initializing database
  if (loadingDatabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Initializing database...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up package collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Package</h1>
          <p className="text-gray-600 mt-2">Create a new travel package with comprehensive details</p>
          
          {/* Debug Section */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Debug Information</h3>
                <p className="text-xs text-yellow-600 mt-1">Use these buttons to troubleshoot issues</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/init-db', { method: 'GET' });
                      const data = await response.json();
                      if (data.success) {
                        toast.success('Database initialized successfully');
                      } else {
                        toast.error('Database initialization failed');
                      }
                    } catch {
                      toast.error('Failed to initialize database');
                    }
                  }}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Test DB
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/packages/test');
                      const data = await response.json();
                      if (data.success) {
                        toast.success(`Package collection accessible. Found ${data.collection.documentCount} documents.`);
                      } else {
                        toast.error('Package collection test failed');
                      }
                    } catch {
                      toast.error('Failed to test package collection');
                    }
                  }}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Test Packages API
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/init-db', { method: 'DELETE' });
                      const data = await response.json();
                      if (data.success) {
                        toast.success('Database force reinitialized successfully');
                        // Refresh the page to ensure new schema is loaded
                        window.location.reload();
                      } else {
                        toast.error('Database force reinitialization failed');
                      }
                    } catch {
                      toast.error('Failed to force reinitialize database');
                    }
                  }}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Force Reinit DB
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/packages/init', { method: 'POST' });
                      const data = await response.json();
                      if (data.success) {
                        toast.success('Package collection recreated successfully with new schema');
                        // Refresh the page to ensure new schema is loaded
                        window.location.reload();
                      } else {
                        toast.error('Package collection recreation failed');
                      }
                    } catch {
                      toast.error('Failed to recreate package collection');
                    }
                  }}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  Recreate Packages
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      // First force recreate package collection
                      await fetch('/api/packages/init', { method: 'POST' });
                      // Then reinitialize entire database
                      const response = await fetch('/api/init-db', { method: 'GET' });
                      const data = await response.json();
                      if (data.success) {
                        toast.success('Database and package collection reinitialized successfully');
                        window.location.reload();
                      } else {
                        toast.error('Database reinitialization failed');
                      }
                    } catch {
                      toast.error('Failed to reinitialize database');
                    }
                  }}
                  className="text-purple-700 border-purple-300 hover:bg-purple-100"
                >
                  Full DB Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="e.g., $999, €799"
                  />
                </div>
              </div>
              
              {/* Meta Description for SEO */}
              <div>
                <Label htmlFor="metaDescription">
                  Meta Description * 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Max 160 characters for SEO)
                  </span>
                </Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="Enter a compelling description for search engines and social media sharing..."
                  rows={3}
                  maxLength={160}
                  className="resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {formData.metaDescription.length}/160 characters
                  </span>
                  <span className={`text-xs ${
                    formData.metaDescription.length > 140 
                      ? 'text-orange-500' 
                      : formData.metaDescription.length > 160 
                        ? 'text-red-500' 
                        : 'text-green-500'
                  }`}>
                    {formData.metaDescription.length > 160 
                      ? 'Too long!' 
                      : formData.metaDescription.length > 140 
                        ? 'Getting long' 
                        : 'Good length'
                    }
                  </span>
                </div>
              </div>
              
              {/* Duration Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="days">Days *</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    value={formData.days || ''}
                    onChange={(e) => handleInputChange('days', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 7"
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="nights">Nights *</Label>
                  <Input
                    id="nights"
                    type="number"
                    min="1"
                    value={formData.nights || ''}
                    onChange={(e) => handleInputChange('nights', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 6"
                    className="border-blue-200 focus:border-blue-500"
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

              {/* Destination Selection */}
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Select
                  value={formData.destinationId}
                  onValueChange={(value) => handleInputChange('destinationId', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDestinations ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        Loading destinations...
                      </div>
                    ) : destinations.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        No destinations available
                      </div>
                    ) : (
                      destinations.map((destination) => (
                        <SelectItem key={destination.$id} value={destination.$id}>
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="w-4 h-4 text-blue-500" />
                            <span>{destination.title}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formData.destinationId && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span>
                        Selected: {destinations.find(d => d.$id === formData.destinationId)?.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Best Months to Visit */}
              <div>
                <Label>Best Months to Visit</Label>
                <p className="text-sm text-gray-600 mb-3">Select the best months for visiting this destination</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    { value: 'Jan', label: 'Jan' },
                    { value: 'Feb', label: 'Feb' },
                    { value: 'Mar', label: 'Mar' },
                    { value: 'Apr', label: 'Apr' },
                    { value: 'May', label: 'May' },
                    { value: 'Jun', label: 'Jun' },
                    { value: 'Jul', label: 'Jul' },
                    { value: 'Aug', label: 'Aug' },
                    { value: 'Sep', label: 'Sep' },
                    { value: 'Oct', label: 'Oct' },
                    { value: 'Nov', label: 'Nov' },
                    { value: 'Dec', label: 'Dec' }
                  ].map((month) => (
                    <div key={month.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`month-${month.value}`}
                        checked={formData.bestMonths.includes(month.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              bestMonths: [...prev.bestMonths, month.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              bestMonths: prev.bestMonths.filter(m => m !== month.value)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor={`month-${month.value}`}
                        className="ml-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                      >
                        {month.label}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.bestMonths.length > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-700">
                      <span className="font-medium">Selected months:</span> {formData.bestMonths.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Package Overview</CardTitle>
              <p className="text-sm text-gray-600">Detailed description of the package (supports rich text, no word limit)</p>
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
              {/* Add New Cost Include */}
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

              {/* Display Cost Include Items */}
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
                  <p className="text-sm">Add items above to show what&apos;s covered in the package price.</p>
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
              {/* Add New Cost Exclude */}
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

              {/* Display Cost Exclude Items */}
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
                  <p className="text-sm">Add items above to show what&apos;s not covered in the package price.</p>
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
              {/* Add New Day Form */}
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

              {/* Display Itinerary Days */}
              {formData.itinerary.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-blue-700 font-medium">Current Itinerary ({formData.itinerary.length} days):</Label>
                  {formData.itinerary.map((day) => (
                    <div key={day.day} className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <Input
                              value={day.title}
                              onChange={(e) => handleUpdateItineraryDay(day.day, 'title', e.target.value)}
                              className="font-medium text-lg border-0 p-0 h-auto focus-visible:ring-0 bg-transparent text-blue-900 placeholder:text-blue-400"
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
                          className="border-0 p-0 h-auto focus-visible:ring-0 resize-none bg-transparent text-blue-800 placeholder:text-blue-400"
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
              {/* Selected Image Display */}
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

              {/* Media Selector Button */}
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
                {formData.featuredImage && formData.featuredImage !== "test" ? "Change Featured Image" : "Select Featured Image"}
              </Button>
              
              {/* Image Validation Warning */}
              {formData.featuredImage && (formData.featuredImage === "test" || formData.featuredImage.length < 10) && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    ⚠️ Invalid image selected. Please select a valid image from the media library.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Gallery Images</CardTitle>
              <p className="text-sm text-gray-600">Select multiple images for the package gallery</p>
            </CardHeader>
            <CardContent>
              {/* Selected Images Display */}
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

              {/* Media Selector Button */}
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
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-3 text-lg"
            >
              {loading ? 'Creating Package...' : 'Create Package'}
            </Button>
          </div>

          {/* Form Validation Summary */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Form Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.name.trim() ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Package Name {formData.name.trim() ? '✓' : '✗'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.metaDescription.trim() && formData.metaDescription.length <= 160 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Meta Description (≤160 chars) {formData.metaDescription.trim() && formData.metaDescription.length <= 160 ? '✓' : '✗'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.featuredImage ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Featured Image {formData.featuredImage ? '✓' : '✗'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.itinerary.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                At least 1 Itinerary Day {formData.itinerary.length > 0 ? '✓' : '✗'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.overview ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                Overview (recommended)
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.bestMonths.length > 0 ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                Best Months to Visit (recommended)
              </div>
            </div>
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

            {/* Search Bar */}
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

            {/* Upload New Image Form */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">Upload New Image</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-file-featured">Image File *</Label>
                  <Input
                    id="new-file-featured"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-alt-featured">Alt Text *</Label>
                  <Input
                    id="new-alt-featured"
                    value={newImageForm.alt}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Enter alt text"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="new-description-featured">Description</Label>
                  <Input
                    id="new-description-featured"
                    value={newImageForm.description}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="new-tags-featured">Tags</Label>
                  <Input
                    id="new-tags-featured"
                    value={newImageForm.tags}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-title-featured">Title</Label>
                  <Input
                    id="new-title-featured"
                    value={newImageForm.title}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-caption-featured">Caption</Label>
                  <Input
                    id="new-caption-featured"
                    value={newImageForm.title}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Enter caption"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Button
                    onClick={() => uploadNewImage('featured')}
                    disabled={!newImageForm.file || !newImageForm.alt.trim() || uploadingNewImage}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {uploadingNewImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Media Grid */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Select from Existing Images</h3>
              {loadingMedia ? (
                <div className="text-center py-8">
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
                        // Validate that this is a real image ID (not "test" or similar)
                        if (file.id && file.id !== "test" && file.id.length >= 10) {
                          setFormData(prev => ({ ...prev, featuredImage: file.id, featuredImageBucket: "featuredImage" }));
                          setShowFeaturedImageSelector(false);
                        } else {
                          toast.error("Please select a valid image from the media library");
                        }
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

            {/* Search Bar */}
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

            {/* Upload New Image Form */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">Upload New Image</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-file-gallery">Image File *</Label>
                  <Input
                    id="new-file-gallery"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-alt-gallery">Alt Text *</Label>
                  <Input
                    id="new-alt-gallery"
                    value={newImageForm.alt}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Enter alt text"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="new-description-gallery">Description</Label>
                  <Input
                    id="new-description-gallery"
                    value={newImageForm.description}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="new-tags-gallery">Tags</Label>
                  <Input
                    id="new-tags-gallery"
                    value={newImageForm.tags}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-title-gallery">Title</Label>
                  <Input
                    id="new-title-gallery"
                    value={newImageForm.title}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                                  <div>
                    <Label htmlFor="new-caption-gallery">Caption</Label>
                    <Input
                      id="new-caption-gallery"
                      value={newImageForm.caption}
                      onChange={(e) => setNewImageForm(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder="Enter caption"
                      disabled={uploadingNewImage}
                      className="mt-1"
                    />
                  </div>
                
                <div className="md:col-span-2">
                  <Button
                    onClick={() => uploadNewImage('gallery')}
                    disabled={!newImageForm.file || !newImageForm.alt.trim() || uploadingNewImage}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {uploadingNewImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Media Grid */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Select from Existing Images</h3>
              {loadingMedia ? (
                <div className="text-center py-8">
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
