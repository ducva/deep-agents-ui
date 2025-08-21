
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
}

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  error: Error | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: false,
  error: null,
  login: () => {},
  logout: () => {},
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
          });
        } catch (error) {
          console.warn("Failed to get Auth0 token, falling back to env token:", error);
          // Fallback to environment token for development
          const fallbackToken = import.meta.env.VITE_LANGSMITH_API_KEY || "demo-token";
          setSession({
            accessToken: fallbackToken,
            user: user || undefined,
          });
        }
      } else if (!isAuthenticated && !isLoading) {
        // For development, allow fallback to env token
        if (import.meta.env.DEV && import.meta.env.VITE_LANGSMITH_API_KEY) {
          setSession({
            accessToken: import.meta.env.VITE_LANGSMITH_API_KEY,
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
      logout 
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
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
