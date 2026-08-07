const db = require('../config/db');

// Validação compartilhada entre criar e atualizar produto (privada, não é exportada)
function validarProduto(body) {
  const erros = [];
  const { descricao, quantidade, quantidade_minima } = body;

  if (!descricao || descricao.trim() === '') {
    erros.push("O campo 'descricao' é obrigatório");
  }

  if (quantidade !== undefined && (isNaN(quantidade) || Number(quantidade) < 0)) {
    erros.push("'quantidade' deve ser um número igual ou maior que zero");
  }

  if (quantidade_minima !== undefined && (isNaN(quantidade_minima) || Number(quantidade_minima) < 0)) {
    erros.push("'quantidade_minima' deve ser um número igual ou maior que zero");
  }

  return erros;
}

// GET /produtos
exports.listarProdutos = async function (req, res) {
  try {
    const [produtos] = await db.execute(
      'SELECT id, descricao, codigo, quantidade, quantidade_minima, posicao, fabricante, referencia, criado_em, ultima_movimentacao_por, ultima_movimentacao_em FROM produto'
    );
    return res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos', error.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar produtos' });
  }
};

// GET /produtos/alertas/estoque-baixo
exports.listarAlertasEstoque = async function (req, res) {
  try {
    const [produtos] = await db.execute(
      'SELECT id, descricao, codigo, quantidade, quantidade_minima, posicao FROM produto WHERE quantidade <= quantidade_minima'
    );
    return res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar alertas', error.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar alertas' });
  }
};

// GET /produtos/:id
exports.buscarProdutoPorId = async function (req, res) {
  const { id } = req.params;

  try {
    const [produtos] = await db.execute(
      'SELECT id, descricao, codigo, quantidade, quantidade_minima, posicao, fabricante, referencia, criado_em, ultima_movimentacao_por, ultima_movimentacao_em FROM produto WHERE id = ?',
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
};

// POST /produtos
exports.criarProduto = async function (req, res) {
  const erros = validarProduto(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ erro: erros.join(', ') });
  }

  const {
    descricao,
    codigo,
    quantidade,
    quantidade_minima,
    posicao,
    fabricante,
    referencia,
  } = req.body;

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
};

// PATCH /produtos/:id/movimentar
exports.movimentarEstoque = async function (req, res) {
  const { id } = req.params;
  const { tipo, quantidade, colaborador } = req.body;

  if (!['entrada', 'saida'].includes(tipo)) {
    return res.status(400).json({ erro: "O campo 'tipo' deve ser 'entrada' ou 'saida'" });
  }

  if (quantidade === undefined || isNaN(quantidade) || Number(quantidade) <= 0) {
    return res.status(400).json({ erro: "'quantidade' deve ser um número maior que zero" });
  }

  try {
    const [produtos] = await db.execute('SELECT quantidade FROM produto WHERE id = ?', [id]);

    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    const quantidadeAtual = produtos[0].quantidade;
    const valor = Number(quantidade);

    let novaQuantidade;
    if (tipo === 'entrada') {
      novaQuantidade = quantidadeAtual + valor;
    } else {
      novaQuantidade = quantidadeAtual - valor;
      if (novaQuantidade < 0) {
        return res.status(400).json({
          erro: `Estoque insuficiente. Quantidade atual: ${quantidadeAtual}`,
        });
      }
    }

    // Registra quem fez a movimentação
    await db.execute(
      'UPDATE produto SET quantidade = ?, ultima_movimentacao_por = ?, ultima_movimentacao_em = NOW() WHERE id = ?',
      [novaQuantidade, colaborador || null, id]
    );

    // Grava no histórico de movimentações
    await db.execute(
      'INSERT INTO movimentacao (produto_id, tipo, quantidade, colaborador) VALUES (?, ?, ?, ?)',
      [id, tipo, valor, colaborador || null]
    );

    return res.status(200).json({
      mensagem: 'Estoque atualizado com sucesso.',
      quantidade: novaQuantidade,
    });
  } catch (error) {
    console.error('Erro ao movimentar estoque:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao movimentar estoque.' });
  }
};

// PUT /produtos/:id
exports.atualizarProduto = async function (req, res) {
  const erros = validarProduto(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ erro: erros.join(', ') });
  }

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
      return res.status(404).json({ erro: 'Produto não encontrado para atualização.' });
    }

    return res.status(200).json({ mensagem: 'Produto atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao atualizar produto.' });
  }
};

// DELETE /produtos/:id
exports.deletarProduto = async function (req, res) {
  const { id } = req.params;

  try {
    const [resultado] = await db.execute('DELETE FROM produto WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado para exclusão.' });
    }

    return res.status(200).json({ mensagem: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao deletar produto.' });
  }
};