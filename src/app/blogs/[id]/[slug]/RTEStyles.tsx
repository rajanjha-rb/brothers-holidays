"use client";

import { useEffect } from "react";

export default function RTEStyles() {
  useEffect(() => {
    // Force RTE styles after component mounts
    const applyRTEStyles = () => {
      // Force light background on all RTE elements
      const rteElements = document.querySelectorAll('.w-md-editor-preview, .w-md-editor-preview *');
      rteElements.forEach((element) => {
        (element as HTMLElement).style.backgroundColor = '#f8fafc';
        (element as HTMLElement).style.color = '#374151';
      });
      
      // Also target any elements with data attributes
      const dataElements = document.querySelectorAll('[data-color-mode], [data-theme]');
      dataElements.forEach((element) => {
        (element as HTMLElement).style.backgroundColor = '#f8fafc';
        (element as HTMLElement).style.color = '#374151';
      });
    };

    // Apply immediately
    applyRTEStyles();
    
    // Apply once more after a short delay to catch any late-loading elements
    const timer = setTimeout(applyRTEStyles, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
} 