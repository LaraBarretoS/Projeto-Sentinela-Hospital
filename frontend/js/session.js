(() => {
  "use strict";
  const user = JSON.parse(localStorage.getItem("sentinelaUser") || "null");
  if (!user) { window.location.href = "/index.html"; return; }

  const paginaPorTipo = {
    admin: "/admin.html",
    medico: "/medico.html",
    triagem: "/triagem.html",
    atendimento: "/atendimento.html",
    farmacia: "/farmacia.html"
  };
  const roleNames = {
    admin: "Administrador",
    medico: "Médico",
    triagem: "Triagem",
    atendimento: "Atendimento",
    farmacia: "Almoxarifado"
  };

  const paginaAtual = window.location.pathname.toLowerCase();
  const paginaPermitida = paginaPorTipo[user.tipo];
  if (!paginaPermitida || paginaAtual !== paginaPermitida) {
    window.location.replace(paginaPermitida || "/index.html");
    return;
  }

  document.body.classList.add("sentinela-app");

  const style = document.createElement("style");
  style.textContent = `
  .sentinela-topbar{position:absolute;top:12px;left:16px;right:16px;z-index:1000;display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0;padding:0;flex-wrap:wrap;width:auto;box-sizing:border-box}
  .sentinela-left,.sentinela-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0}.sentinela-actions{margin-left:auto;justify-content:flex-end}
  .sentinela-user-chip{display:inline-flex;align-items:center;gap:10px;padding:11px 14px;border-radius:16px;background:color-mix(in srgb,var(--surface) 88%, transparent);border:1px solid var(--border);box-shadow:var(--shadow-soft)}
  .sentinela-avatar{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 65%, #ffffff));color:#fff;display:grid;place-items:center;font-weight:800}
  .sentinela-user-meta{display:grid;line-height:1.1}.sentinela-user-meta strong{font-size:13px;color:var(--heading)}.sentinela-user-meta span{font-size:12px;color:var(--muted)}
  .sentinela-btn{min-height:44px}
  .sentinela-linklike{appearance:none;-webkit-appearance:none}
  @media(max-width:740px){.sentinela-topbar{position:absolute;top:10px;left:10px;right:10px;align-items:flex-start}.sentinela-left,.sentinela-actions{width:100%;max-width:100%}.sentinela-actions{justify-content:flex-start}}
  `;
  document.head.appendChild(style);

  if (user.usuario === "farmacia" && user.nome === "Farmácia") user.nome = "Almoxarifado";
  const prettyRole = roleNames[user.tipo] || user.tipo;

  const bar = document.createElement("div");
  bar.className = "sentinela-topbar";
  bar.innerHTML = `
    <div class="sentinela-left">
      <div class="sentinela-user-chip" aria-label="Usuário autenticado">
        <div class="sentinela-avatar">${(user.nome || user.usuario || "S").trim().slice(0,1).toUpperCase()}</div>
        <div class="sentinela-user-meta">
          <strong>${escapeHTML(user.nome || user.usuario)}</strong>
          <span>${escapeHTML(prettyRole)} · @${escapeHTML(user.usuario)}</span>
        </div>
      </div>
    </div>
    <div class="sentinela-actions">
      <button class="sentinela-btn ghost" id="btnConfigSentinela" type="button">⚙️ Configurações</button>
      <button class="sentinela-btn primary" id="btnPontoManual" type="button">🕐 Ponto</button>
    </div>`;
  document.body.prepend(bar);

  const settingsOverlay = document.createElement("div");
  settingsOverlay.className = "sentinela-overlay";
  settingsOverlay.id = "sentinelaSettingsOverlay";
  settingsOverlay.innerHTML = `
    <div class="sentinela-dialog" role="dialog" aria-modal="true" aria-labelledby="sentinelaSettingsTitle">
      <button type="button" class="sentinela-dialog-close" id="settingsCloseBtn" aria-label="Fechar configurações">✕</button>
      <div class="sentinela-dialog-grid">
        <aside class="sentinela-dialog-aside">
          <span class="mini">SENTINELA / CONFIGURAÇÕES</span>
          <h2 id="sentinelaSettingsTitle">Central do usuário</h2>
          <p>Preferências visuais e ações rápidas do seu acesso.</p>
          <div class="sentinela-user-card">
            <span class="mini">LOGIN ATUAL</span>
            <strong>${escapeHTML(user.nome || user.usuario)}</strong>
            <ul>
              <li><b>Nome:</b> ${escapeHTML(user.nome || user.usuario)}</li>
              <li><b>Login:</b> ${escapeHTML(user.usuario)}</li>
              <li><b>Acesso:</b> ${escapeHTML(prettyRole)}</li>
            </ul>
          </div>
        </aside>
        <section class="sentinela-dialog-main">
          <div class="sentinela-settings-section">
            <h3>Preferências visuais</h3>
            <div class="sentinela-toggle-row">
              <div class="sentinela-toggle-copy">
                <strong>Efeitos visuais</strong>
                <span>Desative se quiser uma experiência mais estática e confortável.</span>
              </div>
              <label class="sentinela-switch" aria-label="Ativar ou desativar efeitos visuais">
                <input id="visualEffectsToggle" type="checkbox">
                <span></span>
              </label>
            </div>
          </div>
          <div class="sentinela-settings-section">
            <h3>Ações rápidas</h3>
            <div class="sentinela-settings-actions">
              <button class="primary" id="btnSettingsTv" type="button">📺 Abrir TV</button>
              <button id="btnSettingsPassword" type="button">🔐 Trocar senha</button>
              <button id="btnSettingsSwitchUser" type="button">⇄ Trocar usuário</button>
              <button id="btnSettingsClose" class="ghost" type="button">Fechar</button>
            </div>
          </div>
        </section>
      </div>
    </div>`;
  document.body.appendChild(settingsOverlay);

  const overlay = document.createElement("div");
  overlay.className = "ponto-overlay"; overlay.id = "pontoOverlay";
  overlay.innerHTML = `<div class="ponto-modal"><h3>🕐 Registrar ponto</h3><p>Olá, <b>${escapeHTML(user.nome || user.usuario)}</b>! Confirme o horário em que chegou.</p><label>Horário atual do computador</label><input id="pontoHora" type="time"><p style="font-size:12px;color:var(--muted)">O sistema também guarda o horário em que o registro foi enviado.</p><div class="ponto-buttons"><button class="sentinela-btn ghost" id="pontoCancelar">Agora não</button><button class="sentinela-btn primary" id="pontoConfirmar">Registrar entrada</button></div></div>`;
  document.body.appendChild(overlay);

  const passwordOverlay = document.createElement("div");
  passwordOverlay.className = "sentinela-password-backdrop";
  passwordOverlay.innerHTML = `<div class="sentinela-password-modal" role="dialog" aria-modal="true" aria-labelledby="sentinelaPasswordTitle"><h2 id="sentinelaPasswordTitle">🔐 Minha senha</h2><p>Para alterar a senha, informe a senha atual. Se esqueceu, envie uma solicitação para o administrador aprovar.</p><form id="sentinelaPasswordForm"><label>Senha antiga<input id="sentinelaOldPassword" type="password" autocomplete="current-password" required></label><label>Nova senha<input id="sentinelaNewPassword" type="password" minlength="3" autocomplete="new-password" required></label><label>Confirmar nova senha<input id="sentinelaConfirmPassword" type="password" minlength="3" autocomplete="new-password" required></label><div id="sentinelaPasswordMessage" class="sentinela-password-msg" role="status"></div><div class="sentinela-password-actions"><button class="sentinela-btn primary" type="submit">Salvar senha</button><button class="sentinela-btn ghost" id="sentinelaForgotPassword" type="button">Esqueci a senha</button><button class="sentinela-btn ghost" id="sentinelaClosePassword" type="button">Fechar</button></div></form></div>`;
  document.body.appendChild(passwordOverlay);

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  }
  function horaAtual(){ const d = new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
  function apiEffectsState(){
    try {
      if (window.sentinelaThemeAPI && typeof window.sentinelaThemeAPI.getEffectsEnabled === "function") return !!window.sentinelaThemeAPI.getEffectsEnabled();
      return localStorage.getItem("sentinela-effects") !== "off";
    } catch (_) { return true; }
  }
  function setEffects(enabled){
    if (window.sentinelaThemeAPI && typeof window.sentinelaThemeAPI.setEffects === "function") {
      window.sentinelaThemeAPI.setEffects(enabled);
    } else {
      try { localStorage.setItem("sentinela-effects", enabled ? "on" : "off"); } catch (_) {}
      document.body.classList.toggle("effects-enabled", enabled);
      document.body.classList.toggle("effects-disabled", !enabled);
    }
  }
  function openSettings(){
    document.getElementById("visualEffectsToggle").checked = apiEffectsState();
    settingsOverlay.style.display = "flex";
  }
  function closeSettings(){ settingsOverlay.style.display = "none"; }
  function openPasswordModal(){
    closeSettings();
    document.getElementById("sentinelaPasswordForm").reset();
    document.getElementById("sentinelaPasswordMessage").textContent = "";
    passwordOverlay.style.display = "flex";
  }

  document.getElementById("btnConfigSentinela").addEventListener("click", openSettings);
  document.getElementById("settingsCloseBtn").addEventListener("click", closeSettings);
  document.getElementById("btnSettingsClose").addEventListener("click", closeSettings);
  settingsOverlay.addEventListener("click", event => { if (event.target === settingsOverlay) closeSettings(); });
  document.getElementById("visualEffectsToggle").addEventListener("change", event => setEffects(event.target.checked));
  document.getElementById("btnSettingsTv").addEventListener("click", () => window.open("/tv.html", "_blank", "noopener"));
  document.getElementById("btnSettingsSwitchUser").addEventListener("click", () => { fetch("/logout",{method:"POST",headers:{Authorization:"Bearer "+(user.token||"")},keepalive:true}).catch(()=>{}); localStorage.removeItem("sentinelaUser"); window.location.href = "/index.html"; });
  document.getElementById("btnSettingsPassword").addEventListener("click", openPasswordModal);

  document.getElementById("sentinelaClosePassword").addEventListener("click", () => { passwordOverlay.style.display = "none"; });
  passwordOverlay.addEventListener("click", e => { if (e.target === passwordOverlay) passwordOverlay.style.display = "none"; });
  document.getElementById("sentinelaPasswordForm").addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("sentinelaPasswordMessage");
    const oldPassword = document.getElementById("sentinelaOldPassword").value;
    const newPassword = document.getElementById("sentinelaNewPassword").value;
    if (newPassword !== document.getElementById("sentinelaConfirmPassword").value) { msg.textContent = "A confirmação da nova senha não corresponde."; msg.style.color = "var(--danger)"; return; }
    try {
      const response = await fetch("/senha/alterar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: user.usuario, senhaAntiga: oldPassword, novaSenha: newPassword }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.erro || "Não foi possível alterar a senha.");
      msg.textContent = "Senha alterada com sucesso."; msg.style.color = "var(--success)"; document.getElementById("sentinelaPasswordForm").reset();
    } catch (error) { msg.textContent = error.message; msg.style.color = "var(--danger)"; }
  });
  document.getElementById("sentinelaForgotPassword").addEventListener("click", async () => {
    const msg = document.getElementById("sentinelaPasswordMessage");
    try {
      const response = await fetch("/senha/solicitar-redefinicao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario: user.usuario }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.erro || "Não foi possível enviar a solicitação.");
      msg.textContent = data.mensagem || "Solicitação enviada ao administrador."; msg.style.color = "var(--success)";
    } catch (error) { msg.textContent = error.message; msg.style.color = "var(--danger)"; }
  });

  async function status(){ try { const r = await fetch('/ponto?usuario=' + encodeURIComponent(user.usuario)); return await r.json(); } catch(e) { return null; } }
  async function abrirPonto(){ const reg = await status(); if (reg && reg.saida) return alert('O ponto de hoje já foi encerrado.'); document.getElementById('pontoHora').value = reg?.horaEntrada || horaAtual(); overlay.style.display = 'flex'; }
  document.getElementById('btnPontoManual').onclick = abrirPonto;
  document.getElementById('pontoCancelar').onclick = () => overlay.style.display = 'none';
  document.getElementById('pontoConfirmar').onclick = async () => {
    const hora = document.getElementById('pontoHora').value || horaAtual();
    const r = await fetch('/ponto/entrada', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({usuario:user.usuario,nome:user.nome,horaInformada:hora}) });
    if (!r.ok) { alert('Não foi possível registrar o ponto.'); return; }
    overlay.style.display = 'none';
    alert('Entrada registrada às ' + hora + '.');
  };

  async function conferirEntrada(){ const reg = await status(); if (!reg || !reg.horaEntrada) setTimeout(abrirPonto, 350); }
  conferirEntrada();

  window.addEventListener('beforeunload', () => {
    fetch('/ponto?usuario=' + encodeURIComponent(user.usuario))
      .then(r => r.json())
      .then(reg => {
        if (reg && !reg.saida) navigator.sendBeacon('/ponto/saida', new Blob([JSON.stringify({usuario:user.usuario})], {type:'application/json'}));
      })
      .catch(() => {});
  });

  window.registrarSaida = async function(){ const r = await fetch('/ponto/saida', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({usuario:user.usuario})}); if(r.ok) alert('Saída registrada.'); };
  window.sentinelaUser = user;
})();
