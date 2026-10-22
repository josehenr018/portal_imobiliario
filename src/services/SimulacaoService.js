const simulacaoRepository = require('../repositories/SimulacaoRepository');
const usuarioRepository = require('../repositories/UsuarioRepository');
const imovelService = require('./ImovelService');
const { ValidationError } = require('../errors/AppError');

class SimulacaoService {
  /** RF07/RF08 - executa a simulacao de financiamento e retorna os imoveis compativeis. */
  simular(clienteId, { rendaMensal, idade, poupanca, fgts }) {
    if (!rendaMensal || !idade) {
      throw new ValidationError('Renda mensal e idade sao obrigatorias para a simulacao.');
    }

    // Atualiza o perfil financeiro do cliente com os dados mais recentes informados (RF06)
    const cliente = usuarioRepository.update(clienteId, {
      rendaMensal: Number(rendaMensal),
      idade: Number(idade),
      poupanca: Number(poupanca) || 0,
      fgts: Number(fgts) || 0,
    });

    const capacidadeCompra = cliente.calcularCapacidadeCompra();
    const entradaInformada = cliente.getValorEntradaTotal();

    const simulacao = simulacaoRepository.create({
      clienteId: Number(clienteId),
      rendaInformada: cliente.rendaMensal,
      idadeInformada: cliente.idade,
      entradaInformada,
      capacidadeCompra,
    });

    const portfolio = imovelService.listarDisponiveis();
    const imoveisCompativeis = simulacao.getImoveisCompativeis(portfolio);
    const simulacaoAtualizada = simulacaoRepository.update(simulacao.id, {
      imoveisEncontrados: imoveisCompativeis.map((i) => i.id),
    });

    return { simulacao: simulacaoAtualizada, imoveisCompativeis };
  }

  /** RF11 - historico de simulacoes do cliente. */
  listarPorCliente(clienteId) {
    return simulacaoRepository.findByCliente(clienteId)
      .sort((a, b) => new Date(b.dataSimulacao) - new Date(a.dataSimulacao));
  }
}

module.exports = new SimulacaoService();
