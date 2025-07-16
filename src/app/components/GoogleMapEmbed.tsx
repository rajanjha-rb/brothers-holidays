import React from "react";

interface GoogleMapEmbedProps {
  src: string;
  title?: string;
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ src, title = "Google Map", className }) => (
  <div className={`w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-lg border border-yellow-100 ${className || ""}`}>
    <iframe
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen={true}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={title}
    ></iframe>
  </div>
);

export default GoogleMapEmbed; 