const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(), //  memory, not disk
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = multer({ dest: 'uploads/' });