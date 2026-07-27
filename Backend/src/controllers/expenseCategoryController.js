const { getDB } = require('../config/db');

// Default categories with subcategories to seed
const DEFAULT_CATEGORIES = [
  { name: 'Office Rent', subs: ['Monthly Shop Rent', 'Advance / Deposit', 'Maintenance Charge'] },
  { name: 'Electricity', subs: ['Electricity Bill', 'Electrical Maintenance'] },
  { name: 'Internet & Communication', subs: ['Broadband', 'Wi-Fi', 'Mobile Recharge', 'Telephone', 'SMS Charges'] },
  { name: 'Printing', subs: ['Black & White Printing', 'Color Printing', 'Photo Printing', 'Certificate Printing', 'Bulk Printing'] },
  { name: 'Printer & Toner', subs: ['Printer Ink', 'Toner', 'Cartridge', 'Drum', 'Printer Repair', 'Printer Spare Parts'] },
  { name: 'Stationery', subs: ['A4 Paper', 'Photo Paper', 'Files', 'Folders', 'Pens', 'Stapler', 'Covers', 'Envelopes', 'Registers', 'Other Stationery'] },
  { name: 'Government / Portal Charges', subs: ['E-Sevai Portal Charge', 'Application Fee', 'Government Fee', 'Transaction Fee', 'Wallet Recharge'] },
  { name: 'Computer & Accessories', subs: ['Computer', 'Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Webcam', 'Scanner', 'Biometric Device', 'Pendrive', 'Hard Disk', 'Accessories'] },
  { name: 'Repair & Maintenance', subs: ['Computer Repair', 'Laptop Repair', 'Printer Repair', 'Scanner Repair', 'Biometric Repair', 'Electrical Repair', 'Furniture Repair', 'Shop Maintenance'] },
  { name: 'Employee Expenses', subs: ['Salary', 'Advance Salary', 'Bonus', 'Incentive', 'Food', 'Travel Allowance', 'Other Allowance'] },
  { name: 'Travel', subs: ['Petrol', 'Diesel', 'Bus', 'Train', 'Auto', 'Taxi', 'Parking', 'Toll'] },
  { name: 'Bank & Payment Charges', subs: ['Bank Charge', 'UPI Charge', 'Payment Gateway Charge', 'Transaction Charge'] },
  { name: 'Software & Subscription', subs: ['Software Subscription', 'Domain Renewal', 'Hosting', 'Cloud Service', 'SMS API', 'WhatsApp API'] },
  { name: 'Marketing', subs: ['Banner', 'Poster', 'Pamphlet', 'Visiting Card', 'Social Media Ads', 'Online Advertisement', 'Local Advertisement'] },
  { name: 'Cleaning', subs: ['Cleaning Materials', 'Housekeeping', 'Waste Management'] },
  { name: 'Refreshments', subs: ['Tea', 'Coffee', 'Water', 'Snacks', 'Staff Food'] },
  { name: 'Furniture', subs: ['Table', 'Chair', 'Cupboard', 'Rack', 'Other Furniture'] },
  { name: 'Tax & License', subs: ['License Fee', 'Registration Fee', 'Tax', 'Professional Fee', 'Renewal Fee'] },
  { name: 'Miscellaneous', subs: ['Emergency Expense', 'Small Cash Expense', 'Other Expense'] },
];

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

exports.getAllCategories = async (req, res) => {
  try {
    const db = getDB();
    const [cats] = await db.execute(
      `SELECT c.*, COUNT(s.id) as subcategory_count 
       FROM expense_categories c 
       LEFT JOIN expense_subcategories s ON c.id = s.category_id AND s.status = 'Active'
       WHERE c.status != 'Deleted'
       GROUP BY c.id ORDER BY c.name ASC`
    );
    res.json({ success: true, data: cats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const db = getDB();
    const [cats] = await db.execute('SELECT * FROM expense_categories WHERE id = ?', [req.params.id]);
    if (!cats.length) return res.status(404).json({ success: false, message: 'Category not found' });
    const [subs] = await db.execute('SELECT * FROM expense_subcategories WHERE category_id = ? AND status != ?', [req.params.id, 'Deleted']);
    res.json({ success: true, data: { ...cats[0], subcategories: subs } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const db = getDB();
    const { name, status = 'Active', subcategories = [] } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
    const [result] = await db.execute('INSERT INTO expense_categories (name, status) VALUES (?, ?)', [name, status]);
    const catId = result.insertId;
    if (subcategories.length > 0) {
      const subVals = subcategories.map(s => [catId, s, 'Active']);
      await db.query('INSERT INTO expense_subcategories (category_id, name, status) VALUES ?', [subVals]);
    }
    res.status(201).json({ success: true, message: 'Category created', data: { id: catId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const db = getDB();
    const { name, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
    const [exists] = await db.execute('SELECT id FROM expense_categories WHERE id = ?', [req.params.id]);
    if (!exists.length) return res.status(404).json({ success: false, message: 'Category not found' });
    await db.execute('UPDATE expense_categories SET name = ?, status = ? WHERE id = ?', [name, status, req.params.id]);
    res.json({ success: true, message: 'Category updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const db = getDB();
    // Check if used in expenses
    const [usedIn] = await db.execute('SELECT id FROM expenses WHERE category_id = ? AND status != ?', [req.params.id, 'Deleted']);
    if (usedIn.length > 0) {
      return res.status(409).json({ success: false, message: 'Cannot delete: category is used in active expenses.' });
    }
    await db.execute('UPDATE expense_categories SET status = ? WHERE id = ?', ['Deleted', req.params.id]);
    await db.execute('UPDATE expense_subcategories SET status = ? WHERE category_id = ?', ['Deleted', req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── SUBCATEGORIES ────────────────────────────────────────────────────────────

exports.getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const db = getDB();
    const [subs] = await db.execute(
      "SELECT * FROM expense_subcategories WHERE category_id = ? AND status != 'Deleted' ORDER BY name ASC",
      [req.params.catId]
    );
    res.json({ success: true, data: subs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.addSubcategory = async (req, res) => {
  try {
    const db = getDB();
    const { name, status = 'Active' } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Subcategory name is required' });
    const [result] = await db.execute(
      'INSERT INTO expense_subcategories (category_id, name, status) VALUES (?, ?, ?)',
      [req.params.catId, name, status]
    );
    res.status(201).json({ success: true, message: 'Subcategory added', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const db = getDB();
    const { name, status } = req.body;
    await db.execute('UPDATE expense_subcategories SET name = ?, status = ? WHERE id = ? AND category_id = ?', [name, status, req.params.subId, req.params.catId]);
    res.json({ success: true, message: 'Subcategory updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const db = getDB();
    await db.execute('UPDATE expense_subcategories SET status = ? WHERE id = ? AND category_id = ?', ['Deleted', req.params.subId, req.params.catId]);
    res.json({ success: true, message: 'Subcategory deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── SEED DEFAULT CATEGORIES ──────────────────────────────────────────────────

exports.seedDefaultCategories = async (req, res) => {
  try {
    const db = getDB();
    const [existing] = await db.execute('SELECT COUNT(*) as cnt FROM expense_categories');
    if (existing[0].cnt > 0) {
      return res.json({ success: true, message: 'Categories already seeded' });
    }
    for (const cat of DEFAULT_CATEGORIES) {
      const [result] = await db.execute('INSERT INTO expense_categories (name, status) VALUES (?, ?)', [cat.name, 'Active']);
      const catId = result.insertId;
      if (cat.subs.length > 0) {
        const subVals = cat.subs.map(s => [catId, s, 'Active']);
        await db.query('INSERT INTO expense_subcategories (category_id, name, status) VALUES ?', [subVals]);
      }
    }
    res.json({ success: true, message: `${DEFAULT_CATEGORIES.length} default categories seeded successfully!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
