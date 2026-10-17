import AuditLogs from "../models/auditLogs.schema.js";
import { getAuthFilter } from "./customer.service.js";
import {AppError} from "../errors/AppError.js"
import { escapeRegex } from "../utils/escapeRegex.js";
export async function createAuditLog(
  { entity, entityType = "Ticket", actor, action, changes, description },
  { session } = {}
) {
  const [auditLog] = await AuditLogs.create(
    [{ entity, entityType, actor, action, changes, description }],
    session ? { session } : {}
  );

  return auditLog;
}

/**
 * @params {Object} queryOptions={}
 * @returns Audit Logs
 * 
 */

export async function getAuditLogs(queryOptions = {}, user){
  const page = Math.max(1, parseInt(queryOptions.page,10) || 1)
  const limit = Math.min(100, (queryOptions.limit, 10) || 5 )
  const skip = (page - 1) * limit;

  const search = (queryOptions.search || "").trim()

  const filter = getAuthFilter(user)

  if(search){
    const searchRegex = new RegExp(escapeRegex(search), i);
    filter.$or = [
      {actor: searchRegex},
      {action: searchRegex}
    ]
  }
  const logs = await AuditLogs.find().lean()
  return logs;
}