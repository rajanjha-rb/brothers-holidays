# Media Functionality

## Overview
The media functionality allows administrators to manage images stored in the Appwrite storage bucket. This includes uploading, viewing, downloading, and deleting images.

## Features

### 1. Image Upload
- Upload images through the dashboard interface
- Supports common image formats (JPG, PNG, GIF, JPEG, WEBP, HEIC)
- File validation to ensure only images are uploaded
- Progress indication during upload

### 2. Image Management
- Grid view of all uploaded images
- Hover effects with action buttons (View, Download, Delete)
- Image preview with file information
- Responsive design for different screen sizes

### 3. Image Operations
- **View**: Open image in new tab for full-size viewing
- **Download**: Download image to local device
- **Delete**: Remove image from storage with confirmation

## API Endpoints

### List Media Files
```
GET /api/media/list
```
Returns all images stored in the featuredImage bucket.

### Upload Image
```
POST /api/media/upload
```
Uploads a new image to the storage bucket.
- **Body**: FormData with 'file' field
- **Response**: Uploaded file information

### Delete Image
```
DELETE /api/media/delete
```
Deletes an image from the storage bucket.
- **Body**: JSON with 'fileId' field

## Storage Configuration

The media functionality uses the same storage bucket (`featuredImage`) that's used for blog featured images. This ensures consistency across the application.

### Storage Bucket Details
- **Bucket Name**: `featuredImage`
- **Permissions**: Users can create, read, update, and delete files
- **Allowed Formats**: jpg, png, gif, jpeg, webp, heic

## Usage

1. Navigate to the dashboard
2. Click on "Media" in the sidebar
3. Use the file input to select an image
4. Click "Upload" to add the image to storage
5. View, download, or delete images using the hover controls

## Integration with Blog System

The media functionality is integrated with the blog system:
- Blog posts can reference images from the media library
- Featured images for blogs are stored in the same bucket
- Consistent URL structure for all media files

## Environment Variables

Ensure these environment variables are set:
- `NEXT_PUBLIC_APPWRITE_HOST_URL`: Appwrite endpoint
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Appwrite project ID
- `APPWRITE_API_KEY`: Appwrite API key for server operations

## Dependencies

- `react-hot-toast`: For toast notifications
- `react-icons`: For UI icons
- Appwrite SDK: For storage operations 