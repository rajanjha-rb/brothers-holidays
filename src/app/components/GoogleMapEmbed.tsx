import React, { useState, useEffect } from "react";

interface GoogleMapEmbedProps {
  src: string;
  title?: string;
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ src, title = "Google Map", className }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer to load map only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('map-container');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      id="map-container"
      className={`w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-lg border border-yellow-100 ${className || ""}`}
    >
      {!isVisible ? (
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      ) : (
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}

        />
      )}
    </div>
  );
};

export default GoogleMapEmbed; 