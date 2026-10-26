const crypto = require('crypto');
const { getDB } = require('../config/db');

const allowedMethods = new Set(['Cash', 'UPI', 'Card', 'Bank Transfer']);
const moneyToCents = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 99999999.99
    ? Math.round((number + Number.EPSILON) * 100)
    : null;
};
const formatAmount = (cents) => (cents / 100).toFixed(2);
const validDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const actorId = (req) => req.user.user_id || req.user.email || req.user.username;

function buildFilters(query, alias = 'p') {
  const conditions = [];
  const values = [];
  const search = String(query.search || '').trim();
  if (search) {
    const term = `%${search}%`;
    conditions.push(`(${alias}.receipt_number LIKE ? OR ${alias}.transaction_id LIKE ? OR ${alias}.customer_name LIKE ? OR ${alias}.mobile LIKE ? OR ${alias}.application_number LIKE ? OR ${alias}.transaction_reference LIKE ?)`);
    values.push(term, term, term, term, term, term);
  }
  if (query.status && query.status !== 'All') {
    conditions.push(`${alias}.status = ?`);
    values.push(query.status);
  }
  if (query.category && query.category !== 'All') {
    conditions.push(`${alias}.category = ?`);
    values.push(query.category);
  }
  if (query.method && query.method !== 'All') {
    conditions.push(`${alias}.payment_method = ?`);
    values.push(query.method);
  }
  if (query.date_from) {
    if (!validDate(query.date_from)) throw new Error('Invalid start date');
    conditions.push(`${alias}.payment_date >= ?`);
    values.push(`${query.date_from} 00:00:00`);
  }
  if (query.date_to) {
    if (!validDate(query.date_to)) throw new Error('Invalid end date');
    conditions.push(`${alias}.payment_date < DATE_ADD(?, INTERVAL 1 DAY)`);
    values.push(`${query.date_to} 00:00:00`);
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values };
}

async function calculateSummary(db, where, values) {
  const [[totals]] = await db.execute(
    `SELECT
       COALESCE(SUM(p.amount_paid), 0) AS total_collection,
       COALESCE(SUM(CASE WHEN p.status IN ('Pending','Partially Paid') THEN p.total_amount - p.amount_paid ELSE 0 END), 0) AS pending_amount,
       SUM(CASE WHEN p.amount_paid > 0 THEN 1 ELSE 0 END) AS transaction_count,
       COALESCE(SUM(CASE WHEN DATE(p.payment_date) = CURDATE() THEN p.amount_paid ELSE 0 END), 0) AS today_collection
     FROM payments p ${where}`,
    values
  );
  const [refundRows] = await db.execute(
    `SELECT COALESCE(SUM(r.amount), 0) AS refunded_amount
     FROM payment_refunds r
     INNER JOIN payments p ON p.id = r.payment_id
     ${where ? `${where} AND` : 'WHERE'} r.status = 'Confirmed'`,
    values
  );
  const [methodRows] = await db.execute(
    `SELECT p.payment_method, COALESCE(SUM(p.amount_paid), 0) AS amount, COUNT(*) AS count
     FROM payments p ${where} ${where ? 'AND' : 'WHERE'} p.amount_paid > 0
     GROUP BY p.payment_method ORDER BY p.payment_method`,
    values
  );
  return {
    total_collection: Number(totals.total_collection),
    today_collection: Number(totals.today_collection),
    pending_amount: Number(totals.pending_amount),
    refunded_amount: Number(refundRows[0].refunded_amount),
    transaction_count: Number(totals.transaction_count || 0),
    by_method: methodRows.map((row) => ({ method: row.payment_method, amount: Number(row.amount), count: Number(row.count) })),
  };
}

exports.getOptions = async (_req, res) => {
  try {
    const db = getDB();
    const [services] = await db.execute(
      `SELECT id, service_name, category, government_fee, service_charge, gst_tax
       FROM services WHERE status = 'Active' ORDER BY service_name`
    );
    const [applications] = await db.execute(
      `SELECT a.id, CONCAT('APP-', a.id) AS application_number, a.applicant_name, a.mobile,
              a.service_id, s.service_name
       FROM applications a INNER JOIN services s ON s.id = a.service_id
       WHERE s.status = 'Active' ORDER BY a.created_at DESC LIMIT 500`
    );
    res.json({ success: true, data: { services, applications } });
  } catch (error) {
    console.error('Error loading payment options:', error);
    res.status(500).json({ success: false, message: 'Unable to load payment options.' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const db = getDB();
    const { where, values } = buildFilters(req.query);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const sortBy = req.query.sortBy === 'amount' ? 'p.total_amount' : 'p.payment_date';
    const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM payments p ${where}`, values);
    const [rows] = await db.execute(
      `SELECT p.*,
        COALESCE((SELECT SUM(r.amount) FROM payment_refunds r WHERE r.payment_id = p.id AND r.status = 'Confirmed'), 0) AS refunded_amount
       FROM payments p ${where}
       ORDER BY ${sortBy} ${sortDir}, p.id DESC LIMIT ? OFFSET ?`,
      [...values, limit, (page - 1) * limit]
    );
    const summary = await calculateSummary(db, where, values);
    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
      summary,
    });
  } catch (error) {
    if (error.message === 'Invalid start date' || error.message === 'Invalid end date') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Error loading payments:', error);
    res.status(500).json({ success: false, message: 'Unable to load payment records.' });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(
      `SELECT p.*,
        COALESCE((SELECT SUM(r.amount) FROM payment_refunds r WHERE r.payment_id = p.id AND r.status = 'Confirmed'), 0) AS refunded_amount
       FROM payments p WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Payment not found.' });
    const [audit] = await db.execute(
      'SELECT event_type, previous_status, new_status, details, actor_id, created_at FROM payment_audit WHERE payment_id = ? ORDER BY created_at DESC, id DESC',
      [req.params.id]
    );
    const [refunds] = await db.execute(
      'SELECT id, amount, reason, reference_number, status, requested_by, confirmed_by, refund_date, created_at FROM payment_refunds WHERE payment_id = ? ORDER BY created_at DESC, id DESC',
      [req.params.id]
    );
    res.json({ success: true, data: { ...rows[0], audit, refunds } });
  } catch (error) {
    console.error('Error loading payment details:', error);
    res.status(500).json({ success: false, message: 'Unable to load payment details.' });
  }
};

exports.createPayment = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();
  try {
    const {
      application_id: applicationId,
      service_id: serviceId,
      discount: rawDiscount = 0,
      payment_method: method,
      amount_received: rawAmountReceived,
      transaction_reference: reference,
      payment_date: paymentDate,
      notes,
      idempotency_key: idempotencyKey,
      cash_received_confirmed: cashConfirmed = false,
    } = req.body;
    const discountCents = moneyToCents(rawDiscount);
    const amountReceivedCents = method === 'Cash' ? moneyToCents(rawAmountReceived) : 0;
    const appId = Number(applicationId);
    const svcId = Number(serviceId);

    if (!Number.isInteger(appId) || appId < 1 || !Number.isInteger(svcId) || svcId < 1) {
      return res.status(400).json({ success: false, message: 'Select a valid existing application and service.' });
    }
    if (!allowedMethods.has(method)) {
      return res.status(400).json({ success: false, message: 'Select a supported payment method.' });
    }
    if (discountCents === null || !idempotencyKey || !/^[\w-]{16,80}$/.test(idempotencyKey)) {
      return res.status(400).json({ success: false, message: 'Enter a valid discount and submit again.' });
    }
    if ((reference !== undefined && typeof reference !== 'string') || String(reference || '').length > 120 || (notes !== undefined && typeof notes !== 'string') || String(notes || '').length > 1000) {
      return res.status(400).json({ success: false, message: 'Reference or notes exceed the allowed length.' });
    }
    if (!paymentDate || Number.isNaN(Date.parse(paymentDate)) || Date.parse(paymentDate) > Date.now() + 60000) {
      return res.status(400).json({ success: false, message: 'Enter a valid payment date that is not in the future.' });
    }
    if (method === 'Cash' && (cashConfirmed !== true || amountReceivedCents === null || amountReceivedCents < 1)) {
      return res.status(400).json({ success: false, message: 'Enter the cash amount physically received and confirm it before recording the payment.' });
    }

    await connection.beginTransaction();
    const [existingKey] = await connection.execute('SELECT id FROM payments WHERE idempotency_key = ?', [idempotencyKey]);
    if (existingKey.length) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'This payment submission has already been recorded.' });
    }

    const [rows] = await connection.execute(
      `SELECT a.id, a.applicant_name, a.mobile, a.service_id, s.service_name, s.category,
              s.government_fee, s.service_charge, s.gst_tax
       FROM applications a INNER JOIN services s ON s.id = a.service_id
       WHERE a.id = ? AND s.id = ? AND s.status = 'Active' FOR UPDATE`,
      [appId, svcId]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Application and service do not match an active service record.' });
    }
    const item = rows[0];
    if (!item.mobile || !/^[0-9+ ()-]{7,20}$/.test(item.mobile)) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'The application must have a valid customer mobile number.' });
    }
    const governmentCents = moneyToCents(item.government_fee);
    const serviceChargeCents = moneyToCents(item.service_charge);
    const taxCents = moneyToCents(item.gst_tax);
    const chargeCents = serviceChargeCents === null || taxCents === null ? null : serviceChargeCents + taxCents;
    if (governmentCents === null || chargeCents === null || discountCents > governmentCents + chargeCents) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'The service charges or discount are invalid.' });
    }
    const [existingPayment] = await connection.execute(
      `SELECT id FROM payments
       WHERE application_id = ? AND status NOT IN ('Failed', 'Refunded')
       LIMIT 1 FOR UPDATE`,
      [appId]
    );
    if (existingPayment.length) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'A pending or collected payment already exists for this application.' });
    }
    const totalCents = governmentCents + chargeCents - discountCents;
    if (totalCents > 9999999999) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Calculated service total exceeds the supported payment limit.' });
    }
    if (amountReceivedCents > totalCents) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Received amount cannot exceed the calculated service total.' });
    }
    const status = method !== 'Cash'
      ? 'Pending'
      : amountReceivedCents >= totalCents ? 'Paid' : 'Partially Paid';
    const now = new Date();
    const stamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
    const receiptNumber = `RCPT-${stamp}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const transactionId = `TXN-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const normalizedPaymentDate = new Date(paymentDate).toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await connection.execute(
      `INSERT INTO payments (
        receipt_number, transaction_id, idempotency_key, application_id, service_id,
        application_number, customer_name, mobile, service_name, category,
        government_fee, service_charge, discount, total_amount, amount_paid, payment_method,
        transaction_reference, status, payment_date, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receiptNumber, transactionId, idempotencyKey, appId, svcId, `APP-${appId}`,
        item.applicant_name, item.mobile || '', item.service_name, item.category,
        formatAmount(governmentCents), formatAmount(chargeCents), formatAmount(discountCents),
        formatAmount(totalCents), formatAmount(amountReceivedCents), method, String(reference || '').trim() || null, status,
        normalizedPaymentDate, String(notes || '').trim() || null, actorId(req),
      ]
    );
    await connection.execute(
      `INSERT INTO payment_audit (payment_id, event_type, previous_status, new_status, details, actor_id)
       VALUES (?, 'Created', NULL, ?, ?, ?)`,
      [result.insertId, status, JSON.stringify({
        payment_method: method,
        amount_received: formatAmount(amountReceivedCents),
        transaction_reference: String(reference || '').trim() || null,
        cash_received_confirmed: method === 'Cash',
      }), actorId(req)]
    );
    await connection.commit();
    res.status(201).json({
      success: true,
      message: method === 'Cash' ? 'Cash payment recorded and audited.' : 'Payment recorded as pending provider verification.',
      data: { id: result.insertId, receipt_number: receiptNumber, transaction_id: transactionId, status },
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This payment submission has already been recorded.' });
    }
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Unable to record payment.' });
  } finally {
    connection.release();
  }
};

exports.updatePaymentStatus = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();
  try {
    const { amount_received: rawAmountReceived, transaction_reference: reference, cash_received_confirmed: cashConfirmed } = req.body;
    const amountReceivedCents = moneyToCents(rawAmountReceived);
    if (cashConfirmed !== true || amountReceivedCents === null || amountReceivedCents < 1) {
      return res.status(400).json({ success: false, message: 'Enter the cash received and confirm that it was physically collected.' });
    }
    if (reference !== undefined && (typeof reference !== 'string' || reference.length > 120)) {
      return res.status(400).json({ success: false, message: 'Transaction reference cannot exceed 120 characters.' });
    }
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT id, payment_method, status, total_amount, amount_paid FROM payments WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }
    const payment = rows[0];
    if (payment.payment_method !== 'Cash' || !['Pending', 'Partially Paid'].includes(payment.status)) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Only pending or partially paid cash transactions can receive another cash collection.' });
    }
    const newAmountPaidCents = moneyToCents(payment.amount_paid) + amountReceivedCents;
    const totalCents = moneyToCents(payment.total_amount);
    if (newAmountPaidCents > totalCents) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Cash received cannot exceed the remaining balance.' });
    }
    const newStatus = newAmountPaidCents === totalCents ? 'Paid' : 'Partially Paid';
    await connection.execute('UPDATE payments SET status = ?, amount_paid = ? WHERE id = ?', [
      newStatus, formatAmount(newAmountPaidCents), payment.id,
    ]);
    await connection.execute(
      `INSERT INTO payment_audit (payment_id, event_type, previous_status, new_status, details, actor_id)
       VALUES (?, 'Cash Collection', ?, ?, ?, ?)`,
      [payment.id, payment.status, newStatus, JSON.stringify({
        amount_received: formatAmount(amountReceivedCents),
        amount_paid_total: formatAmount(newAmountPaidCents),
        cash_received_confirmed: true,
        transaction_reference: String(reference || '').trim() || null,
      }), actorId(req)]
    );
    await connection.commit();
    res.json({ success: true, message: newStatus === 'Paid' ? 'Remaining cash payment recorded.' : 'Partial cash collection recorded.', data: { status: newStatus } });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: 'Unable to update payment status.' });
  } finally {
    connection.release();
  }
};

exports.requestRefund = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();
  try {
    const amountCents = moneyToCents(req.body.amount);
    const reason = String(req.body.reason || '').trim();
    if (amountCents === null || amountCents === 0 || reason.length < 4 || reason.length > 500) {
      return res.status(400).json({ success: false, message: 'Enter a valid refund amount and reason.' });
    }
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT id, status, total_amount, amount_paid FROM payments WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }
    const payment = rows[0];
    if (!['Paid', 'Partially Refunded'].includes(payment.status)) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Only verified paid transactions are eligible for a refund.' });
    }
    const [[reserved]] = await connection.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payment_refunds WHERE payment_id = ? AND status IN ('Pending','Confirmed')",
      [payment.id]
    );
    if (moneyToCents(reserved.total) + amountCents > moneyToCents(payment.amount_paid)) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Refund amount exceeds the remaining eligible balance.' });
    }
    const [result] = await connection.execute(
      `INSERT INTO payment_refunds (payment_id, amount, reason, status, requested_by)
       VALUES (?, ?, ?, 'Pending', ?)`,
      [payment.id, formatAmount(amountCents), reason, actorId(req)]
    );
    await connection.execute(
      `INSERT INTO payment_audit (payment_id, event_type, previous_status, new_status, details, actor_id)
       VALUES (?, 'Refund Requested', ?, ?, ?, ?)`,
      [payment.id, payment.status, payment.status, JSON.stringify({ refund_id: result.insertId, amount: formatAmount(amountCents), reason }), actorId(req)]
    );
    await connection.commit();
    res.status(201).json({ success: true, message: 'Refund request saved as pending. Confirm it only after processing through the authorized refund source.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error requesting refund:', error);
    res.status(500).json({ success: false, message: 'Unable to record refund request.' });
  } finally {
    connection.release();
  }
};

exports.confirmRefund = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();
  try {
    const reference = String(req.body.reference_number || '').trim();
    if (req.body.confirmed !== true || reference.length < 3 || reference.length > 120) {
      return res.status(400).json({ success: false, message: 'Confirm that the authorized refund was processed and enter its reference.' });
    }
    await connection.beginTransaction();
    const [refundRows] = await connection.execute(
      `SELECT r.*, p.status AS payment_status, p.total_amount, p.amount_paid
       FROM payment_refunds r INNER JOIN payments p ON p.id = r.payment_id
       WHERE r.id = ? FOR UPDATE`,
      [req.params.refundId]
    );
    if (!refundRows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Refund request not found.' });
    }
    const refund = refundRows[0];
    if (refund.status !== 'Pending') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'This refund request is no longer pending.' });
    }
    await connection.execute(
      `UPDATE payment_refunds SET status = 'Confirmed', reference_number = ?, confirmed_by = ?, refund_date = CURRENT_TIMESTAMP WHERE id = ?`,
      [reference, actorId(req), refund.id]
    );
    const [[sum]] = await connection.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payment_refunds WHERE payment_id = ? AND status = 'Confirmed'",
      [refund.payment_id]
    );
    const newPaymentStatus = moneyToCents(sum.total) >= moneyToCents(refund.amount_paid) ? 'Refunded' : 'Partially Refunded';
    if (newPaymentStatus !== refund.payment_status) {
      await connection.execute('UPDATE payments SET status = ? WHERE id = ?', [newPaymentStatus, refund.payment_id]);
    }
    await connection.execute(
      `INSERT INTO payment_audit (payment_id, event_type, previous_status, new_status, details, actor_id)
       VALUES (?, 'Refund Confirmed', ?, ?, ?, ?)`,
      [refund.payment_id, refund.payment_status, newPaymentStatus, JSON.stringify({ refund_id: refund.id, amount: refund.amount, reference_number: reference }), actorId(req)]
    );
    await connection.commit();
    res.json({ success: true, message: 'Refund confirmation and audit record saved.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error confirming refund:', error);
    res.status(500).json({ success: false, message: 'Unable to confirm refund.' });
  } finally {
    connection.release();
  }
};
