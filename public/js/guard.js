/**
 * Protege as paginas de dashboard: confirma autenticacao e perfil correto,
 * monta a navbar comum e expoe window.usuarioAtual para os scripts de cada pagina.
 * Uso: <script src="js/guard.js" data-perfil="CLIENTE"></script>
 */
(async function iniciarGuard() {
  const scriptAtual = document.currentScript;
  const perfilEsperado = scriptAtual.dataset.perfil;
  const paginaPorPerfil = { CLIENTE: 'cliente.html', CORRETOR: 'corretor.html', ADMINISTRADOR: 'admin.html' };

  try {
    const usuario = await Api.get('/auth/me');
    if (perfilEsperado && usuario.tipo !== perfilEsperado) {
      window.location.href = paginaPorPerfil[usuario.tipo] || 'login.html';
      return;
    }
    window.usuarioAtual = usuario;
    montarNavbar(usuario);
    document.dispatchEvent(new CustomEvent('usuario-pronto', { detail: usuario }));
  } catch (erro) {
    window.location.href = 'login.html';
  }
})();

function montarNavbar(usuario) {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
    <div class="logo">LU<span>NAR</span> INTEL</div>
    <div class="nav-links">
      <span class="badge-perfil">${usuario.nome} &middot; ${usuario.tipo}</span>
      <button id="btn-logout">Sair</button>
    </div>
  `;
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await Api.post('/auth/logout');
    window.location.href = 'login.html';
  });
}
