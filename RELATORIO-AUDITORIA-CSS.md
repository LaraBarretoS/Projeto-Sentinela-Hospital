# Sentinela Hospitalar — Relatório de auditoria e correção CSS

## Causa raiz encontrada

1. `frontend/css/admin.css`, `frontend/css/farmacia.css` e `frontend/css/tv.css` estavam praticamente vazios (1 byte cada), embora as páginas tivessem regras visuais em blocos `<style>` internos.
2. `frontend/admin.html` e `frontend/farmacia.html` dependiam de CSS interno; `frontend/tv.html` também mantinha sua folha principal dentro do HTML.
3. As páginas carregavam `theme.css` depois do CSS específico. Como o tema global continha seletores genéricos e regras com `!important`, ele podia sobrescrever estilos da página.
4. `frontend/theme.css` continha camadas repetidas de variáveis e regras globais, além de uso excessivo de `!important`.
5. Havia atributos `style` em HTML estático e em fragmentos HTML montados por JavaScript, o que fazia parte da aparência ficar fora dos arquivos CSS editáveis.

## Correções realizadas

- Extraídos os blocos `<style>` de Administração, Farmácia e TV para `frontend/css/admin.css`, `farmacia.css` e `tv.css`.
- Convertidos atributos `style` encontrados nas oito páginas HTML em classes CSS com regras nos arquivos específicos correspondentes.
- Reescrita e consolidação de `frontend/theme.css` como camada global de tokens, tipografia, controles, tema escuro, foco e responsividade.
- Padronizada a ordem de carregamento: `theme.css` primeiro e CSS específico depois. A TV mantém CSS isolado por ser uma tela de exibição em tela cheia.
- Configurada a entrega estática no Express com `maxAge: 0`, ETag, Last-Modified e `Cache-Control: no-cache, must-revalidate` para HTML e CSS.
- Preservados os nomes das páginas, os scripts funcionais e os endpoints existentes.

## Evidências e testes executados

- Foram encontrados 8 arquivos HTML e 9 arquivos CSS.
- Todos os 8 HTML foram verificados: nenhum bloco `<style>` nem atributo `style=` permaneceu.
- Todos os caminhos CSS absolutos referenciados pelos HTML apontam para arquivos existentes.
- Todas as páginas de setor (Admin, Triagem, Médico, Atendimento, Farmácia e Medicações), Login e TV têm CSS associado.
- A ordem global/específica foi verificada nas páginas que usam ambas as folhas.
- Todos os 9 arquivos CSS foram analisados com `tinycss2`: nenhum erro de sintaxe foi identificado.
- `node --check backend/server.js` passou.
- `node --check` passou para os arquivos JavaScript externos em `frontend/js/`.

## Limitações

A instalação das dependências com `npm ci --ignore-scripts --no-audit --no-fund` excedeu o tempo disponível neste ambiente. Portanto, não foi possível iniciar o Express, confirmar respostas HTTP reais do servidor, abrir um navegador, conferir estilos computados, fazer screenshots ou executar testes visuais em breakpoints. As verificações realizadas comprovam estrutura, sintaxe, referências e configuração de cache, mas não substituem a validação visual no navegador.

## Como validar localmente

1. Extraia o ZIP e abra a pasta do projeto no terminal.
2. Execute `npm ci` (ou `npm install`).
3. Execute `npm start`.
4. Abra `http://localhost:3000` e navegue por Login, Administração, Triagem, Médico, Atendimento, Farmácia, Medicações e TV.
5. Para confirmar atualização: altere temporariamente uma propriedade em `frontend/css/index.css`, salve, recarregue a página e confirme a mudança; depois reverta a alteração.
6. Repita em `admin.css`, `triagem.css`, `medico.css`, `atendimento.css`, `farmacia.css` e `tv.css`.
7. Teste o botão de tema claro/escuro e larguras de 360 px, 768 px e desktop.

## Observação de segurança

A auditoria foi direcionada à camada CSS e ao carregamento dos arquivos. Não representa certificação de segurança, validação clínica ou homologação para uso hospitalar real.
