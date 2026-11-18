# Sentinela Hospitalar — versão aprimorada

Sistema demonstrativo de gestão hospitalar com módulos de Administração, Atendimento, Triagem, Médico, Farmácia e painel de TV. Mantém a arquitetura original em Node.js/Express e páginas HTML/CSS/JavaScript.

## Requisitos e execução

- Node.js 18 ou superior (recomendado LTS)
- npm

No PowerShell, dentro da pasta raiz do projeto:

```powershell
npm install
npm start
```

Acesse `http://localhost:3000`. Para encerrar, pressione `Ctrl + C` no terminal.

## Contas demonstrativas

Na instalação inicial, o servidor disponibiliza contas demonstrativas: `admin / 123`, `atendimento / 123`, `triagem / 123`, `medico / 123`, `medico2 / 123` e `farmacia / 123`. Troque as senhas antes de qualquer demonstração compartilhada. Não use essas credenciais em produção.

## Melhorias nesta versão

- Persistência local do estado operacional em `backend/sentinela-data.json`, com gravação atômica após requisições de alteração. O arquivo é criado automaticamente no primeiro uso e não é incluído no pacote para não sobrescrever dados locais.
- Triagem ampliada para registrar pressão arterial, frequência cardíaca e respiratória, SpO₂, nível de consciência, intensidade da dor e sinais de alerta.
- Registro da justificativa, dados ausentes, sinais de alerta e identificação do profissional que confirmou a classificação.
- Campo de classificação revisável pelo profissional. A sugestão é conservadora e não representa implementação do Protocolo de Manchester.
- Atendimento médico com lista de múltiplos sintomas, incluindo intensidade, duração, frequência e observações, preservando a leitura de registros antigos com um único sintoma.
- Exibição dos sinais vitais e alertas registrados na triagem na fila médica.
- Ajustes globais de acessibilidade, foco, responsividade e consistência do tema claro/escuro.

## Persistência e compatibilidade

Os dados operacionais são gravados em `backend/sentinela-data.json`. Usuários criados pelo administrador e solicitações de redefinição continuam em `backend/users.json` e `backend/password_requests.json`. Esses arquivos são gerados localmente quando necessário. Faça cópias de segurança periódicas desses arquivos.

O arquivo `backend/db.json` é mantido para compatibilidade com a estrutura original; o servidor executado pelo script `npm start` usa `backend/server.js`.

## Limitações importantes de segurança e uso clínico

Este projeto permanece demonstrativo/escolar e **não está pronto para uso hospitalar real**. O controle de sessão atual depende de dados do navegador e algumas rotas da API não têm autenticação/autorização robusta no servidor; a checagem administrativa por cabeçalho pode ser falsificada por um cliente. Senhas são armazenadas em texto simples. Antes de produção, é obrigatório implementar autenticação segura com sessões/token assinado, hash de senha (Argon2id/bcrypt), autorização por função em todas as rotas, HTTPS, proteção CSRF/CORS adequada, auditoria protegida, backups, criptografia e revisão de conformidade com a LGPD.

A classificação de risco não é Manchester, não foi validada clinicamente e não deve determinar condutas. Os alertas servem apenas para chamar atenção do profissional. A classificação e o encaminhamento devem ser definidos e revisados por profissional habilitado, conforme protocolo institucional validado.

## Testes

Verificação sintática realizada com `node --check backend/server.js` e compilação dos scripts JavaScript embutidos nas páginas. O teste de execução HTTP depende da instalação das dependências (`npm install`); não foi possível concluir a instalação automática das dependências neste ambiente. Após instalar, valide login, fluxo de triagem, múltiplos sintomas, estoque, usuários e notificações antes de qualquer apresentação.


## Deploy no Render (configuração corrigida)

Para um Web Service conectado à raiz deste repositório:

- **Root Directory:** deixe em branco.
- **Build Command:** `npm install`.
- **Start Command:** `npm start` (equivalente a `node backend/server.js`).
- O servidor utiliza a porta fornecida por `process.env.PORT` pelo Render.
- Após o deploy, acesse `/health`; a resposta esperada é `{"status":"ok","service":"sentinela-hospitalar"}`.

O arquivo `api/index.js` agora é apenas um adaptador de compatibilidade que importa o mesmo aplicativo de `backend/server.js`. Assim, comandos antigos que iniciem `api/index.js` não carregam mais a implementação antiga. O único backend ativo fica em `backend/server.js`.

O `package-lock.json` anterior estava inconsistente com `package.json` (não registrava a dependência `pdfkit` e tinha versão divergente). Ele foi removido para que `npm install` gere um lockfile coerente durante a instalação.


## Observações de segurança e implantação

- Esta aplicação permanece um projeto acadêmico/demonstrativo; não deve ser utilizada para decisões clínicas reais nem armazenar dados reais de pacientes sem uma revisão de segurança, privacidade e conformidade.
- O armazenamento atual em arquivos JSON no diretório `backend/` não é um banco de dados gerenciado. Em hospedagens efêmeras, como o Render sem Persistent Disk, os dados podem ser perdidos em reinicializações/deploys. Para persistência real, configure um banco de dados gerenciado e migração apropriada.
- O módulo de triagem registra sinais e alertas para revisão humana. Não implementa o Protocolo de Manchester e não fornece classificação clínica automatizada validada.
- A validade cadastrada na farmácia é informativa por medicamento/lote e requer conferência física. O modelo atual de estoque não é um controle completo por lote.
- Antes de produção, implemente autenticação por sessão/token assinado, hash de senhas, autorização de cada rota no servidor, proteção contra força bruta, HTTPS, backups e trilha de auditoria imutável.
