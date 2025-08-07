import React from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";
import { MarkdownPreview } from "@/components/RTE";
import { FaCalendar, FaTags } from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import ScrollButton from "./ScrollButton";
import RTEStyles from "./RTEStyles";
import AdminControlsWrapper from "./AdminControlsWrapper";

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

interface PageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

// This function runs at build time to generate static paths for all blogs
export async function generateStaticParams() {
  try {
    const response = await databases.listDocuments(db, blogCollection);
    const blogsData = response.documents as unknown as Blog[];
    
    return blogsData.map((blog) => ({
      id: blog.$id,
      slug: blog.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Force revalidation on every request to ensure fresh data
export const revalidate = 0;

// Fetch blog data on the server side
async function getBlog(blogId: string): Promise<Blog | null> {
  try {
    const doc = await databases.getDocument(db, blogCollection, blogId);
    return doc as unknown as Blog;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// Function to return content exactly as stored in database - no cleaning
const getOriginalContent = (content: string): string => {
  return content || '';
};

export default async function BlogViewPage({ params }: PageProps) {
  const { id: blogId } = await params;
  
  // Fetch blog data with error handling
  let blog: Blog | null = null;
  try {
    blog = await getBlog(blogId);
  } catch (error) {
    console.error('Error fetching blog:', error);
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Button 
            onClick={() => window.location.href = '/blogs'}
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
      {/* Show navbar for all users */}
      <Navbar />

      {/* Admin Controls - Loaded conditionally to improve performance */}
      <AdminControlsWrapper blog={blog} />

      {/* RTE Styles - Client component for styling */}
      <RTEStyles />

      {/* Hero Section with Featured Image Background */}
      {blog.featuredImage && (
        <div className="relative min-h-[60vh]">
          
          {/* Background Image Container */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <OptimizedImage 
              src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${blog.featuredImageBucket}/files/${blog.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${blog.$updatedAt}`}
              alt={blog.title}
              width={1920}
              height={1080}
              className="object-cover w-full h-full"
              sizes="100vw"
              priority
              style={{
                objectPosition: 'center'
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
          <ScrollButton />

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