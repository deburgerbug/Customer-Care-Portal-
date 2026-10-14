import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema, tokenParamsSchema,} from "../src/validators/auth.validator.js";
import { createCustomerSchema, customerListQuerySchema,} from "../src/validators/customer.validator.js";
import { departmentListQuerySchema, departmentNameSchema,} from "../src/validators/department.validator.js";
import { createTicketSchema, ticketListQuerySchema,} from "../src/validators/ticket.validator.js";
import { createEmployeeSchema, updateEmployeeSchema,} from "../src/validators/user.validator.js";

test("auth schemas normalize input and reject client-supplied roles", () => {
  const registration = registerSchema.parse({
    name: "  Ada Lovelace ",
    email: " ADA@EXAMPLE.COM ",
    password: "secure-pass",
  });

  assert.equal(registration.name, "Ada Lovelace");
  assert.equal(registration.email, "ada@example.com");
  assert.equal(registerSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "secure-pass",
    role: "admin",
  }).success, false);

  assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success, false);
  assert.equal(tokenParamsSchema.safeParse({ token: "invalid" }).success, false);
});

test("customer schemas apply defaults, normalize communication, and strip assignedTo", () => {
  assert.deepEqual(customerListQuerySchema.parse({}), {
    page: 1,
    limit: 5,
  });

  const customer = createCustomerSchema.parse({
    firstName: " Ada ",
    lastName: " Lovelace ",
    gender: "Female",
    dob: "1990-01-01",
    assignedTo: "507f1f77bcf86cd799439011",
    addresses: [{
      type: "primary",
      address: " 1 Main Street ",
      pincode: "12345",
      city: "London",
      state: "London",
      country: "UK",
    }],
    communications: [{
      type: "primary",
      mobile: "1234567890",
      email: " ADA@EXAMPLE.COM ",
    }],
  });

  assert.equal(customer.firstName, "Ada");
  assert.equal(customer.assignedTo, undefined);
  assert.equal(customer.communications[0].email, "ada@example.com");
  assert.equal(customer.communications[0].countryCode, "+91");
  assert.equal(createCustomerSchema.safeParse({
    firstName: "Ada",
    lastName: "Lovelace",
    gender: "Female",
    dob: "1990-01-01",
    addresses: [],
    communications: [],
  }).success, false);
});

test("department schemas normalize department names and query flags", () => {
  assert.deepEqual(departmentNameSchema.parse({ departmentName: " Billing " }), {
    departmentName: "Billing",
  });
  assert.deepEqual(departmentListQuerySchema.parse({ includeInactive: "true" }), {
    includeInactive: true,
  });
  assert.equal(departmentListQuerySchema.safeParse({ includeInactive: "yes" }).success, false);
});

test("ticket schemas coerce pagination and apply the default priority", () => {
  assert.deepEqual(ticketListQuerySchema.parse({ page: "2", limit: "20" }), {
    page: 2,
    limit: 20,
  });
  assert.equal(createTicketSchema.parse({
    title: "  Need help ",
    description: " Account access issue ",
  }).priority, "medium");
  assert.equal(ticketListQuerySchema.safeParse({ status: "unknown" }).success, false);
});

test("employee schemas normalize email and reject unsupported permission values", () => {
  const employee = createEmployeeSchema.parse({
    name: " Ada Lovelace ",
    email: " ADA@EXAMPLE.COM ",
    password: "secure-pass",
    department: " Billing ",
  });

  assert.equal(employee.email, "ada@example.com");
  assert.equal(employee.department, "Billing");
  assert.equal(updateEmployeeSchema.safeParse({
    customPermissions: ["not-a-permission"],
  }).success, false);
});
