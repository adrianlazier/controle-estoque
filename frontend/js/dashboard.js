carregarDashboard();

async function carregarDashboard() {
  try {
    const produtos = await buscarProdutos();
    const abaixoMinimo = produtos.filter(p => Number(p.quantidade) <= Number(p.quantidade_minima));
    const totalPecas = produtos.reduce((soma, p) => soma + Number(p.quantidade), 0);
    const okCount = produtos.length - abaixoMinimo.length;
    const percentualOk = produtos.length > 0 ? Math.round((okCount / produtos.length) * 100) : 100;

    setTexto('total-itens', produtos.length);
    setTexto('total-abaixo-minimo', abaixoMinimo.length);
    setTexto('total-pecas-estoque', totalPecas);
    setTexto('saude-estoque-percentual', `${percentualOk}% saudável`);
    setLargura('saude-barra-ok', percentualOk);
    setLargura('saude-barra-baixo', 100 - percentualOk);

    renderizarAlertas(abaixoMinimo);
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    mostrarStatus('Erro ao carregar dados do dashboard. Verifique a conexão com o servidor.', 'erro');
  }
}

function setTexto(id, valor) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[dashboard] elemento não encontrado: #${id}`);
    return;
  }
  el.textContent = valor;
}

function setLargura(id, percentual) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[dashboard] elemento não encontrado: #${id}`);
    return;
  }
  el.style.width = `${percentual}%`;
}

function renderizarAlertas(lista) {
  const container = document.getElementById('alerta-lista-corpo');
  if (!container) {
    console.warn('[dashboard] elemento não encontrado: #alerta-lista-corpo');
    return;
  }

  if (lista.length === 0) {
    container.innerHTML = `<p class="alerta-vazio">Nenhum item abaixo do mínimo no momento. Tudo certo por aqui.</p>`;
    return;
  }

  container.innerHTML = lista
    .map(produto => `
      <div class="alerta-item">
        <div class="alerta-item-info">
          <span class="alerta-item-descricao">${escapeHTML(produto.descricao)}</span>
          <span class="alerta-item-posicao">${escapeHTML(produto.posicao) || 'Sem posição definida'}</span>
        </div>
        <span class="alerta-item-quantidade">${escapeHTML(produto.quantidade)} / mín. ${escapeHTML(produto.quantidade_minima)}</span>
      </div>
    `)
    .join('');
}