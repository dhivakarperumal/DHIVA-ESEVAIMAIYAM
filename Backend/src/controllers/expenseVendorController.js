const { getDB } = require('../config/db');

// ─── VENDORS ──────────────────────────────────────────────────────────────────

exports.getAllVendors = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute("SELECT * FROM expense_vendors WHERE status != 'Deleted' ORDER BY vendor_name ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const db = getDB();
    const { vendor_name, mobile, email, address, gst_number, description, status = 'Active' } = req.body;
    if (!vendor_name) return res.status(400).json({ success: false, message: 'Vendor name is required' });

    // Auto generate vendor_id
    const [last] = await db.execute("SELECT vendor_id FROM expense_vendors ORDER BY id DESC LIMIT 1");
    let nextNum = 1;
    if (last.length > 0 && last[0].vendor_id) {
      const match = last[0].vendor_id.match(/VEN(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const vendor_id = `VEN${String(nextNum).padStart(3, '0')}`;

    const [result] = await db.execute(
      'INSERT INTO expense_vendors (vendor_id, vendor_name, mobile, email, address, gst_number, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [vendor_id, vendor_name, mobile || null, email || null, address || null, gst_number || null, description || null, status]
    );
    res.status(201).json({ success: true, message: 'Vendor created', data: { id: result.insertId, vendor_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const db = getDB();
    const { vendor_name, mobile, email, address, gst_number, description, status } = req.body;
    if (!vendor_name) return res.status(400).json({ success: false, message: 'Vendor name is required' });
    const [exists] = await db.execute('SELECT id FROM expense_vendors WHERE id = ?', [req.params.id]);
    if (!exists.length) return res.status(404).json({ success: false, message: 'Vendor not found' });
    await db.execute(
      'UPDATE expense_vendors SET vendor_name=?, mobile=?, email=?, address=?, gst_number=?, description=?, status=? WHERE id=?',
      [vendor_name, mobile || null, email || null, address || null, gst_number || null, description || null, status, req.params.id]
    );
    res.json({ success: true, message: 'Vendor updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const db = getDB();
    await db.execute("UPDATE expense_vendors SET status = 'Deleted' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
