const CHAVE_COLABORADOR = 'colaborador_ativo';

function obterColaboradorAtivo() {
  try {
    const bruto = localStorage.getItem(CHAVE_COLABORADOR);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function definirColaboradorAtivo(colaborador) {
  localStorage.setItem(CHAVE_COLABORADOR, JSON.stringify(colaborador));
  atualizarBanner();
}

function limparColaboradorAtivo() {
  localStorage.removeItem(CHAVE_COLABORADOR);
  atualizarBanner();
}

function atualizarBanner() {
  const nomeEl = document.getElementById('colaborador-nome-ativo');
  if (!nomeEl) return;

  const atual = obterColaboradorAtivo();
  nomeEl.textContent = atual ? atual.nome : 'Ninguém selecionado';
}

async function abrirModalColaborador() {
  const modal = document.getElementById('modal-colaborador');
  const select = document.getElementById('select-colaborador');
  if (!modal || !select) return;

  select.innerHTML = '<option value="">Carregando...</option>';
  modal.classList.add('ativo');

  try {
    const colaboradores = await buscarColaboradores();

    if (colaboradores.length === 0) {
      select.innerHTML = '<option value="">Nenhum colaborador cadastrado</option>';
      return;
    }

    select.innerHTML = '<option value="">Selecione seu nome...</option>' +
      colaboradores
        .map(c => `<option value="${c.id}" data-nome="${escapeHTML(c.nome)}">${escapeHTML(c.nome)}</option>`)
        .join('');
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    select.innerHTML = '<option value="">Erro ao carregar. Tente novamente.</option>';
  }
}

function fecharModalColaborador() {
  const modal = document.getElementById('modal-colaborador');
  if (modal) modal.classList.remove('ativo');
}

document.addEventListener('DOMContentLoaded', () => {
  const btnTrocar = document.getElementById('btn-trocar-colaborador');
  const btnConfirmar = document.getElementById('btn-confirmar-colaborador');
  const select = document.getElementById('select-colaborador');

  if (btnTrocar) btnTrocar.addEventListener('click', abrirModalColaborador);

  if (btnConfirmar && select) {
    btnConfirmar.addEventListener('click', () => {
      const opcaoSelecionada = select.options[select.selectedIndex];
      if (!select.value) {
        alert('Selecione um nome antes de confirmar.');
        return;
      }
      definirColaboradorAtivo({
        id: select.value,
        nome: opcaoSelecionada.dataset.nome,
      });
      fecharModalColaborador();
    });
  }

  atualizarBanner();

  // Se ninguém foi selecionado ainda neste dispositivo, pede assim que a página abre
  if (!obterColaboradorAtivo()) {
    abrirModalColaborador();
  }
});