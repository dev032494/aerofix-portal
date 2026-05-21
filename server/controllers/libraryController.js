const libraryRepository = require('../repositories/libraryRepository');

const getCatalog = async (req, res, next) => {
  try {
    const { customization, aircraft, doctypes } = req.query;
    const documents = await libraryRepository.findCatalogByContext({ customization, aircraft, doctypes });
    res.status(200).json({ status: 'success', data: { documents } });
  } catch (error) { next(error); }
};

const getDocumentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await libraryRepository.findDocumentHistory(id);
    if (!document) {
      return res.status(404).json({ status: 'fail', message: 'Technical file not found.' });
    }
    res.status(200).json({ status: 'success', data: { document } });
  } catch (error) { next(error); }
};

const injectNewDocument = async (req, res, next) => {
  try {
    const { title, document_type, aircraft_types, customization, revision_number, revision_date, file_url } = req.body;
    
    // 1. Instantiate the root tracking configuration row
    const document = await libraryRepository.createDocument({ title, document_type, aircraft_types, customization });
    
    // 2. Build and attach the initial effective active revision leaf
    const initialRevision = await libraryRepository.createRevision({
      document_id: document.id,
      revision_number: revision_number || 'Initial Provision',
      revision_date,
      file_url,
      status: 'active',
      compiled_by: req.user?.id || null
    });

    res.status(201).json({ status: 'success', data: { document, initialRevision } });
  } catch (error) { next(error); }
};

const pushNewRevision = async (req, res, next) => {
  try {
    const { id } = req.params; // Document ID
    const { revision_number, revision_date, file_url } = req.body;

    // 1. Supersede old historical revision rows
    await libraryRepository.supersedeOldRevisions(id);

    // 2. Inject new version block as 'active'
    const revision = await libraryRepository.createRevision({
      document_id: id,
      revision_number,
      revision_date,
      file_url,
      status: 'active',
      compiled_by: req.user?.id || null
    });

    res.status(201).json({ status: 'success', data: { revision } });
  } catch (error) { next(error); }
};

module.exports = { getCatalog, getDocumentHistory, injectNewDocument, pushNewRevision };