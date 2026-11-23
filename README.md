<p align="center"><img src="frontend/assets/sentinela-icon.svg" alt="Símbolo do Sentinela" width="112" /></p>
<h1 align="center">Hospital Sentinela</h1>
<p align="center">Sistema acadêmico de gestão hospitalar · Interface clara, minimalista e responsiva</p>

## Visão geral

O **Hospital Sentinela** é um projeto demonstrativo de desenvolvimento web que integra a recepção, a triagem, o atendimento médico, o almoxarifado e a administração. A interface utiliza tons de vermelho e branco, sem alternância de tema, e um painel independente de chamadas para guichês e consultórios.

## Áreas do sistema

| Área | Funcionalidades |
| --- | --- |
| **Administração** | Usuários e permissões, indicadores, frequência, auditoria e notificações. |
| **Atendimento** | Cadastro de pacientes, anexos e encaminhamento à triagem. |
| **Triagem** | Fila, sinais vitais, registros e classificação profissional. |
| **Médico** | Atendimento, prontuário, sintomas, prescrições e documentos em PDF. |
| **Almoxarifado** | Estoque de medicamentos, entradas, saídas, alertas e histórico. |
| **Medicações** | Consulta de registros de medicação. |
| **TV** | Chamada atual e histórico resumido com número do guichê ou consultório, sem mostrar a classificação de risco. |

## Tecnologias

Frontend em HTML, CSS e JavaScript. Backend em Node.js com Express e PDFKit. Dados operacionais são armazenados localmente em JSON durante a execução.

## Executar localmente

Requer Node.js 20 ou superior e npm. Na raiz do projeto:

```bash
npm install
npm start
```

Acesse `http://localhost:3000`. Em hospedagens Node.js, configure `npm start` como comando de inicialização. O endpoint `/health` pode ser usado para verificar o serviço.

### Organização

```text
api/                Entrada de compatibilidade para hospedagens
backend/            Servidor e rotas
frontend/assets/    Ícone SVG
frontend/css/       Estilos por módulo e TV
frontend/js/        Sessão, navegação e administração
frontend/site.css   Estilos compartilhados
frontend/theme.css  Paleta única e bases de interface
frontend/*.html     Páginas do projeto
```

Para preservar os fluxos existentes, os identificadores internos de acesso, o arquivo `farmacia.html` e os endpoints `/farmacia/*` continuam com seus nomes originais; **na interface a área é chamada Almoxarifado**.

## Uso responsável

Este é um sistema acadêmico, não homologado para utilização clínica real. Não armazene informações reais de pacientes. A autenticação demonstrativa, a privacidade de dados e a persistência local precisam ser reforçadas antes de qualquer implantação real. Em ambientes sem armazenamento persistente, registros podem ser perdidos em novas implantações. A classificação clínica exige revisão de profissional habilitado.

Contas geradas e administradas pelo sistema podem ser persistidas no arquivo privado `backend/users.json`, não incluído no repositório. Caso exista uma implantação anterior, mudanças nos usuários iniciais do código **não** apagam automaticamente contas que já tenham sido salvas: essas devem ser removidas pela Administração.
