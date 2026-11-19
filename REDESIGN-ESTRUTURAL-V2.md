# Sentinela — Redesign Estrutural v2

## O que foi alterado

- Criado layout compartilhado com trilho de ícones, menu lateral recolhível, cabeçalho de setor, usuário, ponto, senha e botão de tema em uma mesma região visual.
- Administração: indicadores destacados; frequência na área principal; auditoria e atalho para o painel de chamadas em coluna secundária; cabeçalhos específicos para as abas de usuários, criação de acesso e notificações.
- Atendimento: cadastro dividido em identificação do paciente e encaminhamento, com campos e ações originais preservados.
- Triagem e Médico: área de fila e área de ficha com proporções revisadas, mantendo botões de emergência, campos e scripts existentes.
- Farmácia: indicadores no topo, estoque principal, movimentação em painel auxiliar e histórico abaixo.
- Medicações: estrutura compatível com o novo cabeçalho compartilhado.
- TV: continua independente, sem trilho lateral ou cabeçalho administrativo.
- Mantidos os tokens de cor e temas Clinical Intelligence. Adicionado CSS separado `frontend/structural-layout.css`.

## Arquivos alterados

`frontend/admin.html`, `frontend/atendimento.html`, `frontend/triagem.html`, `frontend/medico.html`, `frontend/farmacia.html`, `frontend/medicacoes.html`.

## Arquivos adicionados

`frontend/structural-layout.css`, `frontend/js/layout.js`, este relatório.

## Preservação

Nenhum endpoint, arquivo de backend, lógica de autenticação, persistência, JS de negócio ou ID HTML existente foi removido. A navegação lateral mostra atalhos do setor logado, em vez de tentar contornar as permissões existentes em `session.js`.

## Verificações realizadas

- ZIP de origem extraído com sucesso.
- Validação sintática com `node --check` em scripts JavaScript externos e inline: sem erros.
- Comparação de IDs HTML antes/depois: nenhum ID removido ou duplicado.
- Estrutura HTML processada e inspecionada por parser.
- ZIP de entrega criado e validado por CRC.

## Limitações de teste

Não foi executado teste visual automatizado nem teste de ponta a ponta no navegador. O ambiente não possui as dependências Node (`express`, `cors`, `pdfkit`) instaladas, nem navegador de automação disponível; por isso os fluxos com backend (login, cadastro, triagem, medicações, ponto, relatórios e movimentações) ainda exigem validação manual com o servidor em execução. Esta versão não deve ser tratada como validada para uso clínico real.

## Como executar

1. Extraia o ZIP.
2. Abra a pasta `Projeto-Sentinela-Hospital-main` no terminal.
3. Execute `npm install`.
4. Execute `npm start`.
5. Abra `http://localhost:3000` (ou a porta definida por `PORT`).
6. Confira cada perfil e os dois temas em desktop e celular.

## Próximos passos recomendados

Validar visualmente com capturas de tela e executar testes de integração antes de publicar. A autenticação atual e os dados hospitalares precisam de uma revisão de segurança específica antes de qualquer uso com informações reais de pacientes.
