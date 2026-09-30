import { apiClient } from "../utils/apiClient.js";

const API_URL = "/users";

export async function getEmployees() {
  const response = await apiClient(`${API_URL}/employees`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch employees");
  }

  return data;
}

export async function createEmployee(employeeData) {
  const response = await apiClient(`${API_URL}/employees`, {
    method: "POST",
    body: JSON.stringify(employeeData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create employee");
  return data;
}

export async function updateEmployee(id, employeeData) {
  const response = await apiClient(`${API_URL}/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(employeeData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update employee");
  return data;
}

export async function deleteEmployee(id) {
  const response = await apiClient(`${API_URL}/employees/${id}`, {
    method: "DELETE",
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to deactivate employee");
  return data;
}
