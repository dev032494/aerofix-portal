const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const woNumber = req.params.id; // work order number
        const uploadDir = path.join(__dirname, '..', 'public', 'work_order', woNumber);

        // Ensure target folder exists recursively
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename format: proof-TIMESTAMP-ORIGINALNAME
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const fileName = `proof-${uniqueSuffix}${ext}`;
        cb(null, fileName);
    }
});

const uploadProof = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

module.exports = uploadProof;