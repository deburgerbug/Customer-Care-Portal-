import { apiClient } from "../utils/apiClient.js";

const API_URL = "/departments";

async function readResponse(response, fallbackMessage) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

export async function getDepartments({ includeInactive = false } = {}) {
  const query = includeInactive ? "?includeInactive=true" : "";
  const response = await apiClient(`${API_URL}${query}`);
  return readResponse(response, "Failed to fetch departments");
}

export async function createDepartment(departmentName) {
  const response = await apiClient(API_URL, {
    method: "POST",
    body: JSON.stringify({ departmentName }),
  });
  return readResponse(response, "Failed to create department");
}

export async function updateDepartment(id, departmentName) {
  const response = await apiClient(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ departmentName }),
  });
  return readResponse(response, "Failed to update department");
}

export async function deactivateDepartment(id) {
  const response = await apiClient(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return readResponse(response, "Failed to deactivate department");
}

export async function reactivateDepartment(id) {
  const response = await apiClient(`${API_URL}/${id}/reactivate`, {
    method: "PATCH",
  });
  return readResponse(response, "Failed to reactivate department");
}
