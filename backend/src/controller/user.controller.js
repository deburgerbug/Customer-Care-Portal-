import * as userService from "../services/user.service.js";

export async function getEmployees(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: await userService.getEmployees(),
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    res.status(201).json({
      success: true,
      data: await userService.createEmployee(req.validated.body),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: await userService.updateEmployee(
        req.validated.params.id,
        req.validated.body,
        req.user
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    await userService.deactivateEmployee(req.validated.params.id);
    res.status(200).json({
      success: true,
      message: "Employee deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
}
