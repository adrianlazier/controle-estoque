function escapeHTML(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


const statusMsg = document.getElementById('app-status');

function mostrarStatus(texto, tipo) {
  if (!statusMsg) return;
  statusMsg.textContent = texto;
  statusMsg.className = `status-msg ${tipo}`;
  statusMsg.style.display = 'block';
}

function esconderStatus() {
  if (!statusMsg) return;
  statusMsg.style.display = 'none';
}