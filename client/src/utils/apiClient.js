const BASE_URL = "http://localhost:3000";

let isRefreshing = false;
let refreshSubscribers = [];

// Adds failed requests to a queue while token is being refreshed
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// Executes all queued requests with the new token
function onRefreshed(token) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * A custom fetch wrapper that handles automatic JWT refresh.
 * It catches 401 Unauthorized errors, calls the refresh endpoint,
 * and retries the original request with the new access token.
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  
  // Set up headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  let token = localStorage.getItem("accessToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Attempt the initial fetch
  let response = await fetch(url, { ...options, headers });

  // If response is 401 (Unauthorized) and it's NOT a login or refresh request itself
  if (response.status === 401 && !url.includes("/auth/refresh") && !url.includes("/auth/login")) {
    const refreshToken = localStorage.getItem("refreshToken");
    
    // No refresh token available -> Force logout
    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }

    // Wrap the original request in a Promise that waits for the new token
    const retryOriginalRequest = new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        if (!newToken) {
          return reject(new Error("Session expired. Please log in again."));
        }
        // Replace the old token in the headers with the new one
        headers.Authorization = `Bearer ${newToken}`;
        resolve(fetch(url, { ...options, headers }));
      });
    });

    // If a refresh isn't already in progress, start one
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshResponse.json();

        if (!refreshResponse.ok) {
          throw new Error("Refresh token expired or invalid");
        }

        // Save new tokens
        localStorage.setItem("accessToken", refreshData.accessToken);
        localStorage.setItem("refreshToken", refreshData.refreshToken);

        isRefreshing = false;
        // Notify all waiting requests to retry with the new token
        onRefreshed(refreshData.accessToken);
      } catch (err) {
        isRefreshing = false;
        // Notify all waiting requests that refresh failed
        onRefreshed(null);
        
        // Refresh failed (likely expired) -> clear storage and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }

    // Await the retried request
    response = await retryOriginalRequest;
  }

  return response;
}
