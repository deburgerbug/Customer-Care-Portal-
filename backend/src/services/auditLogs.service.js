import AuditLogs from "../models/auditLogs.schema.js";

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
