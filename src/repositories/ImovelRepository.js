const JsonRepository = require('./JsonRepository');
const Imovel = require('../models/Imovel');

class ImovelRepository extends JsonRepository {
  constructor() {
    super('imoveis.json', (dados) => new Imovel(dados));
  }

  findByCorretor(corretorId) {
    return this.findMany((i) => i.corretorId === Number(corretorId));
  }
}

module.exports = new ImovelRepository();
