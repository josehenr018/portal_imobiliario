const JsonRepository = require('./JsonRepository');
const Agendamento = require('../models/Agendamento');

class AgendamentoRepository extends JsonRepository {
  constructor() {
    super('agendamentos.json', (dados) => new Agendamento(dados));
  }

  findByCliente(clienteId) {
    return this.findMany((a) => a.clienteId === Number(clienteId));
  }

  findByCorretor(corretorId) {
    return this.findMany((a) => a.corretorId === Number(corretorId));
  }

  findByImovel(imovelId) {
    return this.findMany((a) => a.imovelId === Number(imovelId));
  }
}

module.exports = new AgendamentoRepository();
