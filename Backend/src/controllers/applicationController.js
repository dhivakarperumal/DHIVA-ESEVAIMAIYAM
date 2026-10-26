const fs = require('fs');
const path = require('path');
const { getDB } = require('../config/db');

const documentDirectory = path.resolve(__dirname, '../../private/application-documents');
const workflowStatuses = [
  'Application Submitted',
  'Documents Under Verification',
  'Pending Additional Documents',
  'Pending Payment',
  'Ready for Approval',
  'Approved',
  'Certificate Generated',
  'Completed',
  'Rejected',
  'Cancelled',
];
const transitions = {
  'Application Submitted': ['Documents Under Verification'],
  'Documents Under Verification': ['Pending Additional Documents', 'Pending Payment', 'Ready for Approval'],
  'Pending Additional Documents': ['Documents Under Verification'],
  'Pending Payment': ['Documents Under Verification', 'Ready for Approval'],
  'Ready for Approval': [],
  Approved: [],
  'Certificate Generated': [],
  Completed: [],
  Rejected: [],
  Cancelled: [],
};
const terminalStatuses = new Set(['Rejected', 'Cancelled', 'Completed']);
const actorId = (req) => req.user.user_id || req.user.email || req.user.username;
const positiveId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const applicationSelect = `
  SELECT a.*, s.service_name, s.service_code, s.category,
    CONCAT('APP-', LPAD(a.id, 8, '0')) AS display_application_number,
    GREATEST(COALESCE(payment_totals.total_due, 0), COALESCE(s.total_amount, 0)) AS payment_total_due,
    COALESCE(payment_totals.amount_paid, 0) AS payment_amount_paid,
    CASE
      WHEN GREATEST(COALESCE(payment_totals.total_due, 0), COALESCE(s.total_amount, 0)) = 0 THEN 'Not Required'
      WHEN COALESCE(payment_totals.amount_paid, 0) >= GREATEST(COALESCE(payment_totals.total_due, 0), COALESCE(s.total_amount, 0)) THEN 'Paid'
      WHEN COALESCE(payment_totals.amount_paid, 0) > 0 THEN 'Partially Paid'
      ELSE 'Pending'
    END AS payment_status,
    (SELECT COUNT(*) FROM service_required_documents required
     WHERE required.service_id = a.service_id AND required.status = 'Active'
       AND required.required_status = 'Required') AS required_document_count,
    (SELECT COUNT(DISTINCT verified.document_name)
     FROM application_documents verified
     INNER JOIN service_required_documents required
       ON required.service_id = a.service_id
       AND required.document_name = verified.document_name
       AND required.status = 'Active'
       AND required.required_status = 'Required'
     WHERE verified.application_id = a.id AND verified.status = 'Verified') AS verified_required_document_count,
    staff.username AS assigned_staff_name
  FROM applications a
  INNER JOIN services s ON s.id = a.service_id
  LEFT JOIN users staff ON staff.id = a.assigned_staff_id
  LEFT JOIN (
    SELECT application_id, SUM(total_amount) AS total_due, SUM(amount_paid) AS amount_paid
    FROM payments
    WHERE status NOT IN ('Failed', 'Refunded')
    GROUP BY application_id
  ) payment_totals ON payment_totals.application_id = a.id
`;

const safeJson = (value) => {
  try { return value ? JSON.parse(value) : {}; } catch (error) {
    console.error('Unable to parse application audit details:', error);
    return {};
  }
};

async function getRequiredDocuments(db, serviceId) {
  const [documents] = await db.execute(
    `SELECT id, document_name, required_status, document_description, status
     FROM service_required_documents
     WHERE service_id = ? AND status = 'Active'
     ORDER BY display_order, id`,
    [serviceId]
  );
  return documents;
}

async function writeAudit(connection, applicationId, eventType, previousStatus, newStatus, details, userId) {
  await connection.execute(
    `INSERT INTO application_audit (application_id, event_type, previous_status, new_status, details, actor_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [applicationId, eventType, previousStatus || null, newStatus || null, JSON.stringify(details || {}), userId]
  );
}

async function recordNotification(connection, application, eventType, details) {
  await connection.execute(
    `INSERT INTO application_notifications (application_id, event_type, channel, recipient, delivery_status, details)
     VALUES (?, ?, 'Not Configured', ?, 'Not Configured', ?)`,
    [application.id, eventType, application.email || application.mobile || null, details]
  );
}

exports.getAllApplications = async (req, res) => {
  try {
    const db = getDB();
    const conditions = [];
    const values = [];
    const search = String(req.query.search || '').trim();
    if (search) {
      const term = `%${search}%`;
      conditions.push('(a.application_number LIKE ? OR CAST(a.id AS CHAR) LIKE ? OR a.applicant_name LIKE ? OR a.mobile LIKE ? OR s.service_name LIKE ? OR a.status LIKE ?)');
      values.push(term, term, term, term, term, term);
    }
    if (req.query.status && req.query.status !== 'All') {
      conditions.push('a.status = ?');
      values.push(req.query.status);
    }
    if (req.query.service_id && positiveId(req.query.service_id)) {
      conditions.push('a.service_id = ?');
      values.push(Number(req.query.service_id));
    }
    if (req.query.date_from) {
      conditions.push('a.created_at >= ?');
      values.push(`${req.query.date_from} 00:00:00`);
    }
    if (req.query.date_to) {
      conditions.push('a.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
      values.push(`${req.query.date_to} 00:00:00`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM applications a INNER JOIN services s ON s.id = a.service_id ${where}`, values);
    const [rows] = await db.execute(
      `${applicationSelect} ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, (page - 1) * limit]
    );
    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
    });
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve applications.' });
  }
};

exports.getWorkflowSummary = async (_req, res) => {
  try {
    const [rows] = await getDB().execute(`
      SELECT COUNT(*) AS total_applications,
        SUM(status IN ('Application Submitted', 'Pending', 'Documents Under Verification', 'Pending Additional Documents')) AS pending_verification,
        SUM(status = 'Approved') AS approved_applications,
        SUM(status = 'Rejected') AS rejected_applications,
        SUM(status = 'Completed') AS certificates_completed,
        SUM(status = 'Certificate Generated' AND certificate_path IS NOT NULL) AS certificates_ready
      FROM applications
    `);
    res.json({ success: true, data: Object.fromEntries(Object.entries(rows[0]).map(([key, value]) => [key, Number(value || 0)])) });
  } catch (error) {
    console.error('Error loading application summary:', error);
    res.status(500).json({ success: false, message: 'Unable to load application summary.' });
  }
};

exports.getWorkflowOptions = async (_req, res) => {
  try {
    const db = getDB();
    const [services] = await db.execute("SELECT id, service_name, category FROM services WHERE status = 'Active' ORDER BY service_name");
    const [staff] = await db.execute(
      `SELECT id, user_id, username, role FROM users
       WHERE status = 'Active' AND role IN ('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee')
       ORDER BY username`
    );
    res.json({ success: true, data: { services, staff, workflow_statuses: workflowStatuses } });
  } catch (error) {
    console.error('Error loading application workflow options:', error);
    res.status(500).json({ success: false, message: 'Unable to load workflow options.' });
  }
};

exports.getApplication = async (req, res) => {
  try {
    if (!positiveId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid application reference.' });
    const db = getDB();
    const [rows] = await db.execute(`${applicationSelect} WHERE a.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Application not found.' });
    const application = rows[0];
    const requiredDocuments = await getRequiredDocuments(db, application.service_id);
    const [documents] = await db.execute(
      `SELECT id, document_name, original_name, mime_type, file_size, status, reviewer_remarks,
              uploaded_by, reviewed_by, reviewed_at, created_at
       FROM application_documents WHERE application_id = ? ORDER BY created_at, id`,
      [application.id]
    );
    const [payments] = await db.execute(
      `SELECT receipt_number, transaction_id, total_amount, amount_paid, payment_method,
              transaction_reference, status, payment_date
       FROM payments WHERE application_id = ? ORDER BY created_at DESC, id DESC`,
      [application.id]
    );
    const [auditRows] = await db.execute(
      `SELECT event_type, previous_status, new_status, details, actor_id, created_at
       FROM application_audit WHERE application_id = ? ORDER BY created_at DESC, id DESC`,
      [application.id]
    );
    const [notifications] = await db.execute(
      `SELECT event_type, channel, delivery_status, details, created_at
       FROM application_notifications WHERE application_id = ? ORDER BY created_at DESC, id DESC`,
      [application.id]
    );
    res.json({
      success: true,
      data: {
        ...application,
        required_documents: requiredDocuments,
        documents,
        payments,
        timeline: auditRows.map((event) => ({ ...event, details: safeJson(event.details) })),
        notifications,
      },
    });
  } catch (error) {
    console.error('Error in getApplication:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve application details.' });
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
    if (!services.length) return res.status(400).json({ success: false, message: 'Select a valid active service.' });

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO applications (applicant_name, mobile, email, service_id, center_name, status, notes)
         VALUES (?, ?, ?, ?, ?, 'Application Submitted', ?)`,
        [applicantName, mobile || null, email || null, serviceId, centerName || null, notes || null]
      );
      const applicationNumber = `APP-${String(result.insertId).padStart(8, '0')}`;
      await connection.execute('UPDATE applications SET application_number = ? WHERE id = ?', [applicationNumber, result.insertId]);
      await writeAudit(connection, result.insertId, 'Application Received', null, 'Application Submitted', {}, actorId(req));
      await recordNotification(connection, { id: result.insertId, email, mobile }, 'Application Received', 'No SMS or email delivery integration is configured.');
      await connection.commit();
      const [rows] = await db.execute(`${applicationSelect} WHERE a.id = ?`, [result.insertId]);
      res.status(201).json({ success: true, message: 'Application added successfully.', data: rows[0] });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in createApplication:', error);
    res.status(500).json({ success: false, message: 'Unable to create application.' });
  }
};

exports.updateWorkflow = async (req, res) => {
  if (!positiveId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid application reference.' });
  const db = getDB();
  const connection = await db.getConnection();
  try {
    const { status, reason, remarks } = req.body;
    if (!workflowStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Select a valid workflow status.' });
    if (['Approved', 'Certificate Generated', 'Completed'].includes(status)) {
      return res.status(403).json({
        success: false,
        message: status === 'Approved'
          ? 'Government approval is unavailable: no authorized government officer or external approval source is configured.'
          : 'Official certificate retrieval and completion confirmation are unavailable because no authorized government certificate source is configured.',
      });
    }
    const normalizedReason = String(reason || '').trim();
    const normalizedRemarks = String(remarks || '').trim();
    if (['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(status) && normalizedReason.length < 4) {
      return res.status(400).json({ success: false, message: 'A reason of at least 4 characters is required for this action.' });
    }
    if (normalizedReason.length > 1000 || normalizedRemarks.length > 4000) {
      return res.status(400).json({ success: false, message: 'Reason or remarks exceed the allowed length.' });
    }

    await connection.beginTransaction();
    const [applications] = await connection.execute('SELECT * FROM applications WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!applications.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    const application = applications[0];
    if (terminalStatuses.has(application.status)) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'This application is already in a terminal status.' });
    }
    if (status !== 'Rejected' && status !== 'Cancelled' && !transitions[application.status]?.includes(status)) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: `Cannot move an application from ${application.status} to ${status}.` });
    }

    if (status === 'Ready for Approval') {
      const [required] = await connection.execute(
        `SELECT d.document_name FROM service_required_documents d
         WHERE d.service_id = ? AND d.status = 'Active' AND d.required_status = 'Required'`,
        [application.service_id]
      );
      const [verified] = await connection.execute(
        `SELECT document_name FROM application_documents
         WHERE application_id = ? AND status = 'Verified'`,
        [application.id]
      );
      const verifiedNames = new Set(verified.map((document) => document.document_name.toLowerCase()));
      const missing = required.filter((document) => !verifiedNames.has(document.document_name.toLowerCase()));
      if (missing.length) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Verify required documents first: ${missing.map((document) => document.document_name).join(', ')}.` });
      }
      const [[service]] = await connection.execute(
        'SELECT total_amount FROM services WHERE id = ?',
        [application.service_id]
      );
      const [[payments]] = await connection.execute(
        `SELECT COALESCE(SUM(total_amount), 0) AS total_due, COALESCE(SUM(amount_paid), 0) AS amount_paid
         FROM payments WHERE application_id = ? AND status NOT IN ('Failed', 'Refunded')`,
        [application.id]
      );
      if (Number(service.total_amount) > 0 && Number(payments.amount_paid) < Math.max(Number(service.total_amount), Number(payments.total_due))) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Verified full payment is required before this application can be ready for approval.' });
      }
    }

    const updateFields = ['status = ?', 'status_reason = ?'];
    const updateValues = [status, normalizedReason || null];
    if (normalizedRemarks) {
      updateFields.push('notes = ?');
      updateValues.push(normalizedRemarks);
    }
    updateValues.push(application.id);
    await connection.execute(`UPDATE applications SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    await writeAudit(
      connection,
      application.id,
      status === 'Rejected' ? 'Application Rejected' : status === 'Cancelled' ? 'Application Cancelled' : 'Status Changed',
      application.status,
      status,
      { reason: normalizedReason || null, remarks: normalizedRemarks || null },
      actorId(req)
    );
    if (status === 'Pending Additional Documents') {
      await recordNotification(connection, application, 'Documents Required', 'Notification is recorded as not configured; no message was sent.');
    } else if (status === 'Pending Payment') {
      await recordNotification(connection, application, 'Payment Pending', 'Notification is recorded as not configured; no message was sent.');
    } else if (status === 'Rejected') {
      await recordNotification(connection, application, 'Application Rejected', normalizedReason);
    }
    await connection.commit();
    const [updated] = await db.execute(`${applicationSelect} WHERE a.id = ?`, [application.id]);
    res.json({ success: true, message: 'Application workflow updated.', data: updated[0] });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating application workflow:', error);
    res.status(500).json({ success: false, message: 'Unable to update application workflow.' });
  } finally {
    connection.release();
  }
};

exports.assignStaff = async (req, res) => {
  if (!positiveId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid application reference.' });
  const staffId = req.body.staff_id === null || req.body.staff_id === '' ? null : Number(req.body.staff_id);
  if (staffId !== null && (!Number.isInteger(staffId) || staffId < 1)) {
    return res.status(400).json({ success: false, message: 'Select a valid staff member.' });
  }
  const connection = await getDB().getConnection();
  try {
    await connection.beginTransaction();
    const [applications] = await connection.execute('SELECT id, status, assigned_staff_id FROM applications WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!applications.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    if (staffId !== null) {
      const [staff] = await connection.execute(
        `SELECT id FROM users WHERE id = ? AND status = 'Active'
         AND role IN ('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee')`,
        [staffId]
      );
      if (!staff.length) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Select an active authorized staff account.' });
      }
    }
    await connection.execute('UPDATE applications SET assigned_staff_id = ? WHERE id = ?', [staffId, req.params.id]);
    await writeAudit(connection, Number(req.params.id), 'Staff Assigned', applications[0].status, applications[0].status, { staff_id: staffId }, actorId(req));
    await connection.commit();
    res.json({ success: true, message: 'Application assignment updated.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error assigning application:', error);
    res.status(500).json({ success: false, message: 'Unable to assign staff.' });
  } finally {
    connection.release();
  }
};

exports.reviewDocument = async (req, res) => {
  if (!positiveId(req.params.id) || !positiveId(req.params.documentId)) {
    return res.status(400).json({ success: false, message: 'Invalid application or document reference.' });
  }
  const { status } = req.body;
  const remarks = String(req.body.remarks || '').trim();
  if (!['Verified', 'Rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Select Verified or Rejected.' });
  if (status === 'Rejected' && remarks.length < 4) return res.status(400).json({ success: false, message: 'A reason is required when rejecting a document.' });
  if (remarks.length > 1000) return res.status(400).json({ success: false, message: 'Document remarks cannot exceed 1000 characters.' });
  const connection = await getDB().getConnection();
  try {
    await connection.beginTransaction();
    const [documents] = await connection.execute(
      `SELECT d.*, a.status AS application_status FROM application_documents d
       INNER JOIN applications a ON a.id = d.application_id
       WHERE d.id = ? AND d.application_id = ? FOR UPDATE`,
      [req.params.documentId, req.params.id]
    );
    if (!documents.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Submitted document not found.' });
    }
    if (terminalStatuses.has(documents[0].application_status)) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Documents cannot be reviewed for a closed application.' });
    }
    if (documents[0].application_status !== 'Documents Under Verification') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Move the application to Documents Under Verification before reviewing documents.' });
    }
    await connection.execute(
      `UPDATE application_documents SET status = ?, reviewer_remarks = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, remarks || null, actorId(req), req.params.documentId]
    );
    await writeAudit(
      connection,
      Number(req.params.id),
      `Document ${status}`,
      documents[0].application_status,
      documents[0].application_status,
      { document_id: Number(req.params.documentId), document_name: documents[0].document_name, remarks: remarks || null },
      actorId(req)
    );
    await connection.commit();
    res.json({ success: true, message: `Document marked ${status.toLowerCase()}.` });
  } catch (error) {
    await connection.rollback();
    console.error('Error reviewing application document:', error);
    res.status(500).json({ success: false, message: 'Unable to update document review.' });
  } finally {
    connection.release();
  }
};

exports.uploadDocument = async (req, res) => {
  if (!positiveId(req.params.id)) {
    if (req.file) await fs.promises.unlink(req.file.path);
    return res.status(400).json({ success: false, message: 'Invalid application reference.' });
  }
  if (!req.file) return res.status(400).json({ success: false, message: 'Select a PDF, JPEG, PNG or WebP document.' });
  const extension = path.extname(req.file.originalname).toLowerCase();
  const allowed = {
    '.pdf': ['application/pdf', Buffer.from('%PDF-')],
    '.jpg': ['image/jpeg', Buffer.from([0xff, 0xd8, 0xff])],
    '.jpeg': ['image/jpeg', Buffer.from([0xff, 0xd8, 0xff])],
    '.png': ['image/png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    '.webp': ['image/webp', Buffer.from('RIFF')],
  };
  const format = allowed[extension];
  const fileHandle = await fs.promises.open(req.file.path, 'r');
  const signature = Buffer.alloc(format?.[1].length || 1);
  try {
    await fileHandle.read(signature, 0, signature.length, 0);
  } finally {
    await fileHandle.close();
  }
  if (!format || req.file.mimetype !== format[0] || !signature.equals(format[1])) {
    await fs.promises.unlink(req.file.path);
    return res.status(400).json({ success: false, message: 'The file type did not pass content validation.' });
  }
  if (extension === '.webp') {
    const header = await fs.promises.readFile(req.file.path);
    if (header.subarray(8, 12).toString() !== 'WEBP') {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ success: false, message: 'The image did not pass WebP validation.' });
    }
  }
  const documentName = String(req.body.document_name || '').trim();
  if (documentName.length < 2 || documentName.length > 255) {
    await fs.promises.unlink(req.file.path);
    return res.status(400).json({ success: false, message: 'Select a valid required document name.' });
  }
  const db = getDB();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [apps] = await connection.execute(
      'SELECT id, service_id, status FROM applications WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    if (!apps.length) {
      await connection.rollback();
      await fs.promises.unlink(req.file.path);
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    if (terminalStatuses.has(apps[0].status) || ['Approved', 'Certificate Generated'].includes(apps[0].status)) {
      await connection.rollback();
      await fs.promises.unlink(req.file.path);
      return res.status(409).json({ success: false, message: 'Documents cannot be added to a closed or approved application.' });
    }
    const [required] = await connection.execute(
      `SELECT id FROM service_required_documents
       WHERE service_id = ? AND document_name = ? AND status = 'Active'`,
      [apps[0].service_id, documentName]
    );
    if (!required.length) {
      await connection.rollback();
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ success: false, message: 'Select a document configured as required for this service.' });
    }
    const originalName = path.basename(req.file.originalname).slice(0, 255);
    const [result] = await connection.execute(
      `INSERT INTO application_documents
       (application_id, document_name, stored_name, original_name, mime_type, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [apps[0].id, documentName, path.basename(req.file.filename), originalName, req.file.mimetype, req.file.size, actorId(req)]
    );
    await writeAudit(connection, apps[0].id, 'Document Uploaded', apps[0].status, apps[0].status, { document_id: result.insertId, document_name: documentName }, actorId(req));
    await connection.commit();
    res.status(201).json({ success: true, message: 'Document securely uploaded for review.', data: { id: result.insertId } });
  } catch (error) {
    await connection.rollback();
    await fs.promises.unlink(req.file.path).catch((unlinkError) => {
      if (unlinkError.code !== 'ENOENT') console.error('Unable to remove rejected application document:', unlinkError);
    });
    console.error('Error uploading application document:', error);
    res.status(500).json({ success: false, message: 'Unable to save the uploaded document.' });
  } finally {
    connection.release();
  }
};

exports.previewDocument = async (req, res) => {
  try {
    const [rows] = await getDB().execute(
      'SELECT stored_name, original_name, mime_type FROM application_documents WHERE id = ? AND application_id = ?',
      [req.params.documentId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Document not found.' });
    const filePath = path.resolve(documentDirectory, path.basename(rows[0].stored_name));
    if (!filePath.startsWith(`${documentDirectory}${path.sep}`)) return res.status(400).json({ success: false, message: 'Invalid document path.' });
    await fs.promises.access(filePath, fs.constants.R_OK);
    res.setHeader('Content-Type', rows[0].mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(rows[0].original_name).replace(/["\r\n]/g, '_')}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ success: false, message: 'Document file is unavailable.' });
    console.error('Error previewing application document:', error);
    res.status(500).json({ success: false, message: 'Unable to preview document.' });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const [rows] = await getDB().execute(
      `SELECT status, certificate_path, certificate_reference
       FROM applications WHERE id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (rows[0].status !== 'Certificate Generated' || !rows[0].certificate_path || !rows[0].certificate_reference) {
      return res.status(404).json({ success: false, message: 'No certificate is available from an authorized source for this application.' });
    }
    return res.status(409).json({ success: false, message: 'Certificate storage is not connected to an authorized government source.' });
  } catch (error) {
    console.error('Error retrieving application certificate:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve certificate.' });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    return res.status(409).json({
      success: false,
      message: 'Applications are retained for financial and workflow audit. Cancel the application with a reason instead.',
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ success: false, message: 'Unable to update application.' });
  }
};
