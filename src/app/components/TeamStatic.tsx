import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { team } from "@/data/team";

export default function TeamStatic() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-white/90 border border-gray-200 rounded-xl px-4 py-2 mb-10 shadow-sm">
        {["Chairperson", "Director", "Manager"].map((role, i) => (
          <div
            key={role}
            className={`px-3 py-1 font-semibold text-base border-0 bg-transparent
              ${i === 0 ? "text-black" : "text-gray-500"}
              ${i !== 0 ? "border-l border-gray-300" : ""}
              relative`}
          >
            <span className="relative z-10">{role}</span>
            {i === 0 && (
              <span className="absolute left-0 -bottom-1 w-full h-1 bg-black rounded-full" />
            )}
          </div>
        ))}
      </div>
      
      {/* Static Team Display - Show all members */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {team.map((member, index) => (
          <div key={member.name} className="flex flex-col items-center text-center">
            {/* Image */}
            <div className="w-full max-w-xs aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl relative bg-gray-800 mb-6">
              <Image
                src={member.image}
                alt={member.name}
                width={400}
                height={400}
                className="w-full h-full object-cover object-center select-none"
                draggable={false}
                quality={75}
                priority={index < 2} // Prioritize first 2 images
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-fadein">
              <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-2">{member.name}</h2>
              <div className="text-lg text-yellow-400 font-bold mb-2 uppercase tracking-wide">{member.position}</div>
              <div className="text-lg text-gray-700 mb-6 max-w-md leading-relaxed">{member.description}</div>
              <div className="flex gap-4">
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
          </div>
        ))}
      </div>
      
      {/* Animations */}
      <style jsx>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
} 