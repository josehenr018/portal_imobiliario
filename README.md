# LUNAR INTEL — Sistema Imobiliário Inteligente

Projeto Semestral de Sistema Web Orientado a Objetos (BRIPROO_2026-2).
Alunos: Bruno Hideki Uemura e José Henrique de Lima.

Plataforma que integra simulação de financiamento imobiliário (RN01), catálogo de
imóveis filtrado pela capacidade de compra do cliente, agendamento de visitas e
painéis de gestão para corretores e administradores.

## Stack

Node.js + Express no back-end, HTML/CSS/JavaScript puro no front-end, persistência
em arquivos JSON (`data/*.json`). Escolhida para manter o código simples de explicar
na apresentação: uma única linguagem, sem banco de dados externo para configurar.

## Como rodar

```bash
npm install     # instala as dependências (express, bcryptjs, cookie-session)
npm run seed    # cria data/*.json com usuários e imóveis de demonstração
npm start       # inicia o servidor em http://localhost:3000
```

Abra `http://localhost:3000` no navegador.

### Contas de demonstração (senha para todas: `123456`)

| Perfil        | E-mail                     |
|---------------|-----------------------------|
| Administrador | admin@lunarintel.com        |
| Corretor      | bruno@lunarintel.com        |
| Corretor      | jose@lunarintel.com         |
| Cliente       | cliente@lunarintel.com      |
| Cliente       | marina@lunarintel.com       |

`npm run seed` pode ser executado novamente a qualquer momento para resetar os dados.

## Estrutura do projeto

```
projeto_imobiliario/
├── server.js                  Ponto de entrada: middlewares, sessão, rotas, estáticos
├── seed.js                    Carga inicial de dados de demonstração
├── src/
│   ├── config/constants.js    Parâmetros financeiros e regras (RN01-RN12) centralizados
│   ├── errors/AppError.js     Hierarquia de exceções da aplicação
│   ├── models/                Classes de domínio (ver diagrama da Atividade 4)
│   ├── repositories/          Persistência em JSON (um repositório por entidade)
│   ├── services/               Regras de negócio e orquestração entre repositórios
│   ├── middlewares/            Autenticação de sessão, RBAC e tratamento de erros
│   └── routes/                  Endpoints REST, um módulo por área funcional
├── data/                        Arquivos .json (estado persistido)
└── public/                      Front-end (uma página por perfil + API wrapper)
```

## Classes de domínio × diagrama da Atividade 4

| Classe (src/models) | Papel |
|---|---|
| `Usuario.js` | Superclasse abstrata — não pode ser instanciada diretamente |
| `Cliente.js`, `Corretor.js`, `Administrador.js` | Subclasses de `Usuario` (herança) |
| `Imovel.js` | Entidade principal; possui um `Endereco` (composição) |
| `Endereco.js` | Classe de composição (1:1 com `Imovel`) |
| `Simulacao.js` | Registra simulação financeira e calcula imóveis compatíveis |
| `Agendamento.js` | Ciclo de vida da visita (máquina de estados: Pendente → Confirmado → Realizado/Cancelado) |
| `Favorito.js` | Entidade associativa Cliente × Imóvel |
| `Notificacao.js` | Evento destinado a um `Usuario` |

Conceitos de POO aplicados: **herança** (Usuario → Cliente/Corretor/Administrador),
**abstração** (Usuario abstrata), **composição** (Imovel → Endereco), **associação**
(Agendamento, Simulacao, Favorito, Notificacao referenciando outras entidades por id),
**encapsulamento** (regras e cálculos vivem dentro da própria classe — ex.:
`Cliente.calcularCapacidadeCompra()`, `Agendamento.confirmar()`), **polimorfismo**
(cada subclasse de `Usuario` implementa seus próprios atributos/métodos específicos
mantendo a mesma interface herdada — `atualizarDados()`, `inativarConta()`).

## Regras de negócio (RN01–RN12) × implementação

| Regra | Onde está implementada |
|---|---|
| RN01 — 30% da renda | `Cliente.obterParcelaMaxima()`, `Cliente.calcularCapacidadeCompra()` |
| RN02 — venda só sem visitas em aberto | `ImovelService.marcarComoVendido()` |
| RN03 — visita só em imóvel disponível | `AgendamentoService.solicitar()` |
| RN04 — máx. 3 agendamentos ativos | `AgendamentoService.solicitar()` |
| RN05 — idade 18–70 | `Cliente.validarIdade()` |
| RN06 — isolamento do corretor | `ImovelService._verificarTitularidade()` |
| RN07 — admin não intermedia visitas | Rotas de agendamento não aceitam perfil `ADMINISTRADOR` |
| RN08 — entrada ≤ 80% do imóvel | `Simulacao.getImoveisCompativeis()` |
| RN09 — intervalo mínimo de 7 dias | `AgendamentoService.solicitar()` |
| RN10 — notificação em mudanças de status | `NotificacaoService.notificar()`, chamado pelo `AgendamentoService` |
| RN11 — validação de CRECI | `Corretor.validarCRECI()` |
| RN12 — imóvel inativo some das buscas | `ImovelService.listarDisponiveis()`, `Imovel.inativar()` |

## Persistência e tratamento de exceções

- Persistência via `JsonRepository` (classe genérica em `src/repositories/JsonRepository.js`),
  especializada por entidade. Cada escrita é feita por reescrita atômica do arquivo JSON.
- Exceções tipadas em `src/errors/AppError.js`: `ValidationError` (400), `AuthError` (401),
  `ForbiddenError` (403), `NotFoundError` (404), `BusinessRuleError` (422) e
  `PersistenceError` (500 — falha de leitura/gravação). O middleware
  `src/middlewares/errorHandler.js` converte qualquer uma delas em uma resposta JSON
  amigável, nunca expondo stack trace ao usuário final.

## Observações e simplificações assumidas

- Taxa de juros (1% a.m.) e prazo (360 meses) usados no cálculo de financiamento
  (Tabela Price) são constantes fixas em `src/config/constants.js`, representativas
  de uma simulação de mercado — podem ser ajustadas facilmente em um único lugar.
- RF03 (recuperação de senha) gera um código e o registra no console do servidor,
  já que o projeto não possui um serviço real de envio de e-mail.
- Contas de Administrador não são auto-cadastráveis publicamente (coerente com RN07);
  são criadas via `seed.js`, simulando a gestão interna da imobiliária.
