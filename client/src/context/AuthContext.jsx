/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { logoutUser } from "../services/authAPI";
import { ROLE_PERMISSIONS } from "./authPermissions.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, check localStorage for saved user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (savedUser && accessToken) {
      setUser(JSON.parse(savedUser));
    }

    setIsLoading(false);
  }, []);

  // Save tokens and user to localStorage + state
  function saveAuth(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  // Clear everything on logout
  async function logout() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await logoutUser(refreshToken);
    } catch {
      // Ignore API errors — we clear tokens anyway
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
