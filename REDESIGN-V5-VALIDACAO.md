# Sentinela v5 — Correção de layout, tema escuro e TV

- Corrigida a largura do aplicativo no Atendimento: CSS legado centralizava todo o shell e adicionava margem ao body.
- Rail/sidebar agora ocupam a borda esquerda e workspace distribui a largura restante.
- Formato do seletor de arquivo compatível com os dois temas.
- Elementos da paleta escura têm contraste contextual (cabeçalhos, indicadores, alertas, tabelas, ações).
- Ilustração hospitalar preservada e uma versão tonal noturna é usada no dark mode.
- TV redesenhada com espaços para guichê, paciente, histórico e marca; IDs `local-tipo`, `local-numero`, `patient-name`, `history-list` e endpoints `/tv/chamada`, `/tv/conteudo` preservados.
- Histórico da TV usa nomes/local reais retornados pelo backend, não valores fictícios.
- Testar no ambiente hospedado após publicação: autenticação, registro de ponto, fila, chamada, histórico e telas menores.
