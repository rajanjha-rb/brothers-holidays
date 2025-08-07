"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import AdminControls to avoid blocking the main render
const AdminControls = dynamic(() => import("./AdminControls"), {
  ssr: false,
  loading: () => null
});

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

interface AdminControlsWrapperProps {
  blog: Blog;
}

export default function AdminControlsWrapper({ blog }: AdminControlsWrapperProps) {
  return (
    <Suspense fallback={null}>
      <AdminControls blog={blog} />
    </Suspense>
  );
} 