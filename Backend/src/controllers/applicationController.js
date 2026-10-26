const { getDB } = require('../config/db');

const applicationSelect = `
  SELECT applications.*, services.service_name, services.service_code
  FROM applications
  INNER JOIN services ON services.id = applications.service_id
`;

exports.getAllApplications = async (_req, res) => {
  try {
    const [rows] = await getDB().execute(`${applicationSelect} ORDER BY applications.created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const applicantName = String(req.body.applicant_name || '').trim();
    const mobile = String(req.body.mobile || '').trim();
    const email = String(req.body.email || '').trim();
    const serviceId = Number(req.body.service_id);
    const centerName = String(req.body.center_name || '').trim();
    const notes = String(req.body.notes || '').trim();

    if (applicantName.length < 2 || applicantName.length > 150) {
      return res.status(400).json({ success: false, message: 'Applicant name must be between 2 and 150 characters.' });
    }
    if (mobile && !/^[0-9+ -]{7,20}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid mobile number.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }
    if (!Number.isInteger(serviceId) || serviceId < 1) {
      return res.status(400).json({ success: false, message: 'Select a service.' });
    }

    const db = getDB();
    const [services] = await db.execute('SELECT id FROM services WHERE id = ? AND status = ?', [serviceId, 'Active']);
    if (!services.length) {
      return res.status(400).json({ success: false, message: 'Select an active service.' });
    }

    const [result] = await db.execute(
      `INSERT INTO applications (applicant_name, mobile, email, service_id, center_name, status, notes)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [applicantName, mobile || null, email || null, serviceId, centerName || null, notes || null]
    );
    const [rows] = await db.execute(`${applicationSelect} WHERE applications.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, message: 'Application added successfully.', data: rows[0] });
  } catch (error) {
    console.error('Error in createApplication:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const [result] = await getDB().execute('DELETE FROM applications WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    res.json({ success: true, message: 'Application deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteApplication:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
