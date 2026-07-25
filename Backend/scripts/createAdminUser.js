const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { initDB } = require("../src/config/db");
const { createUser, findByEmailOrUsername } = require("../src/models/userModel");

const ADMIN_DATA = {
  user_id: uuidv4(),
  username: "admin",
  email: "admin@gmail.com",
  mobile: "1234567890",
  password: "admin@123",
  role: "Admin",
  status: "Active",
  created_by: "SYSTEM",
  updated_by: "SYSTEM",
};

(async () => {
  try {
    await initDB();
    const existing = await findByEmailOrUsername(ADMIN_DATA.email, ADMIN_DATA.username);
    if (existing) {
      console.log("Admin user already exists:", {
        user_id: existing.user_id,
        username: existing.username,
        email: existing.email,
        mobile: existing.mobile,
        role: existing.role,
        status: existing.status,
      });
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(ADMIN_DATA.password, 12);
    const admin = await createUser({
      ...ADMIN_DATA,
      password: passwordHash,
    });
    console.log("Created admin user:", {
      user_id: admin.user_id,
      username: admin.username,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role,
      status: admin.status,
    });
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exit(1);
  }
})();
