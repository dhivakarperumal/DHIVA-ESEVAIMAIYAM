const { getDB } = require('../config/db');

const formatList = (value) => {
  if (Array.isArray(value)) return value;
  try { return value ? JSON.parse(String(value)) : []; } catch { return []; }
};

const fields = (body) => ({
  serviceId: Number(body.service_id),
  documentName: String(body.document_name || '').trim(),
  documentType: String(body.document_type || '').trim(),
  requiredStatus: String(body.required_status || '').trim(),
  applicantType: String(body.applicant_type || 'All').trim(),
  documentDescription: String(body.document_description || '').trim(),
  acceptedFormats: formatList(body.accepted_formats),
  maxFileSize: String(body.max_file_size || '').trim(),
  numberOfDocuments: String(body.number_of_documents || 'Single').trim(),
  issuingAuthority: String(body.issuing_authority || 'Other').trim(),
  displayOrder: Number(body.display_order) || 1,
  status: String(body.status || 'Active').trim(),
});

const validate = (value) => {
  if (!value.serviceId || !value.documentName || !value.documentType || !value.requiredStatus || !value.acceptedFormats.length || !['2 MB', '5 MB', '10 MB'].includes(value.maxFileSize)) {
    return 'Service, document name, type, required status, file format and maximum file size are required';
  }
  return null;
};

const select = `SELECT documents.*, services.service_name, services.service_code
  FROM service_required_documents documents
  INNER JOIN services ON services.id = documents.service_id`;

exports.getDocuments = async (req, res) => {
  try {
    const db = getDB();
    const params = [];
    let query = `${select} WHERE documents.service_id = ? ORDER BY documents.display_order ASC, documents.id ASC`;
    if (!req.query.service_id) return res.json({ success: true, data: [] });
    params.push(req.query.service_id);
    const [rows] = await db.execute(query, params);
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
    const [result] = await db.execute(`INSERT INTO service_required_documents
      (service_id, document_name, document_type, required_status, applicant_type, document_description, accepted_formats, max_file_size, number_of_documents, issuing_authority, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [value.serviceId, value.documentName, value.documentType, value.requiredStatus, value.applicantType, value.documentDescription || null, JSON.stringify(value.acceptedFormats), value.maxFileSize, value.numberOfDocuments, value.issuingAuthority, order, value.status]);
    res.status(201).json({ success: true, message: 'Document added successfully.', data: { id: result.insertId } });
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
    await db.execute(`UPDATE service_required_documents SET service_id = ?, document_name = ?, document_type = ?, required_status = ?, applicant_type = ?, document_description = ?, accepted_formats = ?, max_file_size = ?, number_of_documents = ?, issuing_authority = ?, display_order = ?, status = ? WHERE id = ?`, [value.serviceId, value.documentName, value.documentType, value.requiredStatus, value.applicantType, value.documentDescription || null, JSON.stringify(value.acceptedFormats), value.maxFileSize, value.numberOfDocuments, value.issuingAuthority, value.displayOrder, value.status, req.params.id]);
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