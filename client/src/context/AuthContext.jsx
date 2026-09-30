import { createContext, useContext, useState, useEffect } from "react";
import { logoutUser } from "../services/authAPI";
import { PERMISSIONS } from "../config/permissions.js";

const ROLE_PERMISSIONS = {
  super_admin: ["*"],
  admin: [
    PERMISSIONS.EMPLOYEE_READ, PERMISSIONS.EMPLOYEE_CREATE, PERMISSIONS.EMPLOYEE_UPDATE, PERMISSIONS.EMPLOYEE_DEACTIVATE,
    PERMISSIONS.CUSTOMER_READ, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_UPDATE, PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.TICKET_READ, PERMISSIONS.TICKET_CREATE, PERMISSIONS.TICKET_ASSIGN, PERMISSIONS.TICKET_UPDATE,
    PERMISSIONS.TICKET_COMMENT, PERMISSIONS.TICKET_INTERNAL_COMMENT,
    PERMISSIONS.DASHBOARD_READ
  ],
  employee: [
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.TICKET_READ, PERMISSIONS.TICKET_UPDATE, PERMISSIONS.TICKET_COMMENT, PERMISSIONS.TICKET_INTERNAL_COMMENT,
    PERMISSIONS.DASHBOARD_READ
  ],
  customer: [
    PERMISSIONS.CUSTOMER_READ, PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.TICKET_READ, PERMISSIONS.TICKET_CREATE, PERMISSIONS.TICKET_COMMENT
  ]
};

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
