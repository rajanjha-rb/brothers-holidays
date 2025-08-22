import React from "react";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";
import PackagesClient from "./PackagesClient";

interface Package {
  $id: string;
  name: string;
  overview: string;
  costInclude: string[];
  costExclude: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  featuredImage: string;
  featuredImageBucket: string;
  galleryImages: string[];
  faq: Array<{ question: string; answer: string }>;
  tags: string[];
  duration: string;
  location: string;
  price: string;
  $createdAt: string;
  $updatedAt: string;
}

// This function runs at build time to generate static data
async function getPackages(): Promise<Package[]> {
  try {
    const response = await databases.listDocuments(db, packageCollection, []);
    const packagesData = response.documents as unknown as Package[];
    
    // Normalize package data
    return packagesData.map((pkg) => ({
      $id: pkg.$id,
      name: pkg.name || "",
      overview: pkg.overview || "",
      costInclude: Array.isArray(pkg.costInclude) ? pkg.costInclude : [],
      costExclude: Array.isArray(pkg.costExclude) ? pkg.costExclude : [],
      itinerary: (() => {
        try {
          if (typeof pkg.itinerary === 'string') {
            return JSON.parse(pkg.itinerary);
          }
          return Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
        } catch {
          return [];
        }
      })(),
      featuredImage: pkg.featuredImage || "",
      featuredImageBucket: pkg.featuredImageBucket || "",
      galleryImages: Array.isArray(pkg.galleryImages) ? pkg.galleryImages : [],
      faq: (() => {
        try {
          if (typeof pkg.faq === 'string') {
            return JSON.parse(pkg.faq);
          }
          return Array.isArray(pkg.faq) ? pkg.faq : [];
        } catch {
          return [];
        }
      })(),
      tags: Array.isArray(pkg.tags) ? pkg.tags : [],
      duration: pkg.duration || "",
      location: pkg.location || "",
      price: pkg.price || "",
      $createdAt: pkg.$createdAt || "",
      $updatedAt: pkg.$updatedAt || ""
    }));
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

// Force revalidation on every request to ensure fresh data
export const revalidate = 0;

export default async function PackagesPage() {
  const packages = await getPackages();
  
  return <PackagesClient initialPackages={packages} />;
}
