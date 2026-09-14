const express = require('express');
const controller = require('../controllers/serviceDocumentController');

const router = express.Router();
router.get('/', controller.getDocuments);
router.post('/', controller.createDocument);
router.get('/:id', controller.getDocument);
router.put('/:id', controller.updateDocument);
router.delete('/:id', controller.deleteDocument);
router.patch('/:id/status', controller.updateStatus);
router.patch('/:id/reorder', controller.reorderDocument);

module.exports = router;