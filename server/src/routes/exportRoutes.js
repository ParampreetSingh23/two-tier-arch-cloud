const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

router.get('/pdf', auth, exportController.exportPDF);

module.exports = router;
