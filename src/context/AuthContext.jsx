import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userData")) || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const persistSession = useCallback((payload, fallbackRole) => {
    const nextUser = {
      ...(payload.user || {}),
      role: payload.user?.role || payload.role || fallbackRole,
    };

    localStorage.setItem("accessToken", payload.accessToken);
    localStorage.setItem("refreshToken", payload.refreshToken);
    localStorage.setItem("userData", JSON.stringify(nextUser));

    setAccessToken(payload.accessToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(
    async ({ identifier, password, mode }) => {
      const payload =
        mode === "admin"
          ? await authService.loginAdmin({ username: identifier, password })
          : await authService.loginUser({ email: identifier, password });

      return persistSession(payload, mode);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isReady,
      isAuthenticated: Boolean(accessToken && user),
      isAdmin: user?.role === "admin" || user?.role === "superadmin",
      login,
      logout,
    }),
    [accessToken, isReady, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
