const documentRepository = require('../repositories/documentRepository');

/**
 * GET /api/v1/library
 * Resolves filtered documents listing based on the Context Sidebar selections
 */
const getLibraryCatalog = async (req, res, next) => {
  try {
    const { customization, aircraft, doctypes } = req.query;
    const documents = await documentRepository.findByContext({ 
      customization, 
      aircraft, 
      doctypes 
    });
    
    res.status(200).json({ 
      status: 'success', 
      data: { documents } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/library/:id/history
 * Unpacks historical revision logs mapping to an explicitly requested documentation ID
 */
const getDocumentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentRepository.findDocumentHistory(id);
    
    if (!document) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'Technical publication index file not found matching that pointer.' 
      });
    }
    
    res.status(200).json({ 
      status: 'success', 
      data: { document } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/library
 * Commits a baseline manual tracking row while binding its initial effective revision leaf
 */
const injectNewDocument = async (req, res, next) => {
  try {
    // Robust extraction layers supporting both standard snake_case and camelCase parameters
    const title = req.body.title;
    const document_type = req.body.document_type || req.body.documentType;
    const aircraft_types = req.body.aircraft_types || req.body.aircraftTypes;
    const customization = req.body.customization || 'DEFAULT';
    const revision_number = req.body.revision_number || req.body.revisionNumber || 'Rev 01';
    const revision_date = req.body.revision_date || req.body.revisionDate;
    const file_url = req.body.file_url || req.body.fileUrl;

    if (!title || !document_type || !aircraft_types || !revision_date || !file_url) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Missing mandatory payload field parameters.' 
      });
    }

    // 1. Write the parent manual row configuration metadata
    const document = await documentRepository.createDocument({ 
      title, 
      document_type, 
      aircraft_types, 
      customization 
    });
    
    // 2. Pin the initial child revision instance attached to the parent ID
    const initialRevision = await documentRepository.createRevision({
      document_id: document.id,
      revision_number,
      revision_date,
      file_url,
      status: 'active',
      compiled_by: req.user?.id || null
    });

    res.status(201).json({ 
      status: 'success', 
      data: { document, initialRevision } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/library/:id/revisions
 * Automatically supersedes active items and pushes an explicit revision update line
 */
const pushNewRevision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { revision_number, revision_date, file_url } = req.body;

    if (!revision_number || !revision_date || !file_url) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Missing revision payload parameter data.' 
      });
    }

    // 1. Transactional Update: Set existing versions for this document to 'superseded'
    await documentRepository.supersedeOldRevisions(id);

    // 2. Write the fresh active release pointer row 
    const revision = await documentRepository.createRevision({
      document_id: id,
      revision_number,
      revision_date,
      file_url,
      status: 'active',
      compiled_by: req.user?.id || null
    });

    res.status(201).json({ 
      status: 'success', 
      data: { revision } 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getLibraryCatalog, 
  getDocumentHistory, 
  injectNewDocument, 
  pushNewRevision 
};