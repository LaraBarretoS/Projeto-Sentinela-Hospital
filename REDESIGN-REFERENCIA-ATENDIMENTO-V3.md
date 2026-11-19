# Sentinela — Redesign baseado na referência do Atendimento (v3)

Esta versão parte de `Sentinela-Redesign-Estrutural-v2.zip` e aplica a composição visual enviada para Atendimento aos módulos Atendimento, Triagem, Médico, Farmácia e Medicações, com conteúdo próprio para cada um. Administração e TV foram preservados sem alterações.

## Alterações
- Cabeçalho de setor, trilha de navegação, título e subtítulo, ilustração vetorial decorativa e identidade visual uniforme nos módulos alterados.
- Atendimento: formulário em cartão único, rótulos acima dos campos, linhas de dois campos e ações principais alinhadas.
- Triagem: fila e ficha em cartões separados, preservando campos de avaliação, alertas e decisão profissional.
- Médico: consultório e acesso à TV organizados como ações contextuais, fila e prontuário em cartões.
- Farmácia: indicadores no topo, estoque e movimentação organizados, histórico em seção separada.
- Medicações: cabeçalho consistente e conteúdo agrupado em cartão.
- Todos os IDs dos elementos existentes foram mantidos e funções JavaScript inline preservadas.

## Arquivos alterados
`frontend/atendimento.html`, `frontend/triagem.html`, `frontend/medico.html`, `frontend/farmacia.html`, `frontend/medicacoes.html`.

## Arquivos novos
`frontend/reference-layout.css`, `frontend/js/reference-ui.js`.

## Verificações realizadas
- HTML inspecionado com parser (BeautifulSoup), todos os IDs anteriores conferidos e preservados.
- Sintaxe de scripts inline conferida com `node --check`.
- `node --check` aplicado a `reference-ui.js`.
- `frontend/admin.html` e `frontend/tv.html` comparados byte a byte com a versão v2: idênticos.
- Integridade do ZIP verificada após a geração.

## Limitações
O ambiente bloqueou a execução local do navegador via endereço `127.0.0.1` (ERR_BLOCKED_BY_ADMINISTRATOR). Portanto, não foi possível executar uma inspeção visual real ou testes ponta a ponta com o backend. Esta versão é uma implementação de interface com validação estática, pendente de testes funcionais e visuais em ambiente local.

## Como executar localmente
1. Extrair o ZIP.
2. Abrir terminal na pasta `Projeto-Sentinela-Hospital-main`.
3. Executar `npm install` e `npm start` (Node.js >=20).
4. Acessar o endereço indicado pelo servidor no terminal e testar com os usuários de cada setor.

A ilustração vetorial é decorativa. Não representa informação clínica.
