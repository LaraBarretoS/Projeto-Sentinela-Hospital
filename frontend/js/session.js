(() => {
  const user = JSON.parse(localStorage.getItem("sentinelaUser") || "null");
  if (!user) { window.location.href = "/index.html"; return; }

  const paginaPorTipo = {
    admin: "/admin.html",
    medico: "/medico.html",
    triagem: "/triagem.html",
    atendimento: "/atendimento.html",
    farmacia: "/farmacia.html"
  };
  const paginaAtual = window.location.pathname.toLowerCase();
  const paginaPermitida = paginaPorTipo[user.tipo];
  if (!paginaPermitida || paginaAtual !== paginaPermitida) {
    window.location.replace(paginaPermitida || "/index.html");
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
  .sentinela-topbar{position:fixed;top:12px;right:16px;z-index:9998;display:flex;justify-content:flex-end;align-items:center;gap:10px;margin:0;flex-wrap:wrap;max-width:calc(100vw - 90px)}
  body{padding-top:62px!important}
  .theme-toggle{left:16px!important;right:auto!important;top:12px!important}
  @media(max-width:600px){.sentinela-topbar{left:68px;right:8px;top:8px;gap:5px;max-width:none}.sentinela-btn{padding:7px 8px;font-size:12px}.sentinela-user{display:none}body{padding-top:58px!important}.theme-toggle{left:10px!important;top:8px!important;width:40px!important;height:40px!important}}
  .sentinela-user{font-size:13px;color:#4a5568}.sentinela-actions{display:flex;gap:7px;flex-wrap:wrap}
  .sentinela-btn{border:0;border-radius:7px;padding:8px 11px;cursor:pointer;background:#edf2f7;color:#2d3748;font-weight:600}
  .sentinela-btn.primary{background:#2b6cb0;color:white}.sentinela-btn.danger{background:#c53030;color:white}
  body.dark-mode .sentinela-user{color:#cbd5e1}body.dark-mode .sentinela-btn{background:#374151;color:#f3f4f6;border:1px solid #4b5563}
  .sentinela-password-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.65);display:none;align-items:center;justify-content:center;z-index:10001;padding:18px}
  .sentinela-password-modal{background:var(--surface,#fff);color:var(--text,#1a202c);width:min(430px,100%);padding:22px;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
  .sentinela-password-modal input{box-sizing:border-box;width:100%;padding:11px;margin:6px 0 12px;border:1px solid var(--border,#cbd5e1);border-radius:7px;background:var(--surface-2,#fff);color:var(--text,#1a202c)}
  .sentinela-password-modal label{display:block;font-size:13px;font-weight:700}.sentinela-password-modal .sentinela-password-msg{font-size:13px;min-height:18px;margin:8px 0}.sentinela-password-modal .sentinela-password-actions{display:flex;gap:8px;flex-wrap:wrap}
  .ponto-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);display:none;align-items:center;justify-content:center;z-index:9999;padding:20px}
  .ponto-modal{background:white;color:#1a202c;width:min(430px,100%);border-radius:14px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
  .ponto-modal h3{margin-top:0}.ponto-modal input{width:100%;box-sizing:border-box;padding:11px;border:1px solid #cbd5e1;border-radius:7px;margin:8px 0 14px;font-size:16px}
  .ponto-buttons{display:flex;gap:8px}.ponto-buttons button{flex:1;padding:11px;border:0;border-radius:7px;cursor:pointer;font-weight:700}.ponto-confirm{background:#2b6cb0;color:#fff}.ponto-cancel{background:#edf2f7}
  `;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.className = "sentinela-topbar";
  bar.innerHTML = `<div class="sentinela-user">👤 <b>${user.nome || user.usuario}</b> · ${user.tipo}</div><div class="sentinela-actions"><button class="sentinela-btn" id="btnMinhaSenha" type="button">🔐 Minha senha</button><button class="sentinela-btn" onclick="location.href='/index.html'">← Trocar usuário</button><button class="sentinela-btn primary" id="btnPontoManual">🕐 Ponto</button></div>`;
  const first = document.body.firstElementChild;
  if (first) first.before(bar); else document.body.prepend(bar);

  const overlay = document.createElement("div"); overlay.className="ponto-overlay"; overlay.id="pontoOverlay";
  overlay.innerHTML=`<div class="ponto-modal"><h3>🕐 Registrar ponto</h3><p>Olá, <b>${user.nome || user.usuario}</b>! Confirme o horário em que chegou.</p><label>Horário atual do computador</label><input id="pontoHora" type="time"><p style="font-size:12px;color:#718096">O sistema também guarda o horário em que o registro foi enviado.</p><div class="ponto-buttons"><button class="ponto-cancel" id="pontoCancelar">Agora não</button><button class="ponto-confirm" id="pontoConfirmar">Registrar entrada</button></div></div>`;
  document.body.appendChild(overlay);

  const passwordOverlay = document.createElement("div");
  passwordOverlay.className = "sentinela-password-backdrop";
  passwordOverlay.innerHTML = `<div class="sentinela-password-modal" role="dialog" aria-modal="true" aria-labelledby="sentinelaPasswordTitle"><h2 id="sentinelaPasswordTitle">🔐 Minha senha</h2><p>Para alterar a senha, informe a senha atual. Se esqueceu, envie uma solicitação para o administrador aprovar.</p><form id="sentinelaPasswordForm"><label>Senha antiga<input id="sentinelaOldPassword" type="password" autocomplete="current-password" required></label><label>Nova senha<input id="sentinelaNewPassword" type="password" minlength="3" autocomplete="new-password" required></label><label>Confirmar nova senha<input id="sentinelaConfirmPassword" type="password" minlength="3" autocomplete="new-password" required></label><div id="sentinelaPasswordMessage" class="sentinela-password-msg" role="status"></div><div class="sentinela-password-actions"><button class="sentinela-btn primary" type="submit">Salvar senha</button><button class="sentinela-btn" id="sentinelaForgotPassword" type="button">Esqueci a senha</button><button class="sentinela-btn" id="sentinelaClosePassword" type="button">Fechar</button></div></form></div>`;
  document.body.appendChild(passwordOverlay);
  document.getElementById("btnMinhaSenha").addEventListener("click", () => { document.getElementById("sentinelaPasswordForm").reset(); document.getElementById("sentinelaPasswordMessage").textContent = ""; passwordOverlay.style.display = "flex"; });
  document.getElementById("sentinelaClosePassword").addEventListener("click", () => { passwordOverlay.style.display = "none"; });
  passwordOverlay.addEventListener("click", e => { if (e.target === passwordOverlay) passwordOverlay.style.display = "none"; });
  document.getElementById("sentinelaPasswordForm").addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("sentinelaPasswordMessage");
    const oldPassword = document.getElementById("sentinelaOldPassword").value;
    const newPassword = document.getElementById("sentinelaNewPassword").value;
    if (newPassword !== document.getElementById("sentinelaConfirmPassword").value) { msg.textContent = "A confirmação da nova senha não corresponde."; msg.style.color = "#c53030"; return; }
    try {
      const response = await fetch("/senha/alterar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: user.usuario, senhaAntiga: oldPassword, novaSenha: newPassword }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.erro || "Não foi possível alterar a senha.");
      msg.textContent = "Senha alterada com sucesso."; msg.style.color = "#2f855a"; document.getElementById("sentinelaPasswordForm").reset();
    } catch (error) { msg.textContent = error.message; msg.style.color = "#c53030"; }
  });
  document.getElementById("sentinelaForgotPassword").addEventListener("click", async () => {
    const msg = document.getElementById("sentinelaPasswordMessage");
    try {
      const response = await fetch("/senha/solicitar-redefinicao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: user.usuario }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.erro || "Não foi possível enviar a solicitação.");
      msg.textContent = data.mensagem || "Solicitação enviada ao administrador."; msg.style.color = "#2f855a";
    } catch (error) { msg.textContent = error.message; msg.style.color = "#c53030"; }
  });

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
