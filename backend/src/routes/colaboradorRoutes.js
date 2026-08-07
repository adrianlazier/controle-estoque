const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/colaboradorController');

router.get('/', colaboradorController.listarColaboradores);
router.post('/', colaboradorController.criarColaborador);

module.exports = router;