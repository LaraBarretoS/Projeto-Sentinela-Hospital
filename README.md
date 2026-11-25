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

## V8.1

Correções de sobreposição de diálogos, temas, navegação e responsividade. Lista de queixas e achados observados ampliada para registro acadêmico, sem alteração da regra de classificação. O painel TV acompanha as preferências do navegador. O identificador interno `farmacia` permanece para compatibilidade. Protótipo educacional, não validado para uso clínico.

## V8.2 — Estoque por lotes

- Cada entrada cria um lote independente, com data/hora de registro no fuso de Brasília, validade opcional, quantidade inicial e saldo. O botão `+` expande os lotes e mantém a seleção durante as atualizações automáticas.
- A coluna de validade mostra a menor data conhecida entre os lotes com saldo. Os lotes vencidos permanecem visíveis e não são consumidos em saídas. FIFO (primeiro a entrar, primeiro a sair) entre lotes não vencidos, inclusive em saídas divididas entre lotes. Quantidades sem validade registrada são sinalizadas e exigem conferência física. Não se trata de um sistema de dispensação clínica validado.
- O histórico das movimentações registra os lotes utilizados. Os ajustes de estoque existentes continuam funcionando, mantendo a soma dos saldos.
- Na migração da V8.1, o saldo agregado é preservado como lote legado, com data de entrada desconhecida; a validade agregada anterior, se existir, é preservada como informação legada. Não é possível recuperar datas de validade descartadas pelo erro antigo ou identificar quais entradas anteriores ainda estão em estoque com precisão. Faça backup do arquivo local de dados antes de atualizar. No Render, a persistência depende de armazenamento persistente configurado.
- Correções visuais: emblema grande removido do login, navegação e estados normais de estoque acompanham o tema. Cores semânticas de alerta e risco clínico preservadas. Retorno de movimentação mostrado dentro do formulário, sem alerta nativo do navegador.

Testes automatizados de estoque (sem dependências externas): `npm test`.

## V8.3 — Catálogo e apresentações

- O estoque passa a ser organizado por item e apresentação independente, com unidade própria. A seleção da apresentação é obrigatória para movimentações. As novas apresentações começam zeradas, sem fabricar saldos ou datas. O estoque prévio mantém seus IDs e lotes; os IDs originais representam as formas/unidades informadas no catálogo anterior, sem inferência de concentração.
- Na entrada, a validade da embalagem é obrigatória para medicamentos e materiais com exigência de validade. Quando aplicável, é possível informar a data efetiva após abertura/preparo, confirmada pelo responsável conforme a bula, e o sistema utiliza a menor das datas. Não há prazo inventado por apresentação. Datas anteriores ao dia atual são recusadas em novas entradas. O dia de vencimento é exibido separadamente; lotes antigos vencidos permanecem registrados e bloqueados.
- Lotes sem validade obrigatória ficam indisponíveis até conferência: expanda o lote e use o botão de conferência (✓) para registrar a data efetivamente verificada. Essa ação mantém histórico. Não informe datas fictícias para liberar estoque real.
- Materiais sem data obrigatória podem ter data registrada quando presente na embalagem. Os novos itens não têm estoque mínimo definido (0). A lista do médico exclui materiais não medicamentosos. FIFO permanece dentro de cada apresentação.
- Catálogo ilustrativo, não exaustivo, baseado em listas públicas de medicamentos e materiais hospitalares. As concentrações, fabricantes e embalagens comerciais específicas não são validados neste protótipo. Não usar para dispensação real.

Referências: Anvisa, *Saiba como conservar medicamentos em casa* (2019); Ministério da Saúde, RENAME; HU Brasil, *Catálogo de Materiais de Uso Hospitalar*.

Faça backup de `backend/sentinela-data.json` antes de atualizar. Execute `npm test` para verificar as regras de estoque e catálogo.

## V8.4 — Datas manuais

Cada nova entrada registra a data de entrada/abertura e a validade final conferida manualmente. A data de entrada define a ordem FIFO. Não há cálculo automático de prazo.

## V8.5 — Cadastro com código e reinicialização de estoque

- Na primeira inicialização desta versão, todos os saldos e lotes são zerados, preservando o catálogo, usuários, pacientes e histórico de movimentações. O arquivo de dados anterior é copiado para `backend/sentinela-data.json.pre-v85.bak` se existir. O marcador `resetEstoqueV85` é gravado no arquivo operacional para impedir que novos saldos sejam zerados em reinicializações futuras. Faça backup antes da atualização. Em hospedagem sem disco persistente, os arquivos locais podem ser perdidos.
- Para testar uma retirada, registre antes uma entrada com quantidade e validade conferida (quando exigida), selecione a mesma apresentação e retire até o saldo liberado. Lotes vencidos e sem validade obrigatória permanecem bloqueados.
- Na tela de login, a aba Cadastrar solicita nome, login, área de acesso, senha e confirmação. O administrador recebe uma notificação “Criação de user” com um código de seis caracteres, exibido como XXX.XXX. O código não é retornado ao navegador do solicitante. O administrador deve verificar a identidade e área antes de comunicar o código. O solicitante confirma o código e só então a conta é criada. O código expira em 15 minutos, admite cinco tentativas e não pode ser reutilizado. O admin pode recusar.
- As novas senhas e alterações são armazenadas com scrypt. O administrador deve entrar novamente após atualizar/reiniciar o servidor: as rotas administrativas agora exigem um token de sessão emitido no login, válido por até 12 horas. Não exponha as credenciais de demonstração. O protótipo não é apropriado para uso hospitalar real; a segurança das demais rotas legadas não foi auditada nesta versão.
- `npm test`: testes unitários e de rotas com dependências simuladas; não substituem teste integrado com Express/Render.
