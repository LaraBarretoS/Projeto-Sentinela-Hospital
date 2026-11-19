# Sentinela — Redesign Clinical Intelligence

## O que mudou
- Design tokens centralizados em `frontend/theme.css`, com as paletas oficiais Clinical Premium e Dark Command Center.
- Nova camada `frontend/design-overrides.css`, carregada após os estilos específicos para padronizar superfícies, controles, tabelas, formulários e cartões.
- Ajustes de apresentação para login, atendimento, triagem, médico, farmácia, medicações e painel de TV.
- `frontend/js/theme.js` agora tolera indisponibilidade de localStorage e mantém o botão de tema acessível.
- Corrigidos dois erros de aspas em strings HTML inseridas via JavaScript em `medico.html` e `triagem.html`.
- Normalizado o cabeçalho da página de TV e adicionados metadados de viewport/idioma à página de medicações.

## Preservação
- Nenhum arquivo do backend, banco JSON, endpoint, regra de negócio ou dependência foi intencionalmente alterado.
- IDs, nomes de campos e classes existentes foram preservados.
- O painel de TV mantém layout próprio para leitura a distância.

## Validação executada
- Verificação de sintaxe dos scripts JavaScript externos e dos blocos inline das páginas HTML.
- Inspeção de integridade do ZIP.
- Não foi executado teste end-to-end com servidor/backend nem validação visual em navegador real. Recomenda-se testar em homologação antes de publicar.
