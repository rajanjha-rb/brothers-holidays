# Environment Setup for On-Demand Revalidation

## 🔧 **Required Environment Variables**

Add these to your `.env.local` file:

```env
# Revalidation secret (change this to a secure random string)
REVALIDATION_SECRET=your-super-secret-key-here-123

# Your website URL (for development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🚀 **For Production**

When deploying to production, update your environment variables:

```env
# Production revalidation secret (use a strong random string)
REVALIDATION_SECRET=your-production-secret-key-456

# Your production domain
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🔐 **Generate a Secure Secret**

You can generate a secure secret using:

```bash
# In your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use any secure random string generator.

## ✅ **Test the Setup**

1. Add the environment variables to `.env.local`
2. Restart your development server
3. Try editing/deleting a blog
4. Changes should appear instantly!

## 🎯 **What This Enables**

With these environment variables set, your blog will have:

- ⚡ **Instant updates** when you edit blogs
- 🚀 **Immediate revalidation** when you delete blogs
- 🔧 **Secure API endpoints** for revalidation
- 💰 **Cost-efficient** updates (no background polling)

## 📝 **Example .env.local**

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=your-appwrite-endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Revalidation Configuration
REVALIDATION_SECRET=your-super-secret-key-here-123
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

That's it! Your blog now has instant updates! 🎉 