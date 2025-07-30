"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { team as defaultTeam } from "@/data/team";

interface TeamProps {
  team?: typeof defaultTeam;
}

const roles = ["Chairperson", "Director", "Manager"];

// Optimized image component with instant loading
const LazyTeamImage = ({ src, alt }: { 
  src: string; 
  alt: string; 
}) => {
  return (
    <div className="w-full aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl relative bg-gray-100">
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        className="w-full h-full object-cover object-center select-none"
        draggable={false}
        quality={85}
        priority={true}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </div>
  );
};

// Component with smooth transitions
const TeamMember = ({ member, isVisible }: {
  member: typeof defaultTeam[0];
  isVisible: boolean;
}) => {
  return (
    <section 
      className="w-full flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-10 lg:gap-16 mx-auto max-w-5xl"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out'
      }}
    >
      {/* Lazy Loading Image */}
      <div className="w-full max-w-sm md:max-w-xs">
        <LazyTeamImage 
          src={member.image} 
          alt={member.name} 
        />
      </div>
      
      {/* Info - Shows immediately */}
      <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-2">{member.name}</h2>
        <div className="text-base sm:text-lg text-yellow-400 font-bold mb-2 uppercase tracking-wide">{member.position}</div>
        <div className="text-sm sm:text-base md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-xl leading-relaxed">{member.description}</div>
        <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button asChild variant="ghost" size="icon" className="hover:bg-blue-900/20 bg-white shadow-md">
            <a href={member.socials.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-blue-600 text-xl sm:text-2xl" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon" className="hover:bg-pink-900/20 bg-white shadow-md">
            <a href={member.socials.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-pink-600 text-xl sm:text-2xl" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon" className="hover:bg-green-900/20 bg-white shadow-md">
            <a href={member.socials.whatsapp} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="text-green-600 text-xl sm:text-2xl" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default function Team({ team = defaultTeam }: TeamProps) {
  const [idx, setIdx] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);
  
  // Memoize role indices to avoid recalculating on every render
  const roleIndices = useMemo(() => {
    return roles.map(role => team.findIndex((m) => m.position.toLowerCase() === role.toLowerCase()));
  }, [team]);

  // Auto-transition effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIdx((currentIdx) => {
          const nextIdx = (currentIdx + 1) % team.length;
          return nextIdx;
        });
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      }, 600);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, team.length]);

  // Memoize click handlers with smooth transition
  const handleRoleClick = useCallback((teamIdx: number) => {
    if (teamIdx !== -1 && teamIdx !== idx) {
      setIsAutoPlaying(false); // Stop auto-play when user manually clicks
      setIsVisible(false);
      setTimeout(() => {
        setIdx(teamIdx);
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      }, 600);
    }
  }, [idx]);

  // Resume auto-play after 10 seconds of inactivity
  useEffect(() => {
    if (!isAutoPlaying) {
      const timer = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying]);

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 bg-white/90 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 mb-6 sm:mb-8 md:mb-10 shadow-sm w-full max-w-md">
        {roles.map((role, i) => {
          const teamIdx = roleIndices[i];
          const isActive = teamIdx === idx;
          return (
            <button
              key={role}
              onClick={() => handleRoleClick(teamIdx)}
              className={`px-2 sm:px-3 py-1 font-semibold text-sm sm:text-base focus:outline-none transition-colors border-0 bg-transparent flex-1
                ${isActive ? "text-black" : "text-gray-500 hover:text-black"}
                ${i !== 0 ? "border-l border-gray-300" : ""}
                relative`}
              style={{ outline: "none" }}
            >
              <span className="relative z-10">{role}</span>
              {isActive && (
                <span className="absolute left-0 -bottom-1 w-full h-1 bg-black rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      
      <TeamMember 
        member={team[idx]}
        isVisible={isVisible}
      />
      


    </div>
  );
} 