const API_URL = "http://localhost:3000/users";

export async function getEmployees() {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/employees`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch employees");
  }

  return data;
}

export async function createEmployee(employeeData) {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(employeeData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create employee");
  return data;
}

export async function updateEmployee(id, employeeData) {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(employeeData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update employee");
  return data;
}

export async function deleteEmployee(id) {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/employees/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to deactivate employee");
  return data;
}
