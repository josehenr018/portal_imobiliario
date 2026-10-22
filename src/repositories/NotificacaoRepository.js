const JsonRepository = require('./JsonRepository');
const Notificacao = require('../models/Notificacao');

class NotificacaoRepository extends JsonRepository {
  constructor() {
    super('notificacoes.json', (dados) => new Notificacao(dados));
  }

  findByUsuario(usuarioId) {
    return this.findMany((n) => n.usuarioId === Number(usuarioId))
      .sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
  }
}

module.exports = new NotificacaoRepository();
