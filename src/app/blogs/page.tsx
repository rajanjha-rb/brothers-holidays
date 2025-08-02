import React from "react";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";

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
        const response = await databases.listDocuments(db, blogCollection);
        const blogsData = response.documents as unknown as Blog[];
    
        // Sort by creation date (newest first)
        const sortedBlogs = blogsData.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
    
    return sortedBlogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error('Failed to fetch blogs');
  }
}

import BlogsClient from "./BlogsClient";

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return <BlogsClient initialBlogs={blogs} />;
} 