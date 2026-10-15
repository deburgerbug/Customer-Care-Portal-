import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/ticket-audit-integration-test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-32-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-32-characters";
process.env.ALLOWED_ORIGINS = "http://localhost:5173";

const [
  { createTicket, updateTicketStatus, assignTicket, addComment },
  { default: User },
  { default: Ticket },
  { default: AuditLog },
] = await Promise.all([
  import("../src/services/ticket.service.js"),
  import("../src/models/user.schema.js"),
  import("../src/models/ticket.schema.js"),
  import("../src/models/auditLogs.schema.js"),
]);

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Ticket.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

async function createActor(email, role = "admin") {
  const actor = await User.create({
    name: "Audit Test Actor",
    email,
    password: "test-password",
    role,
    ...(role === "employee" ? { department: new mongoose.Types.ObjectId() } : {}),
    isEmailVerified: true,
    isActive: true,
  });

  return {
    id: actor._id,
    _id: actor._id,
    role,
    customerId: null,
  };
}

function ticketData() {
  return {
    title: "Audit test ticket",
    description: "Ticket description for audit integration test",
    customerId: new mongoose.Types.ObjectId(),
    priority: "high",
  };
}

test("ticket mutations create safe audit events with actor and before/after changes", async () => {
  const actor = await createActor("audit-admin@example.com");
  const employee = await createActor("audit-employee@example.com", "employee");
  const ticket = await createTicket(ticketData(), actor);

  await updateTicketStatus(ticket._id, "in-progress", actor);
  await updateTicketStatus(ticket._id, "in-progress", actor);
  await assignTicket(ticket._id, employee.id, actor);
  await assignTicket(ticket._id, employee.id, actor);
  await assignTicket(ticket._id, "", actor);
  await addComment(ticket._id, "Private customer content", true, actor);

  const auditLogs = await AuditLog.find({ entity: ticket._id })
    .sort({ createdAt: 1 })
    .lean();

  assert.deepEqual(
    auditLogs.map(({ action }) => action),
    ["created", "status_changed", "assigned", "unassigned", "comment_added"]
  );
  assert.ok(auditLogs.every(({ actor: logActor }) => logActor.toString() === actor.id.toString()));
  assert.ok(auditLogs.every(({ entityType }) => entityType === "Ticket"));

  assert.equal(auditLogs[0].changes.status, "open");
  assert.equal(auditLogs[0].changes.priority, "high");
  assert.deepEqual(auditLogs[1].changes.status, {
    from: "open",
    to: "in-progress",
  });
  assert.equal(
    auditLogs[2].changes.assignedTo.to,
    employee.id.toString()
  );
  assert.deepEqual(auditLogs[3].changes.assignedTo, {
    from: employee.id.toString(),
    to: null,
  });
  assert.equal(auditLogs[4].changes.isInternal, true);
  assert.ok(auditLogs[4].changes.commentId);
  assert.equal(JSON.stringify(auditLogs[4]).includes("Private customer content"), false);
});

test("ticket creation audit log write failures are surfaced", async () => {
  const actor = await createActor("audit-failure@example.com");
  const originalCreate = AuditLog.create;
  AuditLog.create = async () => {
    throw new Error("Audit storage unavailable");
  };

  try {
    await assert.rejects(
      createTicket(ticketData(), actor),
      /Audit storage unavailable/
    );
  } finally {
    AuditLog.create = originalCreate;
  }

  assert.equal(await Ticket.countDocuments({ title: "Audit test ticket" }), 1);
});
