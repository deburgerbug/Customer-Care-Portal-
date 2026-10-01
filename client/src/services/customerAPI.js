import { apiClient } from "../utils/apiClient.js";

const API_URL = "/customers";

export async function createCustomer(customerData) {
  const response = await apiClient(API_URL, {
    method: "POST",
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
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();

  const response = await apiClient(`${API_URL}${query ? `?${query}` : ""}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch customers");
  }

  return data;
}

export async function getCustomerById(customerId) {
  const response = await apiClient(`${API_URL}/${customerId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch customer");
  }

  return data;
}

export async function updateCustomer(customerId, customerData) {
  const response = await apiClient(`${API_URL}/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update customer");
  }

  return data;
}

export async function deleteCustomer(customerId) {
  const response = await apiClient(`${API_URL}/${customerId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete customer");
  }

  return data;
}

export async function getCustomerMetrics() {
  const response = await apiClient(`${API_URL}/metrics`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch customer metrics");
  }
  return data;
}

export async function deleteSecondaryAddress(customerId, addressId) {
  const response = await apiClient(
    `${API_URL}/${customerId}/addresses/${addressId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete address");
  }

  return data;
}

export async function deleteSecondaryCommunication(customerId, communicationId) {
  const response = await apiClient(
    `${API_URL}/${customerId}/communications/${communicationId}`,
    {
      method: "DELETE",
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
