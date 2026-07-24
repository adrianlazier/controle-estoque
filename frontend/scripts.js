const URL = "http://localhost:3000/produtos";

const form = document.getElementById('form-produto');
const tabela = document.getElementById('tabela-produtos');

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
            <td>
                <button class="btn-deletar" onclick="deletarProduto(${produto.id})">Excluir</button>
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

async function deletarProduto(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      const resposta = await fetch(`${URL}/${id}`, {
        method: 'DELETE'
      });

      if (resposta.ok) {
        carregarProdutos(); // Atualiza a lista após deletar
      } else {
        alert('Erro ao deletar produto.');
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  }
}

carregarProdutos()