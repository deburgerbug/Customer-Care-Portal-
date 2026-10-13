import Department from "../modals/department.schema.js";

function createDepartmentError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeDepartmentName(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw createDepartmentError("Department name is required", 400);
  }

  const normalizedName = name.trim();
  if (normalizedName.length > 80) {
    throw createDepartmentError("Department name cannot exceed 80 characters", 400);
  }

  return normalizedName;
}

export async function findActiveDepartment(identifier) {
  if (typeof identifier !== "string" || !identifier.trim()) {
    return null;
  }

  const value = identifier.trim();
  if (/^[a-f\d]{24}$/i.test(value)) {
    return Department.findOne({ _id: value, status: true });
  }

  const escapedName = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Department.findOne({
    departmentName: { $regex: `^${escapedName}$`, $options: "i" },
    status: true,
  });
}

export async function resolveActiveDepartment(identifier) {
  const department = await findActiveDepartment(identifier);
  if (!department) {
    throw createDepartmentError("A valid active department is required", 400);
  }
  return department;
}

async function ensureDepartmentNameAvailable(name, exceptId) {
  const existingDepartment = await Department.findOne({
    departmentName: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });

  if (existingDepartment) {
    throw createDepartmentError("A department with this name already exists", 409);
  }
}

export async function getDepartments({ includeInactive = false } = {}) {
  const filter = includeInactive ? {} : { status: true };
  return Department.find(filter).sort({ departmentName: 1 }).lean();
}

export async function createDepartment(name) {
  const departmentName = normalizeDepartmentName(name);
  await ensureDepartmentNameAvailable(departmentName);

  try {
    return await Department.create({ departmentName, status: true });
  } catch (error) {
    if (error.code === 11000) {
      throw createDepartmentError("A department with this name already exists", 409);
    }
    throw error;
  }
}

export async function updateDepartment(id, name) {
  const departmentName = normalizeDepartmentName(name);
  await ensureDepartmentNameAvailable(departmentName, id);

  try {
    const department = await Department.findByIdAndUpdate(
      id,
      { departmentName },
      { new: true, runValidators: true }
    );

    if (!department) {
      throw createDepartmentError("Department not found", 404);
    }

    return department;
  } catch (error) {
    if (error.code === 11000) {
      throw createDepartmentError("A department with this name already exists", 409);
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
    throw createDepartmentError("Department not found", 404);
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
    throw createDepartmentError("Department not found", 404);
  }

  return department;
}