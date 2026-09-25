const API_URL = "http://localhost:3000/auth";

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function registerUser({ name, email, password, role, department }) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role, department }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

export async function logoutUser(refreshToken) {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${API_URL}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Token refresh failed");
  }

  return data;
}

export async function getMe() {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get user");
  }

  return data;
}

export async function forgotPassword(email){
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email}),
  });

  const data = await response.json();

  if(!response.ok) {
    throw new Error(data.message || "failed to send reset link");
  }

  return data;
}

export async function resetPassword(token, password) {
  const response = await fetch(`${API_URL}/reset-password/${token}`,{
    method: "POST",
    headers:{"Content-Type": "application/json"},
    body: JSON.stringify({ password})
  });

  const data = await response.json()

  if(!response.ok){
    throw new Error(data.message || "failed to reset password")
  }
  return data;
}