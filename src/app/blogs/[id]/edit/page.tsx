"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
import { FaPlus, FaTimes, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useAuthState } from "@/store/auth";
import { revalidateBlog } from "@/lib/revalidate";

interface BlogFormData {
  title: string;
  description: string;
  content: string;
  tags: Set<string>;
  attachment: File | null;
}

interface Blog {
  $id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  tags: string[];
  featuredImage?: string;
  featuredImageBucket?: string;
  $updatedAt: string;
}

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthState();
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [fetching, setFetching] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const blogId = params.id as string;

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    description: "",
    content: "",
    tags: new Set<string>(),
    attachment: null,
  });

  // Fetch existing blog data
  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;
      
      setFetching(true);
      try {
        const doc = await databases.getDocument(db, blogCollection, blogId);
        const blogData = doc as unknown as Blog;
        setBlog(blogData);
        
        setFormData({
          title: blogData.title,
          description: blogData.description,
          content: blogData.content,
          tags: new Set(blogData.tags || []),
          attachment: null,
        });
        
        // Prefetch common navigation routes for faster navigation
        router.prefetch('/blogs');
        router.prefetch('/dashboard/allblogs');
        router.prefetch(`/blogs/${blogId}/${slugify(blogData.title)}`);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError("Failed to fetch blog");
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [blogId, router]);

  const update = async () => {
    if (!blog) throw new Error("Blog not found");

    const attachmentId = await (async () => {
      if (!formData.attachment) return blog?.featuredImage as string;

      setImageUploading(true);
      try {
        // Delete old image if it exists
        if (blog.featuredImage) {
          try {
            await storage.deleteFile(featuredImageBucket, blog.featuredImage);
          } catch {
            // Ignore deletion errors
          }
        }

        // Upload new image
        const file = await storage.createFile(
          featuredImageBucket,
          ID.unique(),
          formData.attachment
        );

        return file.$id;
      } finally {
        setImageUploading(false);
      }
    })();

    const response = await databases.updateDocument(db, blogCollection, blog.$id, {
      title: formData.title,
      description: formData.description,
      slug: slugify(formData.title),
      content: formData.content,
      tags: Array.from(formData.tags),
      featuredImage: attachmentId,
      featuredImageBucket: featuredImageBucket,
    });

    return response;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.content || !user) {
      setError("Please fill out all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await update();
      
      // Trigger revalidation for the updated blog page
      try {
        await revalidateBlog(blogId, slugify(formData.title));
        console.log('✅ Blog page revalidated successfully');
      } catch (revalidationError) {
        console.warn('⚠️ Revalidation failed, but blog was updated:', revalidationError);
      }
      
      alert('Blog updated successfully!');
      router.push(`/blogs/${blogId}/${slugify(formData.title)}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }

    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
                  <Button 
          onClick={() => {
            setNavigating(true);
            router.replace('/dashboard/allblogs', { scroll: false });
          }}
          disabled={navigating}
        >
          {navigating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          ) : (
            "Back to Blogs"
          )}
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Blog</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            setNavigating(true);
            router.replace('/dashboard/allblogs', { scroll: false });
          }}
          className="flex items-center gap-2"
          disabled={navigating || loading}
        >
          {navigating ? (
            <>
              <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            <>
              <FaArrowLeft className="w-4 h-4" />
              Back to Blogs
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Blog Information</CardTitle>
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
            <div className="space-y-2">
              <Label htmlFor="image">Featured Image</Label>
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
                disabled={imageUploading}
              />
              {imageUploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Uploading image...
                </div>
              )}
              {blog?.featuredImage && !formData.attachment && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Current image:</p>
                  <Image 
                    src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${blog.featuredImageBucket}/files/${blog.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${blog.$updatedAt}`}
                    alt="Current featured"
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
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
                    Updating...
                  </>
                ) : (
                  "Update Blog"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setNavigating(true);
                  router.replace('/dashboard/allblogs', { scroll: false });
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
    </div>
  );
} 