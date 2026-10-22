const favoritoRepository = require('../repositories/FavoritoRepository');
const imovelRepository = require('../repositories/ImovelRepository');
const { ValidationError, ForbiddenError } = require('../errors/AppError');

class FavoritoService {
  /** RF14 */
  adicionar(clienteId, imovelId) {
    imovelRepository.findById(imovelId); // garante que o imovel existe (404 se nao existir)
    const existente = favoritoRepository.findByClienteEImovel(clienteId, imovelId);
    if (existente) throw new ValidationError('Este imovel ja esta na sua lista de favoritos.');
    return favoritoRepository.create({ clienteId: Number(clienteId), imovelId: Number(imovelId) });
  }

  /** RF15 */
  remover(clienteId, favoritoId) {
    const favorito = favoritoRepository.findById(favoritoId);
    if (favorito.clienteId !== Number(clienteId)) {
      throw new ForbiddenError('Voce so pode remover os proprios favoritos.');
    }
    favoritoRepository.delete(favoritoId);
  }

  /** RF11 (lista de favoritos) - retorna os favoritos ja com os dados do imovel. */
  listarPorCliente(clienteId) {
    const favoritos = favoritoRepository.findByCliente(clienteId);
    return favoritos.map((favorito) => ({
      favorito,
      imovel: imovelRepository.findById(favorito.imovelId),
    }));
  }
}

module.exports = new FavoritoService();
