const JsonRepository = require('./JsonRepository');
const Favorito = require('../models/Favorito');

class FavoritoRepository extends JsonRepository {
  constructor() {
    super('favoritos.json', (dados) => new Favorito(dados));
  }

  findByCliente(clienteId) {
    return this.findMany((f) => f.clienteId === Number(clienteId));
  }

  findByClienteEImovel(clienteId, imovelId) {
    return this.findOne((f) => f.clienteId === Number(clienteId) && f.imovelId === Number(imovelId));
  }
}

module.exports = new FavoritoRepository();
