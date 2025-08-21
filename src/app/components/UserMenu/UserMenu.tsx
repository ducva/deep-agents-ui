import { useState, useRef, useEffect } from "react";
import { LogOut, Settings } from "lucide-react";
import { useAuthContext } from "@/providers/Auth";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { session, logout, authProvider } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  if (!session) {
    return null;
  }

  const displayName = session.user?.name || session.user?.email || "User";
  const userInitials = displayName
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getSessionStatusText = () => {
    if (session.isAuth0) {
      return "Auth0 Session";
    } else if (session.isDevelopment) {
      return "Development Session";
    }
    return "Session";
  };

  const getSessionStatusColor = () => {
    if (session.isAuth0) {
      return "text-green-600";
    } else if (session.isDevelopment) {
      return "text-yellow-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {session.user?.picture ? (
          <img
            src={session.user.picture}
            alt={displayName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            {userInitials}
          </div>
        )}
        {/* Add a small indicator for session type */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${session.isAuth0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-background border rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium truncate">{displayName}</p>
            {session.user?.email && (
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            )}
            <p className={`text-xs mt-1 font-medium ${getSessionStatusColor()}`}>
              {getSessionStatusText()}
            </p>
          </div>
          
          <div className="py-1">
            <button
              className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted text-left"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} className="mr-3" />
              Settings
            </button>
            
            <button
              className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted text-left text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}