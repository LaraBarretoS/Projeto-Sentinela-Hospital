"use strict";
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let loading = false, moving = false;
async function api(url, options) {
  const r = await fetch(url, options);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(data.erro || `Erro HTTP ${r.status}`);
  return data;
}
function status(message, failed = false) {
  $('stockMessage').textContent = message;
  $('stockMessage').className = `stock-message ${failed ? 'error' : 'success'}`;
}
async function carregar() {
  if (loading || moving) return;
  loading = true;
  try {
    const [meds, hist] = await Promise.all([api('/almoxarifado/estoque'), api('/almoxarifado/movimentacoes')]);
    if (!Array.isArray(meds) || !Array.isArray(hist)) throw Error('Resposta do servidor inválida.');
    const selected = $('med').value;
    $('metricItems').textContent=String(meds.length);
    $('metricUnits').textContent=String(meds.reduce((acc,m)=>acc+Number(m.quantidade||0),0));
    $('metricLow').textContent=String(meds.filter(m=>Number(m.quantidade)<=Number(m.minimo)).length);
    $('estoque').innerHTML=meds.map(m=>`<tr><td><strong>${escapeHTML(m.nome)}</strong></td><td>${escapeHTML(m.quantidade)} ${escapeHTML(m.unidade)}</td><td>${escapeHTML(m.minimo)}</td><td><span class="stock-status ${Number(m.quantidade)<=Number(m.minimo)?'low':''}">${Number(m.quantidade)<=Number(m.minimo)?'Estoque baixo':'Disponível'}</span></td></tr>`).join('') || '<tr><td colspan="4" class="empty-message">Sem itens cadastrados.</td></tr>';
    const medSelect=$('med');
    medSelect.replaceChildren(...meds.map(m=>new Option(m.nome, String(m.id))));
    if (meds.some(m=>String(m.id)===selected)) medSelect.value=selected;
    $('hist').innerHTML=hist.map(x=>`<tr><td>${escapeHTML(Number.isNaN(new Date(x.dataHora).getTime())?'—':new Date(x.dataHora).toLocaleString('pt-BR'))}</td><td>${escapeHTML(x.tipo)}</td><td>${escapeHTML(x.medicamento)}</td><td>${escapeHTML(x.quantidade)}</td><td>${escapeHTML(x.paciente||x.motivo||'—')}</td><td>${escapeHTML(x.usuario||'—')}</td></tr>`).join('')||'<tr><td colspan="6" class="empty-message">Nenhuma movimentação registrada.</td></tr>';
  } catch (e) { status('Não foi possível carregar o estoque: '+e.message,true); }
  finally { loading=false; }
}
async function movimentar(tipo) {
  if (moving) return;
  const medicamentoId=$('med').value;
  const quantidade=Number($('qtd').value);
  if (!medicamentoId || !Number.isSafeInteger(quantidade) || quantidade<1) { status('Selecione um item e informe uma quantidade inteira e positiva.',true);return; }
  moving=true;
  $('btnEntrada').disabled=true; $('btnSaida').disabled=true;
  try {
    await api('/almoxarifado/'+tipo,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({medicamentoId,quantidade,paciente:$('paciente').value.trim(),usuario:window.sentinelaUser?.usuario})});
    status(tipo==='entrada'?'Entrada registrada com sucesso.':'Saída registrada com sucesso.');
    $('qtd').value='1'; $('paciente').value='';
  } catch(e){status(e.message,true);}
  finally {moving=false;$('btnEntrada').disabled=false;$('btnSaida').disabled=false;await carregar();}
}
$('btnEntrada').addEventListener('click',()=>movimentar('entrada'));
$('btnSaida').addEventListener('click',()=>movimentar('saida'));
$('newItemForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const msg = $('newItemMsg');
  const payload = {
    nome: $('novoItemNome').value.trim(),
    unidade: $('novoItemUnidade').value.trim(),
    quantidade: Number($('novoItemQtd').value),
    minimo: Number($('novoItemMin').value)
  };
  if (!payload.nome || !payload.unidade || !Number.isSafeInteger(payload.quantidade) || payload.quantidade < 0 || !Number.isSafeInteger(payload.minimo) || payload.minimo < 0) {
    msg.textContent = 'Preencha os campos com valores válidos.';msg.className='stock-message error';return;
  }
  submit.disabled=true;
  try {
    const item=await api('/almoxarifado/itens',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    await carregar();
    $('med').value=String(item.id);
    form.reset();
    msg.textContent='Item cadastrado e selecionado para movimentação.';msg.className='stock-message success';
  } catch(e) {msg.textContent=e.message;msg.className='stock-message error';}
  finally {submit.disabled=false;}
});
carregar();setInterval(carregar,10000);
