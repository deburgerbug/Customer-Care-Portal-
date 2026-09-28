import User from "../modals/user.schema.js";

export async function getEmployees(req, res, next) {
  try {
    const employees = await User.find({ role: "employee" })
      .select("name email isActive department createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const { name, email, password, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: "employee",
      department,
      isEmailVerified: true // Assuming admins create verified accounts
    });

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
    const { name, email, department, isActive } = req.body;

    const employee = await User.findOneAndUpdate(
      { _id: id, role: "employee" },
      { name, email, department, isActive },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

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
