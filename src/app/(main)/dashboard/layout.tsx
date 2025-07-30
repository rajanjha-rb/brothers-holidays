"use client";

import React, { useEffect } from "react";
import { useAdminStatus } from "@/store/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminStatus();
  const router = useRouter();

      // Admin status checked

  useEffect(() => {
    // Dashboard layout effect triggered
    
    if (!loading && !isAdmin) {
              // Redirecting non-admin user
      // Redirect non-admin users to home page
      router.push("/");
    }
  }, [isAdmin, loading, router]);

  // Show loading while checking admin status
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content for non-admin users
  if (!isAdmin) {
    return null;
  }

  return <div>{children}</div>;
} 