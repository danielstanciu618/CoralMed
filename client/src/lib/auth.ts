import { apiRequest } from "./queryClient";

export interface AuthUser {
  isAuthenticated: boolean;
}

export async function login(password: string): Promise<boolean> {
  try {
    const response = await apiRequest("POST", "/api/auth/login", { password });
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem("isAuthenticated", "true");
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem("isAuthenticated");
}

export function isAuthenticated(): boolean {
  return localStorage.getItem("isAuthenticated") === "true";
}
