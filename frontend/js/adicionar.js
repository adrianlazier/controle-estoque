const cardSelecionado = document.getElementById('produto-selecionado-card');
const formMov = document.getElementById('form-movimentacao');
const inputQtd = document.getElementById('quantidade-movimentar');
const mensagemSucesso = document.getElementById('mensagem-sucesso');
const inputBuscaProduto = document.getElementById('busca-produto');

let produtoAtual = null;

const busca = iniciarBuscaProduto({
  onSelecionar: (produto) => {
    produtoAtual = produto;
    exibirProdutoSelecionado(produto);
  },
});

function exibirProdutoSelecionado(produto) {
  document.getElementById('ps-descricao').textContent = produto.descricao;
  document.getElementById('ps-detalhes').textContent =
    `${produto.codigo || 'sem código'} · ${produto.posicao || 'sem posição'}`;
  document.getElementById('ps-quantidade-atual').textContent = produto.quantidade;

  cardSelecionado.style.display = 'flex';
  formMov.style.display = 'flex';
  mensagemSucesso.style.display = 'none';
  inputQtd.value = '';
  inputQtd.focus();
}

document.querySelectorAll('.quick-qtd-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const atual = Number(inputQtd.value) || 0;
    inputQtd.value = atual + Number(btn.dataset.qtd);
  });
});

formMov.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!produtoAtual) return;

  const valor = Number(inputQtd.value);
  if (isNaN(valor) || valor <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }

  const colaboradorAtivo = obterColaboradorAtivo();
  if (!colaboradorAtivo) {
    alert('Selecione quem está operando antes de continuar (botão "Trocar" no topo).');
    abrirModalColaborador();
    return;
  }

  try {
    const resposta = await movimentarEstoque(produtoAtual.id, 'entrada', valor, colaboradorAtivo.nome);
    if (resposta.ok) {
      const dados = await resposta.json();
      mensagemSucesso.textContent = `✓ ${valor} unidade(s) de "${produtoAtual.descricao}" adicionada(s). Novo total: ${dados.quantidade}.`;
      mensagemSucesso.style.display = 'block';
      formMov.style.display = 'none';
      cardSelecionado.style.display = 'none';
      inputBuscaProduto.value = '';
      produtoAtual = null;
      busca.recarregar();
    } else {
      const erro = await resposta.json();
      alert(`Erro: ${erro.erro}`);
    }
  } catch (error) {
    console.error('Erro ao registrar entrada:', error);
    alert('Erro ao conectar com o servidor.');
  }
});