"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { databases, storage } from "@/models/client/config";
import { db, blogCollection, featuredImageBucket } from "@/models/name";
import { FaPlus } from "react-icons/fa";

interface Blog {
  $id: string;
  title: string;
  slug: string;
  featuredImage?: string;
}

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBlogs, setDeletingBlogs] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [navigatingBlog, setNavigatingBlog] = useState<string | null>(null);
  const router = useRouter();

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(db, blogCollection, []);
      // Map documents to Blog type
      const mappedBlogs: Blog[] = res.documents.map((doc: Record<string, unknown>) => ({
        $id: doc.$id as string,
        title: doc.title as string,
        slug: doc.slug as string,
        featuredImage: doc.featuredImage as string | undefined,
      }));
      setBlogs(mappedBlogs);
      
      // Initialize image loading state for blogs with featured images
      const blogsWithImages = mappedBlogs.filter(blog => blog.featuredImage);
      setImageLoading(new Set(blogsWithImages.map(blog => blog.$id)));
      
      // Prefetch blog routes for faster navigation
      mappedBlogs.forEach(blog => {
        router.prefetch(`/blogs/${blog.$id}/${blog.slug}`);
        router.prefetch(`/blogs/${blog.$id}/edit`);
      });
      
      // Prefetch add new blog route
      router.prefetch('/dashboard/addnewblog');
    } catch {
      setError("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [router]);

  // Delete logic with loading state
  const handleDelete = async (id: string, featuredImageId?: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    setDeletingBlogs(prev => new Set(prev).add(id));
    
    try {
      if (featuredImageId) {
        try {
          await storage.deleteFile(featuredImageBucket, featuredImageId);
        } catch {
          // Ignore image deletion errors
        }
      }
      await databases.deleteDocument(db, blogCollection, id);
      fetchBlogs();
    } catch {
      alert("Failed to delete blog");
    } finally {
      setDeletingBlogs(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Navigation handlers with loading states
  const handleView = (blogId: string, slug: string) => {
    if (navigatingBlog !== blogId) {
      setNavigatingBlog(blogId);
      router.push(`/blogs/${blogId}/${slug}`, { scroll: false });
    }
  };

  const handleEdit = (blogId: string) => {
    if (navigatingBlog !== blogId) {
      setNavigatingBlog(blogId);
      router.push(`/blogs/${blogId}/edit`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="mt-2 text-gray-600">Manage your blog posts and content</p>
          </div>
          <Button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/dashboard/addnewblog', { scroll: false })}
          >
            <FaPlus className="w-4 h-4" />
            Add New Blog
          </Button>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading blogs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Blogs</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Blogs Yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first blog post.</p>
            <Link href="/dashboard/addnewblog">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Your First Blog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.$id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Blog Image */}
                {blog.featuredImage && (
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {imageLoading.has(blog.$id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img 
                      src={storage.getFileView(featuredImageBucket, blog.featuredImage).toString()}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      onLoad={() => {
                        setImageLoading(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(blog.$id);
                          return newSet;
                        });
                      }}
                      onError={(e) => {
                        console.error('❌ Blog image failed to load:', e.currentTarget.src);
                        // Add a fallback background color if image fails
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.style.backgroundColor = '#f3f4f6';
                        }
                        setImageLoading(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(blog.$id);
                          return newSet;
                        });
                      }}
                    />
                  </div>
                )}
                
                {/* Blog Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => handleView(blog.$id, blog.slug)}
                        disabled={navigatingBlog === blog.$id || deletingBlogs.has(blog.$id)}
                      >
                        {navigatingBlog === blog.$id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          "View"
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(blog.$id)}
                        disabled={navigatingBlog === blog.$id || deletingBlogs.has(blog.$id)}
                      >
                        {navigatingBlog === blog.$id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          "Edit"
                        )}
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(blog.$id, blog.featuredImage)}
                      disabled={deletingBlogs.has(blog.$id)}
                    >
                      {deletingBlogs.has(blog.$id) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 