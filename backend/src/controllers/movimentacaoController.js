const db = require('../config/db');

// GET /movimentacoes
exports.listarMovimentacoes = async function (req, res) {
  try {
    const [movimentacoes] = await db.execute(`
      SELECT
        m.id,
        m.tipo,
        m.quantidade,
        m.colaborador,
        m.criado_em,
        p.id AS produto_id,
        p.descricao AS produto_descricao,
        p.codigo AS produto_codigo
      FROM movimentacao m
      JOIN produto p ON p.id = m.produto_id
      ORDER BY m.criado_em DESC
      LIMIT 300
    `);
    return res.status(200).json(movimentacoes);
  } catch (error) {
    console.error('Erro ao buscar movimentações', error.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar movimentações' });
  }
};