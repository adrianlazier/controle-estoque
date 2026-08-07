const tabela = document.getElementById('tabela-movimentacoes');
const filtros = document.querySelectorAll('.filtro-tab');

let movimentacoesCache = [];

function formatarData(isoString) {
  const data = new Date(isoString);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderizarTabela(lista) {
  tabela.innerHTML = '';

  if (lista.length === 0) {
    tabela.innerHTML = `<tr><td colspan="6" class="tabela-vazia">Nenhuma movimentação encontrada.</td></tr>`;
    return;
  }

  lista.forEach(mov => {
    const tr = document.createElement('tr');
    const ehEntrada = mov.tipo === 'entrada';

    tr.innerHTML = `
      <td>${formatarData(mov.criado_em)}</td>
      <td>${escapeHTML(mov.produto_descricao)}</td>
      <td>${escapeHTML(mov.produto_codigo) || '-'}</td>
      <td><span class="badge ${ehEntrada ? 'badge-entrada' : 'badge-saida'}">${ehEntrada ? 'Entrada' : 'Saída'}</span></td>
      <td>${escapeHTML(mov.quantidade)}</td>
      <td>${escapeHTML(mov.colaborador) || '-'}</td>
    `;
    tabela.appendChild(tr);
  });
}

async function carregarMovimentacoes() {
  mostrarStatus('Carregando movimentações...', 'loading');
  try {
    const dados = await buscarMovimentacoes();
    movimentacoesCache = dados;
    renderizarTabela(dados);
    esconderStatus();
  } catch (error) {
    console.error('Erro ao carregar movimentações:', error);
    mostrarStatus('Erro ao carregar movimentações. Verifique a conexão com o servidor.', 'erro');
  }
}

filtros.forEach(btn => {
  btn.addEventListener('click', () => {
    filtros.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');

    const tipo = btn.dataset.filtro;
    if (tipo === 'todas') {
      renderizarTabela(movimentacoesCache);
    } else {
      renderizarTabela(movimentacoesCache.filter(mov => mov.tipo === tipo));
    }
  });
});

carregarMovimentacoes();