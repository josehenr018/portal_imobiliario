const { ValidationError } = require('../errors/AppError');

/**
 * Usuario - superclasse abstrata (Atividade 3/4).
 * Concentra os dados de identificacao, autenticacao e controle de conta
 * compartilhados por Cliente, Corretor e Administrador (heranca).
 * Nao deve ser instanciada diretamente.
 */
class Usuario {
  constructor({ id, nome, email, cpf, telefone, senhaHash, dataCadastro, ativo }) {
    if (new.target === Usuario) {
      throw new Error('Usuario e uma classe abstrata e nao pode ser instanciada diretamente.');
    }
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.telefone = telefone;
    this.senhaHash = senhaHash;
    this.dataCadastro = dataCadastro || new Date().toISOString();
    this.ativo = ativo !== undefined ? ativo : true;
  }

  /** RF04 - atualiza dados cadastrais basicos (nunca o CPF, conforme perfil Cliente). */
  atualizarDados({ nome, telefone }) {
    if (nome !== undefined) {
      if (!nome || !nome.trim()) throw new ValidationError('Nome nao pode ser vazio.');
      this.nome = nome.trim();
    }
    if (telefone !== undefined) this.telefone = telefone;
  }

  /** RF05 - inativacao voluntaria da conta. */
  inativarConta() {
    this.ativo = false;
  }

  reativarConta() {
    this.ativo = true;
  }

  /** Serializa somente os dados seguros para envio ao cliente (sem hash de senha). */
  paraDadosPublicos() {
    const { senhaHash, ...dadosPublicos } = this;
    return dadosPublicos;
  }
}

module.exports = Usuario;
