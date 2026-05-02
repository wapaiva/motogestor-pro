import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthChange, logout as firebaseLogout, type User } from "@/lib/firebase";
import { setActiveUser, clearUserScope, migrateLegacyKeysIntoActiveScope } from "@/lib/storage";

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
    // On app boot, migrate any legacy unscoped keys into the active scope (guest by default)
    migrateLegacyKeysIntoActiveScope();

    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // Switch storage scope BEFORE anything reads from it
        setActiveUser(firebaseUser.uid);
        // Migrate any legacy keys that may have existed under the unscoped namespace
        migrateLegacyKeysIntoActiveScope();
        // Sync to localStorage for backward compatibility (UI greeting, etc.)
        localStorage.setItem("user", JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          uid: firebaseUser.uid,
        }));
        setIsGuest(false);
        localStorage.removeItem("guest");
      } else {
        // No user → switch back to guest scope (does NOT touch other users' data)
        setActiveUser(null);
        localStorage.removeItem("user");
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    const previousUid = user?.uid || null;
    try {
      await firebaseLogout();
    } catch {
      // ignore
    }
    // Wipe all cached data of the account that just logged out so the next
    // user on this device cannot see anything from the previous session.
    if (previousUid) clearUserScope(previousUid);
    // Also clear any guest scope leftovers
    clearUserScope(null);
    setActiveUser(null);
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("user");
    localStorage.removeItem("guest");
  };

  const enterAsGuest = () => {
    setActiveUser(null);
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
