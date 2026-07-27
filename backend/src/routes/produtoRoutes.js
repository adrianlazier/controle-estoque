const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.get('/alertas/estoque-baixo', produtoController.listarAlertasEstoque);

router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.buscarProdutoPorId);
router.post('/', produtoController.criarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.patch('/:id/movimentar', produtoController.movimentarEstoque);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;
