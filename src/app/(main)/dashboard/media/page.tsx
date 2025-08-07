"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import OptimizedImage from "@/components/OptimizedImage";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

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
}

interface UploadFormData {
  file: File | null;
  alt: string;
  description: string;
  tags: string;
  title: string;
  caption: string;
}

export default function MediaPage() {
  const router = useRouter();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    file: null,
    alt: '',
    description: '',
    tags: '',
    title: '',
    caption: ''
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  // Filter files based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = files.filter(file => {
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
    
    setFilteredFiles(filtered);
  }, [files, searchQuery]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/media/list');
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
        setFilteredFiles(data.files);
      } else {
        toast.error(data.error || "Failed to fetch files");
      }
    } catch {
      toast.error("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
      // Auto-generate alt text from filename
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setUploadForm(prev => ({ ...prev, alt: fileName }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!uploadForm.alt.trim()) {
      toast.error('Alt text is required');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('alt', uploadForm.alt);
    formData.append('description', uploadForm.description);
    formData.append('tags', uploadForm.tags);
    formData.append('title', uploadForm.title);
    formData.append('caption', uploadForm.caption);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('File uploaded successfully');
        fetchFiles();
        // Reset form
        setUploadForm({
          file: null,
          alt: '',
          description: '',
          tags: '',
          title: '',
          caption: ''
        });
        setShowUploadForm(false);
      } else {
        toast.error(data.error || "Failed to upload file");
      }
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    setDeletingFiles(prev => new Set(prev).add(fileId));
    try {
      const response = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('File deleted successfully');
        setFiles(prev => prev.filter(file => file.id !== fileId));
        setFilteredFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        toast.error(data.error || "Failed to delete file");
      }
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleEdit = (fileId: string) => {
    router.push(`/dashboard/media/edit/${fileId}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading media files...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Media Library</h1>
          <Button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showUploadForm ? 'Cancel Upload' : 'Upload New Image'}
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search images by name, alt text, description, tags..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                ×
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="text-sm text-gray-600 mt-2">
              Found {filteredFiles.length} image{filteredFiles.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
        
        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-6 p-6 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Upload New Image</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="file">Image File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="alt">Alt Text *</Label>
                <Input
                  id="alt"
                  value={uploadForm.alt}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="Enter alt text for accessibility"
                  disabled={uploading}
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter image description"
                  disabled={uploading}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags separated by commas"
                  disabled={uploading}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter image title"
                  disabled={uploading}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={uploadForm.caption}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Enter image caption"
                  disabled={uploading}
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-2">
                <Button 
                  onClick={handleUpload}
                  disabled={!uploadForm.file || !uploadForm.alt.trim() || uploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Images Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {searchQuery ? 'No images found matching your search' : 'No images uploaded yet'}
          </div>
          <div className="text-gray-400 text-sm mt-2">
            {searchQuery ? 'Try adjusting your search terms' : 'Upload your first image to get started'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredFiles.map((file) => (
            <div key={file.id} className="relative group">
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <OptimizedImage
                  src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/${file.id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${file.updatedAt}`}
                  alt={file.alt || file.name}
                  width={400}
                  height={300}
                  className="w-full h-auto object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(file.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingFiles.has(file.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deletingFiles.has(file.id) ? "Deleting..." : "🗑️ Delete"}
                  </Button>
                </div>
              </div>
              
              {/* File info below image */}
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-gray-900 truncate" title={file.title || file.name}>
                  {file.title || file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 