const express = require('express');
const router = express.Router();
const db = require('../config/db');

// listar produto

router.get('/', async (req, res) => {
  try {
    const [produtos] = await db.execute(
      'SELECT id, descricao, codigo, quantidade, quantidade_minima, posicao, fabricante, referencia, criado_em FROM produto'
    );

    return res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos', error.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar produtos' });
  }
});

// criar produto

router.post('/', async (req, res) => {
  const {
    descricao,
    codigo,
    quantidade,
    quantidade_minima,
    posicao,
    fabricante,
    referencia,
  } = req.body;

  if (!descricao) {
    return res.status(400).json({ erro: "O campo 'descricao' é obrigatório" });
  }

  try {
    const query = `INSERT INTO produto 
        (descricao, codigo, quantidade, quantidade_minima, posicao, fabricante, referencia) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      descricao,
      codigo || null,
      quantidade || 0,
      quantidade_minima || 0,
      posicao || null,
      fabricante || null,
      referencia || null,
    ];

    const [resultado] = await db.execute(query, values);

    return res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso!',
      produto: {
        id: resultado.insertId,
        descricao,
        codigo,
        quantidade: quantidade || 0,
        quantidade_minima: quantidade_minima || 0,
        posicao,
        fabricante,
        referencia,
      },
    });
  } catch (error) {
    console.error('Erro ao cadastrar produto', error.message);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar produto' });
  }
});

//Buscar produto pelo ID

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [produtos] = await db.execute(
      'SELECT id, descricao, codigo, quantidade, quantidade_minima, posicao, fabricante, referencia, criado_em FROM produto WHERE id = ?',
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    return res.status(200).json(produtos[0]);
  } catch (error) {
    console.error('Erro ao buscar o produto', error.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar produto.' });
  }
});

//Atualizar produto pelo ID

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    descricao,
    codigo,
    quantidade,
    quantidade_minima,
    posicao,
    fabricante,
    referencia,
  } = req.body;

  if (!descricao) {
    return res.status(400).json({ erro: "O campo 'descricao' é obrigatório." });
  }

  try {
    const query = `UPDATE produto 
      SET descricao = ?, codigo = ?, quantidade = ?, quantidade_minima = ?, posicao = ?, fabricante = ?, referencia = ?
      WHERE id = ?`;

    const values = [
      descricao,
      codigo || null,
      quantidade || 0,
      quantidade_minima || 0,
      posicao || null,
      fabricante || null,
      referencia || null,
      id,
    ];

    const [resultado] = await db.execute(query, values);

    if (resultado.affectedRows === 0) {
      return res
        .status(404)
        .json({ erro: 'Produto não encontrado para atualização.' });
    }

    return res
      .status(200)
      .json({ mensagem: 'Produto atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao atualizar produto.' });
  }
});

//Deletar produto pelo ID

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await db.execute('DELETE FROM produto WHERE id = ?', [
      id,
    ]);
    if (resultado.affectedRows === 0) {
      return res
        .status(404)
        .json({ erro: 'Produto não encontrado para exclusão.' });
    }

    return res.status(200).json({ mensagem: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao deletar produto.' });
  }
});

module.exports = router;
