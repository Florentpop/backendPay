const multer = require('multer');

// Store uploaded file in memory as a buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files are allowed.'), false);
  }
};

module.exports = multer({ storage, fileFilter });
