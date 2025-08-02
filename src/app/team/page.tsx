"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { team } from "@/data/team";
import Head from "next/head";

const roles = ["Chairperson", "Director", "Manager"];

// Enhanced lazy loading image component with shadcn skeleton
const LazyTeamImage = ({ src, alt, onLoadStateChange }: { 
  src: string; 
  alt: string; 
  onLoadStateChange?: (isLoaded: boolean) => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadImage = () => {
      const img = new window.Image();
      
      img.onload = () => {
        setIsLoaded(true);
        setIsError(false);
        onLoadStateChange?.(true);
      };
      
      img.onerror = () => {
        if (retryCount < 2) {
          // Retry loading the image
          setRetryCount(prev => prev + 1);
          setTimeout(() => loadImage(), 1000);
        } else {
          setIsError(true);
          onLoadStateChange?.(true); // Still call onLoadStateChange to show content
        }
      };
      
      img.src = src;
    };

    loadImage();
  }, [src, retryCount, onLoadStateChange]);

  return (
    <div className="w-full max-w-xs aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl relative bg-gray-800">
      {/* Skeleton loading placeholder using shadcn */}
      {!isLoaded && !isError && (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-6">
          {/* Skeleton avatar */}
          <Skeleton className="w-28 h-28 rounded-full" />
          
          {/* Skeleton content structure */}
          <div className="w-full space-y-4">
            {/* Name skeleton */}
            <div className="text-center">
              <Skeleton className="w-40 h-8 mx-auto mb-2" />
              <Skeleton className="w-24 h-5 mx-auto" />
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-4" />
            </div>
            
            {/* Social buttons skeleton */}
            <div className="flex justify-center space-x-3 pt-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          </div>
        </div>
      )}
      
      {/* Error placeholder */}
      {isError && (
        <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-2xl">
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-2">👤</div>
            <div className="text-sm">Image not available</div>
          </div>
        </div>
      )}
      
      {/* Actual image with smooth transition */}
      {isLoaded && (
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          className="w-full h-full object-cover object-center select-none transition-all duration-500 ease-out"
          draggable={false}
          quality={75}
        />
      )}
    </div>
  );
};



export default function TeamPage() {
  const [idx, setIdx] = React.useState(0);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const member = team[idx];

  // Preload all team images for better performance
  React.useEffect(() => {
    const preloadImages = () => {
      team.forEach(member => {
        const img = new window.Image();
        img.src = member.image;
      });
    };
    
    preloadImages();
  }, []);

  // Auto-advance every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % team.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reset image loaded state when member changes
  React.useEffect(() => {
    setImageLoaded(false);
  }, [idx]);

  // Find the index of the first team member with the given role
  const getRoleIndex = (role: string) => team.findIndex((m) => m.position.toLowerCase() === role.toLowerCase());

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex flex-col justify-center items-center py-20 px-4">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-pink-200 rounded-xl px-4 py-2 mb-10 shadow-sm">
        {roles.map((role, i) => {
          const teamIdx = getRoleIndex(role);
          const isActive = teamIdx === idx;
          return (
            <button
              key={role}
              onClick={() => {
                if (teamIdx !== -1) setIdx(teamIdx);
              }}
              className={`px-3 py-1 font-semibold text-base focus:outline-none transition-colors border-0 bg-transparent
                ${isActive ? "text-pink-700" : "text-gray-500 hover:text-pink-600"}
                ${i !== 0 ? "border-l border-pink-200" : ""}
                relative`}
              style={{ outline: "none" }}
            >
              <span className="relative z-10">{role}</span>
              {isActive && (
                <span className="absolute left-0 -bottom-1 w-full h-1 bg-pink-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <section className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 mx-auto">
        {/* Lazy Loading Image */}
        <LazyTeamImage 
          src={member.image} 
          alt={member.name} 
          onLoadStateChange={setImageLoaded}
        />
        
        {/* Info - Shows only after image loads for smooth transition */}
        <div className={`flex-1 flex flex-col justify-center items-start text-left transition-all duration-500 ${
          imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{member.name}</h2>
          <div className="text-lg text-pink-600 font-bold mb-2 uppercase tracking-wide">{member.position}</div>
          <div className="text-xl text-gray-700 mb-8 max-w-xl leading-relaxed">{member.description}</div>
          <div className="flex gap-4 mb-8">
            <Button asChild variant="ghost" size="icon" className="hover:bg-blue-900/20">
              <a href={member.socials.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="text-blue-500 text-2xl" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" className="hover:bg-pink-900/20">
              <a href={member.socials.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="text-pink-400 text-2xl" />
              </a>
            </Button>

          </div>
        </div>
      </section>
      {/* Animations */}
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </main>
  );
} 