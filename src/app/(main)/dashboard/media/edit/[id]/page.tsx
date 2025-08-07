"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import OptimizedImage from "@/components/OptimizedImage";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

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

export default function EditMediaPage() {
  const router = useRouter();
  const params = useParams();
  const fileId = params.id as string;
  
  const [file, setFile] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    alt: '',
    description: '',
    tags: '',
    title: '',
    caption: ''
  });

  const fetchFile = useCallback(async () => {
    try {
      const response = await fetch('/api/media/list');
      const data = await response.json();
      if (data.success) {
        const foundFile = data.files.find((f: MediaFile) => f.id === fileId);
        if (foundFile) {
          setFile(foundFile);
          setFormData({
            alt: foundFile.alt || '',
            description: foundFile.description || '',
            tags: foundFile.tags?.join(', ') || '',
            title: foundFile.title || '',
            caption: foundFile.caption || ''
          });
        } else {
          toast.error('File not found');
          router.push('/dashboard/media');
        }
      } else {
        toast.error('Failed to fetch file');
        router.push('/dashboard/media');
      }
    } catch {
      toast.error('Failed to fetch file');
      router.push('/dashboard/media');
    } finally {
      setLoading(false);
    }
  }, [fileId, router]);

  useEffect(() => {
    if (fileId) {
      fetchFile();
    }
  }, [fileId, fetchFile]);

  const handleSave = async () => {
    if (!formData.alt.trim()) {
      toast.error('Alt text is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/media/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          alt: formData.alt,
          description: formData.description,
          tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
          title: formData.title,
          caption: formData.caption
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('File updated successfully');
        router.push('/dashboard/media');
      } else {
        toast.error(data.error || "Failed to update file");
      }
    } catch {
      toast.error("Failed to update file");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/media');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading file...</div>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg">File not found</div>
          <Button onClick={handleCancel} className="mt-4">
            Back to Media Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Edit Image</h1>
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.alt.trim() || saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Preview */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Image Preview</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <OptimizedImage
              src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/${file.id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${file.updatedAt}`}
              alt={file.alt || file.name}
              width={600}
              height={400}
              className="w-full h-auto object-contain max-h-96"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="mt-4 text-sm text-gray-600">
              <div><strong>File Name:</strong> {file.name}</div>
              <div><strong>File Type:</strong> {file.mimeType}</div>
              <div><strong>Uploaded:</strong> {new Date(file.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Edit Metadata</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="alt">Alt Text *</Label>
              <Input
                id="alt"
                value={formData.alt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, alt: e.target.value }))
                }
                placeholder="Enter alt text for accessibility"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Alt text is important for accessibility and SEO
              </p>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter a detailed description of the image"
                className="mt-1"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Description helps with SEO and provides context
              </p>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, tags: e.target.value }))
                }
                placeholder="Enter tags separated by commas (e.g., nature, landscape, mountains)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tags help organize and categorize your images
              </p>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter image title"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Title helps with SEO and image identification
              </p>
            </div>
            
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, caption: e.target.value }))
                }
                placeholder="Enter image caption"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Caption provides additional context for the image
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 