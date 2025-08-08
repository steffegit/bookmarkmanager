import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface VerifyResponse {
  valid: boolean;
  user?: User;
}

// TODO: Come back to this and fix it
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://0.0.0.0:8080";

async function fetchVerify(): Promise<VerifyResponse> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    localStorage.removeItem("auth_token");
    throw new Error("Not authenticated");
  }

  const data: VerifyResponse = await response.json();
  if (!data.valid) {
    localStorage.removeItem("auth_token");
    throw new Error("Not authenticated");
  }
  return data;
}

async function refreshToken(): Promise<{ token: string }> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No token to refresh");
  }

  const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Clear invalid token
    localStorage.removeItem("auth_token");
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  localStorage.setItem("auth_token", data.token);
  return data;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: verifyResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["auth", "verify"],
    queryFn: fetchVerify,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false, // no retries on 401
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const user = verifyResponse?.user;
  const isAuthenticated = Boolean(verifyResponse?.valid) && !isError;

  async function login(email: string, password: string) {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem("auth_token", data.token);

    console.log("Setting token in local storage:", data.token);
    await queryClient.invalidateQueries({ queryKey: ["auth", "verify"] });
  }

  async function signup(
    email: string,
    password: string,
    displayName: string = email
  ) {
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Signup failed");
    }

    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    await queryClient.invalidateQueries({ queryKey: ["auth", "verify"] });
  }

  async function logout() {
    const token = localStorage.getItem("auth_token");

    if (token) {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    localStorage.removeItem("auth_token");
    await queryClient.invalidateQueries({ queryKey: ["auth", "verify"] });
    queryClient.removeQueries({ queryKey: ["auth", "verify"] });
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${BACKEND_URL}/api/profile/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to change password");
    }

    // Optionally refresh user data after password change
    await queryClient.invalidateQueries({ queryKey: ["auth", "verify"] });
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    changePassword,
    refreshToken,
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "verify"] }),
  };
}
