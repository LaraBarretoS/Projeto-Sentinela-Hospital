'use strict';
let meds=[];let ocupado=false;let carregando=false;let versao=0;
const expandidos=new Set();
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v.split('-').reverse().join('/'): 'Não informada';
const saldo=m=>m.quantidadeDisponivel??m.quantidade;
const todayLocal=()=>{ const d=new Date(); const tz=new Date(d.toLocaleString('en-US',{timeZone:'America/Sao_Paulo'})); return `${tz.getFullYear()}-${String(tz.getMonth()+1).padStart(2,'0')}-${String(tz.getDate()).padStart(2,'0')}`; };
function preencherDataEntradaPadrao(){ if($('dataEntrada')) $('dataEntrada').value=todayLocal(); }
function statusMed(m){
 if(!m.quantidade)return ['Sem estoque','unknown'];
 if(m.quantidadeVencida>0)return ['Há lote vencido','expired'];
 if(m.lotes?.some(l=>l.situacao==='vence_hoje'))return ['Vence hoje','low'];
 if(m.temValidadeProxima)return ['Vence em até 90 dias','low'];
 if(m.temValidadeDesconhecida)return ['Validade a conferir','unknown'];
 if(m.minimo>0&&saldo(m)<=m.minimo)return ['Estoque baixo','low'];
 return ['Normal','ok'];
}
const statusLote={vence_hoje:['Vence hoje','low'],normal:['Normal','ok'],proximo:['Próximo do vencimento','low'],vencido:['Vencido · bloqueado','expired'],sem_validade:['Validade a conferir','unknown'],esgotado:['Esgotado','unknown']};
function renderLotes(m){
 const lotes=m.lotes||[];
 return `<div class="lotes-panel"><div class="lotes-title"><strong>Lotes de ${esc(m.nome)} — ${esc(m.apresentacao)}</strong><span>${lotes.length} registro(s) · ordem de entrada</span></div><div class="lotes-scroll"><table class="lotes-table"><thead><tr><th>Data de entrada / abertura</th><th>Validade do produto</th><th>Quantidade inicial</th><th>Saldo</th><th>Situação</th></tr></thead><tbody>${lotes.map(l=>{const [label,cls]=(l.situacao==='sem_validade'&&!m.exigeValidade?['Sem data registrada','unknown']:statusLote[l.situacao])||statusLote.sem_validade;return `<tr><td>${l.dataEntrada?dateLabel(l.dataEntrada):'Estoque anterior'}${l.origem==='ajuste'?'<small>Ajuste de estoque</small>':l.origem==='legado'?'<small>Data original não registrada</small>':''}</td><td>${dateLabel(l.validade)}${l.situacao==='sem_validade'&&m.exigeValidade?`<button type="button" class="lote-toggle" data-conferir="${esc(l.id)}" data-item="${esc(m.id)}" title="Registrar validade conferida">✓</button>`:''}</td><td>${esc(l.quantidadeInicial)}</td><td><strong>${esc(l.quantidade)}</strong> ${esc(m.unidade||'')}</td><td><span class="status ${cls}">${label}</span></td></tr>`}).join('')||'<tr><td colspan="5">Nenhum lote registrado.</td></tr>'}</tbody></table></div></div>`;
}
function renderEstoque(){
 const q=$('searchMed').value.toLocaleLowerCase('pt-BR'), f=$('filterStock').value;
 const cat=$('filterCategory').value;
 const filtered=meds.filter(m=>(cat==='todos'||cat===m.categoria)&&`${m.nome} ${m.apresentacao} ${m.categoria}`.toLocaleLowerCase('pt-BR').includes(q)&&(f==='todos'||(f==='baixo'&&m.minimo>0&&saldo(m)<=m.minimo)||(f==='validade'&&m.temValidadeProxima)||(f==='vencido'&&m.quantidadeVencida>0)));
 const focused=document.activeElement?.dataset?.loteToggle;
 $('estoque').innerHTML=filtered.map(m=>{
  const id=String(m.id),open=expandidos.has(id),[label,cls]=statusMed(m);
  return `<tr><td><div class="med-name"><button type="button" class="lote-toggle" data-lote-toggle="${esc(id)}" aria-expanded="${open}" aria-controls="lotes-${esc(id)}" aria-label="${open?'Recolher':'Expandir'} lotes de ${esc(m.nome)}">${open?'−':'+'}</button><div><b>${esc(m.nome)}</b><small>${esc(m.apresentacao)} · ${esc(m.categoria)}</small></div></div></td><td>${esc(m.quantidade)} ${esc(m.unidade||'')}${m.quantidadeVencida||m.quantidadeSemValidade?`<small class="stock-blocked">${esc(saldo(m))} disponível(is) · ${esc(m.quantidadeVencida||0)} vencido(s) · ${esc(m.quantidadeSemValidade||0)} a conferir</small>`:''}</td><td>${esc(m.minimo)}</td><td>${dateLabel(m.validade)}${m.temValidadeDesconhecida&&m.validade?'<small>Há lotes sem validade</small>':''}</td><td><span class="status ${cls}">${label}</span></td></tr><tr class="lotes-row" id="lotes-${esc(id)}" ${open?'':'hidden'}><td colspan="5">${open?renderLotes(m):''}</td></tr>`;
 }).join('')||'<tr><td colspan="5">Nenhum item encontrado.</td></tr>';
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
  $('lowCount').textContent=meds.filter(m=>m.minimo>0&&saldo(m)<=m.minimo).length;
  $('expiryCount').textContent=meds.filter(m=>m.temValidadeProxima||m.quantidadeVencida>0).length;
  const grupos=[...new Map(meds.map(m=>[m.grupo,m])).values()].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
  atualizarSelect($('med'),grupos.map(m=>[m.grupo,m.nome]),'Selecione um item');
  atualizarSelect($('filterCategory'),[...new Set(meds.map(m=>m.categoria))].sort().map(c=>[c,c]),'Todas as categorias','todos');
  atualizarFormas();
  $('hist').innerHTML=h.map(x=>`<tr><td>${esc(new Date(x.dataHora).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}))}</td><td>${esc(x.tipo)}</td><td>${esc(x.medicamento)}<small>${esc(x.apresentacao||"Apresentação anterior")}</small></td><td>${esc(x.quantidade)} ${esc(x.unidade||"")}</td><td>${lotesMov(x)}</td><td>${esc(x.paciente||'—')}</td><td>${esc(x.usuario||'—')}</td></tr>`).join('')||'<tr><td colspan="7">Nenhuma movimentação registrada.</td></tr>';
  renderEstoque();
 }catch(e){if(v===versao)$('estoque').innerHTML=`<tr><td colspan="5" role="alert">${esc(e.message)}</td></tr>`;}
 finally{carregando=false; if(v!==versao&&!ocupado)carregar();}
}
function atualizarSelect(el,options,placeholder,placeholderValue=''){
 const all=[[placeholderValue,placeholder],...options.map(([v,t])=>[String(v),t])];
 if(JSON.stringify(Array.from(el.options).map(o=>[o.value,o.text]))===JSON.stringify(all))return;
 const previous=el.value;el.replaceChildren(...all.map(([v,t])=>new Option(t,v)));
 el.value=all.some(([v])=>v===previous)?previous:placeholderValue;
}
function atualizarFormas(){
 const group=$('med').value;
 const op=meds.filter(m=>m.grupo===group);
 atualizarSelect($('forma'),op.map(m=>[m.id,m.apresentacao]),'Selecione a apresentação');
 if(op.length===1)$('forma').value=String(op[0].id);
 atualizarInfoForma();
}
function atualizarInfoForma(){
 const m=meds.find(x=>String(x.id)===$('forma').value);
 $('unidadeHint').textContent=m?'Quantidade em '+m.unidade+'. Disponível para saída: '+saldo(m)+'.':'';
 $('dataEntradaHint').textContent=m?'Obrigatória na entrada: informe quando o lote chegou ou foi aberto.':'';
 $('validadeHint').textContent=m?(m.exigeValidade?'Obrigatória na entrada: copie a data final da embalagem/bula.':'Preencha apenas se houver validade na embalagem.'):'';
}
$('med').addEventListener('change',()=>{$('forma').value='';$('validade').value='';preencherDataEntradaPadrao();atualizarFormas();});
$('forma').addEventListener('change',()=>{$('validade').value='';preencherDataEntradaPadrao();atualizarInfoForma();});
$('filterCategory').addEventListener('change',renderEstoque);
function mensagem(texto,erro=false){const el=$('movStatus');el.hidden=false;el.className=erro?'mov-error':'mov-success';el.textContent=texto;}
async function mov(tipo){
 if(ocupado)return;
 const quantidade=Number($('qtd').value);
 if(!Number.isSafeInteger(quantidade)||quantidade<=0)return mensagem('Informe uma quantidade inteira maior que zero.',true);
 const m=meds.find(x=>String(x.id)===$('forma').value&&x.grupo===$('med').value);
 if(!m)return mensagem('Selecione o item e sua apresentação.',true);
 if(tipo==='entrada'&&!$('dataEntrada').value)return mensagem('Informe a data de entrada/abertura do lote.',true);
 if(tipo==='entrada'&&m.exigeValidade&&!$('validade').value)return mensagem('Informe a validade do produto.',true);
 const body={medicamentoId:m.id,apresentacaoId:m.id,quantidade,paciente:$('paciente').value,dataEntrada:tipo==='entrada'?$('dataEntrada').value:'',validade:tipo==='entrada'?$('validade').value:'',usuario:window.sentinelaUser?.usuario};
 ocupado=true;versao++;$('btnEntrada').disabled=$('btnSaida').disabled=true;
 try{
  const r=await fetch('/farmacia/'+tipo,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.erro||'Falha na movimentação.');
  expandidos.add(String(body.medicamentoId));
  meds=meds.map(item=>String(item.id)===String(d.id)?d:item);atualizarInfoForma();renderEstoque();
  const detalhes=d.movimentacao?.lotes||[];
  mensagem(tipo==='entrada'?`Entrada registrada: ${quantidade} ${d.unidade} de ${d.nome} (${d.apresentacao}). Entrada: ${dateLabel(d.movimentacao?.dataEntrada)}. Validade: ${dateLabel(d.movimentacao?.validade)}.`:`Saída registrada: ${quantidade} ${d.unidade} de ${d.nome} (${d.apresentacao}). Lotes: ${detalhes.map(l=>`${l.quantidade} de ${l.dataEntrada?dateLabel(l.dataEntrada):'estoque anterior'}`).join('; ')}.`);
  $('qtd').value='1';$('paciente').value='';$('validade').value='';preencherDataEntradaPadrao();
 }catch(e){mensagem(e.message,true);}
 finally{ocupado=false;$('btnEntrada').disabled=$('btnSaida').disabled=false;carregar();}
}
$('estoque').addEventListener('click',event=>{const conferir=event.target.closest('[data-conferir]');if(conferir){abrirConferencia(conferir.dataset.item,conferir.dataset.conferir);return;}const b=event.target.closest('[data-lote-toggle]');if(!b)return;const id=b.dataset.loteToggle;if(expandidos.has(id))expandidos.delete(id);else expandidos.add(id);renderEstoque();});
let conferenciaAtual=null;
function abrirConferencia(itemId,loteId){
 conferenciaAtual={itemId,loteId};
 const m=meds.find(x=>String(x.id)===String(itemId));
 $('conferencia').hidden=false;
 $('conferenciaTitulo').textContent=m?`${m.nome} — ${m.apresentacao}`:'Lote';
 $('dataConferida').value='';
 $('dataConferida').focus();
}
$('cancelarConferencia').onclick=()=>{conferenciaAtual=null;$('conferencia').hidden=true;};
$('salvarConferencia').onclick=async()=>{
 if(!conferenciaAtual)return;
 if(!$('dataConferida').value)return mensagem('Informe a validade conferida.',true);
 ocupado=true;$('salvarConferencia').disabled=true;
 try{const r=await fetch('/farmacia/conferir-validade',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({medicamentoId:conferenciaAtual.itemId,loteId:conferenciaAtual.loteId,validade:$('dataConferida').value,usuario:window.sentinelaUser?.usuario})});const d=await r.json();if(!r.ok)throw Error(d.erro||'Falha ao salvar a validade.');mensagem('Validade conferida com sucesso.');conferenciaAtual=null;$('conferencia').hidden=true;}
 catch(e){mensagem(e.message,true);}finally{ocupado=false;$('salvarConferencia').disabled=false;carregar();}
};
$('searchMed').addEventListener('input',renderEstoque);
$('filterStock').addEventListener('change',renderEstoque);
preencherDataEntradaPadrao();
carregar();setInterval(carregar,15000);
