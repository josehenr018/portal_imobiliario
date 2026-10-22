// Logica da pagina do Corretor: portfolio (CRUD), solicitacoes de visita, notificacoes e perfil.

document.addEventListener('usuario-pronto', (evento) => {
  const usuario = evento.detail;
  document.getElementById('perfil-nome').value = usuario.nome;
  document.getElementById('perfil-telefone').value = usuario.telefone;
  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card"><div class="valor">${usuario.totalVendas || 0}</div><div class="label">Vendas realizadas</div></div>
    <div class="stat-card"><div class="valor">${usuario.creci}</div><div class="label">Registro CRECI</div></div>
    <div class="stat-card"><div class="valor">${usuario.comissaoPercentual}%</div><div class="label">Comissão</div></div>
  `;
  carregarPortfolio();
  carregarSolicitacoes();
  carregarNotificacoes();
});

// --- TABS ---
document.querySelectorAll('.tab-btn').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    botao.classList.add('active');
    document.getElementById(`tab-${botao.dataset.tab}`).classList.add('active');
  });
});

// --- PORTFOLIO (RF17/F14, RF18, RF19, RF24) ---
async function carregarPortfolio() {
  const imoveis = await Api.get('/imoveis/meu-portfolio');
  const grid = document.getElementById('grid-portfolio');
  grid.innerHTML = imoveis.map((imovel) => `
    <div class="card">
      <div class="card-img" style="background-image:url('${(imovel.imagens && imovel.imagens[0]) || 'https://placehold.co/600x400?text=LUNAR+INTEL'}')">
        <div class="status-tag ${imovel.status === 'Vendido' ? 'vendido' : imovel.status === 'Inativo' ? 'inativo' : ''}">${imovel.status}</div>
      </div>
      <div class="card-body">
        <h3>${imovel.titulo}</h3>
        <div class="card-price">${formatarMoeda(imovel.preco)}</div>
        <div class="card-features">
          <span><i class="fa-solid fa-bed"></i> ${imovel.quartos}q</span>
          <span><i class="fa-solid fa-bath"></i> ${imovel.banheiros}b</span>
          <span><i class="fa-solid fa-ruler-combined"></i> ${imovel.areaTotal} m²</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-small btn-secondary btn-editar" data-id="${imovel.id}">Editar</button>
          ${imovel.status === 'Disponivel' ? `
            <button class="btn btn-small btn-danger btn-inativar" data-id="${imovel.id}">Inativar</button>
            <button class="btn btn-small btn-vender" data-id="${imovel.id}" data-preco="${imovel.preco}">Marcar vendido</button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('') || '<p class="empty-state">Você ainda não cadastrou nenhum imóvel.</p>';

  grid.querySelectorAll('.btn-editar').forEach((b) => b.addEventListener('click', () => abrirModalImovel(imoveis.find((i) => i.id == b.dataset.id))));
  grid.querySelectorAll('.btn-inativar').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Inativar este imóvel?')) return;
    await Api.delete(`/imoveis/${b.dataset.id}`);
    carregarPortfolio();
  }));
  grid.querySelectorAll('.btn-vender').forEach((b) => b.addEventListener('click', async () => {
    const valor = prompt('Valor final de venda (R$):', b.dataset.preco);
    if (!valor) return;
    try {
      await Api.post(`/imoveis/${b.dataset.id}/vender`, { valorVenda: Number(valor) });
      carregarPortfolio();
    } catch (erro) { alert(erro.message); }
  }));
}

function abrirModalImovel(imovel) {
  document.getElementById('titulo-modal-imovel').textContent = imovel ? 'Editar imóvel' : 'Novo imóvel';
  document.getElementById('alerta-imovel').innerHTML = '';
  document.getElementById('imovel-id').value = imovel ? imovel.id : '';
  document.getElementById('imovel-titulo').value = imovel ? imovel.titulo : '';
  document.getElementById('imovel-descricao').value = imovel ? imovel.descricao : '';
  document.getElementById('imovel-tipo').value = imovel ? imovel.tipo : 'Casa';
  document.getElementById('imovel-preco').value = imovel ? imovel.preco : '';
  document.getElementById('imovel-area').value = imovel ? imovel.areaTotal : '';
  document.getElementById('imovel-quartos').value = imovel ? imovel.quartos : '';
  document.getElementById('imovel-banheiros').value = imovel ? imovel.banheiros : '';
  document.getElementById('imovel-logradouro').value = imovel ? imovel.endereco.logradouro : '';
  document.getElementById('imovel-numero').value = imovel ? imovel.endereco.numero : '';
  document.getElementById('imovel-bairro').value = imovel ? imovel.endereco.bairro : '';
  document.getElementById('imovel-cidade').value = imovel ? imovel.endereco.cidade : '';
  document.getElementById('imovel-estado').value = imovel ? imovel.endereco.estado : '';
  document.getElementById('imovel-cep').value = imovel ? imovel.endereco.cep : '';
  document.getElementById('imovel-imagem').value = imovel && imovel.imagens ? imovel.imagens[0] : '';
  document.getElementById('modal-imovel').classList.add('active');
}
document.getElementById('btn-novo-imovel').addEventListener('click', () => abrirModalImovel(null));
document.getElementById('btn-fechar-modal-imovel').addEventListener('click', () => {
  document.getElementById('modal-imovel').classList.remove('active');
});

document.getElementById('form-imovel').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = document.getElementById('imovel-id').value;
  const dados = {
    titulo: document.getElementById('imovel-titulo').value,
    descricao: document.getElementById('imovel-descricao').value,
    tipo: document.getElementById('imovel-tipo').value,
    preco: Number(document.getElementById('imovel-preco').value),
    areaTotal: Number(document.getElementById('imovel-area').value) || 0,
    quartos: Number(document.getElementById('imovel-quartos').value) || 0,
    banheiros: Number(document.getElementById('imovel-banheiros').value) || 0,
    imagens: document.getElementById('imovel-imagem').value ? [document.getElementById('imovel-imagem').value] : [],
    endereco: {
      logradouro: document.getElementById('imovel-logradouro').value,
      numero: document.getElementById('imovel-numero').value,
      bairro: document.getElementById('imovel-bairro').value,
      cidade: document.getElementById('imovel-cidade').value,
      estado: document.getElementById('imovel-estado').value,
      cep: document.getElementById('imovel-cep').value,
    },
  };

  try {
    if (id) await Api.put(`/imoveis/${id}`, dados);
    else await Api.post('/imoveis', dados);
    document.getElementById('modal-imovel').classList.remove('active');
    carregarPortfolio();
  } catch (erro) {
    mostrarAlerta('alerta-imovel', erro.message);
  }
});

// --- SOLICITACOES DE VISITA (RF18/F18, RF19/F19/F22) ---
async function carregarSolicitacoes() {
  const [agendamentos, imoveis] = await Promise.all([Api.get('/agendamentos'), Api.get('/imoveis/meu-portfolio')]);
  const mapaImoveis = {};
  imoveis.forEach((i) => { mapaImoveis[i.id] = i; });

  const corpo = document.getElementById('tabela-solicitacoes');
  corpo.innerHTML = agendamentos.map((a) => `
    <tr>
      <td>${mapaImoveis[a.imovelId]?.titulo || `Imóvel #${a.imovelId}`}</td>
      <td>${formatarData(a.dataVisita)}</td>
      <td><span class="pill pill-${a.status.toLowerCase()}">${a.status}</span></td>
      <td>
        ${a.status === 'Pendente' ? `<button class="btn btn-small btn-confirmar" data-id="${a.id}">Confirmar</button>
          <button class="btn btn-small btn-danger btn-cancelar" data-id="${a.id}">Cancelar</button>` : ''}
        ${a.status === 'Confirmado' ? `<button class="btn btn-small btn-realizar" data-id="${a.id}">Marcar realizada</button>
          <button class="btn btn-small btn-secondary btn-reagendar" data-id="${a.id}">Reagendar</button>
          <button class="btn btn-small btn-danger btn-cancelar" data-id="${a.id}">Cancelar</button>` : ''}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="empty-state">Nenhuma solicitação recebida ainda.</td></tr>';

  corpo.querySelectorAll('.btn-confirmar').forEach((b) => b.addEventListener('click', async () => {
    await Api.put(`/agendamentos/${b.dataset.id}/confirmar`); carregarSolicitacoes();
  }));
  corpo.querySelectorAll('.btn-realizar').forEach((b) => b.addEventListener('click', async () => {
    await Api.put(`/agendamentos/${b.dataset.id}/realizar`); carregarSolicitacoes();
  }));
  corpo.querySelectorAll('.btn-cancelar').forEach((b) => b.addEventListener('click', async () => {
    const motivo = prompt('Motivo do cancelamento (opcional):') || '';
    await Api.put(`/agendamentos/${b.dataset.id}/cancelar`, { motivo });
    carregarSolicitacoes();
  }));
  corpo.querySelectorAll('.btn-reagendar').forEach((b) => b.addEventListener('click', async () => {
    const novaData = prompt('Nova data e horário (AAAA-MM-DDTHH:MM):');
    if (!novaData) return;
    await Api.put(`/agendamentos/${b.dataset.id}/reagendar`, { dataVisita: novaData });
    carregarSolicitacoes();
  }));
}

// --- NOTIFICACOES ---
async function carregarNotificacoes() {
  const notificacoes = await Api.get('/notificacoes');
  const lista = document.getElementById('lista-notificacoes');
  lista.innerHTML = notificacoes.map((n) => `
    <div class="notif-item ${n.lida ? '' : 'nao-lida'}" data-id="${n.id}">
      <h4>${n.titulo}</h4><p>${n.mensagem}</p><small>${formatarData(n.dataEnvio)}</small>
    </div>
  `).join('') || '<p class="empty-state">Nenhuma notificação.</p>';

  lista.querySelectorAll('.notif-item.nao-lida').forEach((item) => {
    item.addEventListener('click', async () => {
      await Api.put(`/notificacoes/${item.dataset.id}/lida`);
      item.classList.remove('nao-lida');
    });
  });
}

// --- PERFIL ---
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
