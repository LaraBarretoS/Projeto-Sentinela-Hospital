(() => {
  const user = JSON.parse(localStorage.getItem("sentinelaUser") || "null");
  if (!user) { window.location.href = "/index.html"; return; }

  const style = document.createElement("style");
  style.textContent = `
  .sentinela-topbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
  .sentinela-user{font-size:13px;color:#4a5568}.sentinela-actions{display:flex;gap:7px;flex-wrap:wrap}
  .sentinela-btn{border:0;border-radius:7px;padding:8px 11px;cursor:pointer;background:#edf2f7;color:#2d3748;font-weight:600}
  .sentinela-btn.primary{background:#2b6cb0;color:white}.sentinela-btn.danger{background:#c53030;color:white}
  .ponto-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);display:none;align-items:center;justify-content:center;z-index:9999;padding:20px}
  .ponto-modal{background:white;color:#1a202c;width:min(430px,100%);border-radius:14px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
  .ponto-modal h3{margin-top:0}.ponto-modal input{width:100%;box-sizing:border-box;padding:11px;border:1px solid #cbd5e1;border-radius:7px;margin:8px 0 14px;font-size:16px}
  .ponto-buttons{display:flex;gap:8px}.ponto-buttons button{flex:1;padding:11px;border:0;border-radius:7px;cursor:pointer;font-weight:700}.ponto-confirm{background:#2b6cb0;color:#fff}.ponto-cancel{background:#edf2f7}
  `;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.className = "sentinela-topbar";
  bar.innerHTML = `<div class="sentinela-user">👤 <b>${user.nome || user.usuario}</b> · ${user.tipo}</div><div class="sentinela-actions"><button class="sentinela-btn" onclick="location.href='/index.html'">← Trocar usuário</button><button class="sentinela-btn primary" id="btnPontoManual">🕐 Ponto</button></div>`;
  const first = document.body.firstElementChild;
  if (first) first.before(bar); else document.body.prepend(bar);

  const overlay = document.createElement("div"); overlay.className="ponto-overlay"; overlay.id="pontoOverlay";
  overlay.innerHTML=`<div class="ponto-modal"><h3>🕐 Registrar ponto</h3><p>Olá, <b>${user.nome || user.usuario}</b>! Confirme o horário em que chegou.</p><label>Horário atual do computador</label><input id="pontoHora" type="time"><p style="font-size:12px;color:#718096">O sistema também guarda o horário em que o registro foi enviado.</p><div class="ponto-buttons"><button class="ponto-cancel" id="pontoCancelar">Agora não</button><button class="ponto-confirm" id="pontoConfirmar">Registrar entrada</button></div></div>`;
  document.body.appendChild(overlay);

  function horaAtual(){ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
  async function status(){ try{ const r=await fetch('/ponto?usuario='+encodeURIComponent(user.usuario)); return await r.json(); }catch(e){return null;} }
  async function abrirPonto(){ const reg=await status(); if(reg && reg.saida) return alert('O ponto de hoje já foi encerrado.'); document.getElementById('pontoHora').value=reg?.horaEntrada || horaAtual(); overlay.style.display='flex'; }
  document.getElementById('btnPontoManual').onclick=abrirPonto;
  document.getElementById('pontoCancelar').onclick=()=>overlay.style.display='none';
  document.getElementById('pontoConfirmar').onclick=async()=>{ const hora=document.getElementById('pontoHora').value||horaAtual(); const r=await fetch('/ponto/entrada',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario:user.usuario,nome:user.nome,horaInformada:hora})}); if(!r.ok){alert('Não foi possível registrar o ponto.');return;} overlay.style.display='none'; alert('Entrada registrada às '+hora+'.'); };

  async function conferirEntrada(){ const reg=await status(); if(!reg || !reg.horaEntrada){ setTimeout(abrirPonto,350); } }
  conferirEntrada();

  window.addEventListener('beforeunload', e => {
    fetch('/ponto?usuario='+encodeURIComponent(user.usuario)).then(r=>r.json()).then(reg=>{ if(reg && !reg.saida) navigator.sendBeacon('/ponto/saida', new Blob([JSON.stringify({usuario:user.usuario})],{type:'application/json'})); }).catch(()=>{});
  });

  window.registrarSaida = async function(){ const r=await fetch('/ponto/saida',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario:user.usuario})}); if(r.ok) alert('Saída registrada.'); };
  window.sentinelaUser=user;
})();
