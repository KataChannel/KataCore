# Facebook Configuration with localStorage

## Overview
The Facebook Social Media Management module now supports dynamic configuration using browser localStorage. This allows users to set Facebook API credentials directly from the UI without needing access to environment variables.

## How It Works

### 1. Configuration UI
- Navigate to `/admin/social/facebook`
- Click "Show Config" to expand the configuration section
- Enter your Facebook Page ID and Access Token
- Click "Save Configuration" to store in localStorage

### 2. Default Values Available
The system includes quick setup with these default values:
- **Page ID**: `593555107170691`
- **Access Token**: `EAAIZCuUzXcokBP...` (full token provided in UI)

### 3. Priority Order
The system uses credentials in this priority order:
1. **localStorage values** (set via UI) - Highest priority
2. **Environment variables** - Fallback

### 4. API Integration
- Frontend sends localStorage values as HTTP headers to the API
- Headers used: `X-Facebook-Page-Id` and `X-Facebook-Access-Token`
- API route automatically uses these values when available

## Usage Instructions

### Setting Up Configuration
1. Open the Facebook social management page
2. Click "Show Config" button
3. Enter your credentials:
   - Facebook Page ID (e.g., 593555107170691)
   - Facebook Access Token (long-lived token)
4. Click "Save Configuration"
5. The system will immediately start using these values

### Quick Setup
1. Click "Show Config"
2. Click "Use Default Values" button
3. Click "Save Configuration"

### Clearing Configuration
1. Click "Show Config"
2. Click "Clear Configuration"
3. Confirm the action
4. System will fall back to environment variables

## Visual Indicators

### Configuration Status
- 🟢 Green dot: Value configured and active
- 🔴 Red dot: Value not configured
- Labels show "(localStorage)" when using browser-stored values

### Data Source Indicators
- Yellow warning: Shows when using mock data
- Updated message includes localStorage configuration option

## Technical Details

### localStorage Keys
- `NEXT_PUBLIC_FACEBOOK_PAGE_ID`: Stores the Facebook Page ID
- `NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN`: Stores the Facebook Access Token

### API Headers
- `X-Facebook-Page-Id`: Sent with each API request
- `X-Facebook-Access-Token`: Sent with each API request

### Error Handling
- Invalid tokens will show appropriate error messages
- Failed API calls will indicate credential issues
- Clear success/error messages for configuration actions

## Benefits

1. **No Server Access Required**: Users can configure without touching environment files
2. **Immediate Effect**: Changes take effect immediately without restart
3. **User-Friendly**: Simple UI for non-technical users
4. **Flexible**: Supports both localStorage and traditional env var configuration
5. **Secure**: Values stored locally in user's browser only

## Security Notes

- localStorage values are stored in the user's browser only
- Values are sent as HTTP headers (use HTTPS in production)
- Access tokens should be long-lived Facebook page tokens
- Consider token expiration and renewal procedures

## Troubleshooting

### Common Issues
1. **"Mock data" warning**: Configure Page ID and Access Token
2. **API errors**: Check token validity and permissions
3. **No data returned**: Verify Page ID is correct
4. **Permission errors**: Ensure token has required Facebook permissions

### Required Facebook Permissions
- `pages_read_engagement`: Read page posts and comments
- `pages_messaging`: Read page messages
- `pages_show_list`: List managed pages

## Migration from Environment Variables

If you were previously using environment variables:
1. Your existing setup will continue to work
2. localStorage values will override env vars when set
3. You can gradually migrate users to localStorage configuration
4. Environment variables serve as fallback values
