const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produtos', produtoRoutes);

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
