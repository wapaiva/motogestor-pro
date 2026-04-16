import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthChange, logout as firebaseLogout, type User } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  logout: () => Promise<void>;
  enterAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isGuest: false,
  logout: async () => {},
  enterAsGuest: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem("guest") === "true");

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Sync to localStorage for backward compatibility
        localStorage.setItem("user", JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          uid: firebaseUser.uid,
        }));
        setIsGuest(false);
        localStorage.removeItem("guest");
      } else {
        localStorage.removeItem("user");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch {
      // ignore
    }
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("user");
    localStorage.removeItem("guest");
  };

  const enterAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem("guest", "true");
  };

  const isAuthenticated = !!user || isGuest;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isGuest, logout, enterAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
