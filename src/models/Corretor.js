const Usuario = require('./Usuario');

// RN11 - padrao estadual: numero de 4 a 6 digitos + sufixo de uma ou duas letras (ex: 12345-F, 123456-J)
const REGEX_CRECI = /^\d{4,6}-[A-Z]{1,2}$/;

/**
 * Corretor (subclasse de Usuario) - profissional credenciado no CRECI,
 * responsavel pelo proprio portfolio de imoveis e pelas visitas recebidas.
 */
class Corretor extends Usuario {
  constructor(dados) {
    super(dados);
    this.tipo = 'CORRETOR';
    this.creci = dados.creci;
    this.especialidade = dados.especialidade || '';
    this.totalVendas = dados.totalVendas || 0;
    this.comissaoPercentual = dados.comissaoPercentual || 5;
  }

  /** RN11 - valida o formato estrutural do registro CRECI. */
  static validarCRECI(creci) {
    return typeof creci === 'string' && REGEX_CRECI.test(creci.trim().toUpperCase());
  }

  registrarVenda() {
    this.totalVendas += 1;
  }
}

module.exports = Corretor;
