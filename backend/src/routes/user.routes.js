import express from "express";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../controller/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Admins can fetch all employees for assignment dropdowns and management list
router.get("/employees", authorize("admin"), getEmployees);
router.post("/employees", authorize("admin"), createEmployee);
router.put("/employees/:id", authorize("admin"), updateEmployee);
router.delete("/employees/:id", authorize("admin"), deleteEmployee);

export default router;
