const express = require('express');
const router = express.Router();
const movimentacaoController = require('../controllers/movimentacaoController');

router.get('/', movimentacaoController.listarMovimentacoes);

module.exports = router;