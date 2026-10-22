// Logica da pagina do Cliente: tabs, simulacao, catalogo, favoritos, visitas, notificacoes e perfil.

let favoritosIds = new Set();

document.addEventListener('usuario-pronto', (evento) => {
  const usuario = evento.detail;
  document.getElementById('perfil-nome').value = usuario.nome;
  document.getElementById('perfil-telefone').value = usuario.telefone;
  document.getElementById('sim-renda').value = usuario.rendaMensal || '';
  document.getElementById('sim-idade').value = usuario.idade || '';
  document.getElementById('sim-poupanca').value = usuario.poupanca || '';
  document.getElementById('sim-fgts').value = usuario.fgts || '';

  carregarFavoritos();
  carregarHistoricoSimulacoes();
  carregarVisitas();
  carregarNotificacoes();
});

// --- TABS ---
document.querySelectorAll('.tab-btn').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    botao.classList.add('active');
    document.getElementById(`tab-${botao.dataset.tab}`).classList.add('active');
    if (botao.dataset.tab === 'catalogo') carregarCatalogo();
  });
});

// --- SIMULACAO (RF07/RF08) ---
document.getElementById('form-simulacao').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    const resultado = await Api.post('/simulacoes', {
      rendaMensal: Number(document.getElementById('sim-renda').value),
      idade: Number(document.getElementById('sim-idade').value),
      poupanca: Number(document.getElementById('sim-poupanca').value) || 0,
      fgts: Number(document.getElementById('sim-fgts').value) || 0,
    });

    document.getElementById('resultado-simulacao').style.display = 'block';
    document.getElementById('valor-capacidade').textContent = formatarMoeda(resultado.simulacao.capacidadeCompra);
    renderizarImoveis('grid-simulacao', resultado.imoveisCompativeis);
    carregarHistoricoSimulacoes();
  } catch (erro) {
    mostrarAlerta('alerta-simulacao', erro.message);
  }
});

async function carregarHistoricoSimulacoes() {
  const simulacoes = await Api.get('/simulacoes');
  const corpo = document.getElementById('tabela-historico-simulacoes');
  corpo.innerHTML = simulacoes.map((s) => `
    <tr>
      <td>${formatarData(s.dataSimulacao)}</td>
      <td>${formatarMoeda(s.rendaInformada)}</td>
      <td>${formatarMoeda(s.entradaInformada)}</td>
      <td>${formatarMoeda(s.capacidadeCompra)}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty-state">Nenhuma simulação realizada ainda.</td></tr>';
}

// --- CATALOGO (RF08/RF13) ---
document.getElementById('btn-filtrar').addEventListener('click', carregarCatalogo);

async function carregarCatalogo() {
  const parametros = new URLSearchParams();
  const tipo = document.getElementById('filtro-tipo').value;
  const quartos = document.getElementById('filtro-quartos').value;
  const banheiros = document.getElementById('filtro-banheiros').value;
  const precoMax = document.getElementById('filtro-preco').value;
  if (tipo) parametros.set('tipo', tipo);
  if (quartos) parametros.set('quartos', quartos);
  if (banheiros) parametros.set('banheiros', banheiros);
  if (precoMax) parametros.set('precoMax', precoMax);

  const imoveis = await Api.get(`/imoveis?${parametros.toString()}`);
  renderizarImoveis('grid-catalogo', imoveis);
}

// --- FAVORITOS (RF14/RF15) ---
async function carregarFavoritos() {
  const favoritos = await Api.get('/favoritos');
  favoritosIds = new Set(favoritos.map((f) => f.imovel.id));
  const grid = document.getElementById('grid-favoritos');
  grid.innerHTML = favoritos.map((f) => cartaoImovel(f.imovel, f.favorito.id)).join('')
    || '<p class="empty-state">Você ainda não favoritou nenhum imóvel.</p>';
  ativarBotoesImovel();
}

// --- RENDERIZACAO COMPARTILHADA DE IMOVEIS ---
function renderizarImoveis(idGrid, imoveis) {
  const grid = document.getElementById(idGrid);
  grid.innerHTML = imoveis.map((i) => cartaoImovel(i)).join('')
    || '<p class="empty-state">Nenhum imóvel encontrado para este filtro/perfil financeiro.</p>';
  ativarBotoesImovel();
}

function cartaoImovel(imovel, favoritoId) {
  const imagem = (imovel.imagens && imovel.imagens[0]) || 'https://placehold.co/600x400?text=LUNAR+INTEL';
  const jaFavoritado = favoritosIds.has(imovel.id) || favoritoId;
  return `
    <div class="card">
      <div class="card-img" style="background-image:url('${imagem}')">
        <div class="status-tag">${imovel.tipo}</div>
      </div>
      <div class="card-body">
        <h3>${imovel.titulo}</h3>
        <div class="card-price">${formatarMoeda(imovel.preco)}</div>
        <div class="card-features">
          <span><i class="fa-solid fa-bed"></i> ${imovel.quartos} quartos</span>
          <span><i class="fa-solid fa-bath"></i> ${imovel.banheiros} banheiros</span>
          <span><i class="fa-solid fa-ruler-combined"></i> ${imovel.areaTotal} m²</span>
        </div>
        <p style="font-size:13px; color:var(--text-dim); margin-top:10px;">${imovel.endereco.bairro}, ${imovel.endereco.cidade}/${imovel.endereco.estado}</p>
        <div class="card-actions">
          <button class="btn btn-small btn-agendar" data-id="${imovel.id}">Agendar visita</button>
          ${favoritoId
            ? `<button class="btn btn-small btn-danger btn-desfavoritar" data-favorito-id="${favoritoId}">Remover favorito</button>`
            : `<button class="btn btn-small btn-secondary btn-favoritar" data-id="${imovel.id}" ${jaFavoritado ? 'disabled' : ''}>
                 ${jaFavoritado ? 'Favoritado' : 'Favoritar'}
               </button>`}
        </div>
      </div>
    </div>
  `;
}

function ativarBotoesImovel() {
  document.querySelectorAll('.btn-agendar').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalAgendamento(botao.dataset.id));
  });
  document.querySelectorAll('.btn-favoritar').forEach((botao) => {
    botao.addEventListener('click', async () => {
      try {
        await Api.post('/favoritos', { imovelId: Number(botao.dataset.id) });
        await carregarFavoritos();
        document.querySelectorAll(`.btn-favoritar[data-id="${botao.dataset.id}"]`).forEach((b) => {
          b.disabled = true; b.textContent = 'Favoritado';
        });
      } catch (erro) { alert(erro.message); }
    });
  });
  document.querySelectorAll('.btn-desfavoritar').forEach((botao) => {
    botao.addEventListener('click', async () => {
      await Api.delete(`/favoritos/${botao.dataset.favoritoId}`);
      carregarFavoritos();
    });
  });
}

// --- MODAL DE AGENDAMENTO (RF10) ---
function abrirModalAgendamento(imovelId) {
  document.getElementById('agendar-imovel-id').value = imovelId;
  document.getElementById('alerta-agendamento').innerHTML = '';
  document.getElementById('modal-agendamento').classList.add('active');
}
document.getElementById('btn-fechar-modal').addEventListener('click', () => {
  document.getElementById('modal-agendamento').classList.remove('active');
});
document.getElementById('form-agendamento').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await Api.post('/agendamentos', {
      imovelId: Number(document.getElementById('agendar-imovel-id').value),
      dataVisita: document.getElementById('agendar-data').value,
      observacoes: document.getElementById('agendar-observacoes').value,
    });
    document.getElementById('modal-agendamento').classList.remove('active');
    document.getElementById('form-agendamento').reset();
    carregarVisitas();
  } catch (erro) {
    mostrarAlerta('alerta-agendamento', erro.message);
  }
});

// --- VISITAS (RF12) ---
async function carregarVisitas() {
  const visitas = await Api.get('/agendamentos');
  const imoveis = await Api.get('/imoveis'); // catalogo disponivel; suficiente para exibir o titulo
  const mapaImoveis = {};
  imoveis.forEach((i) => { mapaImoveis[i.id] = i; });

  const corpo = document.getElementById('tabela-visitas');
  corpo.innerHTML = visitas.map((v) => `
    <tr>
      <td>${mapaImoveis[v.imovelId]?.titulo || `Imóvel #${v.imovelId}`}</td>
      <td>${formatarData(v.dataVisita)}</td>
      <td><span class="pill pill-${v.status.toLowerCase()}">${v.status}</span></td>
      <td>${v.observacoes || '-'}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty-state">Nenhuma visita solicitada ainda.</td></tr>';
}

// --- NOTIFICACOES ---
async function carregarNotificacoes() {
  const notificacoes = await Api.get('/notificacoes');
  const lista = document.getElementById('lista-notificacoes');
  lista.innerHTML = notificacoes.map((n) => `
    <div class="notif-item ${n.lida ? '' : 'nao-lida'}" data-id="${n.id}">
      <h4>${n.titulo}</h4>
      <p>${n.mensagem}</p>
      <small>${formatarData(n.dataEnvio)}</small>
    </div>
  `).join('') || '<p class="empty-state">Nenhuma notificação.</p>';

  lista.querySelectorAll('.notif-item.nao-lida').forEach((item) => {
    item.addEventListener('click', async () => {
      await Api.put(`/notificacoes/${item.dataset.id}/lida`);
      item.classList.remove('nao-lida');
    });
  });
}

// --- PERFIL (RF04/RF05) ---
document.getElementById('form-perfil').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await Api.put('/auth/perfil', {
      nome: document.getElementById('perfil-nome').value,
      telefone: document.getElementById('perfil-telefone').value,
    });
    mostrarAlerta('alerta-perfil', 'Dados atualizados com sucesso.', 'success');
  } catch (erro) {
    mostrarAlerta('alerta-perfil', erro.message);
  }
});

document.getElementById('btn-inativar').addEventListener('click', async () => {
  if (!confirm('Tem certeza que deseja inativar sua conta?')) return;
  await Api.post('/auth/inativar');
  window.location.href = 'login.html';
});
