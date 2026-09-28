import * as customerService from "../service/customer.service.js"

export async function createCustomer(req, res, next){
    try{
        const customer = await customerService.createCustomer(req.body, req.user);

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
    const { customers, pagination } = await customerService.getCustomers(req.query, req.user);

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
    const customer = await customerService.getCustomerById(req.params.id, req.user);
    
    if(!customer){
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      })
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
      req.params.id,
      req.body,
      req.user
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
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
      req.params.customerId,
      req.params.addressId,
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
        req.params.customerId,
        req.params.communicationId,
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
      req.params.id,
      req.user
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}