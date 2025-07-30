"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { databases, storage } from "@/models/client/config";
import { db, blogCollection, featuredImageBucket } from "@/models/name";
import { ID } from "appwrite";
import slugify from "@/app/utils/slugify";
import RTE from "@/components/RTE";
import { FaPlus, FaTimes, FaSpinner } from "react-icons/fa";
import { useAuthStore } from "@/store/auth";

interface BlogFormData {
  title: string;
  description: string;
  content: string;
  tags: Set<string>;
  attachment: File | null;
}

export default function AddNewBlogPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    description: "",
    content: "",
    tags: new Set<string>(),
    attachment: null,
  });

  const create = async () => {
    if (!formData.attachment) throw new Error("Please upload an image");

    try {
      const storageResponse = await storage.createFile(
        featuredImageBucket,
        ID.unique(),
        formData.attachment
      );

      const response = await databases.createDocument(db, blogCollection, ID.unique(), {
        title: formData.title,
        description: formData.description,
        slug: slugify(formData.title),
        content: formData.content,
        tags: Array.from(formData.tags),
        featuredImage: storageResponse.$id,
        featuredImageBucket: featuredImageBucket,
      });

      return response;
    } catch (error) {
      console.error('Create error:', error);
      if (error instanceof Error) {
        // Check if it's a storage bucket error
        if (error.message.includes('Storage bucket') || error.message.includes('bucket')) {
          // Try to create the storage bucket
          try {
            const setupResponse = await fetch('/api/setup-storage', { method: 'POST' });
            if (setupResponse.ok) {
              // Retry the file upload
              const storageResponse = await storage.createFile(
                featuredImageBucket,
                ID.unique(),
                formData.attachment
              );

              const response = await databases.createDocument(db, blogCollection, ID.unique(), {
                title: formData.title,
                description: formData.description,
                slug: slugify(formData.title),
                content: formData.content,
                tags: Array.from(formData.tags),
                featuredImage: storageResponse.$id,
                featuredImageBucket: featuredImageBucket,
              });

              return response;
            }
          } catch (setupError) {
            console.error('Storage setup failed:', setupError);
          }
          throw new Error("Storage bucket not found. Please contact administrator to set up storage.");
        }
        throw new Error(`Failed to create blog: ${error.message}`);
      }
      throw error;
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.content || !formData.attachment || !user) {
      setError("Please fill out all fields and upload an image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await create();
      alert('Blog created successfully!');
      router.push('/dashboard/allblogs');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Blog</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/allblogs')}
        >
          Back to Blogs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <span className="text-red-600">{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter blog title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter blog description"
              />
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
            <div className="space-y-2">
              <Label htmlFor="image">Featured Image *</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  setFormData(prev => ({
                    ...prev,
                    attachment: files[0],
                  }));
                }}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <RTE
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value || "" }))}
                height={400}
              />
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
                    Create Blog
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard/allblogs')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 