import { apiClient } from "../utils/apiClient";

const API_URL = "/tickets";

export async function getTicketMetrics() {
  const response = await apiClient(`${API_URL}/metrics`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch ticket metrics");
  }
  return data;
}

export async function getTickets(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await apiClient(`${API_URL}?${query}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch tickets");
  }
  return data;
}

export async function getTicketById(id) {
  const response = await apiClient(`${API_URL}/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch ticket details");
  }
  return data;
}

export async function createTicket(payload) {
  const response = await apiClient(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create ticket");
  }
  return data;
}

export async function updateTicketStatus(id, status) {
  const response = await apiClient(`${API_URL}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update ticket status");
  }
  return data;
}

export async function assignTicket(id, employeeId) {
  const response = await apiClient(`${API_URL}/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ employeeId }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to assign ticket");
  }
  return data;
}

export async function addComment(id, payload) {
  const response = await apiClient(`${API_URL}/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to add comment");
  }
  return data;
}
