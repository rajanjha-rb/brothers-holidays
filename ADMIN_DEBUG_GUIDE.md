# Admin Status Debugging Guide

## Issue Description
The user has set the "admin" label in Appwrite but admin features are not working.

## Debugging Steps

### 1. Check the Test Auth Page
Go to `/test-auth` in your browser to see detailed debug information:
- Current auth state
- User labels (raw data)
- Admin status details
- Debug buttons to force refresh

### 2. Check Browser Console
Open browser developer tools and look for these console logs:
- `🔍 Performing fresh auth check`
- `🔍 Performing fresh admin check`
- `🔍 Admin check:` (with detailed user data)
- `🔍 Using cached admin status`

### 3. Force Admin Refresh
On the `/test-auth` page, click the "Force Admin Refresh" button to clear cached admin status and force a fresh check.

### 4. Clear Auth State
If issues persist, click "Clear Auth State" to completely reset the auth state and start fresh.

### 5. Check Appwrite User Data
Verify in Appwrite console that:
- User has the "admin" label assigned
- Label is exactly "admin" (case sensitive)
- User is properly authenticated

### 6. Manual Debugging
Use the browser console to manually check:
```javascript
// Get current auth state
const authState = useAuthStore.getState();
console.log('Current auth state:', authState);

// Check user labels
console.log('User labels:', authState.user?.labels);

// Force admin check
authState.checkAdminStatus();
```

## Common Issues and Solutions

### Issue 1: Cached Admin Status
**Problem**: Admin status is cached and not updating
**Solution**: Use "Force Admin Refresh" button or clear auth state

### Issue 2: Wrong Label Format
**Problem**: Label might be "Admin" instead of "admin"
**Solution**: Check console logs for label details, ensure label is exactly "admin"

### Issue 3: User Not Loaded
**Problem**: User object is null or incomplete
**Solution**: Check if user is properly authenticated, try logging out and back in

### Issue 4: Appwrite API Issues
**Problem**: User data not being fetched correctly
**Solution**: Check network tab for API errors, verify Appwrite configuration

## Debug Information

The system checks for admin status in multiple ways:
1. Exact match: `labels.includes('admin')`
2. Case variations: `labels.includes('Admin')`, `labels.includes('ADMIN')`
3. Case-insensitive: `labels.some(label => label.toLowerCase() === 'admin')`

## Files to Check

1. **`src/store/auth.ts`** - Main admin detection logic
2. **`src/app/test-auth/page.tsx`** - Debug page
3. **`src/app/components/Navbar.tsx`** - Admin UI elements
4. **`src/app/(main)/dashboard/layout.tsx`** - Admin route protection

## Expected Behavior

When admin status is working correctly:
- Console shows: `🔍 Admin check: { hasAdminLabel: true, ... }`
- `/test-auth` page shows: "Is Admin: Yes"
- Dashboard link appears in navbar
- Admin controls appear on blog pages 