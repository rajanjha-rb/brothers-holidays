"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: unknown) => void;
}

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  style,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const handleError = (error: unknown) => {
    console.error(' Image failed to load:', src, error);
    if (!useFallback) {
      console.log(' Switching to fallback img tag...');
      setUseFallback(true);
    } else {
      setImageError(true);
    }
    onError?.(error);
  };

  const handleLoad = () => {
    console.log(' Image loaded successfully:', src);
    setImageError(false);
    onLoad?.();
  };

  // If both Next.js Image and fallback failed
  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ ...style, width, height }}>
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2"></div>
          <div className="text-sm">Image not available</div>
        </div>
      </div>
    );
  }

  // Try Next.js Image first for full optimization
  if (!useFallback) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        quality={85}
        style={style}
        unoptimized={false}
      />
    );
  }

  // Fallback to regular img tag if Next.js Image fails
  return (
    <div className={className} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
}
