import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";

export async function PUT(request: NextRequest) {
  try {
    const { id, title, slug, description, content, tags, featuredImage, featuredImageBucket } = await request.json();

    // Validate required fields
    if (!id || !title || !slug || !description || !content) {
      return NextResponse.json(
        { success: false, message: "ID, title, slug, description, and content are required" },
        { status: 400 }
      );
    }

    // Update the blog
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

      const response = await databases.updateDocument(
        db, 
        blogCollection, 
        id, 
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
      console.error("Blog update error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update blog: ${error instanceof Error ? error.message : "Unknown error"}`,
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
