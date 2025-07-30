import React, { useState, useEffect, useRef } from "react";

interface GoogleMapEmbedProps {
  src: string;
  title?: string;
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ src, title = "Google Map", className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized Intersection Observer with better threshold
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before it comes into view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload the map URL for faster loading
  useEffect(() => {
    if (isVisible) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'iframe';
      link.href = src;
      document.head.appendChild(link);
    }
  }, [isVisible, src]);

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-yellow-800">Our Office Location</h2>
          <p className="text-gray-600 text-sm sm:text-base">Visit us at our office in Kathmandu</p>
        </div>
        
        <div className="flex justify-center">
          <div 
            ref={containerRef}
            className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl border-2 border-yellow-200 bg-white ${className || ""}`}
            style={{ height: '250px', maxHeight: '250px' }}
          >
            {!isVisible ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <div className="text-gray-600 font-medium">Loading map...</div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {!isLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                      <div className="text-gray-600 font-medium">Loading map...</div>
                    </div>
                  </div>
                )}
                <iframe
                  src={src}
                  width="100%"
                  height="100%"
                  style={{ 
                    border: 0,
                    height: '250px',
                    display: 'block'
                  }}
                  allowFullScreen={true}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={title}
                  onLoad={() => setIsLoaded(true)}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            )}
          </div>
        </div>
        

      </div>
    </section>
  );
};

export default GoogleMapEmbed; 