const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentController = require('../controllers/documentController');

const router = express.Router();

// ⚡ FIX: Use absolute resolution so path remains identical regardless of where Node is run
const uploadDir = path.join(__dirname, '../uploads/documents');

// Ensure directory exists asynchronously before handling payloads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Router Checkpoint: Created upload directory at "${uploadDir}"`);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save directly to the absolutely resolved folder
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    // Sanitize the original file name and append a unique secure timestamp suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Reject anything that is not a PDF file
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDFs are accepted.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB file size limit threshold
});

// Route definitions
router.post('/', upload.single('file'), documentController.uploadDocument);
router.get('/', documentController.getAllDocuments);
router.get('/search', documentController.searchDocuments);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;