const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const btnAbrir = document.getElementById('btn-abrir-sidebar');
const btnFechar = document.getElementById('btn-fechar-sidebar');

function abrirSidebar() {
  sidebar.classList.add('aberta');
  overlay.classList.add('ativo');
  document.body.style.overflow = 'hidden'; 
}

function fecharSidebar() {
  sidebar.classList.remove('aberta');
  overlay.classList.remove('ativo');
  document.body.style.overflow = '';
}

if (btnAbrir) btnAbrir.addEventListener('click', abrirSidebar);
if (btnFechar) btnFechar.addEventListener('click', fecharSidebar);
if (overlay) overlay.addEventListener('click', fecharSidebar);


window.addEventListener('resize', () => {
  if (window.innerWidth > 860) fecharSidebar();
});