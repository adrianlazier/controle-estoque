async function apiFetch(caminho, opcoes = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...opcoes.headers,
  };

  const resposta = await fetch(`${PRODUTOS_ENDPOINT}${caminho}`, { ...opcoes, headers });
  return resposta;
}

async function buscarProdutos() {
  const resposta = await apiFetch('');
  if (!resposta.ok) throw new Error('Erro ao buscar produtos');
  return resposta.json();
}

async function buscarProdutoPorId(id) {
  const resposta = await apiFetch(`/${id}`);
  if (!resposta.ok) throw new Error('Produto não encontrado');
  return resposta.json();
}

async function criarProduto(dados) {
  return apiFetch('', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

async function atualizarProduto(id, dados) {
  return apiFetch(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

async function deletarProduto(id) {
  return apiFetch(`/${id}`, { method: 'DELETE' });
}

async function movimentarEstoque(id, tipo, quantidade) {
  return apiFetch(`/${id}/movimentar`, {
    method: 'PATCH',
    body: JSON.stringify({ tipo, quantidade }),
  });
}