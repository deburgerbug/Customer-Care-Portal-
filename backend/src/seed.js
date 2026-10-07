import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import User from "./modals/user.schema.js";
import Customer from "./modals/customer.schema.js";
import Ticket from "./modals/ticket.schema.js";
import Department from "./modals/department.schema.js";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/customerCrud";

async function seedDatabase() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected.");

    console.log("🗑️ Wiping existing database...");
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Ticket.deleteMany({});
    await Department.deleteMany({});
    console.log("✅ Database wiped.");

    const departmentNames = ["Sales", "Billing", "HR", "Network", "Management"];
    const departments = await Department.insertMany(
      departmentNames.map((departmentName) => ({ departmentName, status: true }))
    );

    const COMMON_PASSWORD = "Password123!";
    const salt = await bcrypt.genSalt(12);
    const HASHED_PASSWORD = await bcrypt.hash(COMMON_PASSWORD, salt);

    // ==========================================
    // 1. CREATE ADMINS & EMPLOYEES
    // ==========================================
    console.log("👷 Generating Staff...");

    // Create 1 Super Admin and 2 Admins
    const staff = [];

    staff.push({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: HASHED_PASSWORD,
      role: "super_admin",
      isEmailVerified: true,
      isActive: true,
    });

    for (let i = 1; i <= 2; i++) {
      staff.push({
        name: `Admin ${i}`,
        email: `admin${i}@example.com`,
        password: HASHED_PASSWORD,
        role: "admin",
        isEmailVerified: true,
        isActive: true,
      });
    }

    // Create 10 Employees (Agents)
    for (let i = 1; i <= 10; i++) {
      staff.push({
        name: faker.person.fullName(),
        email: `agent${i}@example.com`,
        password: HASHED_PASSWORD,
        role: "employee",
        department: faker.helpers.arrayElement(departments)._id,
        isEmailVerified: true,
        isActive: true,
      });
    }

    const createdStaff = await User.insertMany(staff);
    const employees = createdStaff.filter(u => u.role === "employee");

    // ==========================================
    // 2. CREATE CUSTOMERS
    // ==========================================
    console.log("👥 Generating Customers...");
    const customersData = [];
    const customerUsersData = [];

    // Create 50 Customers
    for (let i = 1; i <= 50; i++) {
      const assignedEmployee = faker.helpers.arrayElement(employees);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `customer${i}@example.com`;

      // 1. Create the Customer Profile Data
      const customer = {
        firstName,
        lastName,
        gender: faker.helpers.arrayElement(["Male", "Female", "Prefer Not to say"]),
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        assignedTo: assignedEmployee._id, // Assign to random employee
        addresses: [
          {
            type: "primary",
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            pincode: faker.location.zipCode('######'),
            country: "India",
          }
        ],
        communications: [
          {
            type: "primary",
            email: email,
            mobile: faker.string.numeric(10), // Must be exactly 10 digits for +91
            countryCode: "+91",
          }
        ]
      };
      customersData.push(customer);
    }

    const createdCustomers = await Customer.insertMany(customersData);

    // 2. Create the associated User accounts for those customers
    for (let i = 0; i < createdCustomers.length; i++) {
      const c = createdCustomers[i];
      customerUsersData.push({
        name: `${c.firstName} ${c.lastName}`,
        email: c.communications[0].email,
        password: HASHED_PASSWORD,
        role: "customer",
        customerId: c._id,
        isEmailVerified: true,
        isActive: true,
      });
    }
    const createdCustomerUsers = await User.insertMany(customerUsersData);

    // ==========================================
    // 3. CREATE TICKETS
    // ==========================================
    console.log("🎫 Generating Support Tickets...");
    const ticketsData = [];

    // Generate ~150 tickets randomly assigned across customers
    for (let i = 0; i < 150; i++) {
      const customer = faker.helpers.arrayElement(createdCustomers);
      const isUnassigned = faker.datatype.boolean({ probability: 0.2 }); // 20% chance of being unassigned

      const ticket = {
        customerId: customer._id,
        title: faker.hacker.phrase(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(["open", "in-progress", "resolved", "closed"]),
        priority: faker.helpers.arrayElement(["low", "medium", "high", "urgent"]),
        assignedTo: isUnassigned ? null : customer.assignedTo, // Follows customer's assigned agent
        isRead: faker.datatype.boolean(),
        comments: []
      };

      // Add 0-3 random comments to the thread
      const commentCount = faker.number.int({ min: 0, max: 3 });
      for (let j = 0; j < commentCount; j++) {
        // Customer or Employee replies
        const isCustomerReply = faker.datatype.boolean();
        ticket.comments.push({
          userId: isCustomerReply
            ? createdCustomerUsers.find(u => u.customerId.toString() === customer._id.toString())._id
            : ticket.assignedTo || faker.helpers.arrayElement(employees)._id,
          text: faker.lorem.sentences(2),
          isInternal: !isCustomerReply && faker.datatype.boolean({ probability: 0.3 }), // 30% chance internal if employee
          createdAt: faker.date.recent({ days: 10 })
        });
      }

      ticketsData.push(ticket);
    }

    await Ticket.insertMany(ticketsData);

    console.log("==========================================");
    console.log("🎉 Seeding Complete! Here is your test data:");
    console.log(`- Super Admin: superadmin@example.com`);
    console.log(`- Admins: admin1@example.com, admin2@example.com`);
    console.log(`- Employees: agent1@example.com to agent10@example.com`);
    console.log(`- Customers: customer1@example.com to customer50@example.com`);
    console.log(`- Password for ALL accounts: ${COMMON_PASSWORD}`);
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
