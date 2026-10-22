/**
 * Parametros financeiros e regras de negocio centralizados.
 * Mantidos em um unico lugar para facilitar a explicacao na apresentacao
 * e a rastreabilidade com as regras RN01-RN12 do documento de requisitos.
 */
module.exports = {
  // RN01 - comprometimento maximo de renda com a parcela do financiamento
  COMPROMETIMENTO_MAX_RENDA: 0.30,

  // RN08 - proporcao maxima de recursos proprios (entrada) sobre o valor do imovel
  ENTRADA_MAX_PROPORCAO: 0.80,

  // RN05 - faixa etaria permitida para simulacao
  IDADE_MINIMA: 18,
  IDADE_MAXIMA: 70,

  // RN04 - limite de agendamentos ativos simultaneos para o mesmo imovel
  LIMITE_AGENDAMENTOS_ATIVOS: 3,

  // RN09 - intervalo minimo (em dias) entre visitas para o mesmo imovel
  INTERVALO_MINIMO_DIAS: 7,

  // Parametros usados no calculo de capacidade de compra (Tabela Price)
  TAXA_JUROS_MENSAL: 0.01, // ~12,68% a.a., valor padrao de mercado usado como referencia
  PRAZO_FINANCIAMENTO_MESES: 360, // 30 anos, prazo maximo usual

  // Estados validos de um Imovel
  STATUS_IMOVEL: {
    DISPONIVEL: 'Disponivel',
    VENDIDO: 'Vendido',
    INATIVO: 'Inativo',
  },

  // Estados validos de um Agendamento (RF08/F08)
  STATUS_AGENDAMENTO: {
    PENDENTE: 'Pendente',
    CONFIRMADO: 'Confirmado',
    REALIZADO: 'Realizado',
    CANCELADO: 'Cancelado',
  },

  PERFIS: {
    CLIENTE: 'CLIENTE',
    CORRETOR: 'CORRETOR',
    ADMINISTRADOR: 'ADMINISTRADOR',
  },
};
