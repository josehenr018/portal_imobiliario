const { AppError } = require('../errors/AppError');

/**
 * Tratamento centralizado de excecoes (RNF06): sempre responde com uma
 * mensagem amigavel, nunca com o stack trace ou detalhes internos.
 */
function errorHandler(erro, req, res, next) { // eslint-disable-line no-unused-vars
  if (erro instanceof AppError) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  console.error('[LUNAR INTEL] Erro nao tratado:', erro);
  return res.status(500).json({ erro: 'Ocorreu um erro inesperado. Tente novamente mais tarde.' });
}

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota nao encontrada.' });
}

module.exports = { errorHandler, rotaNaoEncontrada };
