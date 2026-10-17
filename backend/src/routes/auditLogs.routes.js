import { getAllAuditLogs } from "../controller/auditLogs.controller.js";
import express from "express"
const router = express.Router()

router.get("/", getAllAuditLogs)

export default router;