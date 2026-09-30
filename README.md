# LUNAR INTEL — protótipo OO evoluído

Base inicial reorganizada a partir do protótipo HTML e alinhada à documentação do projeto.

## Executar
Abra `index.html` em um navegador moderno. Não requer servidor ou dependências.
Os dados de demonstração são persistidos no `localStorage` do navegador.

## Estrutura
- `index.html`: estrutura semântica da aplicação.
- `css/styles.css`: apresentação responsiva.
- `js/domain/`: entidades de domínio e regras invariantes.
- `js/services/`: casos de uso e orquestração.
- `js/repositories/`: persistência JSON/localStorage.
- `js/ui/`: renderização e interação com o DOM.
- `js/app.js`: composição e inicialização.

## Conceitos de POO aplicados
`Usuario` abstrata; `Cliente`, `Corretor` e `Administrador` por herança; `Imovel` compõe `Endereco`; `Agendamento`, `Simulacao`, `Favorito` e `Notificacao` são entidades relacionadas. A camada de serviço coordena operações e repositórios isolam persistência.

## Melhorias aplicadas nesta etapa
- Validação explícita da entrada com limite de 80% do valor do imóvel.
- Centralização de regras de negócio em `LunarService` para evitar lógica espalhada na interface.
- Melhoria na validação de simulação: idade, renda, e filtro de imóveis compatíveis com a entrada informada.
- Regras de agendamento reforçadas: no máximo 3 solicitações ativas por imóvel e intervalo mínimo de 7 dias para recorrência da mesma visita.
- Testes automatizados focados nas regras de domínio mais críticas.

## Escopo demonstrativo e próximos passos
Este é um protótipo acadêmico executável, não um sistema pronto para produção. Login é simulado por seleção de perfil; `localStorage` não substitui banco de dados; não há envio real de e-mail, upload de imagens, integração bancária, validação oficial de CRECI/CPF, backend, autorização segura ou trilha de auditoria inviolável. Para produção, implementar API/backend, banco relacional, hash Argon2id/BCrypt no servidor, sessões seguras, validação no servidor, testes automatizados, logs, proteção de dados e integração de notificações.

## Observação financeira
O cálculo usa a regra documental de 30% da renda, limite etário de 18–70 anos e entrada limitada a 80% do preço do imóvel. O fator de financiamento é explicitamente didático e configurável; não representa aprovação bancária nem proposta de crédito.
