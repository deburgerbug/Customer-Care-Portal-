import * as customerService from "../services/customer.service.js"
import { AppError } from "../errors/AppError.js";

export async function createCustomer(req, res, next){
    try{
        const customer = await customerService.createCustomer(req.validated.body, req.user);

        res.status(201).json({
            success: true,
            message: "Customer created",
            data: customer    
        })
    }catch(error){
        next(error)
    };
};

export async function getCustomers(req, res, next) {
  try {
    const { customers, pagination } = await customerService.getCustomers(req.validated.query, req.user);

    res.status(200).json({
      success: true,
      data: customers,
      pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMetrics(req, res, next) {
  try {
    let unreadCustomers = 0;
    if (req.user.role === "employee") {
      unreadCustomers = await customerService.getUnreadAssignedCount(req.user.id);
    }
    
    res.status(200).json({
      success: true,
      data: {
        unreadCustomers,
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req, res, next) {
  try{
    const customer = await customerService.getCustomerById(req.validated.params.id, req.user);
    
    if(!customer){
      return next(new AppError("Customer not found", {
        statusCode: 404,
        errorCode: "CUSTOMER_NOT_FOUND",
      }));
    }
    res.status(200).json({
      success: true,
      data: customer
    })
  }
  catch(error){
    next(error)
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const customer = await customerService.updateCustomer(
      req.validated.params.id,
      req.validated.body,
      req.user
    );

    if (!customer) {
      return next(new AppError("Customer not found", {
        statusCode: 404,
        errorCode: "CUSTOMER_NOT_FOUND",
      }));
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}
export async function deleteSecondaryAddress(req, res, next) {
  try {
    const customer = await customerService.deleteSecondaryAddress(
      req.validated.params.customerId,
      req.validated.params.addressId,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Secondary address deleted successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}
export async function deleteSecondaryCommunication(req, res, next) {
  try {
    const customer =
      await customerService.deleteSecondaryCommunication(
        req.validated.params.customerId,
        req.validated.params.communicationId,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Secondary communication deleted successfully",
      data:customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const customer = await customerService.deleteCustomer(
      req.validated.params.id,
      req.user
    );

    if (!customer) {
      return next(new AppError("Customer not found", {
        statusCode: 404,
        errorCode: "CUSTOMER_NOT_FOUND",
      }));
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}