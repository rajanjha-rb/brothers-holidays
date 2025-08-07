"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featuredImageBucket } from "@/models/name";
import slugify from "@/app/utils/slugify";
import OptimizedImage from "@/components/OptimizedImage";
import { FaPlus, FaTimes, FaSpinner, FaSearch, FaImage } from "react-icons/fa";
import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";
import { revalidateTripsList } from "@/lib/revalidate";

interface TripFormData {
  name: string;
  tags: Set<string>;
  selectedImageId: string | null;
  selectedImageUrl: string | null;
  difficulty: string;
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
  fileUrl?: string;
}

export default function AddNewTripPage() {
  const router = useRouter();
  const { user, hydrated, isAdmin } = useAuthState();
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  
  // Media library states
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const [newImageForm, setNewImageForm] = useState({
    file: null as File | null,
    alt: '',
    description: '',
    tags: '',
    title: '',
    caption: ''
  });

  const [formData, setFormData] = useState<TripFormData>({
    name: "",
    tags: new Set<string>(),
    selectedImageId: null,
    selectedImageUrl: null,
    difficulty: "",
  });

  // Prefetch common routes for faster navigation
  useEffect(() => {
    router.prefetch('/dashboard/alltrips');
    router.prefetch('/trips');
  }, [router]);

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
  }, [mediaFiles, searchQuery]);

  const fetchMediaFiles = async () => {
    setLoadingMedia(true);
    try {
      const response = await fetch('/api/media/list');
      const data = await response.json();
      if (data.success) {
        setMediaFiles(data.files);
        setFilteredMedia(data.files);
      } else {
        toast.error(data.error || "Failed to fetch media files");
      }
    } catch {
      toast.error("Failed to fetch media files");
    } finally {
      setLoadingMedia(false);
    }
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

  const uploadNewImage = async () => {
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
        // Select the newly uploaded image
        setFormData(prev => ({
          ...prev,
          selectedImageId: data.file.id,
          selectedImageUrl: data.file.fileUrl
        }));
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
        setShowMediaSelector(false);
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingNewImage(false);
    }
  };

  const selectImage = (file: MediaFile) => {
    setFormData(prev => ({
      ...prev,
      selectedImageId: file.id,
      selectedImageUrl: file.fileUrl || `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/${file.id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${file.updatedAt}`
    }));
    setShowMediaSelector(false);
  };

  const create = async () => {
    if (!formData.selectedImageId) throw new Error("Please select a featured image");

    setImageUploading(true);
    try {
      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                  body: JSON.stringify({
          name: formData.name,
          slug: slugify(formData.name),
          tags: Array.from(formData.tags),
          featuredImage: formData.selectedImageId,
          featuredImageBucket: featuredImageBucket,
          difficulty: formData.difficulty,
          type: 'trip',
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create trip');
      }

      return data.trip;
    } catch (error) {
      console.error('Create error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create trip: ${error.message}`);
      }
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.selectedImageId || !user) {
      setError("Please fill out trip name and select a featured image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await create();
      
      // Trigger revalidation for the trips listing page
      try {
        await revalidateTripsList();
        console.log('✅ Trips listing page revalidated successfully');
      } catch (revalidationError) {
        console.warn('⚠️ Revalidation failed, but trip was created:', revalidationError);
      }
      
      toast.success('Trip created successfully!');
      router.push('/dashboard/alltrips');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }

    setLoading(false);
  };

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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Trip</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            setNavigating(true);
            router.replace('/dashboard/alltrips', { scroll: false });
          }}
          disabled={navigating || loading}
        >
          {navigating ? (
            <>
              <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            "Back to Trips"
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <span className="text-red-600">{error}</span>
              </div>
            )}

            {/* Trip Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter trip name"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Challenging">Challenging</option>
                <option value="Difficult">Difficult</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter tag and press Add"
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (tagInput.length === 0) return;
                    setFormData(prev => ({
                      ...prev,
                      tags: new Set([...Array.from(prev.tags), tagInput]),
                    }));
                    setTagInput("");
                  }}
                  variant="outline"
                  size="sm"
                  disabled={tagInput.length === 0}
                >
                  <FaPlus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(formData.tags).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tags: new Set(Array.from(prev.tags).filter(t => t !== tag)),
                        }));
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-4">
              <Label>Featured Image *</Label>
              
              {/* Selected Image Display */}
              {formData.selectedImageUrl && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 relative">
                      <OptimizedImage
                        src={formData.selectedImageUrl}
                        alt="Selected featured image"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Selected Image</div>
                      <div className="text-xs text-gray-500">ID: {formData.selectedImageId}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, selectedImageId: null, selectedImageUrl: null }))}
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
                  setShowMediaSelector(true);
                  fetchMediaFiles();
                }}
                className="flex items-center gap-2"
              >
                <FaImage className="w-4 h-4" />
                Select Featured Image
              </Button>

              {imageUploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Processing image...
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus className="w-4 h-4" />
                    Create Trip
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setNavigating(true);
                  router.replace('/dashboard/alltrips', { scroll: false });
                }}
                disabled={loading || navigating}
              >
                {navigating ? (
                  <>
                    <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  "Cancel"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Select Featured Image</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMediaSelector(false)}
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
                  <Label htmlFor="new-file">Image File *</Label>
                  <Input
                    id="new-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-alt">Alt Text *</Label>
                  <Input
                    id="new-alt"
                    value={newImageForm.alt}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Enter alt text"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Input
                    id="new-description"
                    value={newImageForm.description}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="new-tags">Tags</Label>
                  <Input
                    id="new-tags"
                    value={newImageForm.tags}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-title">Title</Label>
                  <Input
                    id="new-title"
                    value={newImageForm.title}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-caption">Caption</Label>
                  <Input
                    id="new-caption"
                    value={newImageForm.caption}
                    onChange={(e) => setNewImageForm(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Enter caption"
                    disabled={uploadingNewImage}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Button
                    onClick={uploadNewImage}
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
                      onClick={() => selectImage(file)}
                    >
                      <OptimizedImage
                        src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/${file.id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${file.updatedAt}`}
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
    </div>
  );
} 