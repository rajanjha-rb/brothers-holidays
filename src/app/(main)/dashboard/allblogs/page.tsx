"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


import { FaPlus } from "react-icons/fa";

interface Blog {
  $id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  $updatedAt: string;
}

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBlogs, setDeletingBlogs] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [navigatingBlog, setNavigatingBlog] = useState<string | null>(null);
  const router = useRouter();

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching blogs from dashboard via API...');
      
      const response = await fetch('/api/blogs/list');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        const mappedBlogs: Blog[] = data.blogs.map((doc: Record<string, unknown>) => ({
          $id: doc.$id,
          title: doc.title,
          slug: doc.slug,
          featuredImage: doc.featuredImage,
        }));
        console.log('Mapped blogs:', mappedBlogs);
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
      } else {
        setError(data.error || "Failed to fetch blogs");
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Delete logic with loading state
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    setDeletingBlogs(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch('/api/blogs/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Blog deleted successfully');
        fetchBlogs(); // Refresh the list
      } else {
        console.error('❌ Failed to delete blog:', data.error);
        alert("Failed to delete blog");
      }
    } catch (error) {
      console.error('❌ Error deleting blog:', error);
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
                    <OptimizedImage 
                      src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/${blog.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${blog.$updatedAt}`}
                      alt={blog.title}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => {
                        setImageLoading(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(blog.$id);
                          return newSet;
                        });
                      }}
                      onError={() => {
                        console.error('❌ Blog image failed to load');
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
                      onClick={() => handleDelete(blog.$id)}
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