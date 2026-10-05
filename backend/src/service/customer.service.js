import Customer from "../modals/customer.schema.js";
import User from "../modals/user.schema.js";
import { validateCustomerData } from "../utils/customer.validation.js";

/**
 * Helper to generate database filter based on user role.
 * - Admin: sees all
 * - Employee: sees assigned customers
 * - Customer: sees only their own profile
 */
function getAuthFilter(user) {
  if (user.role === "admin" || user.role === "super_admin") return {};
  if (user.role === "employee") return { assignedTo: user.id };
  if (user.role === "customer") return { _id: user.customerId || null };
  return { _id: null };
}

/**
 * Creates a new customer record.
 * @param {Object} customerData - Customer fields
 * @param {Object} user - Authenticated user context
 */
export async function createCustomer(customerData, user) {
  validateCustomerData(customerData);

  if (user.role === "customer") {
    if (user.customerId) {
      const existingCustomer = await Customer.findById(user.customerId);
      if (existingCustomer) {
        return existingCustomer;
      }
    }
  }

  // If employee creates customer, automatically assign to them
  if (user.role === "employee") {
    customerData.assignedTo = user.id;
  }

  const customer = await Customer.create(customerData);

  // If a customer is creating their own profile, link it to their user account
  if (user.role === "customer") {
    await User.findByIdAndUpdate(user.id, { customerId: customer._id });
  }

  return customer;
}

/**
 * Fetches a paginated list of customers, applying RBAC filters.
 * @param {Object} queryOptions - Pagination & search params
 * @param {Object} user - Authenticated user context
 */
export async function getCustomers(queryOptions = {}, user) {
  const page = Math.max(1, parseInt(queryOptions.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryOptions.limit, 10) || 5));
  const skip = (page - 1) * limit;

  const search = (queryOptions.search || "").trim();
  
  // Apply base auth filter
  const filter = getAuthFilter(user);

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

/**
 * Fetches a single customer by ID, enforcing RBAC filters.
 * @param {string} customerId - ID of customer to fetch
 * @param {Object} user - Authenticated user context
 */
export async function getCustomerById(customerId, user) {
  let customer = await Customer.findOne({
    _id: customerId,
    ...getAuthFilter(user)
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // If an employee views their assigned customer, mark as viewed
  if (user.role === "employee" && !customer.isViewedByEmployee) {
    customer.isViewedByEmployee = true;
    await customer.save();
  }

  return customer;
}

export async function getUnreadAssignedCount(employeeId) {
  return await Customer.countDocuments({ assignedTo: employeeId, isViewedByEmployee: false });
}

/**
 * Updates an existing customer's data, enforcing RBAC.
 * @param {string} customerId - ID of customer to update
 * @param {Object} customerData - New customer data fields
 * @param {Object} user - Authenticated user context
 */
export async function updateCustomer(customerId, customerData, user) {
  validateCustomerData(customerData);
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, ...getAuthFilter(user) },
    customerData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  return customer;
}

/**
 * Deletes a secondary address from a customer.
 * @param {string} customerId - Customer ID
 * @param {string} addressId - Address subdocument ID
 * @param {Object} user - Authenticated user context
 */
export async function deleteSecondaryAddress(customerId, addressId, user) {
  const customer = await Customer.findOne({ _id: customerId, ...getAuthFilter(user) });
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
/**
 * Deletes a secondary communication record.
 * @param {string} customerId - Customer ID
 * @param {string} communicationId - Communication subdocument ID
 * @param {Object} user - Authenticated user context
 */
export async function deleteSecondaryCommunication(
  customerId,
  communicationId,
  user
) {
  const customer = await Customer.findOne({ _id: customerId, ...getAuthFilter(user) });

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

/**
 * Permanently deletes a customer, enforcing RBAC.
 * @param {string} customerId - Customer ID
 * @param {Object} user - Authenticated user context
 */
export async function deleteCustomer(customerId, user) {
  const customer = await Customer.findOneAndDelete({ _id: customerId, ...getAuthFilter(user) });

  return customer;
}
