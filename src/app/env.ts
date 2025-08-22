const env = {
  appwrite: {
    endpoint: String(process.env.NEXT_PUBLIC_APPWRITE_HOST_URL),
    projectId: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
    apikey: String(process.env.APPWRITE_API_KEY || '').split('NEXT_PUBLIC_APPWRITE_DATABASE_ID=')[0] || '',
    databaseId: String(process.env.APPWRITE_API_KEY || '').includes('NEXT_PUBLIC_APPWRITE_DATABASE_ID=') 
      ? String(process.env.APPWRITE_API_KEY || '').split('NEXT_PUBLIC_APPWRITE_DATABASE_ID=')[1] || 'brothers-holidays'
      : String(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brothers-holidays'),
    // Removed tinymce API key
  },
};

export default env;
