const express = require('express');
const documentController = require('../controllers/documentController');
const authenticate = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

router.use(authenticate);
router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
