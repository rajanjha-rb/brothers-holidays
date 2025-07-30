"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { databases, storage } from "@/models/client/config";
import { db, blogCollection, featuredImageBucket } from "@/models/name";
import { MarkdownPreview } from "@/components/RTE";
import { FaCalendar, FaTags, FaArrowLeft, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useAuthStore, useAdminStatus } from "@/store/auth";
import Navbar from "@/app/components/Navbar";

interface Blog {
  $id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  tags: string[];
  featuredImage?: string;
  featuredImageBucket?: string;
  $createdAt: string;
  $updatedAt: string;
}

export default function BlogViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, hydrated, loading: authLoading } = useAuthStore();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blogId = params.id as string;

  // Function to return content exactly as stored in database - no cleaning
  const getOriginalContent = (content: string): string => {
    return content || '';
  };

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;
      
      setLoading(true);
      setError(null);
      try {
        const doc = await databases.getDocument(db, blogCollection, blogId);
        const blogData = doc as unknown as Blog;
        setBlog(blogData);
        
        // Debug: Log the featured image information
        if (blogData.featuredImage) {
          console.log('Featured Image ID:', blogData.featuredImage);
          console.log('Featured Image Bucket:', featuredImageBucket);
          const imageUrl = storage.getFileView(featuredImageBucket, blogData.featuredImage).toString();
          console.log('Featured Image URL:', imageUrl);
          
          // Test if the URL is valid
          try {
            new URL(imageUrl);
            console.log('✅ Image URL is valid');
          } catch (error) {
            console.error('❌ Image URL is invalid:', error);
          }
        }
      } catch {
        setError("Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  // Force RTE styles after component mounts
  useEffect(() => {
    if (blog) {
      // Wait for RTE to load and then force styles
      const applyRTEStyles = () => {
        // Force light background on all RTE elements
        const rteElements = document.querySelectorAll('.w-md-editor-preview, .w-md-editor-preview *');
        rteElements.forEach((element) => {
          (element as HTMLElement).style.backgroundColor = '#f8fafc';
          (element as HTMLElement).style.color = '#374151';
        });
        
        // Also target any elements with data attributes
        const dataElements = document.querySelectorAll('[data-color-mode], [data-theme]');
        dataElements.forEach((element) => {
          (element as HTMLElement).style.backgroundColor = '#f8fafc';
          (element as HTMLElement).style.color = '#374151';
        });
      };

      // Apply immediately
      applyRTEStyles();
      
      // Apply again after a short delay to catch any late-loading elements
      setTimeout(applyRTEStyles, 100);
      setTimeout(applyRTEStyles, 500);
      setTimeout(applyRTEStyles, 1000);
    }
  }, [blog]);





  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
          <Button 
            onClick={() => router.push('/blogs')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: 'white' }}>
      {/* Show navbar only for non-admin users or when not logged in */}
      {(!user || !hydrated || authLoading || adminLoading || !isAdmin) && <Navbar />}

      {/* Admin Controls - Show only for logged-in admin users */}
      {user && hydrated && !authLoading && !adminLoading && isAdmin && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Back to blogs button */}
              <Button 
                onClick={() => router.push('/blogs')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Blogs
              </Button>

              {/* Admin action buttons */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => router.push('/dashboard/addnewblog')}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add New Blog
                </Button>
                
                <Button 
                  onClick={() => router.push(`/blogs/${blog.$id}/edit`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </Button>
                
                <Button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this blog?")) {
                      // Handle delete logic here
                      if (blog.featuredImage) {
                        storage.deleteFile(featuredImageBucket, blog.featuredImage).catch(() => {
                          // Ignore image deletion errors
                        });
                      }
                      databases.deleteDocument(db, blogCollection, blog.$id)
                        .then(() => {
                          router.push('/dashboard/allblogs');
                        })
                        .catch(() => {
                          alert("Failed to delete blog");
                        });
                    }
                  }}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Featured Image Background */}
      {blog.featuredImage && (
        <div className="relative min-h-[60vh]">
          
          {/* Background Image Container */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <img 
              src={storage.getFileView(featuredImageBucket, blog.featuredImage).toString()}
              alt={blog.title}
              className="w-full h-full object-cover"
              onLoad={() => {
                console.log('✅ Background image loaded successfully!');
                console.log('Image dimensions:', 'loaded');
              }}
              onError={(e) => {
                console.error('❌ Background image failed to load:', e.currentTarget.src);
                console.error('Image ID:', blog.featuredImage);
                console.error('Bucket:', featuredImageBucket);
                console.error('Full URL:', e.currentTarget.src);
                // Add a fallback background color if image fails
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.backgroundColor = '#1f2937';
                }
              }}
              style={{
                minHeight: '100vh',
                minWidth: '100vw'
              }}
            />
          </div>
          
          {/* Dark overlay using a different approach */}
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))'
            }}
          ></div>
          
          {/* Content overlay */}
          <div className="relative z-20 flex items-center justify-center min-h-[60vh] text-center text-white max-w-4xl mx-auto px-4">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                {blog.title}
              </h1>
              
              {/* Meta information */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <FaCalendar className="w-4 h-4" />
                  <span>Published {new Date(blog.$createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FaTags className="w-4 h-4" />
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-white bg-opacity-20 text-white border-white border-opacity-30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Clean Scroll Animation in Hero Section */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <button 
              onClick={() => {
                // Scroll to the very beginning of the page to ensure nothing is skipped
                // Account for any fixed headers or navigation
                const navbar = document.querySelector('header');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                
                // Scroll to the very top of the page, accounting for navbar, plus a bit more
                window.scrollTo({
                  top: navbarHeight + 100,
                  behavior: 'smooth'
                });
              }}
              className="flex flex-col items-center space-y-2 cursor-pointer group"
            >
              {/* Simple scroll indicator with wave */}
              <div className="relative">
                <div className="w-5 h-7 border border-white/70 rounded-full flex justify-center items-start pt-1 group-hover:border-white transition-all duration-300">
                  <div className="w-0.5 h-2 bg-white/90 rounded-full animate-bounce"></div>
                </div>
                {/* More visible wave effect */}
                <div className="absolute inset-0 w-5 h-7 border border-white/60 rounded-full opacity-60 animate-ping transition-all duration-1200"></div>
                {/* Second wave for better visibility */}
                <div className="absolute inset-0 w-5 h-7 border border-white/40 rounded-full opacity-40 animate-ping transition-all duration-1800" style={{animationDelay: '0.6s'}}></div>
            </div>
              
              {/* Simple text */}
              <span className="text-white/80 text-xs font-medium group-hover:text-white transition-colors duration-300">
                Scroll
              </span>
            </button>
          </div>

        </div>
      )}



      {/* Main Content */}
      <main className="bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
        {/* Content Container */}
        <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Blog Header (when no featured image) */}
        {!blog.featuredImage && (
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              {blog.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {blog.description}
            </p>
          </div>
        )}

        {/* Meta Information (only shown when no featured image) */}
        {!blog.featuredImage && (
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mb-12 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaCalendar className="w-4 h-4" />
              <span>Published {new Date(blog.$createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            {blog.$updatedAt !== blog.$createdAt && (
              <div className="flex items-center gap-2">
                <FaCalendar className="w-4 h-4" />
                <span>Updated {new Date(blog.$updatedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            )}

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <FaTags className="w-4 h-4" />
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blog Content */}
        <article className="prose prose-xl max-w-none" style={{ backgroundColor: '#f8fafc', color: '#374151', margin: '0', padding: '0' }}>
          <div 
            className="markdown-content" 
            style={{ 
              backgroundColor: '#f8fafc', 
              color: '#374151',
              margin: '0',
              padding: '1rem',
              borderRadius: '0',
              boxShadow: 'none'
            }}
          >
            {/* Use RTE MarkdownPreview with proper styling */}
            <div 
              style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '0',
                boxShadow: 'none'
              }}
            >
              <MarkdownPreview 
                source={getOriginalContent(blog.content)} 
                style={{ 
                  backgroundColor: '#f8fafc', 
                  color: '#374151', 
                  margin: '0', 
                  padding: '0'
                }}
                className="rte-content-override"
              />
            </div>
          </div>
        </article>

          {/* Author/Share Section */}
          <div className="mt-16 pt-12 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Brothers Holidays</p>
                  <p className="text-sm text-gray-500">Travel & Adventure Experts</p>
                </div>
              </div>
              
              {/* Share Buttons */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">Share this article:</span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-blue-800 hover:bg-blue-900 text-white rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200" style={{ backgroundColor: 'white' }}>
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Brothers Holidays</span>
              </div>
              <p className="text-gray-600 mb-4">
                Discover the magic of Nepal with our expert travel guides and adventure stories.
              </p>
              <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Brothers Holidays. All rights reserved.
            </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
} 