function iniciarBuscaProduto({ onSelecionar }) {
  const input = document.getElementById('busca-produto');
  const resultadosEl = document.getElementById('resultados-busca');

  let produtosCache = [];
  let produtoSelecionado = null;

  async function carregarTodosProdutos() {
    try {
      produtosCache = await buscarProdutos();
    } catch (error) {
      console.error('Erro ao carregar produtos para busca:', error);
    }
  }

  function renderizarResultados(lista) {
    if (lista.length === 0) {
      resultadosEl.innerHTML = `<p class="resultados-vazio">Nenhum produto encontrado.</p>`;
      resultadosEl.classList.add('ativo');
      return;
    }

    resultadosEl.innerHTML = lista
      .slice(0, 8)
      .map(p => `
        <button type="button" class="resultado-item" data-id="${p.id}">
          <span class="resultado-item-descricao">${escapeHTML(p.descricao)}</span>
          <span class="resultado-item-detalhes">${escapeHTML(p.codigo) || 'sem código'} · ${escapeHTML(p.posicao) || 'sem posição'} · qtd: ${escapeHTML(p.quantidade)}</span>
        </button>
      `)
      .join('');
    resultadosEl.classList.add('ativo');
  }

  input.addEventListener('input', () => {
    const termo = input.value.toLowerCase().trim();

    if (termo === '') {
      resultadosEl.classList.remove('ativo');
      resultadosEl.innerHTML = '';
      return;
    }

    const filtrados = produtosCache.filter(p =>
      String(p.descricao || '').toLowerCase().includes(termo) ||
      String(p.codigo || '').toLowerCase().includes(termo) ||
      String(p.posicao || '').toLowerCase().includes(termo)
    );

    renderizarResultados(filtrados);
  });

  resultadosEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.resultado-item');
    if (!btn) return;

    const id = btn.dataset.id;
    produtoSelecionado = produtosCache.find(p => String(p.id) === String(id));
    if (!produtoSelecionado) return;

    input.value = produtoSelecionado.descricao;
    resultadosEl.classList.remove('ativo');
    resultadosEl.innerHTML = '';

    onSelecionar(produtoSelecionado);
  });

  // Fecha a lista de resultados ao clicar fora dela
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.movimentar-produto-busca')) {
      resultadosEl.classList.remove('ativo');
    }
  });

  carregarTodosProdutos();

  return {
    obterSelecionado: () => produtoSelecionado,
    recarregar: carregarTodosProdutos,
  };
}