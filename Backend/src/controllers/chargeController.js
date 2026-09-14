const { getDB } = require('../config/db');

const parseNumber = (value) => Number.parseFloat(value) || 0;

exports.getAllCharges = async (_req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`
      SELECT charges.*, services.service_name, services.service_code, services.category, services.provider_department
      FROM service_charges charges
      INNER JOIN services ON services.id = charges.service_id
      ORDER BY charges.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getAllCharges:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getCharge = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`SELECT charges.*, services.service_name, services.service_code, services.category, services.provider_department
      FROM service_charges charges INNER JOIN services ON services.id = charges.service_id WHERE charges.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Charge not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error in getCharge:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createCharge = async (req, res) => {
  try {
    const {
      service_id: serviceId, charge_name: chargeName, charge_type: chargeType, base_amount: baseAmount,
      gst_tax: gstTax, other_charges: otherCharges, discount, effective_from: effectiveFrom,
      effective_to: effectiveTo, status, remarks,
    } = req.body;

    if (!serviceId || !chargeName?.trim() || !chargeType || !effectiveFrom) {
      return res.status(400).json({ success: false, message: 'Service, charge name, charge type and effective date are required' });
    }

    const db = getDB();
    const [serviceRows] = await db.execute('SELECT id, service_name FROM services WHERE id = ? AND status = ?', [serviceId, 'Active']);
    if (!serviceRows.length) return res.status(400).json({ success: false, message: 'Select a valid active service' });

    const [duplicates] = await db.execute('SELECT id FROM service_charges WHERE service_id = ? AND charge_type = ?', [serviceId, chargeType]);
    if (duplicates.length) return res.status(409).json({ success: false, message: `A ${chargeType} charge already exists for this service` });

    const amount = parseNumber(baseAmount) + parseNumber(gstTax) + parseNumber(otherCharges) - parseNumber(discount);
    const [result] = await db.execute(`
      INSERT INTO service_charges (
        service_id, charge_name, charge_type, base_amount, gst_tax, other_charges, discount,
        total_amount, effective_from, effective_to, status, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [serviceId, chargeName.trim(), chargeType, parseNumber(baseAmount), parseNumber(gstTax), parseNumber(otherCharges), parseNumber(discount), amount, effectiveFrom, effectiveTo || null, status || 'Active', remarks || null]);

    res.status(201).json({ success: true, message: `Charge added successfully for ${serviceRows[0].service_name}.`, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error in createCharge:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'This charge type already exists for the selected service' });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateCharge = async (req, res) => {
  try {
    const {
      service_id: serviceId, charge_name: chargeName, charge_type: chargeType, base_amount: baseAmount,
      gst_tax: gstTax, other_charges: otherCharges, discount, effective_from: effectiveFrom,
      effective_to: effectiveTo, status, remarks,
    } = req.body;
    if (!serviceId || !chargeName?.trim() || !chargeType || !effectiveFrom) {
      return res.status(400).json({ success: false, message: 'Service, charge name, charge type and effective date are required' });
    }
    const db = getDB();
    const [serviceRows] = await db.execute('SELECT id FROM services WHERE id = ? AND status = ?', [serviceId, 'Active']);
    if (!serviceRows.length) return res.status(400).json({ success: false, message: 'Select a valid active service' });
    const [existing] = await db.execute('SELECT id FROM service_charges WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Charge not found' });
    const [duplicates] = await db.execute('SELECT id FROM service_charges WHERE service_id = ? AND charge_type = ? AND id <> ?', [serviceId, chargeType, req.params.id]);
    if (duplicates.length) return res.status(409).json({ success: false, message: `A ${chargeType} charge already exists for this service` });
    const total = parseNumber(baseAmount) + parseNumber(gstTax) + parseNumber(otherCharges) - parseNumber(discount);
    await db.execute(`UPDATE service_charges SET service_id = ?, charge_name = ?, charge_type = ?, base_amount = ?, gst_tax = ?,
      other_charges = ?, discount = ?, total_amount = ?, effective_from = ?, effective_to = ?, status = ?, remarks = ? WHERE id = ?`,
    [serviceId, chargeName.trim(), chargeType, parseNumber(baseAmount), parseNumber(gstTax), parseNumber(otherCharges), parseNumber(discount), total, effectiveFrom, effectiveTo || null, status || 'Active', remarks || null, req.params.id]);
    res.json({ success: true, message: 'Charge updated successfully.' });
  } catch (error) {
    console.error('Error in updateCharge:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'This charge type already exists for the selected service' });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteCharge = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.execute('DELETE FROM service_charges WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Charge not found' });
    res.json({ success: true, message: 'Charge deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCharge:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
