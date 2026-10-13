import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Which employee is currently handling this ticket
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // For back-and-forth communication or internal notes
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        isInternal: {
          type: Boolean,
          default: false, // If true, only Admin/Employee can see it, not the customer
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
