import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";
import { Query } from "node-appwrite";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 API: Fetching blogs...');
    console.log('Database:', db);
    console.log('Collection:', blogCollection);
    
    // Prefer querying by explicit type when available
    let response = await databases.listDocuments(db, blogCollection, [
      Query.equal('type', 'blog')
    ]);

    // Fallback to full fetch if none typed
    if (!response.documents || response.documents.length === 0) {
      console.log('No typed blogs found, falling back to full collection fetch');
      response = await databases.listDocuments(db, blogCollection);
    }

    console.log('API Response total:', response.total);
    console.log('API Response documents:', response.documents.length);
    console.log('Raw documents for inspection:', response.documents.map(doc => ({
      id: doc.$id,
      hasTitle: !!doc.title,
      hasName: !!doc.name,
      hasDescription: !!doc.description,
      hasContent: !!doc.content,
      hasDifficulty: !!doc.difficulty,
      type: doc.title ? 'blog' : (doc.name ? 'trip' : 'unknown')
    })));
    
    // Filter and validate documents to ensure they are proper blog entries
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
        console.log(`Filtering out document ${doc.$id}:`, {
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
    console.log('Valid blog titles:', validBlogs.map(doc => doc.title));

    const blogs = validBlogs.map((doc: Record<string, unknown>) => ({
      $id: doc.$id,
      title: doc.title,
      slug: doc.slug,
      featuredImage: doc.featuredImage,
      description: doc.description,
      content: doc.content,
      tags: doc.tags,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    }));
    
    console.log('API Mapped blogs:', blogs);
    
    return NextResponse.json({ 
      success: true, 
      blogs: blogs,
      total: response.total
    });
  } catch (error) {
    console.error('API Error fetching blogs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch blogs',
        details: error 
      },
      { status: 500 }
    );
  }
} 