/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getMe, logoutUser, refreshAccessToken } from "../services/authAPI";
import { clearAccessToken, setAccessToken } from "../utils/apiClient";
import { ROLE_PERMISSIONS } from "./authPermissions.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from the HttpOnly refresh cookie on app load.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await refreshAccessToken();
        const response = await getMe();
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
      } catch {
        clearAccessToken();
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Keep the access token in memory and persist only the non-sensitive profile.
  function saveAuth(data) {
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  // Revoke the current refresh session and clear local authentication state.
  async function logout() {
    try {
      await logoutUser();
    } catch {
      // Ignore API errors — we clear tokens anyway
    }

    clearAccessToken();
    localStorage.removeItem("user");
    setUser(null);
  }

  const hasPermission = (requiredPermission) => {
    if (!user) return false;
    const basePerms = ROLE_PERMISSIONS[user.role] || [];
    const customPerms = user.customPermissions || [];
    const effectivePermissions = [...new Set([...basePerms, ...customPerms])];
    
    return effectivePermissions.includes("*") || effectivePermissions.includes(requiredPermission);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, saveAuth, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
