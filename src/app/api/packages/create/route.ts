import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";
import { ID } from "node-appwrite";
import slugify from "@/app/utils/slugify";

export async function POST(request: NextRequest) {
  try {
    console.log("=== PACKAGE CREATION DEBUG START ===");
    console.log("1. Package creation request received");
    console.log("2. Request object type:", typeof request);
    console.log("3. Request method:", request.method);
    console.log("4. Request headers:", Object.fromEntries(request.headers.entries()));
    
    // Ensure the package collection exists (same pattern as blogs)
    try {
      await databases.getCollection(db, packageCollection);
      console.log("5. Package collection exists, proceeding...");
    } catch {
      console.log("6. Package collection not found, creating it...");
      const createPackageCollection = await import("@/models/server/package.collection");
      await createPackageCollection.default();
      console.log("7. Package collection created successfully");
    }
    
    console.log("7. About to parse request.json()...");
    const requestBody = await request.json();
    console.log("8. Request body parsed successfully:", requestBody);
    console.log("9. Request body type:", typeof requestBody);
    console.log("10. Request body keys:", Object.keys(requestBody));
    
    const {
      name,
      slug,
      overview,
      costInclude,
      costExclude,
      itinerary,
      featuredImage,
      featuredImageBucket,
      galleryImages,
      faq,
      tags,
      duration,
      location,
      price
    } = requestBody;

    console.log("11. Extracted individual fields:");
    console.log("   - name:", name, "| type:", typeof name, "| length:", name?.length);
    console.log("   - overview:", overview, "| type:", typeof overview, "| length:", overview?.length);
    console.log("   - costInclude:", costInclude, "| type:", typeof costInclude, "| isArray:", Array.isArray(costInclude));
    console.log("   - costExclude:", costExclude, "| type:", typeof costExclude, "| isArray:", Array.isArray(costExclude));
    console.log("   - itinerary:", itinerary, "| type:", typeof itinerary, "| isArray:", Array.isArray(itinerary));
    console.log("   - featuredImage:", featuredImage, "| type:", typeof featuredImage);
    console.log("   - featuredImageBucket:", featuredImageBucket, "| type:", typeof featuredImageBucket);
    console.log("   - galleryImages:", galleryImages, "| type:", typeof galleryImages, "| isArray:", Array.isArray(galleryImages));
    console.log("   - faq:", faq, "| type:", typeof faq, "| isArray:", Array.isArray(faq));
    console.log("   - tags:", tags, "| type:", typeof tags, "| isArray:", Array.isArray(tags));
    console.log("   - duration:", duration, "| type:", typeof duration);
    console.log("   - location:", location, "| type:", typeof location);
    console.log("   - price:", price, "| type:", typeof price);

    console.log("12. Starting validation...");
    if (!name) {
      console.log("13. VALIDATION FAILED: Package name is required");
      console.log("    name value:", name);
      console.log("    name type:", typeof name);
      console.log("    name truthy check:", !!name);
      return NextResponse.json(
        { success: false, message: "Package name is required" },
        { status: 400 }
      );
    }
    console.log("13. VALIDATION PASSED: Package name is present");

    console.log("14. Preparing package data for database...");
    const packageData = {
      name: name?.trim() || "",
      slug: slug || slugify(name?.trim() || ""),
      overview: overview || "",
      costInclude: Array.isArray(costInclude) ? costInclude : [],
      costExclude: Array.isArray(costExclude) ? costExclude : [],
      // Store itinerary as JSON string since Appwrite doesn't support complex objects directly
      itinerary: Array.isArray(itinerary) ? JSON.stringify(itinerary) : "[]",
      featuredImage: featuredImage || "",
      featuredImageBucket: featuredImageBucket || "featuredImage",
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      // Store FAQ as JSON string since Appwrite doesn't support complex objects directly
      faq: Array.isArray(faq) ? JSON.stringify(faq) : "[]",
      tags: Array.isArray(tags) ? tags : [],
      duration: duration || "",
      location: location || "",
      price: price || ""
    };
    console.log("15. Package data prepared successfully");

    console.log("Package data prepared for database:", {
      name: packageData.name,
      overview: packageData.overview?.substring(0, 100) + "...",
      costInclude: packageData.costInclude,
      costExclude: packageData.costExclude,
      itinerary: packageData.itinerary,
      featuredImage: packageData.featuredImage,
      featuredImageBucket: packageData.featuredImageBucket,
      galleryImages: packageData.galleryImages,
      faq: packageData.faq,
      tags: packageData.tags,
      duration: packageData.duration,
      location: packageData.location,
      price: packageData.price
    });

    console.log("16. About to create document in database...");
    console.log("17. Database ID:", db);
    console.log("18. Collection name:", packageCollection);
    console.log("19. Package data to be inserted:", JSON.stringify(packageData, null, 2));

    console.log("20. Calling databases.createDocument...");
    let result;
    try {
      result = await databases.createDocument(
        db,
        packageCollection,
        ID.unique(),
        packageData
      );

      console.log("21. Document created successfully!");
      console.log("    - Result ID:", result.$id);
      console.log("    - Result type:", typeof result);
      console.log("    - Result keys:", Object.keys(result));
    } catch (createError) {
      console.error("21. ERROR creating document:", createError);
      console.error("    - Error type:", typeof createError);
      console.error("    - Error message:", createError instanceof Error ? createError.message : 'Unknown error');
      console.error("    - Error details:", createError);
      
      // Check for specific Appwrite errors
      if (createError instanceof Error) {
        if (createError.message.includes('collection')) {
          throw new Error('Package collection not found. Please initialize the database first.');
        } else if (createError.message.includes('attribute')) {
          throw new Error('Invalid data format. Please check the form data.');
        } else if (createError.message.includes('permission')) {
          throw new Error('Permission denied. Please check your API key.');
        }
      }
      
      throw createError;
    }

    console.log("22. Preparing success response...");
    const responseData = {
      success: true,
      message: "Package created successfully",
      package: {
        $id: result.$id,
        name: result.name,
        overview: result.overview,
        costInclude: result.costInclude,
        costExclude: result.costExclude,
        // Parse itinerary back to array for frontend
        itinerary: typeof result.itinerary === 'string' ? JSON.parse(result.itinerary) : result.itinerary,
        featuredImage: result.featuredImage,
        featuredImageBucket: result.featuredImageBucket,
        galleryImages: result.galleryImages,
        // Parse FAQ back to array for frontend
        faq: typeof result.faq === 'string' ? JSON.parse(result.faq) : result.faq,
        tags: result.tags,
        duration: result.duration,
        location: result.location,
        price: result.price,
        $createdAt: result.$createdAt,
        $updatedAt: result.$updatedAt
      }
    };
    console.log("23. Success response prepared:", JSON.stringify(responseData, null, 2));
    console.log("24. === PACKAGE CREATION DEBUG END ===");
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("=== PACKAGE CREATION ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error name:", error instanceof Error ? error.name : 'Unknown error type');
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Full error object:", error);
    console.error("=== END ERROR LOG ===");
    
    // Check if it's a collection not found error
    if (error instanceof Error && error.message.includes('collection')) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Package collection not found. Please contact administrator to initialize the database." 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to create package" },
      { status: 500 }
    );
  }
}
