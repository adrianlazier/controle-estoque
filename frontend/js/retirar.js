const cardSelecionado = document.getElementById('produto-selecionado-card');
const formMov = document.getElementById('form-movimentacao');
const inputQtd = document.getElementById('quantidade-movimentar');
const mensagemSucesso = document.getElementById('mensagem-sucesso');
const inputBuscaProduto = document.getElementById('busca-produto');
const avisoEl = document.getElementById('aviso-movimentacao');
const btnConfirmar = document.getElementById('btn-confirmar-movimentacao');

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
  avisoEl.style.display = 'none';
  btnConfirmar.disabled = false;
  inputQtd.value = '';
  inputQtd.focus();
}

function verificarAviso() {
  const valor = Number(inputQtd.value) || 0;

  if (!produtoAtual || valor <= 0) {
    avisoEl.style.display = 'none';
    btnConfirmar.disabled = false;
    return;
  }

  if (valor > produtoAtual.quantidade) {
    avisoEl.textContent = `Estoque insuficiente. Disponível: ${produtoAtual.quantidade}.`;
    avisoEl.className = 'aviso-movimentacao aviso-erro';
    btnConfirmar.disabled = true;
    return;
  }

  if (produtoAtual.quantidade - valor <= produtoAtual.quantidade_minima) {
    avisoEl.textContent = `Atenção: isso vai deixar o estoque abaixo do mínimo (${produtoAtual.quantidade_minima}).`;
    avisoEl.className = 'aviso-movimentacao aviso-alerta';
    btnConfirmar.disabled = false;
    return;
  }

  avisoEl.style.display = 'none';
  btnConfirmar.disabled = false;
}

inputQtd.addEventListener('input', verificarAviso);

document.querySelectorAll('.quick-qtd-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const atual = Number(inputQtd.value) || 0;
    inputQtd.value = atual + Number(btn.dataset.qtd);
    verificarAviso();
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
    const resposta = await movimentarEstoque(produtoAtual.id, 'saida', valor, colaboradorAtivo.nome);
    if (resposta.ok) {
      const dados = await resposta.json();
      mensagemSucesso.textContent = `✓ ${valor} unidade(s) de "${produtoAtual.descricao}" retirada(s). Novo total: ${dados.quantidade}.`;
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
    console.error('Erro ao registrar saída:', error);
    alert('Erro ao conectar com o servidor.');
  }
});