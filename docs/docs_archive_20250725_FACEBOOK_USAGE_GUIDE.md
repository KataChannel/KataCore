# Facebook Social Module - Usage Examples

## 🔧 API Usage Examples

### 1. Get All Facebook Pages
```bash
curl "http://localhost:3000/api/social/facebook?type=pages"
```

### 2. Get Comments for a Specific Page
```bash
curl "http://localhost:3000/api/social/facebook?type=comments&pageId=YOUR_PAGE_ID&limit=20"
```

### 3. Get Messages for a Specific Page
```bash
curl "http://localhost:3000/api/social/facebook?type=messages&pageId=YOUR_PAGE_ID&limit=10"
```

### 4. Get Comprehensive Interactions Table
```bash
# Basic request
curl "http://localhost:3000/api/social/facebook?type=interactions"

# With pagination
curl "http://localhost:3000/api/social/facebook?type=interactions&page=2&limit=10"

# With search
curl "http://localhost:3000/api/social/facebook?type=interactions&search=john&page=1&limit=10"

# Filter by specific page
curl "http://localhost:3000/api/social/facebook?type=interactions&pageId=YOUR_PAGE_ID"

# Combined filters
curl "http://localhost:3000/api/social/facebook?type=interactions&pageId=YOUR_PAGE_ID&search=phone&page=1&limit=5"
```

## 🎯 Frontend Usage

### Access the Module
Navigate to: `http://localhost:3000/admin/social/facebook`

### Tab Navigation:
1. **Fanpages Tab** - View and manage all Facebook pages
2. **Comprehensive Table Tab** - Main data table with search and pagination
3. **Posts Tab** - View posts (existing functionality)
4. **Messages Tab** - View conversations and messages

### Using the Comprehensive Table:
1. **Search**: Type in the search box and press Enter or click Search button
2. **Filter by Page**: Select a page from the dropdown
3. **Pagination**: Use Previous/Next buttons or click page numbers
4. **View Profile**: Click "View Profile" links to open Facebook profiles

## 📊 Data Fields Explained

### Comprehensive Table Columns:
- **Fanpage**: Name of the Facebook page where interaction occurred
- **Full Name**: User's display name from Facebook
- **Phone Number**: Extracted from comments/messages (shows "N/A" if not found)
- **Facebook Link**: Direct link to user's Facebook profile
- **First Interaction Date**: When user first commented/messaged
- **Last Interaction Date**: Most recent interaction
- **Total Interactions**: Number of comments/messages from this user

### Phone Number Extraction:
The system automatically extracts Vietnamese phone numbers from message text using this pattern:
- Formats supported: `+84xxxxxxxxx`, `84xxxxxxxxx`, `0xxxxxxxxx`
- Length: 9-10 digits after country code
- Example matches: `+84901234567`, `84901234567`, `0901234567`

## 🔧 Configuration

### Environment Variables:
```env
NEXT_PUBLIC_FACEBOOK_PAGE_ID=your_page_id_here
NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_FACEBOOK_API_VERSION=v18.0
```

### Facebook API Permissions Required:
- `pages_read_engagement` - Read page posts, comments
- `pages_messaging` - Read page messages
- `pages_show_list` - List pages user manages

## 🚨 Error Handling

### Common Response Statuses:
- `no_credentials` - Facebook API credentials not configured
- `api_error` - Facebook API returned an error
- `connection_error` - Network/connection issues
- `database_error` - Database operation failed
- `success` - Operation completed successfully

### Example Error Response:
```json
{
  "data": [],
  "message": "Facebook API credentials not configured. No data available.",
  "status": "no_credentials"
}
```

## 🎯 Testing Checklist

### Before Production:
- [ ] Configure Facebook API credentials
- [ ] Test with real Facebook page
- [ ] Verify phone number extraction accuracy
- [ ] Test pagination with large datasets
- [ ] Verify search functionality
- [ ] Check error handling with invalid inputs
- [ ] Test all tab navigation
- [ ] Verify responsive design on mobile

### Test Data Sources:
- Real Facebook page with comments and messages
- Users who have included phone numbers in their interactions
- Large enough dataset to test pagination (50+ interactions)

## 📈 Performance Notes

### Optimization Tips:
- API calls are made on-demand (not automatically)
- Database stores interactions to reduce Facebook API calls
- Pagination limits database queries
- Search is performed on database, not Facebook API

### Monitoring:
- Watch Facebook API rate limits
- Monitor database performance with large datasets
- Check for duplicate interaction storage
