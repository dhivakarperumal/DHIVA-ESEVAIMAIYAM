const { getDB } = require('../config/db');
const path = require('path');
const fs = require('fs');

// Helper to build WHERE clause for filters
function buildExpenseFilter(query) {
  const conditions = ["e.status != 'Deleted'"];
  const params = [];

  if (query.search) {
    conditions.push('(e.expense_id LIKE ? OR e.expense_title LIKE ? OR ev.vendor_name LIKE ? OR e.receipt_number LIKE ? OR e.reference_number LIKE ?)');
    const s = `%${query.search}%`;
    params.push(s, s, s, s, s);
  }
  if (query.category_id) { conditions.push('e.category_id = ?'); params.push(query.category_id); }
  if (query.subcategory_id) { conditions.push('e.subcategory_id = ?'); params.push(query.subcategory_id); }
  if (query.payment_method) { conditions.push('e.payment_method = ?'); params.push(query.payment_method); }
  if (query.payment_status) { conditions.push('e.payment_status = ?'); params.push(query.payment_status); }
  if (query.date_from) { conditions.push('e.expense_date >= ?'); params.push(query.date_from); }
  if (query.date_to) { conditions.push('e.expense_date <= ?'); params.push(query.date_to); }
  if (query.status) { conditions.push('e.status = ?'); params.push(query.status); }
  if (query.is_recurring !== undefined) { conditions.push('e.is_recurring = ?'); params.push(query.is_recurring === 'true' ? 1 : 0); }

  return { where: conditions.join(' AND '), params };
}

// ─── GET ALL EXPENSES (paginated) ────────────────────────────────────────────
exports.getAllExpenses = async (req, res) => {
  try {
    const db = getDB();
    const { where, params } = buildExpenseFilter(req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    const sortBy = ['expense_date','amount','expense_title'].includes(req.query.sortBy) ? req.query.sortBy : 'e.created_at';
    const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';

    const baseQuery = `
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN expense_subcategories es ON e.subcategory_id = es.id
      LEFT JOIN expense_vendors ev ON e.vendor_id = ev.id
      WHERE ${where}`;

    const [[{ total }]] = await db.execute(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const [rows] = await db.execute(
      `SELECT e.*, ec.name as category_name, es.name as subcategory_name, ev.vendor_name, ev.vendor_id as vendor_code
       ${baseQuery} ORDER BY ${sortBy} ${sortDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ success: true, data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── GET SINGLE EXPENSE ───────────────────────────────────────────────────────
exports.getExpenseById = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(
      `SELECT e.*, ec.name as category_name, es.name as subcategory_name, ev.vendor_name
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       LEFT JOIN expense_subcategories es ON e.subcategory_id = es.id
       LEFT JOIN expense_vendors ev ON e.vendor_id = ev.id
       WHERE e.id = ? AND e.status != 'Deleted'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── CREATE EXPENSE ───────────────────────────────────────────────────────────
exports.createExpense = async (req, res) => {
  try {
    const db = getDB();
    const {
      expense_date, category_id, subcategory_id, expense_title, description,
      amount, payment_method, payment_status = 'Paid', vendor_id,
      reference_number, receipt_number, is_recurring = false,
      recurring_type, next_payment_date, notes, status = 'Active', created_by
    } = req.body;

    // Validation
    if (!expense_date || !category_id || !expense_title || !amount || !payment_method) {
      return res.status(400).json({ success: false, message: 'Required fields missing: date, category, title, amount, payment method' });
    }
    if (parseFloat(amount) < 0) {
      return res.status(400).json({ success: false, message: 'Amount cannot be negative' });
    }

    // Auto-generate expense_id
    const [last] = await db.execute("SELECT expense_id FROM expenses ORDER BY id DESC LIMIT 1");
    let nextNum = 1;
    if (last.length > 0 && last[0].expense_id) {
      const match = last[0].expense_id.match(/EXP(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const expense_id = `EXP${String(nextNum).padStart(5, '0')}`;

    // Receipt path
    const receipt_path = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO expenses 
       (expense_id, expense_date, category_id, subcategory_id, expense_title, description,
        amount, payment_method, payment_status, vendor_id, reference_number, receipt_number,
        receipt_path, is_recurring, recurring_type, next_payment_date, notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense_id, expense_date, category_id, subcategory_id || null, expense_title, description || null,
        amount, payment_method, payment_status, vendor_id || null, reference_number || null,
        receipt_number || null, receipt_path, is_recurring ? 1 : 0,
        is_recurring ? recurring_type : null, is_recurring ? (next_payment_date || null) : null,
        notes || null, status, created_by || 'Admin'
      ]
    );

    res.status(201).json({ success: true, message: 'Expense created', data: { id: result.insertId, expense_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── UPDATE EXPENSE ───────────────────────────────────────────────────────────
exports.updateExpense = async (req, res) => {
  try {
    const db = getDB();
    const {
      expense_date, category_id, subcategory_id, expense_title, description,
      amount, payment_method, payment_status, vendor_id, reference_number,
      receipt_number, is_recurring, recurring_type, next_payment_date, notes, status, updated_by
    } = req.body;

    if (!expense_date || !category_id || !expense_title || !amount || !payment_method) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    if (parseFloat(amount) < 0) {
      return res.status(400).json({ success: false, message: 'Amount cannot be negative' });
    }

    const [existing] = await db.execute("SELECT id, receipt_path FROM expenses WHERE id = ? AND status != 'Deleted'", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Expense not found' });

    let receipt_path = existing[0].receipt_path;
    if (req.file) {
      // Delete old receipt file if exists
      if (receipt_path) {
        const oldPath = path.join(__dirname, '../..', receipt_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      receipt_path = `/uploads/receipts/${req.file.filename}`;
    }

    await db.execute(
      `UPDATE expenses SET expense_date=?, category_id=?, subcategory_id=?, expense_title=?,
       description=?, amount=?, payment_method=?, payment_status=?, vendor_id=?,
       reference_number=?, receipt_number=?, receipt_path=?, is_recurring=?,
       recurring_type=?, next_payment_date=?, notes=?, status=?, updated_by=? WHERE id=?`,
      [
        expense_date, category_id, subcategory_id || null, expense_title, description || null,
        amount, payment_method, payment_status, vendor_id || null, reference_number || null,
        receipt_number || null, receipt_path, is_recurring ? 1 : 0,
        is_recurring ? recurring_type : null, is_recurring ? (next_payment_date || null) : null,
        notes || null, status, updated_by || 'Admin', req.params.id
      ]
    );
    res.json({ success: true, message: 'Expense updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── SOFT DELETE EXPENSE ──────────────────────────────────────────────────────
exports.deleteExpense = async (req, res) => {
  try {
    const db = getDB();
    const [existing] = await db.execute("SELECT id FROM expenses WHERE id = ? AND status != 'Deleted'", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Expense not found' });
    await db.execute("UPDATE expenses SET status = 'Deleted' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── DASHBOARD ANALYTICS ──────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().slice(0, 10);
    const firstOfMonth = today.slice(0, 7) + '-01';
    const firstOfYear = today.slice(0, 4) + '-01-01';

    const [[todayStats]] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE expense_date = ? AND status = 'Active'", [today]
    );
    const [[monthStats]] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE expense_date >= ? AND status = 'Active'", [firstOfMonth]
    );
    const [[yearStats]] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE expense_date >= ? AND status = 'Active'", [firstOfYear]
    );
    const [[pendingStats]] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) as total, COUNT(*) as count FROM expenses WHERE payment_status = 'Pending' AND status = 'Active'"
    );
    const [[recurringStats]] = await db.execute(
      "SELECT COUNT(*) as count FROM expenses WHERE is_recurring = 1 AND status = 'Active'"
    );
    const [[cashStats]] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE payment_method = 'Cash' AND expense_date >= ? AND status = 'Active'", [firstOfMonth]
    );
    const [[upiStats]] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE payment_method IN ('UPI','Google Pay','PhonePe','Paytm') AND expense_date >= ? AND status = 'Active'", [firstOfMonth]
    );

    // Monthly trend (last 12 months)
    const [monthlyTrend] = await db.execute(
      `SELECT DATE_FORMAT(expense_date,'%Y-%m') as month, COALESCE(SUM(amount),0) as total
       FROM expenses WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND status = 'Active'
       GROUP BY month ORDER BY month ASC`
    );

    // Category breakdown (current month)
    const [categoryBreakdown] = await db.execute(
      `SELECT ec.name as category, COALESCE(SUM(e.amount),0) as total
       FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
       WHERE e.expense_date >= ? AND e.status = 'Active'
       GROUP BY ec.id ORDER BY total DESC LIMIT 8`, [firstOfMonth]
    );

    // Payment method breakdown
    const [paymentBreakdown] = await db.execute(
      `SELECT payment_method, COALESCE(SUM(amount),0) as total, COUNT(*) as count
       FROM expenses WHERE expense_date >= ? AND status = 'Active'
       GROUP BY payment_method ORDER BY total DESC`, [firstOfMonth]
    );

    // Recent expenses
    const [recentExpenses] = await db.execute(
      `SELECT e.*, ec.name as category_name, ev.vendor_name
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       LEFT JOIN expense_vendors ev ON e.vendor_id = ev.id
       WHERE e.status = 'Active' ORDER BY e.created_at DESC LIMIT 8`
    );

    // Top categories this year
    const [topCategories] = await db.execute(
      `SELECT ec.name as category, COALESCE(SUM(e.amount),0) as total, COUNT(e.id) as count
       FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
       WHERE e.expense_date >= ? AND e.status = 'Active'
       GROUP BY ec.id ORDER BY total DESC LIMIT 5`, [firstOfYear]
    );

    res.json({
      success: true,
      data: {
        today_total: parseFloat(todayStats.total),
        month_total: parseFloat(monthStats.total),
        year_total: parseFloat(yearStats.total),
        pending_amount: parseFloat(pendingStats.total),
        pending_count: pendingStats.count,
        recurring_count: recurringStats.count,
        cash_total: parseFloat(cashStats.total),
        upi_total: parseFloat(upiStats.total),
        monthly_trend: monthlyTrend,
        category_breakdown: categoryBreakdown,
        payment_breakdown: paymentBreakdown,
        recent_expenses: recentExpenses,
        top_categories: topCategories,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
exports.getReport = async (req, res) => {
  try {
    const db = getDB();
    const { type, date_from, date_to } = req.query;
    const params = [];
    let groupBy = '';
    let selectExtra = '';

    const conditions = ["e.status = 'Active'"];
    if (date_from) { conditions.push('e.expense_date >= ?'); params.push(date_from); }
    if (date_to) { conditions.push('e.expense_date <= ?'); params.push(date_to); }
    const where = conditions.join(' AND ');

    switch (type) {
      case 'category': selectExtra = ', ec.name as group_label'; groupBy = 'GROUP BY e.category_id'; break;
      case 'subcategory': selectExtra = ', COALESCE(es.name,"Unspecified") as group_label'; groupBy = 'GROUP BY e.subcategory_id'; break;
      case 'payment_method': selectExtra = ', e.payment_method as group_label'; groupBy = 'GROUP BY e.payment_method'; break;
      case 'vendor': selectExtra = ', COALESCE(ev.vendor_name,"Direct") as group_label'; groupBy = 'GROUP BY e.vendor_id'; break;
      default: selectExtra = ', DATE_FORMAT(e.expense_date,"%Y-%m-%d") as group_label'; groupBy = 'GROUP BY e.expense_date';
    }

    const [[summary]] = await db.execute(
      `SELECT COALESCE(SUM(e.amount),0) as total, COUNT(e.id) as count,
              COALESCE(AVG(e.amount),0) as avg, COALESCE(MAX(e.amount),0) as highest
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       LEFT JOIN expense_subcategories es ON e.subcategory_id = es.id
       LEFT JOIN expense_vendors ev ON e.vendor_id = ev.id
       WHERE ${where}`, params
    );

    const [breakdown] = await db.execute(
      `SELECT COALESCE(SUM(e.amount),0) as total, COUNT(e.id) as count ${selectExtra}
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       LEFT JOIN expense_subcategories es ON e.subcategory_id = es.id
       LEFT JOIN expense_vendors ev ON e.vendor_id = ev.id
       WHERE ${where} ${groupBy} ORDER BY total DESC`, params
    );

    res.json({ success: true, data: { summary, breakdown } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── RECURRING EXPENSES ───────────────────────────────────────────────────────
exports.getRecurringExpenses = async (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await db.execute(
      `SELECT e.*, ec.name as category_name, ev.vendor_name,
              CASE WHEN e.next_payment_date < ? THEN 1 ELSE 0 END as is_overdue
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       LEFT JOIN expense_vendors ev ON e.vendor_id = ev.id
       WHERE e.is_recurring = 1 AND e.status = 'Active'
       ORDER BY e.next_payment_date ASC`, [today]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── DAILY CASH CLOSING ───────────────────────────────────────────────────────
exports.getDailyCashClosing = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute("SELECT * FROM daily_cash_closing ORDER BY closing_date DESC LIMIT 30");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createDailyCashClosing = async (req, res) => {
  try {
    const db = getDB();
    const { opening_cash, cash_income, closing_date, actual_closing, closed_by, notes } = req.body;
    if (!closing_date) return res.status(400).json({ success: false, message: 'Closing date required' });

    // Calculate cash expenses from DB for that day
    const [[{ cash_expense }]] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) as cash_expense FROM expenses WHERE payment_method='Cash' AND expense_date=? AND status='Active'",
      [closing_date]
    );
    const expected_closing = parseFloat(opening_cash || 0) + parseFloat(cash_income || 0) - parseFloat(cash_expense || 0);
    const difference = parseFloat(actual_closing || 0) - expected_closing;

    await db.execute(
      `INSERT INTO daily_cash_closing (opening_cash,cash_income,cash_expense,expected_closing,actual_closing,difference,closing_date,closed_by,notes)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE opening_cash=VALUES(opening_cash),cash_income=VALUES(cash_income),
       cash_expense=VALUES(cash_expense),expected_closing=VALUES(expected_closing),
       actual_closing=VALUES(actual_closing),difference=VALUES(difference),
       closed_by=VALUES(closed_by),notes=VALUES(notes)`,
      [opening_cash || 0, cash_income || 0, cash_expense, expected_closing, actual_closing || 0, difference, closing_date, closed_by || 'Admin', notes || null]
    );
    res.json({ success: true, message: 'Daily cash closing saved', data: { cash_expense, expected_closing, difference } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
