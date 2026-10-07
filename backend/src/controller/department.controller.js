import * as departmentService from "../service/department.service.js";

export async function getDepartments(req, res, next) {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const departments = await departmentService.getDepartments({ includeInactive });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const department = await departmentService.createDepartment(req.body.departmentName);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.body.departmentName
    );

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateDepartment(req, res, next) {
  try {
    const department = await departmentService.deactivateDepartment(req.params.id);

    res.status(200).json({
      success: true,
      message: "Department deactivated successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
}

export async function reactivateDepartment(req, res, next) {
  try {
    const department = await departmentService.reactivateDepartment(req.params.id);

    res.status(200).json({
      success: true,
      message: "Department reactivated successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
}
