const db = require('../models');
const { Op } = require('sequelize');

class DocumentRepository {
  /**
   * Safe getter lookups preventing crash loops if system casing falls out of match
   */
  get documentModel() {
    return db.Document || db.document || db.documents;
  }

  get revisionModel() {
    return db.Revision || db.revision || db.revisions;
  }

  /**
   * Persists a new base document tracking architecture mapping
   */
  async createDocument(docData) {
    if (!this.documentModel) throw new Error("AeroFix Sequelize Loader Exception: Document schema unresolved inside db map cluster.");
    return await this.documentModel.create(docData);
  }

  /**
   * Persists a single leaf release revision row tracking entry
   */
  async createRevision(revData) {
    if (!this.revisionModel) throw new Error("AeroFix Sequelize Loader Exception: Revision schema unresolved inside db map cluster.");
    return await this.revisionModel.create(revData);
  }

  /**
   * Filters general publication lists matching sidebar flags criteria
   */
  async findByContext(filters) {
    const Document = this.documentModel;
    const Revision = this.revisionModel;

    if (!Document) throw new Error("Document schema model references unresolvable. Confirm entry execution configurations.");

    // Auto-detect alias maps matching what's written inside your relationship loaders
    const revisionsAlias = Document.associations?.revisions ? 'revisions' : 'revisions';

    const queryOptions = {
      where: {},
      include: Revision ? [
        {
          model: Revision,
          as: revisionsAlias,
          where: { status: 'active' }, // Isolate currently active effective manual pages binaries
          required: false
        }
      ] : [],
      order: [['document_type', 'ASC'], ['title', 'ASC']]
    };

    if (filters.customization) {
      queryOptions.where.customization = filters.customization;
    }

    if (filters.aircraft) {
      queryOptions.where.aircraft_types = { 
        [Op.like]: `%${filters.aircraft}%` 
      };
    }

    if (filters.doctypes) {
      const typesArray = typeof filters.doctypes === 'string' 
        ? filters.doctypes.split(',') 
        : filters.doctypes;
      queryOptions.where.document_type = { [Op.in]: typesArray };
    }

    return await Document.findAll(queryOptions);
  }

  /**
   * Pulls structural parent nodes coupled with all historic iterations sequentially
   */
  async findDocumentHistory(id) {
    const Document = this.documentModel;
    const Revision = this.revisionModel;
    
    if (!Document) throw new Error("Document database reference map down.");
    const revisionsAlias = Document.associations?.revisions ? 'revisions' : 'revisions';

    return await Document.findByPk(id, {
      include: Revision ? [{
        model: Revision,
        as: revisionsAlias,
        required: false
      }] : [],
      order: Revision ? [
        [{ model: Revision, as: revisionsAlias }, 'id', 'DESC'] // Push recent items to top layout
      ] : []
    });
  }

  /**
   * Sweeps active documents to clear old active tokens during revisions pushes
   */
  async supersedeOldRevisions(documentId) {
    if (!this.revisionModel) throw new Error("Revision database reference map down.");
    return await this.revisionModel.update(
      { status: 'superseded' },
      { where: { document_id: documentId } }
    );
  }
}

module.exports = new DocumentRepository();