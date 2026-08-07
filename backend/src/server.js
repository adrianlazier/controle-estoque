const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const produtoRoutes = require('./routes/produtoRoutes');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const movimentacaoRoutes = require('./routes/movimentacaoRoutes');

app.use('/produtos', produtoRoutes);
app.use('/colaboradores', colaboradorRoutes);
app.use('/movimentacoes', movimentacaoRoutes);

async function testarConexao() {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado ao MySql com sucesso!');
    connection.release();
  } catch (error) {
    console.log('Erro ao conectar ao MySql:', error.message);
  }
}

testarConexao();

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
