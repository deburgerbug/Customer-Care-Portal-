import User from "../models/user.schema.js";
import Ticket from "../models/ticket.schema.js";
import { AppError } from "../errors/AppError.js";
import { resolveActiveDepartment } from "./department.service.js";
import { sanitizeCustomPermissions } from "../utils/permissions.utils.js";

function userError(message, statusCode, errorCode) {
  return new AppError(message, { statusCode, errorCode });
}

function ensureAdmin(user, action) {
  if (user.role !== "super_admin" && user.role !== "admin") {
    throw userError(
      `Forbidden: You are not allowed to ${action}`,
      403,
      "FORBIDDEN"
    );
  }
}

export async function getEmployees() {
  const employees = await User.find({ role: "employee" })
    .select("name email isActive department createdAt customPermissions")
    .populate("department", "departmentName")
    .sort({ createdAt: -1 })
    .lean();

  const ticketCounts = await Ticket.aggregate([
    { $match: { assignedTo: { $ne: null }, status: { $ne: "closed" } } },
    { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    ticketCounts
      .filter(({ _id }) => _id)
      .map(({ _id, count }) => [_id.toString(), count])
  );

  return employees.map((employee) => ({
    ...employee,
    departmentId: employee.department?._id || null,
    department: employee.department?.departmentName || null,
    ticketCount: countMap.get(employee._id.toString()) || 0,
  }));
}

export async function createEmployee({ name, email, password, department: departmentIdentifier }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw userError("Email already in use", 409, "USER_ALREADY_EXISTS");
  }

  const department = await resolveActiveDepartment(departmentIdentifier);
  const employee = await User.create({
    name,
    email,
    password,
    role: "employee",
    department: department._id,
    isEmailVerified: true,
  });

  await employee.populate("department", "departmentName");
  return employee.toPublicJSON();
}

export async function updateEmployee(id, changes, user) {
  const {
    name,
    email,
    department: departmentIdentifier,
    isActive,
    customPermissions,
  } = changes;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (departmentIdentifier !== undefined) {
    const department = await resolveActiveDepartment(departmentIdentifier);
    updateData.department = department._id;
  }
  if (isActive !== undefined) {
    ensureAdmin(user, "change employee activation state");
    updateData.isActive = isActive;
  }

  if (customPermissions !== undefined) {
    ensureAdmin(user, "manage employee permissions");

    const sanitizedPermissions = sanitizeCustomPermissions(customPermissions);
    if (sanitizedPermissions.length !== (Array.isArray(customPermissions) ? customPermissions.length : 0)) {
      throw userError("Invalid custom permissions provided", 400, "INVALID_PERMISSIONS");
    }

    updateData.customPermissions = sanitizedPermissions;
  }

  const employee = await User.findOneAndUpdate(
    { _id: id, role: "employee" },
    updateData,
    { new: true, runValidators: true }
  );

  if (!employee) {
    throw userError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  await employee.populate("department", "departmentName");
  return employee.toPublicJSON();
}

export async function deactivateEmployee(id) {
  const employee = await User.findOneAndUpdate(
    { _id: id, role: "employee" },
    { isActive: false },
    { new: true }
  );

  if (!employee) {
    throw userError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }
}
