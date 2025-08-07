import React from "react";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";
import { Query } from "node-appwrite";

// Force revalidation to ensure we always get the latest data
export const revalidate = 0;

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

// This function runs at build time and revalidates every 60 seconds
export async function generateStaticParams() {
  try {
    // For the main blogs page, we don't need to fetch all blogs at build time
    // The actual data will be fetched in the page component
    return [];
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// On-demand revalidation - pages will be revalidated when content changes
// No time-based revalidation to avoid unnecessary server load

// Fetch blogs data on the server side
async function getBlogs(): Promise<Blog[]> {
      try {
    console.log('🔍 Fetching blogs from main page...');
    console.log('Environment check:', {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      apiKeySet: !!process.env.APPWRITE_API_KEY
    });
    console.log('Database:', db);
    console.log('Collection:', blogCollection);
    
        // Prefer querying by explicit type when available
        let response = await databases.listDocuments(db, blogCollection, [
          Query.equal('type', 'blog')
        ]);
    console.log('Typed query total:', response.total);
    console.log('Typed query documents:', response.documents.length);
    
    // Fallback: if no typed blogs found, fetch all
    if (!response.documents || response.documents.length === 0) {
      console.log('No typed blogs found, falling back to full collection fetch');
      response = await databases.listDocuments(db, blogCollection);
    }
    
    console.log('Response total:', response.total);
    console.log('Response documents:', response.documents.length);
    console.log('Raw documents:', response.documents);
    
    // Filter to ensure we only get valid blog entries
    const validBlogs = response.documents.filter((doc: Record<string, unknown>) => {
      // Prefer explicit type tagging when present
      if (doc.type && doc.type === 'trip') return false;
      
      // A valid blog must have ALL required blog fields
      const hasRequiredBlogFields = doc.title && 
                                   doc.description && 
                                   doc.content && 
                                   doc.slug;
      
      // Must not have trip-specific fields or structure (fallback if no type)
      const hasTripFields = doc.name || doc.difficulty;
      
      const isValidBlog = hasRequiredBlogFields && !hasTripFields;
      
      if (!isValidBlog) {
        console.log(`SSR: Filtering out document ${doc.$id}:`, {
          hasRequiredBlogFields,
          hasTripFields,
          title: doc.title,
          name: doc.name,
          contentPresent: !!doc.content,
          descriptionPresent: !!doc.description,
        });
      }
      
      return isValidBlog;
    });
    
    console.log('Filtered valid blogs:', validBlogs.length);
    console.log('Valid blog titles:', validBlogs.map((doc: Record<string, unknown>) => doc.title));
    
        const blogsData = validBlogs as unknown as Blog[];
    
        // Sort by creation date (newest first)
        const sortedBlogs = blogsData.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
    
    console.log('Sorted blogs:', sortedBlogs.length);
    console.log('Final blogs:', sortedBlogs);
    return sortedBlogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error('Failed to fetch blogs');
  }
}

import BlogsClient from "./BlogsClient";

export default async function BlogsPage() {
  try {
    console.log('BlogsPage: Starting to fetch blogs...');
    console.log('BlogsPage: Environment check -', {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      apiKeySet: !!process.env.APPWRITE_API_KEY
    });
    
  const blogs = await getBlogs();
    console.log('BlogsPage: Fetched blogs successfully:', blogs.length);
    console.log('BlogsPage: Blogs data:', blogs);
    


  return <BlogsClient initialBlogs={blogs} />;
  } catch (error) {
    console.error('BlogsPage: Error fetching blogs:', error);
    
    // Return a fallback component with error information
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Blogs</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <p className="text-sm text-gray-500">
            Please check the server console for more details.
          </p>
          <pre className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
} 