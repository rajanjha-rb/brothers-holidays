# Package Collection Structure

## Overview
The package collection has been completely redesigned to match the UI structure of the "Add New Package" form. The collection will be automatically deleted and recreated with the proper schema.

## Collection Details
- **Collection Name**: `packages`
- **Display Name**: "Packages"
- **Permissions**: Read (any), Create/Update/Delete (users)

## Attributes

### Basic Information
- `name` (string, 255 chars, required) - Package name
- `duration` (string, 100 chars, optional) - e.g., "7 days", "2 weeks"
- `location` (string, 255 chars, optional) - e.g., "Paris, France"
- `price` (string, 100 chars, optional) - e.g., "$999", "€799"

### Package Overview
- `overview` (string, 65535 chars, optional) - Rich text editor content with detailed description

### Cost Details
- `costInclude` (string array, 500 chars per item, optional) - What's included in the price
- `costExclude` (string array, 500 chars per item, optional) - What's not included in the price

### Itinerary
- `itinerary` (string array, 65535 chars per item, optional) - Day-by-day breakdown as JSON strings

### Images
- `featuredImage` (string, 255 chars, optional) - Main package image ID
- `featuredImageBucket` (string, 100 chars, optional) - Storage bucket for featured image
- `galleryImages` (string array, 255 chars per item, optional) - Additional image IDs

### Metadata
- `tags` (string array, 100 chars per item, optional) - Package tags for categorization
- `faq` (string array, 65535 chars per item, optional) - FAQ items as JSON strings

## Indexes
- `name_index` (Fulltext) - Search by package name
- `location_index` (Key) - Filter by location
- `duration_index` (Key) - Filter by duration
- `price_index` (Key) - Filter by price
- `tags_index` (Key) - Filter by tags
- `created_at_index` (Key) - Sort by creation date
- `updated_at_index` (Key) - Sort by update date

## Data Structure Examples

### Itinerary Item
```json
{
  "day": 1,
  "title": "Arrival in Kathmandu",
  "description": "Welcome to Nepal! Transfer to hotel and orientation briefing."
}
```

### FAQ Item
```json
{
  "question": "What's included in the package?",
  "answer": "Hotel accommodation, daily breakfast, airport transfers, and guided tours."
}
```

### Cost Include/Exclude
```json
["Hotel accommodation", "Daily breakfast", "Airport transfers"]
```

## Usage

### Initialize Collection
```bash
POST /api/packages/init
```

### Test Collection
```bash
GET /api/packages/test
```

### Create Package
```bash
POST /api/packages/create
```

## Notes
- The collection is automatically recreated when the database is initialized
- All existing data will be lost during recreation
- The schema matches exactly with the UI form fields
- Array attributes are properly configured for complex data structures
- Full-text search is enabled for package names
- Proper indexing ensures efficient querying and filtering
