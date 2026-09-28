const API_URL = "http://localhost:3000/tickets";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getTicketMetrics() {
  const response = await fetch(`${API_URL}/metrics`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch ticket metrics");
  }
  return data;
}

export async function getTickets(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}?${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch tickets");
  }
  return data;
}

export async function getTicketById(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch ticket details");
  }
  return data;
}

export async function createTicket(payload) {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create ticket");
  }
  return data;
}

export async function updateTicketStatus(id, status) {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update ticket status");
  }
  return data;
}

export async function assignTicket(id, employeeId) {
  const response = await fetch(`${API_URL}/${id}/assign`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ employeeId }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to assign ticket");
  }
  return data;
}

export async function addComment(id, payload) {
  const response = await fetch(`${API_URL}/${id}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to add comment");
  }
  return data;
}
