const db = require('../models');
const { Op } = require('sequelize');

class LibraryRepository {
  /**
   * Fetches the unique list of documents along with their active (current) revision
   */
  async findCatalogByContext(filters) {
    const queryOptions = {
      where: {},
      include: [
        {
          model: db.Revision,
          as: 'revisions',
          where: { status: 'active' }, // Grabs only the currently effective revision block
          required: false
        }
      ],
      order: [['document_type', 'ASC'], ['title', 'ASC']]
    };

    if (filters.customization) {
      queryOptions.where.customization = filters.customization;
    }

    if (filters.aircraft) {
      queryOptions.where.aircraft_types = { [Op.like]: `%${filters.aircraft}%` };
    }

    if (filters.doctypes) {
      queryOptions.where.document_type = { [Op.in]: filters.doctypes.split(',') };
    }

    return await db.Document.findAll(queryOptions);
  }

  /**
   * Fetches a single document alongside its full history of historical revisions
   */
  async findDocumentHistory(id) {
    return await db.Document.findByPk(id, {
      include: [{
        model: db.Revision,
        as: 'revisions',
        order: [['id', 'DESC']]
      }]
    });
  }

  async createDocument(docData) {
    return await db.Document.create(docData);
  }

  async createRevision(revData) {
    return await db.Revision.create(revData);
  }

  /**
   * Automatically changes old revisions to 'superseded' when a new one is set to 'active'
   */
  async supersedeOldRevisions(documentId) {
    return await db.Revision.update(
      { status: 'superseded' },
      { where: { document_id: documentId } }
    );
  }
}

module.exports = new LibraryRepository();