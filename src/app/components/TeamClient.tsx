"use client";
import dynamic from "next/dynamic";

const Team = dynamic(() => import("./Team"), { ssr: false });

export default Team; 