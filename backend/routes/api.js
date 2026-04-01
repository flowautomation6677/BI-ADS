const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Rota para buscar o relatório completo através do UUID público
router.get('/relatorio/:uuid', reportController.getReport);

// Rota para buscar os dados diários de uma campanha específica
router.get('/relatorio/:uuid/campanha/:campaignId/daily', reportController.getCampaignDailyReport);

// Rota para criar um novo relatório (gerar UUID para o cliente)
router.post('/relatorio', reportController.createReport);

module.exports = router;
