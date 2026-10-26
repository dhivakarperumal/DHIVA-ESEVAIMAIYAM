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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        service_name VARCHAR(255) NOT NULL,
        service_code VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(255) NOT NULL,
        subcategory VARCHAR(255) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        provider_department VARCHAR(255) DEFAULT NULL,
        portal_url TEXT DEFAULT NULL,
        government_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        service_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        gst_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        payment_type VARCHAR(30) NOT NULL DEFAULT 'Cash',
        required_documents TEXT NOT NULL DEFAULT '[]',
        document_instructions TEXT DEFAULT NULL,
        processing_time VARCHAR(100) DEFAULT NULL,
        application_type VARCHAR(30) NOT NULL DEFAULT 'Online',
        service_availability VARCHAR(50) NOT NULL DEFAULT 'All Days',
        priority_service VARCHAR(10) NOT NULL DEFAULT 'No',
        delivery_method VARCHAR(30) NOT NULL DEFAULT 'Online',
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        featured_service VARCHAR(10) NOT NULL DEFAULT 'No',
        service_image LONGTEXT DEFAULT NULL,
        terms_conditions TEXT DEFAULT NULL,
        additional_notes TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        applicant_name VARCHAR(150) NOT NULL,
        mobile VARCHAR(20) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        service_id INT NOT NULL,
        center_name VARCHAR(150) DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        notes TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_applications_status (status),
        INDEX idx_applications_service (service_id),
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    const applicationColumns = [
      ['application_number', 'VARCHAR(40) NULL'],
      ['assigned_staff_id', 'INT NULL'],
      ['status_reason', 'VARCHAR(1000) NULL'],
      ['approval_remarks', 'TEXT NULL'],
      ['approving_officer', 'VARCHAR(100) NULL'],
      ['approved_at', 'DATETIME NULL'],
      ['certificate_reference', 'VARCHAR(120) NULL'],
      ['certificate_issue_date', 'DATE NULL'],
      ['certificate_path', 'VARCHAR(500) NULL'],
      ['external_approval_status', "VARCHAR(40) NOT NULL DEFAULT 'Not Connected'"],
      ['completed_by', 'VARCHAR(100) NULL'],
      ['completed_at', 'DATETIME NULL'],
    ];
    for (const [column, definition] of applicationColumns) {
      const [existing] = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'applications' AND COLUMN_NAME = ?`,
        [dbConfig.database, column]
      );
      if (!existing.length) {
        await connection.execute(`ALTER TABLE applications ADD COLUMN ${column} ${definition}`);
      }
    }
    await connection.execute('ALTER TABLE applications MODIFY status VARCHAR(50) NOT NULL DEFAULT \'Application Submitted\'');
    await connection.execute(
      `UPDATE applications SET application_number = CONCAT('APP-', LPAD(id, 8, '0')) WHERE application_number IS NULL`
    );
    await connection.execute("UPDATE applications SET status = 'Application Submitted' WHERE status = 'Pending'");
    const [applicationNumberIndex] = await connection.execute(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'applications' AND INDEX_NAME = 'uq_applications_number'`,
      [dbConfig.database]
    );
    if (!applicationNumberIndex.length) {
      await connection.execute('ALTER TABLE applications ADD UNIQUE KEY uq_applications_number (application_number)');
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_documents (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL UNIQUE,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Submitted',
        reviewer_remarks VARCHAR(1000) DEFAULT NULL,
        uploaded_by VARCHAR(100) NOT NULL,
        reviewed_by VARCHAR(100) DEFAULT NULL,
        reviewed_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_documents_app (application_id, status),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_audit (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        previous_status VARCHAR(50) DEFAULT NULL,
        new_status VARCHAR(50) DEFAULT NULL,
        details JSON DEFAULT NULL,
        actor_id VARCHAR(100) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_audit_app (application_id, created_at),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_notifications (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        channel VARCHAR(30) NOT NULL,
        recipient VARCHAR(255) DEFAULT NULL,
        delivery_status VARCHAR(30) NOT NULL DEFAULT 'Not Configured',
        details VARCHAR(1000) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_notifications_app (application_id, created_at),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        receipt_number VARCHAR(40) NOT NULL UNIQUE,
        transaction_id VARCHAR(80) NOT NULL UNIQUE,
        idempotency_key VARCHAR(80) NOT NULL UNIQUE,
        application_id INT NOT NULL,
        service_id INT NOT NULL,
        application_number VARCHAR(40) NOT NULL,
        customer_name VARCHAR(150) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        government_fee DECIMAL(10,2) NOT NULL,
        service_charge DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL,
        amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        payment_method VARCHAR(30) NOT NULL,
        transaction_reference VARCHAR(120) DEFAULT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Pending',
        payment_date DATETIME NOT NULL,
        notes TEXT DEFAULT NULL,
        created_by VARCHAR(100) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payments_date_status (payment_date, status),
        INDEX idx_payments_application (application_id),
        INDEX idx_payments_service_category (category),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    const [amountPaidColumn] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'amount_paid'`,
      [dbConfig.database]
    );
    if (!amountPaidColumn.length) {
      await connection.execute('ALTER TABLE payments ADD COLUMN amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER total_amount');
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_audit (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        payment_id BIGINT NOT NULL,
        event_type VARCHAR(40) NOT NULL,
        previous_status VARCHAR(30) DEFAULT NULL,
        new_status VARCHAR(30) DEFAULT NULL,
        details JSON DEFAULT NULL,
        actor_id VARCHAR(100) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payment_audit_payment (payment_id, created_at),
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_refunds (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        payment_id BIGINT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason VARCHAR(500) NOT NULL,
        reference_number VARCHAR(120) DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        requested_by VARCHAR(100) NOT NULL,
        confirmed_by VARCHAR(100) DEFAULT NULL,
        refund_date DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payment_refunds_payment (payment_id, status),
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS service_charges (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        charge_name VARCHAR(255) NOT NULL,
        charge_type VARCHAR(50) NOT NULL,
        base_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        gst_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        other_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        effective_from DATE NOT NULL,
        effective_to DATE DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        remarks TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_service_charge_type (service_id, charge_type),
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS service_required_documents (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        required_status VARCHAR(20) NOT NULL DEFAULT 'Required',
        applicant_type VARCHAR(50) NOT NULL DEFAULT 'All',
        document_description TEXT DEFAULT NULL,
        accepted_formats TEXT NOT NULL,
        max_file_size VARCHAR(20) NOT NULL DEFAULT '5 MB',
        number_of_documents VARCHAR(20) NOT NULL DEFAULT 'Single',
        issuing_authority VARCHAR(100) NOT NULL DEFAULT 'Other',
        display_order INT NOT NULL DEFAULT 1,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_service_document_name (service_id, document_name),
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
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
