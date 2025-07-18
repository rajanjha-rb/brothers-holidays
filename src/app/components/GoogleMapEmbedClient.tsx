"use client";
import dynamic from "next/dynamic";

const GoogleMapEmbed = dynamic(() => import("./GoogleMapEmbed"), { ssr: false });

export default GoogleMapEmbed; 