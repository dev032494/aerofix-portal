const express = require('express');
const router = express.Router();
const docCtrl = require('../controllers/documentController');

// 📚 Master Technical Publication Library Endpoints
router.get('/', docCtrl.getLibraryCatalog);          // GET /api/v1/library -> Populates searchable catalog view
router.post('/', docCtrl.injectNewDocument);         // POST /api/v1/library -> Provisions a new base document track

// 🔄 Change Lifecycle Revision Tracking Interceptors
router.get('/:id/history', docCtrl.getDocumentHistory); // GET /api/v1/library/:id/history -> Unpacks revision history timeline
router.post('/:id/revisions', docCtrl.pushNewRevision);  // POST /api/v1/library/:id/revisions -> Supersedes old revisions & pins new active path

module.exports = router;