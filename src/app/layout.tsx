import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { NavigationLoader } from "@/components/NavigationLoader";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brothers Holidays - Your Travel Partner in Nepal",
  description: "Discover the best travel experiences in Nepal with Brothers Holidays. We offer personalized tours, adventure packages, and cultural experiences.",
  keywords: "Nepal travel, adventure tours, cultural experiences, Brothers Holidays",
  authors: [{ name: "Brothers Holidays" }],
  creator: "Brothers Holidays",
  publisher: "Brothers Holidays",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://brothers-holidays.vercel.app'),
  openGraph: {
    title: "Brothers Holidays - Your Travel Partner in Nepal",
    description: "Discover the best travel experiences in Nepal with Brothers Holidays.",
    url: "https://brothers-holidays.vercel.app",
    siteName: "Brothers Holidays",
    images: [
      {
        url: "/travelLogo.svg",
        width: 1200,
        height: 630,
        alt: "Brothers Holidays",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brothers Holidays - Your Travel Partner in Nepal",
    description: "Discover the best travel experiences in Nepal with Brothers Holidays.",
    images: ["/travelLogo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-pink-50 via-white to-pink-100 min-h-screen`}>
        <NavigationLoader />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
