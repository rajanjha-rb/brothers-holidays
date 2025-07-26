"use client";

import { useEffect } from 'react';

interface PerformanceMonitorProps {
  pageName: string;
}

export default function PerformanceMonitor({ pageName }: PerformanceMonitorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page load performance
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        console.log(`🚀 ${pageName} Performance Metrics:`, {
          'Total Load Time': `${loadTime}ms`,
          'DOM Content Loaded': `${domContentLoaded}ms`,
          'First Paint': performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A',
          'First Contentful Paint': performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 'N/A',
        });

        // Log slow loading warnings
        if (loadTime > 3000) {
          console.warn(`⚠️ ${pageName} is loading slowly: ${loadTime}ms`);
        }
      }

      // Track image loading performance
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        const startTime = performance.now();
        img.addEventListener('load', () => {
          const loadTime = performance.now() - startTime;
          if (loadTime > 1000) {
            console.warn(`🐌 Slow image load (${index}): ${loadTime.toFixed(0)}ms - ${img.src}`);
          }
        });
      });
    }
  }, [pageName]);

  return null; // This component doesn't render anything
} 