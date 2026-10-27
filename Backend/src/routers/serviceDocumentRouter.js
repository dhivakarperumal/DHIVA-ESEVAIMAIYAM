const express = require('express');
const controller = require('../controllers/serviceDocumentController');
const { authenticate, authorize } = require('../security/authMiddleware');

const router = express.Router();
const documentManagers = [authenticate, authorize('Super Admin', 'Admin', 'Manager')];

router.get('/', (req, res, next) => {
  if (req.query.active === 'true' && req.query.service_id) return next();
  return documentManagers[0](req, res, (error) => {
    if (error) return next(error);
    documentManagers[1](req, res, next);
  });
}, controller.getDocuments);
router.post('/', ...documentManagers, controller.createDocument);
router.get('/:id', ...documentManagers, controller.getDocument);
router.put('/:id', ...documentManagers, controller.updateDocument);
router.delete('/:id', ...documentManagers, controller.deleteDocument);
router.patch('/:id/status', ...documentManagers, controller.updateStatus);
router.patch('/:id/reorder', ...documentManagers, controller.reorderDocument);

module.exports = router;