const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [produtos] = await db.execute('SELECT * FROM produto');

    return res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos', error.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar produtos' });
  }
});

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

module.exports = router;
