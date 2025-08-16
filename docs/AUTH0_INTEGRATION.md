# Auth0 Integration

This application now supports Auth0 authentication as the primary authentication provider.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Auth0 Configuration (Required for production)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier

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

## Features

### Authentication Flow

- **Production**: Full Auth0 OAuth flow with login/logout
- **Development**: Falls back to environment token when Auth0 is not configured

### User Interface

- **Login Page**: Displayed when user is not authenticated
- **User Menu**: Shows user profile and logout option in the header
- **Loading States**: Proper loading indicators during authentication

### Backward Compatibility

The integration maintains the existing `session` interface:

```typescript
interface AuthSession {
  accessToken: string;  // Used for API calls
  user?: User;         // Auth0 user information (optional)
}
```

This ensures that existing code continues to work without modifications.

## Development Mode

When Auth0 is not configured (missing VITE_AUTH0_DOMAIN or VITE_AUTH0_CLIENT_ID), the application automatically falls back to development mode:

- Uses VITE_LANGSMITH_API_KEY as the access token
- Shows "Auth0 not configured, using development fallback auth" warning
- User menu shows generic "User" name
- Logout function shows warning instead of redirecting

## Production Deployment

For production deployment:

1. Configure Auth0 environment variables
2. Add your production domain to Auth0 application settings
3. The application will automatically use Auth0 authentication flow

## Error Handling

The integration includes comprehensive error handling:

- Authentication errors are displayed to users
- Network errors during token refresh
- Graceful fallback to development mode when Auth0 is not configured