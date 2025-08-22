import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";
import { ID } from "node-appwrite";
import createBlogCollection from "@/models/server/blog.collection";

export async function POST(request: NextRequest) {
  try {
    const { title, slug, description, content, tags, featuredImage, featuredImageBucket } = await request.json();

    // Validate required fields
    if (!title || !slug || !description || !content) {
      return NextResponse.json(
        { success: false, message: "Title, slug, description, and content are required" },
        { status: 400 }
      );
    }

    // Ensure the blog collection exists (without deleting/recreating)
    try {
      await databases.getCollection(db, blogCollection);
    } catch {
      await createBlogCollection();
    }

    // Create the new blog
    try {
      const blogData = {
        title,
        slug,
        description,
        content,
        tags: tags || [],
        featuredImage: featuredImage || "",
        featuredImageBucket: featuredImageBucket || "",
        type: 'blog',
      };

      const response = await databases.createDocument(
        db, 
        blogCollection, 
        ID.unique(), 
        blogData
      );

      return NextResponse.json({
        success: true,
        blog: {
          $id: response.$id,
          title: response.title,
          slug: response.slug,
          description: response.description,
          content: response.content,
          tags: response.tags,
          featuredImage: response.featuredImage,
          featuredImageBucket: response.featuredImageBucket,
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
        },
      });
    } catch (error) {
      console.error("Blog creation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create blog: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
