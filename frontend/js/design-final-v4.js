(()=>{'use strict';
const queue=document.getElementById('fila-pacientes');const counter=document.getElementById('v4FilaCount');
if(queue&&counter){const update=()=>{const items=queue.querySelectorAll('.fila-item,[data-paciente-id],.paciente-item');if(items.length)counter.textContent=String(items.length);else{const txt=queue.textContent.trim();counter.textContent=/carregando/i.test(txt)?'—':(/nenhum|vazia|sem pacientes/i.test(txt)?'0':'—')}};new MutationObserver(update).observe(queue,{childList:true,subtree:true});update()}
})();