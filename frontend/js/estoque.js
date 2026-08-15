const form = document.getElementById('form-produto');
const tabela = document.getElementById('tabela-produtos');
const modal = document.getElementById('modal-edicao');
const formEdicao = document.getElementById('form-editar-produto');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const inputBusca = document.getElementById('busca');

let produtosCache = [];

function fecharModal() {
  modal.classList.remove('ativo');
  formEdicao.reset();
}

function renderizarTabela(lista) {
  tabela.innerHTML = '';

  if (lista.length === 0) {
    tabela.innerHTML = `<tr><td colspan="9" class="tabela-vazia">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  lista.forEach(produto => {
    const tr = document.createElement('tr');
    const estoqueCritico = Number(produto.quantidade) <= Number(produto.quantidade_minima);
    if (estoqueCritico) tr.classList.add('estoque-baixo');

    tr.innerHTML = `
      <td>${produto.id}</td>
      <td>${escapeHTML(produto.descricao)}</td>
      <td>${escapeHTML(produto.codigo) || '-'}</td>
      <td>${escapeHTML(produto.quantidade)}${estoqueCritico ? ' <i class="fa-solid fa-triangle-exclamation"></i>' : ''}</td>
      <td>${escapeHTML(produto.quantidade_minima)}</td>
      <td>${escapeHTML(produto.posicao) || '-'}</td>
      <td>${escapeHTML(produto.fabricante) || '-'}</td>
      <td>${escapeHTML(produto.referencia)}</td>
      <td class="acoes">
          <div class="acoes-movimentacao">
              <button class="btn-mov btn-entrada" data-acao="entrada" data-id="${produto.id}" title="Entrada de estoque">+</button>
              <button class="btn-mov btn-saida" data-acao="saida" data-id="${produto.id}" title="Saída de estoque">−</button>
          </div>
          <button class="btn-acao btn-editar" data-acao="editar" data-id="${produto.id}">Editar</button>
          <button class="btn-acao btn-deletar" data-acao="excluir" data-id="${produto.id}">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

async function carregarProdutos() {
  mostrarStatus('Carregando produtos...', 'loading');
  try {
    const produtos = await buscarProdutos();
    produtosCache = produtos;
    renderizarTabela(produtos);
    esconderStatus();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    mostrarStatus('Erro ao carregar produtos. Verifique a conexão com o servidor.', 'erro');
  }
}

async function abrirModalEdicao(id) {
  try {
    const produto = await buscarProdutoPorId(id);

    document.getElementById('edit-id').value = produto.id;
    document.getElementById('edit-descricao').value = produto.descricao;
    document.getElementById('edit-codigo').value = produto.codigo || '';
    document.getElementById('edit-quantidade').value = produto.quantidade;
    document.getElementById('edit-quantidade_minima').value = produto.quantidade_minima;
    document.getElementById('edit-posicao').value = produto.posicao || '';
    document.getElementById('edit-fabricante').value = produto.fabricante || '';
    document.getElementById('edit-referencia').value = produto.referencia || '';

    modal.classList.add('ativo');
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    alert('Erro ao carregar os dados para edição.');
  }
}

async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  try {
    const resposta = await deletarProduto(id);
    if (resposta.ok) {
      carregarProdutos();
    } else {
      alert('Erro ao deletar produto.');
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
  }
}


const modalMovimentar = document.getElementById('modal-movimentar');
const formModalMovimentar = document.getElementById('form-modal-movimentar');
const inputMovQuantidade = document.getElementById('mov-quantidade');
const avisoMov = document.getElementById('mov-aviso');
const btnConfirmarMov = document.getElementById('btn-confirmar-modal-movimentar');
const btnCancelarMov = document.getElementById('btn-cancelar-modal-movimentar');
const btnFecharMov = document.getElementById('btn-fechar-modal-movimentar');

let movProdutoAtual = null;
let movTipoAtual = null;

function fecharModalMovimentar() {
  modalMovimentar.classList.remove('ativo');
  formModalMovimentar.reset();
  avisoMov.style.display = 'none';
  movProdutoAtual = null;
  movTipoAtual = null;
}

function abrirModalMovimentar(produto, tipo) {
  movProdutoAtual = produto;
  movTipoAtual = tipo;
  const ehEntrada = tipo === 'entrada';

  document.getElementById('modal-movimentar-titulo').textContent =
    ehEntrada ? 'Adicionar ao Estoque' : 'Retirar do Estoque';
  document.getElementById('mov-descricao').textContent = produto.descricao;
  document.getElementById('mov-detalhes').textContent =
    `${produto.codigo || 'sem código'} · ${produto.posicao || 'sem posição'}`;
  document.getElementById('mov-quantidade-atual').textContent = produto.quantidade;
  document.getElementById('mov-quantidade-label').textContent =
    ehEntrada ? 'Quantidade a adicionar:' : 'Quantidade a retirar:';

  btnConfirmarMov.textContent = ehEntrada ? 'Registrar entrada' : 'Registrar saída';
  btnConfirmarMov.className = `btn-acao ${ehEntrada ? 'btn-confirmar-entrada' : 'btn-confirmar-saida'}`;
  btnConfirmarMov.disabled = false;

  inputMovQuantidade.value = '';
  avisoMov.style.display = 'none';

  modalMovimentar.classList.add('ativo');
  inputMovQuantidade.focus();
}

function verificarAvisoModalMov() {
  if (!movProdutoAtual || movTipoAtual !== 'saida') {
    avisoMov.style.display = 'none';
    btnConfirmarMov.disabled = false;
    return;
  }

  const valor = Number(inputMovQuantidade.value) || 0;

  if (valor <= 0) {
    avisoMov.style.display = 'none';
    btnConfirmarMov.disabled = false;
    return;
  }

  if (valor > movProdutoAtual.quantidade) {
    avisoMov.textContent = `Estoque insuficiente. Disponível: ${movProdutoAtual.quantidade}.`;
    avisoMov.className = 'aviso-movimentacao aviso-erro';
    btnConfirmarMov.disabled = true;
    return;
  }

  if (movProdutoAtual.quantidade - valor <= movProdutoAtual.quantidade_minima) {
    avisoMov.textContent = `Atenção: isso vai deixar o estoque abaixo do mínimo (${movProdutoAtual.quantidade_minima}).`;
    avisoMov.className = 'aviso-movimentacao aviso-alerta';
    btnConfirmarMov.disabled = false;
    return;
  }

  avisoMov.style.display = 'none';
  btnConfirmarMov.disabled = false;
}

inputMovQuantidade.addEventListener('input', verificarAvisoModalMov);

document.querySelectorAll('#form-modal-movimentar .quick-qtd-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const atual = Number(inputMovQuantidade.value) || 0;
    inputMovQuantidade.value = atual + Number(btn.dataset.qtd);
    verificarAvisoModalMov();
  });
});

btnCancelarMov.addEventListener('click', fecharModalMovimentar);
btnFecharMov.addEventListener('click', fecharModalMovimentar);
modalMovimentar.addEventListener('click', (e) => {
  if (e.target === modalMovimentar) fecharModalMovimentar();
});

formModalMovimentar.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!movProdutoAtual || !movTipoAtual) return;

  const valor = Number(inputMovQuantidade.value);
  if (isNaN(valor) || valor <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }

  const colaboradorAtivo = obterColaboradorAtivo();
  if (!colaboradorAtivo) {
    fecharModalMovimentar();
    alert('Selecione quem está operando antes de continuar (botão "Trocar" no topo).');
    abrirModalColaborador();
    return;
  }

  try {
    const resposta = await movimentarEstoque(movProdutoAtual.id, movTipoAtual, valor, colaboradorAtivo.nome);
    if (resposta.ok) {
      fecharModalMovimentar();
      carregarProdutos();
    } else {
      const erro = await resposta.json();
      alert(`Erro: ${erro.erro}`);
    }
  } catch (error) {
    console.error('Erro ao movimentar estoque:', error);
    alert('Erro ao conectar com o servidor.');
  }
});

async function movimentarProduto(id, tipo) {
  try {
    const produto = await buscarProdutoPorId(id);
    abrirModalMovimentar(produto, tipo);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    alert('Erro ao carregar os dados do produto.');
  }
}

// Delegação de eventos: um único listener cobre todos os botões da tabela,
// mesmo os recriados a cada renderização
tabela.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-acao]');
  if (!btn) return;

  const id = btn.dataset.id;
  const acao = btn.dataset.acao;

  if (acao === 'editar') abrirModalEdicao(id);
  else if (acao === 'excluir') excluirProduto(id);
  else if (acao === 'entrada' || acao === 'saida') movimentarProduto(id, acao);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const novoProduto = {
    descricao: document.getElementById('descricao').value,
    codigo: document.getElementById('codigo').value || null,
    quantidade: document.getElementById('quantidade').value || 0,
    quantidade_minima: document.getElementById('quantidade_minima').value || 0,
    posicao: document.getElementById('posicao').value || null,
    fabricante: document.getElementById('fabricante').value || null,
    referencia: document.getElementById('referencia').value || null,
  };

  try {
    const resposta = await criarProduto(novoProduto);
    if (resposta.ok) {
      form.reset();
      carregarProdutos();
    } else {
      const erro = await resposta.json();
      alert(`Erro: ${erro.erro}`);
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
  }
});

formEdicao.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;

  const dadosAtualizados = {
    descricao: document.getElementById('edit-descricao').value,
    codigo: document.getElementById('edit-codigo').value || null,
    quantidade: document.getElementById('edit-quantidade').value || 0,
    quantidade_minima: document.getElementById('edit-quantidade_minima').value || 0,
    posicao: document.getElementById('edit-posicao').value || null,
    fabricante: document.getElementById('edit-fabricante').value || null,
    referencia: document.getElementById('edit-referencia').value || null,
  };

  try {
    const resposta = await atualizarProduto(id, dadosAtualizados);
    if (resposta.ok) {
      fecharModal();
      carregarProdutos();
    } else {
      const erro = await resposta.json();
      alert(`Erro: ${erro.erro}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
  }
});

btnFecharModal.addEventListener('click', fecharModal);
btnCancelarModal.addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) fecharModal();
});

inputBusca.addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase().trim();

  if (termo === '') {
    renderizarTabela(produtosCache);
    return;
  }

  const filtrados = produtosCache.filter(produto =>
    String(produto.descricao || '').toLowerCase().includes(termo) ||
    String(produto.codigo || '').toLowerCase().includes(termo) ||
    String(produto.posicao || '').toLowerCase().includes(termo)
  );

  renderizarTabela(filtrados);
});

carregarProdutos();