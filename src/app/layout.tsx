import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Brothers Holidays - Travel the World",
  description: "Travel the world with Brothers Holidays! Discover amazing destinations and create unforgettable memories.",
  keywords: "travel, holidays, nepal, adventure, tourism",
  authors: [{ name: "Brothers Holidays" }],
  openGraph: {
    title: "Brothers Holidays",
    description: "Travel the world with Brothers Holidays!",
    images: ["/travelLogo.svg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brothers Holidays",
    description: "Travel the world with Brothers Holidays!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0057B7" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
