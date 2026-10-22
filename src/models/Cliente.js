const Usuario = require('./Usuario');
const { ValidationError } = require('../errors/AppError');
const {
  COMPROMETIMENTO_MAX_RENDA,
  TAXA_JUROS_MENSAL,
  PRAZO_FINANCIAMENTO_MESES,
  IDADE_MINIMA,
  IDADE_MAXIMA,
} = require('../config/constants');

/**
 * Cliente (subclasse de Usuario) - comprador de imoveis.
 * Acrescenta dados financeiros usados no motor de simulacao de financiamento.
 */
class Cliente extends Usuario {
  constructor(dados) {
    super(dados);
    this.tipo = 'CLIENTE';
    this.rendaMensal = dados.rendaMensal;
    this.idade = dados.idade;
    this.poupanca = dados.poupanca || 0;
    this.fgts = dados.fgts || 0;
    this.profissao = dados.profissao || '';
  }

  /** RN05 - idade minima de 18 e maxima de 70 anos para simular financiamento. */
  validarIdade() {
    return this.idade >= IDADE_MINIMA && this.idade <= IDADE_MAXIMA;
  }

  /** RN01 - parcela maxima aceitavel: 30% da renda bruta mensal. */
  obterParcelaMaxima() {
    return this.rendaMensal * COMPROMETIMENTO_MAX_RENDA;
  }

  /** Soma dos recursos proprios disponiveis para entrada. */
  getValorEntradaTotal() {
    return this.poupanca + this.fgts;
  }

  /**
   * RN01 - calcula o valor maximo de imovel que o cliente consegue adquirir,
   * usando a Tabela Price (PV de uma serie de parcelas fixas) somado a entrada.
   */
  calcularCapacidadeCompra() {
    if (!this.validarIdade()) {
      throw new ValidationError('Idade fora da faixa permitida para simulacao (18 a 70 anos).');
    }
    if (!this.rendaMensal || this.rendaMensal <= 0) {
      throw new ValidationError('Renda mensal deve ser informada e maior que zero.');
    }

    const parcelaMaxima = this.obterParcelaMaxima();
    const i = TAXA_JUROS_MENSAL;
    const n = PRAZO_FINANCIAMENTO_MESES;
    const valorFinanciavel = parcelaMaxima * (1 - Math.pow(1 + i, -n)) / i;

    return valorFinanciavel + this.getValorEntradaTotal();
  }
}

module.exports = Cliente;
