import React from 'react';
import SEO, { generateStructuredData } from './SEO';

export interface PackageSEOProps {
  packageData: {
    id: string;
    title: string;
    description: string;
    slug: string;
    price?: string;
    duration?: string;
    location?: string;
    featuredImage?: string;
    highlights?: string[];
    itinerary?: Array<{ day: number; title: string; description: string }>;
  };
  canonical?: string;
}

export const PackageSEO: React.FC<PackageSEOProps> = ({ packageData, canonical }) => {
  const {
    title,
    description,
    slug,
    price,
    duration,
    location,
    featuredImage,
    highlights = [],
  } = packageData;

  // Generate package-specific meta description
  const metaDescription = description || 
    `Experience ${title} with Brothers Holidays. ${duration ? `${duration} journey` : 'Unforgettable adventure'} in ${location || 'Nepal'}. ${highlights.length > 0 ? `Highlights include: ${highlights.slice(0, 3).join(', ')}.` : ''} Book your dream vacation today!`;

  // Generate package-specific keywords
  const packageKeywords = [
    title.toLowerCase(),
    location?.toLowerCase() || 'nepal',
    duration?.toLowerCase() || 'travel',
    'travel package',
    'tour package',
    'adventure tour',
    'brothers holidays',
    ...highlights.map(h => h.toLowerCase()),
  ].filter(Boolean);

  // Generate structured data for the tour package
  const tourStructuredData = generateStructuredData.tour({
    name: title,
    description: metaDescription,
    url: canonical || `https://brothers-holidays.vercel.app/packages/${slug}`,
    image: featuredImage,
    price: price,
    duration: duration,
    location: location,
  });

  // Generate breadcrumb structured data
  const breadcrumbData = generateStructuredData.breadcrumb([
    { name: 'Home', url: 'https://brothers-holidays.vercel.app' },
    { name: 'Packages', url: 'https://brothers-holidays.vercel.app/packages' },
    { name: title, url: canonical || `https://brothers-holidays.vercel.app/packages/${slug}` },
  ]);

  return (
    <>
      <SEO
        title={title}
        description={metaDescription}
        keywords={packageKeywords}
        canonical={canonical}
        openGraph={{
          title: title,
          description: metaDescription,
          url: canonical || `https://brothers-holidays.vercel.app/packages/${slug}`,
          images: featuredImage ? [
            {
              url: featuredImage,
              width: 1200,
              height: 630,
              alt: `${title} - Brothers Holidays`,
            },
          ] : undefined,
          type: 'website',
        }}
        twitter={{
          title: title,
          description: metaDescription,
          images: featuredImage ? [featuredImage] : undefined,
        }}
        structuredData={{
          type: 'tour',
          data: tourStructuredData,
        }}
      />
      
      {/* Additional structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
    </>
  );
};

export default PackageSEO;
