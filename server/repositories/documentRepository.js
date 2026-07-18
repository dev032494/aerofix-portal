const fs = require('fs');
const { Op } = require('sequelize');
const { Document } = require('../models');

/**
 * Extracts PDF Table of Contents (Outline) and builds a searchable token array.
 * @param {string} filePath 
 * @returns {Promise<{ toc: Array, searchIndexText: string }>}
 */
const parsePdfOutlineAndBuildIndex = async (filePath) => {
  try {
    // Dynamically import modern PDFJS ES Modules (.mjs) to stay CommonJS-friendly
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    await import('pdfjs-dist/legacy/build/pdf.worker.mjs'); // Self-registers the worker globally in Node

    const dataBuffer = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjsLib.getDocument({ 
      data: dataBuffer, 
      disableFontFace: true,
      verbosity: 0 // Suppresses unnecessary development warnings in terminal
    });
    const pdfDoc = await loadingTask.promise;

    const outline = await pdfDoc.getOutline();
    if (!outline || outline.length === 0) {
      return { toc: [], searchIndexText: "" };
    }

    const indexTokens = [];

    // Recursive outline parser to resolve destinations to page numbers
    const parseItems = async (items) => {
      const parsedItems = [];

      for (const item of items) {
        let pageNumber = null;

        if (item.dest) {
          try {
            let destinationRef = item.dest;
            if (typeof destinationRef === 'string') {
              destinationRef = await pdfDoc.getDestination(item.dest);
            }

            if (Array.isArray(destinationRef) && destinationRef.length > 0) {
              const refObj = destinationRef[0];
              if (refObj && typeof refObj === 'object') {
                const pageIndex = await pdfDoc.getPageIndex(refObj);
                pageNumber = pageIndex + 1; // Translate 0-index to actual human page number
              }
            }
          } catch (destError) {
            // Suppress warn logs for missing layout target destinations
          }
        }

        // Aggregate for Full-Text search index tag
        const representation = item.title + (pageNumber ? ` (Page ${pageNumber})` : '');
        indexTokens.push(representation);

        const node = {
          title: item.title,
          pageNumber: pageNumber,
          items: []
        };

        if (item.items && item.items.length > 0) {
          node.items = await parseItems(item.items);
        }

        parsedItems.push(node);
      }

      return parsedItems;
    };

    const structuredToc = await parseItems(outline);
    const searchIndexText = indexTokens.join(' | ');

    return { toc: structuredToc, searchIndexText };
  } catch (error) {
    console.error('Failed to parse document indexes:', error);
    return { toc: [], searchIndexText: "" };
  }
};

module.exports = {
  // ⚡ Handles receiving the fully compiled payload from the controller in a single transaction
  create: async (data) => {
    return await Document.create(data);
  },

  // ⚡ ADDED: Expose parsing engine directly so the controller can fetch metadata before the DB insert
  parsePDF: async (filePath) => {
    return await parsePdfOutlineAndBuildIndex(filePath);
  },

  findAll: async () => {
    return await Document.findAll();
  },

  findById: async (id) => {
    return await Document.findByPk(id);
  },

  update: async (id, data) => {
    const document = await Document.findByPk(id);
    if (!document) return null;
    return await document.update(data);
  },

  delete: async (id) => {
    const document = await Document.findByPk(id);
    if (!document) return false;
    
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }
    
    await document.destroy();
    return true;
  },

  searchIndex: async (query) => {
    return await Document.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { search_index: { [Op.like]: `%${query}%` } }
        ]
      }
    });
  }
};