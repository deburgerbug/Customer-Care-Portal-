import Customer from "../modals/customer.schema.js";
import { validateCustomerData } from "../utils/customer.validation.js";
export async function createCustomer(customerData) {
  validateCustomerData(customerData);
  const customer = await Customer.create(customerData);

  return customer;
}

export async function getCustomers(queryOptions = {}) {
  const page = Math.max(1, parseInt(queryOptions.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryOptions.limit, 10) || 5));
  const skip = (page - 1) * limit;

  const search = (queryOptions.search || "").trim();
  const filter = {};

  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { "communications.mobile": searchRegex },
      { "communications.email": searchRegex },
    ];
  }

  const [customers, totalCount] = await Promise.all([
    Customer.find(filter)
      .select("firstName lastName createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Customer.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    customers,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getCustomerById(customerId) {
  const customer = await Customer.findById(customerId);
  return customer;
}

export async function updateCustomer(customerId, customerData) {
  validateCustomerData(customerData);
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    customerData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  return customer;
}

export async function deleteSecondaryAddress(customerId, addressId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error("Customer not found");
  }

  const address = customer.addresses.id(addressId);

  if (!address) {
    throw new Error("Address not found");
  }
  if (address.type === "primary") {
    throw new Error("Primary address cannot be deleted");
  }

  customer.addresses.pull(addressId);
  await customer.save();
  return customer;
}
export async function deleteSecondaryCommunication(
  customerId,
  communicationId
) {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  const communication = customer.communications.id(communicationId);

  if (!communication) {
    throw new Error("Communication not found");
  }

  if (communication.type === "primary") {
    throw new Error("Primary communication cannot be deleted");
  }

  customer.communications.pull(communicationId);
  await customer.save();
  return customer;
}

export async function deleteCustomer(customerId) {
  const customer = await Customer.findByIdAndDelete(customerId);

  return customer;
}
