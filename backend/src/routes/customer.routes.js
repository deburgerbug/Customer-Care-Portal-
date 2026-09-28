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
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication to all customer routes
router.use(authenticate);

// Metrics
router.get('/metrics', authorize("employee"), getMetrics);

// List - Only Admin and Employee
router.get('/', authorize("admin", "employee"), getCustomers);

// Create - Admin, Employee, and Customer
router.post('/', authorize("admin", "employee", "customer"), createCustomer);

// Read - Admin, Employee, and the Customer themselves
router.get('/:id', authorize("admin", "employee", "customer"), getCustomerById);

// Update - Admin, Employee only
router.put('/:id', authorize("admin", "employee"), updateCustomer);
router.delete("/:customerId/communications/:communicationId", authorize("admin", "employee", "customer"), deleteSecondaryCommunication);
router.delete('/:customerId/addresses/:addressId', authorize("admin", "employee", "customer"), deleteSecondaryAddress);

// Delete Customer - Admin only
router.delete('/:id', authorize("admin"), deleteCustomer);

export default router;