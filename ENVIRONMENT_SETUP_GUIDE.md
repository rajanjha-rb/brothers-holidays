# Environment Setup Guide

## 🚨 **IMPORTANT: Your blogs are not showing because environment variables are missing!**

## 🔧 **Step 1: Create .env.local file**

Create a file named `.env.local` in your project root (same folder as `package.json`) with the following content:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_HOST_URL=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
APPWRITE_API_KEY=your-api-key-here

# Revalidation Configuration
REVALIDATION_SECRET=your-super-secret-key-here-123
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔑 **Step 2: Get Your Appwrite Credentials**

1. **Go to Appwrite Console**: https://cloud.appwrite.io
2. **Select your project**
3. **Go to Settings → API Keys**
4. **Copy your Project ID and API Key**

## 📝 **Step 3: Update .env.local**

Replace the placeholder values in your `.env.local` file:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_HOST_URL=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=64f8a1b2c3d4e5f6a7b8c9d0  # Your actual Project ID
APPWRITE_API_KEY=your-actual-api-key-here                 # Your actual API Key

# Revalidation Configuration
REVALIDATION_SECRET=your-super-secret-key-here-123
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔄 **Step 4: Restart Development Server**

```bash
npm run dev
```

## ✅ **Step 5: Test the Setup**

Visit these URLs to test if everything is working:

1. **Environment Check**: `http://localhost:3000/api/env-check`
2. **Database Init**: `http://localhost:3000/api/init-db`
3. **Test Blogs**: `http://localhost:3000/api/test-blogs`
4. **Blogs Page**: `http://localhost:3000/blogs`

## 🎯 **What This Fixes**

- ✅ **Blogs will appear** on `/blogs` page
- ✅ **Images will load** directly from Appwrite
- ✅ **Media upload** will work in dashboard
- ✅ **All functionality** will be restored

## 🚨 **Common Issues**

### Issue: "Project not found"
- **Solution**: Check your Project ID is correct

### Issue: "Unauthorized"
- **Solution**: Check your API Key is correct and has proper permissions

### Issue: "Environment variables not loading"
- **Solution**: Make sure `.env.local` is in the project root and restart the server

## 🔐 **API Key Permissions**

Your API Key needs these permissions:
- **Databases**: Read, Write, Delete
- **Storage**: Read, Write, Delete
- **Users**: Read (for authentication)

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify your Appwrite project is active
4. Make sure your API key has the right permissions 