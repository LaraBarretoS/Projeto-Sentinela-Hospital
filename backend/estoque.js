'use strict';
const {randomUUID}=require('node:crypto');
const DAY=86400000;
function dataLocal(now=new Date()) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get=k=>parts.find(p=>p.type===k).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function dataValida(v){
  if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
  const d=new Date(v+'T00:00:00Z');return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===v;
}
function quantidadeValida(v,min=1){return (typeof v==='number'||(typeof v==='string'&&/^\d+$/.test(v)))&&Number.isSafeInteger(Number(v))&&Number(v)>=min;}
function novoLote(q,{dataEntrada,validade}={},now=new Date(),origem='entrada'){
  return {id:randomUUID(),dataEntrada:dataValida(dataEntrada)?dataEntrada:dataLocal(now),registradoEm:now.toISOString(),validade:validade||null,quantidadeInicial:q,quantidade:q,origem};
}
function migrar(m){
  if(!Array.isArray(m.lotes)){
    const q=Number(m.quantidade);
    m.lotes=Number.isSafeInteger(q)&&q>0?[{id:randomUUID(),dataEntrada:null,registradoEm:null,validade:dataValida(m.validade)?m.validade:null,quantidadeInicial:q,quantidade:q,origem:'legado'}]:[];
  }
  return sincronizar(m);
}
function sincronizar(m){
  const ativos=m.lotes.filter(l=>l.quantidade>0);
  m.quantidade=ativos.reduce((s,l)=>s+l.quantidade,0);
  m.validade=ativos.map(l=>l.validade).filter(dataValida).sort()[0]||null;
  return m;
}
function situacao(l,hoje){
  if(!l.quantidade)return 'esgotado';
  if(!dataValida(l.validade))return 'sem_validade';
  if(l.validade===hoje)return 'vence_hoje';
  if(l.validade<hoje)return 'vencido';
  return (Date.parse(l.validade)-Date.parse(hoje))/DAY<=90?'proximo':'normal';
}
function ordenar(lotes){
  const marker='9999-12-31';
  return [...lotes].sort((a,b)=>(a.dataEntrada||marker).localeCompare(b.dataEntrada||marker)||(a.registradoEm||'').localeCompare(b.registradoEm||''));
}
function resumo(m,hoje=dataLocal()){
  sincronizar(m);
  const lotes=ordenar(m.lotes).map(l=>({...l,situacao:situacao(l,hoje)}));
  const quantidadeSemValidade=m.exigeValidade===true?lotes.filter(l=>l.situacao==='sem_validade').reduce((s,l)=>s+l.quantidade,0):0;
  const quantidadeVencida=lotes.filter(l=>l.situacao==='vencido').reduce((s,l)=>s+l.quantidade,0);
  return {...m,lotes,quantidadeDisponivel:m.quantidade-quantidadeVencida-quantidadeSemValidade,quantidadeVencida,quantidadeSemValidade,temValidadeProxima:lotes.some(l=>['proximo','vence_hoje'].includes(l.situacao)),temValidadeDesconhecida:m.exigeValidade!==false&&lotes.some(l=>l.situacao==='sem_validade')};
}
function entrada(m,q,{dataEntrada,validade}={},now=new Date()){
  if(!quantidadeValida(q)||!Number.isSafeInteger(m.quantidade+Number(q)))throw Error('Informe uma quantidade inteira válida.');
  if(dataEntrada!==undefined&&dataEntrada!==null&&dataEntrada!==''&&!dataValida(dataEntrada))throw Error('Informe uma data de entrada/abertura válida.');
  if(validade!==undefined&&validade!==null&&validade!==''&&!dataValida(validade))throw Error('Informe uma data de validade válida.');
  const lote=novoLote(Number(q),{dataEntrada,validade},now);m.lotes.push(lote);sincronizar(m);return {...lote};
}
function retirar(m,q,{hoje=dataLocal(),ajuste=false}={}){
  if(!quantidadeValida(q))throw Error('Informe uma quantidade inteira maior que zero.');
  const elegiveis=ordenar(m.lotes).filter(l=>l.quantidade>0&&(ajuste||(situacao(l,hoje)!=='vencido'&&!(m.exigeValidade===true&&!dataValida(l.validade)))));
  if(elegiveis.reduce((s,l)=>s+l.quantidade,0)<Number(q))throw Error(`Estoque disponível insuficiente: ${elegiveis.reduce((s,l)=>s+l.quantidade,0)} unidade(s) liberada(s). Confira a apresentação e a validade dos lotes.`);
  let restante=Number(q);const detalhes=[];
  for(const l of elegiveis){if(!restante)break;const retirada=Math.min(l.quantidade,restante);l.quantidade-=retirada;restante-=retirada;detalhes.push({loteId:l.id,dataEntrada:l.dataEntrada,validade:l.validade,quantidade:retirada});}
  sincronizar(m);return detalhes;
}
function ajustar(m,q,now=new Date()){
  if(!quantidadeValida(q,0))throw Error('Informe uma quantidade inteira não negativa.');
  const delta=Number(q)-m.quantidade;
  if(delta>0){const l=novoLote(delta,{dataEntrada:dataLocal(now),validade:null},now,'ajuste');m.lotes.push(l);sincronizar(m);return [{loteId:l.id,dataEntrada:l.dataEntrada,validade:null,quantidade:delta}];}
  if(delta<0)return retirar(m,-delta,{ajuste:true});
  return [];
}
function zerarCatalogo(items){for(const m of items){m.lotes=[];m.quantidade=0;m.validade=null;}}
module.exports={zerarCatalogo,dataLocal,dataValida,quantidadeValida,migrar,resumo,entrada,retirar,ajustar};
