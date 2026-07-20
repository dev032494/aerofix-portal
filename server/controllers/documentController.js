const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); 
const documentRepository = require('../repositories/documentRepository');
const activityLogRepository = require('../repositories/activityLogRepository'); // ⚡ ADDED: Activity log repository
const { Document } = require('../models'); 

// Guarantee upload directory exists recursively on server startup
const UPLOAD_DIR = path.join(__dirname, '../uploads/documents'); 
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Extract request context metadata
 */
const getReqContext = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  userAgent: req.headers['user-agent'],
  method: req.method,
  path: req.originalUrl,
  userId: req.user ? req.user.id : null
});

const uploadDocument = async (req, res, next) => {
  const ctx = getReqContext(req);
  try {
    // 🚨 RUNTIME DIAGNOSTICS: Print absolute paths and folder contents
    const modelsDir = path.join(__dirname, '../models');
    console.log('==================================================');
    console.log('🔍 DEEP RUNTIME DIAGNOSTIC CHECK');
    console.log('📂 Models Directory Absolute Path:', modelsDir);
    console.log('📄 Files found inside this folder:', fs.readdirSync(modelsDir));
    console.log('🧬 Active model attributes loaded in memory:', Object.keys(Document.rawAttributes));
    console.log('==================================================');

    // 1. 💽 PHYSICAL UPLOAD: Check Multer file existence
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

    // ⚡ LOG: Record document upload event in Activity Logs
    await activityLogRepository.createLog({
      userId: ctx.userId,
      action: 'DOCUMENT_UPLOADED',
      module: 'DOCUMENTS',
      description: `Document "${title}" [${documentPayload.document_type}] uploaded and indexed successfully.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 201,
      payload: {
        documentId: document.id,
        title: document.title,
        documentType: document.document_type,
        aircraftTypes: document.aircraft_types,
        filePath: dbFriendlyPath
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded, indexed, and paths mapped successfully.',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  const ctx = getReqContext(req);
  try {
    const documents = await documentRepository.findAll();

    // ⚡ LOG: Record document library view action
    await activityLogRepository.createLog({
      userId: ctx.userId,
      action: 'DOCUMENTS_VIEWED',
      module: 'DOCUMENTS',
      description: `Tech library documents directory queried. Total documents retrieved: ${documents.length}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 200
    });

    res.status(200).json({ status: 'success', data: { documents } });
  } catch (error) {
    next(error);
  }
};

const searchDocuments = async (req, res, next) => {
  const ctx = getReqContext(req);
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ status: 'fail', message: 'Search term "q" is required.' });
    }

    const documents = await documentRepository.searchIndex(q);

    // ⚡ LOG: Record document search query
    await activityLogRepository.createLog({
      userId: ctx.userId,
      action: 'DOCUMENTS_SEARCHED',
      module: 'DOCUMENTS',
      description: `Searched document library with keyword: [${q}]. Found ${documents.length} matches.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 200,
      payload: { query: q, matchesFound: documents.length }
    });

    res.status(200).json({ status: 'success', results: documents.length, data: { documents } });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  const ctx = getReqContext(req);
  try {
    const { id } = req.params;
    
    // Retrieve the document first to get the correct physical path for unlinking
    const document = await documentRepository.findById(id);
    if (!document) {
      return res.status(404).json({ status: 'fail', message: 'Document not found.' });
    }

    const documentTitle = document.title;
    const filePath = document.file_path;

    // Extract filename to resolve where it exists on physical disk
    const fileName = path.basename(filePath);
    const physicalPathOnDisk = path.join(UPLOAD_DIR, fileName);

    // Synchronously remove file from disk
    if (fs.existsSync(physicalPathOnDisk)) {
      fs.unlinkSync(physicalPathOnDisk);
    }

    // Destroy database record
    await document.destroy();

    // ⚡ LOG: Record document deletion event
    await activityLogRepository.createLog({
      userId: ctx.userId,
      action: 'DOCUMENT_DELETED',
      module: 'DOCUMENTS',
      description: `Document "${documentTitle}" (ID: ${id}) and its associated disk file were permanently deleted.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 200,
      payload: { documentId: id, title: documentTitle, filePath }
    });

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