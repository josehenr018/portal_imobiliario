const Usuario = require('./Usuario');

/**
 * Administrador (subclasse de Usuario) - gestor da plataforma.
 * RN07 - atua exclusivamente em gestao, auditoria e relatorios; nunca
 * intermedia diretamente agendamentos de visita (essa capacidade simplesmente
 * nao existe nas rotas/servicos deste perfil).
 */
class Administrador extends Usuario {
  constructor(dados) {
    super(dados);
    this.tipo = 'ADMINISTRADOR';
    this.nivelAcesso = dados.nivelAcesso || 'GERENCIAL';
  }
}

module.exports = Administrador;
