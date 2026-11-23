(()=>{
'use strict';
const user=(()=>{try{return JSON.parse(localStorage.getItem('sentinelaUser')||'null')}catch(_){return null}})();
if(!user)return;
const page=location.pathname.split('/').pop().toLowerCase();
const pages={admin:['Administração','Gestão e indicadores','DG'],atendimento:['Atendimento','Recepção e cadastro','AT'],triagem:['Triagem','Avaliação e classificação','TR'],medico:['Médico','Consultório e prontuário','MD'],farmacia:['Almoxarifado','Estoque e movimentações','AL']};
const key=page.replace('.html','');const current=pages[key]||['Medicações','Prescrições','MG'];
const content=document.querySelector('#conteudo-principal');if(!content)return;
const shell=document.createElement('div');shell.className='sentinela-shell';
const rail=document.createElement('aside');rail.className='sentinela-rail';rail.setAttribute('aria-label','Navegação rápida');
const brand=document.createElement('a');brand.href='/index.html';brand.className='sentinela-brand';brand.textContent='S';brand.title='Sentinela • Início';rail.append(brand);
const menu=document.createElement('button');menu.type='button';menu.className='sentinela-rail-button';menu.textContent='≡';menu.title='Abrir ou fechar navegação';menu.setAttribute('aria-label','Abrir ou fechar navegação');menu.setAttribute('aria-expanded','false');rail.append(menu);
const active=document.createElement('a');active.href='#conteudo-principal';active.className='sentinela-rail-button is-active';active.textContent=current[2];active.title=current[0];rail.append(active);
const tv=document.createElement('a');tv.href='/tv.html';tv.target='_blank';tv.rel='noopener';tv.className='sentinela-rail-button';tv.textContent='TV';tv.title='Painel de chamadas';rail.append(tv);
const spacer=document.createElement('div');spacer.className='sentinela-rail-spacer';rail.append(spacer);
const sidebar=document.createElement('nav');sidebar.className='sentinela-sidebar';sidebar.id='sentinelaSidebar';sidebar.setAttribute('aria-label','Navegação do setor');
const sidebarTitle=document.createElement('h2');sidebarTitle.textContent='Sentinela';sidebar.append(sidebarTitle);const desc=document.createElement('p');desc.textContent='Central de navegação';sidebar.append(desc);
const nav=[['Início do setor','#conteudo-principal','IN']];
if(key==='admin')nav.push(['Visão geral','visao','VG'],['Usuários','usuarios','US'],['Novo usuário','adicionar','NV'],['Notificações','notificacoes','NT']);
else if(key==='triagem'||key==='medico')nav.push(['Fila de pacientes','.coluna-fila','FL'],['Ficha de atendimento','.coluna-form','FX']);
else if(key==='farmacia')nav.push(['Indicadores','.pharmacy-grid','ID'],['Estoque','#estoque','ES'],['Movimentações','.pharmacy-secondary','MV'],['Histórico','#hist','HC']);
else if(key==='atendimento')nav.push(['Identificação','.patient-registration','ID'],['Encaminhamento','.patient-routing','EC']);
nav.forEach(([label,target,icon])=>{const link=document.createElement('a');link.href=target.startsWith('#')?target:'#conteudo-principal';link.className='sentinela-nav-link';link.textContent=icon+'  '+label;if(label==='Início do setor')link.classList.add('is-active');link.addEventListener('click',e=>{if(key==='admin'&&!target.startsWith('#')){e.preventDefault();const tab=document.querySelector('.tab[data-panel="'+target+'"]');if(tab)tab.click();document.querySelector('#conteudo-principal')?.scrollIntoView({behavior:'smooth'});}else if(target.startsWith('.')||target==='#estoque'||target==='#hist'){e.preventDefault();document.querySelector(target)?.scrollIntoView({behavior:'smooth'});}shell.classList.remove('sidebar-open');menu.setAttribute('aria-expanded','false');});sidebar.append(link)});
const workspace=document.createElement('div');workspace.className='sentinela-workspace';const header=document.createElement('header');header.className='sentinela-header';
const title=document.createElement('div');title.className='sentinela-header-title';const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent='SENTINELA / '+current[0].toUpperCase();const h=document.createElement('h1');h.textContent=current[0];const subtitle=document.createElement('p');subtitle.textContent=current[1];title.append(eyebrow,h,subtitle);header.append(title);
const actions=document.createElement('div');actions.className='sentinela-header-actions';header.append(actions);
content.parentNode.insertBefore(shell,content);shell.append(rail,sidebar,workspace);workspace.append(header,content);
const bell=document.querySelector('#notificationBell.v4-header-notification');if(bell)actions.append(bell);
const bar=document.querySelector('.sentinela-topbar');if(bar)actions.append(bar);

menu.addEventListener('click',()=>{const open=shell.classList.toggle('sidebar-open');menu.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){shell.classList.remove('sidebar-open');menu.setAttribute('aria-expanded','false')}});
document.body.classList.add('sentinela-app');
})();

/* Interface sectorial: reference-ui */
/* Sector-only refinements. Admin and TV do not load this module. */
(() => {
  'use strict';
  const main = document.querySelector('#conteudo-principal.reference-v3');
  if (!main) return;
  const label = document.querySelector('.sentinela-header-title .eyebrow');
  if (label) label.textContent = label.textContent.replace(' / ', ' / ');
  const sender = document.getElementById('btnTrocarUsuario');
  if (sender) sender.textContent = 'Trocar usuário';
  const password = document.getElementById('btnMinhaSenha');
  if (password) password.textContent = 'Minha senha';
  const point = document.getElementById('btnPontoManual');
  if (point) point.textContent = 'Ponto';
  // No existing input IDs, business logic, validation or API calls are altered.
})();



/* Interface sectorial: design-final-v4 */
(()=>{'use strict';
const queue=document.getElementById('fila-pacientes');const counter=document.getElementById('v4FilaCount');
if(queue&&counter){const update=()=>{const items=queue.querySelectorAll('.fila-item,[data-paciente-id],.paciente-item');if(items.length)counter.textContent=String(items.length);else{const txt=queue.textContent.trim();counter.textContent=/carregando/i.test(txt)?'—':(/nenhum|vazia|sem pacientes/i.test(txt)?'0':'—')}};new MutationObserver(update).observe(queue,{childList:true,subtree:true});update()}
})();


/* v9 sanitizer */
(()=>{'use strict';
 const selectors=['h1','h2','h3','h4','button','a.admin-quick-link','.tab','.sentinela-nav-link'];
 const bad=/^[\s]*([📊🪪🩺🧑‍⚕️💊👥➕🔔🔎🔐📺♙♧◷☷▤▦➤♧✚]+|[➤➜⇄←◷☰]+)\s*/u;
 document.querySelectorAll(selectors.join(',')).forEach(el=>{
   if(el.children.length===0 && el.textContent) el.textContent=el.textContent.replace(bad,'').replace(/\s{2,}/g,' ').trim();
 });
 document.querySelectorAll('.ref-hero-emblem').forEach(el=>{el.textContent=''; el.setAttribute('aria-hidden','true');});
})();
