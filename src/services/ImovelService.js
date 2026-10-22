const imovelRepository = require('../repositories/ImovelRepository');
const agendamentoRepository = require('../repositories/AgendamentoRepository');
const usuarioRepository = require('../repositories/UsuarioRepository');
const Endereco = require('../models/Endereco');
const { ValidationError, ForbiddenError, BusinessRuleError } = require('../errors/AppError');
const { STATUS_IMOVEL, STATUS_AGENDAMENTO } = require('../config/constants');

class ImovelService {
  /** RF08/RF13/RF25 - catalogo publico com filtros, sempre excluindo inativos/vendidos (RN12). */
  listarDisponiveis({ tipo, quartos, banheiros, cidade, precoMax } = {}) {
    return imovelRepository.findMany((imovel) => {
      if (imovel.status !== STATUS_IMOVEL.DISPONIVEL) return false;
      if (tipo && imovel.tipo !== tipo) return false;
      if (quartos && imovel.quartos < Number(quartos)) return false;
      if (banheiros && imovel.banheiros < Number(banheiros)) return false;
      if (cidade && imovel.endereco.cidade.toLowerCase() !== String(cidade).toLowerCase()) return false;
      if (precoMax && imovel.preco > Number(precoMax)) return false;
      return true;
    });
  }

  /** RF09 */
  buscarPorId(id) {
    return imovelRepository.findById(id);
  }

  /** RF17/F14 - cadastro de imovel pelo corretor. */
  cadastrar(corretorId, dados) {
    if (!dados.titulo || !dados.preco || !dados.endereco) {
      throw new ValidationError('Titulo, preco e endereco sao obrigatorios.');
    }
    if (dados.endereco.cep && !Endereco.validarCEP(dados.endereco.cep)) {
      throw new ValidationError('CEP invalido.');
    }
    return imovelRepository.create({ ...dados, corretorId: Number(corretorId), status: STATUS_IMOVEL.DISPONIVEL });
  }

  /** Garante a RN06 - isolamento: somente o corretor titular altera/remove seu imovel. */
  _verificarTitularidade(imovel, corretorId) {
    if (imovel.corretorId !== Number(corretorId)) {
      throw new ForbiddenError('Voce so pode alterar imoveis do seu proprio portfolio (RN06).');
    }
  }

  /** RF18/F15 */
  atualizar(corretorId, imovelId, dados) {
    const imovel = imovelRepository.findById(imovelId);
    this._verificarTitularidade(imovel, corretorId);
    return imovelRepository.update(imovelId, dados);
  }

  /** RF19/F16 */
  inativar(corretorId, imovelId) {
    const imovel = imovelRepository.findById(imovelId);
    this._verificarTitularidade(imovel, corretorId);
    imovel.inativar();
    return imovelRepository.salvarEntidade(imovel);
  }

  /** RF24/F21/RF21 - RN02: so pode ser vendido se nao houver visitas em aberto. */
  marcarComoVendido(corretorId, imovelId, valorVenda) {
    const imovel = imovelRepository.findById(imovelId);
    this._verificarTitularidade(imovel, corretorId);

    const agendamentosVinculados = agendamentoRepository.findByImovel(imovelId);
    const temVisitaEmAberto = agendamentosVinculados.some(
      (a) => a.status === STATUS_AGENDAMENTO.PENDENTE || a.status === STATUS_AGENDAMENTO.CONFIRMADO,
    );
    if (temVisitaEmAberto) {
      throw new BusinessRuleError(
        'Nao e possivel concluir a venda: existem visitas pendentes ou confirmadas para este imovel (RN02).',
      );
    }

    imovel.marcarComoVendido(valorVenda);
    const salvo = imovelRepository.salvarEntidade(imovel);

    const corretor = usuarioRepository.findById(corretorId);
    corretor.registrarVenda();
    usuarioRepository.salvarEntidade(corretor);

    return salvo;
  }

  listarPorCorretor(corretorId) {
    return imovelRepository.findByCorretor(corretorId);
  }

  listarTodos() {
    return imovelRepository.findAll();
  }
}

module.exports = new ImovelService();
