"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { databases } from "@/models/client/config";
import { db, blogCollection } from "@/models/name";
import { FaArrowLeft, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useAuthState, useAdminStatus } from "@/store/auth";
import { revalidateBlogsList } from "@/lib/revalidate";

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

interface AdminControlsProps {
  blog: Blog;
}

export default function AdminControls({ blog }: AdminControlsProps) {
  const router = useRouter();
  const { user, hydrated, loading: authLoading } = useAuthState();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const [deleting, setDeleting] = useState(false);
  const [navigating, setNavigating] = useState(false);

  // Use cached auth status - only show loading if not hydrated
  if (!hydrated) {
    return null;
  }

  // Only show admin controls for logged-in admin users
  if (!user || !isAdmin || authLoading || adminLoading) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Back to blogs button */}
          <Button 
            onClick={() => {
              setNavigating(true);
              router.replace('/blogs', { scroll: false });
            }}
            variant="outline"
            className="flex items-center gap-2"
            disabled={navigating || deleting}
          >
            {navigating ? (
              <>
                <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <FaArrowLeft className="w-4 h-4" />
                Back to Blogs
              </>
            )}
          </Button>

          {/* Admin action buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => {
                setNavigating(true);
                router.push('/dashboard/addnewblog', { scroll: false });
              }}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              disabled={navigating || deleting}
            >
              {navigating ? (
                <>
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <FaPlus className="w-4 h-4" />
                  Add New Blog
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => {
                setNavigating(true);
                router.push(`/blogs/${blog.$id}/edit`, { scroll: false });
              }}
              variant="outline"
              className="flex items-center gap-2"
              disabled={navigating || deleting}
            >
              {navigating ? (
                <>
                  <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <FaEdit className="w-4 h-4" />
                  Edit
                </>
              )}
            </Button>
            
                            <Button 
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this blog?")) {
                      setDeleting(true);
                      try {
                        // Handle delete logic here - DO NOT delete the featured image
                        // Images should be reusable across multiple blogs and managed separately in media library
                        await databases.deleteDocument(db, blogCollection, blog.$id);
                        
                        // Trigger revalidation for blogs list
                        await revalidateBlogsList().catch(() => {
                          // Ignore revalidation errors
                        });
                        
                        router.push('/dashboard/allblogs', { scroll: false });
                      } catch {
                        alert("Failed to delete blog");
                      } finally {
                        setDeleting(false);
                      }
                    }
                  }}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
              disabled={deleting || navigating}
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 