import express from "express"
import { createCustomer, getCustomers, getCustomerById, deleteSecondaryCommunication, updateCustomer,deleteSecondaryAddress, deleteCustomer } from "../controller/customer.controller.js"

const router = express.Router()

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete("/:customerId/communications/:communicationId", deleteSecondaryCommunication);
router.delete('/:customerId/addresses/:addressId',deleteSecondaryAddress)
router.delete('/:id', deleteCustomer)
export default router; 