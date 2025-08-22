# Troubleshooting Package Creation

## Quick Diagnosis Steps

### 1. Check API Status
Visit: `http://localhost:3000/api/packages/test`
**Expected**: `{"success":true,"message":"Package collection is accessible"}`

### 2. Test API Directly
Run this command in terminal:
```bash
curl -X POST "http://localhost:3000/api/packages/create" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Package",
    "overview": "Testing via API",
    "costInclude": ["Test Item"],
    "costExclude": [],
    "itinerary": [{"day": 1, "title": "Test Day", "description": "Test description"}],
    "featuredImage": "test-image",
    "featuredImageBucket": "featuredImage",
    "galleryImages": [],
    "faq": [],
    "tags": ["test"],
    "duration": "1 day",
    "location": "Test",
    "price": "$100"
  }'
```

### 3. Frontend Debugging

#### A. Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Try creating a package
4. Look for any red error messages

#### B. Check Network Tab
1. Open browser dev tools (F12)
2. Go to Network tab
3. Try creating a package
4. Look for the POST request to `/api/packages/create`
5. Check the response status and body

#### C. Common Form Issues
- ❌ **Missing Package Name**: Required field
- ❌ **No Featured Image**: Must select an image
- ❌ **No Itinerary Days**: Must add at least one day
- ❌ **Not Logged In**: Must be authenticated as admin

### 4. Admin Authentication Check
1. Go to `/dashboard`
2. If redirected to login, you need to authenticate
3. Make sure your user has admin privileges

### 5. Form Validation Checklist
Before submitting, ensure:
- ✅ Package name is not empty
- ✅ Featured image is selected
- ✅ At least one itinerary day is added
- ✅ All required fields are filled

### 6. Debug Tools in Form
The Add New Package page has debug buttons:
- **Test DB**: Check database connection
- **Test Packages API**: Verify package collection
- **Force Reinit DB**: Reset if needed

### 7. Common Error Messages

#### "Package name is required"
- Fill in the package name field

#### "Featured image is required"
- Click "Select Featured Image" and choose an image

#### "At least one itinerary day is required"
- Add a day in the itinerary section

#### "Database schema error"
- Click "Force Reinit DB" button

#### "Permission denied"
- Log in as admin user

#### "Failed to initialize database"
- Check environment variables
- Try "Test DB" button

### 8. Environment Check
Ensure these environment variables are set:
- `NEXT_PUBLIC_APPWRITE_HOST_URL`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` (optional)

### 9. If All Else Fails
1. Click "Full DB Reset" button
2. Refresh the page
3. Try creating a simple package with minimal data

### 10. Get Detailed Error Info
Add this to browser console to see full error details:
```javascript
// Monitor fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args);
  return originalFetch.apply(this, arguments)
    .then(response => {
      console.log('Fetch response:', response);
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};
```

This will log all API requests and responses to help identify the issue.
