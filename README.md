<p align="center">
  <img src="frontend/assets/sentinela-icon.png" alt="Símbolo do Hospital Sentinela" width="156" />
</p>

<h1 align="center">Hospital Sentinela</h1>
<p align="center"><strong>Sistema demonstrativo de gestão hospitalar</strong><br/>Atendimento integrado • Interface Clinical Premium • Node.js</p>

---

## Sobre o projeto

O **Hospital Sentinela** é um projeto acadêmico de desenvolvimento web que demonstra a comunicação entre setores de uma unidade hospitalar. A interface foi criada para oferecer navegação simples, acompanhamento de filas e visão operacional em um único sistema.

O sistema utiliza **HTML, CSS e JavaScript** no frontend, **Node.js com Express** no backend e armazenamento local em arquivos JSON. Inclui temas claro e escuro e um painel independente para exibição pública das chamadas.

## Módulos

| Módulo | Principais recursos |
| --- | --- |
| **Administração** | Visão geral, usuários, frequência, notificações e auditoria. |
| **Atendimento** | Cadastro de pacientes, anexos e encaminhamento para triagem. |
| **Triagem** | Fila, sinais vitais, observações e registro de classificação pelo profissional. |
| **Médico** | Consultas, sintomas, histórico, prescrições e geração de documentos. |
| **Farmácia** | Estoque, alertas, entradas, saídas e histórico de movimentações. |
| **Medicações** | Consulta das informações de medicamentos disponíveis. |
| **TV hospitalar** | Chamadas para guichês ou consultórios e histórico resumido, sem classificação de risco. |

## Tecnologias

- **Frontend:** HTML5, CSS3 e JavaScript.
- **Backend:** Node.js, Express e API HTTP.
- **Documentos:** PDFKit.
- **Persistência:** arquivos JSON locais gerados durante a execução.

## Como executar

**Pré-requisitos:** Node.js 20 ou superior e npm.

Na pasta principal do projeto, execute:

```bash
npm install
npm start
```

Depois, abra **http://localhost:3000** no navegador. O arquivo de dependências travadas (`package-lock.json`) será gerado pelo npm durante a instalação.

Para usar um serviço de hospedagem Node.js como o Render, execute o mesmo comando de inicialização (`npm start`) e configure a raiz do projeto como diretório de trabalho. A aplicação utiliza a variável de ambiente `PORT` quando fornecida. O endpoint `/health` permite verificar se o serviço está ativo.

## Organização do código

```text
Projeto-Sentinela-Hospital-main/
├── api/                 # Entrada de compatibilidade para hospedagens
├── backend/             # Servidor, rotas e persistência
├── frontend/
│   ├── assets/          # Identidade visual e ilustrações
│   ├── css/             # Estilos específicos de cada página
│   ├── js/              # Scripts de interface, sessão e módulos
│   ├── site.css         # Layout e componentes compartilhados
│   ├── theme.css        # Variáveis e regras dos temas
│   └── *.html           # Páginas dos setores e painel de TV
├── package.json
└── README.md
```

## Avisos sobre segurança e uso

Este é um **projeto acadêmico/demonstrativo**, não um sistema homologado para assistência clínica real. A classificação de risco não implementa um protocolo clínico validado e deve ser sempre analisada por profissional habilitado.

A autenticação, as permissões e a proteção dos dados ainda exigem melhorias antes de um uso real. **Não cadastre dados verdadeiros de pacientes**, nem publique arquivos de dados gerados pelo sistema. O armazenamento local em JSON também não oferece a mesma durabilidade de um banco de dados de produção; em hospedagens sem disco persistente, os registros podem ser perdidos após reinicializações ou novas implantações.

---

<p align="center"><sub>Hospital Sentinela • Desenvolvimento web e design de interfaces</sub></p>
