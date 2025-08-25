import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://brothers-holidays.vercel.app';
  
  // Static pages
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

  // Note: In a real implementation, you would fetch dynamic data from your database
  // For now, we'll return static pages. You can extend this by:
  // 1. Fetching packages from your database
  // 2. Fetching blogs from your database
  // 3. Fetching destinations from your database
  // 4. Fetching trips from your database
  
  // Example of how to add dynamic entries:
  // try {
  //   const packages = await fetchPackagesFromDatabase();
  //   const packageEntries = generatePackageSitemapEntries(packages);
  //   const blogs = await fetchBlogsFromDatabase();
  //   const blogEntries = generateBlogSitemapEntries(blogs);
  //   
  //   return [...staticPages, ...packageEntries, ...blogEntries];
  // } catch (error) {
  //   console.error('Error generating sitemap:', error);
  //   return staticPages;
  // }

  return staticPages;
}
