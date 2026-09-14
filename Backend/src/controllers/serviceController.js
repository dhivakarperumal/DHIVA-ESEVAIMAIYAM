const { getDB } = require('../config/db');

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM services ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map((row) => ({
      ...row,
      required_documents: parseJson(row.required_documents, []),
    })) });
  } catch (error) {
    console.error('Error in getAllServices:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getService = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: { ...rows[0], required_documents: parseJson(rows[0].required_documents, []) } });
  } catch (error) {
    console.error('Error in getService:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createService = async (req, res) => {
  try {
    const {
      service_name: serviceName,
      service_code: serviceCode,
      category,
      subcategory,
      description,
      provider_department: providerDepartment,
      portal_url: portalUrl,
      government_fee: governmentFee,
      service_charge: serviceCharge,
      gst_tax: gstTax,
      payment_type: paymentType,
      required_documents: requiredDocuments,
      document_instructions: documentInstructions,
      processing_time: processingTime,
      application_type: applicationType,
      service_availability: serviceAvailability,
      priority_service: priorityService,
      delivery_method: deliveryMethod,
      status,
      featured_service: featuredService,
      service_image: serviceImage,
      terms_conditions: termsConditions,
      additional_notes: additionalNotes,
    } = req.body;

    if (!serviceName?.trim() || !serviceCode?.trim() || !category?.trim()) {
      return res.status(400).json({ success: false, message: 'Service name, code and category are required' });
    }

    const db = getDB();
    const [existing] = await db.execute('SELECT id FROM services WHERE service_code = ?', [serviceCode.trim()]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Service code already exists' });
    }

    const [result] = await db.execute(`
      INSERT INTO services (
        service_name, service_code, category, subcategory, description, provider_department, portal_url,
        government_fee, service_charge, gst_tax, total_amount, payment_type, required_documents,
        document_instructions, processing_time, application_type, service_availability, priority_service,
        delivery_method, status, featured_service, service_image, terms_conditions, additional_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      serviceName.trim(), serviceCode.trim().toUpperCase(), category.trim(), subcategory || null, description || null,
      providerDepartment || null, portalUrl || null, Number(governmentFee) || 0, Number(serviceCharge) || 0,
      Number(gstTax) || 0, (Number(governmentFee) || 0) + (Number(serviceCharge) || 0) + (Number(gstTax) || 0),
      paymentType || 'Cash', JSON.stringify(requiredDocuments || []), documentInstructions || null,
      processingTime || null, applicationType || 'Online', serviceAvailability || 'All Days', priorityService || 'No',
      deliveryMethod || 'Online', status || 'Active', featuredService || 'No', serviceImage || null,
      termsConditions || null, additionalNotes || null,
    ]);

    res.status(201).json({ success: true, message: 'Service added successfully.', data: { id: result.insertId } });
  } catch (error) {
    console.error('Error in createService:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const {
      service_name: serviceName, service_code: serviceCode, category, subcategory, description,
      provider_department: providerDepartment, portal_url: portalUrl, government_fee: governmentFee,
      service_charge: serviceCharge, gst_tax: gstTax, payment_type: paymentType, required_documents: requiredDocuments,
      document_instructions: documentInstructions, processing_time: processingTime, application_type: applicationType,
      service_availability: serviceAvailability, priority_service: priorityService, delivery_method: deliveryMethod,
      status, featured_service: featuredService, service_image: serviceImage, terms_conditions: termsConditions,
      additional_notes: additionalNotes,
    } = req.body;

    if (!serviceName?.trim() || !serviceCode?.trim() || !category?.trim()) {
      return res.status(400).json({ success: false, message: 'Service name, code and category are required' });
    }

    const db = getDB();
    const [existing] = await db.execute('SELECT id FROM services WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Service not found' });
    const [duplicate] = await db.execute('SELECT id FROM services WHERE service_code = ? AND id <> ?', [serviceCode.trim().toUpperCase(), req.params.id]);
    if (duplicate.length) return res.status(409).json({ success: false, message: 'Service code already exists' });

    const values = [
      serviceName.trim(), serviceCode.trim().toUpperCase(), category.trim(), subcategory || null, description || null,
      providerDepartment || null, portalUrl || null, Number(governmentFee) || 0, Number(serviceCharge) || 0,
      Number(gstTax) || 0, (Number(governmentFee) || 0) + (Number(serviceCharge) || 0) + (Number(gstTax) || 0),
      paymentType || 'Cash', JSON.stringify(requiredDocuments || []), documentInstructions || null, processingTime || null,
      applicationType || 'Online', serviceAvailability || 'All Days', priorityService || 'No', deliveryMethod || 'Online',
      status || 'Active', featuredService || 'No', serviceImage || null, termsConditions || null, additionalNotes || null,
      req.params.id,
    ];
    await db.execute(`UPDATE services SET service_name = ?, service_code = ?, category = ?, subcategory = ?, description = ?,
      provider_department = ?, portal_url = ?, government_fee = ?, service_charge = ?, gst_tax = ?, total_amount = ?,
      payment_type = ?, required_documents = ?, document_instructions = ?, processing_time = ?, application_type = ?,
      service_availability = ?, priority_service = ?, delivery_method = ?, status = ?, featured_service = ?, service_image = ?,
      terms_conditions = ?, additional_notes = ? WHERE id = ?`, values);
    res.json({ success: true, message: 'Service updated successfully.' });
  } catch (error) {
    console.error('Error in updateService:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.execute('DELETE FROM services WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in deleteService:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
