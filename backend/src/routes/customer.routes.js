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

const router = express.Router();

// Apply authentication to all customer routes
router.use(authenticate);

// Metrics
router.get('/metrics', requirePermission(PERMISSIONS.EMPLOYEE_READ), getMetrics);

// List
router.get('/', requirePermission(PERMISSIONS.CUSTOMER_READ), getCustomers);

// Create
router.post('/', requirePermission(PERMISSIONS.CUSTOMER_CREATE), createCustomer);

// Read
router.get('/:id', requirePermission(PERMISSIONS.CUSTOMER_READ), getCustomerById);

// Update
router.put('/:id', requirePermission(PERMISSIONS.CUSTOMER_UPDATE), updateCustomer);
router.delete("/:customerId/communications/:communicationId", requirePermission(PERMISSIONS.CUSTOMER_UPDATE), deleteSecondaryCommunication);
router.delete('/:customerId/addresses/:addressId', requirePermission(PERMISSIONS.CUSTOMER_UPDATE), deleteSecondaryAddress);

// Delete Customer
router.delete('/:id', requirePermission(PERMISSIONS.CUSTOMER_DELETE), deleteCustomer);

export default router;