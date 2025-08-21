
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Auth0Provider, useAuth0, User } from "@auth0/auth0-react";

interface AuthSession {
  accessToken: string;
  user?: User;
  isAuth0?: boolean; // Flag to indicate if this is an Auth0 session
  isDevelopment?: boolean; // Flag to indicate if this is a development session
}

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  error: Error | null;
  login: () => void;
  logout: () => void;
  authProvider: 'auth0' | 'development' | 'none';
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: false,
  error: null,
  login: () => {},
  logout: () => {},
  authProvider: 'none',
});

function AuthProviderInner({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
    error,
  } = useAuth0();
  
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          // Try to get Auth0 token first
          const token = await getAccessTokenSilently();
          setSession({
            accessToken: token,
            user: user || undefined,
            isAuth0: true,
            isDevelopment: false,
          });
        } catch (error) {
          console.warn("Failed to get Auth0 token, falling back to env token:", error);
          // Fallback to environment token for development
          const fallbackToken = import.meta.env.VITE_LANGSMITH_API_KEY || "demo-token";
          setSession({
            accessToken: fallbackToken,
            user: user || undefined,
            isAuth0: false,
            isDevelopment: true,
          });
        }
      } else if (!isAuthenticated && !isLoading) {
        // For development, allow fallback to env token ONLY if explicitly allowed
        const allowDevFallback = import.meta.env.DEV && 
                                import.meta.env.VITE_LANGSMITH_API_KEY &&
                                import.meta.env.VITE_FORCE_AUTH0_LOGIN !== 'true';
        
        if (allowDevFallback) {
          console.warn("Auth0 not authenticated, using development fallback token");
          setSession({
            accessToken: import.meta.env.VITE_LANGSMITH_API_KEY!,
            isAuth0: false,
            isDevelopment: true,
          });
        } else {
          setSession(null);
        }
      }
    };

    getToken();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently]);

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      isLoading, 
      error: error || null, 
      login, 
      logout,
      authProvider: 'auth0'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth0 configuration from environment variables
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // If Auth0 is not configured, use a simple fallback provider for development
  if (!domain || !clientId) {
    console.warn("Auth0 not configured, using development fallback auth");
    return <DevelopmentAuthProvider>{children}</DevelopmentAuthProvider>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </Auth0Provider>
  );
}

// Fallback provider for development when Auth0 is not configured
function DevelopmentAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    // Only provide automatic session if LANGSMITH_API_KEY is available
    // This allows testing the login page when it's not configured
    if (import.meta.env.VITE_LANGSMITH_API_KEY) {
      setSession({
        accessToken: import.meta.env.VITE_LANGSMITH_API_KEY,
        isAuth0: false,
        isDevelopment: true,
      });
    } else {
      // No session - this will show the login page
      setSession(null);
    }
  }, []);

  const login = () => {
    console.warn("Auth0 not configured, simulating login with demo token");
    setSession({
      accessToken: "demo-token",
      isAuth0: false,
      isDevelopment: true,
    });
  };

  const logout = () => {
    console.warn("Auth0 not configured, simulating logout");
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      isLoading: false, 
      error: null,
      login,
      logout,
      authProvider: 'development'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
