import { useState, useEffect } from "react";
import { isAuthenticated as checkAuth } from "@/lib/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticated = checkAuth();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const updateAuth = (status: boolean) => {
    setIsAuthenticated(status);
  };

  return {
    isAuthenticated,
    isLoading,
    updateAuth,
  };
}
