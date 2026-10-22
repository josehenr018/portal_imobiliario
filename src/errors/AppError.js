/**
 * Hierarquia de excecoes da aplicacao.
 * Cada subclasse representa uma das situacoes de erro exigidas pela
 * atividade de implementacao (dados invalidos, registro nao encontrado,
 * falha de persistencia, operacao nao permitida, estado incorreto).
 * O errorHandler (src/middlewares/errorHandler.js) usa o campo "status"
 * para decidir o codigo HTTP e nunca expoe o stack trace ao usuario (RNF06).
 */
class AppError extends Error {
  constructor(mensagem, status = 500) {
    super(mensagem);
    this.name = this.constructor.name;
    this.status = status;
  }
}

/** Dados obrigatorios ausentes ou em formato invalido. */
class ValidationError extends AppError {
  constructor(mensagem) {
    super(mensagem, 400);
  }
}

/** Credenciais invalidas ou usuario nao autenticado. */
class AuthError extends AppError {
  constructor(mensagem = 'Nao autenticado.') {
    super(mensagem, 401);
  }
}

/** Usuario autenticado mas sem permissao para a operacao (RBAC). */
class ForbiddenError extends AppError {
  constructor(mensagem = 'Operacao nao permitida para este perfil.') {
    super(mensagem, 403);
  }
}

/** Registro nao encontrado. */
class NotFoundError extends AppError {
  constructor(mensagem = 'Registro nao encontrado.') {
    super(mensagem, 404);
  }
}

/** Violacao de uma regra de negocio (RN01-RN12) ou tentativa de acao em estado incorreto. */
class BusinessRuleError extends AppError {
  constructor(mensagem) {
    super(mensagem, 422);
  }
}

/** Falha ao ler/gravar o arquivo de persistencia. */
class PersistenceError extends AppError {
  constructor(mensagem = 'Falha ao acessar os dados armazenados.') {
    super(mensagem, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  BusinessRuleError,
  PersistenceError,
};
