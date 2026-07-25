const URL = "http://localhost:3000/produtos";

const form = document.getElementById('form-produto');
const tabela = document.getElementById('tabela-produtos');

const modal = document.getElementById('modal-edicao');
const formEdicao = document.getElementById('form-editar-produto');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');

async function carregarProdutos() {
    try {
        const resposta = await fetch(URL);
        const produtos = await resposta.json();

        tabela.innerHTML = '';

        produtos.forEach(produto => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.descricao}</td>
            <td>${produto.codigo || '-'}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.quantidade_minima}</td>
            <td>${produto.posicao || '-'}</td>
            <td>${produto.fabricante || '-'}</td>
            <td>${produto.referencia}</td>
            <td class ="acoes">
                <button class="btn-acao btn-editar" onclick="abrirModalEdicao(${produto.id})">Editar</button>
                <button class="btn-acao btn-deletar" onclick="deletarProduto(${produto.id})">Excluir</button>
            </td>
            `;
            tabela.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

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