import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  deleteSecondaryCommunication,
  updateCustomer,
  deleteSecondaryAddress,
  deleteCustomer,
  getMetrics
} from "../controller/customer.controller.js";
import { authenticate, requirePermission } from "../middleware/auth.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  customerAndAddressParamsSchema,
  customerAndCommunicationParamsSchema,
  createCustomerSchema,
  customerIdParamsSchema,
  customerListQuerySchema,
  updateCustomerSchema,
} from "../validators/customer.validator.js";

const router = express.Router();

// Apply authentication to all customer routes
router.use(authenticate);

// Metrics
router.get('/metrics', requirePermission(PERMISSIONS.EMPLOYEE_READ), getMetrics);

// List
router.get(
  '/',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  validate({ query: customerListQuerySchema }),
  getCustomers
);

// Create
router.post(
  '/',
  requirePermission(PERMISSIONS.CUSTOMER_CREATE),
  validate({ body: createCustomerSchema }),
  createCustomer
);

// Read
router.get(
  '/:id',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  validate({ params: customerIdParamsSchema }),
  getCustomerById
);

// Update
router.put(
  '/:id',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  validate({ params: customerIdParamsSchema, body: updateCustomerSchema }),
  updateCustomer
);
router.delete(
  "/:customerId/communications/:communicationId",
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  validate({ params: customerAndCommunicationParamsSchema }),
  deleteSecondaryCommunication
);
router.delete(
  '/:customerId/addresses/:addressId',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  validate({ params: customerAndAddressParamsSchema }),
  deleteSecondaryAddress
);

// Delete Customer
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.CUSTOMER_DELETE),
  validate({ params: customerIdParamsSchema }),
  deleteCustomer
);

export default router;