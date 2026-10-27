const crypto = require('crypto');
const { getDB } = require('../config/db');

const formatList = (value) => {
  if (Array.isArray(value)) return value;
  try { return value ? JSON.parse(String(value)) : []; } catch { return []; }
};

const fields = (body) => ({
  serviceId: Number(body.service_id),
  documentKey: String(body.document_key || '').trim(),
  documentName: String(body.document_name || '').trim(),
  documentType: String(body.document_type || '').trim(),
  requiredStatus: String(body.required_status || '').trim(),
  applicantType: String(body.applicant_type || 'All').trim(),
  documentDescription: String(body.document_description || '').trim(),
  acceptedFormats: formatList(body.accepted_formats),
  maxFileSize: String(body.max_file_size || '').trim(),
  numberOfDocuments: String(body.number_of_documents || 'Single').trim(),
  minFiles: Number(body.min_files),
  maxFiles: Number(body.max_files),
  issuingAuthority: String(body.issuing_authority || 'Other').trim(),
  conditionalRequirement: String(body.conditional_requirement || '').trim(),
  alternativeGroup: String(body.alternative_group || '').trim(),
  displayOrder: Number(body.display_order) || 1,
  status: String(body.status || 'Active').trim(),
});

const validate = (value) => {
  const allowedFormats = new Set(['PDF', 'JPG', 'JPEG', 'PNG']);
  if (!Number.isInteger(value.serviceId) || value.serviceId < 1 ||
      value.documentName.length < 2 || value.documentName.length > 255 ||
      !value.documentType || !['Required', 'Optional', 'Conditional'].includes(value.requiredStatus) ||
      !['Single', 'Multiple'].includes(value.numberOfDocuments) ||
      !['2 MB', '5 MB', '10 MB'].includes(value.maxFileSize) ||
      !['Active', 'Inactive'].includes(value.status) ||
      !Number.isInteger(value.displayOrder) || value.displayOrder < 1 ||
      !Number.isInteger(value.minFiles) || !Number.isInteger(value.maxFiles) ||
      value.minFiles < 0 || value.maxFiles < 1 || value.minFiles > value.maxFiles ||
      value.maxFiles > 20 || value.acceptedFormats.length === 0 ||
      value.acceptedFormats.some((format) => !allowedFormats.has(String(format).toUpperCase()))) {
    return 'Enter a valid service document, format, file count and status.';
  }
  if (value.numberOfDocuments === 'Single' && value.maxFiles !== 1) {
    return 'Single documents must have a maximum file count of 1.';
  }
  if (value.requiredStatus === 'Conditional' && !value.conditionalRequirement) {
    return 'Describe when this conditional document is required.';
  }
  return null;
};

const select = `SELECT documents.*, services.service_name, services.service_code
  FROM service_required_documents documents
  INNER JOIN services ON services.id = documents.service_id`;

exports.getDocuments = async (req, res) => {
  try {
    const db = getDB();
    const conditions = [];
    const params = [];
    if (req.query.service_id) {
      conditions.push('documents.service_id = ?');
      params.push(req.query.service_id);
    }
    if (req.query.active === 'true') conditions.push("documents.status = 'Active'");
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.execute(
      `${select}${where} ORDER BY documents.service_id, documents.display_order ASC, documents.id ASC`,
      params
    );
    res.json({ success: true, data: rows.map((row) => ({ ...row, accepted_formats: formatList(row.accepted_formats) })) });
  } catch (error) { console.error('Error in getDocuments:', error); res.status(500).json({ success: false, message: 'Server Error' }); }
};

exports.getDocument = async (req, res) => {
  try {
    const [rows] = await getDB().execute(`${select} WHERE documents.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: { ...rows[0], accepted_formats: formatList(rows[0].accepted_formats) } });
  } catch (error) { console.error('Error in getDocument:', error); res.status(500).json({ success: false, message: 'Server Error' }); }
};

exports.createDocument = async (req, res) => {
  try {
    const value = fields(req.body); const message = validate(value);
    if (message) return res.status(400).json({ success: false, message });
    const db = getDB();
    const [service] = await db.execute('SELECT id FROM services WHERE id = ?', [value.serviceId]);
    if (!service.length) return res.status(400).json({ success: false, message: 'Select a valid service' });
    const [duplicate] = await db.execute('SELECT id FROM service_required_documents WHERE service_id = ? AND LOWER(document_name) = LOWER(?)', [value.serviceId, value.documentName]);
    if (duplicate.length) return res.status(409).json({ success: false, message: 'This document already exists for the selected service' });
    const [last] = await db.execute('SELECT COALESCE(MAX(display_order), 0) AS last_order FROM service_required_documents WHERE service_id = ?', [value.serviceId]);
    const order = value.displayOrder > 1 ? value.displayOrder : last[0].last_order + 1;
    const documentKey = value.documentKey || crypto.randomUUID();
    const [result] = await db.execute(`INSERT INTO service_required_documents
      (document_key, service_id, document_name, document_type, required_status, applicant_type, document_description,
       accepted_formats, max_file_size, number_of_documents, min_files, max_files, issuing_authority,
       conditional_requirement, alternative_group, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      documentKey, value.serviceId, value.documentName, value.documentType, value.requiredStatus,
      value.applicantType, value.documentDescription || null, JSON.stringify(value.acceptedFormats.map((format) => String(format).toUpperCase())),
      value.maxFileSize, value.numberOfDocuments, value.minFiles, value.maxFiles, value.issuingAuthority,
      value.conditionalRequirement || null, value.alternativeGroup || null, order, value.status,
    ]);
    res.status(201).json({ success: true, message: 'Document added successfully.', data: { id: result.insertId, document_key: documentKey } });
  } catch (error) { console.error('Error in createDocument:', error); if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'This document already exists for the selected service' }); res.status(500).json({ success: false, message: 'Server Error' }); }
};

exports.updateDocument = async (req, res) => {
  try {
    const value = fields(req.body); const message = validate(value);
    if (message) return res.status(400).json({ success: false, message });
    const db = getDB();
    const [existing] = await db.execute('SELECT id FROM service_required_documents WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Document not found' });
    const [duplicate] = await db.execute('SELECT id FROM service_required_documents WHERE service_id = ? AND LOWER(document_name) = LOWER(?) AND id <> ?', [value.serviceId, value.documentName, req.params.id]);
    if (duplicate.length) return res.status(409).json({ success: false, message: 'This document already exists for the selected service' });
    await db.execute(`UPDATE service_required_documents SET service_id = ?, document_name = ?, document_type = ?,
      required_status = ?, applicant_type = ?, document_description = ?, accepted_formats = ?, max_file_size = ?,
      number_of_documents = ?, min_files = ?, max_files = ?, issuing_authority = ?, conditional_requirement = ?,
      alternative_group = ?, display_order = ?, status = ? WHERE id = ?`, [
      value.serviceId, value.documentName, value.documentType, value.requiredStatus, value.applicantType,
      value.documentDescription || null, JSON.stringify(value.acceptedFormats.map((format) => String(format).toUpperCase())),
      value.maxFileSize, value.numberOfDocuments, value.minFiles, value.maxFiles, value.issuingAuthority,
      value.conditionalRequirement || null, value.alternativeGroup || null, value.displayOrder, value.status, req.params.id,
    ]);
    res.json({ success: true, message: 'Document updated successfully.' });
  } catch (error) { console.error('Error in updateDocument:', error); if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'This document already exists for the selected service' }); res.status(500).json({ success: false, message: 'Server Error' }); }
};

exports.deleteDocument = async (req, res) => {
  try { const [result] = await getDB().execute('DELETE FROM service_required_documents WHERE id = ?', [req.params.id]); if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Document not found' }); res.json({ success: true, message: 'Document deleted successfully.' }); }
  catch (error) { console.error('Error in deleteDocument:', error); res.status(500).json({ success: false, message: 'Server Error' }); }
};

exports.updateStatus = async (req, res) => {
  try { const status = req.body.status === 'Inactive' ? 'Inactive' : 'Active'; const [result] = await getDB().execute('UPDATE service_required_documents SET status = ? WHERE id = ?', [status, req.params.id]); if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Document not found' }); res.json({ success: true, message: `Document ${status === 'Active' ? 'enabled' : 'disabled'} successfully.` }); }
  catch (error) { console.error('Error in updateStatus:', error); res.status(500).json({ success: false, message: 'Server Error' }); }
};

exports.reorderDocument = async (req, res) => {
  try { const order = Math.max(1, Number(req.body.display_order) || 1); const [result] = await getDB().execute('UPDATE service_required_documents SET display_order = ? WHERE id = ?', [order, req.params.id]); if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Document not found' }); res.json({ success: true, message: 'Document order updated.' }); }
  catch (error) { console.error('Error in reorderDocument:', error); res.status(500).json({ success: false, message: 'Server Error' }); }
};