const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); 
const documentRepository = require('../repositories/documentRepository');
const { Document } = require('../models'); 

// Guarantee upload directory exists recursively on server startup
const UPLOAD_DIR = path.join(__dirname, '../uploads/documents'); 
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const uploadDocument = async (req, res, next) => {
  try {
    // 🚨 RUNTIME DIAGNOSTICS: Print absolute paths and folder contents to find the ghost file
    const modelsDir = path.join(__dirname, '../models');
    console.log('==================================================');
    console.log('🔍 DEEP RUNTIME DIAGNOSTIC CHECK');
    console.log('📂 Models Directory Absolute Path:', modelsDir);
    console.log('📄 Files found inside this folder:', fs.readdirSync(modelsDir));
    console.log('🧬 Active model attributes loaded in memory:', Object.keys(Document.rawAttributes));
    console.log('==================================================');

    // 1. 💽 PHYSICAL UPLOAD: Multer has successfully written the physical file to disk
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'Please upload a valid PDF file.' });
    }

    console.log(`📡 Multer physical disk write success: ${req.file.path}`);

    const { title, document_type, aircraft_types, customization } = req.body;
    if (!title) {
      // 🧹 Cleanup: Delete the uploaded file immediately if validation fails
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: 'fail', message: 'Document title is required.' });
    }

    // STEP 2: GET THE CLEAN PUBLIC WEB PATH FOR THE DATABASE
    const fileName = path.basename(req.file.path);
    const dbFriendlyPath = `uploads/documents/${fileName}`; 

    // Normalize slashes on the physical disk path for PDFJS parsing safety
    const normalizedPhysicalPath = req.file.path.replace(/\\/g, '/');

    // 3. 🔍 PDF PARSING: Extract structural TOC outline and build search index *before* writing to DB
    let tableOfContents = [];
    let searchIndex = "";
    try {
      const parsedData = await documentRepository.parsePDF(normalizedPhysicalPath);
      tableOfContents = parsedData.toc;
      searchIndex = parsedData.searchIndexText;
    } catch (tocError) {
      console.warn(`⚠️ TOC indexing failed for document "${title}":`, tocError.message);
    }

    // Explicitly generate a cryptographically secure UUID v4 for the document ID
    const documentId = crypto.randomUUID();

    // 4. 💾 DATABASE INSERTION: Write the complete compiled payload
    const documentPayload = {
      id: documentId,
      title,
      file_path: dbFriendlyPath,
      document_type: document_type || 'SM',
      aircraft_types: aircraft_types || 'C150',
      customization: customization || 'CESSNA',
      table_of_contents: tableOfContents,
      search_index: searchIndex
    };

    console.log('Sending payload to repository:', documentPayload);

    const document = await documentRepository.create(documentPayload);

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded, indexed, and paths mapped successfully.',
      data: { document }
    });
  } catch (error) {
    // Clean up orphaned files from disk if the database write crashes
    // if (req.file && req.file.path && fs.existsSync(req.file.path)) {
    //   try {
    //     fs.unlinkSync(req.file.path);
    //     console.log(`🧹 Cleaned up orphaned file from disk: ${req.file.path}`);
    //   } catch (cleanupError) {
    //     console.error('Failed to clean up file after controller error:', cleanupError);
    //   }
    // }
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await documentRepository.findAll();
    res.status(200).json({ status: 'success', data: { documents } });
  } catch (error) {
    next(error);
  }
};

const searchDocuments = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ status: 'fail', message: 'Search term "q" is required.' });
    }

    const documents = await documentRepository.searchIndex(q);
    res.status(200).json({ status: 'success', results: documents.length, data: { documents } });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // We retrieve the document first to get the correct physical path for unlinking
    const document = await documentRepository.findById(id);
    if (!document) {
      return res.status(404).json({ status: 'fail', message: 'Document not found.' });
    }

    // Extract filename to resolve where it exists on physical disk
    const fileName = path.basename(document.file_path);
    const physicalPathOnDisk = path.join(UPLOAD_DIR, fileName);

    // Synchronously remove file from disk
    if (fs.existsSync(physicalPathOnDisk)) {
      fs.unlinkSync(physicalPathOnDisk);
    }

    // Destroy database record
    await document.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'Document and localized file deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  searchDocuments,
  deleteDocument
};