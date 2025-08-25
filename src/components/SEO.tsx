import React from 'react';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { Organization, WebSite, BreadcrumbList, Article, Service } from 'schema-dts';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    images?: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    locale?: string;
    type?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
    creator?: string;
    site?: string;
  };
  structuredData?: {
    type: 'organization' | 'website' | 'breadcrumb' | 'article' | 'tour';
    data: Organization | WebSite | BreadcrumbList | Article | Service;
  };
  noindex?: boolean;
  nofollow?: boolean;
}

const defaultSEO = {
  title: 'Brothers Holidays - Your Travel Partner in Nepal',
  description: 'Discover the best travel experiences in Nepal with Brothers Holidays. We offer personalized tours, adventure packages, and cultural experiences.',
  keywords: ['Nepal travel', 'adventure tours', 'cultural experiences', 'Brothers Holidays', 'Himalayan trekking', 'Nepal tourism'],
  openGraph: {
    siteName: 'Brothers Holidays',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@brothersholidays',
    creator: '@brothersholidays',
  },
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  openGraph = {},
  twitter = {},
  structuredData,
  noindex = false,
  nofollow = false,
}) => {
  const seoTitle = title ? `${title} | Brothers Holidays` : defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoKeywords = [...defaultSEO.keywords, ...keywords].join(', ');
  
  const mergedOpenGraph = {
    ...defaultSEO.openGraph,
    ...openGraph,
    title: openGraph.title || seoTitle,
    description: openGraph.description || seoDescription,
  };

  const mergedTwitter = {
    ...defaultSEO.twitter,
    ...twitter,
    title: twitter.title || seoTitle,
    description: twitter.description || seoDescription,
  };

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        openGraph={mergedOpenGraph}
        twitter={mergedTwitter}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: seoKeywords,
          },
          {
            name: 'robots',
            content: `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`,
          },
          {
            name: 'author',
            content: 'Brothers Holidays',
          },
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1',
          },
        ]}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico',
          },
          {
            rel: 'apple-touch-icon',
            href: '/apple-touch-icon.png',
            sizes: '180x180',
          },
        ]}
      />
      
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.data),
            }}
          />
        </Head>
      )}
    </>
  );
};

// Predefined SEO configurations for common page types
export const pageSEO = {
  home: {
    title: 'Home',
    description: 'Welcome to Brothers Holidays - Your premier travel partner for unforgettable adventures in Nepal. Discover the Himalayas, explore ancient temples, and experience authentic Nepali culture.',
    keywords: ['Nepal travel', 'Himalayan adventures', 'cultural tours', 'trekking packages'],
    openGraph: {
      type: 'website',
    },
  },
  
  packages: {
    title: 'Travel Packages',
    description: 'Explore our curated collection of travel packages to Nepal. From luxury tours to budget adventures, we have the perfect package for every traveler.',
    keywords: ['Nepal travel packages', 'tour packages', 'adventure tours', 'cultural tours'],
    openGraph: {
      type: 'website',
    },
  },
  
  destinations: {
    title: 'Destinations',
    description: 'Discover the most beautiful and exciting destinations in Nepal. From the majestic Himalayas to ancient cities, explore what makes Nepal unique.',
    keywords: ['Nepal destinations', 'Himalayan destinations', 'Kathmandu', 'Pokhara', 'Everest'],
    openGraph: {
      type: 'website',
    },
  },
  
  about: {
    title: 'About Us',
    description: 'Learn about Brothers Holidays - a trusted travel company with years of experience in creating memorable journeys across Nepal and beyond.',
    keywords: ['about Brothers Holidays', 'travel company Nepal', 'trusted tour operator'],
    openGraph: {
      type: 'website',
    },
  },
  
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Brothers Holidays. We\'re here to help you plan your perfect trip to Nepal.',
    keywords: ['contact Brothers Holidays', 'Nepal travel planning', 'tour consultation'],
    openGraph: {
      type: 'website',
    },
  },
};

// Helper function to generate structured data for different content types
export const generateStructuredData = {
  organization: (): Organization => ({
    '@type': 'Organization',
    name: 'Brothers Holidays',
    url: 'https://brothers-holidays.vercel.app',
    logo: 'https://brothers-holidays.vercel.app/travelLogo.svg',
    description: 'Your premier travel partner for unforgettable adventures in Nepal',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Nepal',
      addressLocality: 'Kathmandu',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://facebook.com/brothersholidays',
      'https://twitter.com/brothersholidays',
      'https://instagram.com/brothersholidays',
    ],
  }),
  
  website: (): WebSite => ({
    '@type': 'WebSite',
    name: 'Brothers Holidays',
    url: 'https://brothers-holidays.vercel.app',
    description: 'Discover the best travel experiences in Nepal',
    publisher: {
      '@type': 'Organization',
      name: 'Brothers Holidays',
    },
  }),
  
  breadcrumb: (items: Array<{ name: string; url: string }>): BreadcrumbList => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
  
  article: (article: {
    title: string;
    description: string;
    url: string;
    image?: string;
    author: string;
    datePublished: string;
  }): Article => ({
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Brothers Holidays',
      logo: {
        '@type': 'ImageObject',
        url: 'https://brothers-holidays.vercel.app/travelLogo.svg',
      },
    },
    datePublished: article.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  }),
  
  tour: (tour: {
    name: string;
    description: string;
    url: string;
    image?: string;
    price?: string;
    duration?: string;
    location?: string;
  }): Service => ({
    '@type': 'Service',
    name: tour.name,
    description: tour.description,
    url: tour.url,
    image: tour.image,
    offers: {
      '@type': 'Offer',
      price: tour.price,
      availability: 'https://schema.org/InStock',
    },
    areaServed: {
      '@type': 'Place',
      name: tour.location || 'Nepal',
    },
    provider: {
      '@type': 'Organization',
      name: 'Brothers Holidays',
    },
  }),
};

export default SEO;
