const db = require('../config/db');

// GET /colaboradores — lista só os ativos, ordenados por nome
exports.listarColaboradores = async function (req, res) {
  try {
    const [colaboradores] = await db.execute(
      'SELECT id, nome FROM colaborador WHERE ativo = TRUE ORDER BY nome ASC'
    );
    return res.status(200).json(colaboradores);
  } catch (error) {
    console.error('Erro ao buscar colaboradores', error.message);
    return res.status(500).json({ erro: 'Erro interno ao buscar colaboradores' });
  }
};

// POST /colaboradores — cadastro simples (sem senha, é só identificação)
exports.criarColaborador = async function (req, res) {
  const { nome } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: "O campo 'nome' é obrigatório" });
  }

  try {
    const [resultado] = await db.execute(
      'INSERT INTO colaborador (nome) VALUES (?)',
      [nome.trim()]
    );

    return res.status(201).json({
      mensagem: 'Colaborador cadastrado com sucesso!',
      colaborador: { id: resultado.insertId, nome: nome.trim() },
    });
  } catch (error) {
    console.error('Erro ao cadastrar colaborador', error.message);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar colaborador' });
  }
};