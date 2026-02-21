const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Rota para buscar o relatório completo através do UUID público
router.get('/relatorio/:uuid', reportController.getReport);

module.exports = router;
