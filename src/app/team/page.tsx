"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { team } from "@/data/team";
import Head from "next/head";

const roles = ["Chairperson", "Director", "Manager"];

export default function TeamPage() {
  const [idx, setIdx] = React.useState(0);
  const member = team[idx];

  // Auto-advance every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % team.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Find the index of the first team member with the given role
  const getRoleIndex = (role: string) => team.findIndex((m) => m.position.toLowerCase() === role.toLowerCase());

  return (
    <main className="min-h-screen bg-black flex flex-col justify-center items-center py-20 px-4">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-white/90 border border-gray-200 rounded-xl px-4 py-2 mb-10 shadow-sm">
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
      <section className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 mx-auto">
        {/* Image */}
        <div className="w-full max-w-xs aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={member.image}
            alt={member.name}
            width={400}
            height={400}
            className="w-full h-full object-cover object-center select-none"
            draggable={false}
            priority={idx === 0}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA"
          />
        </div>
        {/* Info */}
        <div className="flex-1 flex flex-col justify-center items-start text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{member.name}</h2>
          <div className="text-lg text-yellow-400 font-bold mb-2 uppercase tracking-wide">{member.position}</div>
          <div className="text-xl text-gray-100 mb-8 max-w-xl leading-relaxed">{member.description}</div>
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
            <Button asChild variant="ghost" size="icon" className="hover:bg-blue-900/20">
              <a href={member.socials.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="text-blue-300 text-2xl" />
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