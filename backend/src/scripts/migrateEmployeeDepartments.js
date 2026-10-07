import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../modals/user.schema.js";
import Department from "../modals/department.schema.js";

dotenv.config();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function migrateEmployeeDepartments() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/customerCrud";
  await mongoose.connect(mongoUri);

  try {
    const unassignedCount = await User.collection.countDocuments({
      role: "employee",
      $or: [
        { department: { $exists: false } },
        { department: null },
        { department: "" },
      ],
    });
    if (unassignedCount > 0) {
      throw new Error(
        `${unassignedCount} employee(s) have no department; assign them a department before migration.`
      );
    }

    const employees = await User.collection
      .find(
        { role: "employee", department: { $type: "string" } },
        { projection: { department: 1 } }
      )
      .toArray();

    const legacyNames = [...new Set(
      employees.map((employee) => employee.department.trim()).filter(Boolean)
    )];
    const departmentIds = new Map();

    for (const departmentName of legacyNames) {
      let department = await Department.findOne({
        departmentName: { $regex: `^${escapeRegex(departmentName)}$`, $options: "i" },
      });

      if (!department) {
        department = await Department.create({ departmentName, status: true });
      }
      departmentIds.set(departmentName, department._id);
    }

    for (const [departmentName, departmentId] of departmentIds) {
      await User.collection.updateMany(
        { role: "employee", department: departmentName },
        { $set: { department: departmentId } }
      );
    }

    console.log(`Migrated department values for ${employees.length} employee(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

migrateEmployeeDepartments().catch((error) => {
  console.error("Failed to migrate employee departments:", error);
  process.exitCode = 1;
});
