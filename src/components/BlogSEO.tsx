import React from 'react';
import SEO, { generateStructuredData } from './SEO';

export interface BlogSEOProps {
  blogData: {
    id: string;
    title: string;
    description: string;
    slug: string;
    content: string;
    featuredImage?: string;
    author?: string;
    datePublished: string;
    tags?: string[];
    category?: string;
  };
  canonical?: string;
}

export const BlogSEO: React.FC<BlogSEOProps> = ({ blogData, canonical }) => {
  const {
    title,
    description,
    slug,
    content,
    featuredImage,
    author = 'Brothers Holidays',
    datePublished,
    tags = [],
    category,
  } = blogData;

  // Generate blog-specific meta description
  const metaDescription = description || 
    `${title} - Discover insights about ${category || 'travel'} in Nepal. ${content.substring(0, 150)}... Read more on Brothers Holidays blog.`;

  // Generate blog-specific keywords
  const blogKeywords = [
    title.toLowerCase(),
    category?.toLowerCase() || 'travel',
    'nepal travel blog',
    'travel tips',
    'brothers holidays blog',
    'nepal tourism',
    ...tags.map(tag => tag.toLowerCase()),
  ].filter(Boolean);

  // Generate structured data for the blog article
  const articleStructuredData = generateStructuredData.article({
    title: title,
    description: metaDescription,
    url: canonical || `https://brothers-holidays.vercel.app/blogs/${slug}`,
    image: featuredImage,
    author: author,
    datePublished: datePublished,
  });

  // Generate breadcrumb structured data
  const breadcrumbData = generateStructuredData.breadcrumb([
    { name: 'Home', url: 'https://brothers-holidays.vercel.app' },
    { name: 'Blog', url: 'https://brothers-holidays.vercel.app/blogs' },
    { name: title, url: canonical || `https://brothers-holidays.vercel.app/blogs/${slug}` },
  ]);

  return (
    <>
      <SEO
        title={title}
        description={metaDescription}
        keywords={blogKeywords}
        canonical={canonical}
        openGraph={{
          title: title,
          description: metaDescription,
          url: canonical || `https://brothers-holidays.vercel.app/blogs/${slug}`,
          images: featuredImage ? [
            {
              url: featuredImage,
              width: 1200,
              height: 630,
              alt: `${title} - Brothers Holidays Blog`,
            },
          ] : undefined,
          type: 'article',
        }}
        twitter={{
          title: title,
          description: metaDescription,
          images: featuredImage ? [featuredImage] : undefined,
        }}
        structuredData={{
          type: 'article',
          data: articleStructuredData,
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

export default BlogSEO;
