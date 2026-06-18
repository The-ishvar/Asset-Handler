import React, { createContext, useContext, useState, useEffect } from "react";
import { User, useGetMe, useHealthCheck } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react/custom-fetch";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Call healthcheck just to satisfy hook requirement
  useHealthCheck({ query: { staleTime: Infinity }});

  // Verify token with backend
  const { data: serverUser, isSuccess: isMeSuccess, isError: isMeError } = useGetMe({ 
    query: { 
      enabled: !!token,
      retry: false
    } 
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("bhaleri_token");
    const storedUser = localStorage.getItem("bhaleri_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setAuthTokenGetter(() => storedToken);
      } catch (error) {
        localStorage.removeItem("bhaleri_token");
        localStorage.removeItem("bhaleri_user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isMeSuccess && serverUser) {
      setUser(serverUser);
      localStorage.setItem("bhaleri_user", JSON.stringify(serverUser));
    }
    if (isMeError) {
      logout();
    }
  }, [isMeSuccess, serverUser, isMeError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("bhaleri_token", newToken);
    localStorage.setItem("bhaleri_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setAuthTokenGetter(() => newToken);
  };

  const logout = () => {
    localStorage.removeItem("bhaleri_token");
    localStorage.removeItem("bhaleri_user");
    setToken(null);
    setUser(null);
    setAuthTokenGetter(() => null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
