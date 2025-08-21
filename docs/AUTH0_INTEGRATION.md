# Auth0 Integration

This application now supports Auth0 authentication as the primary authentication provider with intelligent fallback for development environments.

## Features

### Authentication Modes

The application supports three authentication modes:

1. **Full Auth0 Mode** (Production/Staging):
   - Requires valid Auth0 configuration
   - Forces users to authenticate through Auth0
   - Best for production deployments

2. **Hybrid Mode** (Development with Auth0):
   - Auth0 configured but allows development fallback
   - Tries Auth0 first, falls back to development token if needed
   - Good for testing Auth0 integration during development

3. **Development-only Mode**:
   - No Auth0 configuration required
   - Uses LangSmith API key or demo token
   - Shows simulated login/logout for testing UI

### Authentication Flow

- **Production**: Full Auth0 OAuth flow with login/logout
- **Development**: Falls back to environment token when Auth0 is not configured or fails
- **Hybrid**: Attempts Auth0, gracefully falls back to development token

### User Interface

- **Login Page**: Displayed when user is not authenticated with clear status indicators
- **User Menu**: Shows user profile, session type, and logout option in the header
- **Session Indicators**: Visual indicators show whether using Auth0 or development session
- **Loading States**: Proper loading indicators during authentication
- **Error Handling**: Clear error messages with development guidance

### Session Types

The application clearly distinguishes between session types:

```typescript
interface AuthSession {
  accessToken: string;  // Used for API calls
  user?: User;         // Auth0 user information (optional)  
  isAuth0?: boolean;   // True for Auth0 sessions
  isDevelopment?: boolean; // True for development sessions
}
```

- **Auth0 Sessions**: Green indicator, shows real user profile
- **Development Sessions**: Yellow indicator, shows "User" placeholder

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Auth0 Configuration (Required for production)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier

# Force Auth0 authentication (optional)
VITE_FORCE_AUTH0_LOGIN=true

# LangGraph Configuration (Required)
VITE_DEPLOYMENT_URL=http://127.0.0.1:2024
VITE_AGENT_ID=deepagent

# LangSmith API Key (Optional - for development fallback)
VITE_LANGSMITH_API_KEY=your-langsmith-api-key
```

### Auth0 Setup

1. **Create an Auth0 Application:**
   - Go to your Auth0 Dashboard
   - Create a new Single Page Application (SPA)
   - Note your Domain and Client ID

2. **Configure Application URLs:**
   - Allowed Callback URLs: `http://localhost:3000, https://your-production-domain.com`
   - Allowed Logout URLs: `http://localhost:3000, https://your-production-domain.com`
   - Allowed Web Origins: `http://localhost:3000, https://your-production-domain.com`

3. **API Configuration (Optional):**
   - Create an API in Auth0 if you need to validate tokens on your backend
   - Set the VITE_AUTH0_AUDIENCE to your API identifier

### Configuration Examples

#### Production Configuration
```bash
VITE_AUTH0_DOMAIN=mycompany.auth0.com
VITE_AUTH0_CLIENT_ID=abc123def456
VITE_AUTH0_AUDIENCE=https://api.myapp.com
VITE_FORCE_AUTH0_LOGIN=true
VITE_DEPLOYMENT_URL=https://api.myapp.com
VITE_AGENT_ID=production-agent
```

#### Development with Auth0 Testing
```bash
VITE_AUTH0_DOMAIN=mycompany-dev.auth0.com
VITE_AUTH0_CLIENT_ID=dev123test456
VITE_FORCE_AUTH0_LOGIN=false
VITE_DEPLOYMENT_URL=http://127.0.0.1:2024
VITE_AGENT_ID=deepagent
VITE_LANGSMITH_API_KEY=dev-token
```

#### Development-only Mode
```bash
# No Auth0 configuration
VITE_DEPLOYMENT_URL=http://127.0.0.1:2024
VITE_AGENT_ID=deepagent
VITE_LANGSMITH_API_KEY=demo-token
```

## Development Mode

When Auth0 is not configured (missing VITE_AUTH0_DOMAIN or VITE_AUTH0_CLIENT_ID), the application automatically falls back to development mode:

- Uses VITE_LANGSMITH_API_KEY or "demo-token" as the access token
- Shows "Auth0 not configured, using development fallback auth" warning
- User menu shows "Development Session" status
- Login/logout functions work but show warnings instead of redirecting

## Authentication Control

### Force Auth0 Login

Set `VITE_FORCE_AUTH0_LOGIN=true` to force Auth0 authentication even in development:

- Prevents automatic fallback to development tokens
- Shows login page when Auth0 is not authenticated
- Useful for testing the complete Auth0 flow

### Development Fallback

Set `VITE_FORCE_AUTH0_LOGIN=false` (or omit) to allow development fallback:

- Tries Auth0 authentication first
- Falls back to development token if Auth0 fails or user is not authenticated
- Shows clear session type indicators

## User Interface Features

### Login Page Enhancements

The login page shows:
- Application title and description
- Current authentication mode (Auth0/Development)
- Auth0 domain being used (in development mode)
- Instructions for switching modes
- Clear error messages with troubleshooting hints

### User Menu Enhancements

The user menu displays:
- User name and email (from Auth0 or placeholder)
- Session type indicator ("Auth0 Session" or "Development Session")
- Color-coded session indicator (green for Auth0, yellow for development)
- Settings and logout options

### Session Indicators

Visual indicators throughout the interface:
- Small colored dot on user avatar (green/yellow)
- Session type text in user menu
- Console warnings for development mode

## Error Handling

The integration includes comprehensive error handling:

- **Auth0 Connection Errors**: Clear messages when Auth0 domain is unreachable
- **Configuration Errors**: Helpful hints for common configuration issues
- **Development Guidance**: Instructions for switching between modes
- **Graceful Fallbacks**: Automatic fallback to development mode when appropriate

### Common Error Scenarios

1. **Invalid Auth0 Domain**: Shows connection error, suggests checking configuration
2. **Missing Client ID**: Falls back to development mode with warning
3. **Auth0 Service Down**: Falls back to development token if available
4. **Network Issues**: Retry functionality with clear progress indication

## Production Deployment

For production deployment:

1. **Configure Auth0 environment variables**
2. **Add your production domain to Auth0 application settings**
3. **Set VITE_FORCE_AUTH0_LOGIN=true**
4. **Remove or don't set VITE_LANGSMITH_API_KEY**
5. **The application will automatically use Auth0 authentication flow**

## Testing

### Testing Auth0 Integration

1. **Set up Auth0 test tenant**
2. **Configure test application**
3. **Set VITE_FORCE_AUTH0_LOGIN=true**
4. **Test login/logout flow**

### Testing Development Mode

1. **Remove Auth0 configuration**
2. **Set VITE_LANGSMITH_API_KEY**
3. **Test simulated login/logout**
4. **Verify session indicators**

### Testing Hybrid Mode

1. **Configure Auth0 (can be invalid)**
2. **Set VITE_FORCE_AUTH0_LOGIN=false**
3. **Set VITE_LANGSMITH_API_KEY**
4. **Test fallback behavior**

## Backward Compatibility

The integration maintains the existing `session` interface with enhancements:

```typescript
interface AuthSession {
  accessToken: string;  // Used for API calls (unchanged)
  user?: User;         // Auth0 user information (unchanged)
  isAuth0?: boolean;   // New: indicates Auth0 session
  isDevelopment?: boolean; // New: indicates development session
}
```

This ensures that existing code continues to work without modifications while providing new features for enhanced user experience.