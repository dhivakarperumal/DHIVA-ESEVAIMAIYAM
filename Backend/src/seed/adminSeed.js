const bcrypt = require("bcrypt");
const { findByEmailOrUsername, createUser } = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_ADMIN = {
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

async function ensureDefaultAdmin() {
  const existing = await findByEmailOrUsername(DEFAULT_ADMIN.email, DEFAULT_ADMIN.username);
  if (existing) {
    console.log(`Default admin account already exists: ${existing.email || existing.username}`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
  const admin = await createUser({
    ...DEFAULT_ADMIN,
    password: passwordHash,
  });
  console.log(`Created default admin account: ${admin.email} / admin@123`);
  return admin;
}

module.exports = { ensureDefaultAdmin };
