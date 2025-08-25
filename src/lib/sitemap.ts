import { MetadataRoute } from 'next';

// Base URL for the website
const baseUrl = 'https://brothers-holidays.vercel.app';

// Static pages that should be included in sitemap
const staticPages = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: `${baseUrl}/packages`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: `${baseUrl}/destinations`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: `${baseUrl}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/blogs`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: `${baseUrl}/team`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/trips`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
];

// Function to generate sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages,
    // Note: Dynamic routes (packages/[id]/[slug], blogs/[slug], etc.) 
    // should be added here when implementing dynamic sitemap generation
    // This would typically involve fetching data from your database
  ];
}

// Function to generate robots.txt content
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and auth pages
Disallow: /admin/
Disallow: /(auth)/
Disallow: /api/

# Allow important pages
Allow: /packages/
Allow: /destinations/
Allow: /blogs/
Allow: /about/
Allow: /contact/
Allow: /team/
Allow: /trips/

# Crawl delay (optional)
Crawl-delay: 1
`;
}

// Function to generate package-specific sitemap entries
export function generatePackageSitemapEntries(packages: Array<{
  id: string;
  slug: string;
  lastModified?: Date;
}>): MetadataRoute.Sitemap {
  return packages.map(pkg => ({
    url: `${baseUrl}/packages/${pkg.id}/${pkg.slug}`,
    lastModified: pkg.lastModified || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}

// Function to generate blog-specific sitemap entries
export function generateBlogSitemapEntries(blogs: Array<{
  slug: string;
  lastModified?: Date;
}>): MetadataRoute.Sitemap {
  return blogs.map(blog => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: blog.lastModified || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}

// Function to generate destination-specific sitemap entries
export function generateDestinationSitemapEntries(destinations: Array<{
  id: string;
  slug: string;
  lastModified?: Date;
}>): MetadataRoute.Sitemap {
  return destinations.map(destination => ({
    url: `${baseUrl}/destinations/${destination.id}/${destination.slug}`,
    lastModified: destination.lastModified || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}

// Function to generate trip-specific sitemap entries
export function generateTripSitemapEntries(trips: Array<{
  id: string;
  slug: string;
  lastModified?: Date;
}>): MetadataRoute.Sitemap {
  return trips.map(trip => ({
    url: `${baseUrl}/trips/${trip.id}/${trip.slug}`,
    lastModified: trip.lastModified || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}
