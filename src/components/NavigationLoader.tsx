"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for route changes
    const handleRouteChange = () => {
      setIsLoading(true);
      // Simulate a minimum loading time for better UX
      setTimeout(() => setIsLoading(false), 300);
    };

    // Add event listeners for navigation
    window.addEventListener('beforeunload', handleStart);
    
    // Use a custom event for route changes
    const handleCustomRouteChange = () => {
      handleRouteChange();
    };

    window.addEventListener('routeChangeStart', handleCustomRouteChange);
    window.addEventListener('routeChangeComplete', handleComplete);
    window.addEventListener('routeChangeError', handleComplete);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('routeChangeStart', handleCustomRouteChange);
      window.removeEventListener('routeChangeComplete', handleComplete);
      window.removeEventListener('routeChangeError', handleComplete);
    };
  }, []);

  // Show loading indicator when pathname changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-600 animate-pulse">
        <div className="h-full bg-blue-400 animate-ping" style={{ width: '30%' }}></div>
      </div>
    </div>
  );
}

 