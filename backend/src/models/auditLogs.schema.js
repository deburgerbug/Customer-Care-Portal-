import mongoose from "mongoose"

const auditLogsSchema = new mongoose.Schema({
    entity: {type: mongoose.Schema.Types.ObjectId,required: true, refPath: "entityType",},
    entityType: {type: String, required: true,enum: ["Ticket"] },
    actor: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    action: {type: String,required: true, enum: ["created", "status_changed", "assigned", "unassigned", "comment_added"],},
    changes: {type: mongoose.Schema.Types.Mixed, default: undefined,},
    description: {type: String, required: true, trim: true, maxlength: 500},
},

    {timestamps: { createdAt: true, updatedAt: false },}
);

auditLogsSchema.index({ entityType: 1, entity: 1, createdAt: -1 });
auditLogsSchema.index({ actor: 1, createdAt: -1 });

const AuditLogs = mongoose.model("AuditLog", auditLogsSchema);
export default AuditLogs;