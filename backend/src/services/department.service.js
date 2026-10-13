import Department from "../models/department.schema.js";
import { AppError } from "../errors/AppError.js";
import { escapeRegex } from "../utils/escapeRegex.js";

function departmentError(message, statusCode, errorCode) {
  return new AppError(message, { statusCode, errorCode });
}

export async function findActiveDepartment(identifier) {
  if (typeof identifier !== "string" || !identifier.trim()) {
    return null;
  }

  const value = identifier.trim();
  if (/^[a-f\d]{24}$/i.test(value)) {
    return Department.findOne({ _id: value, status: true });
  }

  const escapedName = escapeRegex(value);
  return Department.findOne({
    departmentName: { $regex: `^${escapedName}$`, $options: "i" },
    status: true,
  });
}

export async function resolveActiveDepartment(identifier) {
  const department = await findActiveDepartment(identifier);
  if (!department) {
    throw departmentError("A valid active department is required", 400, "VALIDATION_ERROR");
  }
  return department;
}

async function ensureDepartmentNameAvailable(name, exceptId) {
  const existingDepartment = await Department.findOne({
    departmentName: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });

  if (existingDepartment) {
    throw departmentError("A department with this name already exists", 409, "DEPARTMENT_ALREADY_EXISTS");
  }
}

export async function getDepartments({ includeInactive = false } = {}) {
  const filter = includeInactive ? {} : { status: true };
  return Department.find(filter).sort({ departmentName: 1 }).lean();
}

export async function createDepartment(name) {
  const departmentName = name;
  await ensureDepartmentNameAvailable(departmentName);

  try {
    return await Department.create({ departmentName, status: true });
  } catch (error) {
    if (error.code === 11000) {
      throw departmentError("A department with this name already exists", 409, "DEPARTMENT_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function updateDepartment(id, name) {
  const departmentName = name;
  await ensureDepartmentNameAvailable(departmentName, id);

  try {
    const department = await Department.findByIdAndUpdate(
      id,
      { departmentName },
      { new: true, runValidators: true }
    );

    if (!department) {
      throw departmentError("Department not found", 404, "DEPARTMENT_NOT_FOUND");
    }

    return department;
  } catch (error) {
    if (error.code === 11000) {
      throw departmentError("A department with this name already exists", 409, "DEPARTMENT_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function deactivateDepartment(id) {
  const department = await Department.findByIdAndUpdate(
    id,
    { status: false },
    { new: true }
  );

  if (!department) {
    throw departmentError("Department not found", 404, "DEPARTMENT_NOT_FOUND");
  }

  return department;
}

export async function reactivateDepartment(id) {
  const department = await Department.findByIdAndUpdate(
    id,
    { status: true },
    { new: true }
  );

  if (!department) {
    throw departmentError("Department not found", 404, "DEPARTMENT_NOT_FOUND");
  }

  return department;
}