'use strict';
let meds=[];let ocupado=false;let carregando=false;let versao=0;
const expandidos=new Set();
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v.split('-').reverse().join('/'):'Não informada';
const saldo=m=>m.quantidadeDisponivel??m.quantidade;
function statusMed(m){
 if(m.quantidadeVencida>0)return ['Há lote vencido','expired'];
 if(m.temValidadeProxima)return ['Vence em até 90 dias','low'];
 if(saldo(m)<=m.minimo)return ['Estoque baixo','low'];
 if(m.temValidadeDesconhecida)return ['Validade a conferir','unknown'];
 return ['Normal','ok'];
}
const statusLote={normal:['Normal','ok'],proximo:['Próximo do vencimento','low'],vencido:['Vencido · bloqueado','expired'],sem_validade:['Validade a conferir','unknown'],esgotado:['Esgotado','unknown']};
function renderLotes(m){
 const lotes=m.lotes||[];
 return `<div class="lotes-panel"><div class="lotes-title"><strong>Lotes de ${esc(m.nome)}</strong><span>${lotes.length} registro(s) · ordem de entrada</span></div><div class="lotes-scroll"><table class="lotes-table"><thead><tr><th>Data de entrada</th><th>Validade</th><th>Quantidade inicial</th><th>Saldo</th><th>Situação</th></tr></thead><tbody>${lotes.map(l=>{const [label,cls]=statusLote[l.situacao]||statusLote.sem_validade;return `<tr><td>${l.dataEntrada?dateLabel(l.dataEntrada):'Estoque anterior'}${l.origem==='ajuste'?'<small>Ajuste de estoque</small>':l.origem==='legado'?'<small>Data original não registrada</small>':''}</td><td>${dateLabel(l.validade)}</td><td>${esc(l.quantidadeInicial)}</td><td><strong>${esc(l.quantidade)}</strong> ${esc(m.unidade||'')}</td><td><span class="status ${cls}">${label}</span></td></tr>`}).join('')||'<tr><td colspan="5">Nenhum lote registrado.</td></tr>'}</tbody></table></div></div>`;
}
function renderEstoque(){
 const q=$('searchMed').value.toLocaleLowerCase('pt-BR'), f=$('filterStock').value;
 const filtered=meds.filter(m=>m.nome.toLocaleLowerCase('pt-BR').includes(q)&&(f==='todos'||(f==='baixo'&&saldo(m)<=m.minimo)||(f==='validade'&&m.temValidadeProxima)||(f==='vencido'&&m.quantidadeVencida>0)));
 const focused=document.activeElement?.dataset?.loteToggle;
 $('estoque').innerHTML=filtered.map(m=>{
  const id=String(m.id),open=expandidos.has(id),[label,cls]=statusMed(m);
  return `<tr><td><div class="med-name"><button type="button" class="lote-toggle" data-lote-toggle="${esc(id)}" aria-expanded="${open}" aria-controls="lotes-${esc(id)}" aria-label="${open?'Recolher':'Expandir'} lotes de ${esc(m.nome)}">${open?'−':'+'}</button><b>${esc(m.nome)}</b></div></td><td>${esc(m.quantidade)} ${esc(m.unidade||'')}${m.quantidadeVencida?`<small class="stock-blocked">${esc(m.quantidadeVencida)} vencido(s) · ${esc(saldo(m))} não vencido(s)</small>`:''}</td><td>${esc(m.minimo)}</td><td>${dateLabel(m.validade)}${m.temValidadeDesconhecida&&m.validade?'<small>Há lotes sem validade</small>':''}</td><td><span class="status ${cls}">${label}</span></td></tr><tr class="lotes-row" id="lotes-${esc(id)}" ${open?'':'hidden'}><td colspan="5">${open?renderLotes(m):''}</td></tr>`;
 }).join('')||'<tr><td colspan="5">Nenhum medicamento encontrado.</td></tr>';
 if(focused)Array.from($('estoque').querySelectorAll('button[data-lote-toggle]')).find(b=>b.dataset.loteToggle===focused)?.focus({preventScroll:true});
}
function lotesMov(x){
 if(Array.isArray(x.lotes)&&x.lotes.length)return x.lotes.map(l=>`<div class="hist-lote">${l.dataEntrada?dateLabel(l.dataEntrada):'Estoque anterior'} · ${esc(l.quantidade)} un.<small>Val.: ${dateLabel(l.validade)}</small></div>`).join('');
 return x.validade?dateLabel(x.validade):'—';
}
async function carregar(){
 if(carregando||ocupado)return;
 carregando=true;const v=versao;
 try{
  const [stock,hist]=await Promise.all([fetch('/farmacia/estoque',{cache:'no-store'}),fetch('/farmacia/movimentacoes',{cache:'no-store'})]);
  if(!stock.ok||!hist.ok)throw Error('Não foi possível carregar os dados do almoxarifado.');
  const [novos,h]=await Promise.all([stock.json(),hist.json()]);
  if(v!==versao)return;
  meds=novos;
  $('totalMeds').textContent=meds.length;
  $('lowCount').textContent=meds.filter(m=>saldo(m)<=m.minimo).length;
  $('expiryCount').textContent=meds.filter(m=>m.temValidadeProxima||m.quantidadeVencida>0).length;
  const select=$('med'), selected=select.value;
  const options=meds.map(m=>`<option value="${esc(m.id)}">${esc(m.nome)}</option>`).join('');
  // Não recriar o seletor durante uma atualização se a lista não mudou.
  const current=Array.from(select.options).map(o=>[o.value,o.text]);
  if(JSON.stringify(current)!==JSON.stringify(meds.map(m=>[String(m.id),m.nome]))){select.innerHTML=options;if(meds.some(m=>String(m.id)===selected))select.value=selected;}
  $('hist').innerHTML=h.map(x=>`<tr><td>${esc(new Date(x.dataHora).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}))}</td><td>${esc(x.tipo)}</td><td>${esc(x.medicamento)}</td><td>${esc(x.quantidade)}</td><td>${lotesMov(x)}</td><td>${esc(x.paciente||'—')}</td><td>${esc(x.usuario||'—')}</td></tr>`).join('')||'<tr><td colspan="7">Nenhuma movimentação registrada.</td></tr>';
  renderEstoque();
 }catch(e){if(v===versao)$('estoque').innerHTML=`<tr><td colspan="5" role="alert">${esc(e.message)}</td></tr>`;}
 finally{carregando=false; if(v!==versao&&!ocupado)carregar();}
}
function mensagem(texto,erro=false){const el=$('movStatus');el.hidden=false;el.className=erro?'mov-error':'mov-success';el.textContent=texto;}
async function mov(tipo){
 if(ocupado)return;
 const quantidade=Number($('qtd').value);
 if(!Number.isSafeInteger(quantidade)||quantidade<=0)return mensagem('Informe uma quantidade inteira maior que zero.',true);
 if(!$('med').value)return mensagem('Selecione um medicamento.',true);
 const body={medicamentoId:$('med').value,quantidade,paciente:$('paciente').value,validade:$('validade').value,usuario:window.sentinelaUser?.usuario};
 ocupado=true;versao++;$('btnEntrada').disabled=$('btnSaida').disabled=true;
 try{
  const r=await fetch('/farmacia/'+tipo,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.erro||'Falha na movimentação.');
  expandidos.add(String(body.medicamentoId));
  const detalhes=d.movimentacao?.lotes||[];
  mensagem(tipo==='entrada'?`Entrada registrada: ${quantidade} unidade(s) de ${d.nome}. ${dateLabel(body.validade)==='Não informada'?'Validade não informada.':`Validade: ${dateLabel(body.validade)}.`}`:`Saída registrada: ${quantidade} unidade(s) de ${d.nome}. Lotes: ${detalhes.map(l=>`${l.quantidade} de ${l.dataEntrada?dateLabel(l.dataEntrada):'estoque anterior'}`).join('; ')}.`);
  $('qtd').value='1';$('paciente').value='';$('validade').value='';
 }catch(e){mensagem(e.message,true);}
 finally{ocupado=false;$('btnEntrada').disabled=$('btnSaida').disabled=false;carregar();}
}
$('estoque').addEventListener('click',event=>{const b=event.target.closest('[data-lote-toggle]');if(!b)return;const id=b.dataset.loteToggle;if(expandidos.has(id))expandidos.delete(id);else expandidos.add(id);renderEstoque();});
$('searchMed').addEventListener('input',renderEstoque);$('filterStock').addEventListener('change',renderEstoque);
carregar();setInterval(carregar,15000);
