const URL = "http://localhost:3000/produtos";

const form = document.getElementById('form-produto');
const tabela = document.getElementById('tabela-produtos');

const modal = document.getElementById('modal-edicao');
const formEdicao = document.getElementById('form-editar-produto');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');

const statusMsg = document.getElementById('status-msg');


function mostrarStatus(texto, tipo) {
  statusMsg.textContent = texto;
  statusMsg.className = `status-msg ${tipo}`;
  statusMsg.style.display = 'block';
}

function esconderStatus() {
  statusMsg.style.display = 'none';
}

// Previne XSS: converte caracteres especiais em entidades HTML seguras
function escapeHTML(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

let produtosCache = [];

async function carregarProdutos() {
  mostrarStatus("Carregando produtos...", "loading");
    try {
        const resposta = await fetch(URL);
        const produtos = await resposta.json();

        produtosCache = produtos;
        renderizarTabela(produtos);
        esconderStatus();

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        mostrarStatus('Erro ao carregar produtos. Verifique a conexão com o servidor.', 'erro');
    }
}

function renderizarTabela(lista) {
    tabela.innerHTML = '';

    if (lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="9" class="tabela-vazia">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    lista.forEach(produto => {
        const tr = document.createElement("tr");
        const estoqueCritico = produto.quantidade <= produto.quantidade_minima;
        if (estoqueCritico) tr.classList.add("estoque-baixo");

        tr.innerHTML = `
        <td>${escapeHTML(produto.id)}</td>
        <td>${escapeHTML(produto.descricao)}</td>
        <td>${escapeHTML(produto.codigo) || '-'}</td>
        <td>${escapeHTML(produto.quantidade)}${estoqueCritico ? ' <i class="fa-solid fa-triangle-exclamation"></i>' : ''}</td>
        <td>${escapeHTML(produto.quantidade_minima)}</td>
        <td>${escapeHTML(produto.posicao) || '-'}</td>
        <td>${escapeHTML(produto.fabricante) || '-'}</td>
        <td>${escapeHTML(produto.referencia) || '-'}</td>
        <td class="acoes">
            <div class="acoes-movimentacao">
                <button class="btn-mov btn-entrada" onclick="movimentarProduto(${produto.id}, 'entrada')" title="Entrada de estoque">+</button>
                <button class="btn-mov btn-saida" onclick="movimentarProduto(${produto.id}, 'saida')" title="Saída de estoque">−</button>
            </div>
            <button class="btn-acao btn-editar" onclick="abrirModalEdicao(${produto.id})">Editar</button>
            <button class="btn-acao btn-deletar" onclick="deletarProduto(${produto.id})">Excluir</button>
        </td>
        `;
        tabela.appendChild(tr);
    });
}

const inputBusca = document.getElementById('busca');

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

form.addEventListener("submit",async (e) => {
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
    const resposta = await fetch(URL, {
        method: "POST",
        headers: {"Content-Type": "Application/json"},
        body: JSON.stringify(novoProduto)
    });

    if(resposta.ok) {
        form.reset();
        carregarProdutos();
    } else {
        const erro = await resposta.json();
        alert(`Erro: ${erro.erro}`);
    }
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
  }
});

async function abrirModalEdicao(id) {
  try {
    const resposta = await fetch(`${URL}/${id}`);
    if (!resposta.ok) throw new Error('Produto não encontrado');

    const produto = await resposta.json();

    
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
    const resposta = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados)
    });

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

function fecharModal() {
  modal.classList.remove('ativo');
  formEdicao.reset();
}

btnFecharModal.addEventListener('click', fecharModal);
btnCancelarModal.addEventListener('click', fecharModal);

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    fecharModal();
  }
});

async function movimentarProduto(id, tipo) {
  const acao = tipo === 'entrada' ? 'adicionar' : 'retirar';
  const quantidade = prompt(`Quantidade a ${acao}:`);

  if (quantidade === null) return; // usuário cancelou

  const valor = Number(quantidade);
  if (isNaN(valor) || valor <= 0) {
    alert('Informe um número válido maior que zero.');
    return;
  }

  try {
    const resposta = await fetch(`${URL}/${id}/movimentar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, quantidade: valor })
    });

    if (resposta.ok) {
      carregarProdutos();
    } else {
      const erro = await resposta.json();
      alert(`Erro: ${erro.erro}`);
    }
  } catch (error) {
    console.error('Erro ao movimentar estoque:', error);
    alert('Erro ao conectar com o servidor.');
  }
}

async function deletarProduto(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      const resposta = await fetch(`${URL}/${id}`, {
        method: 'DELETE'
      });

      if (resposta.ok) {
        carregarProdutos();
      } else {
        alert('Erro ao deletar produto.');
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  }
}


carregarProdutos()