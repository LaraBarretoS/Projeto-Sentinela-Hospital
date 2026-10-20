# Hospital Sentinela — versão corrigida

Sistema demonstrativo de gestão hospitalar com painéis de atendimento, triagem, médico, farmácia, administração e TV.

## Como executar no Windows

1. Instale o **Node.js LTS** (inclui o npm): https://nodejs.org/
2. Extraia este ZIP para uma pasta.
3. Abra o Prompt de Comando ou PowerShell dentro da pasta `Projeto-Sentinela-Hospital-main`.
4. Execute:

   ```bash
   npm install
   npm start
   ```

5. Abra `http://localhost:3000` no navegador.
6. Para encerrar o servidor, volte ao terminal e pressione `Ctrl + C`.

## Contas de demonstração

As contas definidas pelo servidor incluem `admin / 123`, `atendimento / 123`, `triagem / 123`, `medico / 123`, `medico2 / 123` e `farmacia / 123`.

## Gerenciamento de usuários pelo administrador

- Entre com `admin / 123` e abra a aba **Adicionar user** no painel administrativo.
- Informe nome (opcional), login, senha e área de acesso: Médico, Triagem, Atendimento ou Farmácia.
- Os usuários criados ficam salvos em `backend/users.json` e continuam disponíveis após reiniciar o servidor.
- A aba **Usuários** mostra os logins e a área atribuída. Logins duplicados são recusados.
- O controle de sessão do navegador redireciona cada perfil para sua página autorizada.

> **Segurança:** este projeto é demonstrativo. O controle de página é aplicado no navegador e não substitui autenticação/autorização robusta em todas as rotas da API. Senhas também estão em texto simples, então não utilize credenciais reais em produção.

## Correções no painel médico

- Tratamento de falhas HTTP e respostas inválidas ao carregar a fila, o histórico e o estoque.
- Proteção contra conteúdo digitado por usuários ao renderizar nomes, alergias e histórico.
- Ordenação da fila por prioridade de risco e indicação visual do paciente selecionado.
- Botões de chamada e finalização bloqueados durante a operação para reduzir cliques duplicados.
- Alertas de alergia mais consistentes e histórico com datas inválidas tratadas.
- Exibição apenas de medicamentos com estoque disponível.
- Validação de paciente, diagnóstico e medicação antes de finalizar a consulta.
- Geração do PDF com tratamento de erro e download direto, evitando bloqueios de pop-up.
- Limpeza dos campos após finalizar e atualização da fila e do estoque.

> **Importante:** este projeto é demonstrativo/escolar. Não deve ser usado para decisões clínicas ou dados reais de pacientes sem revisão profissional, segurança, autenticação e persistência adequadas. A versão atual do servidor mantém dados em memória e pode perdê-los quando for reiniciada.

## Senhas, notificações e tema

- Na aba **Usuários**, o administrador pode excluir contas de equipe e alterar a senha de uma conta informando a senha antiga.
- Se a senha antiga foi esquecida, use **Esqueci a senha antiga**. O pedido fica pendente até o administrador abrir **Notificações** e aprovar ou recusar; ao aprovar, o administrador define a nova senha.
- Nas telas de trabalho, o botão **Minha senha** permite alterar a própria senha com a senha atual ou solicitar redefinição ao administrador.
- O sino no canto superior direito mostra a quantidade de solicitações pendentes e atualiza automaticamente.
- O botão 🌙/☀️ de modo escuro está disponível em todas as telas HTML e a preferência fica salva no navegador.
- A exclusão de contas administrativas é bloqueada nesta interface para evitar remover a conta principal.
