import React, { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("bhaleri_token");
    const storedUser = localStorage.getItem("bhaleri_user");
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setAuthToken(storedToken);
      } catch {
        localStorage.removeItem("bhaleri_token");
        localStorage.removeItem("bhaleri_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem("bhaleri_token", newToken);
    localStorage.setItem("bhaleri_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("bhaleri_token");
    localStorage.removeItem("bhaleri_user");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
