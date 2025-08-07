"use client";

import React, { useEffect, useState } from "react";
import { useAuthState } from "@/store/auth";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, loading, isAdmin, adminChecked } = useAuthState();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Only check after auth is hydrated and admin status is checked
    if (hydrated && !loading && adminChecked && !isAdmin) {
      // Redirect non-admin users to home page
      router.push("/");
    }
  }, [isAdmin, adminChecked, loading, hydrated, router]);

  // Show loading while checking admin status
  if (loading || !hydrated || !adminChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don not render dashboard content for non-admin users
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
