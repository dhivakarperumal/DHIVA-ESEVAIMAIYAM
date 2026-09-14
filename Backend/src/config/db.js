const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "qtechx_db",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function initDB() {
  if (pool) return pool;

  pool = mysql.createPool(dbConfig);

  try {
    const connection = await pool.getConnection();
    await connection.ping();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        mobile VARCHAR(20) DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Customer',
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_by VARCHAR(100) DEFAULT NULL,
        updated_by VARCHAR(100) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure category table exists for application features that depend on it
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        cid VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        image TEXT DEFAULT NULL,
        description TEXT DEFAULT '',
        subcategories TEXT NOT NULL DEFAULT '[]',
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // --- Expense Management Tables ---

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expense_subcategories (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expense_vendors (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        vendor_id VARCHAR(50) NOT NULL UNIQUE,
        vendor_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        gst_number VARCHAR(50) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        expense_id VARCHAR(50) NOT NULL UNIQUE,
        expense_date DATE NOT NULL,
        category_id INT NOT NULL,
        subcategory_id INT DEFAULT NULL,
        expense_title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid',
        vendor_id INT DEFAULT NULL,
        reference_number VARCHAR(100) DEFAULT NULL,
        receipt_number VARCHAR(100) DEFAULT NULL,
        receipt_path TEXT DEFAULT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
        recurring_type VARCHAR(50) DEFAULT NULL,
        next_payment_date DATE DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_by VARCHAR(100) DEFAULT NULL,
        updated_by VARCHAR(100) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (subcategory_id) REFERENCES expense_subcategories(id) ON DELETE SET NULL,
        FOREIGN KEY (vendor_id) REFERENCES expense_vendors(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_cash_closing (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        opening_cash DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        cash_income DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        cash_expense DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        expected_closing DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        actual_closing DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        difference DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        closing_date DATE NOT NULL UNIQUE,
        closed_by VARCHAR(100) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        equipment_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        asset_id VARCHAR(100) NOT NULL UNIQUE,
        brand VARCHAR(100) DEFAULT NULL,
        model_number VARCHAR(100) DEFAULT NULL,
        serial_number VARCHAR(100) DEFAULT NULL,
        quantity INT NOT NULL DEFAULT 1,
        purchase_date DATE DEFAULT NULL,
        purchase_price DECIMAL(12,2) DEFAULT NULL,
        supplier_name VARCHAR(255) DEFAULT NULL,
        invoice_number VARCHAR(100) DEFAULT NULL,
        invoice_date DATE DEFAULT NULL,
        warranty_start_date DATE DEFAULT NULL,
        warranty_end_date DATE DEFAULT NULL,
        amc_start_date DATE DEFAULT NULL,
        amc_end_date DATE DEFAULT NULL,
        service_provider VARCHAR(255) DEFAULT NULL,
        service_contact_number VARCHAR(30) DEFAULT NULL,
        current_location VARCHAR(255) DEFAULT NULL,
        assigned_staff VARCHAR(255) DEFAULT NULL,
        department VARCHAR(255) DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Working',
        condition_name VARCHAR(50) NOT NULL DEFAULT 'Good',
        last_maintenance_date DATE DEFAULT NULL,
        next_maintenance_date DATE DEFAULT NULL,
        maintenance_remarks TEXT DEFAULT NULL,
        equipment_photo VARCHAR(255) DEFAULT NULL,
        purchase_invoice VARCHAR(255) DEFAULT NULL,
        warranty_document VARCHAR(255) DEFAULT NULL,
        remarks TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS equipment_maintenance (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        equipment_id INT NOT NULL,
        maintenance_date DATE NOT NULL,
        issue VARCHAR(255) NOT NULL,
        service_provider VARCHAR(255) DEFAULT NULL,
        service_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
        technician VARCHAR(255) DEFAULT NULL,
        resolution TEXT DEFAULT NULL,
        next_service_date DATE DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Completed',
        remarks TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    console.log("Database connected:", `${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err;
  }
}

function getDB() {
  if (!pool) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return pool;
}

module.exports = { initDB, getDB };
