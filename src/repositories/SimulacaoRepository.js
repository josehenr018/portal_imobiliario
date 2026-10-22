const JsonRepository = require('./JsonRepository');
const Simulacao = require('../models/Simulacao');

class SimulacaoRepository extends JsonRepository {
  constructor() {
    super('simulacoes.json', (dados) => new Simulacao(dados));
  }

  findByCliente(clienteId) {
    return this.findMany((s) => s.clienteId === Number(clienteId));
  }
}

module.exports = new SimulacaoRepository();
