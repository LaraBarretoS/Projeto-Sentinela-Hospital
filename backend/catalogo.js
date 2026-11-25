'use strict';
const estoque=require('./estoque');
// Catálogo acadêmico de formas e unidades, não uma lista de prescrição.
// IDs 1–5 preservam o estoque existente. Novas apresentações começam zeradas.
const rows=[
 ['dipirona','Dipirona','Medicamentos',[[1,'Comprimido','comprimidos'],['dip-gotas','Solução oral (gotas)','frascos']]],
 ['paracetamol','Paracetamol','Medicamentos',[[2,'Comprimido','comprimidos'],['par-gotas','Solução oral (gotas)','frascos']]],
 ['ibuprofeno','Ibuprofeno','Medicamentos',[[3,'Comprimido','comprimidos'],['ibu-susp','Suspensão oral','frascos']]],
 ['amoxicilina','Amoxicilina','Medicamentos',[[4,'Cápsula','cápsulas'],['amox-comp','Comprimido','comprimidos'],['amox-susp','Pó para suspensão oral','frascos']]],
 ['soro','Soro fisiológico','Soluções hospitalares',[[5,'Apresentação anterior (a conferir)','unidades'],['soro-fr','Frasco','frascos'],['soro-bolsa','Bolsa','bolsas']]],
 ['loratadina','Loratadina','Medicamentos',[['lor-comp','Comprimido','comprimidos'],['lor-xar','Xarope','frascos']]],
 ['cetirizina','Cetirizina','Medicamentos',[['cet-comp','Comprimido','comprimidos'],['cet-sol','Solução oral','frascos']]],
 ['omeprazol','Omeprazol','Medicamentos',[['ome-cap','Cápsula','cápsulas']]],
 ['simeticona','Simeticona','Medicamentos',[['sim-comp','Comprimido','comprimidos'],['sim-gotas','Emulsão oral (gotas)','frascos']]],
 ['lactulose','Lactulose','Medicamentos',[['lac-sol','Solução oral','frascos']]],
 ['cefalexina','Cefalexina','Medicamentos',[['cef-cap','Cápsula','cápsulas'],['cef-susp','Pó para suspensão oral','frascos']]],
 ['azitromicina','Azitromicina','Medicamentos',[['azi-comp','Comprimido','comprimidos'],['azi-susp','Pó para suspensão oral','frascos']]],
 ['amoxclav','Amoxicilina + clavulanato','Medicamentos',[['acl-comp','Comprimido','comprimidos'],['acl-susp','Pó para suspensão oral','frascos']]],
 ['nistatina','Nistatina','Medicamentos',[['nis-susp','Suspensão oral','frascos'],['nis-creme','Creme','bisnagas']]],
 ['sais','Sais de reidratação oral','Medicamentos',[['sais-po','Pó para solução oral','envelopes']]],
 ['luvas','Luvas de procedimento','Proteção individual',[['luv-p','Tamanho P','unidades'],['luv-m','Tamanho M','unidades'],['luv-g','Tamanho G','unidades']]],
 ['luvasest','Luvas estéreis','Proteção individual',[['lue-p','Tamanho P','pares'],['lue-m','Tamanho M','pares'],['lue-g','Tamanho G','pares']]],
 ['mascaras','Máscaras','Proteção individual',[['mas-cir','Cirúrgica','unidades'],['mas-pff','PFF2','unidades']]],
 ['touca','Touca descartável','Proteção individual',[['touca-un','Descartável','unidades']]],
 ['avental','Avental descartável','Proteção individual',[['ave-p','Tamanho P','unidades'],['ave-m','Tamanho M','unidades'],['ave-g','Tamanho G','unidades']]],
 ['seringa','Seringas','Materiais hospitalares',[['ser-3','3 mL','unidades'],['ser-5','5 mL','unidades'],['ser-10','10 mL','unidades'],['ser-20','20 mL','unidades']]],
 ['gaze','Compressa de gaze','Curativos',[['gaz-est','Estéril','pacotes'],['gaz-nao','Não estéril','pacotes']]],
 ['atadura','Atadura','Curativos',[['ata-10','10 cm','rolos'],['ata-15','15 cm','rolos'],['ata-20','20 cm','rolos']]],
 ['algodao','Algodão hidrófilo','Curativos',[['alg-pac','Pacote','pacotes']]],
 ['fita','Fita para curativo','Curativos',[['fit-micro','Microporosa','rolos'],['fit-espar','Esparadrapo','rolos']]],
 ['tubos','Tubos para coleta de sangue','Coleta e laboratório',[['tub-edta','Com EDTA','unidades'],['tub-cit','Com citrato','unidades'],['tub-soro','Para soro','unidades']]],
 ['garrote','Garrote','Coleta e laboratório',[['gar-un','Unidade','unidades']]],
 ['coletor','Frasco coletor de amostras','Coleta e laboratório',[['col-est','Estéril','unidades'],['col-nao','Não estéril','unidades']]],
 ['etiqueta','Etiquetas de identificação','Coleta e laboratório',[['eti-pac','Pacote','pacotes']]],
 ['equipo','Equipo','Materiais hospitalares',[['equ-macro','Macrogotas','unidades'],['equ-micro','Microgotas','unidades']]],
 ['abaixador','Abaixador de língua','Materiais hospitalares',[['aba-pac','Pacote','pacotes']]],
 ['curativo','Curativo adesivo','Curativos',[['cur-un','Individual','unidades']]],
 ['papel','Papel para maca','Higiene e apoio',[['pap-rolo','Rolo','rolos']]],
 ['saco','Saco para resíduos hospitalares','Higiene e apoio',[['sac-30','30 L','unidades'],['sac-50','50 L','unidades'],['sac-100','100 L','unidades']]]
];
const semData=new Set(['gar-un','eti-pac','pap-rolo','sac-30','sac-50','sac-100']);
const catalogo=rows.flatMap(([grupo,nome,categoria,formas])=>formas.map(([id,apresentacao,unidade])=>({id,grupo,nome,categoria,apresentacao,unidade,exigeValidade:!semData.has(id),minimo:0})));
function integrar(items){
 const existentes=new Map(items.map(m=>[String(m.id),m]));
 for(const c of catalogo){const m=existentes.get(String(c.id));if(m){Object.assign(m,{grupo:c.grupo,categoria:c.categoria,apresentacao:c.apresentacao,exigeValidade:c.exigeValidade});}else{items.push({...c,quantidade:0,lotes:[]});}}
 for(const m of items){if(!m.grupo){m.grupo='legado-'+m.id;m.categoria='Outros';m.apresentacao='Apresentação anterior (a conferir)';m.exigeValidade=true;}estoque.migrar(m);}
 return items;
}
function validar(m,apresentacao,dataEntrada,validade,hoje,tipo){
 if(!m||String(apresentacao||'')!==String(m.id))throw Error('Selecione a apresentação específica do item.');
 if(tipo!=='entrada')return {dataEntrada:null,validade:null};
 if(!dataEntrada)throw Error('Informe a data de entrada/abertura do lote.');
 if(!estoque.dataValida(dataEntrada))throw Error('Informe uma data válida para entrada/abertura.');
 if(dataEntrada>hoje)throw Error('A data de entrada/abertura não pode ser futura.');
 if(m.exigeValidade&&!validade)throw Error('Informe a validade do produto indicada na embalagem/bula.');
 if(validade&&!estoque.dataValida(validade))throw Error('Informe uma data de validade válida.');
 if(validade&&validade<dataEntrada)throw Error('A validade do produto não pode ser anterior à data de entrada/abertura.');
 if(validade&&validade<hoje)throw Error('Este lote já está vencido. Confira a validade informada.');
 return {dataEntrada,validade:validade||null};
}
module.exports={catalogo,integrar,validar};
