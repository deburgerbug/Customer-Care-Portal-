const BASE_URL = "http://localhost:3000";
const REFRESH_URL = `${BASE_URL}/auth/refresh`;

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

function clearSessionAndRedirect() {
  clearAccessToken();
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = async () => {
        const response = await fetch(REFRESH_URL, {
          method: "POST",
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok || !data.accessToken) {
          throw new Error(data.message || "Session expired. Please log in again.");
        }

        setAccessToken(data.accessToken);
        return data.accessToken;
      };

      if (navigator.locks) {
        // Serialize refresh-token rotation across browser tabs.
        return navigator.locks.request("customer-care-auth-refresh", refresh);
      }

      return refresh();
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const makeRequest = (token) => {
    const headers = new Headers(options.headers);

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let response = await makeRequest(accessToken);
  const isRefreshRequest = url === REFRESH_URL;
  const isLoginRequest = url.endsWith("/auth/login");

  if (
    response.status === 401 &&
    accessToken &&
    !isRefreshRequest &&
    !isLoginRequest
  ) {
    try {
      const refreshedToken = await refreshAccessToken();
      response = await makeRequest(refreshedToken);
      if (response.status === 401) {
        clearSessionAndRedirect();
      }
    } catch (error) {
      clearSessionAndRedirect();
      throw error;
    }
  }

  return response;
}
