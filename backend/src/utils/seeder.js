import User from "../models/user.schema.js";
import { logger } from "./logger.js";

export async function seedAdminAccount() {
  try {
    const adminEmail = "admin@customercare.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: "System Admin",
        email: adminEmail,
        password: "Admin@123", // Will be hashed by pre-save hook
        role: "admin",
        isEmailVerified: true, // Auto-verify the seeded admin
        isActive: true,
      });
      logger.info({ email: adminEmail }, "Seed admin account created");
    } else {
      logger.info({ email: adminEmail }, "Seed admin account already exists");
    }
  } catch (error) {
    logger.error({ err: error }, "Failed to seed admin account");
  }
}
