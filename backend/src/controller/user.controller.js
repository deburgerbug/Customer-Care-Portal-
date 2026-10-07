import User from "../modals/user.schema.js";
import Ticket from "../modals/ticket.schema.js";
import { sanitizeCustomPermissions } from "../middleware/auth.middleware.js";
import { resolveActiveDepartment } from "../service/department.service.js";

export async function getEmployees(req, res, next) {
  try {
    const employees = await User.find({ role: "employee" })
      .select("name email isActive department createdAt customPermissions")
      .populate("department", "departmentName")
      .sort({ createdAt: -1 })
      .lean();

    // Get active ticket counts per employee
    const ticketCounts = await Ticket.aggregate([
      { $match: { assignedTo: { $ne: null }, status: { $ne: "closed" } } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    ticketCounts.forEach(t => {
      if (t._id) countMap[t._id.toString()] = t.count;
    });

    const employeesWithCounts = employees.map((emp) => ({
      ...emp,
      departmentId: emp.department?._id || null,
      department: emp.department?.departmentName || null,
      ticketCount: countMap[emp._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: employeesWithCounts,
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const { name, email, password, department: departmentIdentifier } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const department = await resolveActiveDepartment(departmentIdentifier);
    const employee = await User.create({
      name,
      email,
      password,
      role: "employee",
      department: department._id,
      isEmailVerified: true // Assuming admins create verified accounts
    });

    await employee.populate("department", "departmentName");
    res.status(201).json({
      success: true,
      data: employee.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      department: departmentIdentifier,
      isActive,
      customPermissions,
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (departmentIdentifier !== undefined) {
      const department = await resolveActiveDepartment(departmentIdentifier);
      updateData.department = department._id;
    }
    if (isActive !== undefined) {
      if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not allowed to change employee activation state",
        });
      }
      updateData.isActive = isActive;
    }

    if (customPermissions !== undefined) {
      if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not allowed to manage employee permissions",
        });
      }

      const sanitizedPermissions = sanitizeCustomPermissions(customPermissions);
      if (sanitizedPermissions.length !== (Array.isArray(customPermissions) ? customPermissions.length : 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid custom permissions provided",
        });
      }

      updateData.customPermissions = sanitizedPermissions;
    }

    const employee = await User.findOneAndUpdate(
      { _id: id, role: "employee" },
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    await employee.populate("department", "departmentName");
    res.status(200).json({
      success: true,
      data: employee.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    // Hard delete or soft delete? We'll soft delete by setting isActive = false
    const employee = await User.findOneAndUpdate(
      { _id: id, role: "employee" },
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee deactivated successfully"
    });
  } catch (error) {
    next(error);
  }
}
