# Sentinela — atualização visual v4

Base: Sentinela-Redesign-Referencia-Atendimento-v3.zip.

- Administração: navegação por abas, hero do hospital, indicadores, frequência e auditoria com estilo da referência; sem mudar os cálculos dos indicadores.
- Triagem: duas áreas de avaliação, fila, alertas e classificação, com contador apenas quando identificável a partir dos itens exibidos.
- Médico: fila, ficha, sintomas, diagnóstico, prescrição e ações organizados conforme referência.
- Farmácia: indicadores, estoque, movimentações e histórico conforme referência.
- Atendimento/Medicações: ilustração de hospital atualizada.
- TV: não alterada.
- Imagem original enviada pelo usuário em frontend/assets/hospital-ilustracao.png.
- Ajuste de posicionamento do sino administrativo: frontend/js/layout.js.
- CSS adicional: frontend/design-final-v4.css. Script UI: frontend/js/design-final-v4.js.

Não houve alteração em backend/server.js, api/index.js, regras de negócio ou IDs de formulários.
Verificar manualmente em ambiente com backend ativo, principalmente envio das fichas, autenticação, estoque, impressão e alternância de tema.
