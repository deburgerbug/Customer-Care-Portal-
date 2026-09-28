import User from "../modals/user.schema.js";

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
      console.log(`[Seeder] Admin account created: ${adminEmail} / Admin@123`);
    } else {
      console.log(`[Seeder] Admin account already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error("[Seeder] Error seeding admin account:", error);
  }
}
