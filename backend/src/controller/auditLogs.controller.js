import { AppError } from "../errors/AppError.js";
import { getAuditLogs } from "../services/auditLogs.service.js";

export async function getAllAuditLogs (req, res, next){
   try{
    const logs = await getAuditLogs();

    res.status(200).json({
        message: "Audit logs fetched successfully.",
        data: logs
    })
   }catch(err){
    next(err)
   }
}
