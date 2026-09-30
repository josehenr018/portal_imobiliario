import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
  clear() { storage.clear(); }
};

const { RepositorioJSON } = await import('../js/repositories/Repositorio.js');
const { LunarService } = await import('../js/services/LunarService.js');

const cliente = { id: 'cli-1', nome: 'Ana', rendaMensal: 8000, idade: 35 };

test('simulação deve aplicar a regra de 30% da renda e validar a idade', () => {
  const repositorio = new RepositorioJSON('test:lunar-core:simulacao');
  const servico = new LunarService(repositorio);
  const simulacao = servico.simular(cliente, 50000);

  assert.ok(simulacao.capacidade > 0);
  assert.ok(simulacao.imoveisEncontrados.length > 0);
  assert.throws(() => servico.simular({ ...cliente, idade: 17 }, 0), /idade/i);
});

test('entrada acima de 80% do valor do imóvel deve ser rejeitada', () => {
  const repositorio = new RepositorioJSON('test:lunar-core:entrada');
  const servico = new LunarService(repositorio);
  const imovel = servico.portfolio[0];

  assert.throws(() => {
    servico.validarEntrada({ entrada: imovel.preco * 0.81, imovel });
  }, /80%/i);
});

test('solicitação de visita deve respeitar o limite de 3 agendamentos ativos por imóvel', () => {
  const repositorio = new RepositorioJSON('test:lunar-core:visitas');
  const servico = new LunarService(repositorio);
  const imovel = servico.portfolio[0];
  const clienteId = 'cli-2';

  for (let i = 0; i < 3; i += 1) {
    const data = `2026-10-${String(10 + i * 9).padStart(2, '0')} 14:00`;
    servico.solicitarVisita(clienteId, imovel, data);
  }

  assert.throws(() => servico.solicitarVisita(clienteId, imovel, '2026-10-31 14:00'), /3 solicitações/i);
});

test('painel resumido e cadastro de imóveis devem refletir dados de negócio', () => {
  const repositorio = new RepositorioJSON('test:lunar-core:dashboard');
  const servico = new LunarService(repositorio);
  const imovel = servico.portfolio[0];
  const clienteId = 'cli-dashboard';

  servico.favoritar(clienteId, imovel.id);
  servico.solicitarVisita(clienteId, imovel, '2026-11-15 16:00');

  const painelCliente = servico.obterDashboard('cliente', clienteId);
  assert.equal(painelCliente.favoritos, 1);
  assert.ok(painelCliente.simulacoes >= 0);

  const novoImovel = servico.cadastrarImovel({
    titulo: 'Cobertura Modernista',
    preco: 525000,
    quartos: 3,
    banheiros: 2,
    tipo: 'Apartamento',
    areaTotal: 120,
    endereco: { cidade: 'Birigui', estado: 'SP', bairro: 'Centro', logradouro: 'Rua Nova', numero: '777' }
  }, 99);

  assert.equal(novoImovel.corretorId, 99);
  assert.ok(servico.portfolio.some(item => item.titulo === 'Cobertura Modernista'));

  const painelCorretor = servico.obterDashboard('corretor', 99);
  assert.ok(painelCorretor.totalImoveis >= 1);
});

test('corretor deve conseguir confirmar e registrar a visita', () => {
  const repositorio = new RepositorioJSON('test:lunar-core:agenda');
  const servico = new LunarService(repositorio);
  const imovel = servico.portfolio[1];
  const agendamento = servico.solicitarVisita('cli-agenda', imovel, '2026-12-10 15:00');

  servico.atualizarStatusVisita(agendamento.id, 'Confirmada');
  assert.equal(agendamento.status, 'Confirmada');

  servico.atualizarStatusVisita(agendamento.id, 'Realizada');
  assert.equal(agendamento.status, 'Realizada');

  assert.throws(() => servico.atualizarStatusVisita(agendamento.id, 'Confirmada'), /encerra|estado|status/i);
});

test('administrador deve conseguir editar e inativar imóveis', () => {
  const repositorio = new RepositorioJSON('test:lunar-core:admin');
  const servico = new LunarService(repositorio);
  const imovel = servico.portfolio[0];

  servico.editarImovel(imovel.id, { titulo: 'Casa Aurora Premium', preco: 210000, quartos: 4 });
  assert.equal(imovel.titulo, 'Casa Aurora Premium');
  assert.equal(imovel.preco, 210000);
  assert.equal(imovel.quartos, 4);

  servico.atualizarStatusImovel(imovel.id, 'Inativo');
  assert.equal(imovel.status, 'Inativo');

  servico.atualizarStatusImovel(imovel.id, 'Disponível');
  assert.equal(imovel.status, 'Disponível');
});
