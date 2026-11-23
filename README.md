# Hospital Sentinela

Sistema **demonstrativo/escolar** de apoio ao fluxo hospitalar. Interface com painéis de administração, atendimento, triagem, consultório, almoxarifado e TV de chamadas. Layout responsivo em azul-escuro, azul vibrante e superfícies claras, com alternância de tema.

## Instalação

1. Instale o Node.js LTS (Node 20+).
2. Extraia o ZIP.
3. Na pasta principal, execute `npm install` e depois `npm start`.
4. Acesse `http://localhost:3000`.

O lockfile original estava incompleto (não incluía a dependência de PDF); ele foi retirado para que `npm install` resolva todas as dependências corretamente. Um novo `package-lock.json` será gerado na primeira instalação.

No Render, use **Build Command** `npm install` e **Start Command** `npm start`. O servidor lê a porta definida em `PORT`.

## Áreas e recursos

- **Administração** — resumo, frequência, auditoria, criação/exclusão de contas, troca de senha e solicitações de redefinição.
- **Atendimento** — cadastro de pacientes, inclusive fluxo emergencial sem cadastro.
- **Triagem** — fila de pacientes, classificação, registro de sintomas e chamada na TV.
- **Médico** — atendimento por prioridade, histórico, prescrições, geração de PDF e conclusão.
- **Almoxarifado** — consulta de estoque, indicadores, registro de novos itens, entradas/saídas, histórico e consulta de prescrições; admite ajustes por API.
- **TV** — exibição da chamada atual e histórico.
- **Acesso e ponto** — login, sessão autenticada via cookie HttpOnly, controles de acesso por área, registro explícito da saída e alteração de senha.

Os perfis de demonstração são declarados no início de `backend/server.js`. Troque as credenciais padrão antes de expor qualquer instância. O setor anteriormente chamado Farmácia agora usa o perfil e a página **Almoxarifado**; perfis salvos anteriormente são migrados na inicialização.

## Estrutura

- `backend/server.js` — servidor HTTP, rotas, dados e autenticação de demonstração.
- `frontend/*.html` — páginas.
- `frontend/design.css` — identidade visual compartilhada.
- `frontend/css/` — estilos específicos das áreas.
- `frontend/js/` — formulários, sessão, design e operações.

## Limitações importantes

**Não é apropriado para dados reais ou uso clínico.** Pacientes, consultas, triagens, estoque e ponto ficam em **memória** e são perdidos ao reiniciar ou quando a hospedagem recicla a instância. Usuários e pedidos de redefinição podem ser gravados em arquivos JSON locais, mas isso não garante persistência em plataformas com armazenamento efêmero. As sessões também expiram ao reiniciar.

A autenticação com cookie HttpOnly e algumas regras por perfil reduzem acessos acidentais, porém o projeto **não** oferece os controles de segurança, privacidade, auditoria clínica, backup e persistência exigidos para produção. Os usuários padrão são apenas de testes. Antes de uso real, implemente banco de dados, proteção contra CSRF, senhas com hash, políticas de permissão completas, testes especializados e revisão técnica e legal.

## Notas da revisão

- Corrigido o redirecionamento do setor e removido o endpoint/API duplicado que não correspondia ao servidor principal.
- Atualização automática do estoque não perde a seleção atual; campos de histórico são escapados contra HTML injetado.
- Quantidades do estoque exigem inteiros válidos; erros aparecem na tela.
- Triagens e consultas não podem ser concluídas repetidamente com o mesmo ID de triagem, e campos obrigatórios são validados no backend.
- O ponto deixa de depender de uma requisição assíncrona disparada ao fechar a aba; o usuário dispõe de ação explícita para saída.
- Ações administrativas passam a validar a sessão real em vez de confiar no nome enviado em um cabeçalho.

Para checar a sintaxe do backend e scripts principais, execute `npm test`.
