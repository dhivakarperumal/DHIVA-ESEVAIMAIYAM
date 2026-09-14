const { getDB } = require('../config/db');

const EQUIPMENT_FIELDS = `id, equipment_name, category, asset_id, brand, model_number, serial_number,
  quantity, purchase_date, purchase_price, supplier_name, invoice_number, invoice_date,
  warranty_start_date, warranty_end_date, amc_start_date, amc_end_date, service_provider,
  service_contact_number, current_location, assigned_staff, department, status, condition_name,
  last_maintenance_date, next_maintenance_date, maintenance_remarks, equipment_photo,
  purchase_invoice, warranty_document, remarks, created_at, updated_at`;

const nullable = (value) => value === '' || value === undefined ? null : value;
const mapFiles = (files = {}) => ({
  equipment_photo: files.equipmentPhoto?.[0]?.filename || null,
  purchase_invoice: files.purchaseInvoice?.[0]?.filename || null,
  warranty_document: files.warrantyDocument?.[0]?.filename || null,
});

exports.getAllEquipment = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`SELECT ${EQUIPMENT_FIELDS} FROM equipment ORDER BY created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error loading equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to load equipment' });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`SELECT ${EQUIPMENT_FIELDS} FROM equipment WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Equipment not found' });
    const [history] = await db.execute('SELECT * FROM equipment_maintenance WHERE equipment_id = ? ORDER BY maintenance_date DESC', [req.params.id]);
    res.json({ success: true, data: { ...rows[0], maintenance_history: history } });
  } catch (error) {
    console.error('Error loading equipment details:', error);
    res.status(500).json({ success: false, message: 'Unable to load equipment details' });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const db = getDB();
    const required = ['equipment_name', 'category', 'asset_id', 'quantity'];
    if (required.some((field) => !req.body[field])) return res.status(400).json({ success: false, message: 'Equipment name, category, asset ID and quantity are required' });
    const fields = Object.keys(req.body).filter((field) => EQUIPMENT_FIELDS.includes(field) && !['id', 'created_at', 'updated_at'].includes(field));
    const files = mapFiles(req.files);
    Object.entries(files).forEach(([key, value]) => { if (value) { fields.push(key); req.body[key] = value; } });
    const values = fields.map((field) => field === 'quantity' ? Number(req.body[field]) || 1 : nullable(req.body[field]));
    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await db.execute(`INSERT INTO equipment (${fields.join(', ')}) VALUES (${placeholders})`, values);
    res.status(201).json({ success: true, message: 'Equipment created', data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to save equipment' });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const db = getDB();
    const fields = Object.keys(req.body).filter((field) => EQUIPMENT_FIELDS.includes(field) && !['id', 'created_at', 'updated_at'].includes(field));
    const files = mapFiles(req.files);
    Object.entries(files).forEach(([key, value]) => { if (value) { fields.push(key); req.body[key] = value; } });
    if (!fields.length) return res.status(400).json({ success: false, message: 'No changes provided' });
    const values = fields.map((field) => field === 'quantity' ? Number(req.body[field]) || 1 : nullable(req.body[field]));
    await db.execute(`UPDATE equipment SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`, [...values, req.params.id]);
    res.json({ success: true, message: 'Equipment updated' });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to update equipment' });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const db = getDB();
    await db.execute('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Equipment deleted' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to delete equipment' });
  }
};

exports.addMaintenance = async (req, res) => {
  try {
    const db = getDB();
    const { maintenance_date, issue, service_provider, service_cost, technician, resolution, next_service_date, status, remarks } = req.body;
    if (!maintenance_date || !issue) return res.status(400).json({ success: false, message: 'Maintenance date and issue are required' });
    await db.execute(`INSERT INTO equipment_maintenance (equipment_id, maintenance_date, issue, service_provider, service_cost, technician, resolution, next_service_date, status, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.params.id, maintenance_date, issue, nullable(service_provider), Number(service_cost) || 0, nullable(technician), nullable(resolution), nullable(next_service_date), status || 'Completed', nullable(remarks)]);
    res.status(201).json({ success: true, message: 'Maintenance record added' });
  } catch (error) {
    console.error('Error adding maintenance:', error);
    res.status(500).json({ success: false, message: 'Unable to add maintenance record' });
  }
};
