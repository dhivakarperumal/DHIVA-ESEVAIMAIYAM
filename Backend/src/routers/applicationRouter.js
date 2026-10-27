const express = require('express');
const fs = require('fs');
const controller = require('../controllers/applicationController');
const { authenticate, authorize } = require('../security/authMiddleware');
const { upload } = require('../middleware/applicationDocumentUpload');

const router = express.Router();
const applicationStaff = [authenticate, authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee')];
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.post('/track', asyncRoute(controller.trackApplication));
router.use(...applicationStaff);
router.get('/workflow/summary', controller.getWorkflowSummary);
router.get('/workflow/options', controller.getWorkflowOptions);
router.route('/').get(controller.getAllApplications).post(controller.createApplication);
router.post('/:id/document-requirements', controller.setDocumentApplicability);
router.get('/:id/documents/:documentId/preview', controller.previewDocument);
router.post('/:id/documents', upload.single('document'), asyncRoute(controller.uploadDocument));
router.delete('/:id/documents/:documentId', asyncRoute(controller.deleteApplicationDocument));
router.post('/:id/certificate', authorize('Super Admin', 'Admin', 'Manager'), upload.single('document'), asyncRoute(controller.uploadCertificate));
router.patch('/:id/documents/:documentId', controller.reviewDocument);
router.patch('/:id/workflow', controller.updateWorkflow);
router.patch('/:id/assignment', authorize('Super Admin', 'Admin', 'Manager'), controller.assignStaff);
router.get('/:id/certificate', controller.getCertificate);
router.get('/:id', controller.getApplication);
router.delete('/:id', controller.deleteApplication);

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (req.file?.path) {
    fs.promises.unlink(req.file.path).catch((cleanupError) => {
      if (cleanupError.code !== 'ENOENT') console.error('Unable to remove failed application upload:', cleanupError);
    });
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Application documents cannot exceed 10 MB.' });
  }
  if (error.code?.startsWith('LIMIT_') || error.message === 'Only PDF, JPEG, PNG, and WebP documents are accepted.') {
    return res.status(400).json({ success: false, message: error.message || 'Invalid document upload.' });
  }
  console.error('Application document upload failed:', error);
  return res.status(500).json({ success: false, message: 'Unable to process application document upload.' });
});

module.exports = router;
