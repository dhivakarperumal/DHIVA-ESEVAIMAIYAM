const fs = require('fs');
const path = require('path');
const { getDB } = require('../config/db');
const { uploadDirectory } = require('../middleware/equipmentUploadMiddleware');
const legacyUploadDirectory = path.resolve(__dirname, '../../uploads/receipts');
const fileFields = new Set(['equipment_photo', 'purchase_invoice', 'warranty_document']);

const equipmentFields = [
  'equipment_name', 'category', 'asset_id', 'brand', 'model_number', 'serial_number',
  'quantity', 'purchase_date', 'purchase_price', 'supplier_name', 'invoice_number',
  'invoice_date', 'warranty_start_date', 'warranty_end_date', 'amc_start_date',
  'amc_end_date', 'service_provider', 'service_contact_number', 'current_location',
  'assigned_staff', 'department', 'status', 'condition_name', 'last_maintenance_date',
  'next_maintenance_date', 'maintenance_remarks', 'equipment_photo', 'purchase_invoice',
  'warranty_document', 'remarks',
];
const dateFields = new Set([
  'purchase_date', 'invoice_date', 'warranty_start_date', 'warranty_end_date',
  'amc_start_date', 'amc_end_date', 'last_maintenance_date', 'next_maintenance_date',
]);
const textLimits = {
  equipment_name: 255, category: 100, asset_id: 100, brand: 100, model_number: 100,
  serial_number: 100, supplier_name: 255, invoice_number: 100, service_provider: 255,
  service_contact_number: 30, current_location: 255, assigned_staff: 255, department: 255,
};
const equipmentStatuses = ['Working', 'Under Maintenance', 'Damaged', 'Not Working', 'Retired'];
const maintenanceStatuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const nullable = (value) => value === '' || value === undefined ? null : value;
const validAmount = (value) =>
  /^\d{1,10}(\.\d{1,2})?$/.test(String(value)) && Number.isFinite(Number(value));
const validDate = (value) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const currentCentreDate = () => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date()).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};
const uploadedNames = (files = {}) => [
  ...(files.equipmentPhoto || []),
  ...(files.purchaseInvoice || []),
  ...(files.warrantyDocument || []),
].map((file) => file.path);
const removeFiles = async (files) => {
  await Promise.all(files.map((filePath) => fs.promises.unlink(filePath).catch((error) => {
    if (error.code !== 'ENOENT') console.error('Unable to remove equipment upload:', error);
  })));
};
const mapFiles = (files = {}) => ({
  equipment_photo: files.equipmentPhoto?.[0]?.filename || null,
  purchase_invoice: files.purchaseInvoice?.[0]?.filename || null,
  warranty_document: files.warrantyDocument?.[0]?.filename || null,
});
const validateEquipment = (body, creating) => {
  const name = String(body.equipment_name || '').trim();
  const category = String(body.category || '').trim();
  const assetId = String(body.asset_id || '').trim();
  if ((creating || body.equipment_name !== undefined) && (name.length < 2 || name.length > 255)) {
    return 'Equipment name must be between 2 and 255 characters.';
  }
  if ((creating || body.category !== undefined) && (!category || category.length > 100)) {
    return 'Select a valid equipment category.';
  }
  if ((creating || body.asset_id !== undefined) && (!assetId || assetId.length > 100)) {
    return 'Asset ID is required and must be no more than 100 characters.';
  }
  if (body.quantity !== undefined || creating) {
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) return 'Quantity must be a whole number greater than zero.';
  }
  if (body.purchase_price !== undefined && body.purchase_price !== '' && body.purchase_price !== null) {
    if (!validAmount(body.purchase_price)) return 'Enter a valid purchase price with up to two decimal places.';
  }
  for (const [field, maximum] of Object.entries(textLimits)) {
    if (body[field] !== undefined && String(body[field]).trim().length > maximum) {
      return `${field.replaceAll('_', ' ')} cannot exceed ${maximum} characters.`;
    }
  }
  for (const field of dateFields) {
    if (!validDate(body[field])) return `Enter a valid ${field.replaceAll('_', ' ')}.`;
  }
  if (body.status !== undefined && !equipmentStatuses.includes(body.status)) return 'Select a valid equipment status.';
  if (body.condition_name !== undefined && !['New', 'Good', 'Fair', 'Poor'].includes(body.condition_name)) return 'Select a valid equipment condition.';
  for (const [startField, endField] of [
    ['warranty_start_date', 'warranty_end_date'],
    ['amc_start_date', 'amc_end_date'],
  ]) {
    if (body[startField] && body[endField] && body[startField] > body[endField]) {
      return `${endField.replaceAll('_', ' ')} must be on or after its start date.`;
    }
  }
  return '';
};
const equipmentValue = (field, body, fileValues) => {
  if (field === 'quantity') return Number(body[field]);
  if (field === 'purchase_price') return nullable(body[field]) === null ? null : Number(body[field]);
  if (textLimits[field]) return String(body[field] || '').trim();
  return fileValues[field] || nullable(body[field]);
};

const EQUIPMENT_FIELDS = `id, equipment_name, category, asset_id, brand, model_number, serial_number,
  quantity, purchase_date, purchase_price, supplier_name, invoice_number, invoice_date,
  warranty_start_date, warranty_end_date, amc_start_date, amc_end_date, service_provider,
  service_contact_number, current_location, assigned_staff, department, status, condition_name,
  last_maintenance_date, next_maintenance_date, maintenance_remarks, equipment_photo,
  purchase_invoice, warranty_document, remarks, created_at, updated_at`;

exports.getAllEquipment = async (_req, res) => {
  try {
    const [rows] = await getDB().execute(`SELECT ${EQUIPMENT_FIELDS} FROM equipment ORDER BY created_at DESC, id DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error loading equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to load equipment.' });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
      return res.status(400).json({ success: false, message: 'Invalid equipment reference.' });
    }
    const db = getDB();
    const [rows] = await db.execute(`SELECT ${EQUIPMENT_FIELDS} FROM equipment WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Equipment not found.' });
    const [history] = await db.execute(
      'SELECT * FROM equipment_maintenance WHERE equipment_id = ? ORDER BY maintenance_date DESC, id DESC',
      [req.params.id],
    );
    res.json({ success: true, data: { ...rows[0], maintenance_history: history } });
  } catch (error) {
    console.error('Error loading equipment details:', error);
    res.status(500).json({ success: false, message: 'Unable to load equipment details.' });
  }
};

exports.createEquipment = async (req, res) => {
  const files = uploadedNames(req.files);
  try {
    const validationError = validateEquipment(req.body, true);
    if (validationError) {
      await removeFiles(files);
      return res.status(400).json({ success: false, message: validationError });
    }
    const fileValues = mapFiles(req.files);
    const fields = [...new Set([
      ...Object.keys(req.body).filter((field) => equipmentFields.includes(field) && !fileFields.has(field)),
      ...Object.entries(fileValues).filter(([, filename]) => filename).map(([field]) => field),
    ])];
    const values = fields.map((field) => equipmentValue(field, req.body, fileValues));
    const [result] = await getDB().execute(
      `INSERT INTO equipment (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values,
    );
    res.status(201).json({ success: true, message: 'Equipment registered successfully.', data: { id: result.insertId } });
  } catch (error) {
    await removeFiles(files);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'This Asset ID is already registered.' });
    console.error('Error creating equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to save equipment.' });
  }
};

exports.updateEquipment = async (req, res) => {
  const files = uploadedNames(req.files);
  try {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
      await removeFiles(files);
      return res.status(400).json({ success: false, message: 'Invalid equipment reference.' });
    }
    const validationError = validateEquipment(req.body, false);
    if (validationError) {
      await removeFiles(files);
      return res.status(400).json({ success: false, message: validationError });
    }
    const fileValues = mapFiles(req.files);
    const fields = [...new Set([
      ...Object.keys(req.body).filter((field) => equipmentFields.includes(field) && !fileFields.has(field)),
      ...Object.entries(fileValues).filter(([, filename]) => filename).map(([field]) => field),
    ])];
    if (!fields.length) return res.status(400).json({ success: false, message: 'No equipment changes were provided.' });
    const db = getDB();
    const [existing] = await db.execute(
      'SELECT equipment_photo, purchase_invoice, warranty_document FROM equipment WHERE id = ?',
      [req.params.id],
    );
    if (!existing.length) {
      await removeFiles(files);
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }
    const values = fields.map((field) => equipmentValue(field, req.body, fileValues));
    const [result] = await db.execute(
      `UPDATE equipment SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
      [...values, req.params.id],
    );
    if (!result.affectedRows) {
      await removeFiles(files);
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }
    const replacedFiles = [
      ['equipment_photo', 'equipmentPhoto'],
      ['purchase_invoice', 'purchaseInvoice'],
      ['warranty_document', 'warrantyDocument'],
    ].filter(([, field]) => req.files?.[field]?.length)
      .map(([field]) => existing[0][field])
      .filter((filename) => filename?.startsWith('equipment-'))
      .map((filename) => path.resolve(uploadDirectory, path.basename(filename)));
    await removeFiles(replacedFiles);
    res.json({ success: true, message: 'Equipment updated successfully.' });
  } catch (error) {
    await removeFiles(files);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'This Asset ID is already registered.' });
    console.error('Error updating equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to update equipment.' });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
      return res.status(400).json({ success: false, message: 'Invalid equipment reference.' });
    }
    const [existing] = await getDB().execute(
      'SELECT equipment_photo, purchase_invoice, warranty_document FROM equipment WHERE id = ?',
      [req.params.id],
    );
    if (!existing.length) return res.status(404).json({ success: false, message: 'Equipment not found.' });
    const [result] = await getDB().execute('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Equipment not found.' });
    await removeFiles(
      Object.values(existing[0])
        .filter((filename) => filename?.startsWith('equipment-'))
        .map((filename) => path.resolve(uploadDirectory, path.basename(filename))),
    );
    res.json({ success: true, message: 'Equipment deleted.' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ success: false, message: 'Unable to delete equipment.' });
  }
};

exports.addMaintenance = async (req, res) => {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
    return res.status(400).json({ success: false, message: 'Invalid equipment reference.' });
  }
  const {
    maintenance_date, issue, service_provider, service_cost, technician,
    resolution, next_service_date, status, remarks, equipment_status,
  } = req.body;
  const cost = service_cost === '' || service_cost === undefined || service_cost === null ? 0 : Number(service_cost);
  if (!validDate(maintenance_date) || !maintenance_date) {
    return res.status(400).json({ success: false, message: 'Enter a valid maintenance date.' });
  }
  if (next_service_date && !validDate(next_service_date)) {
    return res.status(400).json({ success: false, message: 'Enter a valid next service date.' });
  }
  if (next_service_date && maintenance_date && next_service_date < maintenance_date) {
    return res.status(400).json({ success: false, message: 'Next service date must be on or after the maintenance date.' });
  }
  if (String(issue || '').trim().length < 3 || String(issue).trim().length > 255) {
    return res.status(400).json({ success: false, message: 'Describe the maintenance issue in 3 to 255 characters.' });
  }
  if (String(service_provider || '').length > 255 || String(technician || '').length > 255) {
    return res.status(400).json({ success: false, message: 'Service provider and technician names cannot exceed 255 characters.' });
  }
  if (String(resolution || '').length > 60000 || String(remarks || '').length > 60000) {
    return res.status(400).json({ success: false, message: 'Resolution and remarks must be no more than 60,000 characters.' });
  }
  if (service_cost !== '' && service_cost !== undefined && service_cost !== null && !validAmount(service_cost)) {
    return res.status(400).json({ success: false, message: 'Enter a valid service cost with up to two decimal places.' });
  }
  if (status && !maintenanceStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Select a valid maintenance status.' });
  }
  if ((status || 'Completed') === 'Completed' && maintenance_date > currentCentreDate()) {
    return res.status(400).json({ success: false, message: 'A completed maintenance date cannot be in the future.' });
  }
  if (equipment_status && !equipmentStatuses.includes(equipment_status)) {
    return res.status(400).json({ success: false, message: 'Select a valid equipment status.' });
  }
  let connection;
  try {
    connection = await getDB().getConnection();
    await connection.beginTransaction();
    const [equipment] = await connection.execute('SELECT id FROM equipment WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!equipment.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }
    await connection.execute(
      `INSERT INTO equipment_maintenance
       (equipment_id, maintenance_date, issue, service_provider, service_cost, technician,
        resolution, next_service_date, status, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id,
        maintenance_date,
        String(issue).trim(),
        nullable(service_provider),
        cost,
        nullable(technician),
        nullable(resolution),
        nullable(next_service_date),
        status || 'Completed',
        nullable(remarks),
      ],
    );
    await connection.execute(
      `UPDATE equipment SET last_maintenance_date = IF(?, ?, last_maintenance_date),
         next_maintenance_date = COALESCE(?, next_maintenance_date),
         maintenance_remarks = ?,
         service_provider = COALESCE(?, service_provider),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [
        (status || 'Completed') === 'Completed',
        maintenance_date,
        nullable(next_service_date),
        nullable(remarks) || String(issue).trim(),
        nullable(service_provider),
        nullable(equipment_status),
        req.params.id,
      ],
    );
    await connection.commit();
    res.status(201).json({ success: true, message: 'Maintenance record saved.' });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Unable to roll back equipment maintenance:', rollbackError);
      }
    }
    console.error('Error adding equipment maintenance:', error);
    res.status(500).json({ success: false, message: 'Unable to save maintenance record.' });
  } finally {
    connection?.release();
  }
};

exports.getEquipmentFile = async (req, res) => {
  try {
    if (!['equipment_photo', 'purchase_invoice', 'warranty_document'].includes(req.params.fileType)) {
      return res.status(404).json({ success: false, message: 'Equipment document not found.' });
    }
    const [rows] = await getDB().execute(
      'SELECT equipment_photo, purchase_invoice, warranty_document FROM equipment WHERE id = ?',
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Equipment not found.' });
    const storedName = rows[0][req.params.fileType];
    if (!storedName) return res.status(404).json({ success: false, message: 'Equipment document not found.' });
    const isNewUpload = storedName.startsWith('equipment-');
    const filePath = isNewUpload
      ? path.resolve(uploadDirectory, path.basename(storedName))
      : path.resolve(legacyUploadDirectory, path.basename(storedName));
    const allowedDirectory = path.resolve(isNewUpload ? uploadDirectory : legacyUploadDirectory);
    if (!filePath.startsWith(`${allowedDirectory}${path.sep}`)) {
      return res.status(400).json({ success: false, message: 'Invalid equipment document path.' });
    }
    await fs.promises.access(filePath, fs.constants.R_OK);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(storedName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.sendFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ success: false, message: 'Equipment document file is unavailable.' });
    console.error('Error reading equipment document:', error);
    return res.status(500).json({ success: false, message: 'Unable to read equipment document.' });
  }
};
