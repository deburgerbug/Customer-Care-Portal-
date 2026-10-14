import {
  apiClient,
  refreshAccessToken as refreshFromCookie,
  setAccessToken,
} from "../utils/apiClient";

export const API_URL = "/auth";

async function authRequest(path, options, fallbackMessage) {
  const response = await apiClient(`${API_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function loginUser({ email, password }) {
  const data = await authRequest(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    "Login failed"
  );
  setAccessToken(data.accessToken);
  return data;
}

export function registerUser({ name, email, password, role, department }) {
  return authRequest(
    "/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, department }),
    },
    "Registration failed"
  );
}

export function logoutUser() {
  return authRequest(
    "/logout",
    {
      method: "POST",
    },
    "Logout failed"
  );
}

export async function refreshAccessToken() {
  const accessToken = await refreshFromCookie();
  return { accessToken };
}

export function getMe() {
  return authRequest("/me", undefined, "Failed to get user");
}

export function forgotPassword(email) {
  return authRequest(
    "/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    "Failed to send reset link"
  );
}

export function resetPassword(token, password) {
  return authRequest(
    `/reset-password/${encodeURIComponent(token)}`,
    {
      method: "POST",
      body: JSON.stringify({ password }),
    },
    "Failed to reset password"
  );
}

export function verifyEmail(token) {
  return authRequest(
    `/verify-email/${encodeURIComponent(token)}`,
    { method: "POST" },
    "Failed to verify email"
  );
}