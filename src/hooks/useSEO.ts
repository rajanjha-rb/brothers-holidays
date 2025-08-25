import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export interface SEOMetaData {
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
  noindex?: boolean;
  nofollow?: boolean;
}

export interface SEOState {
  metaData: SEOMetaData;
  updateMetaData: (newMetaData: Partial<SEOMetaData>) => void;
  resetMetaData: () => void;
}

const defaultMetaData: SEOMetaData = {
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

export const useSEO = (initialMetaData?: Partial<SEOMetaData>): SEOState => {
  const router = useRouter();
  const [metaData, setMetaData] = useState<SEOMetaData>({
    ...defaultMetaData,
    ...initialMetaData,
  });

  // Update meta data
  const updateMetaData = (newMetaData: Partial<SEOMetaData>) => {
    setMetaData(prev => ({
      ...prev,
      ...newMetaData,
    }));
  };

  // Reset meta data to defaults
  const resetMetaData = () => {
    setMetaData(defaultMetaData);
  };

  // Update meta data when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      // Reset to default meta data on route change
      resetMetaData();
    };

    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  // Update document title and meta tags when meta data changes
  useEffect(() => {
    if (metaData.title) {
      document.title = metaData.title;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', metaData.description || '');

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', metaData.keywords?.join(', ') || '');

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (metaData.canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', metaData.canonical);
    } else if (canonicalLink) {
      canonicalLink.remove();
    }

    // Update robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    
    const robotsContent = `${metaData.noindex ? 'noindex' : 'index'}, ${metaData.nofollow ? 'nofollow' : 'follow'}`;
    robotsMeta.setAttribute('content', robotsContent);

  }, [metaData]);

  return {
    metaData,
    updateMetaData,
    resetMetaData,
  };
};

// Specialized hooks for different content types
export const usePackageSEO = (packageData: {
  title: string;
  description: string;
  slug: string;
  price?: string;
  duration?: string;
  location?: string;
  featuredImage?: string;
}) => {
  const { updateMetaData } = useSEO();

  useEffect(() => {
    const metaDescription = packageData.description || 
      `Experience ${packageData.title} with Brothers Holidays. ${packageData.duration ? `${packageData.duration} journey` : 'Unforgettable adventure'} in ${packageData.location || 'Nepal'}. Book your dream vacation today!`;

    updateMetaData({
      title: packageData.title,
      description: metaDescription,
      keywords: [
        packageData.title.toLowerCase(),
        packageData.location?.toLowerCase() || 'nepal',
        packageData.duration?.toLowerCase() || 'travel',
        'travel package',
        'tour package',
        'adventure tour',
        'brothers holidays',
      ],
      canonical: `https://brothers-holidays.vercel.app/packages/${packageData.slug}`,
      openGraph: {
        title: packageData.title,
        description: metaDescription,
        images: packageData.featuredImage ? [
          {
            url: packageData.featuredImage,
            width: 1200,
            height: 630,
            alt: `${packageData.title} - Brothers Holidays`,
          },
        ] : undefined,
      },
    });
  }, [packageData, updateMetaData]);
};

export const useBlogSEO = (blogData: {
  title: string;
  description: string;
  slug: string;
  content: string;
  category?: string;
  tags?: string[];
}) => {
  const { updateMetaData } = useSEO();

  useEffect(() => {
    const metaDescription = blogData.description || 
      `${blogData.title} - Discover insights about ${blogData.category || 'travel'} in Nepal. ${blogData.content.substring(0, 150)}... Read more on Brothers Holidays blog.`;

    updateMetaData({
      title: blogData.title,
      description: metaDescription,
      keywords: [
        blogData.title.toLowerCase(),
        blogData.category?.toLowerCase() || 'travel',
        'nepal travel blog',
        'travel tips',
        'brothers holidays blog',
        'nepal tourism',
        ...(blogData.tags?.map(tag => tag.toLowerCase()) || []),
      ],
      canonical: `https://brothers-holidays.vercel.app/blogs/${blogData.slug}`,
      openGraph: {
        title: blogData.title,
        description: metaDescription,
        type: 'article',
      },
    });
  }, [blogData, updateMetaData]);
};

export default useSEO;
