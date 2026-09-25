const API_URL = "http://localhost:3000/customers";

// Helper: Get headers with auth token
function getHeaders() {
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function createCustomer(customerData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(customerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create customer");
  }

  return data;
}

export async function getCustomers(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
  ).toString();

  const response = await fetch(`${API_URL}${query ? `?${query}` : ""}`, {
    headers: getHeaders(),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch customers");
  }

  return data;
}

export async function getCustomerById(customerId) {
  const response = await fetch(`${API_URL}/${customerId}`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch customer");
  }

  return data;
}

export async function updateCustomer(customerId, customerData) {
  const response = await fetch(`${API_URL}/${customerId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(customerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update customer");
  }

  return data;
}

export async function deleteCustomer(customerId) {
  const response = await fetch(`${API_URL}/${customerId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete customer");
  }

  return data;
}

export async function deleteSecondaryAddress(customerId, addressId) {
  const response = await fetch(
    `${API_URL}/${customerId}/addresses/${addressId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete address");
  }

  return data;
}

export async function deleteSecondaryCommunication(customerId, communicationId) {
  const response = await fetch(
    `${API_URL}/${customerId}/communications/${communicationId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete communication"
    );
  }

  return data;
}
