# SEO Implementation Guide

This guide explains how to implement and use the comprehensive SEO system we've added to Brothers Holidays.

## 🚀 New Packages Added

- **`next-seo`**: Advanced SEO management with Next.js
- **`@next/mdx`**: Enhanced content management
- **`schema-dts`**: TypeScript types for structured data

## 📁 New Components Created

### 1. `SEO.tsx` - Main SEO Component
The core SEO component that handles all meta tags, Open Graph, Twitter cards, and structured data.

```tsx
import SEO from '@/components/SEO';

// Basic usage
<SEO 
  title="Page Title"
  description="Page description for SEO"
  keywords={['keyword1', 'keyword2']}
/>

// Advanced usage with structured data
<SEO 
  title="Tour Package"
  description="Amazing tour description"
  structuredData={{
    type: 'tour',
    data: tourStructuredData
  }}
/>
```

### 2. `PackageSEO.tsx` - Specialized for Travel Packages
Automatically generates tour-specific meta descriptions and structured data.

```tsx
import PackageSEO from '@/components/PackageSEO';

<PackageSEO 
  packageData={{
    id: "package-123",
    title: "Everest Base Camp Trek",
    description: "Experience the ultimate adventure...",
    slug: "everest-base-camp-trek",
    price: "$1500",
    duration: "14 days",
    location: "Everest Region",
    featuredImage: "/images/everest.jpg"
  }}
/>
```

### 3. `BlogSEO.tsx` - Specialized for Blog Posts
Optimized for blog articles with article-specific structured data.

```tsx
import BlogSEO from '@/components/BlogSEO';

<BlogSEO 
  blogData={{
    id: "blog-123",
    title: "Best Time to Visit Nepal",
    description: "Discover the perfect season...",
    slug: "best-time-visit-nepal",
    content: "Full blog content...",
    author: "Travel Expert",
    datePublished: "2024-01-15",
    tags: ["travel tips", "nepal", "seasonal"],
    category: "Travel Guide"
  }}
/>
```

## 🪝 Custom Hooks

### 1. `useSEO` - Main SEO Hook
Dynamic SEO management with automatic route change handling.

```tsx
import { useSEO } from '@/hooks/useSEO';

const MyComponent = () => {
  const { metaData, updateMetaData, resetMetaData } = useSEO();
  
  const updateTitle = () => {
    updateMetaData({ title: "New Title" });
  };
  
  return <div>...</div>;
};
```

### 2. `usePackageSEO` - Package-Specific SEO
Automatically updates SEO for package pages.

```tsx
import { usePackageSEO } from '@/hooks/useSEO';

const PackagePage = ({ packageData }) => {
  usePackageSEO(packageData);
  
  return <div>Package content...</div>;
};
```

### 3. `useBlogSEO` - Blog-Specific SEO
Automatically updates SEO for blog posts.

```tsx
import { useBlogSEO } from '@/hooks/useSEO';

const BlogPost = ({ blogData }) => {
  useBlogSEO(blogData);
  
  return <div>Blog content...</div>;
};
```

## 🗺️ Sitemap Generation

### Static Sitemap
Located at `src/app/sitemap.ts`, automatically generates sitemap.xml.

### Dynamic Sitemap Entries
Helper functions for generating sitemaps for dynamic content:

```tsx
import { 
  generatePackageSitemapEntries,
  generateBlogSitemapEntries 
} from '@/lib/sitemap';

// Generate package sitemap entries
const packageEntries = generatePackageSitemapEntries(packages);

// Generate blog sitemap entries
const blogEntries = generateBlogSitemapEntries(blogs);
```

## 📊 Structured Data

The system automatically generates structured data for:

- **Organization**: Company information
- **Website**: Site metadata
- **Breadcrumbs**: Navigation structure
- **Articles**: Blog posts
- **Tours**: Travel packages

## 🔧 Implementation Examples

### Example 1: Package Detail Page
```tsx
import PackageSEO from '@/components/PackageSEO';

const PackageDetailPage = ({ packageData }) => {
  return (
    <>
      <PackageSEO packageData={packageData} />
      <div>Package content...</div>
    </>
  );
};
```

### Example 2: Blog Post Page
```tsx
import BlogSEO from '@/components/BlogSEO';

const BlogPostPage = ({ blogData }) => {
  return (
    <>
      <BlogSEO blogData={blogData} />
      <div>Blog content...</div>
    </>
  );
};
```

### Example 3: Custom SEO Page
```tsx
import SEO from '@/components/SEO';

const CustomPage = () => {
  return (
    <>
      <SEO 
        title="Custom Page"
        description="This is a custom page with specific SEO"
        keywords={['custom', 'page', 'seo']}
        openGraph={{
          title: "Custom Page",
          description: "Custom page description",
          images: [{
            url: "/custom-image.jpg",
            width: 1200,
            height: 630,
            alt: "Custom page image"
          }]
        }}
      />
      <div>Custom page content...</div>
    </>
  );
};
```

## 📈 SEO Benefits

1. **Meta Descriptions**: Automatically generated for all content types
2. **Structured Data**: Rich snippets in search results
3. **Open Graph**: Better social media sharing
4. **Twitter Cards**: Optimized Twitter sharing
5. **Sitemaps**: Better search engine indexing
6. **Canonical URLs**: Prevents duplicate content issues
7. **Keywords**: Targeted keyword optimization
8. **Breadcrumbs**: Better navigation and SEO

## 🚀 Best Practices

1. **Always use the appropriate SEO component** for your content type
2. **Provide unique descriptions** for each page
3. **Use relevant keywords** naturally in your content
4. **Include featured images** for better social sharing
5. **Keep descriptions under 160 characters** for optimal display
6. **Use canonical URLs** to prevent duplicate content
7. **Regularly update sitemaps** when adding new content

## 🔍 Testing SEO

1. **Google Rich Results Test**: Test structured data
2. **Facebook Sharing Debugger**: Test Open Graph
3. **Twitter Card Validator**: Test Twitter cards
4. **Google Search Console**: Monitor search performance
5. **Lighthouse**: Audit SEO scores

## 📝 Next Steps

1. **Implement in existing pages**: Replace current meta tags with SEO components
2. **Add dynamic sitemap generation**: Connect to your database
3. **Monitor performance**: Use Google Search Console and Analytics
4. **Optimize content**: Use generated meta descriptions as starting points
5. **A/B test**: Test different meta descriptions for better CTR

This SEO system provides a solid foundation for improving your search engine rankings and social media presence. Start implementing it page by page, and you'll see improvements in your organic traffic and social sharing engagement.
