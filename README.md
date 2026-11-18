# Sentinela Hospitalar 2.0 — versão modernizada

Sistema acadêmico/demonstrativo de gestão hospitalar, desenvolvido com Node.js, Express, HTML, CSS e JavaScript. Esta entrega preserva a arquitetura e os módulos existentes: Administração, Atendimento, Triagem, Médico, Farmácia, Medicações e painel de TV.

## Executar localmente

**Requisitos:** Node.js 20 ou superior e npm.

No terminal, entre na pasta raiz (a mesma que contém `package.json`) e execute:

```bash
npm install
npm start
```

Abra `http://localhost:3000`. Para verificar se o servidor iniciou, acesse `http://localhost:3000/health`.

No Windows PowerShell, por exemplo:

```powershell
cd caminho\para\Projeto-Sentinela-Hospital-main
npm install
npm start
```

O arquivo `package-lock.json` foi removido porque o lock recebido não incluía a dependência `pdfkit` declarada em `package.json`. O comando `npm install` gera um lockfile coerente no ambiente de execução.

## Contas demonstrativas

Na primeira inicialização, o backend disponibiliza as contas demonstrativas abaixo (senha inicial `123`):

| Login | Setor |
|---|---|
| `admin` | Administração |
| `atendimento` | Atendimento |
| `triagem` | Triagem |
| `medico` | Médico |
| `medico2` | Médico |
| `farmacia` | Farmácia |
| `enfermeira2` | Triagem |

Essas credenciais são exclusivamente para demonstração local. Altere-as antes de compartilhar a aplicação e não as utilize em produção.

## O que foi atualizado nesta entrega

- Redesign do tema global com paleta hospitalar azul, superfícies neutras, tipografia, espaçamentos, bordas, foco acessível e responsividade.
- Refinamento visual específico para Administração, Atendimento, Farmácia, Login, Medicações, Médico, Triagem e TV.
- Tema claro/escuro mantido e padronizado por tokens CSS compartilhados, com persistência local da preferência.
- Estilos de apresentação declarados diretamente nos HTML foram removidos; o CSS do Admin foi transferido para `frontend/css/admin.css` e o da Farmácia para `frontend/css/farmacia.css`. Os estilos por página permanecem na pasta `frontend/css/`.
- A página da TV passou a carregar sua folha de estilos própria.
- O endpoint de consulta agora valida paciente, diagnóstico e a estrutura dos sintomas; limita quantidade e tamanho dos campos e valida intensidade de 0 a 10. Sintomas antigos em formato texto continuam aceitos.
- Consultas concluídas passam a registrar evento na auditoria e respondem com HTTP 201.
- Preservados os fluxos existentes de usuários, notificações administrativas, ponto, triagem, fila médica, estoque e emissão de PDF.

## Estrutura principal

```text
backend/server.js          Servidor Express e endpoints
backend/db.json             Dados-base do projeto
frontend/*.html             Páginas dos módulos
frontend/css/*.css          Estilos separados por página
frontend/theme.css          Design system e temas globais
frontend/js/theme.js        Alternância e persistência do tema
frontend/js/session.js      Controle de sessão no navegador e controles do usuário
frontend/js/admin.js        Interações da administração
api/index.js                Adaptador para iniciar o mesmo backend
```

## Testes executados nesta entrega

- `node --check` no servidor, adaptador da API e scripts JavaScript externos.
- Verificação sintática dos 8 blocos JavaScript embutidos nas páginas HTML.
- Verificação de que não restaram atributos `style="..."` nem blocos `<style>` nos HTML.

**Teste de execução HTTP não concluído:** a instalação das dependências (`npm install`) excedeu o tempo disponível neste ambiente e o cache offline não continha `pdfkit`. Portanto, o servidor não foi iniciado aqui e o fluxo completo de ponta a ponta ainda precisa ser validado após instalar as dependências localmente.

## Segurança, privacidade e uso clínico — limitações obrigatórias

Esta aplicação continua sendo um projeto acadêmico/demonstrativo e **não está pronta para uso hospitalar real nem para armazenar dados reais de pacientes**. O controle de página no navegador não equivale a autorização segura no servidor. A identificação administrativa por cabeçalho pode ser falsificada, várias rotas operacionais ainda não aplicam autorização por perfil e as senhas existentes são armazenadas em texto simples. Antes de qualquer uso real, é indispensável implementar sessões ou tokens assinados, hash de senhas (Argon2id/bcrypt), autorização em todas as rotas, proteção contra força bruta, HTTPS, política CORS/CSRF adequada, gestão segura de segredos, criptografia, backups, trilha de auditoria protegida e revisão de conformidade com a LGPD.

A triagem oferece registro e apoio visual à avaliação, não implementa o Protocolo de Manchester e não classifica pacientes automaticamente por protocolo validado. A decisão clínica deve ser feita por profissional habilitado segundo protocolo institucional aprovado. Os dados de estoque e validade também precisam de conferência operacional.

## Persistência

O backend grava dados operacionais em `backend/sentinela-data.json`, usuários administrados em `backend/users.json` e solicitações de redefinição em `backend/password_requests.json`. Esses arquivos são criados durante a execução e devem ser incluídos em uma rotina de backup local. Em hospedagens com disco efêmero, os dados podem ser perdidos após reinicializações/deploys; use banco de dados gerenciado e armazenamento persistente antes de qualquer implantação real.
